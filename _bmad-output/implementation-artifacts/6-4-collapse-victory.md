# Story 6.4: 와해 승리 (Collapse Victory)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 상대방의 장수가 모두 완전 퇴장(OUT)되면 게임이 와해 승리로 판정되도록 하고 싶다,
so that 전투를 통해 상대 장수를 전부 제거하는 전략이 별도의 승리 조건으로 인정받는다.

## Acceptance Criteria

1. **AC1**: 와해 승리 판정 함수 (game-core)
   - checkCollapseVictory(state: GameState): VictoryResult | null
   - 상대 플레이어의 모든 장수가 status === 'out'이면 와해 승리
   - 승리 시 { winner: PlayerId, reason: 'collapse' } 반환
   - 미충족 시 null 반환
   - 순수 함수로 구현 (불변 상태 반환)
   - **Phase 1 참고**: 현재 Phase 1에서는 "패전 복귀" 시스템이 미구현이므로 out === 완전 퇴장. 전멸 승리(annihilation)와 판정 조건이 동일하지만, reason이 'collapse'로 구분됨

2. **AC2**: 전투 후 와해 승리 판정 통합 (game-core)
   - executeAttack()에서 기존 checkAnnihilationVictory() 호출을 checkCollapseVictory()로 교체
   - 이유: 게임 규칙상 "전멸"은 개별 장수 병력 0을 의미, "와해"는 모든 장수 OUT을 의미
   - 현재 checkAnnihilationVictory()의 로직이 실제로는 "와해" 판정을 하고 있음 (전체 장수 OUT 체크)
   - 기존 checkAnnihilationVictory()를 checkCollapseVictory()로 대체하고, reason을 'collapse'로 변경
   - **중요**: 기존 'annihilation' reason은 제거하고 'collapse'로 통합 (Phase 1에서는 동일 동작)
   - executeAttack()과 executeKnock() 양쪽에서 와해 판정 체크

3. **AC3**: 노크 후 와해 승리 판정 통합 (game-core)
   - executeKnock() 실행 후에도 checkCollapseVictory() 호출 추가
   - 노크로 장수가 OUT되면서 상대 전원 OUT이 되는 경우 처리
   - 노크 승리(knock 3회)보다 와해 승리가 먼저 판정되면 와해 승리 우선
   - 단, 노크 3회 달성과 동시에 와해도 성립하면 노크 승리 우선 (기존 checkKnockVictory가 먼저 실행)

4. **AC4**: GameScene 와해 승리 이벤트 발행 (game-renderer)
   - 기존 executeAttack() 내 'game:end' 이벤트 발행 로직이 그대로 동작
   - victoryResult.reason이 'collapse'로 변경되므로 자동 반영
   - 추가: executeKnock() 내에서도 와해 승리 시 'game:end' 이벤트 발행

5. **AC5**: 승리 화면 표시 (apps/web)
   - VictoryBanner에 이미 'collapse' → '와해 승리!' 매핑됨 (수정 불필요)
   - GameCanvas의 handleGameEnd()가 reason 필드를 올바르게 전달하는지 확인

6. **AC6**: 테스트 및 검증
   - checkCollapseVictory() 단위 테스트
     - 상대 전원 OUT 시 VictoryResult 반환 (reason: 'collapse')
     - 상대 일부 active 시 null 반환
     - 양측 모두 확인 (player1, player2)
   - executeAttack() 와해 승리 통합 테스트 (기존 annihilation 테스트를 collapse로 마이그레이션)
   - executeKnock() 와해 승리 통합 테스트
     - 노크로 마지막 장수 OUT → 와해 승리 판정
   - 빌드 성공 확인 (`pnpm build`)
   - 타입 체크 통과 확인 (`pnpm typecheck`)
   - 기존 테스트 통과 확인 (`pnpm test`)

## Tasks / Subtasks

- [ ] Task 1: checkCollapseVictory() 함수 구현 (AC: 1)
  - [ ] 1.1: packages/game-core/src/victory/collapse.ts 신규 생성
    - checkCollapseVictory(state: GameState): VictoryResult | null 구현
    - 상대 플레이어의 모든 장수가 OUT(status === 'out')인지 확인
    - player1 관점: player2의 모든 장수 OUT → { winner: 'player1', reason: 'collapse' }
    - player2 관점: player1의 모든 장수 OUT → { winner: 'player2', reason: 'collapse' }
    - 상대 장수가 0명인 경우 방어적 처리 (null 반환)
  - [ ] 1.2: packages/game-core/src/victory/index.ts에 export 추가
    - checkCollapseVictory export 추가

