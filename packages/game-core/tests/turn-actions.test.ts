/**
 * Turn Actions Tests (Story 3-2)
 *
 * 턴 관련 액션 로직 테스트
 */

import { describe, it, expect } from 'vitest';
import { resetActionsForNewTurn, endTurn } from '../src/turn/actions';
import { GAME } from '../src/constants/game';
import type { GameState, PerformedAction } from '../src/state/types';
import type { General, PlayerId } from '../src/generals/types';
import type { TileId } from '../src/board/types';

/**
 * 테스트용 장수 생성 헬퍼
 */
function createTestGeneral(
  id: string,
  owner: PlayerId,
  position: TileId | null
): General {
  return {
    id,
    baseId: id.replace(`${owner}_`, ''),
    name: id,
    nameKo: id,
    owner,
    stats: { star: 5, sun: 5, moon: 5, speed: 2 },
    troops: 5,
    position,
    status: 'active',
    livesRemaining: 2,
  };
}

/**
 * 테스트용 GameState 생성 헬퍼
 */
function createTestGameState(
  currentPlayer: PlayerId = 'player1',
  turn: number = 1,
  actionsRemaining: number = 1,
  performedActions: PerformedAction[] = []
): GameState {
  return {
    phase: 'playing',
    turnPhase: 'select',
    currentPlayer,
    turn,
    generals: [
      createTestGeneral('player1_guanyu', 'player1', 25),
      createTestGeneral('player2_caocao', 'player2', 0),
    ],
    selectedGeneralId: 'player1_guanyu',
    actionsRemaining,
    performedActions,
    player1KnockCount: 0,
    player2KnockCount: 0,
  };
}

describe('Turn Actions (Story 3-2)', () => {
  describe('resetActionsForNewTurn()', () => {
    it('should reset actionsRemaining to ACTIONS_PER_TURN', () => {
      const state = createTestGameState('player1', 1, 0);

      const newState = resetActionsForNewTurn(state);

      expect(newState.actionsRemaining).toBe(GAME.ACTIONS_PER_TURN);
      expect(newState.actionsRemaining).toBe(3);
    });

    it('should clear performedActions array', () => {
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'move' },
        { generalId: 'player1_zhangfei', actionType: 'attack' },
      ];
      const state = createTestGameState('player1', 1, 1, performedActions);

      const newState = resetActionsForNewTurn(state);

      expect(newState.performedActions).toEqual([]);
    });

    it('should preserve other state properties', () => {
      const state = createTestGameState('player1', 5, 0, [
        { generalId: 'player1_guanyu', actionType: 'move' },
      ]);

      const newState = resetActionsForNewTurn(state);

      expect(newState.currentPlayer).toBe('player1');
      expect(newState.turn).toBe(5);
      expect(newState.generals).toBe(state.generals); // Same reference
    });

    it('should preserve immutability', () => {
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'move' },
      ];
      const state = createTestGameState('player1', 1, 1, performedActions);
      const originalActionsRemaining = state.actionsRemaining;
      const originalPerformedActions = state.performedActions;

      resetActionsForNewTurn(state);

      expect(state.actionsRemaining).toBe(originalActionsRemaining);
      expect(state.performedActions).toBe(originalPerformedActions);
    });
  });

  describe('endTurn()', () => {
    it('should switch current player from player1 to player2', () => {
      const state = createTestGameState('player1');

      const newState = endTurn(state);

      expect(newState.currentPlayer).toBe('player2');
    });

    it('should switch current player from player2 to player1', () => {
      const state = createTestGameState('player2');

      const newState = endTurn(state);

      expect(newState.currentPlayer).toBe('player1');
    });

    it('should increment turn number when changing from player2 to player1', () => {
      const state = createTestGameState('player2', 1);

      const newState = endTurn(state);

      expect(newState.turn).toBe(2);
    });

    it('should NOT increment turn number when changing from player1 to player2', () => {
      const state = createTestGameState('player1', 1);

      const newState = endTurn(state);

      expect(newState.turn).toBe(1);
    });

    it('should reset actionsRemaining to ACTIONS_PER_TURN', () => {
      const state = createTestGameState('player1', 1, 0);

      const newState = endTurn(state);

      expect(newState.actionsRemaining).toBe(GAME.ACTIONS_PER_TURN);
    });

    it('should clear performedActions', () => {
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'move' },
      ];
      const state = createTestGameState('player1', 1, 2, performedActions);

      const newState = endTurn(state);

      expect(newState.performedActions).toEqual([]);
    });

    it('should reset turnPhase to select', () => {
      const state = createTestGameState('player1');
      state.turnPhase = 'action';

      const newState = endTurn(state);

      expect(newState.turnPhase).toBe('select');
    });

    it('should clear selectedGeneralId', () => {
      const state = createTestGameState('player1');
      state.selectedGeneralId = 'player1_guanyu';

      const newState = endTurn(state);

      expect(newState.selectedGeneralId).toBeNull();
    });

    it('should preserve immutability', () => {
      const state = createTestGameState('player1', 1, 2);
      const originalCurrentPlayer = state.currentPlayer;
      const originalTurn = state.turn;

      endTurn(state);

      expect(state.currentPlayer).toBe(originalCurrentPlayer);
      expect(state.turn).toBe(originalTurn);
    });
  });

  describe('GAME constants', () => {
    it('should have ACTIONS_PER_TURN set to 3', () => {
      expect(GAME.ACTIONS_PER_TURN).toBe(3);
    });

    it('should have all required game constants', () => {
      expect(GAME.MAX_GENERALS).toBe(5);
      expect(GAME.TURN_TIME_LIMIT).toBe(60);
      expect(GAME.KNOCK_COUNT_TO_WIN).toBe(3);
    });
  });
});
