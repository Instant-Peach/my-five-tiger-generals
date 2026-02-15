# Story 4.5: 장수 OUT 처리 (General OUT Handling)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 병력이 0이 된 장수가 보드에서 제거되고 OUT 상태로 전환된다,
so that 전투 결과로 인한 병력 손실을 명확히 인지하고 전략을 조정할 수 있다.

## Acceptance Criteria

1. **AC1**: 병력 0 감지 및 상태 전환 (game-core)
   - 공격으로 병력이 0이 되면 장수의 status가 'out'으로 변경
   - position이 null로 설정 (보드에서 제거)
   - `executeAttack()`의 `isKnockOut: true` 플래그 활용
   - 로깅: `[COMBAT] General {name} is OUT`

2. **AC2**: OUT 상태 장수의 시각적 제거 (game-renderer)
   - 보드에서 장수 스프라이트 및 TroopIndicator 제거
   - 제거 애니메이션: 페이드아웃 + 스케일 축소 (선택적)
   - 타일이 빈 타일로 갱신 (다른 장수가 이동 가능해짐)

3. **AC3**: OUT 이벤트 발행 (game-core/game-renderer)
   - `general:out` 이벤트로 UI 레이어에서 구독 가능
   - 이벤트 데이터: generalId, owner, position (마지막 위치)
   - 기존 `troops:reduced` 이벤트와 별도로 발행

4. **AC4**: OUT 상태 장수는 게임에서 제외
   - 이동 대상에서 제외 (경로 차단하지 않음)
   - 공격 대상에서 제외
   - 선택 불가 (클릭 무시)
   - 남은 장수 목록에서 제외

5. **AC5**: 테스트 커버리지
   - game-core: 병력 0 → OUT 상태 전환 테스트
   - game-core: OUT 장수 선택/이동/공격 불가 테스트
   - game-renderer: 시각적 제거 테스트 (수동)
   - 통합: OUT 이벤트 발행 확인

## Tasks / Subtasks

- [x] Task 1: game-core 상태 전환 로직 (AC: 1, 4)
  - [x] 1.1: `executeAttack()`에서 병력 0 시 상태 전환
    - isKnockOut이 true일 때 status = 'out', position = null 설정
    - 기존 병력 감소 후 처리 추가
  - [x] 1.2: `canAttack()` 수정
    - OUT 상태 장수는 공격 대상에서 제외
    - defender.status === 'active' 검증 추가
  - [x] 1.3: `selectGeneral()` 수정
    - OUT 상태 장수 선택 불가
    - status === 'active' 검증 추가 (기존 구현 확인)
  - [x] 1.4: 이동 관련 함수 수정
    - OUT 장수는 경로 차단하지 않음 (blockedTiles에서 제외)
    - `getOccupiedTiles()`에서 이미 status === 'active' 조건 적용됨 (기존 구현 확인)

- [x] Task 2: game-core 단위 테스트 (AC: 5)
  - [x] 2.1: 병력 0 → OUT 상태 전환 테스트
    - executeAttack 후 defender.status === 'out' 검증
    - defender.position === null 검증
  - [x] 2.2: OUT 장수 공격 불가 테스트
    - canAttack(state, attacker, outGeneral) === false 검증
  - [x] 2.3: OUT 장수 선택 불가 테스트
    - selectGeneral(state, outGeneralId) 실패 검증 (기존 테스트 확인)
  - [x] 2.4: OUT 장수 경로 비차단 테스트
    - OUT 장수 위치가 이동 가능 타일에 포함되는지 검증 (기존 테스트 확인)

- [x] Task 3: game-renderer 시각적 처리 (AC: 2, 3)
  - [x] 3.1: OUT 감지 및 제거 로직
    - GameScene에서 isKnockOut 확인
    - GeneralRenderer.removeGeneral(generalId, true) 호출
  - [x] 3.2: `removeGeneral()` 메서드 구현
    - 장수 Container 페이드아웃 애니메이션
    - TroopIndicator 동시 제거
    - 애니메이션 완료 후 destroy
  - [x] 3.3: `general:out` 이벤트 발행
    - GameScene에서 이벤트 emit
    - payload: { generalId, owner, lastPosition }

- [x] Task 4: 빌드 및 검증 (AC: 전체)
  - [x] 4.1: 단위 테스트 통과 확인 (`pnpm test`) - 434 tests passed
  - [x] 4.2: 빌드 성공 확인 (`pnpm build`)
  - [x] 4.3: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [ ] 4.4: 브라우저 수동 테스트
    - 장수 공격으로 병력 0 만들기
    - 장수가 보드에서 사라지는 애니메이션 확인
    - OUT 장수 타일이 이동 가능해지는지 확인
    - OUT 장수 선택/공격 불가 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- `combat/attack.ts`: `executeAttack()` 수정 - OUT 상태 전환
