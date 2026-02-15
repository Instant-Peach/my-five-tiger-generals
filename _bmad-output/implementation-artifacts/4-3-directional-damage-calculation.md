# Story 4.3: 방향별 데미지 계산 (Directional Damage Calculation)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 공격 방향(해/달/전선)에 따라 다른 스탯으로 피해가 계산된다,
so that 전략적으로 유리한 방향에서 공격하여 더 높은 피해를 줄 수 있다.

## Acceptance Criteria

1. **AC1**: 해(Sun) 방향 공격 시 공격자의 sun 스탯과 방어자의 sun 스탯으로 피해가 계산된다
   - 피해량 = 공격자 sun - 방어자 sun
   - 최소 피해량은 0 (음수 불가)
   - 공격자 sun > 방어자 sun 일 때만 피해 발생

2. **AC2**: 달(Moon) 방향 공격 시 공격자의 moon 스탯과 방어자의 moon 스탯으로 피해가 계산된다
   - 피해량 = 공격자 moon - 방어자 moon
   - 최소 피해량은 0 (음수 불가)
   - 공격자 moon > 방어자 moon 일 때만 피해 발생

3. **AC3**: 전선(Frontline) 방향 공격 시 고정 피해량 1이 적용된다
   - 스탯과 무관하게 항상 1 피해
   - GDD 정의: "전선(Frontline) ⚔️: **1 (고정)**, 수평 방향, 최소 피해"

4. **AC4**: 피해 계산 결과가 AttackResult에 정확히 반영된다
   - damage 필드에 계산된 피해량
   - defenderTroopsAfter 필드에 피해 적용 후 병력
   - 로그에 피해 계산 세부 정보 출력

5. **AC5**: 기존 테스트들이 새로운 피해 계산 로직과 호환된다
   - 기존 combat 테스트 업데이트
   - 새로운 방향별 피해 테스트 추가
   - 전체 테스트 통과

## Tasks / Subtasks

- [x] Task 1: 피해 계산 로직 설계 및 구현 (game-core) (AC: 1, 2, 3)
  - [x] 1.1: `calculateDamage()` 함수 구현
    - 공격자 General, 방어자 General, 방향(AttackDirection)을 받아서 피해량 반환
    - 해/달 방향: 공격자 스탯 - 방어자 스탯 (최소 0)
    - 전선 방향: 고정 1
  - [x] 1.2: `getAttackStat()` 헬퍼 함수 구현
    - General과 direction을 받아서 해당 방향 공격 스탯 반환
    - sun 방향 → general.stats.sun
    - moon 방향 → general.stats.moon
    - frontline 방향 → 사용 안 함 (고정 1)
  - [x] 1.3: `getDefendStat()` 헬퍼 함수 구현
    - General과 direction을 받아서 해당 방향 방어 스탯 반환
    - sun 방향 → general.stats.sun
    - moon 방향 → general.stats.moon
    - frontline 방향 → 사용 안 함 (고정 1)
  - [x] 1.4: 상수 정의 추가
    - `COMBAT.FRONTLINE_DAMAGE = 1` (상수 파일에 추가)
    - `COMBAT.MIN_DAMAGE = 0`

- [x] Task 2: executeAttack 통합 (game-core) (AC: 4)
  - [x] 2.1: `executeAttack()` 함수 수정
    - 기존 `BASE_DAMAGE` 대신 `calculateDamage()` 호출
    - 공격자/방어자 General 엔티티와 방향 전달
  - [x] 2.2: 로깅 개선
    - 피해 계산 세부 정보 로그 출력
    - 형식: `[COMBAT] Damage: 3 (sun: attacker 5 - defender 2)`
    - 형식: `[COMBAT] Damage: 1 (frontline: fixed)`

- [x] Task 3: 단위 테스트 작성 (game-core) (AC: 5)
  - [x] 3.1: calculateDamage 테스트
    - Sun 방향: 공격자 sun 5, 방어자 sun 2 → 피해 3
    - Moon 방향: 공격자 moon 4, 방어자 moon 3 → 피해 1
    - Frontline 방향: 스탯 무관 → 피해 1
    - 방어자 스탯이 더 높은 경우 → 피해 0
  - [x] 3.2: executeAttack 통합 테스트
    - 관우(sun:4) → 황충(sun:5) Sun 공격 → 피해 0 (황충 sun이 더 높음)
    - 장비(sun:5) → 조운(sun:3) Sun 공격 → 피해 2
    - 조운(moon:4) → 장비(moon:3) Moon 공격 → 피해 1
    - 전선 공격 → 피해 1 (고정)
  - [x] 3.3: 기존 테스트 업데이트
    - 기본 피해 1 기대하는 테스트 → 방향별 피해로 수정
    - 필요시 테스트 장수/방향 조합 조정

