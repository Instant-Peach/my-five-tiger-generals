# Story 4.1: 인접 공격 (Adjacent Attack)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 인접한 적 장수를 공격할 수 있다,
so that 전투를 통해 상대 병력을 감소시키고 승리 조건을 달성할 수 있다.

## Acceptance Criteria

1. **AC1**: 장수 선택 시 공격 가능한 인접 적 장수가 표시된다
   - 선택된 장수의 인접 타일(변 인접)에 적 장수가 있는지 확인
   - 공격 가능한 적 장수 타일에 공격 가능 표시 (예: 빨간색 하이라이트)
   - 이동 가능 타일 하이라이트와 공격 가능 타일 하이라이트가 동시에 표시됨

2. **AC2**: 공격 가능한 적 타일을 탭/클릭하면 공격이 실행된다
   - 공격 가능 타일 탭 시 공격 실행
   - 공격은 1 행동을 소모함
   - 공격 후 공격 가능 타일 하이라이트 해제

3. **AC3**: 공격 후 피해 계산 결과가 적용된다
   - 이 스토리에서는 기본 피해량 1 고정 (방향별 피해 계산은 4-3에서 구현)
   - 방어자 병력이 피해량만큼 감소
   - 피해 결과가 게임 상태에 반영됨

4. **AC4**: 동일 장수는 같은 턴에 두 번 공격할 수 없다
   - 행동 제한 시스템(PerformedAction) 활용
   - 이미 공격한 장수는 같은 턴에 다시 공격 불가
   - 다른 장수는 공격 가능

5. **AC5**: 턴당 최대 3회 행동 제한이 적용된다
   - 공격도 1 행동으로 카운트
   - 이동 + 공격 조합 가능 (다른 행동이므로)
   - 3회 행동 소진 시 추가 행동 불가

## Tasks / Subtasks

- [x] Task 1: 공격 가능 타일 계산 로직 구현 (game-core) (AC: 1)
  - [x] 1.1: `getAttackableTiles()` 함수 구현
    - 선택된 장수의 인접 타일(변 인접) 중 적 장수가 있는 타일 반환
    - `getAdjacentTiles()` 함수 활용
    - blocked 개념 불필요 (적 위치에 공격하는 것이므로)
  - [x] 1.2: 공격 가능 타일 계산 테스트 작성
    - 인접 적 장수 있는 경우 / 없는 경우
    - 아군 장수는 공격 불가
    - 여러 적 장수가 인접한 경우

- [x] Task 2: 공격 실행 로직 구현 (game-core) (AC: 2, 3, 4, 5)
  - [x] 2.1: `executeAttack()` 함수 구현
    - 공격자, 방어자 ID 받아서 공격 실행
    - 기본 피해량 1 적용 (방향 판정은 4-2, 피해 계산은 4-3에서)
    - 방어자 병력 감소 처리
    - 행동 소모 처리 (ActionType: 'attack')
  - [x] 2.2: 공격 유효성 검증 로직
    - 공격자가 현재 플레이어의 장수인지 확인
    - 방어자가 적 장수인지 확인
    - 인접 타일인지 확인
    - 동일 장수 동일 행동 제한 확인
    - 행동력 남아있는지 확인
  - [x] 2.3: 공격 테스트 작성
    - 유효한 공격 실행 테스트
    - 유효하지 않은 공격 거부 테스트
    - 행동 제한 테스트

- [x] Task 3: 공격 가능 타일 시각화 (game-renderer) (AC: 1)
  - [x] 3.1: BoardRenderer에 공격 가능 타일 표시 메서드 추가
    - `showAttackableTiles(tileIds: TileId[])`: 빨간색 하이라이트
    - `clearAttackableTiles()`: 공격 가능 타일 해제
    - 색상: 빨간색 (0xFF6B6B) 또는 오렌지 (0xFF8C00), 70% opacity
  - [x] 3.2: 이동 가능 타일과 공격 가능 타일 동시 표시
    - 이동 가능: 연두색 (0x90EE90)
    - 공격 가능: 빨간색/오렌지 계열
    - 두 하이라이트가 겹치지 않음 (인접 타일에 적이 있으면 공격만 표시)

- [x] Task 4: GameScene 공격 통합 (AC: 전체)
  - [x] 4.1: 장수 선택 시 공격 가능 타일 계산 및 표시
    - 선택된 장수 기준 `getAttackableTiles()` 호출
    - `showAttackableTiles()` 호출
  - [x] 4.2: 공격 가능 타일 클릭 시 공격 실행
    - 클릭 이벤트에서 공격 가능 타일인지 확인
    - `executeAttack()` 호출
    - 결과에 따라 UI 업데이트
  - [x] 4.3: 장수 선택 해제 시 공격 가능 타일 해제
    - `clearAttackableTiles()` 호출

