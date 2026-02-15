# Story 3.3: 장수 이동 애니메이션 (Movement Animation)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 장수 이동 시 부드러운 애니메이션이 재생된다,
so that 장수의 움직임을 시각적으로 따라갈 수 있고, 게임의 몰입감이 향상된다.

## Acceptance Criteria

1. **AC1**: 장수가 이동할 때 출발 타일에서 도착 타일까지 부드러운 슬라이드 애니메이션이 재생된다
   - Phaser Tween을 사용한 위치 보간
   - 애니메이션 지속 시간: 200-300ms (빠르고 반응적인 느낌)
   - 이징 함수: Power2 또는 Quad (자연스러운 가감속)

2. **AC2**: 애니메이션 재생 중에는 추가 입력이 차단된다
   - 이동 애니메이션 중 다른 타일/장수 클릭 무시
   - 애니메이션 완료 후 입력 다시 활성화
   - 애니메이션 상태 플래그로 관리

3. **AC3**: 애니메이션 완료 후 게임 상태가 올바르게 동기화된다
   - 애니메이션 완료 콜백에서 최종 상태 확정
   - 이동 가능 타일 하이라이트 재계산 (새 위치 기준)
   - 장수 선택 상태 유지

4. **AC4**: 애니메이션이 성능에 영향을 주지 않는다
   - 60fps 유지
   - 단일 Tween 사용 (복잡한 트윈 체인 지양)
   - 메모리 누수 방지 (Tween 완료 후 정리)

5. **AC5**: 접근성 설정에 따라 애니메이션을 비활성화할 수 있다 (선택적)
   - 모션 감소(reduce motion) 설정 시 즉시 이동
   - 설정은 LocalStorage에 저장 (향후 구현 대비)
   - 기본값: 애니메이션 활성화

## Tasks / Subtasks

- [x] Task 1: GeneralRenderer에 애니메이션 이동 메서드 추가 (AC: 1, 4)
  - [x] 1.1: `animateMoveTo()` 메서드 구현
    - `packages/game-renderer/src/rendering/GeneralRenderer.ts` 수정
    - 입력: generalId, toTileId, options (duration, ease, onComplete)
    - Phaser Tween 사용하여 부드러운 위치 이동
  - [x] 1.2: 애니메이션 옵션 상수 정의
    - `packages/game-renderer/src/constants/animation.ts` 생성
    - MOVEMENT_ANIMATION 상수 (DURATION, EASE)
  - [x] 1.3: 기존 `updatePosition()` 메서드와 분리
    - updatePosition: 즉시 이동 (애니메이션 없음)
    - animateMoveTo: 애니메이션 이동

- [x] Task 2: 애니메이션 상태 관리 구현 (AC: 2)
  - [x] 2.1: GeneralRenderer에 애니메이션 상태 플래그 추가
    - `isAnimating: boolean` 속성
    - `getIsAnimating()` 메서드
  - [x] 2.2: GameScene에서 애니메이션 중 입력 차단
    - handleTileSelect()에서 애니메이션 체크
    - 애니메이션 중이면 early return
  - [x] 2.3: 애니메이션 완료 콜백 처리
    - onComplete 콜백에서 isAnimating = false
    - 콜백에서 후속 처리 실행

- [x] Task 3: GameScene 이동 로직에 애니메이션 연동 (AC: 1, 3)
  - [x] 3.1: `executeMove()` 메서드 수정
    - `updatePosition()` 대신 `animateMoveTo()` 호출
    - 애니메이션 완료 콜백에서 상태 업데이트
  - [x] 3.2: 애니메이션 완료 후 처리
    - 이동 가능 타일 재계산
    - 이벤트 발행 (general:moved)
    - 입력 잠금 해제

- [x] Task 4: 접근성 지원 (AC: 5, 선택적)
  - [x] 4.1: 애니메이션 설정 인터페이스 정의
    - `MoveAnimationOptions.skipAnimation` 옵션으로 구현
    - reduceMotion 옵션 (skipAnimation으로 지원)
  - [x] 4.2: 설정에 따른 조건부 애니메이션
    - skipAnimation = true 시 즉시 이동
    - skipAnimation = false 시 애니메이션 이동

- [x] Task 5: 테스트 작성 (AC: 전체)
  - [x] 5.1: animateMoveTo() 단위 테스트
    - Tween 생성 확인 (모킹 필요)
    - 콜백 실행 확인
  - [x] 5.2: 입력 차단 테스트
    - 애니메이션 중 입력 무시 확인
    - 애니메이션 완료 후 입력 활성화 확인
  - [x] 5.3: 통합 테스트
    - 빌드 성공 확인 (pnpm build)
    - 기존 테스트 통과 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 이 스토리에서는 game-core 변경 없음
