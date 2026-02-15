/**
 * Combat Constants
 *
 * 전투 시스템 관련 상수 정의
 * Story 4-1: 인접 공격
 * Story 4-3: 방향별 데미지 계산
 */

/**
 * 공격 가능 타일 하이라이트 스타일
 */
export const ATTACKABLE_TILE = {
  /** 하이라이트 색상 (빨간색/오렌지 계열 - red-500) */
  COLOR: '#EF4444',
  /** 16진수 숫자 형식 */
  COLOR_HEX: 0xef4444,
  /** 하이라이트 투명도 */
  ALPHA: 0.5,
  /** 테두리 색상 (red-600) */
  STROKE_COLOR: '#DC2626',
  /** 테두리 색상 16진수 */
  STROKE_COLOR_HEX: 0xdc2626,
  /** 테두리 두께 */
  STROKE_WIDTH: 2,
} as const;

/**
 * 기본 피해량 (레거시 호환용 - 4-3에서 방향별 계산으로 대체)
 * @deprecated calculateDamage() 함수 사용 권장
 */
export const BASE_DAMAGE = 1;

/**
 * 전투 상수
 *
 * Story 4-3: 방향별 데미지 계산
 */
export const COMBAT = {
  /** 전선 방향 고정 피해량 (GDD: "전선(Frontline) ⚔️: 1 (고정)") */
  FRONTLINE_DAMAGE: 1,
  /** 이탈 시 페널티 피해량 (GDD §6.4: "이탈자만 피해 2") */
  DISENGAGE_DAMAGE: 2,
  /** 최소 피해량 (음수 방지) */
  MIN_DAMAGE: 0,
  /** 공격 방향 목록 */
  DIRECTIONS: ['sun', 'moon', 'frontline'] as const,
} as const;
