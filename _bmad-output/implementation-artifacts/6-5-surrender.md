# Story 6.5: 항복 (Surrender)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 게임 도중 항복을 선언하여 게임을 즉시 종료할 수 있다,
so that 승산이 없는 게임을 더 이상 진행하지 않고 빠르게 다음 게임을 시작할 수 있다.

## Acceptance Criteria

1. **AC1**: 항복 실행 함수 (game-core)
   - executeSurrender(state: GameState, playerId: PlayerId): Result<ExecuteSurrenderData>
   - 항복을 선언한 플레이어가 패배, 상대 플레이어가 승리
   - 승리 결과: { winner: 상대PlayerId, reason: 'surrender' }
   - 게임 phase를 'ended'로 전환
   - 순수 함수로 구현 (불변 상태 반환)
   - 게임이 이미 종료된 상태(phase === 'ended')에서는 항복 불가 → 에러 반환
   - 게임이 아직 시작되지 않은 상태(phase === 'setup')에서는 항복 불가 → 에러 반환
   - playerId 유효성 검증 (player1 또는 player2만 허용)

2. **AC2**: 항복 버튼 UI (apps/web)
   - SurrenderButton 컴포넌트 신규 생성
   - 게임 HUD에 항복 버튼 배치 (턴 종료 버튼 위쪽 또는 상단 영역)
   - 최소 44x44px 터치 타겟 (모바일 접근성)
   - 게임 종료 상태에서는 비활성화
   - 양쪽 플레이어 모두 자신의 턴/상대 턴 상관없이 항복 가능

3. **AC3**: 항복 확인 모달 (apps/web)
   - 항복 버튼 클릭 시 확인 모달 표시
   - "정말 항복하시겠습니까?" 메시지
   - "확인" / "취소" 버튼
   - 확인 클릭 시 항복 실행
   - 취소 클릭 시 모달 닫기, 게임 계속
   - 모달 오버레이 (배경 어둡게)

4. **AC4**: GameScene 항복 처리 (game-renderer)
   - GameScene에 handleSurrender(playerId: PlayerId) 메서드 추가
   - executeSurrender() 호출 후 gameState 업데이트
   - 타이머 정지
   - 'game:end' 이벤트 발행 (winner, reason: 'surrender')
   - 기존 handleGameEnd() 로직으로 VictoryBanner 자동 표시

5. **AC5**: 승리 화면 표시 (apps/web)
   - VictoryBanner에 이미 'surrender' → '항복 승리!' 매핑됨 → 변경 불필요
   - GameCanvas의 handleGameEnd()가 reason: 'surrender'를 올바르게 전달하는지 확인

6. **AC6**: 테스트 및 검증
   - executeSurrender() 단위 테스트
     - player1 항복 → player2 승리 (reason: 'surrender')
     - player2 항복 → player1 승리 (reason: 'surrender')
     - 게임 종료 상태에서 항복 시도 → 에러 반환
     - 게임 setup 상태에서 항복 시도 → 에러 반환
     - 잘못된 playerId 시 에러 반환
   - 빌드 성공 확인 (`pnpm build`)
   - 타입 체크 통과 확인 (`pnpm typecheck`)
   - 기존 테스트 통과 확인 (`pnpm test`)

## Tasks / Subtasks

- [ ] Task 1: executeSurrender() 함수 구현 (AC: 1)
  - [ ] 1.1: packages/game-core/src/victory/surrender.ts 신규 생성
    - ExecuteSurrenderData 인터페이스 정의
    - executeSurrender(state: GameState, playerId: PlayerId): Result<ExecuteSurrenderData>
    - 유효성 검증: phase가 'playing'인지 확인
    - 유효성 검증: playerId가 'player1' 또는 'player2'인지 확인
    - 항복한 플레이어의 상대를 winner로 설정
    - phase를 'ended'로, victoryResult를 { winner, reason: 'surrender' }로 설정
  - [ ] 1.2: packages/game-core/src/victory/index.ts에 export 추가
    - executeSurrender export 추가
    - ExecuteSurrenderData type export 추가
  - [ ] 1.3: packages/game-core/src/state/types.ts에 에러 코드 추가 (필요 시)
    - 'GAME_NOT_IN_PROGRESS' 에러 코드 추가 (기존에 없는 경우)
    - 'INVALID_PLAYER' 에러 코드 추가 (기존에 없는 경우)

