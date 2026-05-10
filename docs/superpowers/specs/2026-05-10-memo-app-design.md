# 메모 앱 디자인 문서

## 목적

브라우저에서만 동작하는 1인용 메모 보드. 메모는 사용자의 보존 의도에 따라 3개의 열로 구성된다. 각 메모는 동일한 크기의 정사각형 카드이며 파스텔톤 배경을 가진다. 백엔드와 로그인 없이 한 브라우저에서 LocalStorage에 저장한다.

## 목표

- 최소한의 UI 마찰로 메모를 빠르게 작성하고 다시 보기
- 보존 의도에 따라 메모를 분류 (항상 참고해 / 기억해 / 날려도 좋아) — 드래그 앤 드롭으로 이동
- 시각적 일관성: 정사각형 카드, 부드러운 파스텔, 충분한 여백
- 마크다운 지원으로 가벼운 구조화 가능

## 비목표

- 다중 사용자, 기기 간 동기화, 공유
- 검색 (보류 — 시안의 `⌘K`는 v1에 포함하지 않음)
- 모바일 최적화 레이아웃 (데스크톱 우선; 기본 viewport만 처리)
- 리치 텍스트 WYSIWYG; 마크다운 소스 편집만 지원
- 3개 열 외의 태그/폴더

## 기술 스택

- **React 18 + TypeScript + Vite** — SPA, SSR 없음
- **`@dnd-kit/core` + `@dnd-kit/sortable`** — 열 사이 및 열 내부 드래그 앤 드롭
- **`react-markdown` + `remark-gfm`** — 모달 보기 모드에서 마크다운 렌더링
- **LocalStorage** — 단일 키 `memo-app:state`에 직렬화된 전체 상태 저장
- **별도 상태 관리 라이브러리 없음** — `useReducer` + Context로 충분
- 폰트: **Pretendard Variable** 1순위, **SF Pro Display** fallback, 그 다음 `system-ui`

## 데이터 모델

```ts
type ColumnId = 'reference' | 'remember' | 'disposable';

type Memo = {
  id: string;                // crypto.randomUUID()
  title: string;             // 한 줄
  body: string;              // 마크다운 소스
  color: string;             // PALETTE의 hex 값
  column: ColumnId;
  pinned: boolean;
  order: number;             // float; 사이값으로 O(1) 재정렬
  createdAt: number;         // epoch ms
  updatedAt: number;         // epoch ms
};

type AppState = {
  memos: Record<string, Memo>;
  columnOrder: Record<ColumnId, string[]>; // 열 표시 순서대로의 메모 id
  version: 1;                              // 향후 마이그레이션을 위한 스키마 버전
};
```

**열 내부 정렬 규칙**: 핀 고정된 메모가 먼저 (핀 그룹 내 `order` 내림차순), 그다음 비고정 메모 (`order` 내림차순). `order`는 입력/이동 시 분수 인덱스로 할당하여 단일 필드 변경만으로 재정렬된다.

## 컬러 팔레트

"Cool Modern" 톤의 파스텔 10색:

| 이름        | Hex      |
|-------------|----------|
| Dusty Blue  | `#D8DEEC` |
| Lavender    | `#E0D6E8` |
| Sage        | `#D5E0D8` |
| Blush       | `#ECDCDC` |
| Sky         | `#D8E4EC` |
| Mauve       | `#E5D8DC` |
| Mint        | `#DCE6DC` |
| Sand        | `#E8E2D6` |
| Powder Pink | `#EAD8DC` |
| Cloud       | `#DDDFE2` |

새 메모는 팔레트에서 무작위 색상을 부여받는다. 색상은 모달에서 변경 가능하다.

## 레이아웃

