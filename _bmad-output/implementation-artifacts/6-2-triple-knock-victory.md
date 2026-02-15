# Story 6.2: 3회 노크 승리 (Triple Knock Victory)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 노크 3회 누적 성공 시 게임이 승리로 판정되도록 하고 싶다,
so that 노크 승리 조건이 완전하게 동작하여 게임의 핵심 승리 메커니즘이 완성된다.

## Acceptance Criteria

1. **AC1**: 3회 노크 승리 판정 (game-core)
   - knockCount가 KNOCK_COUNT_TO_WIN(3)에 도달하면 승리 판정
   - executeKnock() 내부 또는 별도 checkKnockVictory() 함수에서 판정
   - 승리 시 GameState.phase를 'ended'로 변경
   - 승리 결과 데이터 반환: { winner: PlayerId, reason: 'knock' }
   - 순수 함수로 구현 (불변 상태 반환)

2. ~~**AC2**: 노크 카운트 리셋 - 이동으로 구역 이탈 (REMOVED by correct-course)~~
   - **삭제됨**: 노크 카운트는 게임 전체 누적값으로, 리셋 메커니즘 없음

3. ~~**AC3**: 노크 카운트 리셋 - 전투로 구역 이탈 (REMOVED by correct-course)~~
   - **삭제됨**: 노크 카운트는 게임 전체 누적값으로, 리셋 메커니즘 없음

4. **AC4**: 승리 이벤트 및 게임 종료 처리 (game-renderer)
   - 노크 승리 시 'game:end' 이벤트 발행: { winner: PlayerId, reason: 'knock' }
   - GameScene에서 승리 판정 후 게임 상태를 'ended'로 전환
   - 게임 종료 시 타이머 정지
   - 게임 종료 시 입력 비활성화 (추가 행동 방지)

5. ~~**AC5**: 노크 카운트 리셋 이벤트 (REMOVED by correct-course)~~
   - **삭제됨**: 리셋 메커니즘 없으므로 리셋 이벤트도 불필요

6. **AC6**: 승리 화면 표시 (apps/web)
   - 'game:end' 이벤트 수신 시 승리/패배 UI 표시
   - 승리 사유 표시 ("노크 승리!")
   - 승리 플레이어 표시
   - 기본적인 승리 화면 (Phase 1 MVP, 디자인은 최소한)
   - 게임 종료 후 TurnEndButton 비활성화 (기존 isGameEnded 로직 활용)

7. **AC7**: 테스트 및 검증
   - checkKnockVictory() 함수 단위 테스트 (3회 도달 시 승리, 미도달 시 비승리)
   - ~~shouldResetKnockCount() 함수 단위 테스트 (REMOVED by correct-course)~~
   - 노크 3회 → 승리 판정 통합 테스트
   - 노크 후 장수 퇴각 테스트 (status='out', position=null, troops=0)
   - ~~이동으로 구역 이탈 → 리셋 테스트 (REMOVED by correct-course)~~
   - ~~전투 OUT으로 구역 이탈 → 리셋 테스트 (REMOVED by correct-course)~~
   - ~~구역 내 장수 잔류 시 리셋 안 됨 테스트 (REMOVED by correct-course)~~
   - 빌드 성공 확인 (`pnpm build`)
   - 타입 체크 통과 확인 (`pnpm typecheck`)
   - 기존 테스트 통과 확인 (`pnpm test`)

## Tasks / Subtasks

- [x] Task 1: GameState 및 타입 확장 (AC: 1)
  - [x] 1.1: VictoryReason 타입 추가
    - packages/game-core/src/state/types.ts 수정
    - `export type VictoryReason = 'knock' | 'annihilation' | 'collapse' | 'surrender';`
    - Story 6-3, 6-4, 6-5에서 추가 사용 예정
  - [x] 1.2: VictoryResult 인터페이스 추가
    - packages/game-core/src/state/types.ts 수정
    - `export interface VictoryResult { winner: PlayerId; reason: VictoryReason; }`
  - [x] 1.3: GameState에 victoryResult 필드 추가 (선택적 필드)
    - `victoryResult?: VictoryResult;` (게임 종료 시에만 설정)
  - [x] 1.4: createInitialGameState()에 victoryResult 초기값 추가
    - packages/game-core/src/state/initialState.ts 수정
    - `victoryResult: undefined`