- [x] Task 5: 통합 테스트 및 빌드 검증 (AC: 전체)
  - [x] 5.1: 단위 테스트 작성
    - game-core: 공격 가능 타일 계산, 공격 실행 테스트
    - game-renderer: 공격 타일 시각화 테스트 (선택적)
  - [x] 5.2: 빌드 및 기존 테스트 통과 확인
    - `pnpm build` 성공
    - 기존 테스트 통과 (352개+)
  - [x] 5.3: 브라우저 수동 테스트
    - 공격 가능 타일 표시 확인
    - 공격 실행 및 병력 감소 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- `getAttackableTiles()` 함수: 인접 타일 중 적 장수 위치 반환
- `executeAttack()` 함수: 공격 실행 및 피해 적용
- `canAttack()` 함수: 공격 유효성 검증
- 기존 `getAdjacentTiles()`, 행동 제한 시스템 활용

**game-renderer 패키지 (Phaser 렌더링)**
- `BoardRenderer`: 공격 가능 타일 하이라이트 추가
- 기존 이동 가능 타일 하이라이트와 공존

**apps/web (React UI)**
- 이 스토리에서는 React UI 변경 없음

### 핵심 구현 패턴

#### 1. 공격 가능 타일 계산

```typescript
// packages/game-core/src/combat/attackable.ts (신규)

import { TileId } from '../board/types';
import { getAdjacentTiles } from '../board/adjacency';
import { GameState, PlayerId, GeneralId } from '../state/types';

/**
 * 공격 가능한 타일 목록 반환
 *
 * @param state - 현재 게임 상태
 * @param generalId - 공격자 장수 ID
 * @returns 공격 가능한 타일 ID 배열
 */
export function getAttackableTiles(
  state: GameState,
  generalId: GeneralId
): TileId[] {
  const attacker = state.generals.find(g => g.id === generalId);
  if (!attacker || attacker.position === null) return [];

  const attackerPlayerId = attacker.playerId;
  const adjacentTiles = getAdjacentTiles(attacker.position);

  // 인접 타일 중 적 장수가 있는 타일 필터링
  return adjacentTiles.filter(tileId => {
    const generalOnTile = state.generals.find(
      g => g.position === tileId && g.playerId !== attackerPlayerId
    );
    return generalOnTile !== undefined;
  });
}
```

#### 2. 공격 실행 로직

```typescript
// packages/game-core/src/combat/attack.ts (신규)

import { Result } from '../utils/result';
import { GameState, GeneralId, ActionType } from '../state/types';
import { getAdjacentTiles } from '../board/adjacency';
import { GameErrorCode } from '../utils/errors';

const BASE_DAMAGE = 1; // 기본 피해량 (4-3에서 방향별 계산으로 대체)

/**
 * 공격 실행
 *
 * @param state - 현재 게임 상태
 * @param attackerId - 공격자 장수 ID
 * @param defenderId - 방어자 장수 ID
 * @returns 업데이트된 게임 상태 또는 에러
 */
export function executeAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): Result<GameState> {
  // 1. 공격 유효성 검증
  const validationResult = validateAttack(state, attackerId, defenderId);
  if (!validationResult.success) {
    return validationResult;
  }

  // 2. 피해 적용 (기본 1 피해)
  const newState = applyDamage(state, defenderId, BASE_DAMAGE);

  // 3. 행동 기록
  const finalState = recordAction(newState, attackerId, 'attack');

  return { success: true, data: finalState };
}

/**
 * 공격 유효성 검증
 */
export function validateAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): Result<void> {
  const attacker = state.generals.find(g => g.id === attackerId);
  const defender = state.generals.find(g => g.id === defenderId);

  // 장수 존재 확인
  if (!attacker || !defender) {
    return { success: false, error: { code: 'GENERAL_NOT_FOUND' } };
  }

  // 현재 플레이어 장수인지 확인
  if (attacker.playerId !== state.currentPlayerId) {
    return { success: false, error: { code: 'NOT_YOUR_TURN' } };
  }

  // 적 장수인지 확인
  if (defender.playerId === attacker.playerId) {
    return { success: false, error: { code: 'CANNOT_ATTACK_ALLY' } };
  }

  // 인접 타일인지 확인
  if (!getAdjacentTiles(attacker.position!).includes(defender.position!)) {
    return { success: false, error: { code: 'NOT_ADJACENT' } };
  }

  // 동일 장수 동일 행동 제한 확인
  const alreadyAttacked = state.performedActions.some(
    a => a.generalId === attackerId && a.actionType === 'attack'
  );
  if (alreadyAttacked) {
    return { success: false, error: { code: 'ALREADY_PERFORMED_ACTION' } };
  }

  // 행동력 확인
  if (state.actionsRemaining <= 0) {
    return { success: false, error: { code: 'NO_ACTIONS_REMAINING' } };
  }

  return { success: true, data: undefined };
}
```