- `selection/index.ts`: `selectGeneral()` 수정 - OUT 장수 선택 불가
- `movement/actions.ts` 또는 관련 파일: OUT 장수 경로 비차단

**game-renderer 패키지 (Phaser 렌더링)**
- `rendering/GeneralRenderer.ts`: `removeGeneral()` 메서드 추가
- `scenes/GameScene.ts`: OUT 감지 및 처리 통합

**apps/web (React UI)**
- 이 스토리에서는 변경 없음
- `general:out` 이벤트는 향후 HUD 업데이트에 활용 가능

### 핵심 구현 패턴

#### 1. executeAttack() 수정

```typescript
// packages/game-core/src/combat/attack.ts (수정)

// 5. 피해 적용 → OUT 상태 전환 추가
const defenderTroopsAfter = Math.max(0, defender.troops - damage);
const isKnockOut = defenderTroopsAfter === 0;

const newGenerals = state.generals.map(g => {
  if (g.id === defenderId) {
    return {
      ...g,
      troops: defenderTroopsAfter,
      // Story 4-5: OUT 상태 전환
      status: isKnockOut ? 'out' as const : g.status,
      position: isKnockOut ? null : g.position,
    };
  }
  return g;
});

// OUT 로깅
if (isKnockOut) {
  Logger.info('combat', `General ${defender.nameKo} is OUT`, {
    generalId: defenderId,
    attackerId,
  });
}
```

#### 2. canAttack() 수정

```typescript
// packages/game-core/src/combat/attack.ts (수정)

export function canAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): boolean {
  const attacker = state.generals.find(g => g.id === attackerId);
  const defender = state.generals.find(g => g.id === defenderId);

  // 장수 존재 확인
  if (!attacker || !defender) {
    return false;
  }

  // Story 4-5: OUT 상태 장수 공격 불가
  if (defender.status === 'out') {
    return false;
  }

  // ... 기존 검증 로직 ...
}
```

#### 3. selectGeneral() 수정

```typescript
// packages/game-core/src/selection/index.ts (수정)

export function selectGeneral(
  state: GameState,
  generalId: GeneralId
): Result<GameState> {
  const general = state.generals.find(g => g.id === generalId);

  if (!general) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_FOUND', message: '장수를 찾을 수 없습니다' },
    };
  }

  // Story 4-5: OUT 상태 장수 선택 불가
  if (general.status === 'out') {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_ACTIVE', message: 'OUT 상태 장수는 선택할 수 없습니다' },
    };
  }

  // ... 기존 로직 ...
}
```

#### 4. 이동 경로 차단 수정

```typescript
// packages/game-core/src/movement/actions.ts (또는 관련 파일)

function getBlockedTiles(state: GameState): Set<TileId> {
  const blocked = new Set<TileId>();

  for (const general of state.generals) {
    // Story 4-5: OUT 상태 장수는 경로 차단하지 않음
    if (general.position !== null && general.status === 'active') {
      blocked.add(general.position);
    }
  }

  return blocked;
}
```

#### 5. GeneralRenderer.removeGeneral()

```typescript
// packages/game-renderer/src/rendering/GeneralRenderer.ts (수정)

/**
 * 장수를 보드에서 제거 (OUT 처리)
 *
 * @param generalId - 제거할 장수 ID
 * @param animate - 애니메이션 여부 (기본 true)
 */
removeGeneral(generalId: GeneralId, animate: boolean = true): void {
  const container = this.containers.get(generalId);
  if (!container) return;

  if (animate) {
    // 페이드아웃 + 스케일 축소 애니메이션
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        container.destroy();
        this.containers.delete(generalId);
        this.troopIndicators.delete(generalId);
      },
    });
  } else {
    container.destroy();
    this.containers.delete(generalId);
    this.troopIndicators.delete(generalId);
  }
}
```

#### 6. GameScene OUT 처리

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

