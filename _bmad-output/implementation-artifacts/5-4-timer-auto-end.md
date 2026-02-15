# Story 5.4: 타이머 자동 종료 (Timer Auto End)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 60초 타이머가 만료되면 자동으로 턴이 종료된다,
so that 게임이 지연 없이 진행되고 상대방의 대기 시간이 최소화된다.

## Acceptance Criteria

1. **AC1**: 타이머 만료 시 자동 턴 종료 (game-renderer)
   - 'timer:expired' 이벤트 수신 시 자동으로 endTurn() 호출
   - 수동 턴 종료 버튼과 동일한 로직 실행
   - 현재 진행 중인 행동이 있으면 취소 후 턴 종료

2. **AC2**: 자동 종료 알림 UI (apps/web)
   - 타이머 만료로 턴이 종료됨을 사용자에게 알림
   - 토스트/알림 메시지 표시: "시간 초과! 턴이 자동으로 종료되었습니다."
   - 알림은 2-3초 후 자동 사라짐

3. **AC3**: 자동 종료 이벤트 발행 (game-renderer)
   - 'turn:auto-end' 이벤트 발행 (수동 종료와 구분)
   - 이벤트에 종료된 플레이어 ID 포함
   - 후속 시스템(멀티플레이어 등)에서 활용 가능

4. **AC4**: 동시 처리 방지 (game-renderer)
   - 타이머 만료와 수동 턴 종료 버튼 동시 클릭 방지
   - 이미 턴이 종료 중이면 추가 종료 요청 무시
   - 턴 전환 중에는 타이머 일시 정지

5. **AC5**: 게임 상태 일관성 (game-core + game-renderer)
   - 자동 종료 후 게임 상태가 올바르게 전환
   - 다음 플레이어 턴 시작
   - 행동 카운터 리셋 (남은 행동이 있더라도)

6. **AC6**: 테스트 및 검증
   - 타이머 0초 도달 시 자동 종료 확인
   - 자동 종료 알림 메시지 표시 확인
   - 턴 전환 및 타이머 리셋 확인
   - 수동/자동 종료 간 충돌 없음 확인

## Tasks / Subtasks

- [x] Task 1: 'timer:expired' 이벤트 핸들러 구현 (AC: 1, 4)
  - [x] 1.1: GameScene에서 'timer:expired' 이벤트 리스너 추가
    - 이벤트 발생 시 handleTimerExpired() 메서드 호출
    - 턴 종료 진행 중 여부 확인 (isEndingTurn 플래그)
  - [x] 1.2: handleTimerExpired() 구현
    - 이미 턴 종료 중이면 무시
    - 진행 중인 행동 취소 (선택 상태 해제)
    - executeEndTurn() 호출
  - [x] 1.3: 동시 처리 방지 로직
    - isEndingTurn 플래그 추가
    - endTurn 시작 시 true, 완료 시 false
    - 타이머 만료/수동 버튼 모두에서 플래그 체크

- [x] Task 2: 'turn:auto-end' 이벤트 발행 (AC: 3)
  - [x] 2.1: 이벤트 타입 정의
    - GameEvents에 'turn:auto-end' 추가
    - 페이로드: { playerId: string; turn: number }
  - [x] 2.2: handleTimerExpired()에서 이벤트 발행
    - endTurn() 전에 'turn:auto-end' 발행
    - 수동 종료와 구분되는 별도 이벤트

- [x] Task 3: 자동 종료 알림 UI 구현 (AC: 2)
  - [x] 3.1: Toast/알림 컴포넌트 구현
    - `apps/web/src/components/game/AutoEndToast.tsx` 생성
    - 또는 기존 알림 시스템 활용
    - 메시지: "시간 초과! 턴이 자동으로 종료되었습니다."
  - [x] 3.2: 알림 스타일 정의
    - 화면 상단 또는 중앙에 표시
    - 빨간색/주황색 배경 (경고 느낌)
    - 2-3초 후 fade out
  - [x] 3.3: 'turn:auto-end' 이벤트 리스너
    - GameCanvas 또는 GameHUD에서 이벤트 수신
    - 알림 표시 상태 관리
    - 자동 사라짐 타이머

- [x] Task 4: 게임 상태 일관성 확인 (AC: 5)
  - [x] 4.1: 자동 종료 후 상태 전환 테스트
    - 현재 플레이어 전환 확인
    - actionsRemaining 리셋 확인
    - usedActionsThisTurn 초기화 확인
  - [x] 4.2: 행동 중 자동 종료 처리
    - 이동 중 타이머 만료 → 선택 해제 후 종료
    - 공격 중 타이머 만료 → 선택 해제 후 종료