- [ ] Task 2: executeAttack()에서 annihilation → collapse 전환 (AC: 2)
  - [ ] 2.1: packages/game-core/src/combat/attack.ts 수정
    - import 변경: checkAnnihilationVictory → checkCollapseVictory
    - checkAnnihilationVictory() 호출을 checkCollapseVictory()로 교체
    - 파일 헤더 주석 업데이트 (Story 6-4 추가)

- [ ] Task 3: executeKnock()에 와해 승리 판정 추가 (AC: 3)
  - [ ] 3.1: packages/game-core/src/victory/knock.ts 수정
    - import: checkCollapseVictory 추가
    - executeKnock() 내부에서 노크로 장수 OUT 후 checkCollapseVictory() 호출
    - checkKnockVictory()가 먼저 실행되므로, 노크 승리가 아닌 경우에만 와해 판정
    - ExecuteKnockData에 victoryResult가 이미 존재하므로 추가 타입 변경 불필요

- [ ] Task 4: 기존 annihilation 코드 정리 (AC: 2)
  - [ ] 4.1: packages/game-core/src/victory/annihilation.ts 삭제 또는 리팩토링
    - annihilation.ts를 삭제하고 collapse.ts로 완전 대체
    - 또는 annihilation.ts에서 checkCollapseVictory를 re-export (하위 호환)
    - **권장**: 깔끔하게 삭제하고 collapse.ts로 통합
  - [ ] 4.2: packages/game-core/src/victory/index.ts에서 annihilation export 제거
    - checkAnnihilationVictory export 제거, checkCollapseVictory로 대체
  - [ ] 4.3: 기존 테스트 파일 마이그레이션
    - packages/game-core/tests/victory/annihilation.test.ts → collapse.test.ts로 리네임 및 수정
    - packages/game-core/tests/combat/attack-annihilation.test.ts → attack-collapse.test.ts로 리네임 및 수정
    - reason: 'annihilation' → 'collapse' 변경
    - 함수명 checkAnnihilationVictory → checkCollapseVictory 변경

- [ ] Task 5: GameScene 와해 승리 이벤트 통합 (AC: 4)
  - [ ] 5.1: packages/game-renderer/src/scenes/GameScene.ts 확인
    - executeAttack() 내 기존 victoryResult 처리가 reason 변경만으로 자동 동작하는지 확인
    - 주석 업데이트: "Story 6-3: 전멸 승리" → "Story 6-4: 와해 승리"
  - [ ] 5.2: GameScene.executeKnock() 수정
    - executeKnock() 결과에서 victoryResult 확인 (노크 승리가 아닌 와해 승리 케이스)
    - 이미 victoryResult 처리 로직이 있으므로, knock.ts의 변경이 자동 반영되는지 확인

- [ ] Task 6: VictoryReason 타입 정리 (AC: 5)
  - [ ] 6.1: packages/game-core/src/state/types.ts 확인
    - VictoryReason에 'collapse'가 이미 포함되어 있음 → 변경 불필요
    - 'annihilation'을 VictoryReason에서 제거할지 검토
    - **권장**: Phase 1에서는 'annihilation' 유지 (향후 패전 복귀 구현 시 진정한 전멸 승리에 사용)

- [ ] Task 7: 단위 테스트 작성 (AC: 6)
  - [ ] 7.1: checkCollapseVictory() 테스트
    - packages/game-core/tests/victory/collapse.test.ts 신규 생성 (또는 기존 annihilation.test.ts 마이그레이션)
    - 상대(player2) 전원 OUT → player1 와해 승리 (reason: 'collapse')
    - 상대(player1) 전원 OUT → player2 와해 승리 (reason: 'collapse')
    - 상대 일부 active → null 반환
    - 상대 장수 중 1명만 active → null 반환
    - 양측 모두 active → null 반환
  - [ ] 7.2: executeAttack() 와해 승리 통합 테스트
    - packages/game-core/tests/combat/attack-collapse.test.ts (기존 attack-annihilation.test.ts 마이그레이션)
    - 마지막 장수 공격 → OUT → 와해 승리 (phase='ended', victoryResult.reason='collapse')
    - 마지막이 아닌 장수 공격 → OUT → 승리 아님
    - 공격 후 방어자 생존 → victoryResult = null
  - [ ] 7.3: executeKnock() 와해 승리 통합 테스트
    - 노크로 마지막 장수 OUT (노크 카운트 3 미만) → 와해 승리 판정
    - 노크 3회 달성 + 동시 와해 → 노크 승리 우선

