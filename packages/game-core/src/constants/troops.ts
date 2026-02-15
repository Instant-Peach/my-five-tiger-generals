/**
 * Troop Color Constants
 *
 * 병력 상태별 색상 정의
 * TailwindCSS 색상 팔레트 기반
 */

import type { TroopStatus } from '../generals/troops';

/** 병력 상태별 색상 세트 */
export interface TroopColorSet {
  /** 기본 색상 (hex string) */
  primary: string;
  /** 텍스트 색상 */
  text: string;
  /** 접근성 아이콘 (색맹 지원) */
  icon: string;
}

/**
 * 병력 상태별 색상
 *
 * - full: 초록색 - 만병력 상태 (최적)
 * - warning: 노란색 - 중간 병력 (50% 이상)
 * - danger: 빨간색 - 저병력 (50% 미만)
 * - out: 회색 - OUT 상태 (병력 0)
 */
export const TROOP_COLORS: Record<TroopStatus, TroopColorSet> = {
  full: {
    primary: '#22C55E', // green-500
    text: '#FFFFFF',
    icon: '✓',
  },
  warning: {
    primary: '#F59E0B', // amber-500
    text: '#000000',
    icon: '⚠',
  },
  danger: {
    primary: '#EF4444', // red-500
    text: '#FFFFFF',
    icon: '!',
  },
  out: {
    primary: '#6B7280', // gray-500
    text: '#FFFFFF',
    icon: '✕',
  },
} as const;

/**
 * 병력 상태에 따른 색상 조회
 *
 * @param status - 병력 상태
 * @returns TroopColorSet
 */
export function getTroopColor(status: TroopStatus): TroopColorSet {
  return TROOP_COLORS[status];
}
