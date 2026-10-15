/**
 * Safe LocalStorage Utility with automatic QuotaExceededError recovery and graceful fallback.
 */

const VOLATILE_KEYS_FOR_PRUNING = [
  'ddworld_system_doctor_v1',
  'ddworld_web_ai_chat_v1',
  'ddworld_offline_gps_queue_v1',
  'ddworld_location_logs',
  'ddworld_sms_logs_v1',
  'ddworld_dialog_performance_v1',
  'ddworld_id_audit_logs_v1',
];

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Failed to read key "${key}":`, e);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (error: any) {
      // Check for quota exceeded error across browsers
      const isQuotaExceeded =
        (error instanceof DOMException &&
          (error.code === 22 ||
            error.code === 1014 ||
            error.name === 'QuotaExceededError' ||
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) ||
        (error?.name && error.name.includes('Quota')) ||
        (error?.message && error.message.toLowerCase().includes('quota'));

      if (isQuotaExceeded) {
        console.warn(`[SafeStorage] QuotaExceededError when setting key "${key}". Performing cleanup...`);
        try {
          // Attempt cleanup of volatile/log data
          for (const pruneKey of VOLATILE_KEYS_FOR_PRUNING) {
            if (pruneKey !== key) {
              window.localStorage.removeItem(pruneKey);
            }
          }
          // Retry write once after cleanup
          window.localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          // If still failing and it's a JSON array, attempt to keep latest 50 items
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length > 50) {
              const sliced = parsed.slice(0, 50);
              window.localStorage.setItem(key, JSON.stringify(sliced));
              console.warn(`[SafeStorage] Trimmed array for key "${key}" to 50 items to fit within quota.`);
              return true;
            }
          } catch {
            // value is not JSON array
          }

          console.warn(`[SafeStorage] Storage quota still exceeded for "${key}" after cleanup. Keeping in-memory.`);
          return false;
        }
      } else {
        console.warn(`[SafeStorage] Failed to set item "${key}":`, error);
        return false;
      }
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Failed to remove key "${key}":`, e);
    }
  },
};