- [ ] Task 2: SurrenderButton 컴포넌트 생성 (AC: 2)
  - [ ] 2.1: apps/web/src/components/game/SurrenderButton.tsx 신규 생성
    - Props: onSurrender, isGameEnded
    - 항복 버튼 렌더링 (최소 44x44px)
    - 게임 종료 시 비활성화
  - [ ] 2.2: apps/web/src/components/game/SurrenderButton.css 신규 생성
    - 스타일링: 기존 TurnEndButton.css 패턴 참고
    - 항복 느낌의 시각적 구분 (빨간색/위험 색상 계열)

- [ ] Task 3: SurrenderConfirmModal 컴포넌트 생성 (AC: 3)
  - [ ] 3.1: apps/web/src/components/game/SurrenderConfirmModal.tsx 신규 생성
    - Props: isVisible, onConfirm, onCancel
    - 오버레이 + 모달 박스 구조
    - "정말 항복하시겠습니까?" 메시지
    - 확인/취소 버튼
  - [ ] 3.2: apps/web/src/components/game/SurrenderConfirmModal.css 신규 생성
    - 오버레이 스타일: VictoryBanner.css의 overlay 패턴 참고
    - 모달 박스 스타일

- [ ] Task 4: GameScene에 handleSurrender 메서드 추가 (AC: 4)
  - [ ] 4.1: packages/game-renderer/src/scenes/GameScene.ts 수정
    - import: executeSurrender 추가
    - public handleSurrender(playerId: PlayerId) 메서드 추가
    - executeSurrender() 호출 → gameState 업데이트
    - 타이머 정지, 'game:end' 이벤트 발행

- [ ] Task 5: GameCanvas에 항복 UI 통합 (AC: 2, 3, 4, 5)
  - [ ] 5.1: apps/web/src/components/game/GameCanvas.tsx 수정
    - SurrenderButton, SurrenderConfirmModal import 추가
    - 항복 확인 모달 상태 관리 (showSurrenderModal)
    - handleSurrenderClick: 모달 표시
    - handleSurrenderConfirm: GameScene.handleSurrender() 호출
    - handleSurrenderCancel: 모달 닫기
    - GameHUD에 SurrenderButton 배치
    - SurrenderConfirmModal 렌더링

- [ ] Task 6: 단위 테스트 작성 (AC: 6)
  - [ ] 6.1: packages/game-core/tests/victory/surrender.test.ts 신규 생성
    - player1 항복 → player2 승리 (reason: 'surrender', phase: 'ended')
    - player2 항복 → player1 승리 (reason: 'surrender', phase: 'ended')
    - phase === 'ended' 상태에서 항복 → 에러
    - phase === 'setup' 상태에서 항복 → 에러
    - 잘못된 playerId → 에러

- [ ] Task 7: 빌드 및 검증 (AC: 6)
  - [ ] 7.1: 빌드 성공 확인 (`pnpm build`)
  - [ ] 7.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [ ] 7.3: 기존 테스트 통과 확인 (`pnpm test`)
  - [ ] 7.4: 브라우저 수동 테스트
    - 항복 버튼 클릭 → 확인 모달 표시
    - 취소 클릭 → 모달 닫기, 게임 계속
    - 확인 클릭 → 게임 종료, "항복 승리!" 표시
    - 게임 종료 후 항복 버튼 비활성화 확인

## Dev Notes

### 아키텍처 준수 사항

**packages/game-core (순수 로직) - 핵심 작업 영역**
- victory/surrender.ts: executeSurrender() 신규
- victory/index.ts: export 추가
- state/types.ts: GameErrorCode 확장 (필요 시)
- Phaser 의존성 절대 금지 - 순수 TypeScript만

