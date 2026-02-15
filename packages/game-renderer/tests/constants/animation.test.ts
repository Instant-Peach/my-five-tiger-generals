/**
 * Animation Constants Tests (Story 3-3)
 *
 * 애니메이션 상수 검증
 */

import { describe, it, expect } from 'vitest';
import { MOVEMENT_ANIMATION } from '../../src/constants/animation';

describe('Animation Constants', () => {
  describe('MOVEMENT_ANIMATION', () => {
    it('should have DURATION within acceptable range for 60fps', () => {
      // 60fps = 16.67ms per frame
      // 250ms = ~15 frames, smooth enough for animation
      expect(MOVEMENT_ANIMATION.DURATION).toBeGreaterThanOrEqual(100);
      expect(MOVEMENT_ANIMATION.DURATION).toBeLessThanOrEqual(500);
    });

    it('should have DURATION between MIN and MAX', () => {
      expect(MOVEMENT_ANIMATION.DURATION).toBeGreaterThanOrEqual(
        MOVEMENT_ANIMATION.MIN_DURATION
      );
      expect(MOVEMENT_ANIMATION.DURATION).toBeLessThanOrEqual(
        MOVEMENT_ANIMATION.MAX_DURATION
      );
    });

    it('should have a valid Phaser ease function name', () => {
      // Phaser 지원 이징 함수 목록
      const validEaseFunctions = [
        'Linear',
        'Quad',
        'Cubic',
        'Quart',
        'Quint',
        'Sine',
        'Expo',
        'Circ',
        'Back',
        'Elastic',
        'Bounce',
        'Power0',
        'Power1',
        'Power2',
        'Power3',
        'Power4',
      ];

      expect(validEaseFunctions).toContain(MOVEMENT_ANIMATION.EASE);
    });

    it('should be immutable (const assertion)', () => {
      // TypeScript const assertion으로 인해 런타임에서는 직접 테스트 불가
      // 대신 값이 변경되지 않았는지 확인
      expect(MOVEMENT_ANIMATION.DURATION).toBe(250);
      expect(MOVEMENT_ANIMATION.EASE).toBe('Power2');
      expect(MOVEMENT_ANIMATION.MIN_DURATION).toBe(100);
      expect(MOVEMENT_ANIMATION.MAX_DURATION).toBe(400);
    });

    it('should meet GDD requirement of 200-300ms feel', () => {
      // GDD 요구사항: "빠르고 반응적인 느낌" = 200-300ms
      expect(MOVEMENT_ANIMATION.DURATION).toBeGreaterThanOrEqual(200);
      expect(MOVEMENT_ANIMATION.DURATION).toBeLessThanOrEqual(300);
    });
  });
});