#### 3. 공격 가능 타일 시각화

```typescript
// packages/game-renderer/src/rendering/BoardRenderer.ts (확장)

private attackHighlights: Phaser.GameObjects.Graphics | null = null;
private attackableTiles: TileId[] = [];

const ATTACKABLE_TILE_COLOR = 0xFF6B6B; // 빨간색
const ATTACKABLE_TILE_ALPHA = 0.7;

/**
 * 공격 가능 타일 표시
 */
showAttackableTiles(tileIds: TileId[]): void {
  this.clearAttackableTiles();

  if (tileIds.length === 0) return;

  this.attackableTiles = tileIds;

  if (!this.attackHighlights) {
    this.attackHighlights = this.scene.add.graphics();
  }

  this.attackHighlights.fillStyle(ATTACKABLE_TILE_COLOR, ATTACKABLE_TILE_ALPHA);

  for (const tileId of tileIds) {
    const center = this.getTileCentroid(tileId);
    // 삼각형 타일 하이라이트 그리기
    this.drawTileHighlight(this.attackHighlights, tileId, center);
  }
}

/**
 * 공격 가능 타일 해제
 */
clearAttackableTiles(): void {
  if (this.attackHighlights) {
    this.attackHighlights.clear();
  }
  this.attackableTiles = [];
}
```

### GDD 및 아키텍처 참고

**GDD - 전투 시스템:**
- Epic 4: 전투 시스템 - "장수가 인접한 적을 공격할 수 있다"
- [COMBAT-001]: 플레이어는 인접한 적 장수를 공격할 수 있다
- 인접 타일: 변을 공유하는 타일로만 공격 가능
- 공격 = 1 행동 소모

**아키텍처 - Action Economy:**
- 턴당 최대 3회 행동
- 동일 장수 동일 행동 제한
- ActionType: 'move' | 'attack' | 'tactic'

**아키텍처 - Cross-cutting Concerns:**
- Result<T> 패턴으로 에러 처리
- Event Bus: `combat:attack` 이벤트 추가 가능
- Logger: 디버그 모드에서 공격 로그 출력

### 이전 스토리/에픽 학습 사항

**Epic 3 회고에서 학습:**
- game-core에 Phaser 의존성 절대 금지 (계속 준수)
- Public getter로 데이터 노출 (private 접근 금지)
- 게임 루프 내 new 사용 금지 (객체 재사용)
- Result<T> 패턴으로 에러 처리 통일
- TDD가 설계를 이끈다 - 테스트 먼저 작성

**3-1 (이동 가능 타일 표시):**
- `getMovableTilesForGeneral()` 함수 패턴 참고
- `BoardRenderer.showMovableTiles()` 패턴 재사용
- 하이라이트 색상 구분 필요 (이동: 연두색, 공격: 빨간색)

**3-2 (장수 이동):**
- `moveGeneral()` 함수의 유효성 검증 패턴 참고
- 행동 제한 시스템 (ActionType, PerformedAction) 재사용

**3-4 (경로 차단):**
- `getOccupiedTiles()` 함수 참고 (차단된 타일 계산)

### Git 커밋 패턴

**최근 커밋 형식:**
- `feat: {story-id} {기능 설명}` - 예: `feat: 4-1 인접 공격 (Adjacent Attack)`
- `fix:` - 코드 리뷰 후 수정
- 디버그 코드(console.log) 제거 필수

### Project Structure Notes