- [x] Task 5: 빌드 및 검증 (AC: 6)
  - [x] 5.1: 빌드 성공 확인 (`pnpm build`)
  - [x] 5.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [x] 5.3: 기존 테스트 통과 확인 (`pnpm test`)
  - [ ] 5.4: 브라우저 수동 테스트
    - 타이머 0초 도달 시 자동 종료 확인
    - "시간 초과" 알림 표시 확인
    - 알림 2-3초 후 사라짐 확인
    - 턴 전환 및 타이머 60초 리셋 확인
    - 수동 버튼과 타이머 만료 동시 클릭 테스트

## Dev Notes

### 아키텍처 준수 사항

**packages/game-renderer (Phaser)**
- GameScene에서 'timer:expired' 이벤트 핸들러 구현
- handleTimerExpired() 메서드 추가
- isEndingTurn 플래그로 동시 처리 방지
- 'turn:auto-end' 이벤트 발행

**apps/web (React UI)**
- AutoEndToast.tsx: 자동 종료 알림 컴포넌트
- 또는 기존 Toast/Notification 시스템 활용
- 'turn:auto-end' 이벤트 리스너

**packages/game-core (순수 로직)**
- 이 스토리에서는 game-core 변경 최소화
- 타이머 로직은 5-3에서 이미 구현됨
- 필요시 이벤트 타입만 추가

### 핵심 구현 패턴

#### 1. GameScene 타이머 만료 핸들러

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (확장)

export class GameScene extends Phaser.Scene {
  private isEndingTurn: boolean = false;

  create() {
    // ... 기존 코드

    // 타이머 만료 이벤트 리스너
    gameEvents.on('timer:expired', this.handleTimerExpired.bind(this));
  }

  private handleTimerExpired() {
    // 이미 턴 종료 중이면 무시
    if (this.isEndingTurn) {
      Logger.debug('game', 'Timer expired but turn already ending');
      return;
    }

    // 진행 중인 행동 취소
    this.cancelCurrentAction();

    // 자동 종료 이벤트 발행
    gameEvents.emit('turn:auto-end', {
      playerId: this.gameState.currentPlayer,
      turn: this.gameState.turn,
    });

    // 턴 종료 실행
    this.executeEndTurn();
  }

  private cancelCurrentAction() {
    // 선택된 장수/타일 해제
    if (this.selectedGeneral) {
      this.deselectGeneral();
    }
    if (this.selectedTile) {
      this.deselectTile();
    }
    // 이동 가능 타일 하이라이트 해제
    this.boardRenderer?.clearHighlights();
  }

  // 기존 메서드 수정
  executeEndTurn() {
    if (this.isEndingTurn) return;

    this.isEndingTurn = true;

    try {
      // ... 기존 턴 종료 로직
      const result = switchTurn(this.gameState);
      if (result.success) {
        this.gameState = result.data;
        // 타이머 리셋
        this.timerState = resetTimer(this.timerState);
        this.lastTickTime = Date.now();
        // 이벤트 발행
        gameEvents.emit('turn:start', {
          turn: this.gameState.turn,
          currentPlayer: this.gameState.currentPlayer,
        });
      }
    } finally {
      this.isEndingTurn = false;
    }
  }

  destroy() {
    gameEvents.off('timer:expired', this.handleTimerExpired.bind(this));
    // ... 기존 정리 코드
  }
}
```

#### 2. 이벤트 타입 추가

```typescript
// packages/game-core/src/events/types.ts (확장)

export type GameEvents = {
  // 기존 이벤트...
  'timer:tick': { remainingTime: number };
  'timer:expired': object;

  // 신규 이벤트
  'turn:auto-end': { playerId: string; turn: number };
};
```

#### 3. 자동 종료 알림 컴포넌트

```typescript
// apps/web/src/components/game/AutoEndToast.tsx

import { useEffect, useState } from 'react';
import './AutoEndToast.css';

interface AutoEndToastProps {
  isVisible: boolean;
  onHide: () => void;
}

export function AutoEndToast({ isVisible, onHide }: AutoEndToastProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // 3초 후 자동 숨김
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // fade out 애니메이션 후 렌더링 제거
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!shouldRender) return null;

  return (
    <div className={`auto-end-toast ${isVisible ? 'visible' : 'hidden'}`}>
      <span className="toast-icon">⏰</span>
      <span className="toast-message">시간 초과! 턴이 자동으로 종료되었습니다.</span>
    </div>
  );
}
```

#### 4. 알림 스타일

```css
/* apps/web/src/components/game/AutoEndToast.css */

