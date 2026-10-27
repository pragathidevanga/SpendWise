/**
 * Centralized, versioned localStorage manager for SpendWise.
 * Handles user-scoped storage, safety fallbacks, and schema validation.
 */

const STORAGE_VERSION = '1.0.0';

export const KEYS = {
  VERSION: 'spendwise_storage_version',
  USERS: 'spendwise_users',
  SESSION: 'spendwise_session',
  TRANSACTIONS: 'spendwise_transactions',
  BUDGETS: 'spendwise_budgets',
  GOALS: 'spendwise_goals',
  NOTIFICATIONS: 'spendwise_notifications',
  PREFERENCES: 'spendwise_preferences',
  ONBOARDING: 'spendwise_onboarding',
};

// Memory fallback if localStorage is disabled or restricted
const memoryFallback = {};

function isLocalStorageAvailable() {
  try {
    const testKey = '__sw_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasStorage = typeof window !== 'undefined' && isLocalStorageAvailable();

export const Storage = {
  getRaw(key, defaultValue = null) {
    try {
      if (hasStorage) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return memoryFallback[key] !== undefined ? memoryFallback[key] : defaultValue;
    } catch (err) {
      console.warn(`[Storage] Failed to parse key "${key}":`, err);
      return defaultValue;
    }
  },

  setRaw(key, value) {
    try {
      if (hasStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      } else {
        memoryFallback[key] = value;
      }
      return true;
    } catch (err) {
      console.error(`[Storage] Failed to save key "${key}":`, err);
      return false;
    }
  },

  removeRaw(key) {
    try {
      if (hasStorage) {
        window.localStorage.removeItem(key);
      } else {
        delete memoryFallback[key];
      }
    } catch (err) {
      console.error(`[Storage] Failed to remove key "${key}":`, err);
    }
  },

  // ---------------- User Scoped Helpers ----------------

  getUserData(key, userId, defaultValue = []) {
    if (!userId) return defaultValue;
    const allData = this.getRaw(key, {});
    return allData[userId] !== undefined ? allData[userId] : defaultValue;
  },

  setUserData(key, userId, data) {
    if (!userId) return false;
    const allData = this.getRaw(key, {});
    allData[userId] = data;
    return this.setRaw(key, allData);
  },

  clearUserData(userId) {
    if (!userId) return;
    const scopedKeys = [
      KEYS.TRANSACTIONS,
      KEYS.BUDGETS,
      KEYS.GOALS,
      KEYS.NOTIFICATIONS,
      KEYS.PREFERENCES,
      KEYS.ONBOARDING
    ];

    scopedKeys.forEach(k => {
      const allData = this.getRaw(k, {});
      if (allData[userId]) {
        delete allData[userId];
        this.setRaw(k, allData);
      }
    });
  },

  // Initialize version stamp
  init() {
    const currentVer = this.getRaw(KEYS.VERSION);
    if (!currentVer) {
      this.setRaw(KEYS.VERSION, STORAGE_VERSION);
    }
  }
};

Storage.init();
