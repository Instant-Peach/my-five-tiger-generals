# Story 4.6: 전투 피드백 (Combat Feedback)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 전투 시 시각적/청각적 피드백을 받는다,
so that 공격 결과를 명확히 인지하고 게임에 몰입할 수 있다.

## Acceptance Criteria

1. **AC1**: 공격 시 시각적 피드백 (game-renderer)
   - 공격자 → 방어자 방향으로 공격 이펙트 애니메이션
   - 공격 방향(해/달/전선)에 따른 이펙트 색상 차별화
     - 해(Sun): 황금색/주황색 이펙트
     - 달(Moon): 은색/파란색 이펙트
     - 전선(Frontline): 흰색/회색 이펙트
   - 피격 시 방어자 스프라이트 흔들림(shake) 효과
   - 피격 타일 플래시 효과 (빨간색 깜빡임)

2. **AC2**: 공격 시 청각적 피드백 (game-renderer)
   - 공격 효과음 재생 (hit sound)
   - 방향별 차별화된 사운드는 Phase 2+ (MVP에서는 단일 사운드)
   - OUT 발생 시 추가 효과음 (defeat sound)
   - 볼륨 조절 가능 (설정에서)

3. **AC3**: 전투 결과 피드백 통합 (game-renderer)
   - 기존 DamageFloater와 연동 (Story 4-4에서 구현)
   - 기존 TroopIndicator 애니메이션 연동 (Story 4-4에서 구현)
   - OUT 애니메이션 연동 (Story 4-5에서 구현)
   - 피드백 순서: 공격 이펙트 → 피격 효과 → 데미지 표시 → 병력 갱신 → (OUT 처리)

4. **AC4**: 사운드 에셋 및 설정 (game-renderer/apps/web)
   - 기본 공격 효과음 파일 추가 (sfx_attack.mp3 또는 placeholder)
   - 기본 OUT 효과음 파일 추가 (sfx_defeat.mp3 또는 placeholder)
   - 사운드 ON/OFF 설정 (settingsStore에 저장)
   - 볼륨 조절은 Phase 2+ (MVP에서는 ON/OFF만)

5. **AC5**: 테스트 커버리지
   - game-renderer: 시각적 피드백 수동 테스트
   - game-renderer: 사운드 재생 수동 테스트
   - 통합: 전체 전투 플로우 테스트 (공격 → 피드백 → 결과)

## Tasks / Subtasks

- [x] Task 1: 공격 이펙트 시스템 구현 (AC: 1)
  - [x] 1.1: `AttackEffect` 클래스 생성
    - packages/game-renderer/src/rendering/AttackEffect.ts
    - 공격자 위치에서 방어자 위치로 이동하는 이펙트
    - Phaser.GameObjects.Particles 또는 Graphics 기반
  - [x] 1.2: 방향별 이펙트 색상 적용
    - sun: 0xFFD700 (골드) / 0xFF8C00 (다크오렌지)
    - moon: 0xC0C0C0 (실버) / 0x4169E1 (로열블루)
    - frontline: 0xFFFFFF (화이트) / 0x808080 (그레이)
  - [x] 1.3: GameScene에서 AttackEffect 호출
    - executeAttack() 내 공격 성공 시 이펙트 트리거

- [x] Task 2: 피격 효과 구현 (AC: 1)
  - [x] 2.1: 방어자 스프라이트 흔들림 효과
    - GeneralRenderer에 `shakeGeneral()` 메서드 추가
    - Phaser.Tweens로 짧은 좌우 흔들림 (100-200ms)
  - [x] 2.2: 피격 타일 플래시 효과
    - BoardRenderer에 `flashTile()` 메서드 추가
    - 빨간색 오버레이 깜빡임 (alpha 0 → 0.5 → 0)
  - [x] 2.3: GameScene에서 피격 효과 호출

- [x] Task 3: 사운드 시스템 구현 (AC: 2, 4)
  - [x] 3.1: 사운드 파일 추가/placeholder 생성
    - apps/web/public/assets/audio/sfx/sfx_attack.mp3
    - apps/web/public/assets/audio/sfx/sfx_defeat.mp3
    - (placeholder로 무음 파일 또는 기본 사운드 사용 가능)
  - [x] 3.2: BootScene에서 사운드 에셋 로드
    - this.load.audio('sfx_attack', 'assets/audio/sfx/sfx_attack.mp3')
  - [x] 3.3: GameScene에서 사운드 재생
    - this.sound.play('sfx_attack') 공격 시
    - this.sound.play('sfx_defeat') OUT 발생 시
  - [x] 3.4: 사운드 설정 구현
    - apps/web/src/stores/settingsStore.ts에 soundEnabled 추가
    - 사운드 재생 전 설정 확인