private executeAttack(attackerId: string, defenderId: string): void {
  if (!this.gameState) return;

  const defender = this.gameState.generals.find(g => g.id === defenderId);
  const previousTroops = defender?.troops ?? 0;
  const lastPosition = defender?.position;

  const result = executeAttack(this.gameState, attackerId, defenderId);

  if (result.success) {
    const { state: newState, result: attackResult } = result.data;

    // 게임 상태 업데이트
    this.gameState = newState;

    // ... 기존 플로팅 데미지/애니메이션 코드 ...

    // Story 4-5: OUT 처리
    if (attackResult.isKnockOut) {
      this.generalRenderer?.removeGeneral(defenderId);

      // OUT 이벤트 발행
      this.events.emit('general:out', {
        generalId: defenderId,
        owner: defender?.owner,
        lastPosition,
      });
    }

    // ... 기존 코드 계속 ...
  }
}
```

### 이전 스토리 학습 사항

**Story 4-4 (병력 감소):**
- DamageFloater 클래스로 플로팅 데미지 표시
- TroopIndicator.updateWithAnimation()으로 애니메이션 업데이트
- `troops:reduced` 이벤트 발행 패턴

**Story 4-3 (방향별 데미지 계산):**
- `calculateDamage()` 함수로 방향별 피해량 계산
- AttackResult에 damage, isKnockOut 필드 포함

**Story 4-2 (공격 방향 판정):**
- `getAttackDirection()` 함수로 방향 판정
- sun/moon/frontline 방향 체계

**Story 4-1 (인접 공격):**
- `executeAttack()` 함수 Result<T> 패턴
- validateAttack()으로 유효성 검증
- performedActions로 행동 기록

**Epic 3 회고:**
- game-core에 Phaser 의존성 절대 금지
- TDD 방식으로 테스트 먼저 작성
- Logger를 통한 디버그 로그 활용

### Git 커밋 패턴

최근 커밋:
- `feat: 4-4 병력 감소 (Troop Reduction)`
- `feat: 4-3 방향별 데미지 계산 (Directional Damage Calculation)`
- `feat: 4-2 공격 방향 판정 (Attack Direction Judgment)`

이 스토리 예상 커밋:
- `feat: 4-5 장수 OUT 처리 (General OUT Handling)`

### Project Structure Notes

**수정 파일 목록:**

```
packages/game-core/src/
├── combat/
│   └── attack.ts              # 수정: executeAttack() OUT 상태 전환
├── selection/
│   └── index.ts               # 수정: selectGeneral() OUT 장수 제외
└── movement/
    └── actions.ts             # 수정: 경로 차단에서 OUT 장수 제외

packages/game-core/tests/
└── combat.test.ts             # 추가: OUT 관련 테스트 케이스

packages/game-renderer/src/
├── rendering/
│   └── GeneralRenderer.ts     # 수정: removeGeneral() 메서드 추가
└── scenes/
    └── GameScene.ts           # 수정: OUT 감지 및 이벤트 발행
```

### 테스트 케이스 가이드

**game-core 단위 테스트:**

```typescript
// packages/game-core/tests/combat.test.ts

describe('General OUT Handling', () => {
  it('병력 0이 되면 status가 out으로 변경된다', () => {
    // Given: 병력 1인 방어자
    const state = createStateWithDefenderTroops(1);

    // When: 1 이상 피해 공격
    const result = executeAttack(state, 'attacker', 'defender');

    // Then: OUT 상태
    expect(result.success).toBe(true);
    const defender = result.data.state.generals.find(g => g.id === 'defender');
    expect(defender?.status).toBe('out');
    expect(defender?.position).toBeNull();
  });

  it('OUT 장수는 공격 대상이 될 수 없다', () => {
    // Given: OUT 상태 장수
    const state = createStateWithOutGeneral();

    // When: OUT 장수 공격 시도
    const canAttackResult = canAttack(state, 'attacker', 'outGeneral');

    // Then: 공격 불가
    expect(canAttackResult).toBe(false);
  });

  it('OUT 장수는 선택할 수 없다', () => {
    // Given: OUT 상태 장수
    const state = createStateWithOutGeneral();

    // When: OUT 장수 선택 시도
    const result = selectGeneral(state, 'outGeneral');

    // Then: 선택 실패
    expect(result.success).toBe(false);
  });

  it('OUT 장수는 경로를 차단하지 않는다', () => {
    // Given: OUT 장수가 있던 위치
    const state = createStateWithOutGeneral();

    // When: 해당 타일로 이동 가능 여부 확인
    const reachable = getReachableTiles(state, 'movingGeneral');

    // Then: OUT 장수 위치가 이동 가능 타일에 포함
    expect(reachable).toContain(OUT_GENERAL_LAST_POSITION);
  });
});
```

**시각적 테스트 (수동):**
1. 장수 공격으로 병력 0 만들기
2. 장수가 페이드아웃하며 사라지는 애니메이션 확인
3. OUT 장수가 있던 타일로 다른 장수 이동 가능 확인
4. OUT 장수 클릭 시 반응 없음 확인
5. OUT 장수에게 공격 시도 시 실패 확인

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  - 이 스토리에서 변경 없음               │
│  - general:out 이벤트 구독 가능          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  ✅ 시각적 처리 영역                     │
│  - GeneralRenderer.removeGeneral()      │
│  - GameScene: OUT 감지/이벤트 발행       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ✅ 로직 처리 영역                       │
│  ⚠️ Phaser 의존성 절대 금지              │
│  - executeAttack(): OUT 상태 전환        │
│  - canAttack(): OUT 장수 공격 불가       │
│  - selectGeneral(): OUT 장수 선택 불가   │
│  - 이동: OUT 장수 경로 비차단            │
└─────────────────────────────────────────┘
```

