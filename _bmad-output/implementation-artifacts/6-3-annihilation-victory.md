# Story 6.3: 전멸 승리 (Annihilation Victory)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 상대방의 병력이 전부 소멸되면 게임이 승리로 판정되도록 하고 싶다,
so that 전투를 통한 전멸 승리 조건이 동작하여 공격적 전략이 보상받는다.

## Acceptance Criteria

1. **AC1**: 전멸 승리 판정 함수 (game-core)
   - 상대 플레이어의 모든 장수가 병력 0 (troops === 0)이면 전멸 승리
   - checkAnnihilationVictory(state: GameState): VictoryResult | null
   - 모든 장수가 status === 'out' (병력 0)인지 확인
   - 승리 시 { winner: PlayerId, reason: 'annihilation' } 반환
   - 미충족 시 null 반환
   - 순수 함수로 구현 (불변 상태 반환)

2. **AC2**: 전투 후 전멸 승리 판정 통합 (game-core)
   - executeAttack() 실행 후 checkAnnihilationVictory() 호출
   - 공격으로 방어자가 OUT된 경우에만 승리 판정 체크 (성능 최적화)
   - 승리 시 GameState.phase를 'ended'로 변경, victoryResult 설정
   - ExecuteAttackData에 victoryResult 필드 추가 (null | VictoryResult)

3. **AC3**: GameScene 전멸 승리 이벤트 발행 (game-renderer)
   - executeAttack() 결과에서 victoryResult 확인
   - 승리 시 'game:end' 이벤트 발행: { winner: PlayerId, reason: 'annihilation' }
   - 게임 종료 시 타이머 정지 (timerState.isRunning = false)
   - 게임 종료 시 입력 비활성화 (기존 isGameEnded 로직 활용)

4. **AC4**: 승리 화면 표시 (apps/web)
   - 기존 VictoryBanner 컴포넌트에서 'annihilation' reason 처리 (이미 구현됨)
   - "전멸 승리!" 텍스트 표시 확인
   - 기존 'game:end' 이벤트 핸들러가 reason='annihilation'을 올바르게 전달하는지 확인

5. **AC5**: 테스트 및 검증
   - checkAnnihilationVictory() 단위 테스트
     - 상대 전원 OUT 시 VictoryResult 반환
     - 상대 일부 active 시 null 반환
     - 양측 모두 확인 (player1, player2)
   - executeAttack() 전멸 승리 통합 테스트
     - 마지막 장수 OUT 시 승리 판정 (phase='ended', victoryResult 설정)
     - 마지막 장수가 아닌 경우 승리 아님 (phase='playing')
   - 빌드 성공 확인 (`pnpm build`)
   - 타입 체크 통과 확인 (`pnpm typecheck`)
   - 기존 테스트 통과 확인 (`pnpm test`)

## Tasks / Subtasks

- [ ] Task 1: checkAnnihilationVictory() 함수 구현 (AC: 1)
  - [ ] 1.1: packages/game-core/src/victory/annihilation.ts 신규 생성
    - checkAnnihilationVictory(state: GameState): VictoryResult | null 구현
    - 상대 플레이어의 모든 장수가 OUT(troops === 0, status === 'out')인지 확인
    - 현재 플레이어(state.currentPlayer)의 상대방 장수를 필터링
    - 상대 장수가 0명인 경우도 방어적으로 처리 (null 반환)
  - [ ] 1.2: packages/game-core/src/victory/index.ts에 export 추가
    - checkAnnihilationVictory export 추가

- [ ] Task 2: executeAttack()에 전멸 승리 판정 통합 (AC: 2)
  - [ ] 2.1: ExecuteAttackData 타입 확장
    - packages/game-core/src/combat/attack.ts 수정
    - ExecuteAttackData에 `victoryResult: VictoryResult | null` 필드 추가
  - [ ] 2.2: executeAttack() 함수 수정
    - packages/game-core/src/combat/attack.ts 수정
    - 공격 결과에서 isKnockOut === true인 경우에만 checkAnnihilationVictory() 호출
    - 승리 시 newState.phase = 'ended', newState.victoryResult 설정
    - ExecuteAttackData 반환값에 victoryResult 추가
  - [ ] 2.3: VictoryResult import 추가
    - packages/game-core/src/combat/attack.ts에서 VictoryResult, checkAnnihilationVictory import

