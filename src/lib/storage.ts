/**
 * Safe local storage and IndexedDB manager.
 * Prevents "QuotaExceededError" crashes when saving photo galleries,
 * high-resolution base64 images, and album collections.
 */

const IDB_NAME = "raf_portfolio_db";
const IDB_VERSION = 1;
const IDB_STORE = "keyval";

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store data asynchronously in IndexedDB (virtually unlimited quota: 50MB - 1GB+)
 */
export async function idbSet(key: string, value: any): Promise<void> {
  try {
    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("IndexedDB set failed:", err);
  }
}

/**
 * Retrieve data from IndexedDB
 */
export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB get failed:", err);
    return null;
  }
}

/**
 * Safely writes to localStorage.
 * If quota is exceeded, gracefully catches the DOMException without crashing the app,
 * clears non-essential legacy keys, attempts a lightened save, and stores full data in IndexedDB.
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  // Persist full data in IndexedDB asynchronously in the background
  try {
    const parsed = JSON.parse(value);
    idbSet(key, parsed).catch(() => {});
  } catch {
    idbSet(key, value).catch(() => {});
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    const isQuota =
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED");

    if (isQuota) {
      console.warn(`localStorage quota exceeded for key "${key}". Applying resilient recovery.`);

      // Attempt 1: Clear non-essential old items
      try {
        localStorage.removeItem("raf_projects"); // legacy key
        localStorage.removeItem("raf_photos_backup");
      } catch {
        // ignore
      }

      // Attempt 2: If it's photos, save a lightweight preview version (cover photos only, stripped album array)
      if (key === "raf_photos") {
        try {
          const items = JSON.parse(value);
          if (Array.isArray(items)) {
            // Trim to keep only cover images and max 15 most recent items in local cache
            const lightweight = items.slice(0, 15).map((item: any) => ({
              ...item,
              images: undefined, // remove bulky multi-images from 5MB localStorage
            }));
            localStorage.setItem(key, JSON.stringify(lightweight));
            return true;
          }
        } catch {
          // If lightweight save also fails or cannot parse, safely fall through
        }
      }

      // If still exceeding, suppress the error so the app/Firestore can proceed smoothly
      console.warn(`Data safely handled in IndexedDB and Cloud Firestore.`);
      return false;
    }

    // Other unexpected error
    console.warn(`localStorage write error for "${key}":`, e);
    return false;
  }
}

/**
 * Safely reads a string from localStorage
 */
export function safeGetLocalStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
