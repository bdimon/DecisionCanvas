import { SavedHistoryItem } from './storage';

const DB_NAME = 'decision_lens_idb';
const DB_VERSION = 1;
const STORE_HISTORY = 'history';
const STORE_KEYVAL = 'key_val';

/**
 * Checks if IndexedDB is available in the current environment
 */
export function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

/**
 * Opens and initializes the IndexedDB database instance
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      return reject(new Error('IndexedDB is not supported or accessible.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        const historyStore = db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        historyStore.createIndex('savedAt', 'savedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_KEYVAL)) {
        db.createObjectStore(STORE_KEYVAL, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves a single history item to IndexedDB (virtually unlimited capacity)
 */
export async function idbSaveHistoryItem(item: SavedHistoryItem): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORE_HISTORY);
      const req = store.put(item);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to save history item to IndexedDB:', error);
  }
}

/**
 * Bulk saves history items to IndexedDB
 */
export async function idbSaveAllHistory(items: SavedHistoryItem[]): Promise<void> {
  if (!isIndexedDBAvailable() || items.length === 0) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORE_HISTORY);

      for (const item of items) {
        store.put(item);
      }

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to bulk save history to IndexedDB:', error);
  }
}

/**
 * Loads all saved history items from IndexedDB sorted by newest first
 */
export async function idbLoadHistory(): Promise<SavedHistoryItem[]> {
  if (!isIndexedDBAvailable()) return [];
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, 'readonly');
      const store = tx.objectStore(STORE_HISTORY);
      const req = store.getAll();

      req.onsuccess = () => {
        const items: SavedHistoryItem[] = req.result || [];
        // Sort descending by savedAt
        items.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        resolve(items);
      };

      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to load history from IndexedDB:', error);
    return [];
  }
}

/**
 * Removes a single history item from IndexedDB
 */
export async function idbDeleteHistoryItem(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORE_HISTORY);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to delete history item from IndexedDB:', error);
  }
}

/**
 * Clears all history in IndexedDB
 */
export async function idbClearHistory(): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORE_HISTORY);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to clear history from IndexedDB:', error);
  }
}

/**
 * Key-Value fallback in IndexedDB when localStorage fails or exceeds quota
 */
export async function idbSet<T = any>(key: string, value: T): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_KEYVAL, 'readwrite');
      const store = tx.objectStore(STORE_KEYVAL);
      const req = store.put({ key, value, updatedAt: new Date().toISOString() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn(`Failed to set IndexedDB key "${key}":`, error);
  }
}

/**
 * Retrieves a key-value entry from IndexedDB fallback
 */
export async function idbGet<T = any>(key: string): Promise<T | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_KEYVAL, 'readonly');
      const store = tx.objectStore(STORE_KEYVAL);
      const req = store.get(key);

      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn(`Failed to get IndexedDB key "${key}":`, error);
    return null;
  }
}

/**
 * Removes a key-value entry from IndexedDB
 */
export async function idbDelete(key: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_KEYVAL, 'readwrite');
      const store = tx.objectStore(STORE_KEYVAL);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn(`Failed to delete IndexedDB key "${key}":`, error);
  }
}