- **페이지**: 배경 `#F4F4F6`, 패딩 `112px 192px`, 폰트 Pretendard Variable + SF Pro Display
- **헤더**: 좌측에 브랜드 `Memo` (24px, weight 700, letter-spacing -0.02em) + 메모 개수 부제. 우측은 v1에서 비워둠 (`⌘K` 자리 표시는 제거)
- **보드**: 3열 CSS grid, `gap: 32px`. 열 제목은 `항상 참고해`, `기억해`, `날려도 좋아` (이모지 없음). 각 헤더 우측에 작은 `+` 추가 버튼
- **카드**: `aspect-ratio: 1/1`, `border-radius: 14px`, `padding: 16px`, 부드러운 그림자 `0 2px 8px rgba(40,40,80,0.04)`. 제목 13px / weight 600. 본문 12px, opacity 0.72, 마크다운 렌더링 + 약 5줄 높이 제한 + 하단 페이드아웃
- **새 메모 (인라인)**: 점선 보더 없이 `#EAEAEC` 단색 배경, 카드와 동일한 형태. 제목과 본문 입력란은 placeholder 텍스트가 옅은 색으로 표시됨

## 컴포넌트

```
App
├── Board
│   └── Column (×3)
│       ├── ColumnHeader (제목 + "+" 버튼)
│       └── MemoCard (×N)  ← dnd-kit Sortable로 렌더링
├── NewMemoCard (인라인 에디터; 한 번에 한 열에서만)
├── MemoModal (portal)
│   ├── ViewMode (마크다운 렌더링 + 액션)
│   └── EditMode (제목 input + 본문 textarea + 액션)
└── StorageProvider (상태 로드/저장, 디바운스 쓰기)
```

각 컴포넌트는 단일 책임을 가진다. `Board`는 레이아웃과 DnD 컨텍스트를 소유한다. `Column`은 순수하게 표현만 담당하고 메모 리스트를 렌더링한다. `MemoCard`는 열에 대해 알지 못하며, 데이터와 핸들러만 받는다. `MemoModal`은 `body`로 portal 처리되며 독립적으로 스타일링된다.

## 인터랙션

### 메모 작성

1. 열 헤더의 `+` 클릭 → 해당 열 상단에 인라인 `NewMemoCard` 등장
2. 제목 입력란에 자동 포커스. Tab으로 본문 이동
3. **저장**: 카드 외부를 클릭하거나 `⌘+Enter`. 제목과 본문이 모두 비어 있으면 폐기
4. 새 메모는 `PALETTE`에서 무작위 색상이 부여되고, 해당 열 상단(고정 메모 아래, 비고정 메모 위)에 삽입됨
5. 인라인 에디터는 한 번에 하나만 존재. 다른 열의 `+` 클릭 시 기존 드래프트가 비어있지 않으면 먼저 커밋 후 새로 열림

### 메모 보기

- 카드 클릭 → `MemoModal`이 **보기 모드**로 열림
- 보기 모드는 `react-markdown`으로 본문을 마크다운 렌더링
- 푸터: 좌측 `YYYY.MM.DD · <열 이름>`, 우측 `[삭제]` `[편집]` chip
- 모달 배경은 메모의 현재 색상 (모달이 카드의 확대 버전처럼 보이도록)

### 메모 편집

- `편집` chip 클릭 → 같은 모달이 **편집 모드**로 전환 (새 다이얼로그 X)
- 제목은 한 줄 `input`, 본문은 모노스페이스 폰트의 `textarea` (마크다운 소스)
- 푸터: `[취소]` `[저장]`. 자동 저장 없음 — 명시적 저장만
- `취소`는 변경사항 되돌림, `저장`은 상태에 반영 후 보기 모드로 복귀

### 색상 변경

- 모달 푸터 위에 작은 색 점 10개가 일렬로 표시 (보기/편집 모드 모두)
- 현재 색상은 활성화된 점 주위의 어두운 링으로 표시
- 색 점 클릭 시 즉시 색상 변경이 반영되며 모달 배경도 즉시 변경. 색상은 메타데이터이므로 편집 모드의 `취소`/`저장` 흐름과 무관 — 오직 제목과 본문만 그 흐름을 따른다

### 핀 고정

- 카드 우하단에 hover 시에만 작은 원형 핀 버튼이 노출됨
- 클릭 시 `pinned` 토글. 고정된 카드는 핀 버튼이 항상 보이며 어두운 채움 스타일로 표시; 비고정 시에는 마우스가 떠나면 숨겨짐
- 고정된 메모는 같은 열 내에서 비고정 메모 위로 떠 있음. 고정 항목 간 순서는 유지됨

