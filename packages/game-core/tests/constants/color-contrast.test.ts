import { describe, it, expect } from 'vitest';
import { PLAYER_COLORS } from '../../src/constants/player';

/**
 * WCAG 2.1 색상 대비 검증 테스트
 *
 * 대비율 계산 공식: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * 요구사항: AA 레벨 - 4.5:1 (일반 텍스트), 3:1 (큰 텍스트 또는 UI 컴포넌트)
 */

/**
 * 16진수 색상을 RGB로 변환
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * RGB 값을 상대 휘도(relative luminance)로 변환
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 두 색상 간 대비율 계산
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

describe('WCAG 2.1 Color Contrast', () => {
  // 보드 배경색 (일반적으로 어두운 회색 또는 검정색 계열)
  // 실제 보드 배경색은 TileRenderer 또는 게임 씬 배경색 참고
  const BOARD_BACKGROUND = '#1a1a1a'; // 진한 회색 (가정)
  const WHITE_BACKGROUND = '#ffffff'; // 스탯 패널 배경
  const DARK_BACKGROUND = '#1F2937'; // gray-800 (스탯 패널 실제 배경)

  describe('Player Colors on Board Background', () => {
    it('should have sufficient contrast for player1 primary color', () => {
      const ratio = getContrastRatio(PLAYER_COLORS.player1.primary, BOARD_BACKGROUND);
      expect(ratio).toBeGreaterThanOrEqual(3); // UI 컴포넌트 최소 기준 3:1
      console.log(`Player 1 Primary vs Board: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for player2 primary color', () => {
      const ratio = getContrastRatio(PLAYER_COLORS.player2.primary, BOARD_BACKGROUND);
      expect(ratio).toBeGreaterThanOrEqual(3); // UI 컴포넌트 최소 기준 3:1
      console.log(`Player 2 Primary vs Board: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Player Colors on Stats Panel Background', () => {
    it('should have sufficient contrast for player1 primary text on dark background', () => {
      const ratio = getContrastRatio(PLAYER_COLORS.player1.primary, DARK_BACKGROUND);
      expect(ratio).toBeGreaterThanOrEqual(3); // UI 컴포넌트 기준
      console.log(`Player 1 Primary vs Stats Panel: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for player2 primary text on dark background', () => {
      const ratio = getContrastRatio(PLAYER_COLORS.player2.primary, DARK_BACKGROUND);
      expect(ratio).toBeGreaterThanOrEqual(3); // UI 컴포넌트 기준
      console.log(`Player 2 Primary vs Stats Panel: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Highlight Colors on Board Background', () => {
    it('should have sufficient contrast for player1 highlight color', () => {
      const ratio = getContrastRatio(PLAYER_COLORS.player1.highlight, BOARD_BACKGROUND);
      expect(ratio).toBeGreaterThanOrEqual(3);
      console.log(`Player 1 Highlight vs Board: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for player2 highlight color', () => {
      const ratio = getContrastRatio(PLAYER_COLORS.player2.highlight, BOARD_BACKGROUND);
      expect(ratio).toBeGreaterThanOrEqual(3);
      console.log(`Player 2 Highlight vs Board: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Player Color Distinction', () => {
    it('should be measurably different colors between players', () => {
      const ratio = getContrastRatio(PLAYER_COLORS.player1.primary, PLAYER_COLORS.player2.primary);
      // 플레이어 간 색상은 색조(Hue)로 구별되므로 휘도 대비는 낮을 수 있음
      // 파란색(#3B82F6)과 빨간색(#EF4444)은 색상환에서 충분히 멀리 떨어져 있음
      // 대비율 1:1 이상이면 최소한 다른 색상임을 의미
      expect(ratio).toBeGreaterThan(1);
      console.log(`Player 1 vs Player 2 (luminance contrast): ${ratio.toFixed(2)}:1`);
      console.log('Note: Players are distinguished by hue (blue vs red), not just luminance');
    });
  });

  describe('Utility Functions', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0); // 이론적 최대값 21:1
    });

    it('should calculate correct contrast ratio for same color', () => {
      const ratio = getContrastRatio('#3B82F6', '#3B82F6');
      expect(ratio).toBeCloseTo(1, 1); // 같은 색상은 1:1
    });
  });
});
