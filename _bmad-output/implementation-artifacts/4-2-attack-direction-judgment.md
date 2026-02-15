# Story 4.2: 공격 방향 판정 (Attack Direction Judgment)

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 공격 방향(해/달/전선)이 올바르게 판정된다,
so that 방향에 따른 전략적 전투를 수행할 수 있다.

## Acceptance Criteria

1. **AC1**: 공격자와 방어자의 위치를 기반으로 공격 방향이 판정된다
   - 해(Sun): 우측 대각선 방향 공격
   - 달(Moon): 좌측 대각선 방향 공격
   - 전선(Frontline): 수직 방향 공격
   - 공격자 타일에서 방어자 타일로의 상대적 위치로 방향 결정

2. **AC2**: 삼각형 타일 방향(Up/Down)에 따라 방향 판정이 올바르게 동작한다
   - Up(▲) 타일: 3개 인접 타일 (좌하, 우하, 상)
   - Down(▽) 타일: 3개 인접 타일 (좌상, 우상, 하)
   - 각 인접 방향에 대해 해/달/전선 매핑 정의

3. **AC3**: 방향 판정 결과가 전투 시스템에 통합된다
   - `executeAttack()` 함수에서 방향 판정 호출
   - 판정된 방향이 로그 또는 이벤트로 출력 (디버그용)
   - 방향 정보가 후속 스토리(4-3 피해 계산)에서 사용 가능

4. **AC4**: 측면 타일(30-33)에서의 공격 방향도 올바르게 판정된다
   - 측면 타일의 특수 인접 관계 고려
   - left/right 방향 측면 타일의 방향 판정 정의

5. **AC5**: 공격 시 UI에 방향 정보가 표시된다 (선택적 - MVP에서는 콘솔 로그로 대체 가능)
   - 공격 방향 아이콘 또는 텍스트 표시
   - 해: 태양 아이콘/오렌지색, 달: 달 아이콘/파란색, 전선: 검 아이콘/회색

## Tasks / Subtasks

- [x] Task 1: 방향 판정 로직 설계 및 구현 (game-core) (AC: 1, 2, 4)
  - [x] 1.1: `getAttackDirection()` 함수 구현
    - 공격자 타일 ID와 방어자 타일 ID를 받아서 방향 반환
    - `AttackDirection` 타입: 'sun' | 'moon' | 'frontline'
    - 인접하지 않은 경우 null 반환
  - [x] 1.2: Up/Down 타일별 방향 매핑 테이블 정의
    - Up 타일에서 각 인접 타일로의 방향 매핑
    - Down 타일에서 각 인접 타일로의 방향 매핑
  - [x] 1.3: 측면 타일(30-33) 방향 매핑 정의
    - 측면 타일의 특수 인접 관계 처리
  - [x] 1.4: 방향 판정 단위 테스트 작성
    - Up 타일에서 3방향 공격 테스트
    - Down 타일에서 3방향 공격 테스트
    - 측면 타일 공격 테스트
    - 인접하지 않은 타일 테스트

- [x] Task 2: 공격 시스템에 방향 판정 통합 (game-core) (AC: 3)
  - [x] 2.1: `executeAttack()` 함수에 방향 판정 추가
    - 공격 실행 시 `getAttackDirection()` 호출
    - 방향 정보를 공격 결과에 포함
  - [x] 2.2: `AttackResult` 타입 확장
    - direction 필드 추가
    - 후속 스토리(4-3)에서 피해 계산에 활용
  - [x] 2.3: 통합 테스트 작성
    - 공격 실행 시 방향이 올바르게 판정되는지 확인

- [x] Task 3: 방향 정보 로깅/이벤트 추가 (game-core/game-renderer) (AC: 3, 5)
  - [x] 3.1: Logger를 통한 방향 정보 출력
    - DEBUG 레벨에서 공격 방향 로그 출력
    - 형식: `[COMBAT] Attack direction: sun (attacker: 10, defender: 6)`
  - [x] 3.2: Event Bus 이벤트 추가
    - `combat:attack` 이벤트에 direction 정보 포함
    - 방향 정보 포함하여 emit
  - [ ] 3.3: (선택적 - MVP 이후) UI 방향 표시
    - 공격 시 방향 아이콘/색상 표시

