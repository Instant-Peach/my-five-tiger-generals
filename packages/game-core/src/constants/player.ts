/**
 * Player Constants
 *
 * Defines player colors and related metadata for visual distinction in game
 */

import type { PlayerId } from '../generals/types';

/** 플레이어 색상 정의 */
export interface PlayerColor {
  /** 기본 색상 (hex string) */
  primary: string;
  /** 선택 시 강조 색상 */
  highlight: string;
  /** 비활성 상태 색상 */
  dimmed: string;
  /** 색맹 지원 아이콘 ID */
  icon: string;
}

/**
 * 플레이어별 색상 정의 (GDD Color Palette 기반)
 *
 * 주의: 서버/데이터 관점의 고정 색상
 * - player1 = 파란색 (자신 기준)
 * - player2 = 빨간색 (상대 기준)
 *
 * Phase 2 멀티플레이어에서 클라이언트는 자신/상대 기준으로 색상을 매핑합니다.
 */
export const PLAYER_COLORS: Record<PlayerId, PlayerColor> = {
  player1: {
    primary: '#3B82F6',    // blue-500 (TailwindCSS)
    highlight: '#60A5FA',  // blue-400 (밝게)
    dimmed: '#1E40AF',     // blue-700 (어둡게)
    icon: 'shield',        // 방패 아이콘
  },
  player2: {
    primary: '#EF4444',    // red-500 (TailwindCSS)
    highlight: '#F87171',  // red-400 (밝게)
    dimmed: '#B91C1C',     // red-700 (어둡게)
    icon: 'sword',         // 검 아이콘
  },
} as const;

/**
 * 플레이어 색상 조회 헬퍼 함수
 * @param playerId - 플레이어 ID ('player1' | 'player2')
 * @returns 플레이어 색상 정보
 */
export function getPlayerColor(playerId: PlayerId): PlayerColor {
  return PLAYER_COLORS[playerId];
}

/**
 * 16진수 색상을 Phaser 숫자 형식으로 변환
 * @param hex - 16진수 색상 문자열 ('#3B82F6' 또는 '3B82F6')
 * @returns Phaser 숫자 형식 색상 (0x3B82F6)
 */
export function hexToNumber(hex: string): number {
  // Remove '#' if present
  const cleanHex = hex.replace('#', '');
  return parseInt(cleanHex, 16);
}
