import { useState, useEffect, useCallback, useRef } from 'react';

export function useChromeStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const modifiedRef = useRef(false);

  // Hydrate strictly on mount
  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      if (result[key] !== undefined && !modifiedRef.current) {
        setState(result[key] as T);
      }
      setHydrated(true);
    });
  }, [key]);

  // Synchronous React setState + Async Chrome Sync
  const setPersistedState = useCallback(
    (value: T | ((val: T) => T)) => {
      modifiedRef.current = true;
      setState((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        chrome.storage.local.set({ [key]: nextValue });
        return nextValue;
      });
    },
    [key]
  );

  return [state, setPersistedState, hydrated] as const;
}