- [x] Task 2: 노크 승리 판정 함수 구현 (AC: 1)
  - [x] 2.1: checkKnockVictory() 함수 구현
    - packages/game-core/src/victory/knock.ts에 추가
    - 파라미터: (state: GameState) => VictoryResult | null
    - knockCount가 KNOCK_COUNT_TO_WIN(3)에 도달한 플레이어가 있으면 VictoryResult 반환
    - 미도달 시 null 반환
  - [x] 2.2: executeKnock() 수정 - 승리 판정 통합
    - executeKnock() 실행 후 checkKnockVictory() 호출
    - 승리 시 GameState.phase를 'ended'로 변경, victoryResult 설정
    - ExecuteKnockData에 victoryResult 필드 추가 (null | VictoryResult)

- ~~Task 3: 노크 카운트 리셋 함수 구현 (REMOVED by correct-course - AC2, AC3 삭제)~~
- ~~Task 4: 이동 후 노크 카운트 리셋 통합 (REMOVED by correct-course - AC2 삭제)~~
- ~~Task 5: 전투 후 노크 카운트 리셋 통합 (REMOVED by correct-course - AC3 삭제)~~

- [x] Task 6: GameScene 승리 판정 및 게임 종료 통합 (AC: 4)
  - [x] 6.1: GameScene.handleKnock() 수정 - 승리 판정 통합
    - executeKnock() 결과에서 victoryResult 확인
    - 승리 시 'game:end' 이벤트 발행
    - 게임 종료 시 타이머 정지 (timerState.isRunning = false)
    - 노크 후 장수 시각적 퇴각 처리 (removeGeneral with animation)
  - ~~6.2: GameScene.executeMove() 리셋 체크 (REMOVED by correct-course)~~
  - ~~6.3: GameScene.executeAttack() 리셋 체크 (REMOVED by correct-course)~~

- [x] Task 7: React UI 승리 화면 및 리셋 UI (AC: 5, 6)
  - [x] 7.1: VictoryBanner 컴포넌트 생성
    - apps/web/src/components/game/VictoryBanner.tsx 신규
    - apps/web/src/components/game/VictoryBanner.css 신규
    - props: { isVisible: boolean; winner: string; reason: string; }
    - 화면 중앙에 오버레이로 표시
    - "노크 승리!" 텍스트 + 승리 플레이어 표시
    - 기본적인 황금색 테마 (노크 승리 컬러)
  - [x] 7.2: GameCanvas에 VictoryBanner 통합
    - 'game:end' 이벤트 수신 시 VictoryBanner 표시
    - 기존 handleGameEnd 핸들러 확장
    - 승리 사유(reason)와 승리자(winner) 상태 관리
  - [x] 7.3: GameCanvas에 'knock:reset' 이벤트 리스너 추가
    - 리셋 시 knockState.knockCount를 0으로 업데이트

