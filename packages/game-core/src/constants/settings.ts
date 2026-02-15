/**
 * Settings Constants
 *
 * Story 8-5: 설정 메뉴 (Settings Menu)
 * 게임 설정 관련 상수 및 기본값 정의
 *
 * Phaser 의존성 없는 순수 TypeScript
 */

/** 설정 기본값 */
export const SETTINGS_DEFAULTS = {
  /** 사운드 활성화 기본값 */
  soundEnabled: true,
} as const;

/** 설정 LocalStorage 키 */
export const SETTINGS_STORAGE_KEY = 'game-settings' as const;