- [x] Task 4: 전투 피드백 통합 및 시퀀싱 (AC: 3)
  - [x] 4.1: GameScene.executeAttack() 피드백 시퀀스 구현
    - 공격 이펙트 시작 (즉시)
    - 이펙트 도달 시 피격 효과 + 사운드 (200-300ms 후)
    - 데미지 표시 (기존 DamageFloater)
    - 병력 갱신 (기존 TroopIndicator)
    - OUT 처리 (조건부, 기존 로직)
  - [x] 4.2: 애니메이션 타이밍 조율
    - 이펙트 duration: 200-300ms
    - 피격 효과 duration: 100-200ms
    - 전체 시퀀스: 500ms 이내

- [x] Task 5: 빌드 및 검증 (AC: 전체)
  - [x] 5.1: 빌드 성공 확인 (`pnpm build`)
  - [x] 5.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [ ] 5.3: 브라우저 수동 테스트
    - 공격 시 이펙트 애니메이션 확인
    - 방향별 이펙트 색상 확인 (해/달/전선)
    - 피격 시 스프라이트 흔들림 확인
    - 피격 타일 플래시 확인
    - 공격 사운드 재생 확인
    - OUT 사운드 재생 확인
    - 사운드 ON/OFF 설정 동작 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 이 스토리에서는 game-core 변경 없음
- 전투 로직은 이미 완성됨 (Story 4-1 ~ 4-5)

**game-renderer 패키지 (Phaser 렌더링)**
- `rendering/AttackEffect.ts`: 새 클래스 추가
- `rendering/GeneralRenderer.ts`: `shakeGeneral()` 메서드 추가
- `rendering/BoardRenderer.ts`: `flashTile()` 메서드 추가
- `scenes/BootScene.ts`: 사운드 에셋 로드 추가
- `scenes/GameScene.ts`: 피드백 시퀀스 통합

**apps/web (React UI)**
- `stores/settingsStore.ts`: soundEnabled 설정 추가
- `public/assets/audio/sfx/`: 사운드 파일 추가

### 핵심 구현 패턴

#### 1. AttackEffect 클래스

```typescript
// packages/game-renderer/src/rendering/AttackEffect.ts

import Phaser from 'phaser';
import { AttackDirection } from '@five-tiger-generals/game-core';

/** 방향별 이펙트 색상 */
const EFFECT_COLORS: Record<AttackDirection, number> = {
  sun: 0xFFD700,      // 골드
  moon: 0x4169E1,     // 로열블루
  frontline: 0xFFFFFF, // 화이트
};

/**
 * 공격 이펙트 클래스
 * 공격자 → 방어자 방향으로 이동하는 시각 효과
 */
export class AttackEffect {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 공격 이펙트 재생
   * @param fromX - 공격자 X 좌표
   * @param fromY - 공격자 Y 좌표
   * @param toX - 방어자 X 좌표
   * @param toY - 방어자 Y 좌표
   * @param direction - 공격 방향 (sun/moon/frontline)
   * @param onComplete - 이펙트 완료 콜백
   */
  play(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    direction: AttackDirection,
    onComplete?: () => void
  ): void {
    const color = EFFECT_COLORS[direction];

    // 간단한 원형 이펙트 생성
    const effect = this.scene.add.circle(fromX, fromY, 15, color, 0.8);
    effect.setDepth(100); // 최상위 레이어

    // 공격자 → 방어자로 이동하는 트윈
    this.scene.tweens.add({
      targets: effect,
      x: toX,
      y: toY,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0.3,
      duration: 250,
      ease: 'Power2',
      onComplete: () => {
        effect.destroy();
        onComplete?.();
      },
    });
  }
}
```

#### 2. GeneralRenderer.shakeGeneral()

```typescript
// packages/game-renderer/src/rendering/GeneralRenderer.ts (추가)

/**
 * 장수 스프라이트 흔들림 효과
 * 피격 시 호출
 * @param generalId - 흔들릴 장수 ID
 */
shakeGeneral(generalId: GeneralId): void {
  const container = this.containers.get(generalId);
  if (!container) return;

  const originalX = container.x;

  // 좌우 흔들림 시퀀스
  this.scene.tweens.add({
    targets: container,
    x: originalX - 5,
    duration: 50,
    yoyo: true,
    repeat: 3,
    ease: 'Linear',
    onComplete: () => {
      container.x = originalX; // 원래 위치로 복귀
    },
  });
}
```