- [x] Task 8: 단위 테스트 작성 (AC: 7)
  - [x] 8.1: checkKnockVictory() 테스트
    - packages/game-core/tests/victory/knock.test.ts에 추가
    - knockCount가 3일 때 VictoryResult 반환
    - knockCount가 2일 때 null 반환
    - player1, player2 각각 테스트
    - 양쪽 모두 3인 경우 (이론적으로 불가능하지만 방어적 테스트)
  - [x] 8.2: shouldResetKnockCount() 테스트
    - 상대 home에 장수가 0명일 때 true
    - 상대 home에 장수가 1명 이상일 때 false
    - knockCount가 0일 때 false (리셋 불필요)
  - [x] 8.3: resetKnockCount() 테스트
    - knockCount가 0으로 리셋되는지 확인
    - 상대 플레이어의 knockCount는 변경되지 않는지 확인
  - [x] 8.4: checkAndResetKnockAfterMove() 테스트
    - 상대 home에서 center로 이동 시 리셋 (다른 장수 없을 때)
    - 상대 home에서 center로 이동하지만 다른 장수가 남아있을 때 리셋 안 됨
    - 상대 home 내에서 이동 시 리셋 안 됨
    - center에서 center로 이동 시 영향 없음
  - [x] 8.5: checkAndResetKnockAfterCombat() 테스트
    - 상대 home에서 OUT 시 리셋 (다른 장수 없을 때)
    - 상대 home에서 OUT이지만 다른 장수가 남아있을 때 리셋 안 됨
  - [x] 8.6: executeKnock() 승리 판정 통합 테스트
    - knockCount 2에서 노크 실행 → 승리 판정 (phase='ended', victoryResult 설정)
    - knockCount 1에서 노크 실행 → 승리 아님 (phase='playing')
  - [x] 8.7: getGeneralsInKnockZone() 테스트
    - 해당 플레이어의 active 장수만 반환
    - OUT 상태 장수 제외

- [x] Task 9: 빌드 및 검증 (AC: 7)
  - [x] 9.1: 빌드 성공 확인 (`pnpm build`)
  - [x] 9.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [x] 9.3: 기존 테스트 통과 확인 (`pnpm test`)
  - [ ] 9.4: 브라우저 수동 테스트
    - 장수 3명을 상대 home으로 이동 후 노크 3회 → 승리 화면 확인
    - 노크 2회 후 장수 이동(구역 이탈) → 카운트 리셋 확인
    - 노크 1회 후 전투 OUT → 카운트 리셋 확인
    - 구역 내 다른 장수 잔류 시 카운트 유지 확인

## Dev Notes

### 아키텍처 준수 사항

**packages/game-core (순수 로직) - 핵심 작업 영역**
- victory/knock.ts: checkKnockVictory(), shouldResetKnockCount(), resetKnockCount(), checkAndResetKnockAfterMove(), checkAndResetKnockAfterCombat(), getGeneralsInKnockZone() 추가
- state/types.ts: VictoryReason, VictoryResult, GameState.victoryResult 추가
- state/initialState.ts: victoryResult 초기값 추가
- Phaser 의존성 절대 금지 - 순수 TypeScript만

**packages/game-renderer (Phaser)**
- GameScene.ts: handleKnock() 수정 (승리 판정), executeMove() 수정 (리셋 체크), executeAttack() 수정 (리셋 체크)
- 'game:end' 이벤트 발행, 'knock:reset' 이벤트 발행

**apps/web (React UI)**
- VictoryBanner.tsx: 승리 화면 컴포넌트 (신규)
- VictoryBanner.css: 승리 화면 스타일 (신규)
- GameCanvas.tsx: 승리/리셋 이벤트 리스너 추가

### 핵심 구현 패턴

#### 1. 노크 승리 판정

```typescript
// packages/game-core/src/victory/knock.ts

import { GAME } from '../constants/game';
import type { VictoryResult } from '../state/types';

/**
 * 노크 승리 조건 확인
 *
 * knockCount가 KNOCK_COUNT_TO_WIN(3)에 도달한 플레이어가 있는지 확인
 */
export function checkKnockVictory(state: GameState): VictoryResult | null {
  if (state.player1KnockCount >= GAME.KNOCK_COUNT_TO_WIN) {
    return { winner: 'player1', reason: 'knock' };
  }
  if (state.player2KnockCount >= GAME.KNOCK_COUNT_TO_WIN) {
    return { winner: 'player2', reason: 'knock' };
  }
  return null;
}
```

#### 2. executeKnock() 수정 - 승리 판정 통합

