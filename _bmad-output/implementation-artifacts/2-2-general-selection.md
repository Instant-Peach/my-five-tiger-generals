# Story 2.2: 장수 선택 (General Selection)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 보드에 배치된 장수를 탭/클릭하여 선택할 수 있다,
so that 해당 장수로 이동이나 공격 등의 행동을 준비할 수 있다.

## Acceptance Criteria

1. **AC1**: 플레이어는 자신의 장수를 탭/클릭하여 선택할 수 있다
   - 터치/마우스 입력으로 장수 토큰을 선택
   - 선택된 장수가 `selectedGeneral` 상태에 저장됨
   - 선택 가능한 장수: `status === 'active'` 이고 `currentPlayer`의 소유

2. **AC2**: 선택된 장수가 시각적으로 하이라이트된다
   - 선택된 장수 토큰에 하이라이트 효과 (예: 노란색 테두리, 발광)
   - 이전 선택은 자동으로 해제되고 새 선택이 하이라이트됨
   - 하이라이트는 선택 해제 시 사라짐

3. **AC3**: 상대 장수는 선택할 수 없다
   - 상대 플레이어의 장수 클릭 시 선택되지 않음
   - 시각적 피드백 없음 (또는 "상대 장수는 선택 불가" 메시지)

4. **AC4**: 선택 상태는 게임 상태에 반영된다
   - `GameState.selectedGeneralId` 필드에 선택된 장수 ID 저장
   - `null`이면 선택 없음
   - 턴 종료 시 자동으로 선택 해제

5. **AC5**: 빈 타일 클릭 시 선택이 해제된다
   - 장수가 없는 타일을 클릭하면 `selectedGeneralId = null`
   - 하이라이트 효과 제거
   - 이동/공격 범위 표시 제거 (Epic 3-4에서)

## Tasks / Subtasks

- [x] Task 1: 게임 상태에 선택 상태 추가 (AC: 4)
  - [x] 1.1: `GameState` 타입에 `selectedGeneralId: GeneralId | null` 필드 추가
  - [x] 1.2: `initialState`에서 `selectedGeneralId: null`로 초기화
  - [x] 1.3: 선택 상태 조회 함수 구현: `getSelectedGeneral(state): General | null`

- [x] Task 2: 장수 선택 로직 구현 (AC: 1, 3, 4)
  - [x] 2.1: `packages/game-core/src/state/actions.ts` 생성 (또는 확장)
    - `selectGeneral(state, generalId): Result<GameState>` 함수
    - 검증: 해당 장수가 `currentPlayer` 소유이고 `active` 상태인지
    - 상대 장수 선택 시도 시 에러 반환
  - [x] 2.2: `deselectGeneral(state): GameState` 함수 (선택 해제)
  - [x] 2.3: 단위 테스트 작성
    - 자신의 장수 선택 성공
    - 상대 장수 선택 실패
    - OUT 상태 장수 선택 실패

- [x] Task 3: InputHandler에 장수 선택 통합 (AC: 1, 5)
  - [x] 3.1: `InputHandler`의 타일 클릭 핸들러 확장
    - 클릭한 타일에 장수가 있는지 확인 (`getGeneralAtTile`)
    - 장수가 있으면 `selectGeneral` 호출
    - 장수가 없으면 `deselectGeneral` 호출
  - [x] 3.2: 이벤트 발행
    - `general:selected` 이벤트 (generalId)
    - `general:deselected` 이벤트

- [x] Task 4: 선택 하이라이트 렌더링 (AC: 2)
  - [x] 4.1: `GeneralRenderer`에 하이라이트 기능 추가
    - `highlightGeneral(generalId)` 메서드
    - `clearHighlight()` 메서드
  - [x] 4.2: 하이라이트 시각 효과 구현
    - 노란색 테두리 링 또는 발광 효과
    - 애니메이션 (맥동 효과 - 선택적)
  - [x] 4.3: GameScene에서 이벤트 리스너 등록
    - `general:selected` → `highlightGeneral` 호출
    - `general:deselected` → `clearHighlight` 호출

