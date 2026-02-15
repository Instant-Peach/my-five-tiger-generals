/**
 * Animation Constants
 *
 * 게임 애니메이션 관련 상수 정의
 */

/** 장수 이동 애니메이션 설정 */
export const MOVEMENT_ANIMATION = {
  /** 애니메이션 지속 시간 (ms) */
  DURATION: 250,
  /** 이징 함수 */
  EASE: 'Power2',
  /** 최소 지속 시간 (너무 짧으면 버벅임) */
  MIN_DURATION: 100,
  /** 최대 지속 시간 (너무 길면 답답함) */
  MAX_DURATION: 400,
} as const;