**packages/game-renderer (Phaser)**
- GameScene.ts: handleSurrender() 메서드 추가 (public)

**apps/web (React UI)**
- SurrenderButton.tsx: 항복 버튼 컴포넌트 신규
- SurrenderButton.css: 스타일 신규
- SurrenderConfirmModal.tsx: 확인 모달 컴포넌트 신규
- SurrenderConfirmModal.css: 스타일 신규
- GameCanvas.tsx: 항복 UI 통합

### 핵심 구현 패턴

#### 1. executeSurrender() 함수

```typescript
// packages/game-core/src/victory/surrender.ts

import type { PlayerId } from '../generals/types';
import type { GameState, Result, VictoryResult } from '../state/types';

/**
 * 항복 실행 결과 데이터
 */
export interface ExecuteSurrenderData {
  /** 업데이트된 게임 상태 */
  state: GameState;
  /** 승리 결과 */
  victoryResult: VictoryResult;
}

/**
 * 항복 실행
 *
 * 항복을 선언한 플레이어가 패배하고, 상대 플레이어가 승리합니다.
 * 게임 규칙 §8.2: 항복 승리 (우선순위 없음 - 즉시 종료)
 *
 * @param state - 현재 게임 상태
 * @param playerId - 항복을 선언하는 플레이어 ID
 * @returns Result<ExecuteSurrenderData>
 */
export function executeSurrender(
  state: GameState,
  playerId: PlayerId
): Result<ExecuteSurrenderData> {
  // 유효성 검증: playerId
  if (playerId !== 'player1' && playerId !== 'player2') {
    return {
      success: false,
      error: { code: 'INVALID_PLAYER', message: '유효하지 않은 플레이어입니다' },
    };
  }

  // 유효성 검증: 게임 진행 중인지 확인
  if (state.phase !== 'playing') {
    return {
      success: false,
      error: {
        code: 'GAME_NOT_IN_PROGRESS',
        message: state.phase === 'ended'
          ? '이미 종료된 게임에서는 항복할 수 없습니다'
          : '아직 시작되지 않은 게임에서는 항복할 수 없습니다',
      },
    };
  }

  // 승리자 결정 (항복한 플레이어의 상대)
  const winner: PlayerId = playerId === 'player1' ? 'player2' : 'player1';
  const victoryResult: VictoryResult = { winner, reason: 'surrender' };

  const newState: GameState = {
    ...state,
    phase: 'ended',
    victoryResult,
  };

  return {
    success: true,
    data: {
      state: newState,
      victoryResult,
    },
  };
}
```

#### 2. SurrenderButton 컴포넌트

```typescript
// apps/web/src/components/game/SurrenderButton.tsx

import { useCallback } from 'react';
import './SurrenderButton.css';

export interface SurrenderButtonProps {
  onSurrender: () => void;
  isGameEnded: boolean;
}

export function SurrenderButton({ onSurrender, isGameEnded }: SurrenderButtonProps) {
  const handleClick = useCallback(() => {
    if (!isGameEnded) {
      onSurrender();
    }
  }, [onSurrender, isGameEnded]);

  return (
    <button
      className="surrender-button"
      onClick={handleClick}
      disabled={isGameEnded}
      aria-label="항복"
    >
      항복
    </button>
  );
}
```

#### 3. SurrenderConfirmModal 컴포넌트

