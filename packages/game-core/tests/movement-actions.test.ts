/**
 * Movement Actions Tests (Story 3-2)
 *
 * 장수 이동 액션 로직 테스트
 */

import { describe, it, expect } from 'vitest';
import { moveGeneral, canPerformAction, updateGeneralPosition } from '../src/movement/actions';
import type { GameState, PerformedAction } from '../src/state/types';
import type { General, GeneralId, PlayerId } from '../src/generals/types';
import type { TileId } from '../src/board/types';

/**
 * 테스트용 장수 생성 헬퍼
 */
function createTestGeneral(
  id: GeneralId,
  owner: PlayerId,
  position: TileId | null,
  speed: number,
  status: 'active' | 'out' | 'standby' = 'active'
): General {
  return {
    id,
    baseId: id.replace(`${owner}_`, ''),
    name: id,
    nameKo: id,
    owner,
    stats: {
      star: 5,
      sun: 5,
      moon: 5,
      speed,
    },
    troops: 5,
    position,
    status,
    livesRemaining: 2,
  };
}

/**
 * 테스트용 GameState 생성 헬퍼
 */
function createTestGameState(
  generals: General[],
  currentPlayer: PlayerId = 'player1',
  actionsRemaining: number = 3,
  performedActions: PerformedAction[] = []
): GameState {
  return {
    phase: 'playing',
    turnPhase: 'select',
    currentPlayer,
    turn: 1,
    generals,
    selectedGeneralId: null,
    actionsRemaining,
    performedActions,
    player1KnockCount: 0,
    player2KnockCount: 0,
  };
}