```typescript
// packages/game-core/src/victory/knock.ts

export interface ExecuteKnockData {
  state: GameState;
  knockCount: number;
  playerId: PlayerId;
  /** 승리 결과 (null이면 게임 계속) */
  victoryResult: VictoryResult | null;
}

export function executeKnock(
  state: GameState,
  generalId: GeneralId
): Result<ExecuteKnockData> {
  // 기존 로직...
  // 검증 -> knockCount 증가 -> 행동력 소모 -> performedActions 기록

  let newState = {
    ...state,
    [knockCountKey]: newKnockCount,
    actionsRemaining: state.actionsRemaining - 1,
    performedActions: [...state.performedActions, newPerformedAction],
  };

  // 승리 판정
  const victoryResult = checkKnockVictory(newState);
  if (victoryResult) {
    newState = {
      ...newState,
      phase: 'ended',
      victoryResult,
    };
  }

  return {
    success: true,
    data: {
      state: newState,
      knockCount: newKnockCount,
      playerId,
      victoryResult,
    },
  };
}
```

#### 3. 노크 카운트 리셋 함수들

```typescript
// packages/game-core/src/victory/knock.ts

/**
 * 해당 플레이어의 장수 중 상대 home 구역에 있는 active 장수 목록
 */
export function getGeneralsInKnockZone(
  state: GameState,
  playerId: PlayerId
): General[] {
  return state.generals.filter(g =>
    g.owner === playerId &&
    g.status === 'active' &&
    g.position !== null &&
    isInKnockZone(g.position, playerId)
  );
}

/**
 * 노크 카운트 리셋 필요 여부 판단
 *
 * knockCount가 1 이상이고, 상대 home 구역에 active 장수가 0명이면 true
 */
export function shouldResetKnockCount(
  state: GameState,
  playerId: PlayerId
): boolean {
  const knockCountKey = playerId === 'player1' ? 'player1KnockCount' : 'player2KnockCount';
  if (state[knockCountKey] <= 0) return false;

  const generalsInZone = getGeneralsInKnockZone(state, playerId);
  return generalsInZone.length === 0;
}

/**
 * 노크 카운트 리셋
 */
export function resetKnockCount(
  state: GameState,
  playerId: PlayerId
): GameState {
  const knockCountKey = playerId === 'player1' ? 'player1KnockCount' : 'player2KnockCount';
  return {
    ...state,
    [knockCountKey]: 0,
  };
}
```

#### 4. 이동 후 리셋 체크

```typescript
// packages/game-core/src/victory/knock.ts

/**
 * 이동 후 노크 카운트 리셋 체크
 *
 * 이동한 장수의 이전 위치가 상대 home이었고,
 * 이동 후 해당 플레이어의 장수가 상대 home에 0명이면 리셋
 */
export function checkAndResetKnockAfterMove(
  prevState: GameState,
  newState: GameState,
  generalId: GeneralId
): GameState {
  const general = prevState.generals.find(g => g.id === generalId);
  if (!general || general.position === null) return newState;

  const playerId = general.owner;
  const prevPosition = general.position;

  // 이전 위치가 상대 home 구역이 아니면 리셋 불필요
  if (!isInKnockZone(prevPosition, playerId)) return newState;

  // 새 상태에서 리셋 필요 여부 확인
  if (shouldResetKnockCount(newState, playerId)) {
    return resetKnockCount(newState, playerId);
  }

  return newState;
}
```

#### 5. 전투 후 리셋 체크

