# Story 4.4: 병력 감소 (Troop Reduction)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 피해를 받은 장수의 병력이 시각적으로 감소하여 표시된다,
so that 전투 결과를 즉시 인지하고 전략을 조정할 수 있다.

## Acceptance Criteria

1. **AC1**: 공격으로 피해를 받으면 방어자의 병력 숫자가 즉시 감소한다
   - TroopIndicator의 숫자가 새 병력 수로 업데이트
   - 색상이 병력 상태(full/warning/danger)에 따라 변경
   - 이미 Story 4-3 이후 기본 동작 구현됨 → 확장/검증

2. **AC2**: 병력 감소 시 플로팅 데미지 텍스트가 표시된다
   - 피해량이 "-N" 형태로 방어자 위에 표시
   - 텍스트가 위로 떠오르며 페이드아웃
   - 색상: 빨간색 계열 (피해 강조)

3. **AC3**: TroopIndicator에 병력 감소 애니메이션이 적용된다
   - 숫자 변경 시 짧은 펄스 애니메이션 (흔들림 또는 스케일)
   - danger 상태 진입 시 강조 효과 (깜빡임)
   - 접근성: `skipAnimation` 옵션 지원

4. **AC4**: 병력 감소 이벤트가 발행된다
   - `troops:reduced` 이벤트로 UI 레이어에서 구독 가능
   - 이벤트 데이터: generalId, previousTroops, newTroops, damage
   - 기존 `combat:attack` 이벤트와 별도로 세분화된 이벤트

5. **AC5**: 전투 테스트에서 병력 감소가 검증된다
   - game-core: 피해 적용 후 troops 값 검증
   - game-renderer: updateTroops 호출 검증
   - 통합: 플로팅 텍스트/애니메이션 시각적 확인

## Tasks / Subtasks

- [x] Task 1: TroopIndicator 애니메이션 확장 (game-renderer) (AC: 3)
  - [x] 1.1: `updateWithAnimation()` 메서드 추가
    - 기존 update()는 즉시 업데이트
    - updateWithAnimation()은 펄스 효과 + 숫자 변경
    - Tween으로 scale 펄스 (1.0 → 1.3 → 1.0)
  - [x] 1.2: danger 상태 진입 강조 효과
    - 색상이 danger(빨간색)으로 변경 시 3회 깜빡임
    - 경고 상태 시각화
  - [x] 1.3: 접근성 옵션 지원
    - `skipAnimation` 파라미터 추가
    - 모션 민감 유저를 위한 즉시 업데이트 옵션