- [ ] Task 3: GameScene 전멸 승리 이벤트 통합 (AC: 3)
  - [ ] 3.1: GameScene.executeAttack() 수정
    - packages/game-renderer/src/scenes/GameScene.ts 수정
    - executeAttack() 결과의 victoryResult 확인
    - 승리 시 타이머 정지 (this.timerState.isRunning = false)
    - 승리 시 'game:end' 이벤트 발행: { winner, reason: 'annihilation' }
    - OUT 처리 이후, 시각적 업데이트 이전에 승리 판정 배치

- [ ] Task 4: 기존 UI 연동 확인 (AC: 4)
  - [ ] 4.1: VictoryBanner에서 'annihilation' reason 처리 확인
    - apps/web/src/components/game/VictoryBanner.tsx의 getReasonText()에 이미 'annihilation' case 존재
    - "전멸 승리!" 텍스트 반환 확인 (코드 리뷰만, 수정 불필요)
  - [ ] 4.2: GameCanvas handleGameEnd에서 reason 전달 확인
    - apps/web/src/components/game/GameCanvas.tsx의 handleGameEnd()가 reason 필드를 올바르게 VictoryBanner에 전달하는지 확인

- [ ] Task 5: 단위 테스트 작성 (AC: 5)
  - [ ] 5.1: checkAnnihilationVictory() 테스트
    - packages/game-core/tests/victory/annihilation.test.ts 신규 생성
    - 상대(player2) 전원 OUT → player1 승리 (VictoryResult 반환)
    - 상대(player1) 전원 OUT → player2 승리 (VictoryResult 반환)
    - 상대 일부 active → null 반환
    - 상대 장수 중 1명만 active → null 반환
    - 양측 모두 active → null 반환
  - [ ] 5.2: executeAttack() 전멸 승리 통합 테스트
    - packages/game-core/tests/combat/attack-annihilation.test.ts 신규 생성
    - 마지막 장수 공격 → OUT → 승리 판정 (phase='ended', victoryResult 설정)
    - 마지막이 아닌 장수 공격 → OUT → 승리 아님 (phase='playing')
    - 공격 후 방어자 생존 → victoryResult = null
    - victoryResult가 ExecuteAttackData에 올바르게 포함되는지 확인

- [ ] Task 6: 빌드 및 검증 (AC: 5)
  - [ ] 6.1: 빌드 성공 확인 (`pnpm build`)
  - [ ] 6.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [ ] 6.3: 기존 테스트 통과 확인 (`pnpm test`)
  - [ ] 6.4: 브라우저 수동 테스트
    - 상대 장수를 모두 공격하여 OUT → 전멸 승리 화면 확인
    - "전멸 승리!" 텍스트와 승리 플레이어 표시 확인

## Dev Notes

### 아키텍처 준수 사항

**packages/game-core (순수 로직) - 핵심 작업 영역**
- victory/annihilation.ts: checkAnnihilationVictory() 신규
- combat/attack.ts: executeAttack() 수정 - 승리 판정 통합, ExecuteAttackData 확장
- Phaser 의존성 절대 금지 - 순수 TypeScript만

**packages/game-renderer (Phaser)**
- GameScene.ts: executeAttack() 내부에서 victoryResult 확인 후 'game:end' 이벤트 발행

**apps/web (React UI)**
- 수정 불필요 - VictoryBanner에 이미 'annihilation' case 구현됨
- GameCanvas의 handleGameEnd()가 이미 reason 필드를 VictoryBanner에 전달함

### 핵심 구현 패턴

#### 1. 전멸 승리 판정 함수

```typescript
// packages/game-core/src/victory/annihilation.ts

import type { GameState, VictoryResult } from '../state/types';
import type { PlayerId } from '../generals/types';

/**
 * 상대 플레이어 ID 반환
 */
function getOpponentId(playerId: PlayerId): PlayerId {
  return playerId === 'player1' ? 'player2' : 'player1';
}

/**
 * 전멸 승리 조건 확인
 *
 * 상대 플레이어의 모든 장수가 OUT 상태(병력 0)이면 전멸 승리
 *
 * @param state - 현재 게임 상태
 * @returns VictoryResult | null - 승리 시 결과, 아직 승리가 아니면 null
 */
export function checkAnnihilationVictory(state: GameState): VictoryResult | null {
  // player1 관점: player2의 모든 장수가 OUT인지 확인
  const player2Generals = state.generals.filter(g => g.owner === 'player2');
  if (player2Generals.length > 0 && player2Generals.every(g => g.status === 'out')) {
    return { winner: 'player1', reason: 'annihilation' };
  }

  // player2 관점: player1의 모든 장수가 OUT인지 확인
  const player1Generals = state.generals.filter(g => g.owner === 'player1');
  if (player1Generals.length > 0 && player1Generals.every(g => g.status === 'out')) {
    return { winner: 'player2', reason: 'annihilation' };
  }

  return null;
}
```

