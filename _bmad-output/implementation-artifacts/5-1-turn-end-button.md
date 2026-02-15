# Story 5.1: 턴 종료 버튼 (Turn End Button)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 턴 종료 버튼을 클릭하여 턴을 넘길 수 있다,
so that 행동을 남겨두더라도 전략적으로 턴을 종료할 수 있다.

## Acceptance Criteria

1. **AC1**: 턴 종료 버튼 UI (apps/web)
   - 게임 HUD 영역에 "턴 종료" 버튼 표시
   - 버튼 위치: 화면 하단 우측 (터치 접근성 고려)
   - 버튼 크기: 최소 44x44px (모바일 접근성 기준)
   - 버튼 텍스트: "턴 종료" (한국어)

2. **AC2**: 턴 종료 버튼 상태 (apps/web)
   - 내 턴일 때만 버튼 활성화 (클릭 가능)
   - 상대 턴일 때 버튼 비활성화 (시각적 구분: 회색/흐림)
   - 게임 종료 시 버튼 숨김 또는 완전 비활성화

3. **AC3**: 턴 종료 로직 실행 (game-core)
   - 버튼 클릭 시 `endTurn()` 함수 호출
   - 현재 플레이어 변경 (player1 <-> player2)
   - 턴 번호 증가 (player2 -> player1일 때)
   - 행동 시스템 리셋 (actionsRemaining=3, performedActions=[])
   - 선택 상태 초기화 (selectedGeneralId=null, turnPhase='select')

4. **AC4**: 턴 전환 이벤트 및 시각적 피드백 (game-renderer)
   - 턴 종료 시 'turn:end' 이벤트 발행
   - 다음 턴 시작 시 'turn:start' 이벤트 발행
   - 턴 전환 시각적 피드백 (선택 해제, 하이라이트 제거)
   - 장수 선택 해제 및 이동/공격 가능 타일 하이라이트 제거

5. **AC5**: 키보드 단축키 (apps/web)
   - Space 키로 턴 종료 가능 (데스크톱 사용자)
   - 내 턴일 때만 단축키 동작
   - 포커스가 다른 입력 필드에 있을 때는 동작하지 않음

6. **AC6**: 테스트 커버리지
   - game-core: `endTurn()` 함수 단위 테스트 (이미 존재, 확장 필요)
   - game-renderer: 턴 전환 이벤트 발행 테스트
   - apps/web: 버튼 UI 수동 테스트

## Tasks / Subtasks

- [x] Task 1: 턴 종료 버튼 UI 컴포넌트 구현 (AC: 1, 2)
  - [x] 1.1: `TurnEndButton.tsx` 컴포넌트 생성
    - apps/web/src/components/game/TurnEndButton.tsx
    - props: onEndTurn, isMyTurn, isGameEnded
    - 조건부 활성화/비활성화 스타일링
  - [x] 1.2: 버튼 스타일링
    - 최소 44x44px 터치 타겟
    - 활성화/비활성화 시각적 구분
    - 호버/클릭 피드백
  - [x] 1.3: 게임 HUD에 버튼 배치
    - apps/web/src/components/game/GameHUD.tsx (신규 또는 기존)
    - 화면 하단 우측 위치

- [x] Task 2: 턴 종료 로직 통합 (AC: 3, 4)
  - [x] 2.1: GameScene에 턴 종료 메서드 추가
    - `executeEndTurn()` 메서드 구현
    - `endTurn()` 함수 호출 및 상태 업데이트
    - 선택 상태 초기화 및 하이라이트 제거
  - [x] 2.2: 턴 전환 이벤트 발행
    - `turn:end` 이벤트: { turn, playerId }
    - `turn:start` 이벤트: { turn, playerId }
  - [x] 2.3: React와 Phaser 연동
    - 버튼 클릭 -> GameScene.executeEndTurn() 호출
    - useGameScene 훅 또는 이벤트 기반 연동

- [x] Task 3: 턴 상태 UI 연동 (AC: 2)
  - [x] 3.1: 현재 턴 플레이어 상태 공유
    - gameUiStore 또는 이벤트로 currentPlayer 상태 전달
    - React 컴포넌트에서 내 턴 여부 판단
  - [x] 3.2: 턴 전환 시 UI 업데이트
    - 버튼 활성화/비활성화 상태 변경
    - (선택적) 턴 전환 알림 표시