- [ ] Task 8: 빌드 및 검증 (AC: 6)
  - [ ] 8.1: 빌드 성공 확인 (`pnpm build`)
  - [ ] 8.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [ ] 8.3: 기존 테스트 통과 확인 (`pnpm test`)
  - [ ] 8.4: 브라우저 수동 테스트
    - 상대 장수를 모두 공격하여 OUT → 와해 승리 화면 확인
    - "와해 승리!" 텍스트와 승리 플레이어 표시 확인

## Dev Notes

### 아키텍처 준수 사항

**packages/game-core (순수 로직) - 핵심 작업 영역**
- victory/collapse.ts: checkCollapseVictory() 신규
- victory/annihilation.ts: 삭제 (collapse.ts로 대체)
- combat/attack.ts: checkAnnihilationVictory → checkCollapseVictory 교체
- victory/knock.ts: executeKnock()에 와해 승리 판정 추가
- Phaser 의존성 절대 금지 - 순수 TypeScript만

**packages/game-renderer (Phaser)**
- GameScene.ts: 주석 업데이트만 (로직은 game-core 변경으로 자동 반영)

**apps/web (React UI)**
- 수정 불필요 - VictoryBanner에 이미 'collapse' case 구현됨

### 핵심 구현 패턴

#### 1. 와해 승리 판정 함수

```typescript
// packages/game-core/src/victory/collapse.ts

import type { GameState, VictoryResult } from '../state/types';

/**
 * 와해 승리 조건 확인
 *
 * 상대 플레이어의 모든 장수가 OUT 상태이면 와해 승리
 * 게임 규칙 §7.3: 아군 측의 모든 장수가 완전 퇴장된 상태를 "와해"로 정의
 *
 * Phase 1: out === 완전 퇴장 (패전 복귀 미구현)
 * Phase 3+: 두 번째 전멸로 인한 "완전 퇴장" 상태만 와해로 카운트
 *
 * @param state - 현재 게임 상태
 * @returns VictoryResult | null - 승리 시 결과, 아직 승리가 아니면 null
 */
export function checkCollapseVictory(state: GameState): VictoryResult | null {
  // player1 관점: player2의 모든 장수가 OUT인지 확인
  const player2Generals = state.generals.filter(g => g.owner === 'player2');
  if (player2Generals.length > 0 && player2Generals.every(g => g.status === 'out')) {
    return { winner: 'player1', reason: 'collapse' };
  }

  // player2 관점: player1의 모든 장수가 OUT인지 확인
  const player1Generals = state.generals.filter(g => g.owner === 'player1');
  if (player1Generals.length > 0 && player1Generals.every(g => g.status === 'out')) {
    return { winner: 'player2', reason: 'collapse' };
  }

  return null;
}
```

#### 2. executeAttack() 수정 - collapse로 전환

```typescript
// packages/game-core/src/combat/attack.ts (수정)

// import 변경
import { checkCollapseVictory } from '../victory/collapse';

// 기존 checkAnnihilationVictory → checkCollapseVictory 교체
let victoryResult: VictoryResult | null = null;
if (isKnockOut) {
  victoryResult = checkCollapseVictory(newState);
  if (victoryResult) {
    newState = {
      ...newState,
      phase: 'ended',
      victoryResult,
    };
  }
}
```

#### 3. executeKnock() 수정 - 와해 승리 판정 추가

```typescript
// packages/game-core/src/victory/knock.ts (수정)

import { checkCollapseVictory } from './collapse';

// executeKnock() 내부, 노크 승리 판정 이후 추가:
// 기존 knock 승리 판정
let victoryResult = checkKnockVictory(newState);

// 노크 승리가 아닌 경우, 와해 승리 판정
if (!victoryResult) {
  victoryResult = checkCollapseVictory(newState);
}
```

### 전멸 vs 와해 정리 (게임 규칙 기반)

| 용어 | 정의 | Phase 1 | Phase 3+ |
|------|------|---------|----------|
| **전멸** | 개별 장수 병력 0 | OUT 처리 | 첫 전멸→복귀, 두 번째→완전 퇴장 |
| **와해** | 모든 장수 완전 퇴장 | 모든 장수 OUT | 모든 장수 완전 퇴장(전사) |
| **판정** | 즉시 패배 | attack/knock 후 체크 | attack/knock 후 체크 |

