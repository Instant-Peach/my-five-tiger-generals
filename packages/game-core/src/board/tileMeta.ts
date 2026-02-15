/**
 * 34타일 메타데이터 정의
 *
 * 보드 레이아웃:
 * - 6행 × 5열 = 30개 메인 타일 (ID: 0-29)
 * - 4개 측면 타일 (ID: 30-33)
 *
 * 타일 ID 배치:
 *   row 0: [ 0,  1,  2,  3,  4]
 *   row 1: [ 5,  6,  7,  8,  9]
 *   row 2: [10, 11, 12, 13, 14]
 *   row 3: [15, 16, 17, 18, 19]
 *   row 4: [20, 21, 22, 23, 24]
 *   row 5: [25, 26, 27, 28, 29]
 *
 * 측면 타일:
 *   30: 좌측 상단 (row 1-2 사이)
 *   31: 좌측 하단 (row 3-4 사이)
 *   32: 우측 상단 (row 1-2 사이)
 *   33: 우측 하단 (row 3-4 사이)
 */

import type { TileMeta, TileOrientation, TileZone } from './types';
import { BOARD } from '../constants/board';

/**
 * 타일 방향 결정
 * - 짝수 ID = Up (▲)
 * - 홀수 ID = Down (▽)
 */
function getMainTileDirection(id: number): TileOrientation {
  return id % 2 === 0 ? 'up' : 'down';
}

/**
 * 타일 영역 결정 (서버/데이터 관점 - 고정)
 * - row 0: player2_home (상단, Player 2 시작 배치, Player 1 노크 목표)
 * - row 5: player1_home (하단, Player 1 시작 배치, Player 2 노크 목표)
 * - row 1-4: center (중앙)
 * - 측면 타일: side
 */
function getTileZone(row: number, isSide: boolean): TileZone {
  if (isSide) return 'side';
  if (row === 0) return 'player2_home';
  if (row === 5) return 'player1_home';
  return 'center';
}

/**
 * 메인 타일 메타데이터 생성 (0-29)
 */
function createMainTiles(): TileMeta[] {
  const tiles: TileMeta[] = [];

  for (let id = 0; id < BOARD.MAIN_TILES; id++) {
    const row = Math.floor(id / BOARD.COLS);
    const col = id % BOARD.COLS;

    tiles.push({
      id,
      direction: getMainTileDirection(id),
      zone: getTileZone(row, false),
      row,
      col,
      isSideTile: false,
    });
  }

  return tiles;
}

/**
 * 측면 타일 메타데이터 생성 (30-33)
 */
function createSideTiles(): TileMeta[] {
  // 측면 타일은 2개 행에 걸쳐 있음 (높이 = 2H)
  // 레거시: row2_3CenterY = startY + 1.5*H (변수명이 오해의 소지가 있음)
  // 실제로 측면 타일 30, 32는 row 1, 2와 맞닿고
  // 측면 타일 31, 33은 row 3, 4와 맞닿음
  //
  // 측면 타일 vertex: y 범위 [-H, +H] (원점 기준)
  // 따라서 원점 y = row 1.5*H이면 삼각형은 row 0.5H ~ 2.5H 범위
  // 이건 row 1(H~2H), row 2(2H~3H)와 제대로 맞지 않음
  //
  // 원점 y = 2*H이면 삼각형은 H ~ 3H 범위 = row 1, row 2와 정확히 맞음
  return [
    // 30: 좌측 상단 (row 1, 2와 맞닿음, 우측을 바라봄)
    {
      id: 30,
      direction: 'right',
      zone: 'side',
      row: 2, // row 1, 2 사이 중앙
      col: -1,
      isSideTile: true,
    },
    // 31: 좌측 하단 (row 3, 4와 맞닿음, 우측을 바라봄)
    {
      id: 31,
      direction: 'right',
      zone: 'side',
      row: 4, // row 3, 4 사이 중앙
      col: -1,
      isSideTile: true,
    },
    // 32: 우측 상단 (row 1, 2와 맞닿음, 좌측을 바라봄)
    {
      id: 32,
      direction: 'left',
      zone: 'side',
      row: 2,
      col: 5,
      isSideTile: true,
    },
    // 33: 우측 하단 (row 3, 4와 맞닿음, 좌측을 바라봄)
    {
      id: 33,
      direction: 'left',
      zone: 'side',
      row: 4,
      col: 5,
      isSideTile: true,
    },
  ];
}

/**
 * 전체 34타일 메타데이터
 */
export const TILE_META: ReadonlyArray<TileMeta> = [
  ...createMainTiles(),
  ...createSideTiles(),
];

/**
 * 타일 ID로 메타데이터 조회
 * O(1) 인덱스 접근 - 타일 ID가 배열 인덱스와 동일
 */
export function getTileMeta(tileId: number): TileMeta | undefined {
  if (tileId < 0 || tileId >= TILE_META.length) {
    return undefined;
  }
  return TILE_META[tileId];
}

/**
 * 행/열로 타일 ID 조회 (메인 타일만)
 */
export function getTileIdByRowCol(row: number, col: number): number | null {
  if (row < 0 || row >= BOARD.ROWS || col < 0 || col >= BOARD.COLS) {
    return null;
  }
  return row * BOARD.COLS + col;
}