- [x] Task 4: 키보드 단축키 구현 (AC: 5)
  - [x] 4.1: Space 키 이벤트 리스너
    - useKeyboardShortcut 훅 또는 직접 이벤트 바인딩
    - 입력 필드 포커스 시 무시
  - [x] 4.2: 조건부 동작
    - isMyTurn && !isGameEnded 조건 확인

- [x] Task 5: 빌드 및 검증 (AC: 전체)
  - [x] 5.1: 빌드 성공 확인 (`pnpm build`)
  - [x] 5.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [x] 5.3: 기존 테스트 통과 확인 (`pnpm test`)
  - [ ] 5.4: 브라우저 수동 테스트
    - 턴 종료 버튼 클릭 시 턴 전환 확인
    - 상대 턴에 버튼 비활성화 확인
    - Space 키 단축키 동작 확인
    - 선택 상태/하이라이트 초기화 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- `endTurn()` 함수는 이미 구현됨 (packages/game-core/src/turn/actions.ts)
- 추가 로직 불필요, 기존 함수 그대로 사용
- GameState 타입에 필요한 필드 모두 존재

**game-renderer 패키지 (Phaser 렌더링)**
- `GameScene.ts`: executeEndTurn() 메서드 추가
- 이벤트 발행: 'turn:end', 'turn:start'
- 선택 상태 초기화 처리

**apps/web (React UI)**
- `components/game/TurnEndButton.tsx`: 신규 버튼 컴포넌트
- `components/game/GameHUD.tsx`: 신규 HUD 컨테이너 (또는 기존 확장)
- Phaser 이벤트와 React 상태 동기화 필요

### 핵심 구현 패턴

#### 1. TurnEndButton 컴포넌트

```typescript
// apps/web/src/components/game/TurnEndButton.tsx

import { useCallback } from 'react';

interface TurnEndButtonProps {
  onEndTurn: () => void;
  isMyTurn: boolean;
  isGameEnded: boolean;
}

export function TurnEndButton({ onEndTurn, isMyTurn, isGameEnded }: TurnEndButtonProps) {
  const handleClick = useCallback(() => {
    if (isMyTurn && !isGameEnded) {
      onEndTurn();
    }
  }, [onEndTurn, isMyTurn, isGameEnded]);

  const isDisabled = !isMyTurn || isGameEnded;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        min-w-[44px] min-h-[44px] px-4 py-2
        font-bold rounded-lg
        transition-all duration-200
        ${isDisabled
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }
      `}
    >
      턴 종료
    </button>
  );
}
```

#### 2. GameScene.executeEndTurn()

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (추가)

import { endTurn } from '@ftg/game-core';

/**
 * 턴 종료 실행
 *
 * Story 5-1: 턴 종료 버튼
 * 버튼 클릭 또는 키보드 단축키로 호출됩니다.
 */
executeEndTurn(): void {
  if (!this.gameState) return;

  const previousPlayer = this.gameState.currentPlayer;
  const previousTurn = this.gameState.turn;

  // 턴 종료 이벤트 발행
  this.events.emit('turn:end', {
    turn: previousTurn,
    playerId: previousPlayer,
  });

  // 게임 상태 업데이트
  this.gameState = endTurn(this.gameState);

  // 선택 상태 초기화
  this.selectedTileId = null;
  this.hoveredTileId = null;

  // 시각적 상태 초기화
  if (this.boardRenderer) {
    this.boardRenderer.clearMovableTiles();
    this.boardRenderer.clearAttackableTiles();
    this.boardRenderer.clearPathPreview();
  }
  if (this.generalRenderer) {
    this.generalRenderer.clearHighlight();
  }

  // 타일 시각적 상태 업데이트
  this.updateTileVisuals();

  // 다음 턴 시작 이벤트 발행
  this.events.emit('turn:start', {
    turn: this.gameState.turn,
    playerId: this.gameState.currentPlayer,
  });
}
```

#### 3. React-Phaser 연동 패턴