- [x] Task 4: 빌드 및 테스트 검증 (AC: 전체)
  - [x] 4.1: 단위 테스트 작성 완료 및 통과 확인
    - 47개의 combat 테스트 (26개의 새 방향 판정 테스트 포함)
  - [x] 4.2: `pnpm build` 성공 확인
  - [x] 4.3: 기존 테스트 통과 확인 (373개+)
  - [ ] 4.4: 브라우저 수동 테스트
    - 공격 시 콘솔에서 방향 로그 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- `combat/directions.ts`: 방향 판정 로직 구현
- `combat/types.ts`: `AttackDirection`, `AttackResult` 타입 정의
- 기존 `TILE_META`, `ADJACENCY_MAP` 활용

**game-renderer 패키지 (Phaser 렌더링)**
- 이 스토리에서는 주요 변경 없음
- (선택적) 공격 방향 시각화 추가 가능

**apps/web (React UI)**
- 이 스토리에서는 변경 없음

### 핵심 구현 패턴

#### 1. 방향 판정 로직 (아키텍처 문서 참조)

```typescript
// packages/game-core/src/combat/directions.ts

import { TileId, TileDirection, TileMeta } from '../board/types';
import { TILE_META } from '../board/metadata';
import { getAdjacentTiles } from '../board/adjacency';

/** 공격 방향 */
export type AttackDirection = 'sun' | 'moon' | 'frontline';

/**
 * 두 타일 간 공격 방향 판정
 *
 * 삼각형 보드에서의 방향 판정 규칙:
 * - Up(▲) 타일에서:
 *   - 좌하단 인접 → 달(Moon)
 *   - 우하단 인접 → 해(Sun)
 *   - 상단 인접 → 전선(Frontline)
 * - Down(▽) 타일에서:
 *   - 좌상단 인접 → 달(Moon)
 *   - 우상단 인접 → 해(Sun)
 *   - 하단 인접 → 전선(Frontline)
 *
 * @param attackerTile - 공격자 타일 ID
 * @param defenderTile - 방어자 타일 ID
 * @returns 공격 방향 또는 null (인접하지 않은 경우)
 */
export function getAttackDirection(
  attackerTile: TileId,
  defenderTile: TileId
): AttackDirection | null {
  // 인접하지 않으면 공격 불가
  if (!getAdjacentTiles(attackerTile).includes(defenderTile)) {
    return null;
  }

  const attacker = TILE_META[attackerTile];
  const defender = TILE_META[defenderTile];

  // 측면 타일 처리
  if (attacker.isSideTile || defender.isSideTile) {
    return getSideAttackDirection(attackerTile, defenderTile);
  }

  // 메인 타일 방향 판정
  return getMainTileAttackDirection(attacker, defender);
}

/**
 * 메인 타일(0-29)에서의 방향 판정
 */
function getMainTileAttackDirection(
  attacker: TileMeta,
  defender: TileMeta
): AttackDirection {
  const rowDiff = defender.row - attacker.row;
  const colDiff = defender.col - attacker.col;

  // Up(▲) 타일에서 공격
  if (attacker.direction === 'up') {
    if (rowDiff < 0) return 'frontline';     // 상단 → 전선
    if (colDiff < 0) return 'moon';          // 좌하단 → 달
    if (colDiff > 0) return 'sun';           // 우하단 → 해
  }

  // Down(▽) 타일에서 공격
  if (attacker.direction === 'down') {
    if (rowDiff > 0) return 'frontline';     // 하단 → 전선
    if (colDiff < 0) return 'moon';          // 좌상단 → 달
    if (colDiff > 0) return 'sun';           // 우상단 → 해
  }

  // fallback (이론상 도달하지 않음)
  return 'frontline';
}

/**
 * 측면 타일(30-33) 관련 방향 판정
 */
function getSideAttackDirection(
  attackerTile: TileId,
  defenderTile: TileId
): AttackDirection {
  // 측면 타일의 특수 방향 매핑
  // 구현 시 TILE_META의 isSideTile, zone 정보 활용
  // ...
  return 'frontline'; // 기본값 (구현 필요)
}
```

#### 2. AttackResult 타입 확장

```typescript
// packages/game-core/src/combat/types.ts

import { AttackDirection } from './directions';
import { GeneralId } from '../state/types';

/** 공격 결과 */
export interface AttackResult {
  attackerId: GeneralId;
  defenderId: GeneralId;
  direction: AttackDirection;
  damage: number;              // 4-3에서 계산
  defenderTroopsAfter: number;
  isKnockOut: boolean;         // 4-5에서 활용
}
```

