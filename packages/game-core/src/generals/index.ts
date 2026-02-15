/**
 * 장수 시스템 Public API
 */

// Types
export type {
  General,
  GeneralBaseData,
  GeneralBaseId,
  GeneralId,
  GeneralStats,
  GeneralStatus,
  PlayerId,
} from './types';

export type { TroopStatus } from './troops';

// Constants
export {
  GENERAL_BASE_DATA,
  GENERAL_ORDER,
  GENERALS_PER_PLAYER,
  PLAYER_START_TILES,
  TOTAL_GENERALS,
} from './constants';

export { TROOP_THRESHOLDS, TROOP_MULTIPLIER } from './troops';

// Functions
export { createGeneral, createInitialGenerals } from './generals';
export { getMaxTroops, getTroopStatus, getTroopRatio } from './troops';