- [x] Task 5: 통합 테스트 및 E2E 시나리오 (AC: 전체)
  - [x] 5.1: 장수 선택 시나리오 테스트
  - [x] 5.2: 선택 해제 시나리오 테스트
  - [x] 5.3: 상대 장수 선택 불가 시나리오 테스트

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 선택 로직은 `packages/game-core/src/state/actions.ts`에 위치
- 게임 상태는 `packages/game-core/src/state/types.ts`에 위치
- Phaser import 절대 금지 - 순수 로직만

**game-renderer 패키지 (Phaser 사용)**
- 하이라이트 렌더링은 `packages/game-renderer/src/rendering/GeneralRenderer.ts`에 위치
- game-core의 데이터를 받아서 시각화만 담당

### 핵심 구현 패턴

#### 1. State Transition Pattern (아키텍처 문서)

선택 상태 변경은 전용 액션 함수를 통해서만 수행합니다.

```typescript
// packages/game-core/src/state/actions.ts

import type { GameState, Result } from './types';
import type { GeneralId } from '../generals/types';
import { getGeneralById } from './queries';

/**
 * 장수 선택 액션
 * @param state 현재 게임 상태
 * @param generalId 선택할 장수 ID
 * @returns Result<GameState> - 성공 시 새 상태, 실패 시 에러
 */
export function selectGeneral(state: GameState, generalId: GeneralId): Result<GameState> {
  const general = getGeneralById(state, generalId);

  // 검증: 장수가 존재하는가?
  if (!general) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_FOUND', message: `장수 ${generalId}를 찾을 수 없습니다` }
    };
  }

  // 검증: 현재 플레이어의 장수인가?
  if (general.owner !== state.currentPlayer) {
    return {
      success: false,
      error: { code: 'INVALID_OWNER', message: '상대 장수는 선택할 수 없습니다' }
    };
  }

  // 검증: 활성 상태인가?
  if (general.status !== 'active') {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_ACTIVE', message: '이 장수는 선택할 수 없습니다' }
    };
  }

  // 선택 성공
  return {
    success: true,
    data: {
      ...state,
      selectedGeneralId: generalId,
    }
  };
}

/**
 * 장수 선택 해제 액션
 * @param state 현재 게임 상태
 * @returns 선택이 해제된 새 상태
 */
export function deselectGeneral(state: GameState): GameState {
  return {
    ...state,
    selectedGeneralId: null,
  };
}
```

#### 2. Result Type (Error Handling Pattern)

모든 검증 가능한 액션은 `Result<T>` 타입을 반환합니다.

```typescript
// packages/game-core/src/state/types.ts

export interface GameError {
  code: string;
  message: string;
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: GameError };
```

#### 3. Event-based Communication Pattern

시스템 간 통신은 타입 안전 Event Bus를 사용합니다.

```typescript
// packages/game-core/src/events/types.ts (확장)

type GameEvents = {
  // ... 기존 이벤트들
  'general:selected': { generalId: GeneralId };
  'general:deselected': { generalId: GeneralId | null };
};
```

**이벤트 발행 위치:**
- `InputHandler` (game-renderer) → 사용자 입력 시 이벤트 발행
- `GameScene` (game-renderer) → 이벤트 수신 후 렌더링

#### 4. InputHandler 확장 패턴

기존 `InputHandler`의 타일 클릭 핸들러를 확장합니다.