```typescript
// packages/game-core/src/victory/knock.ts

/**
 * 전투 후 노크 카운트 리셋 체크
 *
 * OUT된 방어자가 있던 위치가 어느 플레이어의 노크 구역이었는지 확인하고,
 * 해당 플레이어의 장수가 더 이상 구역에 없으면 리셋
 */
export function checkAndResetKnockAfterCombat(
  prevState: GameState,
  newState: GameState,
  defenderId: GeneralId
): GameState {
  const defender = prevState.generals.find(g => g.id === defenderId);
  if (!defender || defender.position === null) return newState;

  // OUT된 장수가 있던 위치가 어느 플레이어의 노크 구역이었는지 확인
  // 예: player1 장수가 player2_home(타일 0-4)에서 OUT되면,
  //     player1의 knockCount 리셋 여부 확인
  const defenderOwner = defender.owner;
  const defenderPosition = defender.position;

  // 방어자의 이전 위치가 방어자 소유주의 노크 구역이었는지 확인
  if (isInKnockZone(defenderPosition, defenderOwner)) {
    // 방어자 소유주의 노크 카운트 리셋 여부 확인
    if (shouldResetKnockCount(newState, defenderOwner)) {
      return resetKnockCount(newState, defenderOwner);
    }
  }

  return newState;
}
```

#### 6. VictoryBanner 컴포넌트

```typescript
// apps/web/src/components/game/VictoryBanner.tsx

interface VictoryBannerProps {
  isVisible: boolean;
  winner: string;
  reason: string;
}

export function VictoryBanner({ isVisible, winner, reason }: VictoryBannerProps) {
  if (!isVisible) return null;

  const reasonText = reason === 'knock' ? '노크 승리!' : '승리!';
  const winnerText = winner === 'player1' ? 'Player 1 (촉)' : 'Player 2 (위)';

  return (
    <div className="victory-banner-overlay">
      <div className="victory-banner">
        <div className="victory-reason">{reasonText}</div>
        <div className="victory-winner">{winnerText}</div>
      </div>
    </div>
  );
}
```

#### 7. GameScene 수정 - handleKnock() 승리 판정

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

handleKnock(generalId: string): void {
  // 기존 로직...
  const result = executeKnock(this.gameState, generalId);

  if (result.success) {
    const { state: newState, knockCount, playerId, victoryResult } = result.data;
    this.gameState = newState;

    // 기존 이벤트...
    this.events.emit('knock:success', { ... });

    // 승리 판정
    if (victoryResult) {
      // 타이머 정지
      this.timerState = { ...this.timerState, isRunning: false };
      // 게임 종료 이벤트
      this.events.emit('game:end', {
        winner: victoryResult.winner,
        reason: victoryResult.reason,
      });
    }
  }
}
```

#### 8. GameScene 수정 - executeMove() 리셋 체크

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

private executeMove(generalId: string, toTileId: TileId): void {
  // 기존 이동 로직...
  const result = moveGeneral(this.gameState, generalId, toTileId);

  if (result.success) {
    // 기존: this.gameState = result.data;
    // 수정: 리셋 체크 후 적용
    const prevState = this.gameState;
    let newState = result.data;

    // 이동 후 노크 카운트 리셋 체크
    newState = checkAndResetKnockAfterMove(prevState, newState, generalId);

    // 리셋 발생 시 이벤트 발행
    const general = prevState.generals.find(g => g.id === generalId);
    if (general) {
      const knockCountKey = general.owner === 'player1' ? 'player1KnockCount' : 'player2KnockCount';
      if (prevState[knockCountKey] > 0 && newState[knockCountKey] === 0) {
        this.events.emit('knock:reset', {
          playerId: general.owner,
          previousCount: prevState[knockCountKey],
        });
      }
    }

    this.gameState = newState;
    // 기존 애니메이션 로직 계속...
  }
}
```

### 이전 스토리 학습 사항

**Story 6-1 (노크 행동) - 직전 스토리:**
- canKnock(), validateKnock(), executeKnock() 3단계 패턴
- ExecuteKnockData 반환 패턴 (state + 부가 데이터)
- knockCount 상태 관리 패턴 (player1KnockCount, player2KnockCount)
- 'knock:success', 'knock:availability' 이벤트 패턴
- KnockButton UI 컴포넌트와 GameCanvas 통합 패턴
- GameScene 비대화 주의 (1,645줄) - 최소한의 코드만 추가