**신규/수정 파일:**
```
packages/game-core/src/
├── combat/
│   ├── index.ts               # export 추가
│   ├── attackable.ts          # 신규: getAttackableTiles()
│   └── attack.ts              # 신규: executeAttack(), validateAttack()
├── state/
│   └── types.ts               # 수정: GameErrorCode 확장 (CANNOT_ATTACK_ALLY, NOT_ADJACENT)
└── tests/
    └── combat.test.ts         # 신규: 공격 테스트

packages/game-renderer/src/
└── rendering/
    └── BoardRenderer.ts       # 수정: showAttackableTiles(), clearAttackableTiles()
```

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
│  - BoardRenderer: 공격 가능 타일 표시    │
│  - GameScene: 공격 클릭 이벤트 처리      │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ⚠️ Phaser 의존성 절대 금지              │
│  - combat/attackable.ts: 공격 가능 타일 │
│  - combat/attack.ts: 공격 실행          │
│  - 기존: adjacency.ts, actions.ts 활용  │
└─────────────────────────────────────────┘
```

### 네이밍 컨벤션 (아키텍처 문서)

- **함수**: camelCase (`getAttackableTiles`, `executeAttack`)
- **변수**: camelCase (`attackableTiles`, `attackHighlights`)
- **타입**: PascalCase (`TileId`, `GeneralId`, `AttackResult`)
- **상수**: UPPER_SNAKE (`BASE_DAMAGE`, `ATTACKABLE_TILE_COLOR`)
- **이벤트**: domain:action (`combat:attack`, `combat:result`)

### 주의사항

1. **이 스토리 범위**
   - 인접 공격 기능만 구현
   - 기본 피해량 1 고정 (방향 판정은 4-2, 피해 계산은 4-3에서)
   - 병력 0 처리는 4-5에서 구현

2. **game-core 순수성 유지**
   - 공격 로직은 순수 TypeScript로 구현
   - Phaser 의존성 없이 테스트 가능해야 함

3. **하이라이트 레이어 순서**
   - 타일 < 이동 하이라이트 < 공격 하이라이트 < 경로 미리보기 < 장수

4. **행동 제한 시스템 통합**
   - 기존 ActionType에 'attack' 추가 (이미 정의되어 있을 수 있음)
   - PerformedAction 시스템 재사용

### References

- [Source: _bmad-output/epics.md#Epic 4: 전투 시스템] - Story [COMBAT-001] 정의
- [Source: _bmad-output/gdd.md#Game Mechanics] - 공격 메카닉
- [Source: _bmad-output/gdd.md#Action Economy] - 행동 제한 시스템
- [Source: _bmad-output/game-architecture.md#Cross-cutting Concerns] - 에러 처리 패턴
- [Source: _bmad-output/implementation-artifacts/3-1-moveable-tiles-display.md] - 타일 하이라이트 패턴
- [Source: _bmad-output/implementation-artifacts/3-2-general-movement.md] - 행동 제한 시스템
- [Source: _bmad-output/implementation-artifacts/epic-3-retro-2026-02-04.md] - 팀 합의 사항

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 없음 (디버그 모드 사용하지 않음)

### Completion Notes List

1. **TDD 방식으로 구현 완료**: 27개의 테스트 케이스를 먼저 작성하고, 코드를 구현하여 모든 테스트 통과
2. **game-core 순수성 유지**: Phaser 의존성 없이 순수 TypeScript로 combat 로직 구현
3. **Result<T> 패턴 준수**: 모든 에러는 throw 대신 Result 타입으로 반환
4. **행동 제한 시스템 통합**: 기존 PerformedAction 시스템 활용하여 동일 장수 동일 행동 제한 구현
5. **이동 가능 타일과 공격 가능 타일 구분**: 이동은 연두색, 공격은 빨간색으로 하이라이트 구분
6. **공격 우선 처리**: 클릭 시 공격 가능 타일을 먼저 확인하고, 공격이 아닌 경우에만 이동 처리
7. **모든 AC 충족**: AC1~AC5 모두 구현 및 테스트 완료
8. **빌드 성공**: pnpm build 성공, 353개 테스트 모두 통과 (기존 326개 + 신규 27개)

### File List

**신규 파일:**
- `packages/game-core/src/combat/attackable.ts` - getAttackableTiles() 함수
- `packages/game-core/src/combat/attack.ts` - executeAttack(), canAttack() 함수
- `packages/game-core/src/combat/index.ts` - combat 모듈 exports
- `packages/game-core/src/constants/combat.ts` - ATTACKABLE_TILE, BASE_DAMAGE 상수
- `packages/game-core/tests/combat.test.ts` - 27개 공격 관련 테스트

**수정 파일:**
- `packages/game-core/src/state/types.ts` - GameErrorCode에 'CANNOT_ATTACK_ALLY', 'NOT_ADJACENT' 추가
- `packages/game-core/src/index.ts` - combat 모듈 export 추가
- `packages/game-core/src/constants/index.ts` - ATTACKABLE_TILE, BASE_DAMAGE export 추가
- `packages/game-renderer/src/rendering/BoardRenderer.ts` - 공격 가능 타일 하이라이트 기능 추가
- `packages/game-renderer/src/scenes/GameScene.ts` - 공격 실행 로직 통합
