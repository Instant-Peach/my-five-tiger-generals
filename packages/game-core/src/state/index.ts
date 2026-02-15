/**
 * 게임 상태 시스템 Public API
 */

// Types
export type {
  GamePhase,
  GameState,
  GameStats,
  TurnPhase,
  GameError,
  GameErrorCode,
  Result,
  GameEventPayloads,
  ActionType,
  PerformedAction,
  VictoryReason,
  VictoryResult,
} from './types';

// Query Functions
export {
  getGeneralAtTile,
  getGeneralById,
  getGeneralsByPlayer,
  isTileOccupied,
  getSelectedGeneral,
  isGeneralSelected,
} from './queries';

// Action Functions
export { selectGeneral, deselectGeneral } from './actions';

// Initial State
export { createInitialGameState, createKnockTestState } from './initialState';

// Stats
export { extractGameStats } from './stats';