```typescript
// apps/web/src/components/game/SurrenderConfirmModal.tsx

import './SurrenderConfirmModal.css';

export interface SurrenderConfirmModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SurrenderConfirmModal({
  isVisible,
  onConfirm,
  onCancel,
}: SurrenderConfirmModalProps) {
  if (!isVisible) return null;

  return (
    <div
      className="surrender-modal-overlay"
      role="dialog"
      aria-label="항복 확인"
      aria-modal="true"
    >
      <div className="surrender-modal">
        <p className="surrender-modal-message">정말 항복하시겠습니까?</p>
        <div className="surrender-modal-buttons">
          <button
            className="surrender-modal-confirm"
            onClick={onConfirm}
          >
            확인
          </button>
          <button
            className="surrender-modal-cancel"
            onClick={onCancel}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 4. GameScene.handleSurrender()

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (추가)

// import 추가
import { executeSurrender } from '@ftg/game-core';

// 클래스 내부에 메서드 추가
handleSurrender(playerId: PlayerId): void {
  if (!this.gameState) return;

  const result = executeSurrender(this.gameState, playerId);

  if (result.success) {
    const { state: newState, victoryResult } = result.data;

    // 게임 상태 업데이트
    this.gameState = newState;

    // 타이머 정지
    this.timerState = { ...this.timerState, isRunning: false };

    // 게임 종료 이벤트 발행
    this.events.emit('game:end', {
      winner: victoryResult.winner,
      reason: victoryResult.reason,
    });
  }
}
```

#### 5. GameCanvas 항복 통합

```typescript
// apps/web/src/components/game/GameCanvas.tsx (수정)

// 추가 import
import { SurrenderButton } from './SurrenderButton';
import { SurrenderConfirmModal } from './SurrenderConfirmModal';

// 상태 추가
const [showSurrenderModal, setShowSurrenderModal] = useState(false);

// 핸들러 추가
const handleSurrenderClick = useCallback(() => {
  setShowSurrenderModal(true);
}, []);

const handleSurrenderConfirm = useCallback(() => {
  const scene = gameSceneRef.current;
  if (scene && gameState) {
    scene.handleSurrender(gameState.currentPlayer);
  }
  setShowSurrenderModal(false);
}, [gameState]);

const handleSurrenderCancel = useCallback(() => {
  setShowSurrenderModal(false);
}, []);

// JSX에 추가 (GameHUD 내부 또는 별도 위치)
// GameHUD의 기존 레이아웃에 SurrenderButton 추가
// SurrenderConfirmModal은 VictoryBanner와 같은 레벨에 배치
```

### 이전 스토리 학습 사항

**Story 6-4 (와해 승리) - 직전 스토리:**
- checkCollapseVictory() 패턴 → executeSurrender()도 동일하게 VictoryResult 반환
- GameScene에서 'game:end' 이벤트 발행 패턴 확립
- VictoryBanner에 'surrender' case 이미 구현됨
- 타이머 정지 패턴: `this.timerState = { ...this.timerState, isRunning: false }`

**Story 6-2 (3회 노크 승리):**
- VictoryResult, VictoryReason 타입 정의 (state/types.ts)
- VictoryBanner 컴포넌트 구현
- GameCanvas의 handleGameEnd() 패턴 확립

**Story 5-1 (턴 종료 버튼):**
- TurnEndButton 컴포넌트 패턴 → SurrenderButton 참고
- GameHUD 레이아웃 구조 (상단, 하단 좌/우 배치)
- GameScene 메서드를 GameCanvas에서 호출하는 패턴

### 항복 처리 설계 결정

**턴 제한 없는 항복:**
- 항복은 자신의 턴/상대 턴 관계없이 가능
- 로컬 2인 대전에서는 currentPlayer 기준으로 항복 실행
- Phase 2 (온라인)에서는 각 클라이언트의 playerId 기반

**확인 모달 필수:**
- 실수로 항복을 누르는 것을 방지
- 모달은 React 레이어에서 처리 (Phaser와 무관)

**VictoryBanner 재사용:**
- 'surrender' case가 이미 구현되어 있으므로 추가 작업 불필요
- getReasonText('surrender') → '항복 승리!'

### GameErrorCode 확장

기존 GameErrorCode에 없는 에러 코드 추가 필요:
- `'GAME_NOT_IN_PROGRESS'`: 게임이 진행 중이 아닐 때 (setup 또는 ended)
- `'INVALID_PLAYER'`: 유효하지 않은 playerId