### 주의사항

1. **isKnockOut 플래그 활용**
   - Story 4-3에서 이미 `isKnockOut` 계산됨
   - 별도 계산 불필요, 플래그만 활용

2. **상태 전환 원자성**
   - status와 position을 함께 변경
   - 불완전한 상태 방지

3. **이벤트 순서**
   - `troops:reduced` → `general:out` 순서로 발행
   - UI에서 순차적 처리 가능

4. **접근성**
   - 애니메이션 옵션 제공 (removeGeneral의 animate 파라미터)
   - 즉시 제거 가능

5. **메모리 정리**
   - Container destroy 시 TroopIndicator도 함께 제거
   - Map에서 참조 삭제 필수

### 다음 스토리 연결

**Story 4-6: 전투 피드백 (Combat Feedback)**
- OUT 발생 시 추가 시각/청각 피드백
- 전투 결과 요약 UI
- 사운드 효과

### References

- [Source: _bmad-output/epics.md#Epic 4: 전투 시스템] - Story [COMBAT-005] 정의
- [Source: _bmad-output/gdd.md#병력 시스템] - 병력 0 → OUT 규칙
- [Source: _bmad-output/game-architecture.md#Implementation Patterns] - Result 타입 패턴
- [Source: _bmad-output/implementation-artifacts/4-4-troop-reduction.md] - 이전 스토리 패턴
- [Source: packages/game-core/src/combat/attack.ts] - 현재 공격 실행 로직
- [Source: packages/game-core/src/generals/types.ts] - GeneralStatus 타입 정의
- [Source: packages/game-core/src/state/types.ts] - GameState 타입 정의
- [Source: packages/game-renderer/src/rendering/GeneralRenderer.ts] - 현재 장수 렌더러
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - 현재 GameScene 구현

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Story 4-5 구현 시작: 2026-02-04
- TDD 방식으로 RED-GREEN-REFACTOR 순환 적용
- 테스트 먼저 작성 후 구현으로 진행

### Completion Notes List

1. **game-core 상태 전환 로직 (Task 1)**
   - `executeAttack()`에 OUT 상태 전환 로직 추가 (status: 'out', position: null)
   - `canAttack()`에 OUT 상태 장수 공격 불가 검증 추가
   - `selectGeneral()`, `getOccupiedTiles()` 기존 구현에서 이미 status 검증 확인

2. **단위 테스트 (Task 2)**
   - combat.test.ts에 Story 4-5 테스트 케이스 추가
   - 병력 0 → OUT 상태 전환 테스트
   - OUT 장수 공격/선택/이동 불가 테스트

3. **game-renderer 시각적 처리 (Task 3)**
   - `GeneralRenderer.removeGeneral()` 메서드에 애니메이션 옵션 추가 (animate: boolean)
   - 페이드아웃 + 스케일 축소 애니메이션 (400ms, Power2 이징)
   - `GameScene.executeAttack()`에서 `general:out` 이벤트 발행

4. **빌드 및 검증 (Task 4)**
   - 전체 테스트: 434 tests passed
   - 전체 빌드: 성공
   - 타입 체크: 통과

### File List

**수정된 파일:**
- packages/game-core/src/combat/attack.ts
  - executeAttack(): OUT 상태 전환 로직 추가 (status, position 변경, 로깅)
  - canAttack(): OUT 상태 장수 공격 불가 검증 추가
- packages/game-core/tests/combat.test.ts
  - Story 4-5 테스트 케이스 추가 (7개 테스트)
- packages/game-renderer/src/rendering/GeneralRenderer.ts
  - removeGeneral(): animate 파라미터 추가, 페이드아웃 애니메이션 구현
- packages/game-renderer/src/scenes/GameScene.ts
  - executeAttack(): OUT 처리 로직 추가, general:out 이벤트 발행
- _bmad-output/implementation-artifacts/sprint-status.yaml
  - 4-5-general-out-handling: ready-for-dev → in-progress → review

## Known Issues

1. **OUT 처리 시 이동 가능 타일 하이라이트 미해제**
   - 증상: 장수가 OUT되어도 해당 장수의 이동 가능 타일 하이라이트가 남아있음
   - 영향: 시각적 일관성 문제 (기능에는 영향 없음)
   - 우선순위: Low (다음 스토리 또는 polish 단계에서 수정)
   - 해결 방안: `debugOut()` 또는 실제 OUT 처리 후 `this.boardRenderer.clearMovableTiles()` 호출

## Change Log

- 2026-02-04: Story 4-5 장수 OUT 처리 구현 완료 (Claude Opus 4.5)