```typescript
// packages/game-renderer/src/input/InputHandler.ts (수정)

import { gameEvents } from '@five-tiger-generals/game-core';
import { getGeneralAtTile } from '@five-tiger-generals/game-core';

class InputHandler {
  private handleTileClick(tileId: TileId): void {
    // 클릭한 타일에 장수가 있는지 확인
    const general = getGeneralAtTile(this.gameState, tileId);

    if (general) {
      // 장수가 있으면 선택 시도
      const result = selectGeneral(this.gameState, general.id);

      if (result.success) {
        this.gameState = result.data;
        gameEvents.emit('general:selected', { generalId: general.id });
      } else {
        // 에러 처리 (예: 상대 장수 선택 시도)
        console.warn(result.error.message);
        gameEvents.emit('action:invalid', { reason: result.error.code });
      }
    } else {
      // 장수가 없으면 선택 해제
      this.gameState = deselectGeneral(this.gameState);
      gameEvents.emit('general:deselected', { generalId: null });
    }

    // 기존 타일 선택 이벤트도 발행 (호환성)
    gameEvents.emit('tile:selected', { tileId });
  }
}
```

### 하이라이트 렌더링 구현

#### GeneralRenderer 확장

```typescript
// packages/game-renderer/src/rendering/GeneralRenderer.ts (수정)

export class GeneralRenderer {
  private highlightSprite: Phaser.GameObjects.Graphics | null = null;

  /**
   * 장수 하이라이트 표시
   * @param generalId 하이라이트할 장수 ID
   */
  highlightGeneral(generalId: GeneralId): void {
    // 기존 하이라이트 제거
    this.clearHighlight();

    // 장수 스프라이트 찾기
    const container = this.sprites.get(generalId);
    if (!container) return;

    // 하이라이트 링 생성 (노란색 원형 테두리)
    const highlight = this.scene.add.graphics();
    highlight.lineStyle(4, 0xffff00, 1); // 노란색, 두께 4
    highlight.strokeCircle(0, 0, 28); // 반지름 28 (토큰 반지름 20 + 여유)

    // 맥동 애니메이션 (선택적)
    this.scene.tweens.add({
      targets: highlight,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // 컨테이너에 추가
    container.add(highlight);
    highlight.setDepth(-1); // 토큰 뒤에 배치

    this.highlightSprite = highlight;
  }

  /**
   * 하이라이트 제거
   */
  clearHighlight(): void {
    if (this.highlightSprite) {
      this.highlightSprite.destroy();
      this.highlightSprite = null;
    }
  }
}
```

#### GameScene 이벤트 통합

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

create() {
  // ... 기존 코드

  // 이벤트 리스너 등록
  gameEvents.on('general:selected', this.handleGeneralSelected.bind(this));
  gameEvents.on('general:deselected', this.handleGeneralDeselected.bind(this));
}

private handleGeneralSelected(data: { generalId: GeneralId }): void {
  this.generalRenderer.highlightGeneral(data.generalId);
}

private handleGeneralDeselected(): void {
  this.generalRenderer.clearHighlight();
}

shutdown() {
  // 이벤트 리스너 정리
  gameEvents.off('general:selected', this.handleGeneralSelected.bind(this));
  gameEvents.off('general:deselected', this.handleGeneralDeselected.bind(this));
}
```

### 게임 상태 타입 확장

```typescript
// packages/game-core/src/state/types.ts (수정)

import type { GeneralId } from '../generals/types';

export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentPlayer: PlayerId;
  turn: number;
  generals: General[];
  selectedGeneralId: GeneralId | null; // [추가] 선택된 장수 ID
}
```

### 선택 상태 조회 함수

```typescript
// packages/game-core/src/state/queries.ts (확장)

/**
 * 현재 선택된 장수 조회
 */
export function getSelectedGeneral(state: GameState): General | null {
  if (!state.selectedGeneralId) return null;
  return getGeneralById(state, state.selectedGeneralId) ?? null;
}

/**
 * 특정 장수가 선택되었는지 확인
 */
export function isGeneralSelected(state: GameState, generalId: GeneralId): boolean {
  return state.selectedGeneralId === generalId;
}
```

### 테스트 시나리오

```typescript
// packages/game-core/tests/actions.test.ts (신규 또는 확장)