- 애니메이션은 순수 렌더링 관심사 → game-renderer에서 처리

**game-renderer 패키지 (Phaser 렌더링)**
- GeneralRenderer: animateMoveTo() 메서드 추가
- GameScene: executeMove() 수정하여 애니메이션 연동
- 상수: animation.ts 생성 (애니메이션 설정)

**apps/web (React UI)**
- 이 스토리에서는 React UI 변경 없음

### 핵심 구현 패턴

#### 1. 이동 애니메이션 상수 정의

```typescript
// packages/game-renderer/src/constants/animation.ts

/** 장수 이동 애니메이션 설정 */
export const MOVEMENT_ANIMATION = {
  /** 애니메이션 지속 시간 (ms) */
  DURATION: 250,
  /** 이징 함수 */
  EASE: 'Power2',
  /** 최소 지속 시간 (너무 짧으면 버벅임) */
  MIN_DURATION: 100,
  /** 최대 지속 시간 (너무 길면 답답함) */
  MAX_DURATION: 400,
} as const;
```

#### 2. GeneralRenderer 애니메이션 메서드

```typescript
// packages/game-renderer/src/rendering/GeneralRenderer.ts (수정)

import { MOVEMENT_ANIMATION } from '../constants/animation';

export interface MoveAnimationOptions {
  /** 애니메이션 지속 시간 (ms) */
  duration?: number;
  /** 이징 함수 */
  ease?: string;
  /** 완료 콜백 */
  onComplete?: () => void;
  /** 애니메이션 건너뛰기 (접근성) */
  skipAnimation?: boolean;
}

export class GeneralRenderer {
  // ... 기존 코드

  /** 애니메이션 진행 중 여부 */
  private isAnimating: boolean = false;

  /**
   * 애니메이션 진행 중 여부 반환
   */
  getIsAnimating(): boolean {
    return this.isAnimating;
  }

  /**
   * 장수 애니메이션 이동
   *
   * @param generalId - 장수 ID
   * @param toTileId - 목적지 타일 ID
   * @param options - 애니메이션 옵션
   */
  animateMoveTo(
    generalId: string,
    toTileId: TileId,
    options: MoveAnimationOptions = {}
  ): void {
    const container = this.containers.get(generalId);
    if (!container) return;

    const { x: targetX, y: targetY } = this.getTileCenter(toTileId);

    const {
      duration = MOVEMENT_ANIMATION.DURATION,
      ease = MOVEMENT_ANIMATION.EASE,
      onComplete,
      skipAnimation = false,
    } = options;

    // 접근성: 애니메이션 건너뛰기
    if (skipAnimation) {
      container.setPosition(targetX, targetY);
      onComplete?.();
      return;
    }

    // 애니메이션 시작
    this.isAnimating = true;

    this.scene.tweens.add({
      targets: container,
      x: targetX,
      y: targetY,
      duration,
      ease,
      onComplete: () => {
        this.isAnimating = false;
        onComplete?.();
      },
    });
  }
}
```

#### 3. GameScene executeMove() 수정

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

/**
 * 장수 이동 실행 (애니메이션 포함)
 *
 * @param generalId - 이동할 장수 ID
 * @param toTileId - 목적지 타일 ID
 */
private executeMove(generalId: string, toTileId: TileId): void {
  if (!this.gameState) return;

  // 애니메이션 중이면 무시
  if (this.generalRenderer?.getIsAnimating()) {
    return;
  }

  // 이동 실행 (내부에서 모든 검증 수행)
  const result = moveGeneral(this.gameState, generalId, toTileId);

  if (result.success) {
    const previousPosition = this.gameState.generals.find(g => g.id === generalId)?.position;

    // 게임 상태 업데이트 (즉시)
    this.gameState = result.data;

    // 장수 애니메이션 이동
    if (this.generalRenderer) {
      this.generalRenderer.animateMoveTo(generalId, toTileId, {
        onComplete: () => {
          // 애니메이션 완료 후 처리
          this.onMoveAnimationComplete(generalId, toTileId, previousPosition);
        },
      });
    }
  } else {
    // 이동 실패 처리
    console.warn(`[GameScene] 이동 실패: ${result.error.message}`);
    this.events.emit('action:invalid', {
      reason: result.error.code,
      message: result.error.message,
    });
  }
}