**Phase 1 설계 결정:**
- Story 6-3에서 구현한 checkAnnihilationVictory()는 실제로 "모든 장수 OUT" 체크 = 와해 판정
- 이를 checkCollapseVictory()로 리네임하여 게임 규칙 용어와 일치시킴
- 'annihilation' VictoryReason은 향후 패전 복귀 구현 시 진정한 전멸 승리에 사용 가능
- Phase 1에서는 VictoryReason 타입에서 'annihilation' 유지 (사용되지 않아도 무방)

### 이전 스토리 학습 사항

**Story 6-3 (전멸 승리) - 직전 스토리:**
- checkAnnihilationVictory() 구현 패턴 → 동일 패턴으로 checkCollapseVictory() 구현
- executeAttack()에서 victoryResult 반환 패턴 확립
- ExecuteAttackData.victoryResult 필드 이미 존재
- GameScene의 'game:end' 이벤트 발행 패턴 확립
- VictoryBanner에 'collapse' case 이미 구현됨

**Story 6-2 (3회 노크 승리):**
- VictoryResult, VictoryReason 타입 정의 (state/types.ts)
- executeKnock()에서 victoryResult 반환 패턴
- GameScene의 executeKnock() 내 'game:end' 이벤트 발행

**Story 6-1 (노크 행동):**
- 노크 후 장수 퇴각 처리 (status='out', position=null, troops=0)
- 노크로 OUT된 장수도 와해 승리 계산에 포함
- canKnock(), validateKnock(), executeKnock() 3단계 패턴

### executeKnock() 와해 판정 엣지 케이스

**시나리오**: 상대 장수 4명이 이미 전투로 OUT, 마지막 1명이 끝 구역에 있는 상태에서 노크 수행
- 노크 후 해당 장수 OUT (퇴각 처리)
- checkKnockVictory() → 노크 카운트가 3 미만이면 null
- checkCollapseVictory() → 상대 전원 OUT → 와해 승리!
- 이 경우 노크 승리가 아닌 와해 승리로 판정됨

**시나리오**: 노크 3회 달성 + 동시에 상대 전원 OUT
- checkKnockVictory() 먼저 실행 → 노크 승리 반환
- checkCollapseVictory() 실행되지 않음 (이미 victoryResult 존재)
- 노크 승리가 우선

### ExecuteAttackData 변경 영향 분석

**변경 범위 최소화:**
- ExecuteAttackData 타입 변경 없음 (victoryResult 필드 유지)
- victory/annihilation.ts → collapse.ts로 교체 (함수 시그니처 동일)
- reason 값만 'annihilation' → 'collapse'로 변경
- GameScene은 victoryResult를 그대로 전달하므로 코드 수정 최소

**기존 코드 영향:**
1. `packages/game-core/src/combat/attack.ts` - import 변경만
2. `packages/game-renderer/src/scenes/GameScene.ts` - 주석 변경만
3. `packages/game-core/tests/` - 테스트 파일 마이그레이션 (annihilation → collapse)

### Project Structure Notes

**신규 파일:**

```
packages/game-core/src/victory/
└── collapse.ts                    # 신규: 와해 승리 판정 함수

packages/game-core/tests/victory/
└── collapse.test.ts               # 신규: 와해 승리 판정 테스트

packages/game-core/tests/combat/
└── attack-collapse.test.ts        # 신규: 공격 후 와해 승리 통합 테스트
```

**삭제 파일:**

```
packages/game-core/src/victory/
└── annihilation.ts                # 삭제: collapse.ts로 대체

packages/game-core/tests/victory/
└── annihilation.test.ts           # 삭제: collapse.test.ts로 대체

packages/game-core/tests/combat/
└── attack-annihilation.test.ts    # 삭제: attack-collapse.test.ts로 대체
```

**수정 파일:**

```
packages/game-core/src/combat/
└── attack.ts                      # 수정: import 변경 (annihilation → collapse)

packages/game-core/src/victory/
├── index.ts                       # 수정: export 변경 (annihilation → collapse)
└── knock.ts                       # 수정: executeKnock()에 와해 승리 판정 추가

packages/game-renderer/src/scenes/
└── GameScene.ts                   # 수정: 주석만 업데이트
```

