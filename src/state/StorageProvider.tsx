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

링크: [Anthropic](https://anthropic.com)`;

const SAMPLE_INJECTED_KEY = 'memo-app:sample-injected';

function makeSampleMemo(): Memo {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: '이렇게 사용해보세요',
    body: SAMPLE_BODY,
    color: PALETTE[0],
    column: 'reference',
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

function markSampleInjected(): void {
  try {
    localStorage.setItem(SAMPLE_INJECTED_KEY, 'true');
  } catch {
    // 무시
  }
}

function isSampleInjected(): boolean {
  try {
    return localStorage.getItem(SAMPLE_INJECTED_KEY) === 'true';
  } catch {
    return false;
  }
}

function withSample(state: AppState): AppState {
  const sample = makeSampleMemo();
  return {
    ...state,
    memos: { ...state.memos, [sample.id]: sample },
    columnOrder: {
      ...state.columnOrder,
      reference: [sample.id, ...state.columnOrder.reference],
    },
  };
}

function loadFromStorage(): AppState {
  const injected = isSampleInjected();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // 진짜 첫 진입: 빈 상태 위에 샘플 메모 시드
      markSampleInjected();
      return withSample(initialState);
    }
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== STATE_VERSION) return initialState;
    if (!injected) {
      // 기존 사용자(샘플 도입 전부터 데이터가 있던 경우): 1회 주입
      markSampleInjected();
      return withSample(parsed);
    }
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
