# Story 3.2: 장수 이동 (General Movement)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 이동 가능 타일을 탭하여 장수를 이동시킬 수 있다,
so that 전략적 위치를 선점하고 전투/노크를 위한 포지셔닝을 할 수 있다.

## Acceptance Criteria

1. **AC1**: 플레이어가 이동 가능 타일을 탭하면 선택된 장수가 해당 타일로 이동한다
   - 이동 가능 타일: 3-1 스토리에서 구현된 `getMovableTilesForGeneral()`로 계산
   - 이동 가능 타일 외의 타일 탭 시 이동하지 않음
   - 장수 선택 상태에서만 이동 가능

2. **AC2**: 이동 후 게임 상태가 정확히 업데이트된다
   - general.position 업데이트 (이전 타일 → 새 타일)
   - 이동한 장수의 선택 상태 유지 (추가 행동 가능성)
   - 이동 가능 타일 하이라이트 재계산 (새 위치 기준)

3. **AC3**: 이동이 턴/행동 시스템과 올바르게 연동된다
   - 이동은 1 행동 소모
   - 행동 카운터 감소 (actionsRemaining - 1)
   - 동일 장수 동일 행동 제한: 같은 턴에 같은 장수가 다시 이동 불가
   - 행동 기록: `performedActions` 배열에 { generalId, actionType: 'move' } 추가

4. **AC4**: 이동 시 시각적 피드백이 제공된다
   - 장수 스프라이트가 새 위치로 이동
   - 위치 변경 후 하이라이트 업데이트

5. **AC5**: 유효하지 않은 이동 시도 시 적절히 처리된다
   - 이동 불가 타일 탭 시 무시 (선택 해제만)
   - 상대 턴에 이동 시도 불가
   - 행동력 0일 때 이동 불가
   - 이미 이동한 장수로 다시 이동 시도 시 불가

## Tasks / Subtasks

- [x] Task 1: 이동 액션 처리 로직 구현 (AC: 1, 2, 3)
  - [x] 1.1: `moveGeneral()` 액션 함수 생성 (game-core)
    - `packages/game-core/src/movement/actions.ts` 생성
    - 입력: state, generalId, toTileId
    - 출력: Result<GameState>
    - 유효성 검증: 이동 가능 타일 여부, 턴 검증, 행동력 검증
  - [x] 1.2: 행동 제한 시스템 연동
    - `state.actionsRemaining` 감소
    - `state.performedActions`에 이동 기록 추가
    - 동일 장수 동일 행동 검증 로직
  - [x] 1.3: 상태 업데이트 헬퍼 함수
    - `updateGeneralPosition()` - 장수 위치 업데이트
    - 불변성 유지 패턴 적용

- [x] Task 2: 이동 가능 타일 클릭 핸들러 구현 (AC: 1, 5)
  - [x] 2.1: GameScene에서 이동 가능 타일 클릭 감지
    - `handleTileClicked()` 수정
    - 현재 선택된 장수 확인
    - 클릭된 타일이 이동 가능 타일인지 확인
  - [x] 2.2: 이동 실행 플로우
    - moveGeneral() 호출
    - 결과 확인 후 상태 업데이트
    - 에러 시 적절한 처리 (무시 또는 피드백)

- [x] Task 3: 이동 후 시각적 업데이트 (AC: 4, 2)
  - [x] 3.1: 장수 스프라이트 위치 이동
    - GeneralRenderer에서 위치 업데이트
    - 스프라이트 좌표 계산 (타일 중심)
  - [x] 3.2: 이동 가능 타일 하이라이트 재계산
    - 새 위치 기준으로 getMovableTilesForGeneral() 재호출
    - boardRenderer.showMovableTiles() 업데이트
    - 선택 상태 유지

- [x] Task 4: 행동 제한 시스템 구현 (AC: 3)
  - [x] 4.1: GameState 타입 확장
    - `actionsRemaining: number` (기존에 있으면 확인)
    - `performedActions: PerformedAction[]` 배열 추가
    - `PerformedAction` 타입 정의: { generalId, actionType }
  - [x] 4.2: 행동 검증 함수
    - `canPerformAction(state, generalId, actionType)` 함수
    - 행동력 잔여량 검증
    - 동일 장수 동일 행동 검증