#### 3. BoardRenderer.flashTile()

```typescript
// packages/game-renderer/src/rendering/BoardRenderer.ts (추가)

/**
 * 타일 플래시 효과
 * 피격 시 빨간색 깜빡임
 * @param tileId - 플래시할 타일 ID
 */
flashTile(tileId: TileId): void {
  const tile = this.tiles.get(tileId);
  if (!tile) return;

  // 빨간색 오버레이 생성
  const overlay = this.scene.add.graphics();
  const tileBounds = tile.getBounds();

  overlay.fillStyle(0xFF0000, 0);
  overlay.fillCircle(
    tileBounds.centerX,
    tileBounds.centerY,
    tileBounds.width / 2
  );
  overlay.setDepth(50);

  // 페이드 인/아웃
  this.scene.tweens.add({
    targets: overlay,
    alpha: 0.4,
    duration: 100,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      overlay.destroy();
    },
  });
}
```

#### 4. 사운드 설정 스토어

```typescript
// apps/web/src/stores/settingsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  toggleSound: () => void;
  setSound: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setSound: (enabled) => set({ soundEnabled: enabled }),
    }),
    {
      name: 'game-settings',
    }
  )
);
```

#### 5. GameScene 피드백 시퀀스 통합

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

private attackEffect: AttackEffect | null = null;

create() {
  // ... 기존 코드 ...
  this.attackEffect = new AttackEffect(this);
}

private executeAttack(attackerId: string, defenderId: string): void {
  if (!this.gameState) return;

  const attacker = this.gameState.generals.find(g => g.id === attackerId);
  const defender = this.gameState.generals.find(g => g.id === defenderId);

  if (!attacker || !defender || attacker.position === null || defender.position === null) {
    return;
  }

  const previousTroops = defender.troops;
  const lastPosition = defender.position;

  const result = executeAttack(this.gameState, attackerId, defenderId);

  if (result.success) {
    const { state: newState, result: attackResult } = result.data;

    // 좌표 계산
    const attackerCoords = this.boardRenderer?.getTileCenter(attacker.position);
    const defenderCoords = this.boardRenderer?.getTileCenter(defender.position);

    if (attackerCoords && defenderCoords) {
      // 1. 공격 이펙트 시작
      this.attackEffect?.play(
        attackerCoords.x,
        attackerCoords.y,
        defenderCoords.x,
        defenderCoords.y,
        attackResult.direction,
        () => {
          // 2. 이펙트 도달 시 피격 효과
          this.generalRenderer?.shakeGeneral(defenderId);
          this.boardRenderer?.flashTile(defender.position!);

          // 3. 사운드 재생
          this.playAttackSound();
        }
      );
    }

    // 게임 상태 업데이트
    this.gameState = newState;

    // 4. 데미지 표시 (기존 DamageFloater)
    // ... 기존 코드 유지 ...

    // 5. 병력 갱신 (기존 TroopIndicator)
    // ... 기존 코드 유지 ...

    // 6. OUT 처리 (기존 로직)
    if (attackResult.isKnockOut) {
      this.generalRenderer?.removeGeneral(defenderId);
      this.playDefeatSound();

      this.events.emit('general:out', {
        generalId: defenderId,
        owner: defender.owner,
        lastPosition,
      });
    }

    // ... 기존 코드 계속 ...
  }
}

private playAttackSound(): void {
  // 설정에서 사운드 활성화 확인 필요 (외부에서 전달받거나 전역 상태 참조)
  if (this.sound.get('sfx_attack')) {
    this.sound.play('sfx_attack', { volume: 0.5 });
  }
}

private playDefeatSound(): void {
  if (this.sound.get('sfx_defeat')) {
    this.sound.play('sfx_defeat', { volume: 0.6 });
  }
}
```

#### 6. BootScene 사운드 로드

```typescript
// packages/game-renderer/src/scenes/BootScene.ts (수정)