/**
 * 이동 애니메이션 완료 후 처리
 */
private onMoveAnimationComplete(
  generalId: string,
  toTileId: TileId,
  previousPosition: TileId | null | undefined
): void {
  // 선택된 타일 업데이트
  this.selectedTileId = toTileId;

  // 이동 가능 타일 재계산 및 표시
  if (this.boardRenderer && this.gameState) {
    const newMovableTiles = getMovableTilesForGeneral(this.gameState, generalId);
    this.boardRenderer.showMovableTiles(newMovableTiles);
  }

  // 시각적 업데이트
  this.updateTileVisuals();

  // 이동 완료 이벤트 발행
  this.events.emit('general:moved', {
    generalId,
    from: previousPosition,
    to: toTileId,
    actionsRemaining: this.gameState?.actionsRemaining,
  });
}
```

#### 4. 입력 차단 로직

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

/**
 * 타일 선택 핸들러
 */
private handleTileSelect(tileId: TileId | null): void {
  if (!this.gameState) return;

  // 애니메이션 중이면 입력 무시
  if (this.generalRenderer?.getIsAnimating()) {
    return;
  }

  // ... 기존 로직
}
```

### GDD 및 아키텍처 참고

**GDD - 이동 시스템:**
- 장수 이동 시 부드러운 애니메이션 재생
- 20-40분 세션에 맞는 빠른 템포 유지 → 짧은 애니메이션 (200-300ms)

**GDD - 접근성:**
- 애니메이션 감소: 모션 민감 유저를 위한 옵션

**아키텍처 - 렌더링 패턴:**
- Phaser Tween을 사용한 애니메이션
- 콜백 기반 완료 처리
- 상태 플래그로 동시성 제어

### 이전 스토리(3-1, 3-2) 학습 사항

**3-1 (이동 가능 타일 표시):**
- BoardRenderer.showMovableTiles() / clearMovableTiles() 활용
- getMovableTilesForGeneral() 함수로 이동 가능 타일 계산

**3-2 (장수 이동):**
- moveGeneral() 함수로 이동 검증 및 상태 업데이트
- GeneralRenderer.updatePosition()으로 즉시 위치 업데이트
- executeMove() 메서드에서 이동 로직 처리
- general:moved 이벤트 발행

**활용할 기존 코드:**
```typescript
// 이미 구현된 위치 업데이트 (즉시)
this.generalRenderer.updatePosition(generalId, toTileId);

// 이동 가능 타일 재계산
const newMovableTiles = getMovableTilesForGeneral(this.gameState, generalId);
this.boardRenderer.showMovableTiles(newMovableTiles);
```

### Git 커밋 분석 (최근 작업 패턴)

**최근 커밋:**
1. `3bcc0e0` - feat: 3-2 장수 이동 (General Movement)
2. `e0a0bb4` - fix: 코드 리뷰 후속 수정 - 측면 타일 꼭짓점 인접 완성 및 디버그 코드 제거
3. `1bcc422` - fix: 타일 인접 관계 수정 (변 인접 vs 꼭짓점 인접 분리)
4. `c7492b6` - feat: 3-1-moveable-tiles-display 이동 가능 타일 표시

**패턴 학습:**
- 3-2에서 이동 로직 구현 완료 → 이 스토리는 시각적 피드백(애니메이션)에 집중
- 코드 리뷰에서 디버그 코드 제거 요청 → 최종 커밋 전 console.log 제거

### Project Structure Notes

**신규 파일:**
```
packages/game-renderer/src/
└── constants/
    └── animation.ts                # MOVEMENT_ANIMATION 상수
```

**수정 파일:**
```
packages/game-renderer/src/
├── rendering/
│   └── GeneralRenderer.ts          # animateMoveTo() 메서드 추가
│       - MoveAnimationOptions 인터페이스
│       - isAnimating 상태 플래그
│       - getIsAnimating() 메서드
│       - animateMoveTo() 메서드
│
└── scenes/
    └── GameScene.ts                # 애니메이션 연동
        - executeMove() 수정 (애니메이션 호출)
        - onMoveAnimationComplete() 추가
        - handleTileSelect() 입력 차단 추가
```

**테스트 파일:**
```
packages/game-renderer/tests/
└── rendering/
    └── GeneralRenderer.test.ts     # animateMoveTo() 테스트
        - Tween 모킹
        - 애니메이션 상태 테스트
        - 콜백 실행 테스트
```

### Phaser Tween 사용 가이드