- [x] Task 5: 턴 전환 시 행동 시스템 리셋 (AC: 3)
  - [x] 5.1: 턴 종료 시 초기화
    - `performedActions` 배열 초기화
    - `actionsRemaining` 기본값으로 리셋 (3)

- [x] Task 6: 테스트 작성 (AC: 전체)
  - [x] 6.1: moveGeneral() 단위 테스트
    - 정상 이동 케이스
    - 유효하지 않은 이동 (범위 밖, 차단됨)
    - 턴 검증 실패
    - 행동력 부족
    - 동일 장수 동일 행동 제한
  - [x] 6.2: 행동 시스템 테스트
    - canPerformAction() 테스트
    - performedActions 기록 테스트
    - 턴 전환 시 리셋 테스트
  - [x] 6.3: 통합 테스트
    - 빌드 성공 확인
    - 기존 테스트 통과 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 이동 액션: `packages/game-core/src/movement/actions.ts` (신규)
- 행동 시스템: `packages/game-core/src/turn/actions.ts` (확장)
- 타입 정의: `packages/game-core/src/state/types.ts` (확장)
- 상수: `packages/game-core/src/constants/game.ts` (ACTIONS_PER_TURN = 3)

**game-renderer 패키지 (Phaser 렌더링)**
- GameScene: 타일 클릭 → 이동 실행 플로우
- GeneralRenderer: 스프라이트 위치 업데이트

**apps/web (React UI)**
- 이 스토리에서는 React UI 변경 최소화
- 행동 카운터 UI는 Epic 5 (턴 관리)에서 구현 예정

### 핵심 구현 패턴

#### 1. 이동 액션 함수 (game-core)

```typescript
// packages/game-core/src/movement/actions.ts

import type { TileId } from '../board/types';
import type { GeneralId } from '../generals/types';
import type { GameState, Result, GameError } from '../state/types';
import { getMovableTilesForGeneral } from './index';

/** 행동 타입 정의 */
export type ActionType = 'move' | 'attack' | 'tactic' | 'knock' | 'deploy';

/** 수행된 행동 기록 */
export interface PerformedAction {
  generalId: GeneralId;
  actionType: ActionType;
}

/**
 * 장수 이동 액션 실행
 *
 * @param state - 현재 게임 상태
 * @param generalId - 이동할 장수 ID
 * @param toTileId - 목적지 타일 ID
 * @returns Result<GameState> - 성공 시 업데이트된 상태, 실패 시 에러
 */
export function moveGeneral(
  state: GameState,
  generalId: GeneralId,
  toTileId: TileId
): Result<GameState> {
  // 1. 장수 찾기
  const general = state.generals.find(g => g.id === generalId);
  if (!general) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_FOUND', message: `장수를 찾을 수 없습니다: ${generalId}` }
    };
  }

  // 2. 턴 검증
  if (general.owner !== state.currentPlayer) {
    return {
      success: false,
      error: { code: 'NOT_YOUR_TURN', message: '자신의 턴이 아닙니다' }
    };
  }

  // 3. 행동력 검증
  if (state.actionsRemaining <= 0) {
    return {
      success: false,
      error: { code: 'NO_ACTIONS_REMAINING', message: '행동력이 부족합니다' }
    };
  }

  // 4. 동일 장수 동일 행동 제한 검증
  const hasAlreadyMoved = state.performedActions?.some(
    action => action.generalId === generalId && action.actionType === 'move'
  );
  if (hasAlreadyMoved) {
    return {
      success: false,
      error: {
        code: 'SAME_ACTION_SAME_GENERAL',
        message: '같은 장수가 같은 턴에 동일한 행동을 할 수 없습니다'
      }
    };
  }

  // 5. 이동 가능 타일 검증
  const movableTiles = getMovableTilesForGeneral(state, generalId);
  if (!movableTiles.includes(toTileId)) {
    return {
      success: false,
      error: { code: 'INVALID_MOVE', message: '이동할 수 없는 타일입니다' }
    };
  }

  // 6. 상태 업데이트
  const newGenerals = state.generals.map(g =>
    g.id === generalId ? { ...g, position: toTileId } : g
  );

  const newPerformedActions: PerformedAction[] = [
    ...(state.performedActions ?? []),
    { generalId, actionType: 'move' as ActionType }
  ];

  return {
    success: true,
    data: {
      ...state,
      generals: newGenerals,
      actionsRemaining: state.actionsRemaining - 1,
      performedActions: newPerformedActions,
    }
  };
}
```