```typescript
// apps/web/src/hooks/useGameScene.ts

import { useEffect, useState, useCallback } from 'react';
import type Phaser from 'phaser';

interface UseGameSceneOptions {
  gameRef: React.RefObject<Phaser.Game | null>;
}

interface GameSceneState {
  currentPlayer: 'player1' | 'player2';
  turn: number;
  isMyTurn: boolean;
  isGameEnded: boolean;
}

export function useGameScene({ gameRef }: UseGameSceneOptions) {
  const [state, setState] = useState<GameSceneState>({
    currentPlayer: 'player1',
    turn: 1,
    isMyTurn: true, // 로컬 게임: player1이 항상 '나'
    isGameEnded: false,
  });

  const executeEndTurn = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    const scene = game.scene.getScene('GameScene') as any;
    if (scene?.executeEndTurn) {
      scene.executeEndTurn();
    }
  }, [gameRef]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;

    const scene = game.scene.getScene('GameScene') as Phaser.Scene | undefined;
    if (!scene) return;

    const handleTurnStart = (payload: { turn: number; playerId: string }) => {
      setState(prev => ({
        ...prev,
        currentPlayer: payload.playerId as 'player1' | 'player2',
        turn: payload.turn,
        isMyTurn: payload.playerId === 'player1', // 로컬: player1이 '나'
      }));
    };

    scene.events.on('turn:start', handleTurnStart);

    return () => {
      scene.events.off('turn:start', handleTurnStart);
    };
  }, [gameRef]);

  return {
    ...state,
    executeEndTurn,
  };
}
```

#### 4. 키보드 단축키 구현

```typescript
// apps/web/src/hooks/useKeyboardShortcuts.ts

import { useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  onEndTurn: () => void;
  isMyTurn: boolean;
  isGameEnded: boolean;
}

export function useKeyboardShortcuts({
  onEndTurn,
  isMyTurn,
  isGameEnded,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에 포커스가 있으면 무시
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Space 키로 턴 종료
      if (event.code === 'Space' && isMyTurn && !isGameEnded) {
        event.preventDefault();
        onEndTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEndTurn, isMyTurn, isGameEnded]);
}
```

### 이전 스토리 학습 사항

**Epic 4 (전투 시스템):**
- GameScene 이벤트 발행 패턴 (`this.events.emit()`)
- 시각적 상태 초기화 패턴 (clearMovableTiles, clearHighlight 등)
- React-Phaser 연동 기본 구조

**Story 3-2 (장수 이동):**
- 행동 시스템 리셋 로직 (`resetActionsForNewTurn`)
- `endTurn()` 함수 구현 완료

**Epic 3 회고:**
- game-core에 Phaser 의존성 절대 금지
- 이벤트 기반 시스템 간 통신 권장

### Git 커밋 패턴

최근 커밋:
- `feat: 4-6 전투 피드백 (Combat Feedback)`
- `feat: 4-5 장수 OUT 처리 (General OUT Handling)`
- `feat: 4-4 병력 감소 (Troop Reduction)`

이 스토리 예상 커밋:
- `feat: 5-1 턴 종료 버튼 (Turn End Button)`

### Project Structure Notes

**신규 파일:**

```
apps/web/src/components/game/
├── TurnEndButton.tsx           # 신규: 턴 종료 버튼 컴포넌트
└── GameHUD.tsx                 # 신규: 게임 HUD 컨테이너

apps/web/src/hooks/
├── useGameScene.ts             # 신규: Phaser GameScene 연동 훅
└── useKeyboardShortcuts.ts     # 신규: 키보드 단축키 훅
```

**수정 파일:**