#### 2. executeAttack() 수정 - 전멸 승리 판정 통합

```typescript
// packages/game-core/src/combat/attack.ts (수정)

import { checkAnnihilationVictory } from '../victory/annihilation';
import type { VictoryResult } from '../state/types';

export interface ExecuteAttackData {
  /** 업데이트된 게임 상태 */
  state: GameState;
  /** 공격 결과 (방향 정보 포함) */
  result: AttackResult;
  /** 승리 결과 (null이면 게임 계속) */
  victoryResult: VictoryResult | null;
}

export function executeAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): Result<ExecuteAttackData> {
  // ... 기존 로직 ...

  let newState: GameState = {
    ...state,
    generals: newGenerals,
    actionsRemaining: state.actionsRemaining - 1,
    performedActions: newPerformedActions,
  };

  // 전멸 승리 판정 (방어자가 OUT된 경우에만)
  let victoryResult: VictoryResult | null = null;
  if (isKnockOut) {
    victoryResult = checkAnnihilationVictory(newState);
    if (victoryResult) {
      newState = {
        ...newState,
        phase: 'ended',
        victoryResult,
      };
    }
  }

  return {
    success: true,
    data: {
      state: newState,
      result: attackResult,
      victoryResult,
    },
  };
}
```

#### 3. GameScene.executeAttack() 수정

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

private executeAttack(attackerId: string, defenderId: string): void {
  // ... 기존 로직 ...

  const result = executeAttack(this.gameState, attackerId, defenderId);

  if (result.success) {
    const { state: newState, result: attackResult, victoryResult } = result.data;

    // ... 기존 이펙트/사운드/UI 로직 ...

    // 게임 상태 업데이트
    this.gameState = newState;

    // ... 기존 장수 상태 재렌더링 로직 ...

    // Story 6-3: 전멸 승리 판정
    if (victoryResult) {
      // 타이머 정지
      this.timerState = { ...this.timerState, isRunning: false };
      // 게임 종료 이벤트 발행
      this.events.emit('game:end', {
        winner: victoryResult.winner,
        reason: victoryResult.reason,
      });
    }

    // ... 기존 공격 완료 이벤트 등 ...
  }
}
```

### 이전 스토리 학습 사항

**Story 6-2 (3회 노크 승리) - 직전 스토리:**
- VictoryResult, VictoryReason 타입 이미 state/types.ts에 정의됨
- VictoryBanner 컴포넌트 이미 'annihilation' case 처리 구현됨
- GameScene의 'game:end' 이벤트 발행 패턴 확립
- GameCanvas의 handleGameEnd()가 reason 필드를 VictoryBanner에 전달하는 패턴 확립
- executeKnock()에서 victoryResult를 반환하는 패턴 → executeAttack()에도 동일 적용

**Story 4-5 (장수 OUT 처리) - 관련 스토리:**
- OUT 상태: position = null, status = 'out', troops = 0
- executeAttack()에서 isKnockOut으로 OUT 판정
- GameScene에서 removeGeneral()으로 시각적 제거
- 'general:out' 이벤트 발행 패턴

**Story 6-1 (노크 행동):**
- canKnock(), validateKnock(), executeKnock() 3단계 패턴
- 노크 후 장수 퇴각 처리 (status='out', position=null, troops=0)
- 노크로 OUT된 장수도 전멸 승리 계산에 포함되어야 함

### 전멸 승리 vs 와해 승리 구분

**게임 규칙 (02-game-rules.md) 기준:**
- **전멸 (Annihilation)**: 상대 병력 전부 소멸 → 모든 장수가 troops=0, status='out'
- **와해 (Collapse)**: 상대 장수가 모두 완전 퇴장(전사) → 두 번째 전멸 후 영구 퇴장

**Phase 1 MVP 범위:**
- 현재 Phase 1에서는 "패전 복귀" 시스템이 미구현 (장수 OUT 시 바로 영구 퇴장)
- 따라서 Phase 1에서는 전멸 승리와 와해 승리의 동작이 동일
- checkAnnihilationVictory()는 모든 장수의 status === 'out' 확인으로 구현
- Story 6-4 (와해 승리)에서 "완전 퇴장" 상태를 별도로 추적할 수 있지만, Phase 1에서는 out === 완전 퇴장
- 전멸 승리는 전투(attack) 후에만 체크, 와해 승리는 향후 "두 번째 전멸" 메커니즘 구현 시 구분

**판정 시점:**
- 전멸 승리: executeAttack() 후 즉시 판정 (공격으로 인한 OUT)
- 노크로 인한 장수 OUT은 노크 승리로만 판정 (전멸 승리 체크 불필요 - 노크는 한 번에 1명만 OUT)
  - 단, 노크로 장수가 OUT되어 상대 전원 OUT이 되는 경우도 이론적으로 가능
  - 하지만 노크 자체가 승리 조건(3회)이므로, 노크 3회 미달 상태에서 전멸이 되려면 다른 4명이 이미 전투로 OUT이어야 함
  - 이 경우 전투 시점에서 이미 전멸 승리가 판정되었을 것이므로 노크 시 전멸 체크는 불필요

### ExecuteAttackData 변경 영향 분석

**기존 executeAttack() 사용처:**
1. `packages/game-renderer/src/scenes/GameScene.ts` - executeAttack() 호출
   - `const { state: newState } = result.data;`
   - `const { result: attackResult } = result.data;`
   - **변경 필요**: victoryResult 추가 destructuring

2. `packages/game-core/tests/combat/` - 기존 테스트
   - ExecuteAttackData 타입 변경으로 기존 테스트에 victoryResult 필드 접근 가능
   - 기존 테스트 자체는 수정 불필요 (victoryResult가 추가되어도 기존 필드 접근은 동일)
   - 단, 테스트에서 ExecuteAttackData 타입을 직접 참조하는 경우 확인 필요

### Project Structure Notes

**신규 파일:**

```
packages/game-core/src/victory/
└── annihilation.ts                 # 신규: 전멸 승리 판정 함수

