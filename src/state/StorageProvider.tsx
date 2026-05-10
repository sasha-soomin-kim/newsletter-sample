import { useEffect, useReducer, useRef, type ReactNode } from 'react';
import { LOCAL_STORAGE_KEY, STATE_VERSION } from '../constants';
import type { AppState } from '../types';
import { AppContext } from './useAppState';
import { appReducer, initialState } from './reducer';

function loadFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== STATE_VERSION) return initialState;
    return parsed;
  } catch {
    return initialState;
  }
}

export function StorageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined as never, loadFromStorage);
  const timer = useRef<number | undefined>();

  useEffect(() => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      } catch {
        // v1에서는 quota 에러 무시
      }
    }, 250);
    return () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
    };
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