```typescript
// packages/game-core/src/state/types.ts (추가)
export type GameErrorCode =
  | 'GENERAL_NOT_FOUND'
  | 'INVALID_OWNER'
  | 'GENERAL_NOT_ACTIVE'
  | 'NOT_YOUR_TURN'
  | 'NO_ACTIONS_REMAINING'
  | 'SAME_ACTION_SAME_GENERAL'
  | 'INVALID_MOVE'
  | 'CANNOT_ATTACK_ALLY'
  | 'NOT_ADJACENT'
  | 'ATTACKER_IS_OUT'
  | 'DEFENDER_IS_OUT'
  | 'NOT_IN_KNOCK_ZONE'
  | 'KNOCK_NOT_AVAILABLE'
  | 'GAME_NOT_IN_PROGRESS'   // 신규: Story 6-5
  | 'INVALID_PLAYER';         // 신규: Story 6-5
```

### SurrenderButton 배치 위치

GameHUD 레이아웃에서 항복 버튼 위치:
- **옵션 A (권장)**: 상단 영역 (TurnIndicator 옆) - 게임 컨트롤과 분리
- **옵션 B**: 하단 우측 (TurnEndButton 위) - 접근은 쉽지만 실수 클릭 위험

**권장: 상단 영역 배치**
- GameHUD의 topContent에 TurnIndicator와 함께 배치
- 또는 GameHUD에 새 슬롯 추가 (topRightContent 등)

### CSS 스타일 패턴

