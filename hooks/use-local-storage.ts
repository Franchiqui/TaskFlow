import { useState, useEffect, useCallback } from 'react';

type LocalStorageValue<T> = T | null;

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  sync?: boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    sync = true,
  } = options;

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a client`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        const serializedValue = serializer(newValue);
        window.localStorage.setItem(key, serializedValue);
        setStoredValue(newValue);

        if (sync) {
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serializedValue,
              storageArea: window.localStorage,
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serializer, sync]
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried removing localStorage key "${key}" even though environment is not a client`
      );
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      if (sync) {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
            storageArea: window.localStorage,
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, sync]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    if (!sync) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.localStorage) {
        try {
          const newValue = event.newValue
            ? deserializer(event.newValue)
            : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error handling storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, deserializer, sync]);

  return [storedValue, setValue, removeValue];
}

export function useLocalStorageJson<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  return useLocalStorage(key, initialValue, {
    serializer: JSON.stringify,
    deserializer: JSON.parse,
  });
}

export function useLocalStorageString(
  key: string,
  initialValue: string
): [string, (value: string | ((prev: string) => string)) => void, () => void] {
  return useLocalStorage(key, initialValue, {
    serializer: (value) => value,
    deserializer: (value) => value,
  });
}

export function useLocalStorageNumber(
  key: string,
  initialValue: number
): [number, (value: number | ((prev: number) => number)) => void, () => void] {
  return useLocalStorage(key, initialValue, {
    serializer: (value) => value.toString(),
    deserializer: (value) => parseFloat(value),
  });
}

export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean
): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void, () => void] {
  return useLocalStorage(key, initialValue, {
    serializer: (value) => value.toString(),
    deserializer: (value) => value === 'true',
  });
}