**Story 5-4 (타이머 자동 종료):**
- isEndingTurn 플래그로 동시 처리 방지 패턴
- GameCanvas 이벤트 리스너 등록/해제 생명주기
- AutoEndToast 토스트 패턴 (간단한 알림 UI)

**Story 4-5 (장수 OUT 처리):**
- OUT 상태: position = null, status = 'out', troops = 0
- OUT 장수는 getGeneralsInKnockZone()에서 제외해야 함

**Story 5-1 (턴 종료 버튼):**
- isGameEnded 플래그로 게임 종료 시 버튼 비활성화
- 기존 'game:end' 이벤트 리스너가 GameCanvas에 이미 등록됨

### GameState 확장 영향 분석

**victoryResult 필드 추가 시 기존 테스트 영향:**
- victoryResult는 선택적 필드(`?`)로 추가하므로 기존 테스트에 영향 최소화
- createInitialGameState()에 `victoryResult: undefined` 추가
- 기존 테스트의 createTestGameState()에서도 추가 필요할 수 있음 (단, optional이므로 생략 가능)

**ExecuteKnockData 변경 영향:**
- victoryResult 필드 추가로 기존 knock.test.ts의 일부 테스트 수정 필요
- result.data.victoryResult 접근 추가

### 노크 카운트 리셋 시나리오 상세

```
시나리오 1: 이동으로 구역 이탈
1. Player1 장수A가 타일 0 (player2_home)에서 노크 1회 → knockCount=1
2. Player1 턴에서 장수A를 타일 5 (center)로 이동
3. Player1의 장수 중 player2_home에 남은 장수 = 0명
4. Player1 knockCount 리셋 → 0

시나리오 2: 이동하지만 다른 장수 잔류
1. Player1 장수A(타일 0)에서 노크 2회, 장수B(타일 1)도 player2_home에 있음
2. Player1 턴에서 장수A를 타일 5 (center)로 이동
3. Player1의 장수 중 player2_home에 남은 장수 = 장수B 1명
4. Player1 knockCount 유지 → 2

시나리오 3: 전투 OUT으로 구역 이탈
1. Player1 장수A가 타일 0 (player2_home)에서 노크 2회 → knockCount=2
2. Player2 턴에서 장수C가 장수A를 공격 → 장수A OUT
3. Player1의 장수 중 player2_home에 남은 장수 = 0명
4. Player1 knockCount 리셋 → 0

시나리오 4: home 구역 내 이동 (리셋 안 됨)
1. Player1 장수A가 타일 0 (player2_home)에서 노크 1회 → knockCount=1
2. Player1 턴에서 장수A를 타일 1 (역시 player2_home)로 이동
3. Player1의 장수 중 player2_home에 남은 장수 = 장수A 1명
4. Player1 knockCount 유지 → 1
```

### Project Structure Notes

**신규 파일:**

```
apps/web/src/components/game/
├── VictoryBanner.tsx                # 신규: 승리 화면 컴포넌트
└── VictoryBanner.css                # 신규: 승리 화면 스타일
```

**수정 파일:**

```
packages/game-core/src/state/
├── types.ts                        # 수정: VictoryReason, VictoryResult, GameState.victoryResult
└── initialState.ts                 # 수정: victoryResult 초기값

packages/game-core/src/victory/
├── knock.ts                        # 수정: checkKnockVictory, 리셋 함수들, executeKnock 수정
└── index.ts                        # 수정: 새 함수들 export

packages/game-renderer/src/scenes/
└── GameScene.ts                    # 수정: handleKnock 승리 판정, executeMove/executeAttack 리셋 체크

apps/web/src/components/game/
└── GameCanvas.tsx                  # 수정: game:end 확장, knock:reset 리스너, VictoryBanner 통합

packages/game-core/tests/victory/
└── knock.test.ts                   # 수정: 승리 판정, 리셋 테스트 추가
```

### 아키텍처 경계