preload() {
  // ... 기존 에셋 로드 ...

  // 사운드 에셋 로드
  this.load.audio('sfx_attack', 'assets/audio/sfx/sfx_attack.mp3');
  this.load.audio('sfx_defeat', 'assets/audio/sfx/sfx_defeat.mp3');
}
```

### 이전 스토리 학습 사항

**Story 4-5 (장수 OUT 처리):**
- `GeneralRenderer.removeGeneral()` 페이드아웃 애니메이션
- `general:out` 이벤트 발행 패턴
- Container 기반 장수 스프라이트 관리

**Story 4-4 (병력 감소):**
- `DamageFloater` 클래스 구조 (플로팅 데미지)
- `TroopIndicator.updateWithAnimation()` 애니메이션 패턴
- Phaser.Tweens 활용 방식

**Story 4-3 (방향별 데미지 계산):**
- `AttackResult` 인터페이스 (direction, damage, isKnockOut 등)
- 방향별 차별화 패턴

**Epic 3 회고:**
- game-core에 Phaser 의존성 절대 금지
- Phaser 관련 코드는 game-renderer에만 위치
- 애니메이션 타이밍 조율 중요

### Git 커밋 패턴

최근 커밋:
- `feat: 4-5 장수 OUT 처리 (General OUT Handling)`
- `feat: 4-4 병력 감소 (Troop Reduction)`
- `feat: 4-3 방향별 데미지 계산 (Directional Damage Calculation)`

이 스토리 예상 커밋:
- `feat: 4-6 전투 피드백 (Combat Feedback)`

### Project Structure Notes

**신규 파일:**

```
apps/web/public/assets/audio/sfx/
├── sfx_attack.mp3              # 공격 효과음
└── sfx_defeat.mp3              # OUT 효과음

packages/game-renderer/src/rendering/
└── AttackEffect.ts             # 신규: 공격 이펙트 클래스
```

**수정 파일:**

```
apps/web/src/stores/
└── settingsStore.ts            # 수정: soundEnabled 설정 추가

packages/game-renderer/src/
├── rendering/
│   ├── BoardRenderer.ts        # 수정: flashTile() 메서드 추가
│   └── GeneralRenderer.ts      # 수정: shakeGeneral() 메서드 추가
├── scenes/
│   ├── BootScene.ts            # 수정: 사운드 에셋 로드
│   └── GameScene.ts            # 수정: 피드백 시퀀스 통합
└── index.ts                    # 수정: AttackEffect export (필요시)
```

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  ✅ 설정 영역                            │
│  - settingsStore: soundEnabled 설정      │
│  - assets/audio/sfx/: 사운드 파일        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  ✅ 시각/청각 피드백 영역                │
│  - AttackEffect: 공격 이펙트 애니메이션   │
│  - GeneralRenderer: shakeGeneral()       │
│  - BoardRenderer: flashTile()            │
│  - BootScene: 사운드 로드                │
│  - GameScene: 피드백 시퀀스 통합         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ❌ 이 스토리에서 변경 없음              │
│  ⚠️ Phaser 의존성 절대 금지              │
│  - 전투 로직은 이미 완성 (4-1 ~ 4-5)     │
└─────────────────────────────────────────┘
```

### 사운드 에셋 가이드

**MVP 접근법 (권장):**
- 무료 효과음 사이트에서 간단한 효과음 다운로드
- 또는 placeholder로 짧은 무음 파일 생성
- Phase 2+에서 커스텀 사운드로 교체

**추천 무료 사운드 리소스:**
- Freesound.org (CC0 라이선스 검색)
- OpenGameArt.org
- Pixabay Sound Effects

**사운드 스펙:**
- 포맷: MP3 (브라우저 호환성)
- 길이: 0.2-0.5초 (효과음)
- 샘플레이트: 44.1kHz
- 비트레이트: 128kbps+

### 주의사항

1. **피드백 시퀀싱**
   - 이펙트 → 피격 → 데미지 → OUT 순서 유지
   - 각 단계 간 적절한 딜레이 (자연스러운 느낌)
   - 전체 500ms 이내 완료 (게임 템포 유지)

2. **사운드 설정 연동**
   - Phaser scene에서 React 상태 접근 방법 결정 필요
   - 옵션 1: 생성자로 콜백 전달
   - 옵션 2: 전역 window 객체 활용
   - 옵션 3: Phaser scene events로 설정 변경 알림

3. **이펙트 성능**
   - 파티클 시스템 대신 간단한 Graphics 권장 (MVP)
   - 복잡한 이펙트는 Phase 2+
   - 60fps 유지 확인

4. **사운드 로드 실패 처리**
   - 파일 없을 경우 에러 방지
   - `this.sound.get('sfx_attack')` 체크 후 재생
   - 사운드 없어도 게임 진행 가능해야 함

5. **접근성 고려**
   - 사운드 비활성화 시 시각적 피드백만으로 충분해야 함
   - 색상만으로 정보 전달하지 않음 (형태로도 구분)

### 다음 스토리 연결

**Epic 4 완료 후:**
- Epic 4 회고 (epic-4-retrospective) 진행
- 전투 시스템 전체 리뷰
- 밸런스 피드백 수집

