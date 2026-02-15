/**
 * 반응형 관련 상수 정의
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * AC1: 3단계 브레이크포인트 체계
 *
 * game-core에 Phaser 의존성 절대 금지 (순수 TypeScript)
 */

/**
 * 반응형 브레이크포인트 상수
 *
 * - MOBILE: 모바일 최대 너비 (모바일: <= 430px)
 * - TABLET: 태블릿 최대 너비 (태블릿: 431px ~ 1023px)
 * - DESKTOP: 데스크톱 최소 너비 (데스크톱: >= 1024px)
 */
export const BREAKPOINTS = {
  MOBILE: 430,
  TABLET: 1023,
  DESKTOP: 1024,
} as const;

/**
 * 반응형 동작 관련 상수
 *
 * - DEBOUNCE_MS: 리사이즈 디바운스 (밀리초)
 * - MIN_FONT_SIZE: 최소 폰트 크기 (px)
 * - SAFE_AREA_FALLBACK: safe-area 미지원 시 폴백 (px)
 */
export const RESPONSIVE = {
  DEBOUNCE_MS: 150,
  MIN_FONT_SIZE: 14,
  SAFE_AREA_FALLBACK: 0,
} as const;
