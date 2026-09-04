import { AnalysisResult } from '../types';
import {
  idbSaveHistoryItem,
  idbSaveAllHistory,
  idbLoadHistory,
  idbDeleteHistoryItem,
  idbClearHistory,
  idbSet,
  idbGet,
  idbDelete
} from './indexedDb';

export interface SavedHistoryItem {
  id: string;
  savedAt: string;
  option1Title: string;
  option2Title: string;
  winner: 'option1' | 'option2' | 'tie';
  winnerTitle: string;
  confidenceScore: number;
  isUsingAi: boolean | null;
  data: AnalysisResult;
}

const STORAGE_KEY_CURRENT = 'decision_lens_current_analysis';
const STORAGE_KEY_HISTORY = 'decision_lens_history';
const STORAGE_KEY_FORM_DRAFT = 'decision_lens_form_draft';
const STORAGE_KEY_ACTIVE_TAB = 'decision_lens_active_tab';

const MAX_HISTORY_ITEMS = 15;

/**
 * Safely checks if LocalStorage is available and accessible
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test_ls__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely sets an item in LocalStorage with automatic IndexedDB fallback and quota recovery.
 * If QuotaExceededError occurs or LocalStorage is disabled, it writes directly to IndexedDB.
 */
function safeSetItem(key: string, value: string): boolean {
  // Always mirror asynchronously to IndexedDB for unlimited durable storage
  idbSet(key, value).catch(() => {});

  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    const isQuotaError =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22 ||
        error.code === 1014);

    if (isQuotaError) {
      console.warn(`LocalStorage quota exceeded while saving "${key}". Using IndexedDB fallback...`);
      // Ensure the value is securely saved in IndexedDB
      idbSet(key, value).catch(() => {});

      try {
        const rawHistory = window.localStorage.getItem(STORAGE_KEY_HISTORY);
        if (rawHistory) {
          const parsed = JSON.parse(rawHistory);
          if (Array.isArray(parsed) && parsed.length > 3) {
            // Trim to newest 3 items in localStorage (full history is preserved in IndexedDB)
            const trimmed = parsed.slice(0, 3);
            window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
            window.localStorage.setItem(key, value);
            return true;
          } else if (key !== STORAGE_KEY_HISTORY) {
            window.localStorage.removeItem(STORAGE_KEY_HISTORY);
            window.localStorage.setItem(key, value);
            return true;
          }
        }
      } catch (recoveryError) {
        console.error('LocalStorage recovery error (IndexedDB holds primary backup):', recoveryError);
      }
    }
    return false;
  }
}

/**
 * Persists the current working analysis state to LocalStorage
 */
export function saveCurrentAnalysis(
  analysis: AnalysisResult | null,
  isUsingAi: boolean | null = null
): void {
  if (!isLocalStorageAvailable()) return;

  try {
    if (!analysis) {
      window.localStorage.removeItem(STORAGE_KEY_CURRENT);
      return;
    }

    const payload = {
      analysis,
      isUsingAi,
      lastSavedAt: new Date().toISOString()
    };

    safeSetItem(STORAGE_KEY_CURRENT, JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to persist current analysis to LocalStorage:', error);
  }
}

/**
 * Loads the active analysis from LocalStorage
 */
export function loadCurrentAnalysis(): {
  analysis: AnalysisResult;
  isUsingAi: boolean | null;
  lastSavedAt: string;
} | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_CURRENT);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && parsed.analysis && parsed.analysis.option1Title && parsed.analysis.option2Title) {
      return {
        analysis: parsed.analysis,
        isUsingAi: parsed.isUsingAi ?? null,
        lastSavedAt: parsed.lastSavedAt || new Date().toISOString()
      };
    }
    return null;
  } catch (error) {
    console.warn('Failed to parse current analysis from LocalStorage:', error);
    return null;
  }
}

/**
 * Clears the active analysis from LocalStorage
 */
export function clearCurrentAnalysis(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_CURRENT);
  } catch (error) {
    console.warn('Failed to clear current analysis:', error);
  }
}

/**
 * Adds an analysis to the persistent history list.
 * Saves to LocalStorage and mirrors to IndexedDB for unlimited long-term storage.
 */