### 아키텍처 경계

```
┌─────────────────────────────────────────────────┐
│              apps/web (React)                   │
│  - VictoryBanner: 이미 'collapse' 처리됨        │
│  - GameCanvas: 기존 handleGameEnd 그대로 사용    │
│  - 수정 불필요                                  │
└─────────────────────────────────────────────────┘
                    ▲
                    │ 'game:end' 이벤트 (reason: 'collapse')
                    │
┌─────────────────────────────────────────────────┐
│        packages/game-renderer                   │
│  - GameScene: 기존 victoryResult 처리 그대로    │
│  - 주석 업데이트만                               │
└─────────────────────────────────────────────────┘
                    │
                    │ import
                    ▼
┌─────────────────────────────────────────────────┐
│          packages/game-core                     │
│  - victory/collapse.ts: 와해 승리 판정 (신규)   │
│  - victory/annihilation.ts: 삭제               │
│  - combat/attack.ts: collapse로 교체           │
│  - victory/knock.ts: 와해 판정 추가            │
│  - Phaser 의존성 없음                           │
└─────────────────────────────────────────────────┘
```

### 주의사항

1. **annihilation.ts 삭제 시 하위 호환성**
   - 외부에서 checkAnnihilationVictory를 직접 import하는 코드 확인 필요
   - attack.ts가 유일한 사용처 → 안전하게 삭제 가능
   - 테스트 파일도 함께 마이그레이션

2. **VictoryReason 타입에서 'annihilation' 유지 여부**
   - Phase 1에서는 사용되지 않지만, 향후 패전 복귀 구현 시 재사용 가능
   - 타입에서 제거하면 향후 다시 추가해야 하므로 유지 권장
   - 사용하지 않는 타입 유니온 멤버는 런타임 영향 없음

3. **executeKnock() 와해 판정 추가 시**
   - 기존 노크 승리 판정 이후에 추가 (우선순위 보장)
   - 노크로 OUT된 장수의 status가 'out'으로 올바르게 변경되었는지 확인
   - ExecuteKnockData.victoryResult 필드가 이미 존재하므로 타입 변경 불필요

4. **테스트 마이그레이션**
   - 기존 annihilation 테스트의 로직은 동일하므로 함수명과 reason 값만 변경
   - 새로운 테스트 케이스: executeKnock()에서의 와해 승리 시나리오 추가

### GDD 관련 요구사항

**와해 승리 (GDD 기반):**
- [WIN-004] 상대 장수 전원 OUT 시 와해 승리로 처리된다
- 게임 규칙 §7.3: 와해 = "아군 측의 모든 장수가 완전 퇴장된 상태"
- 게임 규칙 §8.2: 와해 승리 조건 (우선순위 3)
- 전멸과 와해는 서로 다른 개념 (§7.3)

**Epic 6 Story 4 (epics.md):**
- [WIN-004] 상대 장수 전원 OUT 시 와해 승리로 처리된다

### 다음 스토리 연결

**Story 6-5: 항복 (Surrender)**
- 플레이어의 항복 선언
- VictoryReason에 'surrender' 이미 추가됨
- 항복 UI 버튼 및 확인 모달 필요
- Epic 6의 마지막 스토리

### References

- [Source: _bmad-output/epics.md#Epic 6: 승리 조건] - Story [WIN-004] 정의
- [Source: docs/project-plan/02-game-rules.md#7.3 와해] - 와해 정의
- [Source: docs/project-plan/02-game-rules.md#8.2 승리 조건 목록] - 와해 승리 조건 상세
- [Source: packages/game-core/src/victory/annihilation.ts] - 기존 전멸 승리 판정 (대체 대상)
- [Source: packages/game-core/src/victory/knock.ts] - executeKnock() 현재 구현
- [Source: packages/game-core/src/combat/attack.ts] - executeAttack() 현재 구현
- [Source: packages/game-core/src/state/types.ts] - VictoryResult, VictoryReason, GameState
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - executeAttack(), executeKnock() 호출 패턴
- [Source: apps/web/src/components/game/VictoryBanner.tsx] - 'collapse' case 이미 구현
- [Source: _bmad-output/implementation-artifacts/6-3-annihilation-victory.md] - Story 6-3 학습 사항

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2026-02-09: Story 6-4 생성 - 와해 승리 (Collapse Victory) 스토리 컨텍스트 작성 완료