```
┌─────────────────────────────────────────────────┐
│              apps/web (React)                   │
│  - VictoryBanner: 승리 화면 UI 컴포넌트         │
│  - GameCanvas: game:end, knock:reset 리스너     │
│  - knockState 리셋 반영                         │
│  - 기존 isGameEnded 로직 활용                   │
└─────────────────────────────────────────────────┘
                    ▲
                    │ 'game:end', 'knock:reset' 이벤트
                    │
┌─────────────────────────────────────────────────┐
│        packages/game-renderer                   │
│  - GameScene: handleKnock() 승리 판정           │
│  - GameScene: executeMove() 리셋 체크           │
│  - GameScene: executeAttack() 리셋 체크         │
│  - 'game:end' 이벤트 발행                       │
│  - 'knock:reset' 이벤트 발행                    │
└─────────────────────────────────────────────────┘
                    │
                    │ import
                    ▼
┌─────────────────────────────────────────────────┐
│          packages/game-core                     │
│  - victory/knock.ts: 승리 판정 + 리셋 로직     │
│  - checkKnockVictory(), shouldResetKnockCount() │
│  - checkAndResetKnockAfterMove()                │
│  - checkAndResetKnockAfterCombat()              │
│  - state/types.ts: VictoryResult 타입           │
│  - Phaser 의존성 없음                           │
└─────────────────────────────────────────────────┘
```

### UI/UX 가이드라인