**Epic 5: 턴 관리**
- Story 5-1: 턴 종료 버튼
- Story 5-2: 현재 턴 표시
- Story 5-3: 60초 타이머
- Story 5-4: 타이머 자동 종료

### References

- [Source: _bmad-output/epics.md#Epic 4: 전투 시스템] - Story [COMBAT-006] 정의
- [Source: _bmad-output/gdd.md#Art and Audio Direction] - 8-bit/Chiptune 오디오 스타일
- [Source: _bmad-output/gdd.md#Sound Design] - 효과음 스펙
- [Source: _bmad-output/game-architecture.md#Audio Architecture] - Phaser Sound Manager 사용
- [Source: _bmad-output/implementation-artifacts/4-5-general-out-handling.md] - OUT 처리 패턴
- [Source: _bmad-output/implementation-artifacts/4-4-troop-reduction.md] - DamageFloater 패턴
- [Source: packages/game-renderer/src/rendering/DamageFloater.ts] - 플로팅 데미지 구현
- [Source: packages/game-renderer/src/rendering/GeneralRenderer.ts] - 장수 렌더러 구현
- [Source: packages/game-renderer/src/rendering/TroopIndicator.ts] - 병력 표시 구현
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - 현재 GameScene 구현

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- pnpm typecheck: Pass
- pnpm build: Pass

### Completion Notes List

1. **AttackEffect 클래스 구현 (Task 1)**
   - `AttackEffect.ts` 신규 생성: 원형 이펙트가 공격자에서 방어자로 이동하는 애니메이션
   - 방향별 색상 적용: sun(0xffd700 골드), moon(0x4169e1 로열블루), frontline(0xffffff 화이트)
   - 설정 가능한 config (radius, alpha, duration, finalScale, finalAlpha, depth)
   - index.ts에 export 추가

2. **피격 효과 구현 (Task 2)**
   - `GeneralRenderer.shakeGeneral()`: 장수 컨테이너 좌우 흔들림 효과 (intensity, duration, repeat 설정 가능)
   - `BoardRenderer.flashTile()`: 타일 빨간색 플래시 효과 (색상, duration 설정 가능)
   - `BoardRenderer.getTileCenter()`: 공개 API로 타일 중심 좌표 반환

3. **사운드 시스템 구현 (Task 3)**
   - placeholder 사운드 파일 생성: `sfx_attack.mp3`, `sfx_defeat.mp3`
   - `BootScene.preload()`: 사운드 에셋 로드 (실패 시 경고만 출력, 게임 진행 가능)
   - `settingsStore.ts` 신규 생성: soundEnabled 설정 (LocalStorage 영속화)
   - `isSoundEnabled()` 유틸 함수: Phaser에서 React 상태 접근용

4. **전투 피드백 통합 (Task 4)**
   - `GameScene.executeAttack()` 리팩터링: 피드백 시퀀스 통합
   - 시퀀스: 공격 이펙트(250ms) → 피격 효과(shakeGeneral + flashTile + playAttackSound) → 데미지 표시 → 병력 갱신 → OUT 처리(playDefeatSound)
   - `applyHitEffects()`: 피격 효과 헬퍼 메서드
   - `playAttackSound()`, `playDefeatSound()`: 사운드 재생 메서드 (soundEnabled 확인)
   - `setSoundEnabled()`, `isSoundEnabled()`: 외부에서 사운드 설정 제어

5. **빌드 검증 (Task 5)**
   - `pnpm typecheck`: 통과
   - `pnpm build`: 통과
   - 브라우저 수동 테스트는 사용자가 직접 확인 필요

### File List

**신규 파일:**
- packages/game-renderer/src/rendering/AttackEffect.ts
- apps/web/src/stores/settingsStore.ts
- apps/web/public/assets/audio/sfx/sfx_attack.mp3
- apps/web/public/assets/audio/sfx/sfx_defeat.mp3

**수정 파일:**
- packages/game-renderer/src/rendering/GeneralRenderer.ts (shakeGeneral 메서드 추가)
- packages/game-renderer/src/rendering/BoardRenderer.ts (flashTile, getTileCenter 메서드 추가)
- packages/game-renderer/src/scenes/BootScene.ts (사운드 에셋 로드)
- packages/game-renderer/src/scenes/GameScene.ts (피드백 시퀀스 통합, AttackEffect, 사운드 재생)
- packages/game-renderer/src/index.ts (AttackEffect export 추가)

## Change Log

- 2026-02-06: Story 4.6 전투 피드백 구현 완료 (Claude Opus 4.5)