describe('장수 선택 액션', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState(); // Player1 턴
  });

  describe('selectGeneral', () => {
    it('자신의 활성 장수를 선택할 수 있다', () => {
      const general = state.generals.find(g => g.owner === 'player1')!;
      const result = selectGeneral(state, general.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.selectedGeneralId).toBe(general.id);
      }
    });

    it('상대 장수를 선택하면 에러를 반환한다', () => {
      const enemyGeneral = state.generals.find(g => g.owner === 'player2')!;
      const result = selectGeneral(state, enemyGeneral.id);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_OWNER');
      }
    });

    it('OUT 상태 장수를 선택하면 에러를 반환한다', () => {
      // OUT 상태로 만들기
      state.generals[0].status = 'out';
      const result = selectGeneral(state, state.generals[0].id);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GENERAL_NOT_ACTIVE');
      }
    });

    it('존재하지 않는 장수 ID는 에러를 반환한다', () => {
      const result = selectGeneral(state, 'invalid_id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GENERAL_NOT_FOUND');
      }
    });
  });

  describe('deselectGeneral', () => {
    it('선택 해제 시 selectedGeneralId가 null이 된다', () => {
      // 먼저 선택
      const general = state.generals.find(g => g.owner === 'player1')!;
      const selected = selectGeneral(state, general.id);
      expect(selected.success).toBe(true);

      // 선택 해제
      if (selected.success) {
        const deselected = deselectGeneral(selected.data);
        expect(deselected.selectedGeneralId).toBeNull();
      }
    });
  });

  describe('getSelectedGeneral', () => {
    it('선택된 장수 객체를 반환한다', () => {
      const general = state.generals.find(g => g.owner === 'player1')!;
      const result = selectGeneral(state, general.id);

      if (result.success) {
        const selected = getSelectedGeneral(result.data);
        expect(selected).toBeDefined();
        expect(selected?.id).toBe(general.id);
      }
    });

    it('선택이 없으면 null을 반환한다', () => {
      const selected = getSelectedGeneral(state);
      expect(selected).toBeNull();
    });
  });
});
```

### Project Structure Notes

**신규 파일:**
```
packages/game-core/src/
└── state/
    └── actions.ts              # [신규] 게임 액션 (selectGeneral, deselectGeneral)
```

**수정 파일:**
```
packages/game-core/src/
├── state/
│   ├── types.ts                # [수정] selectedGeneralId 필드 추가
│   ├── queries.ts              # [수정] getSelectedGeneral, isGeneralSelected 추가
│   └── initialState.ts         # [수정] selectedGeneralId: null 추가
└── events/types.ts             # [수정] general:selected, general:deselected 이벤트 추가

packages/game-renderer/src/
├── rendering/
│   └── GeneralRenderer.ts      # [수정] highlightGeneral, clearHighlight 메서드 추가
├── input/
│   └── InputHandler.ts         # [수정] 타일 클릭 시 장수 선택 로직 추가
└── scenes/
    └── GameScene.ts            # [수정] 이벤트 리스너 등록