**기본 Tween 생성:**
```typescript
this.scene.tweens.add({
  targets: gameObject,      // 애니메이션 대상
  x: targetX,               // 목표 x 좌표
  y: targetY,               // 목표 y 좌표
  duration: 250,            // 지속 시간 (ms)
  ease: 'Power2',           // 이징 함수
  onComplete: () => {       // 완료 콜백
    // 후처리
  },
});
```

**이징 함수 옵션:**
| 이징 | 특성 | 적합한 용도 |
|------|------|-------------|
| Linear | 일정 속도 | 기계적 움직임 |
| Power2 | 가속/감속 | 자연스러운 이동 (권장) |
| Quad | 부드러운 가감속 | 캐릭터 이동 |
| Back | 살짝 튕김 | 과장된 움직임 |
| Bounce | 튕기는 효과 | 착지/충돌 |

**Tween 정리:**
```typescript
// 특정 대상의 모든 Tween 중지
this.scene.tweens.killTweensOf(target);

// Scene 종료 시 자동 정리됨
```

### 네이밍 컨벤션 (아키텍처 문서)

- **메서드**: camelCase (`animateMoveTo`, `getIsAnimating`, `onMoveAnimationComplete`)
- **상수**: UPPER_SNAKE (`MOVEMENT_ANIMATION`, `DURATION`, `EASE`)
- **인터페이스**: PascalCase (`MoveAnimationOptions`)
- **속성**: camelCase (`isAnimating`)

### References

- [Source: _bmad-output/epics.md#Epic 3: 이동 시스템] - Story [MOVE-003] 정의
- [Source: _bmad-output/gdd.md#Movement Rules] - 이동 시 애니메이션
- [Source: _bmad-output/gdd.md#Accessibility Controls] - 애니메이션 감소 옵션
- [Source: _bmad-output/game-architecture.md#Engine & Framework] - Phaser 3.90.0
- [Source: _bmad-output/implementation-artifacts/3-2-general-movement.md] - 이전 스토리 구현
- [Source: packages/game-renderer/src/rendering/GeneralRenderer.ts] - updatePosition() 메서드
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - executeMove() 메서드

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

1. **Task 1 완료**: GeneralRenderer에 `animateMoveTo()` 메서드 추가
   - MOVEMENT_ANIMATION 상수 정의 (DURATION: 250ms, EASE: Power2)
   - MoveAnimationOptions 인터페이스로 유연한 옵션 지원
   - 기존 `updatePosition()`은 즉시 이동용으로 유지

2. **Task 2 완료**: 애니메이션 상태 관리
   - `isAnimating` 플래그로 애니메이션 진행 중 상태 추적
   - `getIsAnimating()` 메서드로 상태 조회
   - GameScene의 `handleTileSelect()`에서 애니메이션 중 입력 차단

3. **Task 3 완료**: GameScene 이동 로직 애니메이션 연동
   - `executeMove()` 수정하여 `animateMoveTo()` 호출
   - `onMoveAnimationComplete()` 메서드 추가로 완료 후 처리 분리
   - 이동 가능 타일 재계산, 이벤트 발행, 입력 잠금 해제 처리

4. **Task 4 완료**: 접근성 지원 (skipAnimation 옵션)
   - `MoveAnimationOptions.skipAnimation`으로 즉시 이동 지원
   - 향후 설정 시스템 연동 대비 완료

5. **Task 5 완료**: 테스트 작성
   - game-renderer 패키지에 vitest 설정 추가
   - GeneralRenderer.animation.test.ts: 17개 테스트
   - animation.test.ts: 5개 테스트
   - 전체 빌드 성공 (pnpm build)
   - 기존 테스트 326개 + 신규 22개 = 348개 모두 통과

### File List

**신규 파일:**
- `packages/game-renderer/src/constants/animation.ts` - 애니메이션 상수 정의
- `packages/game-renderer/vitest.config.ts` - Vitest 설정
- `packages/game-renderer/tests/rendering/GeneralRenderer.animation.test.ts` - 애니메이션 테스트
- `packages/game-renderer/tests/constants/animation.test.ts` - 상수 테스트

**수정 파일:**
- `packages/game-renderer/src/rendering/GeneralRenderer.ts` - animateMoveTo(), getIsAnimating() 추가
- `packages/game-renderer/src/scenes/GameScene.ts` - executeMove() 애니메이션 연동, 입력 차단 추가
- `packages/game-renderer/package.json` - vitest 의존성 및 test 스크립트 추가

## Change Log

- 2026-02-04: Story 3-3 구현 완료 - 장수 이동 애니메이션 (Claude Opus 4.5)
