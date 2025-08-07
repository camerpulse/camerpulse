import { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';

// Simple client-side encryption key (in production, this should come from a secure source)
const STORAGE_KEY = 'camerpulse_secure_data';
const ENCRYPTION_KEY = 'CamerPulse2024SecureKey';

interface SecureStorageOptions {
  encrypt?: boolean;
  expiry?: number; // in milliseconds
}

/**
 * Secure localStorage hook with encryption and expiry
 */
export function useSecureStorage<T>(
  key: string, 
  initialValue: T,
  options: SecureStorageOptions = {}
) {
  const { encrypt = true, expiry } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      if (!item) return initialValue;

      let parsedItem;
      if (encrypt) {
        const decrypted = CryptoJS.AES.decrypt(item, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        parsedItem = JSON.parse(decrypted);
      } else {
        parsedItem = JSON.parse(item);
      }

      // Check expiry
      if (expiry && parsedItem.timestamp) {
        const now = Date.now();
        if (now - parsedItem.timestamp > expiry) {
          localStorage.removeItem(`${STORAGE_KEY}_${key}`);
          return initialValue;
        }
        return parsedItem.value;
      }

      return parsedItem;
    } catch (error) {
      console.error(`Error reading from secure storage for key ${key}:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      const dataToStore = expiry 
        ? { value: valueToStore, timestamp: Date.now() }
        : valueToStore;

      if (encrypt) {
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(dataToStore), 
          ENCRYPTION_KEY
        ).toString();
        localStorage.setItem(`${STORAGE_KEY}_${key}`, encrypted);
      } else {
        localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(dataToStore));
      }
    } catch (error) {
      console.error(`Error writing to secure storage for key ${key}:`, error);
    }
  }, [key, storedValue, encrypt, expiry]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${key}`);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing from secure storage for key ${key}:`, error);
    }
  }, [key, initialValue]);

  // Cleanup expired items on mount
  useEffect(() => {
    if (expiry) {
      const cleanup = () => {
        try {
          const item = localStorage.getItem(`${STORAGE_KEY}_${key}`);
          if (!item) return;

          let parsedItem;
          if (encrypt) {
            const decrypted = CryptoJS.AES.decrypt(item, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
            parsedItem = JSON.parse(decrypted);
          } else {
            parsedItem = JSON.parse(item);
          }

          if (parsedItem.timestamp) {
            const now = Date.now();
            if (now - parsedItem.timestamp > expiry) {
              localStorage.removeItem(`${STORAGE_KEY}_${key}`);
              setStoredValue(initialValue);
            }
          }
        } catch (error) {
          console.error(`Error during cleanup for key ${key}:`, error);
        }
      };

      cleanup();
      const interval = setInterval(cleanup, 60000); // Cleanup every minute
      return () => clearInterval(interval);
    }
  }, [key, encrypt, expiry, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Clear all secure storage data
 */
export function clearAllSecureStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing secure storage:', error);
  }
}