#### 2. 행동 검증 헬퍼 함수

```typescript
// packages/game-core/src/turn/actions.ts (확장)

import type { GameState } from '../state/types';
import type { GeneralId } from '../generals/types';
import type { ActionType, PerformedAction } from '../movement/actions';

/**
 * 특정 장수가 특정 행동을 수행할 수 있는지 검증
 */
export function canPerformAction(
  state: GameState,
  generalId: GeneralId,
  actionType: ActionType
): boolean {
  // 행동력 확인
  if (state.actionsRemaining <= 0) {
    return false;
  }

  // 동일 장수 동일 행동 제한 확인
  const hasSameAction = state.performedActions?.some(
    action => action.generalId === generalId && action.actionType === actionType
  );

  return !hasSameAction;
}

/**
 * 턴 종료 시 행동 시스템 리셋
 */
export function resetActionsForNewTurn(state: GameState): GameState {
  return {
    ...state,
    actionsRemaining: 3, // GAME.ACTIONS_PER_TURN
    performedActions: [],
  };
}
```

#### 3. GameState 타입 확장

```typescript
// packages/game-core/src/state/types.ts (확장)

import type { ActionType, PerformedAction } from '../movement/actions';

/** 게임 상태 (확장) */
export interface GameState {
  // ... 기존 필드들

  /** 현재 턴의 남은 행동 횟수 */
  actionsRemaining: number;

  /** 현재 턴에 수행된 행동 기록 */
  performedActions: PerformedAction[];
}
```

#### 4. GameScene 이동 처리

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

import { moveGeneral, getMovableTilesForGeneral } from '@five-tiger-generals/game-core';

export class GameScene extends Phaser.Scene {
  // ... 기존 코드

  /**
   * 타일 클릭 처리
   */
  private handleTileClicked(tileId: TileId): void {
    // 선택된 장수가 없으면 무시 (또는 다른 로직)
    if (!this.selectedGeneralId) {
      // 기존 타일 선택 로직
      return;
    }

    // 이동 가능 타일인지 확인
    const movableTiles = getMovableTilesForGeneral(this.gameState, this.selectedGeneralId);
    if (!movableTiles.includes(tileId)) {
      // 이동 불가 타일 클릭 시 선택 해제
      this.handleGeneralDeselected();
      return;
    }

    // 이동 실행
    const result = moveGeneral(this.gameState, this.selectedGeneralId, tileId);

    if (result.success) {
      // 상태 업데이트
      this.gameState = result.data;

      // 시각적 업데이트
      this.generalRenderer.updatePosition(this.selectedGeneralId, tileId);

      // 이동 가능 타일 재계산 및 표시
      const newMovableTiles = getMovableTilesForGeneral(
        this.gameState,
        this.selectedGeneralId
      );
      this.boardRenderer.showMovableTiles(newMovableTiles);

      // Zustand 상태 업데이트
      // ... UI 상태 동기화
    } else {
      // 에러 처리 (로깅 또는 사용자 피드백)
      console.warn('이동 실패:', result.error.message);
    }
  }
}
```

#### 5. GeneralRenderer 위치 업데이트

```typescript
// packages/game-renderer/src/rendering/GeneralRenderer.ts (수정)

export class GeneralRenderer {
  // ... 기존 코드