- [x] Task 4: 빌드 및 검증 (AC: 전체)
  - [x] 4.1: 단위 테스트 통과 확인 (`pnpm test`)
  - [x] 4.2: 빌드 성공 확인 (`pnpm build`)
  - [x] 4.3: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [ ] 4.4: 브라우저 수동 테스트
    - 다양한 장수 조합으로 공격 테스트
    - 콘솔에서 피해 계산 로그 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- `combat/damage.ts`: 새 파일 - 피해 계산 로직 구현
- `combat/attack.ts`: 수정 - calculateDamage() 통합
- `constants/combat.ts`: 수정 - FRONTLINE_DAMAGE 상수 추가

**game-renderer 패키지 (Phaser 렌더링)**
- 이 스토리에서는 변경 없음
- (후속 스토리 4-6에서 피해 시각화 구현)

**apps/web (React UI)**
- 이 스토리에서는 변경 없음

### 핵심 구현 패턴

#### 1. 피해 계산 함수 (GDD/아키텍처 문서 기반)

```typescript
// packages/game-core/src/combat/damage.ts

import type { General } from '../generals/types';
import type { AttackDirection } from '../board/types';
import { COMBAT } from '../constants';

/**
 * 방향에 따른 공격 스탯 조회
 */
export function getAttackStat(general: General, direction: AttackDirection): number {
  switch (direction) {
    case 'sun':
      return general.stats.sun;
    case 'moon':
      return general.stats.moon;
    case 'frontline':
      return 0; // 전선은 스탯 미사용 (고정 피해)
  }
}

/**
 * 방향에 따른 방어 스탯 조회
 */
export function getDefendStat(general: General, direction: AttackDirection): number {
  switch (direction) {
    case 'sun':
      return general.stats.sun;
    case 'moon':
      return general.stats.moon;
    case 'frontline':
      return 0; // 전선은 스탯 미사용 (고정 피해)
  }
}

/**
 * 전투 피해 계산
 *
 * GDD 기준:
 * - 해(Sun) ☀️: 공격자 sun - 방어자 sun (최소 0)
 * - 달(Moon) 🌙: 공격자 moon - 방어자 moon (최소 0)
 * - 전선(Frontline) ⚔️: 고정 1 피해
 *
 * @param attacker 공격자 장수
 * @param defender 방어자 장수
 * @param direction 공격 방향
 * @returns 피해량
 */
export function calculateDamage(
  attacker: General,
  defender: General,
  direction: AttackDirection
): number {
  // 전선은 고정 피해
  if (direction === 'frontline') {
    return COMBAT.FRONTLINE_DAMAGE;
  }

  // 해/달: 공격 스탯 - 방어 스탯 (최소 0)
  const attackStat = getAttackStat(attacker, direction);
  const defendStat = getDefendStat(defender, direction);

  return Math.max(COMBAT.MIN_DAMAGE, attackStat - defendStat);
}
```

#### 2. 상수 추가

```typescript
// packages/game-core/src/constants/combat.ts (수정)

/**
 * 전투 상수
 */
export const COMBAT = {
  /** 전선 방향 고정 피해량 */
  FRONTLINE_DAMAGE: 1,
  /** 최소 피해량 */
  MIN_DAMAGE: 0,
  /** 공격 방향 목록 */
  DIRECTIONS: ['sun', 'moon', 'frontline'] as const,
} as const;
```

#### 3. executeAttack 수정