### 드래그 앤 드롭

- `@dnd-kit`의 `SortableContext`를 열마다 두고, 단일 `DndContext`로 열 간 이동 처리
- 드래그 중 카드는 커서를 따르는 반투명 ghost로 표시; 플레이스홀더가 예상 드롭 위치를 보여줌
- 다른 열로 드롭 시 `column`과 `order` 갱신; 같은 열 내 드롭 시 순서 변경
- 고정된 메모는 드래그해도 고정 상태를 유지. 렌더 순서는 `pinned`를 먼저, 그다음 `order`를 적용하므로 비고정 카드 아래로 드롭한 고정 카드는 자동으로 위로 스냅됨. 이는 v1에서 수용하는 작은 UX 결함

### 메모 삭제

- 모달의 `[삭제]` chip. v1에서는 확인 없이 즉시 삭제 (로컬 전용 + "날려도 좋아" 열이 안전망 역할을 함)
- `memos`에서 제거하고 해당 `columnOrder` 리스트에서도 제거

### 잘림 및 오버플로우

- 제목은 줄바꿈하지 않음 (한 줄, 한 줄 말줄임)
- 카드 본문도 `react-markdown`으로 렌더링하되, 작은 카드 크기에 맞춰 스타일을 제약함:
  - 헤딩(h1~h6)은 본문보다 살짝 큰 굵은 텍스트로 통일 (제목 위계 차이를 시각적으로 축소)
  - 모든 블록의 상하 마진 최소화 (`margin: 0` 후 `gap` 기반 spacing)
  - 인라인 코드/볼드/이탤릭/링크/리스트는 정상 렌더링
  - 이미지와 큰 표는 카드 미리보기에서 숨김 (모달에서만 렌더)
- 본문 영역은 `max-height`(약 5줄)와 `overflow: hidden`을 적용하고, 하단에 카드 색상과 동일한 색의 그라데이션 페이드아웃을 두어 잘림을 시각적으로 암시 (단순 ellipsis 대신)

## 상태 영속화

- 단일 `useEffect`가 reducer 상태를 감시하다가 250ms 디바운스로 `localStorage['memo-app:state']`에 기록
- 로드 시 `StorageProvider`가 읽어서 `version === 1`을 검증한 후 reducer 시드. 유효하지 않거나 없으면 빈 초기 상태
- 모든 변경은 reducer 액션을 통해 처리: `CREATE_MEMO`, `UPDATE_MEMO`, `MOVE_MEMO`, `TOGGLE_PIN`, `DELETE_MEMO`, `CHANGE_COLOR`

## 엣지 케이스

- **빈 열**: 열 헤더만 렌더링하고 카드를 받을 수 있는 보이지 않는 드롭 타깃 영역 유지
- **메모가 하나도 없음**: 보드는 정상 렌더링하고 세 열은 비어 있음. v1에서 빈 상태용 문구 없음
- **긴 제목**: 카드에서 한 줄 말줄임; 모달에서는 전체 제목 표시
- **본문 없음**: 카드는 제목만 표시; 모달은 빈 본문 영역 렌더링
- **저장소 용량 한도**: LocalStorage 한도(~5MB)는 일반 텍스트 메모에 충분. v1에서 별도 한도 처리 없음

## 테스트

- **유닛**: reducer 액션 테스트 — 열 내부 이동, 열 간 이동, 핀 토글 시 정렬, 색상 변경, 삭제
- **컴포넌트**: 샘플 상태로 `MemoCard`, `Column`, `MemoModal` 렌더 테스트; 시각 상태(고정, hover, 새 메모 dim) 검증
- **통합**: React Testing Library로 전체 흐름 — 작성 → 편집 → 다른 열로 드래그 → 핀 고정 → 새로고침 (LocalStorage 영속화 검증)
- **v1에 e2e 테스트 없음** — Playwright/Cypress는 추후 범위 확장 시 추가

## 범위 외 (후속 가능)

- 검색 (`⌘K`)
- 태그
- 내보내기/가져오기 (JSON)
- 기기 간 동기화
- 모바일 레이아웃
- 실행 취소/다시 실행
- 사용자 정의 팔레트 / 다크 모드
