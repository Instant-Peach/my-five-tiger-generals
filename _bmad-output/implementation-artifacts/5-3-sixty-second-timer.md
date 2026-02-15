# Story 5.3: 60초 타이머 (Sixty Second Timer)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 턴마다 60초 타이머를 볼 수 있다,
so that 남은 시간을 인지하고 행동을 계획할 수 있다.

## Acceptance Criteria

1. **AC1**: 타이머 UI 컴포넌트 (apps/web)
   - 게임 HUD 영역에 남은 시간 표시
   - 표시 형식: "00:59", "00:30" 등 (MM:SS 또는 SS)
   - 위치: TurnIndicator 근처 또는 내부 (GameHUD 영역)
   - 텍스트 크기: 읽기 쉬운 적절한 크기 (16px 이상)

2. **AC2**: 타이머 카운트다운 로직 (game-core + game-renderer)
   - 턴 시작 시 60초부터 카운트다운 시작
   - 1초마다 감소
   - 0초 도달 시 타이머 정지 (5-4에서 자동 종료 처리)
   - game-core에서 타이머 상태 관리 (순수 로직)

3. **AC3**: 턴 전환 시 타이머 리셋
   - 'turn:start' 이벤트 수신 시 타이머를 60초로 리셋
   - 새 턴 시작과 동시에 카운트다운 재시작
   - 이전 턴 타이머 상태는 무효화

4. **AC4**: 타이머 시각적 피드백
   - 30초 이하: 주의 색상 (노란색/주황색 계열)
   - 10초 이하: 경고 색상 (빨간색 계열) + 깜빡임/펄스 효과
   - 색상 전환 시 부드러운 애니메이션

5. **AC5**: 타이머 이벤트 발행 (game-renderer)
   - 'timer:tick' 이벤트: 매초 남은 시간 전달
   - 'timer:warning' 이벤트: 30초, 10초 임계값 도달 시 (선택)
   - 'timer:expired' 이벤트: 0초 도달 시 (5-4에서 사용)

6. **AC6**: 게임 상태 연동 (apps/web)
   - useGameScene 훅 확장: remainingTime 상태 추가
   - 'timer:tick' 이벤트 리스너로 UI 업데이트
   - 초기 로드 시 60초로 표시

7. **AC7**: 테스트 및 검증
   - game-core 타이머 로직 단위 테스트
   - UI 컴포넌트 수동 테스트
   - 턴 전환 시 리셋 확인
   - 시각적 피드백 (색상 변경, 깜빡임) 확인

## Tasks / Subtasks

- [x] Task 1: game-core 타이머 로직 구현 (AC: 2, 3)
  - [x] 1.1: `packages/game-core/src/turn/timer.ts` 생성
    - TurnTimer 클래스 또는 함수형 구현
    - 상태: remainingTime, isRunning, isPaused
    - 메서드: start(), tick(), reset(), pause(), resume()
  - [x] 1.2: constants/game.ts에 타이머 상수 확인
    - TURN_TIME_LIMIT: 60 (이미 정의됨)
    - TIMER_WARNING_THRESHOLD: 30
    - TIMER_CRITICAL_THRESHOLD: 10
  - [x] 1.3: 타이머 단위 테스트 작성
    - reset() 시 60초로 초기화
    - tick() 호출 시 1초 감소
    - 0초에서 tick() 시 음수 되지 않음

- [x] Task 2: game-renderer 타이머 통합 (AC: 2, 5)
  - [x] 2.1: GameScene에 타이머 로직 추가
    - Scene update() 또는 Phaser.Timer 활용
    - 1초마다 game-core 타이머 tick() 호출
  - [x] 2.2: 타이머 이벤트 발행
    - 'timer:tick' 이벤트 (매초)
    - 'timer:expired' 이벤트 (0초 도달)
  - [x] 2.3: 턴 전환 시 타이머 리셋
    - endTurn() 호출 시 타이머 reset()
    - 'turn:start' 이벤트와 연동