```

**테스트 파일:**
```
packages/game-core/tests/
└── actions.test.ts             # [신규] 장수 선택 액션 테스트
```

### 이전 스토리 학습 사항 (Story 2-1)

**장수 배치 시스템에서:**
- `General` 타입 정의 완료 (id, name, owner, stats, troops, position, status)
- `createInitialGameState()` 함수로 초기 상태 생성
- `getGeneralAtTile(state, tileId)` 함수로 타일의 장수 조회 가능
- `GeneralRenderer` 클래스로 장수 렌더링 (컨테이너 + 토큰 + 병력 표시)

**Epic 1 회고에서:**
- Event Bus 패턴 검증됨
- 타일 선택 시스템(`tile:selected` 이벤트) 안정적 동작
- `InputHandler` → Event → `GameScene` 흐름 확립
- 아키텍처 경계 준수 문화 (game-core: Phaser 금지)

### 네이밍 컨벤션 (아키텍처 문서)

- **함수**: camelCase (selectGeneral, deselectGeneral)
- **타입**: PascalCase (GameState, GeneralId)
- **상수**: UPPER_SNAKE_CASE (HIGHLIGHT_COLOR)
- **이벤트**: `domain:action` (general:selected, general:deselected)

### References

- [Source: _bmad-output/epics.md#Epic 2: 장수 시스템] - Story [GENERAL-002] 정의
- [Source: _bmad-output/gdd.md#Unit Types and Classes] - 장수 시스템 개념
- [Source: _bmad-output/game-architecture.md#Communication Pattern] - Event-based + Direct Reference
- [Source: _bmad-output/game-architecture.md#State Transition Pattern] - 상태 전이 함수 패턴
- [Source: _bmad-output/game-architecture.md#Error Handling] - Result<T> 타입 사용
- [Source: _bmad-output/game-architecture.md#Event System] - 타입 안전 Event Bus
- [Source: 2-1-general-placement.md#Dev Notes] - General 타입, GeneralRenderer 패턴
- [Source: packages/game-core/src/generals/types.ts] - General, GeneralId 타입
- [Source: packages/game-core/src/state/types.ts] - GameState 타입
- [Source: packages/game-core/src/state/queries.ts] - getGeneralAtTile 함수
- [Source: packages/game-renderer/src/input/InputHandler.ts] - 타일 입력 처리
- [Source: packages/game-renderer/src/rendering/GeneralRenderer.ts] - 장수 렌더링 클래스

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

(구현 완료 후 작성)

### Completion Notes List

(구현 완료 후 작성)

### File List

**예상 신규 파일:**
- `packages/game-core/src/state/actions.ts` - 게임 액션 함수
- `packages/game-core/tests/actions.test.ts` - 액션 테스트

**예상 수정 파일:**
- `packages/game-core/src/state/types.ts` - selectedGeneralId 필드 추가
- `packages/game-core/src/state/queries.ts` - 선택 조회 함수 추가
- `packages/game-core/src/state/initialState.ts` - 초기 selectedGeneralId 설정
- `packages/game-core/src/state/index.ts` - actions export 추가
- `packages/game-core/src/events/types.ts` - 선택 이벤트 타입 추가
- `packages/game-renderer/src/rendering/GeneralRenderer.ts` - 하이라이트 메서드 추가
- `packages/game-renderer/src/input/InputHandler.ts` - 장수 선택 로직 추가
- `packages/game-renderer/src/scenes/GameScene.ts` - 이벤트 리스너 등록

---

## Dev Agent Record

### Implementation Session - 2026-02-03

**Status**: ✅ Completed

**Summary**: Story 2-2 장수 선택 시스템 구현 완료. 모든 Acceptance Criteria 충족, 219개 테스트 통과, 빌드 성공.

**Changes Made**:

1. **게임 상태 확장 (Task 1)**
   - `packages/game-core/src/state/types.ts`: `selectedGeneralId: GeneralId | null` 필드 추가, `GameError`, `Result<T>` 타입 추가
   - `packages/game-core/src/state/initialState.ts`: `selectedGeneralId: null` 초기화
   - `packages/game-core/src/state/queries.ts`: `getSelectedGeneral()`, `isGeneralSelected()` 함수 추가
   - `packages/game-core/tests/state.test.ts`: 선택 상태 조회 테스트 추가

2. **장수 선택 로직 (Task 2)**
   - `packages/game-core/src/state/actions.ts` (신규): `selectGeneral()`, `deselectGeneral()` 액션 구현
   - `packages/game-core/src/state/index.ts`: actions와 새 queries export 추가
   - `packages/game-core/tests/actions.test.ts` (신규): 15개 단위 테스트 작성 (선택/해제/검증/불변성)

3. **InputHandler 통합 (Task 3)**
   - `packages/game-renderer/src/scenes/GameScene.ts`:
     - `handleTileSelect()` 확장: 타일 클릭 시 장수 선택/해제 로직 통합
     - `handleDeselect()` 수정: 선택 해제 시 이벤트 발행
     - `general:selected`, `general:deselected` 이벤트 발행

4. **하이라이트 렌더링 (Task 4)**
   - `packages/game-renderer/src/rendering/GeneralRenderer.ts`:
     - `highlightGeneral()`: 노란색 원형 테두리 + 맥동 애니메이션
     - `clearHighlight()`: 하이라이트 제거
     - `getHighlightedGeneralId()`: 현재 하이라이트 조회
   - `packages/game-renderer/src/scenes/GameScene.ts`:
     - `handleGeneralSelected()`, `handleGeneralDeselected()` 이벤트 핸들러 추가
     - 이벤트 리스너 등록 및 정리

5. **통합 테스트 (Task 5)**
   - `packages/game-core/tests/state.test.ts`: 7개 E2E 시나리오 추가
     - Player 1 자신의 장수 선택/해제
     - 상대 장수 선택 시도 실패
     - 장수 변경 시나리오
     - OUT 상태 장수 선택 불가
     - Player 2 턴 검증
     - 빈 타일 클릭 시나리오
     - 모든 장수 순차 선택

**Test Results**:
- ✅ game-core: 219 tests passed (5 test files)
  - state.test.ts: 43 tests
  - actions.test.ts: 15 tests
  - board.test.ts: 119 tests
  - generals.test.ts: 29 tests
  - colors.test.ts: 13 tests
- ✅ Build: All packages built successfully (game-core, game-renderer, web)

**Acceptance Criteria Validation**:
- ✅ AC1: 플레이어가 자신의 장수를 선택할 수 있음 (검증 완료)
- ✅ AC2: 선택된 장수 하이라이트 구현 (노란색 테두리 + 맥동 애니메이션)
- ✅ AC3: 상대 장수 선택 불가 (INVALID_OWNER 에러 반환)
- ✅ AC4: 선택 상태가 GameState에 반영됨 (selectedGeneralId 필드)
- ✅ AC5: 빈 타일 클릭 시 선택 해제 (deselectGeneral 호출)

**Architecture Compliance**:
- ✅ game-core: Phaser 의존성 없음, 순수 TypeScript
- ✅ 불변성 유지: 모든 액션이 새 상태 객체 반환
- ✅ Result<T> 패턴: 에러 처리 타입 안전
- ✅ 이벤트 기반 통신: game-core ↔ game-renderer 분리

**Known Issues**: None

**Next Steps**:
- Story 상태를 `done`으로 업데이트
- sprint-status.yaml 업데이트 (2-2-general-selection: in-progress → done)
- Epic 2 다음 스토리 진행 또는 code-review 워크플로우 실행

---

### Code Review Session - 2026-02-03

**Reviewer**: Code Review Agent (ADVERSARIAL)
**Status**: ✅ Review Complete - Issues Fixed

**Issues Found**: 3 High, 4 Medium, 3 Low (Total: 10)
**Issues Fixed**: 3 High, 3 Medium (Total: 6)
**Remaining**: 1 Medium (Epic 8), 3 Low (non-critical)

**Fixed Issues**:
1. ✅ [HIGH] 같은 장수 재선택 시 하이라이트 깜빡임 → 토글 동작으로 수정
2. ✅ [HIGH] 장수 제거 시 하이라이트 정리 누락 → removeGeneral()에 clearHighlight() 추가
3. ✅ [MEDIUM] Result<T> 에러 코드 타입 미정의 → GameErrorCode union type 추가
4. ✅ [MEDIUM] 하이라이트 색상 하드코딩 → HIGHLIGHT_COLOR 상수로 분리
5. ✅ [MEDIUM] 테스트 불변성 검증 미흡 → generals 배열 참조 검증 추가

**Deferred Issues**:
- [MEDIUM] 에러 메시지 UI (Epic 8에서 처리 예정)

**Low Priority Items**: 문서화 및 스타일 개선 (선택적)

**Final Test Results**: ✅ 219 tests passed