describe('Movement Actions (Story 3-2)', () => {
  describe('moveGeneral()', () => {
    describe('successful movement', () => {
      it('should move general to valid adjacent tile', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals);

        // Tile 12(▲)의 edge-adjacent: 11, 13, 17
        const result = moveGeneral(state, 'player1_guanyu', 11);

        expect(result.success).toBe(true);
        if (result.success) {
          const movedGeneral = result.data.generals.find(g => g.id === 'player1_guanyu');
          expect(movedGeneral?.position).toBe(11);
        }
      });

      it('should decrease actionsRemaining by 1', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals, 'player1', 3);

        const result = moveGeneral(state, 'player1_guanyu', 11);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.actionsRemaining).toBe(2);
        }
      });

      it('should add move action to performedActions', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals);

        const result = moveGeneral(state, 'player1_guanyu', 11);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.performedActions).toHaveLength(1);
          expect(result.data.performedActions[0]).toEqual({
            generalId: 'player1_guanyu',
            actionType: 'move',
          });
        }
      });

      it('should preserve immutability of original state', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals);
        const originalPosition = state.generals[0].position;
        const originalActionsRemaining = state.actionsRemaining;

        moveGeneral(state, 'player1_guanyu', 11);

        // 원본 상태 불변 확인
        expect(state.generals[0].position).toBe(originalPosition);
        expect(state.actionsRemaining).toBe(originalActionsRemaining);
      });

      it('should allow movement within speed range (distance 2)', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals);

        // Tile 6 is 2 steps away: 12 -> 11 -> 6
        const result = moveGeneral(state, 'player1_guanyu', 6);

        expect(result.success).toBe(true);
        if (result.success) {
          const movedGeneral = result.data.generals.find(g => g.id === 'player1_guanyu');
          expect(movedGeneral?.position).toBe(6);
        }
      });
    });

    describe('validation: general not found', () => {
      it('should fail when general does not exist', () => {
        const state = createTestGameState([]);

        const result = moveGeneral(state, 'nonexistent_general', 11);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('GENERAL_NOT_FOUND');
        }
      });
    });

    describe('validation: turn ownership', () => {
      it('should fail when moving opponent general', () => {
        const generals = [
          createTestGeneral('player2_caocao', 'player2', 12, 2, 'active'),
        ];
        // currentPlayer is player1
        const state = createTestGameState(generals, 'player1');

        const result = moveGeneral(state, 'player2_caocao', 11);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('NOT_YOUR_TURN');
        }
      });

      it('should succeed when moving own general', () => {
        const generals = [
          createTestGeneral('player2_caocao', 'player2', 12, 2, 'active'),
        ];
        // currentPlayer is player2
        const state = createTestGameState(generals, 'player2');

        const result = moveGeneral(state, 'player2_caocao', 11);

        expect(result.success).toBe(true);
      });
    });

    describe('validation: actions remaining', () => {
      it('should fail when no actions remaining', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals, 'player1', 0); // 행동력 0

        const result = moveGeneral(state, 'player1_guanyu', 11);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('NO_ACTIONS_REMAINING');
        }
      });

      it('should succeed with 1 action remaining', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals, 'player1', 1);

        const result = moveGeneral(state, 'player1_guanyu', 11);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.actionsRemaining).toBe(0);
        }
      });
    });

    describe('validation: same general same action restriction', () => {
      it('should fail when same general already moved this turn', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const performedActions: PerformedAction[] = [
          { generalId: 'player1_guanyu', actionType: 'move' },
        ];
        const state = createTestGameState(generals, 'player1', 2, performedActions);

        const result = moveGeneral(state, 'player1_guanyu', 11);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('SAME_ACTION_SAME_GENERAL');
        }
      });

      it('should succeed when different general moves', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
          createTestGeneral('player1_zhangfei', 'player1', 25, 2, 'active'),
        ];
        const performedActions: PerformedAction[] = [
          { generalId: 'player1_guanyu', actionType: 'move' },
        ];
        const state = createTestGameState(generals, 'player1', 2, performedActions);

        const result = moveGeneral(state, 'player1_zhangfei', 20);

        expect(result.success).toBe(true);
      });

      it('should succeed when same general performs different action type', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const performedActions: PerformedAction[] = [
          { generalId: 'player1_guanyu', actionType: 'attack' }, // attack, not move
        ];
        const state = createTestGameState(generals, 'player1', 2, performedActions);

        const result = moveGeneral(state, 'player1_guanyu', 11);

        expect(result.success).toBe(true);
      });
    });

    describe('validation: invalid move target', () => {
      it('should fail when target is not in movable tiles', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 1, 'active'),
        ];
        const state = createTestGameState(generals);

        // Tile 0 is too far from tile 12 with speed 1
        const result = moveGeneral(state, 'player1_guanyu', 0);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('INVALID_MOVE');
        }
      });

      it('should fail when target tile is occupied', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 1, 'active'),
          createTestGeneral('player1_zhangfei', 'player1', 11, 2, 'active'),
        ];
        const state = createTestGameState(generals);

        // Tile 11 is occupied by zhangfei
        const result = moveGeneral(state, 'player1_guanyu', 11);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('INVALID_MOVE');
        }
      });

      it('should fail when moving to current position', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals);

        // Cannot move to same tile
        const result = moveGeneral(state, 'player1_guanyu', 12);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('INVALID_MOVE');
        }
      });
    });

    describe('integration scenarios', () => {
      it('should handle consecutive moves by different generals', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
          createTestGeneral('player1_zhangfei', 'player1', 25, 2, 'active'),
        ];
        let state = createTestGameState(generals);

        // First move: guanyu
        const result1 = moveGeneral(state, 'player1_guanyu', 11);
        expect(result1.success).toBe(true);
        if (result1.success) {
          state = result1.data;
          expect(state.actionsRemaining).toBe(2);
          expect(state.performedActions).toHaveLength(1);
        }

        // Second move: zhangfei
        const result2 = moveGeneral(state, 'player1_zhangfei', 20);
        expect(result2.success).toBe(true);
        if (result2.success) {
          state = result2.data;
          expect(state.actionsRemaining).toBe(1);
          expect(state.performedActions).toHaveLength(2);
        }
      });

      it('should block path through occupied tiles', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
          createTestGeneral('player2_enemy', 'player2', 11, 2, 'active'),
        ];
        const state = createTestGameState(generals);

        // Tile 6 requires going through tile 11 which is blocked
        const result = moveGeneral(state, 'player1_guanyu', 6);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('INVALID_MOVE');
        }
      });
    });
  });

  describe('canPerformAction()', () => {
    it('should return true when action is available', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
      ];
      const state = createTestGameState(generals);

      const result = canPerformAction(state, 'player1_guanyu', 'move');

      expect(result).toBe(true);
    });

    it('should return false when no actions remaining', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
      ];
      const state = createTestGameState(generals, 'player1', 0);

      const result = canPerformAction(state, 'player1_guanyu', 'move');

      expect(result).toBe(false);
    });

    it('should return false when same action already performed by same general', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'move' },
      ];
      const state = createTestGameState(generals, 'player1', 2, performedActions);

      const result = canPerformAction(state, 'player1_guanyu', 'move');

      expect(result).toBe(false);
    });

    it('should return true for different action type', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'move' },
      ];
      const state = createTestGameState(generals, 'player1', 2, performedActions);

      const result = canPerformAction(state, 'player1_guanyu', 'attack');

      expect(result).toBe(true);
    });

    it('should return true for different general', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        createTestGeneral('player1_zhangfei', 'player1', 25, 2, 'active'),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'move' },
      ];
      const state = createTestGameState(generals, 'player1', 2, performedActions);

      const result = canPerformAction(state, 'player1_zhangfei', 'move');

      expect(result).toBe(true);
    });
  });

  describe('updateGeneralPosition()', () => {
    it('should update general position correctly', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
      ];
      const state = createTestGameState(generals);

      const newState = updateGeneralPosition(state, 'player1_guanyu', 11);

      const general = newState.generals.find(g => g.id === 'player1_guanyu');
      expect(general?.position).toBe(11);
    });

    it('should preserve immutability', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
      ];
      const state = createTestGameState(generals);

      updateGeneralPosition(state, 'player1_guanyu', 11);

      // Original state should be unchanged
      expect(state.generals[0].position).toBe(12);
    });

    it('should only update the specified general', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 2, 'active'),
        createTestGeneral('player1_zhangfei', 'player1', 25, 2, 'active'),
      ];
      const state = createTestGameState(generals);

      const newState = updateGeneralPosition(state, 'player1_guanyu', 11);

      const zhangfei = newState.generals.find(g => g.id === 'player1_zhangfei');
      expect(zhangfei?.position).toBe(25); // Unchanged
    });
  });
});