.auto-end-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(220, 38, 38, 0.95);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.auto-end-toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.auto-end-toast.hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-icon {
  font-size: 1.25rem;
}

.toast-message {
  font-size: 0.95rem;
}
```

#### 5. GameCanvas 통합

```typescript
// apps/web/src/components/game/GameCanvas.tsx (확장)

import { AutoEndToast } from './AutoEndToast';

export function GameCanvas() {
  // 기존 상태...
  const [showAutoEndToast, setShowAutoEndToast] = useState(false);

  useEffect(() => {
    // 기존 이벤트 리스너...

    // 자동 종료 이벤트 리스너
    const handleAutoEnd = () => {
      setShowAutoEndToast(true);
    };

    gameEvents.on('turn:auto-end', handleAutoEnd);

    return () => {
      gameEvents.off('turn:auto-end', handleAutoEnd);
      // 기존 정리...
    };
  }, []);

  return (
    <div className="game-canvas-container">
      {/* 기존 컴포넌트... */}
      <AutoEndToast
        isVisible={showAutoEndToast}
        onHide={() => setShowAutoEndToast(false)}
      />
    </div>
  );
}
```

### 이전 스토리 학습 사항

**Story 5-3 (60초 타이머):**
- 'timer:expired' 이벤트 발행 구현 완료
- GameScene의 타이머 로직: updateTimer(), timerState
- 타이머 리셋 패턴: executeEndTurn()에서 resetTimer() 호출
- 이벤트 리스너 패턴: gameEvents.on/off

**Story 5-1 (턴 종료 버튼):**
- executeEndTurn() 메서드 구조
- switchTurn() 호출 패턴
- 'turn:start' 이벤트 발행

**Story 5-2 (현재 턴 표시):**
- TurnIndicator UI 패턴
- CSS 애니메이션 (fade, transition)

### Git 최근 커밋 분석

**5-3 커밋 (1208af0):**
- GameScene에 타이머 로직 추가됨
- 'timer:tick', 'timer:expired' 이벤트 발행
- TurnTimer.tsx 생성됨
- 이 커밋 기반으로 자동 종료 핸들러 추가

**5-1 커밋 (8ed701d):**
- executeEndTurn() 패턴 정립됨
- TurnEndButton 생성됨
- 이 패턴과 동일하게 자동 종료 처리

### Project Structure Notes

**신규 파일:**

```
apps/web/src/components/game/
├── AutoEndToast.tsx                # 신규: 자동 종료 알림 컴포넌트
└── AutoEndToast.css                # 신규: 알림 스타일
```

**수정 파일:**

```
packages/game-core/src/events/
└── types.ts                        # 수정: 'turn:auto-end' 이벤트 추가

packages/game-renderer/src/scenes/
└── GameScene.ts                    # 수정: handleTimerExpired(), isEndingTurn

apps/web/src/components/game/
└── GameCanvas.tsx                  # 수정: 자동 종료 알림 통합
```

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  ✅ UI 영역                              │
│  - AutoEndToast: 자동 종료 알림          │
│  - GameCanvas: 알림 상태 관리            │
│  - 'turn:auto-end' 이벤트 리스너         │
└─────────────────────────────────────────┘
                    ▲
                    │ 'turn:auto-end' 이벤트
                    │
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  ✅ 이벤트 처리 영역                      │
│  - GameScene: handleTimerExpired()      │
│  - 'timer:expired' 이벤트 수신           │
│  - 'turn:auto-end' 이벤트 발행           │
│  - isEndingTurn 동시 처리 방지           │
└─────────────────────────────────────────┘
                    │
                    │ 타이머 상태
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ✅ 순수 로직                            │
│  - timer.ts: 이미 구현됨 (5-3)           │
│  - events/types.ts: 이벤트 타입 추가     │
└─────────────────────────────────────────┘
```

### UI/UX 가이드라인