- [x] Task 3: 타이머 UI 컴포넌트 구현 (AC: 1, 4)
  - [x] 3.1: `apps/web/src/components/game/TurnTimer.tsx` 생성
    - props: remainingTime, isWarning, isCritical
    - MM:SS 또는 SS 형식 표시
  - [x] 3.2: 색상 및 스타일 정의
    - 기본: 흰색/밝은 색상
    - 30초 이하 (경고): 노란색/주황색 (#F59E0B 계열)
    - 10초 이하 (위험): 빨간색 (#DC2626 계열) + 깜빡임
  - [x] 3.3: 깜빡임 애니메이션 구현
    - CSS keyframes 또는 React 애니메이션
    - 10초 이하에서만 활성화

- [x] Task 4: GameHUD 통합 (AC: 1)
  - [x] 4.1: TurnTimer를 GameHUD/TurnIndicator에 배치
    - TurnIndicator 내부에 타이머 표시
    - 또는 별도 위치에 TurnTimer 컴포넌트
  - [x] 4.2: 레이아웃 조정
    - 턴 정보와 타이머의 시각적 조화
    - 반응형 배치 (모바일/데스크톱)

- [x] Task 5: useGameScene 훅 확장 (AC: 6)
  - [x] 5.1: remainingTime 상태 추가
    - 초기값: 60
    - 'timer:tick' 이벤트로 업데이트
  - [x] 5.2: 타이머 상태 계산
    - isWarning: remainingTime <= 30
    - isCritical: remainingTime <= 10
  - [x] 5.3: GameCanvas에서 TurnTimer로 props 전달

- [x] Task 6: 빌드 및 검증 (AC: 7)
  - [x] 6.1: game-core 테스트 작성 및 통과
  - [x] 6.2: 빌드 성공 확인 (`pnpm build`)
  - [x] 6.3: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [x] 6.4: 기존 테스트 통과 확인 (`pnpm test`)
  - [ ] 6.5: 브라우저 수동 테스트
    - 게임 시작 시 60초 표시 확인
    - 1초마다 감소 확인
    - 30초 이하 색상 변경 확인
    - 10초 이하 깜빡임 확인
    - 턴 종료 후 60초 리셋 확인

## Dev Notes

### 아키텍처 준수 사항

**packages/game-core (순수 로직)**
- `src/turn/timer.ts`: 신규 타이머 로직
- `src/constants/game.ts`: 타이머 관련 상수 추가
- Phaser 의존성 없음 - 순수 TypeScript
- Phase 2 서버에서 재사용 가능

**packages/game-renderer (Phaser)**
- GameScene에서 타이머 업데이트 루프 관리
- Phaser.Time 또는 requestAnimationFrame 활용
- 'timer:tick', 'timer:expired' 이벤트 발행

**apps/web (React UI)**
- `components/game/TurnTimer.tsx`: 신규 타이머 표시 컴포넌트
- `hooks/useGameScene.ts`: remainingTime 상태 추가
- GameHUD 또는 TurnIndicator 확장

### 핵심 구현 패턴

#### 1. game-core 타이머 로직

```typescript
// packages/game-core/src/turn/timer.ts

import { GAME } from '../constants/game';

export interface TurnTimerState {
  remainingTime: number;
  isRunning: boolean;
}

export function createTurnTimerState(): TurnTimerState {
  return {
    remainingTime: GAME.TURN_TIME_LIMIT, // 60
    isRunning: false,
  };
}

export function startTimer(state: TurnTimerState): TurnTimerState {
  return { ...state, isRunning: true };
}

export function tickTimer(state: TurnTimerState): TurnTimerState {
  if (!state.isRunning || state.remainingTime <= 0) {
    return state;
  }
  return { ...state, remainingTime: state.remainingTime - 1 };
}

export function resetTimer(state: TurnTimerState): TurnTimerState {
  return {
    remainingTime: GAME.TURN_TIME_LIMIT,
    isRunning: true,
  };
}

export function isTimerExpired(state: TurnTimerState): boolean {
  return state.remainingTime <= 0;
}

export function isTimerWarning(remainingTime: number): boolean {
  return remainingTime <= 30 && remainingTime > 10;
}

export function isTimerCritical(remainingTime: number): boolean {
  return remainingTime <= 10;
}
```

#### 2. game-core 상수 추가

```typescript
// packages/game-core/src/constants/game.ts (확장)

export const GAME = {
  MAX_GENERALS: 5,
  ACTIONS_PER_TURN: 3,
  TURN_TIME_LIMIT: 60,           // 이미 정의됨
  TIMER_WARNING_THRESHOLD: 30,   // 신규
  TIMER_CRITICAL_THRESHOLD: 10,  // 신규
  KNOCK_COUNT_TO_WIN: 3,
} as const;
```

#### 3. GameScene 타이머 통합

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (확장)

import {
  createTurnTimerState,
  tickTimer,
  resetTimer,
  isTimerExpired,
  TurnTimerState
} from '@five-tiger-generals/game-core';

export class GameScene extends Phaser.Scene {
  private timerState: TurnTimerState;
  private lastTickTime: number = 0;

  create() {
    // ... 기존 코드
    this.timerState = createTurnTimerState();
    this.timerState = { ...this.timerState, isRunning: true };
    this.lastTickTime = Date.now();
  }

  update(time: number, delta: number) {
    // 1초마다 타이머 tick
    const now = Date.now();
    if (now - this.lastTickTime >= 1000) {
      this.lastTickTime = now;
      this.updateTimer();
    }
  }

  private updateTimer() {
    if (!this.timerState.isRunning) return;

    this.timerState = tickTimer(this.timerState);

    // 이벤트 발행
    gameEvents.emit('timer:tick', {
      remainingTime: this.timerState.remainingTime
    });

    // 만료 체크
    if (isTimerExpired(this.timerState)) {
      gameEvents.emit('timer:expired', {});
      this.timerState = { ...this.timerState, isRunning: false };
    }
  }

  // endTurn 시 타이머 리셋
  private handleEndTurn() {
    // ... 기존 턴 종료 로직
    this.timerState = resetTimer(this.timerState);
    this.lastTickTime = Date.now();
  }
}
```

#### 4. 타이머 UI 컴포넌트

```typescript
// apps/web/src/components/game/TurnTimer.tsx

import { useMemo } from 'react';
import './TurnTimer.css';

interface TurnTimerProps {
  remainingTime: number;
}

export function TurnTimer({ remainingTime }: TurnTimerProps) {
  const isWarning = remainingTime <= 30 && remainingTime > 10;
  const isCritical = remainingTime <= 10;

  const timerClass = useMemo(() => {
    if (isCritical) return 'timer-critical';
    if (isWarning) return 'timer-warning';
    return 'timer-normal';
  }, [isWarning, isCritical]);

  const formattedTime = useMemo(() => {
    const seconds = Math.max(0, remainingTime);
    return seconds.toString().padStart(2, '0');
  }, [remainingTime]);

  return (
    <div className={`turn-timer ${timerClass}`}>
      <span className="timer-value">{formattedTime}</span>
      <span className="timer-label">초</span>
    </div>
  );
}
```

#### 5. 타이머 스타일

```css
/* apps/web/src/components/game/TurnTimer.css */

.turn-timer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.timer-value {
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
}

.timer-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* 기본 상태 */
.timer-normal {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 경고 상태 (30초 이하) */
.timer-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #F59E0B;
}

/* 위험 상태 (10초 이하) - 깜빡임 */
.timer-critical {
  background: rgba(220, 38, 38, 0.2);
  color: #DC2626;
  animation: timer-blink 0.5s ease-in-out infinite;
}

@keyframes timer-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

#### 6. useGameScene 확장

```typescript
// apps/web/src/hooks/useGameScene.ts (확장)

interface GameSceneState {
  // 기존 상태
  currentPlayer: 'player1' | 'player2';
  turn: number;
  // 신규 상태
  remainingTime: number;
}

export function useGameScene() {
  const [state, setState] = useState<GameSceneState>({
    currentPlayer: 'player1',
    turn: 1,
    remainingTime: 60, // 신규
  });

  useEffect(() => {
    // 기존 이벤트 리스너...

    // 타이머 이벤트 리스너
    const handleTimerTick = (data: { remainingTime: number }) => {
      setState(prev => ({ ...prev, remainingTime: data.remainingTime }));
    };

    gameEvents.on('timer:tick', handleTimerTick);

    return () => {
      gameEvents.off('timer:tick', handleTimerTick);
    };
  }, []);

  return state;
}
```

#### 7. TurnIndicator 확장 (타이머 통합)

```typescript
// apps/web/src/components/game/TurnIndicator.tsx (수정)

import { TurnTimer } from './TurnTimer';

interface TurnIndicatorProps {
  currentPlayer: 'player1' | 'player2';
  turn: number;
  remainingTime: number; // 신규
}

export function TurnIndicator({ currentPlayer, turn, remainingTime }: TurnIndicatorProps) {
  // ... 기존 코드

  return (
    <div className={`turn-indicator ${playerColor}`}>
      <div className="turn-info">
        <div className="text-sm opacity-80">턴 {turn}</div>
        <div className="text-lg">{playerName}의 턴</div>
      </div>
      <TurnTimer remainingTime={remainingTime} />
    </div>
  );
}
```

### 이전 스토리 학습 사항

**Story 5-1 (턴 종료 버튼):**
- GameScene에서 endTurn() 호출 패턴
- useGameScene 훅 구조
- 'turn:start' 이벤트 패턴

**Story 5-2 (현재 턴 표시):**
- TurnIndicator 컴포넌트 구조 - 여기에 타이머 추가
- GameHUD 레이아웃 - 타이머 위치 고려
- 색상 전환 애니메이션 패턴 - 타이머 색상 변경에 재사용
- CSS keyframes 패턴 - 깜빡임 애니메이션에 재사용

**Epic 4 (전투 시스템):**
- game-core 순수 로직 패턴
- 이벤트 기반 통신

### Git 최근 커밋 분석

**5-2 커밋 (da94c5c):**
- TurnIndicator.tsx, TurnIndicator.css 생성됨
- GameHUD.tsx 수정됨
- GameCanvas.tsx 수정됨
- 이 파일들을 확장하여 타이머 통합

**5-1 커밋 (8ed701d):**
- TurnEndButton 생성됨
- GameScene에서 턴 종료 로직 구현됨
- 이 패턴을 따라 타이머 로직 추가

### Project Structure Notes

**신규 파일:**

```
packages/game-core/src/turn/
└── timer.ts                     # 신규: 타이머 순수 로직

packages/game-core/src/turn/
└── timer.test.ts                # 신규: 타이머 단위 테스트

apps/web/src/components/game/
├── TurnTimer.tsx                # 신규: 타이머 UI 컴포넌트
└── TurnTimer.css                # 신규: 타이머 스타일
```

**수정 파일:**

```
packages/game-core/src/constants/
└── game.ts                      # 수정: 타이머 상수 추가

packages/game-core/src/
└── index.ts                     # 수정: 타이머 export

packages/game-core/src/events/
└── types.ts                     # 수정: 타이머 이벤트 타입

packages/game-renderer/src/scenes/
└── GameScene.ts                 # 수정: 타이머 업데이트 루프

apps/web/src/components/game/
├── TurnIndicator.tsx            # 수정: 타이머 통합
└── GameCanvas.tsx               # 수정: remainingTime props
```

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  ✅ UI 영역                              │
│  - TurnTimer: 남은 시간 렌더링           │
│  - TurnIndicator: 타이머 통합            │
│  - useGameScene: remainingTime 추가      │
└─────────────────────────────────────────┘
                    ▲
                    │ 'timer:tick', 'timer:expired' 이벤트
                    │
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  ✅ 타이머 업데이트 루프                  │
│  - GameScene: 1초마다 tick() 호출        │
│  - Phaser.Time 또는 update() 활용        │
│  - 이벤트 발행                           │
└─────────────────────────────────────────┘
                    │
                    │ 타이머 로직 호출
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ✅ 순수 로직                            │
│  - turn/timer.ts: 타이머 상태 관리       │
│  - tickTimer(), resetTimer()            │
│  - isTimerExpired(), isTimerWarning()   │
└─────────────────────────────────────────┘
```

### UI/UX 가이드라인

**타이머 표시 스타일:**
- 기본 (60-31초): 흰색/밝은 색
- 경고 (30-11초): 노란색/주황색 (#F59E0B)
- 위험 (10-0초): 빨간색 (#DC2626) + 깜빡임

**위치:**
- TurnIndicator 내부 또는 옆에 배치
- 턴 정보와 시각적으로 연결
- 모바일/데스크톱 동일 위치

**형식:**
- 초 단위 표시 (예: "45")
- 또는 MM:SS 형식 (예: "00:45")
- 폰트: tabular-nums로 숫자 폭 고정

**애니메이션:**
- 색상 전환: transition 0.3s
- 깜빡임: 0.5초 주기 (10초 이하)

### 주의사항

1. **game-core 순수성 유지**
   - 타이머 로직은 Phaser 의존성 없이 순수 함수로 구현
   - Phase 2 서버에서 동일 로직 재사용 가능해야 함

2. **1초 정확도**
   - Phaser Scene update()는 프레임 기반이므로 시간 누적 계산 필요
   - setInterval보다는 Phaser.Time 또는 Date.now() 기반 추천

3. **턴 전환 시 타이머 리셋**
   - endTurn() 호출 시 반드시 타이머 리셋
   - 새 턴 시작 이벤트('turn:start')와 동기화

4. **0초 도달 처리**
   - 이 스토리에서는 타이머만 표시/정지
   - 자동 턴 종료는 5-4에서 구현
   - 'timer:expired' 이벤트 발행만 수행

5. **성능 고려**
   - 매초 이벤트 발행이 UI 성능에 영향 없어야 함
   - React 불필요한 리렌더링 방지 (useMemo 활용)

### GDD 관련 요구사항

**턴 관리 시스템 (GDD 기반):**
- 턴당 60초 제한 (TURN_TIME_LIMIT: 60)
- 시간 초과 시 자동 턴 종료 (5-4에서 구현)
- 1:1 교대 턴 방식

**Technical Requirements (GDD 기반):**
- 60fps 유지 - 타이머 업데이트가 프레임레이트에 영향 없어야 함
- 네트워크 지연 100ms 이하 (Phase 2) - 타이머 동기화 고려

### 다음 스토리 연결

**Epic 5: 턴 관리**
- Story 5-4: 타이머 자동 종료 (Timer Auto End)
  - 'timer:expired' 이벤트 수신 시 자동 endTurn() 호출
  - 사용자에게 알림 표시

**연결 고려:**
- 'timer:expired' 이벤트는 5-4에서 활용
- 타이머 상태는 GameState에 포함될 수 있음 (Phase 2 동기화 고려)

### References

- [Source: _bmad-output/epics.md#Epic 5: 턴 관리] - Story [TURN-003] 정의
- [Source: _bmad-output/gdd.md#Turn Structure] - 턴당 60초 타이머
- [Source: _bmad-output/gdd.md#Action Economy] - Time Limits 정의
- [Source: _bmad-output/game-architecture.md#턴 관리] - 턴 관리 시스템 위치
- [Source: _bmad-output/game-architecture.md#Event System] - 이벤트 명명 규칙
- [Source: _bmad-output/game-architecture.md#Constants] - TURN_TIME_LIMIT: 60
- [Source: _bmad-output/implementation-artifacts/5-1-turn-end-button.md] - 턴 종료 패턴
- [Source: _bmad-output/implementation-artifacts/5-2-current-turn-display.md] - TurnIndicator 구조
- [Source: packages/game-core/src/constants/game.ts] - 게임 상수
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - Scene 구조

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 타이머 테스트 33개 통과
- 전체 테스트 442개 통과 (기존 409개 + 신규 33개)
- 빌드 및 타입체크 성공

### Completion Notes List

1. **Task 1 완료**: game-core 타이머 로직 구현
   - `packages/game-core/src/turn/timer.ts` 생성 (순수 함수형 구현)
   - `packages/game-core/src/constants/game.ts`에 TIMER_WARNING_THRESHOLD, TIMER_CRITICAL_THRESHOLD 상수 추가
   - `packages/game-core/tests/timer.test.ts` 33개 테스트 케이스 작성

2. **Task 2 완료**: game-renderer 타이머 통합
   - GameScene에 timerState, lastTickTime 속성 추가
   - update()에서 1초마다 타이머 tick 실행
   - 'timer:tick', 'timer:expired' 이벤트 발행
   - executeEndTurn()에서 타이머 리셋

3. **Task 3 완료**: 타이머 UI 컴포넌트 구현
   - `apps/web/src/components/game/TurnTimer.tsx` 생성
   - `apps/web/src/components/game/TurnTimer.css` 생성
   - 30초 이하 경고(노란색), 10초 이하 위험(빨간색+깜빡임) 구현

4. **Task 4 완료**: GameHUD 통합
   - TurnIndicator에 TurnTimer 컴포넌트 통합
   - remainingTime props 추가

5. **Task 5 완료**: GameCanvas 훅 확장
   - turnState에 remainingTime 상태 추가 (초기값 60)
   - 'timer:tick' 이벤트 리스너로 UI 업데이트
   - 턴 전환 시 타이머 60초 리셋

6. **Task 6 완료**: 빌드 및 검증
   - 모든 테스트 통과 (442개)
   - 빌드 성공
   - 타입체크 통과

### File List

**신규 파일:**
- packages/game-core/src/turn/timer.ts
- packages/game-core/tests/timer.test.ts
- apps/web/src/components/game/TurnTimer.tsx
- apps/web/src/components/game/TurnTimer.css

**수정 파일:**
- packages/game-core/src/constants/game.ts
- packages/game-core/src/turn/index.ts
- packages/game-renderer/src/scenes/GameScene.ts
- apps/web/src/components/game/TurnIndicator.tsx
- apps/web/src/components/game/TurnIndicator.css
- apps/web/src/components/game/GameCanvas.tsx

## Change Log

- 2026-02-06: Story 5-3 구현 완료 - 60초 타이머 (Claude Opus 4.5)
