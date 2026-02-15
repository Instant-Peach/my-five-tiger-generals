/**
 * Accessibility Constants Tests
 *
 * Story 8-8: 접근성 및 터치 타겟 (Accessibility & Touch Target)
 * AC6: game-core ACCESSIBILITY 상수 존재 확인
 * AC7: 접근성 테스트
 */

import { describe, it, expect } from 'vitest';
import { ACCESSIBILITY } from '../../src/constants/accessibility';

describe('ACCESSIBILITY', () => {
  it('ACCESSIBILITY 객체가 존재한다', () => {
    expect(ACCESSIBILITY).toBeDefined();
  });

  it('MIN_TOUCH_TARGET이 44로 정의되어 있다', () => {
    expect(ACCESSIBILITY.MIN_TOUCH_TARGET).toBe(44);
  });

  it('FOCUS_OUTLINE_WIDTH가 2로 정의되어 있다', () => {
    expect(ACCESSIBILITY.FOCUS_OUTLINE_WIDTH).toBe(2);
  });

  it('FOCUS_OUTLINE_COLOR가 금색(#ffd700)으로 정의되어 있다', () => {
    expect(ACCESSIBILITY.FOCUS_OUTLINE_COLOR).toBe('#ffd700');
  });

  it('COLOR_BLIND_PATTERNS가 정의되어 있다', () => {
    expect(ACCESSIBILITY.COLOR_BLIND_PATTERNS).toBeDefined();
    expect(ACCESSIBILITY.COLOR_BLIND_PATTERNS.player1).toBe('diagonal');
    expect(ACCESSIBILITY.COLOR_BLIND_PATTERNS.player2).toBe('dots');
  });
});
