import { AnalysisResult } from '../types';

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
 * Safely sets an item in LocalStorage with automatic quota recovery.
 * If QuotaExceededError occurs, it progressively prunes older history items to preserve
 * current application state and user data.
 */
function safeSetItem(key: string, value: string): boolean {
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
      console.warn(`LocalStorage quota exceeded while saving "${key}". Evicting older history to recover space...`);
      try {
        const rawHistory = window.localStorage.getItem(STORAGE_KEY_HISTORY);
        if (rawHistory) {
          const parsed = JSON.parse(rawHistory);
          if (Array.isArray(parsed) && parsed.length > 3) {
            // Trim to newest 3 items
            const trimmed = parsed.slice(0, 3);
            window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
            // Try saving the target item again
            window.localStorage.setItem(key, value);
            return true;
          } else if (key !== STORAGE_KEY_HISTORY) {
            // Clear history completely to prioritize the current active analysis
            window.localStorage.removeItem(STORAGE_KEY_HISTORY);
            window.localStorage.setItem(key, value);
            return true;
          }
        }
      } catch (recoveryError) {
        console.error('Failed recovery from QuotaExceededError:', recoveryError);
      }
    }
    console.warn(`Unable to write to LocalStorage key "${key}":`, error);
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
 * Adds an analysis to the persistent history list in LocalStorage
 */
export function saveToHistory(
  analysis: AnalysisResult,
  isUsingAi: boolean | null = null
): SavedHistoryItem[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const currentHistory = loadHistory();

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

    // Filter out duplicate identical ID or identical options if exists, and prepend newest
    const filtered = currentHistory.filter(item => item.id !== historyEntry.id);
    const updated = [historyEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    safeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to save analysis to history in LocalStorage:', error);
    return [];
  }
}

/**
 * Loads the list of historical analyses
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
 * Removes a single item from the history
 */
export function deleteFromHistory(id: string): SavedHistoryItem[] {
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
 * Clears all saved analyses history
 */
export function clearAllHistory(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (error) {
    console.warn('Failed to clear history:', error);
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
