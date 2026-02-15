/**
 * 보드 상수 정의
 */

/** 보드 관련 상수 */
export const BOARD = {
  /** 총 타일 수 */
  TILE_COUNT: 34,
  /** 메인 타일 수 (6행 × 5열) */
  MAIN_TILES: 30,
  /** 측면 타일 수 */
  SIDE_TILES: 4,
  /** 보드 행 수 */
  ROWS: 6,
  /** 보드 열 수 */
  COLS: 5,
  /** 측면 타일 ID (30-33) */
  SIDE_TILE_IDS: [30, 31, 32, 33] as const,
} as const;

/** 타일 ID 범위 */
export const TILE_ID_RANGE = {
  MIN: 0,
  MAX: 33,
} as const;

/**
 * 타일 ID 유효성 검증
 */
export function isValidTileId(tileId: number): boolean {
  return (
    Number.isInteger(tileId) &&
    tileId >= TILE_ID_RANGE.MIN &&
    tileId <= TILE_ID_RANGE.MAX
  );
}

/**
 * 측면 타일인지 확인
 */
export function isSideTile(tileId: number): boolean {
  return BOARD.SIDE_TILE_IDS.includes(tileId as 30 | 31 | 32 | 33);
}