  /**
   * 장수 스프라이트 위치 업데이트
   */
  updatePosition(generalId: GeneralId, tileId: TileId): void {
    const sprite = this.generalSprites.get(generalId);
    if (!sprite) return;

    // 타일 중심 좌표 계산
    const { x, y } = this.boardRenderer.getTileCenter(tileId);

    // 스프라이트 위치 이동
    sprite.setPosition(x, y);
  }
}
```

### GDD 및 아키텍처 참고

**GDD - 이동 시스템:**
- 인접 이동만 지원: 변을 공유하는 타일로만 이동
- 장수별 발(이동력): 발 스탯에 따라 이동 범위 결정
- 경로 상 적 기물 존재 시 이동 불가

**GDD - 행동 시스템:**
- 턴당 최대 3회 행동
- 동일 장수 동일 행동 제한: 같은 장수가 같은 턴에 동일한 행동을 두 번 수행할 수 없음
  - 예: 관우가 이동 후 같은 턴에 다시 이동 불가
  - 예: 관우가 이동 후 공격은 가능 (다른 행동)
  - 예: 관우가 이동 후, 장비가 이동하는 것은 가능 (다른 장수)

**아키텍처 - State Transition Pattern:**
- 상태 변경은 전용 함수로만 수행
- Result 타입 반환으로 성공/실패 명확히 구분
- 불변성 유지

**아키텍처 - Constants:**
```typescript
// constants/game.ts
export const GAME = {
  MAX_GENERALS: 5,
  ACTIONS_PER_TURN: 3,           // 턴당 최대 3회 행동
  TURN_TIME_LIMIT: 60,
  KNOCK_COUNT_TO_WIN: 3,
} as const;
```

### 이전 스토리(3-1) 학습 사항

**3-1 구현 완료 항목:**
- `getOccupiedTiles()` - 모든 장수가 점유한 타일 반환
- `getMovableTilesForGeneral()` - 이동 가능 타일 계산 (BFS)
- `MOVABLE_TILE` 상수 - 하이라이트 색상 정의
- TileRenderer.setMovable() - 이동 가능 상태 시각화
- BoardRenderer.showMovableTiles() / clearMovableTiles() - 하이라이트 관리
- GameScene.handleGeneralSelected() - 장수 선택 시 이동 가능 타일 표시

**3-1에서 발견된 주의사항:**
- 변 인접(edge-adjacent)과 꼭짓점 인접(vertex-adjacent)이 분리됨
- `EDGE_ADJACENCY_MAP`만 이동에 사용 (변으로 접하는 타일만)
- 측면 타일(30-33) 인접 관계 주의

**활용할 기존 함수:**
```typescript
// 이미 구현됨 - 재사용
import { getMovableTilesForGeneral, getOccupiedTiles } from '../movement';
import { getReachableTiles, getAdjacentTiles } from '../board/adjacency';
```

### Git 커밋 분석 (최근 작업 패턴)

**최근 커밋:**
1. `e0a0bb4` - fix: 측면 타일 꼭짓점 인접 완성 및 디버그 코드 제거
2. `1bcc422` - fix: 타일 인접 관계 수정 (변 인접 vs 꼭짓점 인접 분리)
3. `c7492b6` - feat: 3-1-moveable-tiles-display 이동 가능 타일 표시

**패턴 학습:**
- 인접 관계 버그가 발견되어 수정됨 → 이동 로직에서 올바른 인접 맵 사용 필수
- 코드 리뷰에서 디버그 코드 제거 요청 → 최종 커밋 전 console.log 제거

### Project Structure Notes

**신규 파일:**
```
packages/game-core/src/
├── movement/
│   └── actions.ts                # moveGeneral(), ActionType, PerformedAction
│
└── turn/
    └── actions.ts                # canPerformAction(), resetActionsForNewTurn()
```

**수정 파일:**
```
packages/game-core/src/
├── state/
│   └── types.ts                  # GameState 확장 (actionsRemaining, performedActions)
│
├── movement/
│   └── index.ts                  # actions 모듈 re-export
│
└── index.ts                      # 신규 함수 export

packages/game-renderer/src/
├── rendering/
│   └── GeneralRenderer.ts        # updatePosition() 메서드 추가
│
└── scenes/
    └── GameScene.ts              # handleTileClicked() 이동 로직 추가
```

**테스트 파일:**
```
packages/game-core/tests/
└── movement/
    └── actions.test.ts           # moveGeneral() 테스트
    └── turn.test.ts              # 행동 시스템 테스트