```
packages/game-renderer/src/scenes/
└── GameScene.ts                # 수정: executeEndTurn() 메서드 추가

apps/web/src/routes/
└── game.tsx                    # 수정: HUD 및 버튼 통합
```

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  ✅ UI 영역                              │
│  - TurnEndButton: 버튼 렌더링/이벤트     │
│  - GameHUD: HUD 레이아웃                 │
│  - useGameScene: Phaser 상태 동기화      │
│  - useKeyboardShortcuts: 키보드 입력     │
└─────────────────────────────────────────┘
                    │
                    │ executeEndTurn() 호출
                    ▼
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  ✅ 게임 연동 영역                       │
│  - GameScene.executeEndTurn(): 턴 종료   │
│  - 이벤트 발행: turn:end, turn:start    │
│  - 시각적 상태 초기화                    │
└─────────────────────────────────────────┘
                    │
                    │ endTurn() 함수 호출
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ✅ 순수 로직 영역                       │
│  - endTurn(): 턴 전환 로직 (이미 구현)   │
│  ⚠️ Phaser 의존성 절대 금지              │
└─────────────────────────────────────────┘
```

### 로컬 2인 플레이 모드 고려사항

**현재 Phase 1 (로컬 2인 대전):**
- 같은 기기에서 두 플레이어가 번갈아 플레이
- "내 턴" 개념은 현재 턴의 플레이어를 의미
- 버튼은 항상 활성화 (둘 다 같은 화면 사용)
- Phase 2 (온라인)에서 실제 "내 턴" 개념 적용

**Phase 1 MVP 접근:**
- 버튼 항상 활성화 (현재 턴 플레이어 누구든 클릭 가능)
- 또는 현재 플레이어 색상으로 버튼 강조
- 턴 전환 시 "Player 1의 턴" / "Player 2의 턴" 표시 고려 (5-2에서 구현)

### UI/UX 가이드라인

**버튼 스타일:**
- 배경: 파란색 계열 (활성화), 회색 (비활성화)
- 텍스트: 흰색, 볼드
- 모서리: 둥근 모서리 (8px 정도)
- 그림자: 약간의 드롭쉐도우로 입체감

**위치:**
- 화면 하단 우측
- 보드와 겹치지 않는 위치
- 모바일: 엄지 손가락 닿는 범위

**반응형:**
- 모바일: 44x44px 최소 크기
- 데스크톱: 더 크게 표시 가능

### 주의사항

1. **game-core 순수성 유지**
   - `endTurn()` 함수에 Phaser 코드 추가 금지
   - 이벤트 발행은 game-renderer에서만

2. **이벤트 발행 순서**
   - `turn:end` 먼저 발행 (이전 턴 종료)
   - 상태 업데이트
   - `turn:start` 발행 (새 턴 시작)

3. **시각적 상태 초기화**
   - 장수 선택 해제
   - 이동/공격 가능 타일 하이라이트 제거
   - 경로 미리보기 제거

4. **키보드 단축키 충돌**
   - Space 키는 다른 용도로 사용되지 않는지 확인
   - 모달/팝업 열려있을 때 동작하지 않도록

5. **Phase 1 vs Phase 2**
   - 로컬 모드에서는 isMyTurn 개념이 단순화
   - 온라인 모드 대비 확장 가능한 구조 설계

### 다음 스토리 연결

**Epic 5: 턴 관리**
- Story 5-2: 현재 턴 표시 (Turn Display)
- Story 5-3: 60초 타이머 (Turn Timer)
- Story 5-4: 타이머 자동 종료 (Auto End Turn)

**연결 고려:**
- 5-2에서 턴 전환 시 UI 업데이트 활용
- 5-3/5-4에서 자동 턴 종료 시 executeEndTurn() 재사용

### References

- [Source: _bmad-output/epics.md#Epic 5: 턴 관리] - Story [TURN-001] 정의
- [Source: _bmad-output/gdd.md#Action Economy] - 턴 구조 및 행동 제한
- [Source: _bmad-output/gdd.md#Turn Structure] - 1:1 교대 턴 방식
- [Source: _bmad-output/game-architecture.md#턴 관리] - 턴 관리 시스템 위치
- [Source: _bmad-output/game-architecture.md#Event System] - 이벤트 명명 규칙
- [Source: packages/game-core/src/turn/actions.ts] - endTurn() 함수 구현
- [Source: packages/game-core/src/state/types.ts] - GameState 타입 정의
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - 현재 GameScene 구현
- [Source: _bmad-output/implementation-artifacts/4-6-combat-feedback.md] - 이전 스토리 패턴

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 빌드 성공: `pnpm build` 통과
- 타입 체크: `pnpm typecheck` 통과
- 테스트: `pnpm test` - game-core 409개, game-renderer 26개 모두 통과

### Completion Notes List

- AC1: TurnEndButton.tsx 생성 - 화면 하단 우측 "턴 종료" 버튼, 최소 44x44px 터치 타겟
- AC2: 버튼 활성화/비활성화 구현 - 로컬 2인 플레이에서는 항상 활성화 (Phase 1)
- AC3: GameScene.executeEndTurn() 구현 - endTurn() 함수 호출로 턴 전환 로직 실행
- AC4: turn:end/turn:start 이벤트 발행 및 시각적 상태 초기화
- AC5: useKeyboardShortcuts 훅 구현 - Space 키로 턴 종료, 입력 필드 포커스 시 무시

### File List

**신규 파일:**
- apps/web/src/components/game/TurnEndButton.tsx
- apps/web/src/components/game/GameHUD.tsx
- apps/web/src/hooks/useKeyboardShortcuts.ts

**수정 파일:**
- packages/game-renderer/src/scenes/GameScene.ts (executeEndTurn 메서드 추가)
- apps/web/src/components/game/GameCanvas.tsx (턴 상태 관리 및 HUD 통합)

## Change Log

- 2026-02-06: Story 5.1 턴 종료 버튼 스토리 생성
- 2026-02-06: Story 5.1 구현 완료 - 턴 종료 버튼 UI, GameScene 통합, 키보드 단축키