export function saveToHistory(
  analysis: AnalysisResult,
  isUsingAi: boolean | null = null
): SavedHistoryItem[] {
  const historyEntry: SavedHistoryItem = {
    id: analysis.id || `analysis_${Date.now()}`,
    savedAt: new Date().toISOString(),
    option1Title: analysis.option1Title,
    option2Title: analysis.option2Title,
    winner: analysis.verdict.winner,
    winnerTitle: analysis.verdict.winnerTitle,
    confidenceScore: analysis.verdict.confidenceScore,
    isUsingAi,
    data: analysis
  };

  // Always persist item to IndexedDB (unlimited capacity)
  idbSaveHistoryItem(historyEntry).catch(() => {});

  if (!isLocalStorageAvailable()) return [historyEntry];

  try {
    const currentHistory = loadHistory();

    // Filter out duplicate identical ID, and prepend newest
    const filtered = currentHistory.filter(item => item.id !== historyEntry.id);
    const updated = [historyEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    safeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to save analysis to history in LocalStorage:', error);
    return [historyEntry];
  }
}

/**
 * Loads the list of historical analyses from LocalStorage
 */
export function loadHistory(): SavedHistoryItem[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];

    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      return list.filter(item => item && item.id && item.option1Title && item.option2Title);
    }
    return [];
  } catch (error) {
    console.warn('Failed to load history from LocalStorage:', error);
    return [];
  }
}

/**
 * Removes a single item from the history in both LocalStorage and IndexedDB
 */
export function deleteFromHistory(id: string): SavedHistoryItem[] {
  // Remove from IndexedDB
  idbDeleteHistoryItem(id).catch(() => {});

  if (!isLocalStorageAvailable()) return [];

  try {
    const current = loadHistory();
    const updated = current.filter(item => item.id !== id);
    safeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to delete history item:', error);
    return [];
  }
}

/**
 * Clears all saved analyses history from both LocalStorage and IndexedDB
 */
export function clearAllHistory(): void {
  // Clear IndexedDB
  idbClearHistory().catch(() => {});

  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (error) {
    console.warn('Failed to clear history:', error);
  }
}

/**
 * Synchronizes history with IndexedDB fallback.
 * If LocalStorage was trimmed or cleared, this merges all history items stored in IndexedDB.
 */
export async function syncHistoryWithIndexedDB(): Promise<SavedHistoryItem[]> {
  try {
    const idbItems = await idbLoadHistory();
    const lsItems = loadHistory();

    if (idbItems.length === 0 && lsItems.length > 0) {
      // Seed IndexedDB from LocalStorage
      idbSaveAllHistory(lsItems).catch(() => {});
      return lsItems;
    }

    // Merge unique items by ID
    const map = new Map<string, SavedHistoryItem>();
    for (const item of idbItems) {
      if (item && item.id) map.set(item.id, item);
    }
    for (const item of lsItems) {
      if (item && item.id && !map.has(item.id)) map.set(item.id, item);
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    // If IndexedDB had items not in LocalStorage, keep LocalStorage updated up to its capacity
    if (merged.length > lsItems.length) {
      const topItems = merged.slice(0, MAX_HISTORY_ITEMS);
      if (isLocalStorageAvailable()) {
        try {
          window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(topItems));
        } catch {}
      }
    }

    return merged;
  } catch (error) {
    console.warn('Failed to sync history with IndexedDB:', error);
    return loadHistory();
  }
}

/**
 * Persists the form draft so user typing is not lost on reload
 */
export function saveFormDraft(draft: { option1: string; option2: string; context: string }): void {
  if (!isLocalStorageAvailable()) return;

  try {
    if (!draft.option1 && !draft.option2 && !draft.context) {
      window.localStorage.removeItem(STORAGE_KEY_FORM_DRAFT);
      return;
    }
    safeSetItem(STORAGE_KEY_FORM_DRAFT, JSON.stringify(draft));
  } catch (error) {
    console.warn('Failed to save form draft:', error);
  }
}

/**
 * Loads the saved form draft
 */
export function loadFormDraft(): { option1: string; option2: string; context: string } | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_FORM_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse form draft:', error);
    return null;
  }
}

/**
 * Clears form draft from storage
 */
export function clearFormDraft(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_FORM_DRAFT);
  } catch (error) {
    console.warn('Failed to clear form draft:', error);
  }
}

/**
 * Persists active tab
 */
export function saveActiveTab(tab: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    safeSetItem(STORAGE_KEY_ACTIVE_TAB, tab);
  } catch (error) {
    console.warn('Failed to save active tab:', error);
  }
}

/**
 * Loads saved active tab
 */
export function loadActiveTab(): string | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY_ACTIVE_TAB);
  } catch {
    return null;
  }
}
