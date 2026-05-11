import { useEffect, useReducer, useRef, type ReactNode } from 'react';
import { LOCAL_STORAGE_KEY, PALETTE, STATE_VERSION } from '../constants';
import type { AppState, Memo } from '../types';
import { AppContext } from './useAppState';
import { appReducer, initialState } from './reducer';

const SAMPLE_BODY = `이 메모 앱은 **마크다운**을 지원합니다.

## 텍스트 강조
**굵게**, *기울임*, \`인라인 코드\`

## 리스트
- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

## 번호 리스트
1. 단계 하나
2. 단계 둘

> 인용문도 표현할 수 있어요.

링크: [Anthropic](https://anthropic.com)`;

function seedInitialState(): AppState {
  const id = crypto.randomUUID();
  const now = Date.now();
  const sample: Memo = {
    id,
    title: '이렇게 사용해보세요',
    body: SAMPLE_BODY,
    color: PALETTE[0],
    column: 'reference',
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
  return {
    memos: { [id]: sample },
    columnOrder: { reference: [id], remember: [], disposable: [] },
    version: STATE_VERSION,
  };
}

function loadFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return seedInitialState();
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
