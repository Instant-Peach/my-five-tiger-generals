/**
 * 접근성 관련 상수 정의
 *
 * Story 8-8: 접근성 및 터치 타겟 (Accessibility & Touch Target)
 * AC1: 터치 타겟 44x44px 보장
 * AC3: 색맹 지원 기반
 * AC6: 접근성 상수 및 유틸리티
 *
 * game-core에 Phaser 의존성 절대 금지 (순수 TypeScript)
 */

export const ACCESSIBILITY = {
  /** 최소 터치 타겟 크기 (px) - WCAG 2.1 AA 기준 */
  MIN_TOUCH_TARGET: 44,
  /** 포커스 아웃라인 두께 (px) */
  FOCUS_OUTLINE_WIDTH: 2,
  /** 포커스 아웃라인 색상 (금색) */
  FOCUS_OUTLINE_COLOR: '#ffd700',
  /** 색맹 지원 패턴 (향후 색맹 모드 토글 구현 시 활용) */
  COLOR_BLIND_PATTERNS: {
    player1: 'diagonal',
    player2: 'dots',
  },
} as const;