```

### 네이밍 컨벤션 (아키텍처 문서)

- **타입**: PascalCase (`ActionType`, `PerformedAction`, `GameState`)
- **함수**: camelCase (`moveGeneral`, `canPerformAction`, `resetActionsForNewTurn`)
- **상수**: UPPER_SNAKE (`ACTIONS_PER_TURN`)

### References

- [Source: _bmad-output/epics.md#Epic 3: 이동 시스템] - Story [MOVE-002] 정의
- [Source: _bmad-output/gdd.md#Movement Rules] - 인접 이동, 발 스탯 기반 범위
- [Source: _bmad-output/gdd.md#Action Economy] - 턴당 3회 행동, 동일 장수 동일 행동 제한
- [Source: _bmad-output/game-architecture.md#State Transition Pattern] - Result 패턴
- [Source: _bmad-output/game-architecture.md#Configuration] - GAME.ACTIONS_PER_TURN = 3
- [Source: _bmad-output/implementation-artifacts/3-1-moveable-tiles-display.md] - 이전 스토리 구현
- [Source: packages/game-core/src/movement/index.ts] - getMovableTilesForGeneral()
- [Source: packages/game-core/src/board/adjacency.ts] - EDGE_ADJACENCY_MAP (이동용)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 타입체크 오류 해결: game-core 빌드 후 game-renderer에서 새 export 인식

### Completion Notes List

1. **Task 4.1 완료**: GameState 타입에 `actionsRemaining`, `performedActions` 필드 추가. `ActionType`, `PerformedAction` 타입 정의. `GameErrorCode`에 새 에러 코드 추가.

2. **Task 1.1-1.3 완료**: `moveGeneral()` 함수 구현 - 장수 존재, 턴 소유권, 행동력, 동일 장수 동일 행동 제한, 이동 가능 타일 검증 포함. `updateGeneralPosition()` 헬퍼 함수 추가.

3. **Task 4.2 완료**: `canPerformAction()` 함수 구현 - 행동력과 동일 장수 동일 행동 제한 검증.

4. **Task 5.1 완료**: `resetActionsForNewTurn()`, `endTurn()` 함수 구현 - 턴 종료 시 행동 시스템 리셋.

5. **Task 2.1-2.2 완료**: GameScene의 `handleTileSelect()` 수정 - 이동 가능 타일 클릭 시 이동 실행. `executeMove()` 메서드 추가.

6. **Task 3.1-3.2 완료**: 이동 후 `generalRenderer.updatePosition()` 호출로 스프라이트 위치 업데이트. 새 위치 기준 이동 가능 타일 하이라이트 재계산.

7. **Task 6.1-6.3 완료**:
   - `movement-actions.test.ts`: 26개 테스트 (moveGeneral, canPerformAction, updateGeneralPosition)
   - `turn-actions.test.ts`: 15개 테스트 (resetActionsForNewTurn, endTurn, GAME constants)
   - 전체 326개 테스트 통과, 빌드 성공

### File List

**신규 파일:**
- `packages/game-core/src/movement/actions.ts` - moveGeneral(), canPerformAction(), updateGeneralPosition()
- `packages/game-core/src/turn/actions.ts` - resetActionsForNewTurn(), endTurn()
- `packages/game-core/src/turn/index.ts` - turn 모듈 export
- `packages/game-core/src/constants/game.ts` - GAME 상수 (ACTIONS_PER_TURN 등)
- `packages/game-core/tests/movement-actions.test.ts` - 이동 액션 테스트 (26개)
- `packages/game-core/tests/turn-actions.test.ts` - 턴 액션 테스트 (15개)

**수정 파일:**
- `packages/game-core/src/state/types.ts` - ActionType, PerformedAction, GameState 확장, GameErrorCode 확장
- `packages/game-core/src/state/index.ts` - ActionType, PerformedAction export 추가
- `packages/game-core/src/state/initialState.ts` - actionsRemaining, performedActions 초기화
- `packages/game-core/src/movement/index.ts` - actions 모듈 re-export
- `packages/game-core/src/constants/index.ts` - GAME export 추가
- `packages/game-core/src/index.ts` - turn 모듈 export 추가
- `packages/game-renderer/src/scenes/GameScene.ts` - 이동 로직 추가 (executeMove, handleTileSelect 수정)

## Change Log

- 2026-02-04: Story 3-2 구현 완료 - 장수 이동 시스템, 행동 제한 시스템, 턴 관리 기능 구현 (Claude Opus 4.5)