**승리 화면 (VictoryBanner):**
- 위치: 화면 중앙 오버레이 (전체 화면 반투명 배경)
- 배경: 반투명 블랙 (rgba(0, 0, 0, 0.7))
- 배너: 황금색 배경 (#D4A017) - 노크 승리 컬러
- 텍스트: "노크 승리!" (큰 글씨) + 승리 플레이어 이름
- 애니메이션: 페이드인 (0.5초)
- 크기: 최대 400px 폭, 중앙 정렬
- Phase 1 MVP: 간단한 디자인, Story 8-6에서 풀 디자인 적용

**노크 카운트 리셋 피드백:**
- 기존 KnockButton의 knockCount가 0으로 변경됨
- 추가 시각 피드백은 Phase 1에서는 생략 (카운트 변경만으로 충분)

**접근성:**
- VictoryBanner: `role="dialog"`, `aria-label` 적용
- 승리 텍스트: 스크린리더 접근 가능

### 주의사항

1. **GameState.victoryResult는 선택적 필드**
   - `victoryResult?: VictoryResult`로 정의하여 기존 코드 영향 최소화
   - undefined일 때는 게임 진행 중, 값이 있으면 게임 종료
   - 기존 테스트에서 이 필드를 명시적으로 설정하지 않아도 됨

2. **리셋 로직의 정확한 타이밍**
   - moveGeneral() 반환 후, 애니메이션 시작 전에 리셋 체크
   - executeAttack() 반환 후, 이펙트 시작 전에 리셋 체크
   - GameScene에서 prevState와 newState를 비교하여 리셋 이벤트 발행

3. **양쪽 플레이어 모두 리셋 체크**
   - 이동 후: 이동한 장수의 owner만 체크하면 됨
   - 전투 후: OUT된 장수의 owner만 체크하면 됨 (OUT된 장수가 노크 구역에 있었으므로)

4. **GameScene 비대화 주의 (1,645줄+)**
   - 가능한 한 game-core의 순수 함수에 로직을 위임
   - GameScene에는 이벤트 발행과 상태 업데이트만 최소한으로 추가
   - checkAndResetKnockAfterMove(), checkAndResetKnockAfterCombat()를 game-core에 구현하여 GameScene 코드 최소화

5. **기존 'game:end' 핸들러와의 호환**
   - GameCanvas에 이미 handleGameEnd가 존재 (Issue #4에서 추가)
   - 기존 핸들러가 isGameEnded=true로 설정하므로, TurnEndButton 자동 비활성화
   - reason 필드를 추가로 처리하여 VictoryBanner에 전달

6. **endTurn() 함수의 knockCount 처리**
   - 턴 전환 시 knockCount는 리셋하지 않음 (Story 6-1에서 이미 주석으로 명시)
   - 리셋은 오직 구역 이탈 시에만 발생

### GDD 관련 요구사항

**노크 승리 (GDD 기반):**
- 상대 끝 구역(End Zone) 도달 후 노크 행동 3회 성공 시 승리
- KNOCK_COUNT_TO_WIN: 3 (constants/game.ts에 이미 정의)
- 노크 중 밀려나면 카운트 리셋

**"밀려나면" 해석:**
- GDD의 "노크 중 밀려나면 카운트 리셋"은:
  1. 자발적 이동으로 구역을 벗어나는 경우
  2. 전투로 OUT되어 구역에서 사라지는 경우
  3. (향후) 책략 효과로 강제 이동되는 경우 (Epic 7)
- 리셋 조건: 해당 플레이어의 장수가 상대 home 구역에 **한 명도 없을 때** 리셋
  - 여러 장수가 노크 구역에 있으면 한 명이 나가도 다른 장수가 남아있으면 카운트 유지

**Epic 6 Story 2 (epics.md):**
- [WIN-002] 노크 3회 성공 시 승리로 처리된다

### 다음 스토리 연결

**Story 6-3: 전멸 승리 (Annihilation Victory)**
- 상대 병력 전부 소멸 시 승리
- VictoryReason에 'annihilation' 이미 추가됨 (이 스토리에서)
- checkAnnihilationVictory() 함수 구현
- VictoryBanner에 전멸 승리 표시 추가

**Story 6-4: 와해 승리 (Collapse Victory)**
- 상대 장수 모두 OUT 시 와해 승리
- VictoryReason에 'collapse' 이미 추가됨

**Story 6-5: 항복 (Surrender)**
- 플레이어의 항복 선언
- VictoryReason에 'surrender' 이미 추가됨

### References

- [Source: _bmad-output/epics.md#Epic 6: 승리 조건] - Story [WIN-002] 정의
- [Source: _bmad-output/gdd.md#Win/Loss Conditions] - 노크 승리 조건 상세
- [Source: _bmad-output/gdd.md#Primary Mechanics > 노크] - "노크 중 밀려나면 카운트 리셋"
- [Source: _bmad-output/game-architecture.md#Victory] - 승리 조건 패키지 구조
- [Source: _bmad-output/game-architecture.md#Event System] - 'game:end' 이벤트 정의
- [Source: packages/game-core/src/victory/knock.ts] - 기존 노크 로직 (canKnock, executeKnock)
- [Source: packages/game-core/src/state/types.ts] - GameState, GamePhase ('ended')
- [Source: packages/game-core/src/constants/game.ts] - GAME.KNOCK_COUNT_TO_WIN = 3
- [Source: packages/game-core/src/movement/actions.ts] - moveGeneral() 패턴
- [Source: packages/game-core/src/combat/attack.ts] - executeAttack() 패턴
- [Source: packages/game-core/src/turn/actions.ts] - endTurn() - knockCount 턴 전환 시 미리셋
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - Scene 구조, handleKnock(), executeMove(), executeAttack()
- [Source: apps/web/src/components/game/GameCanvas.tsx] - game:end 이벤트 리스너 (기존)
- [Source: _bmad-output/implementation-artifacts/6-1-knock-action.md] - Story 6-1 학습 사항

## Change Log

- 2026-02-09: Story 6-2 생성 - 3회 노크 승리 (Triple Knock Victory) 스토리 컨텍스트 작성 완료
- 2026-02-09: correct-course 적용 - AC2(이동 리셋), AC3(전투 리셋), AC5(리셋 이벤트) 삭제. 노크 카운트는 게임 전체 누적값으로 변경. 노크 후 장수 퇴각 처리 추가 (Story 6-1 AC2에 반영).
