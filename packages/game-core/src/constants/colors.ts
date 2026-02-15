/**
 * Zone Colors 상수
 *
 * 각 구역(zone)별 색상 팔레트를 정의합니다.
 * 상태(base, hover, selected, highlight)에 따라 다른 색상을 적용합니다.
 *
 * 색상 설계 원칙:
 * - player1_home: 파란색 계열 (차가운 색)
 * - player2_home: 빨간색 계열 (따뜻한 색)
 * - center: 녹색 계열 (중립적)
 * - side: 황색/금색 계열 (특수 구역)
 *
 * 색맹 접근성:
 * - Red-Green 색맹을 고려하여 파랑/빨강은 밝기 차이도 적용
 * - 모든 구역은 색조(hue)와 밝기(brightness)로 이중 구분
 */

import type { TileZone } from '../board/types';

/** 구역 상태 타입 */
export type ZoneState = 'base' | 'hover' | 'selected' | 'highlight';

/** 구역별 색상 팔레트 타입 */
export type ZoneColorPalette = Record<ZoneState, number>;

/**
 * 구역별 색상 팔레트
 *
 * 각 구역에 대해 상태별 색상을 정의합니다.
 * 상태 우선순위: selected > hovered > highlighted > base
 */
export const ZONE_COLORS: Record<TileZone, ZoneColorPalette> = {
  player1_home: {
    base: 0x2a4a7a, // 진한 파란색
    hover: 0x3a5a9a, // 밝은 파란색
    selected: 0x4a6aaa, // 더 밝은 파란색
    highlight: 0x3a5a8a, // 중간 밝은 파란색
  },
  player2_home: {
    base: 0x7a2a2a, // 진한 빨간색
    hover: 0x9a3a3a, // 밝은 빨간색
    selected: 0xaa4a4a, // 더 밝은 빨간색
    highlight: 0x8a3a3a, // 중간 밝은 빨간색
  },
  center: {
    base: 0x2a5a2a, // 진한 녹색
    hover: 0x3a6a3a, // 밝은 녹색
    selected: 0x4a7a4a, // 더 밝은 녹색
    highlight: 0x3a6a3a, // 중간 밝은 녹색
  },
  side: {
    base: 0x6a5a2a, // 진한 황색
    hover: 0x8a7a3a, // 밝은 황색
    selected: 0x9a8a4a, // 더 밝은 황색
    highlight: 0x7a6a3a, // 중간 밝은 황색
  },
} as const;

/**
 * 구역과 상태에 따른 색상 반환
 *
 * @param zone 타일 구역
 * @param state 상태 (기본값: 'base')
 * @returns hex 색상 값
 */
export function getZoneColor(zone: TileZone, state: ZoneState = 'base'): number {
  return ZONE_COLORS[zone][state];
}

/**
 * 구역별 테두리 두께
 *
 * 색맹 접근성을 위한 추가 시각적 구분 요소
 */
export const ZONE_STROKE_WIDTH: Record<TileZone, number> = {
  player1_home: 3, // 두꺼운 테두리
  player2_home: 3, // 두꺼운 테두리
  center: 2, // 기본 테두리
  side: 4, // 가장 두꺼운 테두리 (특수 구역 강조)
} as const;