**SurrenderButton.css:**
- 기존 TurnEndButton.css 패턴 참고
- 위험 색상 계열 사용 (#c0392b 또는 #e74c3c)
- 호버 시 더 어두운 색상
- 비활성화 시 opacity: 0.5

**SurrenderConfirmModal.css:**
- VictoryBanner.css의 오버레이 패턴 참고
- 오버레이: rgba(0, 0, 0, 0.7)
- 모달 박스: 중앙 배치, 패딩, 라운드 코너
- z-index: VictoryBanner(200)보다 낮지만 GameHUD(100)보다 높은 값 (z-index: 150)

### Project Structure Notes

**신규 파일:**

```
packages/game-core/src/victory/
└── surrender.ts                      # 신규: 항복 실행 함수

packages/game-core/tests/victory/
└── surrender.test.ts                 # 신규: 항복 단위 테스트

apps/web/src/components/game/
├── SurrenderButton.tsx               # 신규: 항복 버튼 컴포넌트
├── SurrenderButton.css               # 신규: 항복 버튼 스타일
├── SurrenderConfirmModal.tsx          # 신규: 항복 확인 모달
└── SurrenderConfirmModal.css          # 신규: 항복 확인 모달 스타일
```

**수정 파일:**

```
packages/game-core/src/victory/
└── index.ts                          # 수정: surrender export 추가

packages/game-core/src/state/
└── types.ts                          # 수정: GameErrorCode 확장

packages/game-renderer/src/scenes/
└── GameScene.ts                      # 수정: handleSurrender() 추가, import 추가

apps/web/src/components/game/
└── GameCanvas.tsx                    # 수정: SurrenderButton, SurrenderConfirmModal 통합
```

### 아키텍처 경계

```
┌─────────────────────────────────────────────────┐
│              apps/web (React)                   │
│  - SurrenderButton: 항복 버튼 (신규)            │
│  - SurrenderConfirmModal: 확인 모달 (신규)      │
│  - GameCanvas: 항복 UI 통합 (수정)              │
│  - VictoryBanner: 'surrender' 이미 처리됨       │
└─────────────────────────────────────────────────┘
                    ▲
                    │ 'game:end' 이벤트 (reason: 'surrender')
                    │
┌─────────────────────────────────────────────────┐
│        packages/game-renderer                   │
│  - GameScene: handleSurrender() 추가            │
│  - 타이머 정지 + 'game:end' 이벤트 발행         │
└─────────────────────────────────────────────────┘
                    │
                    │ import
                    ▼
┌─────────────────────────────────────────────────┐
│          packages/game-core                     │
│  - victory/surrender.ts: executeSurrender()     │
│  - state/types.ts: GameErrorCode 확장           │
│  - Phaser 의존성 없음                           │
└─────────────────────────────────────────────────┘
```

### 주의사항

1. **확인 모달은 React 레이어에서만 처리**
   - Phaser 렌더링과 무관하게 React 컴포넌트로 구현
   - 모달이 열려 있는 동안에도 게임 상태는 그대로 유지
   - 확인 클릭 시에만 GameScene.handleSurrender() 호출

2. **currentPlayer 기반 항복 (Phase 1)**
   - 로컬 2인 대전이므로 현재 턴의 플레이어가 항복하는 것으로 처리
   - Phase 2 (온라인)에서는 각 클라이언트의 고유 playerId 사용
   - 단, 항복은 턴 제한 없이 가능하므로 currentPlayer가 아닌 별도 로직 필요 가능성
   - **Phase 1 결정**: currentPlayer 기준으로 항복 (같은 기기 사용이므로)

3. **game-core에서 PlayerId import**
   - PlayerId는 generals/types.ts에 정의됨
   - executeSurrender()에서 직접 import하여 사용
   - GameScene.ts에서도 PlayerId를 @ftg/game-core에서 import

4. **z-index 관리**
   - GameHUD: z-index 100
   - SurrenderConfirmModal: z-index 150 (GameHUD 위, VictoryBanner 아래)
   - VictoryBanner: z-index 200 (최상단)
   - 항복 확인 후 게임 종료 → VictoryBanner가 모달 위에 표시됨

5. **Epic 6 마지막 스토리**
   - 이 스토리 완료 후 Epic 6 전체가 done 상태로 전환 가능
   - Epic 6 회고(retrospective) 작성 권장

### GDD 관련 요구사항

**항복 승리 (GDD 기반):**
- [WIN-005] 플레이어는 항복을 선언할 수 있다
- 게임 규칙 §8.2: 항복 승리 (우선순위 없음 - 즉시 종료)
- GDD Victory Conditions: "항복 | 상대 항복 선언 | -"

**Epic 6 Story 5 (epics.md):**
- [WIN-005] 플레이어는 항복을 선언할 수 있다

### 다음 스토리 연결

**Epic 6 완료 후:**
- Epic 6 회고(retrospective) 작성
- Phase 1 MVP의 기본 게임 루프 완성 (Epic 1-6)
- 다음: Epic 7 (책략 시스템) 또는 Epic 8 (UI/UX)

### References

- [Source: _bmad-output/epics.md#Epic 6: 승리 조건] - Story [WIN-005] 정의
- [Source: docs/project-plan/02-game-rules.md#8.2 승리 조건 목록] - 항복 승리 조건 상세
- [Source: _bmad-output/gdd.md#Victory Conditions] - 항복: "상대 항복 선언"
- [Source: packages/game-core/src/state/types.ts] - VictoryResult, VictoryReason ('surrender' 이미 정의)
- [Source: packages/game-core/src/victory/index.ts] - 현재 victory 모듈 export
- [Source: packages/game-core/src/victory/collapse.ts] - checkCollapseVictory() 패턴 참고
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - handleKnock(), executeEndTurn() 패턴 참고
- [Source: apps/web/src/components/game/GameCanvas.tsx] - handleGameEnd(), 이벤트 리스너 패턴
- [Source: apps/web/src/components/game/VictoryBanner.tsx] - 'surrender' case 이미 구현
- [Source: apps/web/src/components/game/TurnEndButton.tsx] - 버튼 컴포넌트 패턴 참고
- [Source: apps/web/src/components/game/GameHUD.tsx] - HUD 레이아웃 구조
- [Source: _bmad-output/implementation-artifacts/6-4-collapse-victory.md] - Story 6-4 학습 사항

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2026-02-09: Story 6-5 생성 - 항복 (Surrender) 스토리 컨텍스트 작성 완료
