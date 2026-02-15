import { describe, it, expect } from 'vitest';
import { PLAYER_COLORS, getPlayerColor, hexToNumber, type PlayerId } from '../../src/constants/player';

describe('Player Constants', () => {
  describe('PLAYER_COLORS', () => {
    it('should define colors for player1', () => {
      expect(PLAYER_COLORS.player1).toBeDefined();
      expect(PLAYER_COLORS.player1.primary).toBe('#3B82F6');
      expect(PLAYER_COLORS.player1.highlight).toBe('#60A5FA');
      expect(PLAYER_COLORS.player1.dimmed).toBe('#1E40AF');
      expect(PLAYER_COLORS.player1.icon).toBe('shield');
    });

    it('should define colors for player2', () => {
      expect(PLAYER_COLORS.player2).toBeDefined();
      expect(PLAYER_COLORS.player2.primary).toBe('#EF4444');
      expect(PLAYER_COLORS.player2.highlight).toBe('#F87171');
      expect(PLAYER_COLORS.player2.dimmed).toBe('#B91C1C');
      expect(PLAYER_COLORS.player2.icon).toBe('sword');
    });

    it('should have all required color properties', () => {
      const player1Color = PLAYER_COLORS.player1;
      expect(player1Color).toHaveProperty('primary');
      expect(player1Color).toHaveProperty('highlight');
      expect(player1Color).toHaveProperty('dimmed');
      expect(player1Color).toHaveProperty('icon');
    });
  });

  describe('getPlayerColor', () => {
    it('should return correct color for player1', () => {
      const color = getPlayerColor('player1');
      expect(color.primary).toBe('#3B82F6');
      expect(color.icon).toBe('shield');
    });

    it('should return correct color for player2', () => {
      const color = getPlayerColor('player2');
      expect(color.primary).toBe('#EF4444');
      expect(color.icon).toBe('sword');
    });
  });

  describe('hexToNumber', () => {
    it('should convert hex string with # to number', () => {
      expect(hexToNumber('#3B82F6')).toBe(0x3B82F6);
      expect(hexToNumber('#EF4444')).toBe(0xEF4444);
    });

    it('should convert hex string without # to number', () => {
      expect(hexToNumber('3B82F6')).toBe(0x3B82F6);
      expect(hexToNumber('FFFFFF')).toBe(0xFFFFFF);
    });

    it('should handle lowercase hex', () => {
      expect(hexToNumber('#ffffff')).toBe(0xFFFFFF);
      expect(hexToNumber('abc123')).toBe(0xABC123);
    });
  });
});
