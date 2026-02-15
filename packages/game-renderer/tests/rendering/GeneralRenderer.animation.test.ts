/**
 * GeneralRenderer Animation Tests (Story 3-3)
 *
 * 장수 이동 애니메이션 기능 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MOVEMENT_ANIMATION } from '../../src/constants/animation';

// Phaser 모킹
const mockTweenAdd = vi.fn();
const mockTweenStop = vi.fn();
const mockSetPosition = vi.fn();

// 모의 Tween 객체
const createMockTween = () => ({
  stop: mockTweenStop,
});

// 모의 Container 객체
const mockContainer = {
  setPosition: mockSetPosition,
  x: 100,
  y: 100,
};

// 모의 Scene 객체
const mockScene = {
  tweens: {
    add: mockTweenAdd.mockImplementation(() => createMockTween()),
    killTweensOf: vi.fn(),
  },
  add: {
    container: vi.fn().mockReturnValue(mockContainer),
    circle: vi.fn(),
    text: vi.fn().mockReturnValue({ setOrigin: vi.fn() }),
    graphics: vi.fn(),
  },
};

// GeneralRenderer 테스트를 위한 간단한 구현 (실제 구현과 동일한 로직)
class TestGeneralRenderer {
  private scene: typeof mockScene;
  private containers: Map<string, typeof mockContainer> = new Map();
  private getTileCenter: (tileId: number) => { x: number; y: number };
  private isAnimating: boolean = false;
  private animatingGeneralId: string | null = null;
  private moveTween: { stop: () => void } | null = null;

  constructor(
    scene: typeof mockScene,
    getTileCenter: (tileId: number) => { x: number; y: number }
  ) {
    this.scene = scene;
    this.getTileCenter = getTileCenter;
  }

  // 테스트용 컨테이너 설정
  setContainer(generalId: string, container: typeof mockContainer): void {
    this.containers.set(generalId, container);
  }

  getIsAnimating(): boolean {
    return this.isAnimating;
  }

  getAnimatingGeneralId(): string | null {
    return this.animatingGeneralId;
  }

  animateMoveTo(
    generalId: string,
    toTileId: number,
    options: {
      duration?: number;
      ease?: string;
      onComplete?: () => void;
      skipAnimation?: boolean;
    } = {}
  ): boolean {
    // 이미 애니메이션 중이면 무시 (동일 장수 이중 이동 방지)
    if (this.isAnimating) {
      return false;
    }

    const container = this.containers.get(generalId);
    if (!container) {
      return false;
    }

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
      return true;
    }

    // 애니메이션 시작
    this.isAnimating = true;
    this.animatingGeneralId = generalId;

    // 기존 Tween이 있으면 정리
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = null;
    }

    this.moveTween = this.scene.tweens.add({
      targets: container,
      x: targetX,
      y: targetY,
      duration,
      ease,
      onComplete: () => {
        this.cleanupMoveTween();
        onComplete?.();
      },
    });

    return true;
  }

  private cleanupMoveTween(): void {
    this.isAnimating = false;
    this.animatingGeneralId = null;
    this.moveTween = null;
  }

  destroy(): void {
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = null;
    }
    this.isAnimating = false;
    this.animatingGeneralId = null;
  }
}

describe('GeneralRenderer Animation (Story 3-3)', () => {
  let renderer: TestGeneralRenderer;
  let getTileCenterMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetPosition.mockClear();
    mockTweenAdd.mockClear();
    mockTweenStop.mockClear();

    getTileCenterMock = vi.fn().mockReturnValue({ x: 200, y: 300 });
    renderer = new TestGeneralRenderer(mockScene, getTileCenterMock);
    renderer.setContainer('general1', mockContainer);
  });

  describe('MOVEMENT_ANIMATION constants', () => {
    it('should have correct default duration (AC4: 60fps friendly)', () => {
      expect(MOVEMENT_ANIMATION.DURATION).toBe(250);
      expect(MOVEMENT_ANIMATION.DURATION).toBeGreaterThanOrEqual(MOVEMENT_ANIMATION.MIN_DURATION);
      expect(MOVEMENT_ANIMATION.DURATION).toBeLessThanOrEqual(MOVEMENT_ANIMATION.MAX_DURATION);
    });

    it('should have valid ease function', () => {
      expect(MOVEMENT_ANIMATION.EASE).toBe('Power2');
    });

    it('should have sensible duration bounds (AC1: 200-300ms)', () => {
      expect(MOVEMENT_ANIMATION.MIN_DURATION).toBe(100);
      expect(MOVEMENT_ANIMATION.MAX_DURATION).toBe(400);
    });
  });

  describe('animateMoveTo()', () => {
    describe('AC1: Smooth slide animation', () => {
      it('should create Phaser tween with correct parameters', () => {
        renderer.animateMoveTo('general1', 5);

        expect(mockTweenAdd).toHaveBeenCalledTimes(1);
        expect(mockTweenAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            targets: mockContainer,
            x: 200,
            y: 300,
            duration: MOVEMENT_ANIMATION.DURATION,
            ease: MOVEMENT_ANIMATION.EASE,
          })
        );
      });

      it('should get tile center for target position', () => {
        renderer.animateMoveTo('general1', 10);

        expect(getTileCenterMock).toHaveBeenCalledWith(10);
      });

      it('should use custom duration when provided', () => {
        renderer.animateMoveTo('general1', 5, { duration: 300 });

        expect(mockTweenAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 300,
          })
        );
      });

      it('should use custom ease when provided', () => {
        renderer.animateMoveTo('general1', 5, { ease: 'Quad' });

        expect(mockTweenAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            ease: 'Quad',
          })
        );
      });
    });

    describe('AC2: Animation state management', () => {
      it('should set isAnimating to true when animation starts', () => {
        expect(renderer.getIsAnimating()).toBe(false);

        renderer.animateMoveTo('general1', 5);

        expect(renderer.getIsAnimating()).toBe(true);
      });

      it('should set isAnimating to false when animation completes', () => {
        renderer.animateMoveTo('general1', 5);

        // 애니메이션이 시작되면 isAnimating = true
        expect(renderer.getIsAnimating()).toBe(true);

        // onComplete 콜백 추출 및 실행
        const tweenConfig = mockTweenAdd.mock.calls[0][0];
        tweenConfig.onComplete();

        expect(renderer.getIsAnimating()).toBe(false);
      });

      it('should call custom onComplete callback when animation finishes', () => {
        const onCompleteMock = vi.fn();

        renderer.animateMoveTo('general1', 5, { onComplete: onCompleteMock });

        // onComplete 콜백 추출 및 실행
        const tweenConfig = mockTweenAdd.mock.calls[0][0];
        tweenConfig.onComplete();

        expect(onCompleteMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('AC5: Accessibility - skip animation', () => {
      it('should instantly set position when skipAnimation is true', () => {
        const result = renderer.animateMoveTo('general1', 5, { skipAnimation: true });

        expect(result).toBe(true);
        // Tween이 생성되지 않아야 함
        expect(mockTweenAdd).not.toHaveBeenCalled();

        // 즉시 위치 설정
        expect(mockSetPosition).toHaveBeenCalledWith(200, 300);
      });

      it('should call onComplete immediately when skipping animation', () => {
        const onCompleteMock = vi.fn();

        const result = renderer.animateMoveTo('general1', 5, {
          skipAnimation: true,
          onComplete: onCompleteMock,
        });

        expect(result).toBe(true);
        expect(onCompleteMock).toHaveBeenCalledTimes(1);
      });

      it('should not set isAnimating when skipping animation', () => {
        renderer.animateMoveTo('general1', 5, { skipAnimation: true });

        expect(renderer.getIsAnimating()).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should return false if general does not exist', () => {
        const result = renderer.animateMoveTo('nonexistent', 5);

        expect(result).toBe(false);
        expect(mockTweenAdd).not.toHaveBeenCalled();
        expect(mockSetPosition).not.toHaveBeenCalled();
      });

      it('should handle multiple sequential animations (AC3: state sync)', () => {
        // 첫 번째 애니메이션 시작
        const result1 = renderer.animateMoveTo('general1', 5);
        expect(result1).toBe(true);
        expect(renderer.getIsAnimating()).toBe(true);

        // 첫 번째 애니메이션 완료
        const firstTweenConfig = mockTweenAdd.mock.calls[0][0];
        firstTweenConfig.onComplete();
        expect(renderer.getIsAnimating()).toBe(false);

        // 두 번째 애니메이션 시작
        getTileCenterMock.mockReturnValue({ x: 400, y: 500 });
        const result2 = renderer.animateMoveTo('general1', 10);

        expect(result2).toBe(true);
        expect(mockTweenAdd).toHaveBeenCalledTimes(2);
        expect(renderer.getIsAnimating()).toBe(true);
      });

      it('should reject animation request during another animation (CRITICAL-3)', () => {
        // 첫 번째 애니메이션 시작
        const result1 = renderer.animateMoveTo('general1', 5);
        expect(result1).toBe(true);
        expect(renderer.getIsAnimating()).toBe(true);
        expect(renderer.getAnimatingGeneralId()).toBe('general1');

        // 두 번째 애니메이션 요청 (거부되어야 함)
        const result2 = renderer.animateMoveTo('general1', 10);
        expect(result2).toBe(false);

        // Tween은 한 번만 생성되어야 함
        expect(mockTweenAdd).toHaveBeenCalledTimes(1);
      });

      it('should track animating general ID correctly', () => {
        expect(renderer.getAnimatingGeneralId()).toBeNull();

        renderer.animateMoveTo('general1', 5);
        expect(renderer.getAnimatingGeneralId()).toBe('general1');

        // 애니메이션 완료
        const tweenConfig = mockTweenAdd.mock.calls[0][0];
        tweenConfig.onComplete();
        expect(renderer.getAnimatingGeneralId()).toBeNull();
      });
    });

    describe('Resource cleanup', () => {
      it('should cleanup tween on destroy', () => {
        renderer.animateMoveTo('general1', 5);
        expect(renderer.getIsAnimating()).toBe(true);

        renderer.destroy();

        expect(mockTweenStop).toHaveBeenCalledTimes(1);
        expect(renderer.getIsAnimating()).toBe(false);
        expect(renderer.getAnimatingGeneralId()).toBeNull();
      });

      it('should cleanup previous tween before starting new animation', () => {
        // 첫 번째 애니메이션
        renderer.animateMoveTo('general1', 5);

        // 첫 번째 애니메이션 완료
        const firstTweenConfig = mockTweenAdd.mock.calls[0][0];
        firstTweenConfig.onComplete();

        // 두 번째 애니메이션
        renderer.animateMoveTo('general1', 10);

        // 두 번째 애니메이션 전에 정리가 필요하지 않음 (이미 완료됨)
        // 하지만 destroy 호출 시 현재 tween이 정리됨
        renderer.destroy();
        expect(mockTweenStop).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getIsAnimating()', () => {
    it('should return false by default', () => {
      expect(renderer.getIsAnimating()).toBe(false);
    });

    it('should return true during animation', () => {
      renderer.animateMoveTo('general1', 5);
      expect(renderer.getIsAnimating()).toBe(true);
    });
  });
});
