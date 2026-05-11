import { createContext, useContext } from 'react';
import type { Action, AppState } from '../types';

export type AppContextValue = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within StorageProvider');
  return ctx;
}