```typescript
// packages/game-core/src/combat/attack.ts (수정)

import { calculateDamage } from './damage';

export function executeAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): Result<ExecuteAttackData> {
  // ... 기존 검증 로직 ...

  // 3. 방향 판정 (Story 4-2)
  const direction = getAttackDirection(attackerTile, defenderTile);

  // 4. 피해 계산 (Story 4-3 - 방향별 계산)
  const damage = calculateDamage(attacker, defender, direction);

  // 5. 피해 적용
  const defenderTroopsAfter = Math.max(0, defender.troops - damage);

  // ... 이하 동일 ...

  // 개선된 로깅
  if (direction === 'frontline') {
    Logger.debug('combat', `Damage: ${damage} (frontline: fixed)`);
  } else {
    const attackStat = getAttackStat(attacker, direction);
    const defendStat = getDefendStat(defender, direction);
    Logger.debug('combat',
      `Damage: ${damage} (${direction}: attacker ${attackStat} - defender ${defendStat})`
    );
  }

  // ...
}
```

### GDD/아키텍처 문서 기반 피해 계산 규칙

```
방향성 전투 (Directional Combat)

| 방향 | 아이콘 | 공격력 | 특성 |
|------|--------|--------|------|
| 해(Sun) | ☀️ | Sun 스탯 | 우측 대각선 공격 |
| 달(Moon) | 🌙 | Moon 스탯 | 좌측 대각선 공격 |
| 전선(Frontline) | ⚔️ | **1 (고정)** | 수평 방향, 최소 피해 |

피해 계산:
- 해/달: 공격자 스탯 - 방어자 스탯 (최소 0)
- 전선: 고정 1 (스탯 무관)
```

### 장수별 스탯 참조 (테스트용)

```typescript
| 장수   | 별  | Sun | Moon | 발  |
|--------|-----|-----|------|-----|
| 관우   | 5   | 4   | 4    | 2   |
| 장비   | 4   | 5   | 3    | 2   |
| 조운   | 4   | 3   | 4    | 3   |
| 황충   | 3   | 5   | 2    | 2   |
| 마초   | 5   | 4   | 3    | 3   |
```

**예시 피해 계산:**
- 장비(sun:5) → 관우(sun:4) Sun 공격: 5-4 = **1 피해**
- 관우(sun:4) → 황충(sun:5) Sun 공격: 4-5 = **0 피해** (방어 우위)
- 조운(moon:4) → 장비(moon:3) Moon 공격: 4-3 = **1 피해**
- 황충(moon:2) → 관우(moon:4) Moon 공격: 2-4 = **0 피해** (방어 우위)
- 아무 장수 → 아무 장수 Frontline 공격: **1 피해** (고정)

### 이전 스토리 학습 사항

**4-2 (공격 방향 판정):**
- `getAttackDirection()` 함수로 방향 판정 완료
- `AttackResult` 타입에 direction 필드 포함
- Logger를 통한 디버그 로그 출력 패턴

**4-1 (인접 공격):**
- `executeAttack()` 함수 구조
- Result<T> 패턴 준수
- 행동 기록 (performedActions) 처리

**Epic 3 회고:**
- game-core에 Phaser 의존성 절대 금지
- TDD 방식으로 테스트 먼저 작성
- Logger를 통한 디버그 로그 활용

**Git 커밋 패턴:**
- `feat: 4-3 방향별 데미지 계산 (Directional Damage Calculation)`

### Project Structure Notes

**신규 파일:**
```
packages/game-core/src/
├── combat/
│   └── damage.ts         # 신규: calculateDamage(), getAttackStat(), getDefendStat()
```

**수정 파일:**
```
packages/game-core/src/
├── combat/
│   ├── attack.ts         # 수정: calculateDamage() 통합
│   └── index.ts          # 수정: damage export 추가
├── constants/
│   └── combat.ts         # 수정: COMBAT 상수 확장
└── tests/
    └── combat.test.ts    # 수정: 방향별 피해 테스트 추가
```

### 테스트 케이스 가이드

