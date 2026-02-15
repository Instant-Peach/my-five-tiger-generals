/**
 * 장수 시스템 상수
 *
 * 5명의 기본 장수 데이터와 배치 규칙을 정의합니다.
 * GDD의 Unit Types and Classes 섹션 기반.
 */

import type { TileId } from '../board/types';
import type { GeneralBaseData, GeneralBaseId, PlayerId } from './types';

/**
 * 5명 기본 장수 데이터 (GDD 기준)
 *
 * | 장수 | 별 | Sun | Moon | 발 |
 * |------|-----|-----|------|-----|
 * | 관우 | 5 | 4 | 4 | 2 |
 * | 장비 | 4 | 5 | 3 | 2 |
 * | 조운 | 4 | 3 | 4 | 3 |
 * | 황충 | 3 | 5 | 2 | 2 |
 * | 마초 | 5 | 4 | 3 | 3 |
 */
export const GENERAL_BASE_DATA: Record<GeneralBaseId, GeneralBaseData> = {
  guanyu: {
    baseId: 'guanyu',
    name: 'Guan Yu',
    nameKo: '관우',
    stats: {
      star: 5,
      sun: 4,
      moon: 4,
      speed: 2,
    },
  },
  zhangfei: {
    baseId: 'zhangfei',
    name: 'Zhang Fei',
    nameKo: '장비',
    stats: {
      star: 4,
      sun: 5,
      moon: 3,
      speed: 2,
    },
  },
  zhaoyun: {
    baseId: 'zhaoyun',
    name: 'Zhao Yun',
    nameKo: '조운',
    stats: {
      star: 4,
      sun: 3,
      moon: 4,
      speed: 3,
    },
  },
  huangzhong: {
    baseId: 'huangzhong',
    name: 'Huang Zhong',
    nameKo: '황충',
    stats: {
      star: 3,
      sun: 5,
      moon: 2,
      speed: 2,
    },
  },
  machao: {
    baseId: 'machao',
    name: 'Ma Chao',
    nameKo: '마초',
    stats: {
      star: 5,
      sun: 4,
      moon: 3,
      speed: 3,
    },
  },
} as const;

/**
 * 장수 배열 순서 (배치 순서)
 * 왼쪽에서 오른쪽으로 배치됨
 */
export const GENERAL_ORDER: readonly GeneralBaseId[] = [
  'guanyu',
  'zhangfei',
  'zhaoyun',
  'huangzhong',
  'machao',
] as const;

/**
 * 플레이어별 시작 타일
 *
 * - player1: row 5 (타일 25-29) - player1_home 구역
 * - player2: row 0 (타일 0-4) - player2_home 구역
 */
export const PLAYER_START_TILES: Record<PlayerId, readonly TileId[]> = {
  player1: [25, 26, 27, 28, 29], // row 5 - player1_home
  player2: [0, 1, 2, 3, 4], // row 0 - player2_home
} as const;

/** 플레이어당 장수 수 */
export const GENERALS_PER_PLAYER = 5;

/** 전체 장수 수 (양측 합계) */
export const TOTAL_GENERALS = GENERALS_PER_PLAYER * 2;