packages/game-core/tests/victory/
└── annihilation.test.ts            # 신규: 전멸 승리 판정 테스트

packages/game-core/tests/combat/
└── attack-annihilation.test.ts     # 신규: 공격 후 전멸 승리 통합 테스트
```

**수정 파일:**

```
packages/game-core/src/combat/
└── attack.ts                       # 수정: ExecuteAttackData 확장, 전멸 승리 판정 통합

packages/game-core/src/victory/
└── index.ts                        # 수정: checkAnnihilationVictory export 추가

packages/game-renderer/src/scenes/
└── GameScene.ts                    # 수정: executeAttack() 내 승리 판정, 'game:end' 발행
```

### 아키텍처 경계

```
┌─────────────────────────────────────────────────┐
│              apps/web (React)                   │
│  - VictoryBanner: 이미 'annihilation' 처리됨    │
│  - GameCanvas: 기존 handleGameEnd 그대로 사용    │
│  - 수정 불필요                                  │
└─────────────────────────────────────────────────┘
                    ▲
                    │ 'game:end' 이벤트 (reason: 'annihilation')
                    │
┌─────────────────────────────────────────────────┐
│        packages/game-renderer                   │
│  - GameScene: executeAttack() 내 승리 판정      │
│  - 'game:end' 이벤트 발행                       │
│  - 타이머 정지                                  │
└─────────────────────────────────────────────────┘
                    │
                    │ import
                    ▼