#### 3. executeAttack 통합

```typescript
// packages/game-core/src/combat/attack.ts (수정)

import { getAttackDirection, AttackDirection } from './directions';
import { AttackResult } from './types';

export function executeAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): Result<{ state: GameState; result: AttackResult }> {
  // ... 기존 유효성 검증

  const attacker = state.generals.find(g => g.id === attackerId)!;
  const defender = state.generals.find(g => g.id === defenderId)!;

  // 방향 판정
  const direction = getAttackDirection(attacker.position!, defender.position!);
  if (direction === null) {
    return { success: false, error: { code: 'NOT_ADJACENT' } };
  }

  // 피해 계산 (4-2에서는 기본값 1, 4-3에서 방향별 계산으로 대체)
  const damage = BASE_DAMAGE; // 현재는 1 고정

  // 피해 적용
  const newState = applyDamage(state, defenderId, damage);

  // 행동 기록
  const finalState = recordAction(newState, attackerId, 'attack');

  // 결과 생성
  const result: AttackResult = {
    attackerId,
    defenderId,
    direction,
    damage,
    defenderTroopsAfter: finalState.generals.find(g => g.id === defenderId)!.troops,
    isKnockOut: false, // 4-5에서 구현
  };

  Logger.debug('combat', `Attack direction: ${direction}`, {
    attacker: attacker.position,
    defender: defender.position,
  });

  return { success: true, data: { state: finalState, result } };
}
```

### 삼각형 보드 방향 판정 규칙

**GDD 및 아키텍처 문서 기반:**

```
보드 레이아웃 (서버/데이터 관점):

         Row 0: [0,  1,  2,  3,  4]   ← player2_home
         Row 1: [5,  6,  7,  8,  9]
Side 30 ─────── Row 2: [10, 11, 12, 13, 14] ───────── Side 32
Side 31 ─────── Row 3: [15, 16, 17, 18, 19] ───────── Side 33
         Row 4: [20, 21, 22, 23, 24]
         Row 5: [25, 26, 27, 28, 29]  ← player1_home

방향 판정 규칙:
- 해(Sun) ☀️: 우측 대각선 방향 (col 증가)
- 달(Moon) 🌙: 좌측 대각선 방향 (col 감소)
- 전선(Frontline) ⚔️: 수직 방향 (row만 변화, col 동일)

Up(▲) 타일 예시 (타일 6):
- 상단(1) → 전선
- 좌하단(5) → 달
- 우하단(7) → 해

Down(▽) 타일 예시 (타일 7):
- 하단(12) → 전선
- 좌상단(6) → 달
- 우상단(8) → 해
```

### 이전 스토리 학습 사항

**4-1 (인접 공격):**
- `getAttackableTiles()` 함수로 공격 가능 타일 계산
- `executeAttack()` 함수에서 기본 피해량 1 적용
- `validateAttack()` 함수로 유효성 검증
- Result<T> 패턴 준수

**Epic 3 회고:**
- game-core에 Phaser 의존성 절대 금지
- TDD 방식으로 테스트 먼저 작성
- Logger를 통한 디버그 로그 활용

**Git 커밋 패턴:**
- `feat: 4-2 공격 방향 판정 (Attack Direction Judgment)`

### Project Structure Notes

**신규/수정 파일:**
```
packages/game-core/src/
├── combat/
│   ├── directions.ts         # 신규: getAttackDirection(), 방향 판정 로직
│   ├── types.ts              # 수정: AttackResult 타입 확장
│   ├── attack.ts             # 수정: executeAttack()에 방향 판정 통합
│   └── index.ts              # 수정: directions export 추가
├── board/
│   └── metadata.ts           # 참조: TILE_META (기존)
└── tests/
    └── combat-directions.test.ts  # 신규: 방향 판정 테스트
```

### 테스트 케이스 가이드