**자동 종료 알림:**
- 위치: 화면 상단 중앙 (top: 80px)
- 색상: 빨간색 배경 (#DC2626 95% 불투명도)
- 아이콘: 시계 이모지 (⏰)
- 메시지: "시간 초과! 턴이 자동으로 종료되었습니다."
- 표시 시간: 3초
- 애니메이션: fade in/out (0.3초)

**동시 처리 방지:**
- 타이머 만료 중 수동 버튼 클릭 무시
- 수동 버튼 클릭 중 타이머 만료 무시
- 시각적 피드백으로 버튼 비활성화 (선택적)

### 주의사항

1. **이벤트 중복 방지**
   - 'timer:expired'와 수동 endTurn() 동시 호출 방지
   - isEndingTurn 플래그로 가드

2. **상태 일관성**
   - 자동 종료 후 모든 선택 상태 해제
   - 이동/공격 하이라이트 제거
   - 타이머 리셋 확인

3. **사용자 경험**
   - 알림 메시지가 방해되지 않도록 적절한 위치
   - 3초 후 자동 사라짐
   - fade out 애니메이션으로 자연스러운 전환

4. **멀티플레이어 고려 (Phase 2)**
   - 'turn:auto-end' 이벤트는 서버로 전송될 수 있음
   - 서버에서 타이머 검증 필요
   - 이 스토리에서는 클라이언트 로직만 구현

5. **행동 중 자동 종료**
   - 드래그 중 → 드래그 취소
   - 선택 상태 → 선택 해제
   - 진행 중인 애니메이션 → 즉시 완료 또는 스킵

### GDD 관련 요구사항

**턴 관리 시스템 (GDD 기반):**
- 턴당 60초 제한
- **시간 초과 시 자동 턴 종료** ← 이 스토리의 핵심
- 1:1 교대 턴 방식

**Epic 5 Story 4 (epics.md):**
- [TURN-004] 타이머 초과 시 자동으로 턴이 종료된다

### 다음 스토리 연결

**Epic 5 완료:**
- 이 스토리(5-4)가 Epic 5의 마지막 스토리
- 완료 후 Epic 5 회고(retrospective) 진행 가능

**Epic 6: 승리 조건:**
- 다음 Epic으로 진행
- 노크, 전멸, 와해, 항복 승리 조건 구현

### References

- [Source: _bmad-output/epics.md#Epic 5: 턴 관리] - Story [TURN-004] 정의
- [Source: _bmad-output/gdd.md#Action Economy] - Time Limits: 타이머 초과 시 자동 턴 종료
- [Source: _bmad-output/gdd.md#Turn Structure] - 턴당 60초 타이머
- [Source: _bmad-output/game-architecture.md#Event System] - 이벤트 명명 규칙
- [Source: _bmad-output/game-architecture.md#Error Handling] - Result 패턴
- [Source: _bmad-output/implementation-artifacts/5-3-sixty-second-timer.md] - 타이머 구현, 'timer:expired' 이벤트
- [Source: _bmad-output/implementation-artifacts/5-1-turn-end-button.md] - executeEndTurn() 패턴
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - Scene 구조
- [Source: packages/game-core/src/turn/timer.ts] - 타이머 로직

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 타입 체크 통과: `pnpm typecheck` 성공
- 빌드 성공: `pnpm build` 성공
- 테스트 통과: `pnpm test` 442 + 38 = 480 tests passed

### Completion Notes List

- **Task 1**: GameScene에 `handleTimerExpired()` 메서드와 `isEndingTurn` 플래그 추가. `timer:expired` 이벤트 리스너 등록. 동시 처리 방지를 위한 try-finally 패턴 적용.
- **Task 2**: `handleTimerExpired()`에서 `turn:auto-end` 이벤트를 `executeEndTurn()` 전에 발행. 페이로드에 playerId와 turn 포함.
- **Task 3**: `AutoEndToast.tsx`와 `AutoEndToast.css` 생성. GameCanvas에서 `turn:auto-end` 이벤트 수신 시 토스트 표시. 3초 후 자동 숨김, fade out 애니메이션 적용.
- **Task 4**: `cancelCurrentAction()` 메서드로 선택 상태 해제, 하이라이트 제거. `executeEndTurn()`에서 게임 상태 전환 및 타이머 리셋 처리.
- **Task 5**: 타입 체크, 빌드, 테스트 모두 통과.

### File List

**신규 파일:**
- apps/web/src/components/game/AutoEndToast.tsx
- apps/web/src/components/game/AutoEndToast.css

**수정 파일:**
- packages/game-renderer/src/scenes/GameScene.ts
- apps/web/src/components/game/GameCanvas.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/5-4-timer-auto-end.md

## Change Log

- 2026-02-06: Story 5-4 구현 완료 - 타이머 자동 종료 기능
  - GameScene에 handleTimerExpired() 메서드 추가
  - isEndingTurn 플래그로 동시 처리 방지
  - turn:auto-end 이벤트 발행
  - AutoEndToast 컴포넌트로 자동 종료 알림 UI 구현
  - GameCanvas에서 이벤트 리스너 및 토스트 통합