┌─────────────────────────────────────────────────┐
│          packages/game-core                     │
│  - victory/annihilation.ts: 전멸 승리 판정      │
│  - combat/attack.ts: 공격 후 전멸 승리 체크     │
│  - ExecuteAttackData.victoryResult 추가         │
│  - Phaser 의존성 없음                           │
└─────────────────────────────────────────────────┘
```

### UI/UX 가이드라인

**승리 화면 (VictoryBanner - 기존 구현 재사용):**
- VictoryBanner.tsx의 getReasonText()에 이미 'annihilation' → '전멸 승리!' 매핑됨
- 동일한 황금색 배경, 동일한 애니메이션 적용
- Phase 1 MVP: Story 8-6에서 승리 사유별 차별화된 디자인 적용 예정

### 주의사항

1. **ExecuteAttackData 타입 확장의 하위 호환성**
   - victoryResult 필드 추가 시 기존 코드에서 이 필드를 무시해도 되므로 하위 호환
   - GameScene의 executeAttack()에서만 destructuring 업데이트 필요

2. **전멸 승리 판정 시점**
   - executeAttack() 내부에서 판정 (game-core 레벨)
   - isKnockOut === true일 때만 체크하여 불필요한 연산 최소화
   - GameScene은 결과를 받아서 이벤트만 발행 (로직 위임)

3. **GameScene 비대화 주의 (현재 약 1,600줄+)**
   - 승리 판정 로직은 game-core에 위임
   - GameScene에는 이벤트 발행과 타이머 정지만 최소한으로 추가
   - 기존 OUT 처리 블록 이후에 승리 판정 코드 삽입

4. **노크로 인한 OUT과 전멸 승리의 관계**
   - 노크 후 장수가 OUT되지만, 이 경우 노크 승리 판정이 우선
   - executeKnock()에서는 checkKnockVictory()만 호출 (전멸 체크 불필요)
   - 노크 3회 미달 + 상대 전원 OUT인 엣지 케이스는 발생 불가능 (이전 공격 시점에서 전멸 승리 판정됨)

5. **양측 동시 전멸 (극히 드문 엣지 케이스)**
   - 현재 전투 시스템에서 공격자는 피해를 받지 않으므로 양측 동시 전멸은 불가능
   - (전선 공격 시 공격자 피해는 미구현 상태)
   - 향후 전선 공격 피해 구현 시 양측 동시 전멸 처리 필요할 수 있음

### GDD 관련 요구사항

**전멸 승리 (GDD 기반):**
- [WIN-003] 상대 병력 전멸 시 승리로 처리된다
- 게임 규칙 §8.2: 전멸 승리 = "상대 병력 전부 소멸" (우선순위 2)
- 게임 규칙 §7.1: 전멸 = "장수 하나의 병력이 0이 되는 상태"
- 전멸 승리 = 상대의 모든 장수가 개별적으로 전멸(병력 0)된 상태

**Epic 6 Story 3 (epics.md):**
- [WIN-003] 상대 병력 전멸 시 승리로 처리된다

### 다음 스토리 연결

**Story 6-4: 와해 승리 (Collapse Victory)**
- 상대 장수 모두 완전 퇴장(전사) 시 와해 승리
- VictoryReason에 'collapse' 이미 추가됨 (Story 6-2에서)
- Phase 1에서는 전멸과 와해가 동일 동작이지만, 향후 "패전 복귀" 구현 시 구분됨
- checkCollapseVictory() 함수 구현 예정

**Story 6-5: 항복 (Surrender)**
- 플레이어의 항복 선언
- VictoryReason에 'surrender' 이미 추가됨

### References

- [Source: _bmad-output/epics.md#Epic 6: 승리 조건] - Story [WIN-003] 정의
- [Source: docs/project-plan/02-game-rules.md#8.2 승리 조건 목록] - 전멸 승리 조건 상세
- [Source: docs/project-plan/02-game-rules.md#7.1 전멸] - 전멸 정의
- [Source: docs/project-plan/03-technical-architecture.md#Win Condition] - 승리 조건 테스트 정의
- [Source: packages/game-core/src/victory/knock.ts] - checkKnockVictory() 패턴 참고
- [Source: packages/game-core/src/combat/attack.ts] - executeAttack() 현재 구현
- [Source: packages/game-core/src/state/types.ts] - VictoryResult, VictoryReason, GameState
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - executeAttack() 호출 패턴
- [Source: apps/web/src/components/game/VictoryBanner.tsx] - 'annihilation' case 이미 구현
- [Source: apps/web/src/components/game/GameCanvas.tsx] - handleGameEnd() 이벤트 핸들러
- [Source: _bmad-output/implementation-artifacts/6-2-triple-knock-victory.md] - Story 6-2 학습 사항

## Change Log

- 2026-02-09: Story 6-3 생성 - 전멸 승리 (Annihilation Victory) 스토리 컨텍스트 작성 완료
