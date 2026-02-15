/**
 * Movement Constants
 *
 * 이동 시스템 관련 상수 정의
 * Story 3-1: 이동 가능 타일 표시
 */

/**
 * 이동 가능 타일 하이라이트 스타일
 */
export const MOVABLE_TILE = {
  /** 하이라이트 색상 (청록색 계열 - emerald-500) */
  COLOR: '#10B981',
  /** 16진수 숫자 형식 */
  COLOR_HEX: 0x10b981,
  /** 하이라이트 투명도 */
  ALPHA: 0.4,
  /** 테두리 색상 (emerald-600) */
  STROKE_COLOR: '#059669',
  /** 테두리 색상 16진수 */
  STROKE_COLOR_HEX: 0x059669,
  /** 테두리 두께 */
  STROKE_WIDTH: 2,
} as const;
