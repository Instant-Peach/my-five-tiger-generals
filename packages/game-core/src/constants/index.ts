/**
 * Constants 모듈 공개 API
 */

export { BOARD, TILE_ID_RANGE, isValidTileId, isSideTile } from './board';
export {
  ZONE_COLORS,
  ZONE_STROKE_WIDTH,
  getZoneColor,
  type ZoneState,
  type ZoneColorPalette,
} from './colors';
export {
  PLAYER_COLORS,
  getPlayerColor,
  hexToNumber,
  type PlayerColor,
} from './player';
export {
  TROOP_COLORS,
  getTroopColor,
  type TroopColorSet,
} from './troops';
export { MOVABLE_TILE } from './movement';
export { ATTACKABLE_TILE, BASE_DAMAGE, COMBAT } from './combat';
export { GAME } from './game';
export { SETTINGS_DEFAULTS, SETTINGS_STORAGE_KEY } from './settings';
export { RESULT_STATS_LABELS } from './result';
export { BREAKPOINTS, RESPONSIVE } from './responsive';
export { ACCESSIBILITY } from './accessibility';