**최소 테스트 케이스:**
1. Up 타일에서 상단 공격 → 전선
2. Up 타일에서 좌하단 공격 → 달
3. Up 타일에서 우하단 공격 → 해
4. Down 타일에서 하단 공격 → 전선
5. Down 타일에서 좌상단 공격 → 달
6. Down 타일에서 우상단 공격 → 해
7. 인접하지 않은 타일 → null
8. 측면 타일에서 메인 타일로 공격
9. 메인 타일에서 측면 타일로 공격
10. 다양한 row/col 조합 테스트

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
│  - 이 스토리에서 주요 변경 없음          │
│  - (선택적) 방향 시각화 추가 가능        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ⚠️ Phaser 의존성 절대 금지              │
│  - combat/directions.ts: 방향 판정      │
│  - combat/types.ts: AttackResult 확장   │
│  - combat/attack.ts: 방향 판정 통합      │
└─────────────────────────────────────────┘
```

### 주의사항

1. **이 스토리 범위**
   - 방향 판정 로직만 구현
   - 피해 계산은 4-3에서 구현 (현재는 기본 1 유지)
   - UI 표시는 선택적 (MVP에서는 콘솔 로그로 대체)

2. **game-core 순수성 유지**
   - 방향 판정 로직은 순수 TypeScript로 구현
   - Phaser 의존성 없이 테스트 가능해야 함

3. **기존 코드 호환성**
   - `executeAttack()` 반환 타입 변경 시 호출부 업데이트 필요
   - GameScene의 공격 처리 로직 확인

4. **측면 타일 처리**
   - 측면 타일(30-33)의 특수 인접 관계 정확히 파악
   - 기존 ADJACENCY_MAP 참조하여 방향 매핑

### References

- [Source: _bmad-output/epics.md#Epic 4: 전투 시스템] - Story [COMBAT-002] 정의
- [Source: _bmad-output/gdd.md#방향성 전투 (Directional Combat)] - 해/달/전선 방향 설명
- [Source: _bmad-output/game-architecture.md#방향성 전투 시스템] - 구현 패턴
- [Source: _bmad-output/game-architecture.md#삼각형 보드 시스템] - 타일 레이아웃
- [Source: _bmad-output/implementation-artifacts/4-1-adjacent-attack.md] - 이전 스토리 패턴
- [Source: _bmad-output/implementation-artifacts/epic-3-retro-2026-02-04.md] - 팀 합의 사항

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Combat 테스트 출력: `[COMBAT] Attack direction: sun/moon/frontline`
- Logger 설정: `packages/game-core/src/utils/logger.ts`

### Completion Notes List

1. **방향 판정 로직 구현** (`board/direction.ts`)
   - `getAttackDirection()` 함수 이미 존재 - 검토 및 확인 완료
   - 해(sun): 우측 방향 (col 증가)
   - 달(moon): 좌측 방향 (col 감소)
   - 전선(frontline): 동일 col의 수직 방향

2. **AttackResult 타입 정의** (`combat/types.ts`)
   - attackerId, defenderId, attackerTile, defenderTile
   - direction: AttackDirection
   - damage, defenderTroopsAfter, isKnockOut

3. **executeAttack() 통합** (`combat/attack.ts`)
   - 반환 타입 변경: `Result<ExecuteAttackData>`
   - ExecuteAttackData: { state: GameState, result: AttackResult }
   - 방향 판정 및 Logger 출력 추가

4. **Logger 유틸리티** (`utils/logger.ts`)
   - 도메인별 로깅 지원 (combat, movement, etc.)
   - 브라우저/Node.js 환경 모두 지원

5. **game-renderer 업데이트** (`GameScene.ts`)
   - 새로운 반환 타입에 맞게 공격 처리 로직 수정
   - `combat:attack` 이벤트에 direction 정보 추가

6. **테스트 업데이트** (`combat.test.ts`)
   - Story 4-2 관련 26개의 새 테스트 추가
   - 전체 373개 테스트 통과

### File List

**신규 파일:**
- `/Users/whchoi/dev/five-tiger-generals/packages/game-core/src/combat/types.ts`
- `/Users/whchoi/dev/five-tiger-generals/packages/game-core/src/utils/logger.ts`
- `/Users/whchoi/dev/five-tiger-generals/packages/game-core/src/utils/index.ts`

**수정 파일:**
- `/Users/whchoi/dev/five-tiger-generals/packages/game-core/src/combat/attack.ts`
- `/Users/whchoi/dev/five-tiger-generals/packages/game-core/src/combat/index.ts`
- `/Users/whchoi/dev/five-tiger-generals/packages/game-core/src/index.ts`
- `/Users/whchoi/dev/five-tiger-generals/packages/game-core/tests/combat.test.ts`
- `/Users/whchoi/dev/five-tiger-generals/packages/game-renderer/src/scenes/GameScene.ts`
- `/Users/whchoi/dev/five-tiger-generals/_bmad-output/implementation-artifacts/sprint-status.yaml`