- [x] Task 2: 플로팅 데미지 텍스트 구현 (game-renderer) (AC: 2)
  - [x] 2.1: `DamageFloater` 클래스 생성
    - 위치, 데미지 값 받아서 텍스트 생성
    - "-N" 형식, 빨간색 계열 (#ff4444)
    - 폰트: bold, 크기 16-20px
  - [x] 2.2: 떠오르는 애니메이션 구현
    - y 위치: 위로 30-40px 이동
    - duration: 800ms
    - alpha: 1.0 → 0.0 (페이드아웃)
    - 완료 시 자동 destroy
  - [x] 2.3: GeneralRenderer에 `getTroopIndicator()` 메서드 추가
    - 장수 ID로 TroopIndicator 접근
    - GameScene에서 직접 updateWithAnimation 호출

- [x] Task 3: GameScene 통합 (game-renderer) (AC: 1, 4)
  - [x] 3.1: executeAttack 후 처리 개선
    - `updateTroops` 대신 `updateWithAnimation` 호출
    - DamageFloater 생성으로 플로팅 텍스트 표시
  - [x] 3.2: 병력 감소 이벤트 발행
    - `troops:reduced` 이벤트 추가
    - payload: { generalId, previousTroops, newTroops, damage }
    - 기존 `combat:attack` 이벤트는 유지

- [x] Task 4: 단위 테스트 작성 (AC: 5)
  - [x] 4.1: game-core 테스트 확인
    - 기존 combat.test.ts의 병력 감소 테스트 확인 (403 tests pass)
    - 추가 테스트 불필요 (기존 테스트 충분)
  - [x] 4.2: TroopIndicator 애니메이션 테스트 (선택적)
    - 수동 시각적 테스트로 대체
  - [x] 4.3: DamageFloater 테스트 (선택적)
    - 수동 시각적 테스트로 대체

- [x] Task 5: 빌드 및 검증 (AC: 전체)
  - [x] 5.1: 단위 테스트 통과 확인 (`pnpm test`) - 429 tests pass
  - [x] 5.2: 빌드 성공 확인 (`pnpm build`)
  - [x] 5.3: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [ ] 5.4: 브라우저 수동 테스트 (사용자 검증 필요)
    - 공격 시 플로팅 데미지 확인
    - 병력 감소 애니메이션 확인
    - danger 상태 진입 시 강조 효과 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 이 스토리에서 game-core 변경 **없음**
- 병력 감소 로직은 이미 Story 4-1, 4-3에서 구현 완료
- `executeAttack()` → `calculateDamage()` → troops 감소 체인 완료

**game-renderer 패키지 (Phaser 렌더링)**
- `rendering/TroopIndicator.ts`: 애니메이션 메서드 추가
- `rendering/DamageFloater.ts`: **신규** - 플로팅 데미지 텍스트
- `rendering/GeneralRenderer.ts`: DamageFloater 통합
- `scenes/GameScene.ts`: 애니메이션 및 이벤트 통합

**apps/web (React UI)**
- 이 스토리에서는 변경 없음
- `troops:reduced` 이벤트는 향후 HUD 업데이트에 활용 가능

### 핵심 구현 패턴

#### 1. DamageFloater 클래스

```typescript
// packages/game-renderer/src/rendering/DamageFloater.ts

import Phaser from 'phaser';

export interface DamageFloaterConfig {
  /** 폰트 크기 */
  fontSize: number;
  /** 텍스트 색상 */
  color: string;
  /** 떠오르는 거리 (px) */
  floatDistance: number;
  /** 애니메이션 지속 시간 (ms) */
  duration: number;
}

const DEFAULT_CONFIG: DamageFloaterConfig = {
  fontSize: 18,
  color: '#ff4444',
  floatDistance: 40,
  duration: 800,
};

export class DamageFloater {
  private scene: Phaser.Scene;
  private text: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    damage: number,
    config: Partial<DamageFloaterConfig> = {}
  ) {
    const { fontSize, color, floatDistance, duration } = { ...DEFAULT_CONFIG, ...config };
    this.scene = scene;

    // 텍스트 생성
    this.text = scene.add.text(x, y, `-${damage}`, {
      fontSize: `${fontSize}px`,
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // 떠오르며 페이드아웃 애니메이션
    scene.tweens.add({
      targets: this.text,
      y: y - floatDistance,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  destroy(): void {
    if (this.text) {
      this.text.destroy();
    }
  }
}
```

#### 2. TroopIndicator 애니메이션 확장

```typescript
// packages/game-renderer/src/rendering/TroopIndicator.ts (수정)

/**
 * 애니메이션과 함께 병력 업데이트
 *
 * @param troops - 새 병력
 * @param maxTroops - 최대 병력
 * @param skipAnimation - 애니메이션 건너뛰기
 */
updateWithAnimation(
  troops: number,
  maxTroops: number,
  skipAnimation: boolean = false
): void {
  const previousStatus = this.currentStatus;
  const newStatus = getTroopStatus(troops, maxTroops);

  // 기본 업데이트
  this.update(troops, maxTroops);

  if (skipAnimation) return;

  // 펄스 애니메이션
  this.scene.tweens.add({
    targets: this.container,
    scaleX: 1.3,
    scaleY: 1.3,
    duration: 100,
    yoyo: true,
    ease: 'Power2',
  });

  // danger 상태 진입 시 깜빡임
  if (previousStatus !== 'danger' && newStatus === 'danger') {
    this.scene.tweens.add({
      targets: this.circle,
      alpha: { from: 1, to: 0.3 },
      duration: 150,
      yoyo: true,
      repeat: 2,
    });
  }
}
```

#### 3. GameScene 통합

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

import { DamageFloater } from '../rendering/DamageFloater';

private executeAttack(attackerId: string, defenderId: string): void {
  if (!this.gameState) return;

  const defender = this.gameState.generals.find(g => g.id === defenderId);
  const previousTroops = defender?.troops ?? 0;

  const result = executeAttack(this.gameState, attackerId, defenderId);

  if (result.success) {
    const { state: newState, result: attackResult } = result.data;

    // 게임 상태 업데이트
    this.gameState = newState;

    const updatedDefender = newState.generals.find(g => g.id === defenderId);
    if (this.generalRenderer && updatedDefender) {
      // 1. 플로팅 데미지 표시
      if (attackResult.damage > 0) {
        const defenderContainer = this.generalRenderer.getContainer(defenderId);
        if (defenderContainer) {
          new DamageFloater(
            this,
            defenderContainer.x,
            defenderContainer.y - 20, // 토큰 위쪽
            attackResult.damage
          );
        }
      }

      // 2. 병력 애니메이션 업데이트
      const indicator = this.generalRenderer.getTroopIndicator(defenderId);
      if (indicator) {
        indicator.updateWithAnimation(
          updatedDefender.troops,
          updatedDefender.stats.star,
          false // skipAnimation
        );
      }

      // 3. 병력 감소 이벤트 발행
      this.events.emit('troops:reduced', {
        generalId: defenderId,
        previousTroops,
        newTroops: updatedDefender.troops,
        damage: attackResult.damage,
      });
    }

    // ... 기존 코드 유지 ...
  }
}
```

### 이전 스토리 학습 사항

**Story 4-3 (방향별 데미지 계산):**
- `calculateDamage()` 함수로 방향별 피해량 계산 완료
- `AttackResult`에 damage 필드 포함
- 해/달: 스탯 차이, 전선: 고정 1

**Story 4-2 (공격 방향 판정):**
- `getAttackDirection()` 함수로 방향 판정 완료
- `AttackResult` 타입에 direction 필드 포함

**Story 4-1 (인접 공격):**
- `executeAttack()` 함수 구조 및 Result<T> 패턴
- 병력 감소 기본 로직 (`defender.troops - damage`)
- 행동 기록 (performedActions) 처리

**Epic 3 회고:**
- game-core에 Phaser 의존성 절대 금지
- TDD 방식으로 테스트 먼저 작성
- Logger를 통한 디버그 로그 활용

### Git 커밋 패턴

최근 커밋:
- `feat: 4-3 방향별 데미지 계산 (Directional Damage Calculation)`
- `feat: 4-2 공격 방향 판정 (Attack Direction Judgment)`
- `feat: 4-1 인접 공격 (Adjacent Attack)`

이 스토리 예상 커밋:
- `feat: 4-4 병력 감소 (Troop Reduction)`

### Project Structure Notes

**신규 파일:**
```
packages/game-renderer/src/
├── rendering/
│   └── DamageFloater.ts       # 신규: 플로팅 데미지 텍스트
```

**수정 파일:**
```
packages/game-renderer/src/
├── rendering/
│   ├── TroopIndicator.ts      # 수정: updateWithAnimation 추가
│   └── GeneralRenderer.ts     # 수정: getTroopIndicator 추가
├── scenes/
│   └── GameScene.ts           # 수정: 애니메이션/이벤트 통합
└── index.ts                   # 수정: DamageFloater export 추가
```

### 테스트 케이스 가이드

**시각적 테스트 (수동):**
1. 공격 실행 시 "-N" 플로팅 텍스트 표시 확인
2. 플로팅 텍스트가 위로 떠오르며 사라지는지 확인
3. 병력 숫자가 펄스 애니메이션과 함께 변경되는지 확인
4. danger 상태 진입 시 깜빡임 효과 확인
5. 전선 공격 (고정 1 피해)에서도 동일하게 동작 확인

**자동화 테스트:**
- game-core의 기존 테스트로 병력 감소 로직 검증 완료
- game-renderer 테스트는 Phaser 환경 필요 (선택적)

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  - 이 스토리에서 변경 없음               │
│  - troops:reduced 이벤트 구독 가능       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  ✅ 이 스토리의 주요 변경 영역           │
│  - DamageFloater.ts: 플로팅 데미지       │
│  - TroopIndicator.ts: 애니메이션 추가    │
│  - GameScene.ts: 통합                   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ⚠️ Phaser 의존성 절대 금지              │
│  - 이 스토리에서 변경 없음               │
│  - 병력 감소 로직은 이미 완료            │
└─────────────────────────────────────────┘
```

### 주의사항

1. **이 스토리 범위**
   - UI/시각적 피드백 구현에 집중
   - game-core는 이미 완료된 상태
   - 플로팅 텍스트 + 애니메이션 + 이벤트

2. **Phaser Tween 사용**
   - scene.tweens.add()로 애니메이션 생성
   - onComplete 콜백에서 리소스 정리 필수
   - 메모리 누수 방지

3. **이벤트 설계**
   - `troops:reduced`는 `combat:attack`과 별개
   - 세분화된 이벤트로 UI 레이어에서 구독
   - 향후 HUD 병력 표시 연동에 활용

4. **접근성 고려**
   - `skipAnimation` 옵션 제공
   - 모션 민감 유저를 위한 대안
   - prefers-reduced-motion 미디어 쿼리 연동 가능

### References

- [Source: _bmad-output/epics.md#Epic 4: 전투 시스템] - Story [COMBAT-004] 정의
- [Source: _bmad-output/gdd.md#방향성 전투 (Directional Combat)] - 병력 시스템 규칙
- [Source: _bmad-output/game-architecture.md#Cross-cutting Concerns] - Event System 패턴
- [Source: _bmad-output/implementation-artifacts/4-3-directional-damage-calculation.md] - 이전 스토리 패턴
- [Source: packages/game-core/src/combat/attack.ts] - 현재 공격 실행 로직
- [Source: packages/game-renderer/src/rendering/TroopIndicator.ts] - 현재 병력 인디케이터
- [Source: packages/game-renderer/src/rendering/GeneralRenderer.ts] - 장수 렌더러
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - 현재 GameScene 구현

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- TroopIndicator에 `updateWithAnimation()` 메서드 추가: 펄스 애니메이션 (scale 1.0 -> 1.3 -> 1.0)과 danger 상태 진입 시 3회 깜빡임 효과 구현
- DamageFloater 클래스 신규 생성: "-N" 형식의 빨간색 플로팅 텍스트, 위로 40px 떠오르며 800ms 동안 페이드아웃, 자동 destroy
- GeneralRenderer에 `getTroopIndicator()` 메서드 추가: 장수 ID로 TroopIndicator 직접 접근 가능
- GameScene의 executeAttack() 메서드 개선: 플로팅 데미지 표시, 애니메이션 업데이트, `troops:reduced` 이벤트 발행
- 접근성 지원: `skipAnimation` 파라미터로 모션 민감 사용자를 위한 즉시 업데이트 옵션 제공
- 모든 테스트 통과 (429 tests), 빌드 성공, 타입체크 통과

### File List

**신규 파일:**
- packages/game-renderer/src/rendering/DamageFloater.ts

**수정 파일:**
- packages/game-renderer/src/rendering/TroopIndicator.ts
- packages/game-renderer/src/rendering/GeneralRenderer.ts
- packages/game-renderer/src/scenes/GameScene.ts
- packages/game-renderer/src/index.ts

### Change Log

- 2026-02-04: Story 4.4 구현 완료 - 병력 감소 시각적 피드백 (플로팅 데미지, 애니메이션, 이벤트)