**최소 테스트 케이스:**
1. Sun 방향 - 공격자 스탯 > 방어자 스탯 → 차이만큼 피해
2. Sun 방향 - 공격자 스탯 < 방어자 스탯 → 0 피해
3. Sun 방향 - 공격자 스탯 = 방어자 스탯 → 0 피해
4. Moon 방향 - 공격자 스탯 > 방어자 스탯 → 차이만큼 피해
5. Moon 방향 - 공격자 스탯 < 방어자 스탯 → 0 피해
6. Moon 방향 - 공격자 스탯 = 방어자 스탯 → 0 피해
7. Frontline 방향 - 높은 스탯 조합 → 1 피해 (고정)
8. Frontline 방향 - 낮은 스탯 조합 → 1 피해 (고정)
9. executeAttack 통합 - 실제 장수로 피해 계산 확인
10. 기존 테스트 호환성 확인

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  - 이 스토리에서 변경 없음               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  - 이 스토리에서 변경 없음               │
│  - (4-6에서 피해 시각화 구현)            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ⚠️ Phaser 의존성 절대 금지              │
│  - combat/damage.ts: 피해 계산 로직     │
│  - combat/attack.ts: 피해 계산 통합      │
│  - constants/combat.ts: 상수 추가        │
└─────────────────────────────────────────┘
```

### 주의사항

1. **이 스토리 범위**
   - 피해 계산 로직만 구현
   - 병력 감소 처리는 이미 4-1에서 구현됨
   - UI 피해 표시는 4-6에서 구현

2. **game-core 순수성 유지**
   - 피해 계산 로직은 순수 TypeScript로 구현
   - Phaser 의존성 없이 테스트 가능해야 함

3. **기존 테스트 호환성**
   - 기존 테스트에서 BASE_DAMAGE(1) 기대하는 부분 수정 필요
   - 테스트 장수/방향 조합을 적절히 선택하여 예상 피해 맞추기

4. **전선 피해 특별 처리**
   - 전선은 무조건 1 피해 (방어 측 유리한 방향이라도 피해 발생)
   - 교착 상태/마무리 공격 용도

### References

- [Source: _bmad-output/epics.md#Epic 4: 전투 시스템] - Story [COMBAT-003] 정의
- [Source: _bmad-output/gdd.md#방향성 전투 (Directional Combat)] - 피해 계산 규칙
- [Source: _bmad-output/game-architecture.md#방향성 전투 시스템] - 구현 패턴
- [Source: _bmad-output/game-architecture.md#Cross-cutting Concerns] - Result 타입, Logger 사용
- [Source: _bmad-output/implementation-artifacts/4-2-attack-direction-judgment.md] - 이전 스토리 패턴
- [Source: packages/game-core/src/combat/attack.ts] - 현재 공격 실행 로직
- [Source: packages/game-core/src/generals/constants.ts] - 장수 스탯 데이터

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 피해 계산 로깅 형식: `[COMBAT] Damage: X (direction: attacker Y - defender Z)`
- 전선 피해 로깅 형식: `[COMBAT] Damage: 1 (frontline: fixed)`

### Completion Notes List

- **Task 1**: `damage.ts` 파일에 `calculateDamage()`, `getAttackStat()`, `getDefendStat()` 함수 구현. GDD 기준 피해 계산 규칙 준수 (해/달: 스탯 차이, 전선: 고정 1). `COMBAT` 상수 객체에 `FRONTLINE_DAMAGE`, `MIN_DAMAGE` 추가.
- **Task 2**: `executeAttack()` 함수에서 기존 `BASE_DAMAGE` 대신 `calculateDamage()` 호출하도록 수정. 피해 계산 세부 정보 로깅 추가.
- **Task 3**: 방향별 피해 계산 테스트 31개 추가. 기존 테스트 중 피해량 1을 기대하는 테스트들을 frontline 공격으로 수정하여 호환성 유지. 전체 403개 테스트 통과.
- **Task 4**: 단위 테스트 100% 통과, 빌드 성공, 타입 체크 통과 확인.

### File List

**신규 파일:**
- `packages/game-core/src/combat/damage.ts` - 피해 계산 로직 (calculateDamage, getAttackStat, getDefendStat)

**수정 파일:**
- `packages/game-core/src/combat/attack.ts` - calculateDamage() 통합 및 로깅 개선
- `packages/game-core/src/combat/index.ts` - damage 함수들 export 추가
- `packages/game-core/src/constants/combat.ts` - COMBAT 상수 객체 추가
- `packages/game-core/src/constants/index.ts` - COMBAT export 추가
- `packages/game-core/tests/combat.test.ts` - Story 4-3 테스트 추가 및 기존 테스트 수정

## Change Log

- 2026-02-04: Story 4-3 구현 완료 - 방향별 데미지 계산 로직 (해: sun 스탯, 달: moon 스탯, 전선: 고정 1)
