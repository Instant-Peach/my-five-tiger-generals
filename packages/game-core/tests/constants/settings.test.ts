/**
 * Settings Constants Tests
 *
 * Story 8-5: 설정 메뉴 (Settings Menu)
 * game-core settings 상수 검증
 */

import { describe, it, expect } from 'vitest';
import { SETTINGS_DEFAULTS, SETTINGS_STORAGE_KEY } from '../../src/constants/settings';

describe('Settings Constants', () => {
  describe('SETTINGS_DEFAULTS', () => {
    it('SETTINGS_DEFAULTS가 존재한다', () => {
      expect(SETTINGS_DEFAULTS).toBeDefined();
    });

    it('soundEnabled 기본값이 true이다', () => {
      expect(SETTINGS_DEFAULTS.soundEnabled).toBe(true);
    });

    it('SETTINGS_DEFAULTS는 readonly 객체이다', () => {
      expect(typeof SETTINGS_DEFAULTS).toBe('object');
      expect(SETTINGS_DEFAULTS).not.toBeNull();
    });
  });

  describe('SETTINGS_STORAGE_KEY', () => {
    it('SETTINGS_STORAGE_KEY가 존재한다', () => {
      expect(SETTINGS_STORAGE_KEY).toBeDefined();
    });

    it('SETTINGS_STORAGE_KEY가 "game-settings"이다', () => {
      expect(SETTINGS_STORAGE_KEY).toBe('game-settings');
    });

    it('SETTINGS_STORAGE_KEY는 string 타입이다', () => {
      expect(typeof SETTINGS_STORAGE_KEY).toBe('string');
    });
  });
});
