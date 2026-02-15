/**
 * Surrender Tests
 *
 * Story 6-5: 항복 (Surrender)
 *
 * executeSurrender() 함수 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import { executeSurrender } from '../../src/victory/surrender';
import type { GameState, PerformedAction } from '../../src/state/types';
import type { General, GeneralId, PlayerId, GeneralStats } from '../../src/generals/types';
import type { TileId } from '../../src/board/types';

/**
 * 기본 테스트용 스탯
 */
const DEFAULT_STATS: GeneralStats = {
  star: 5,
  sun: 5,
  moon: 5,
  speed: 3,
};

/**
 * 테스트용 장수 생성 헬퍼
 */
function createTestGeneral(
  id: GeneralId,
  owner: PlayerId,
  position: TileId | null,
  troops: number = 5,
  status: 'active' | 'out' | 'standby' = 'active',
  stats: GeneralStats = DEFAULT_STATS
): General {
  return {
    id,
    baseId: id.replace(`${owner}_`, ''),
    name: id,
    nameKo: id,
    owner,
    stats,
    troops,
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
  phase: 'setup' | 'playing' | 'ended' = 'playing',
  currentPlayer: PlayerId = 'player1',
  actionsRemaining: number = 3,
  performedActions: PerformedAction[] = []
): GameState {
  return {
    phase,
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

describe('Surrender System (Story 6-5)', () => {
  // 기본 장수 목록
  const defaultGenerals = [
    createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
    createTestGeneral('player1_zhangfei', 'player1', 13, 4, 'active'),
    createTestGeneral('player2_guanyu', 'player2', 7, 5, 'active'),
    createTestGeneral('player2_zhangfei', 'player2', 8, 4, 'active'),
  ];

  // ========================================
  // AC1: executeSurrender() 테스트
  // ========================================
  describe('executeSurrender()', () => {
    it('should result in player2 victory when player1 surrenders', () => {
      const state = createTestGameState(defaultGenerals);

      const result = executeSurrender(state, 'player1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.victoryResult).toEqual({
          winner: 'player2',
          reason: 'surrender',
        });
        expect(result.data.state.phase).toBe('ended');
        expect(result.data.state.victoryResult).toEqual({
          winner: 'player2',
          reason: 'surrender',
        });
      }
    });

    it('should result in player1 victory when player2 surrenders', () => {
      const state = createTestGameState(defaultGenerals, 'playing', 'player2');

      const result = executeSurrender(state, 'player2');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.victoryResult).toEqual({
          winner: 'player1',
          reason: 'surrender',
        });
        expect(result.data.state.phase).toBe('ended');
        expect(result.data.state.victoryResult).toEqual({
          winner: 'player1',
          reason: 'surrender',
        });
      }
    });

    it('should return error when game is already ended (phase === "ended")', () => {
      const state = createTestGameState(defaultGenerals, 'ended');

      const result = executeSurrender(state, 'player1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_NOT_IN_PROGRESS');
        expect(result.error.message).toContain('이미 종료된');
      }
    });

    it('should return error when game has not started (phase === "setup")', () => {
      const state = createTestGameState(defaultGenerals, 'setup');

      const result = executeSurrender(state, 'player1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_NOT_IN_PROGRESS');
        expect(result.error.message).toContain('시작되지 않은');
      }
    });

    it('should return error for invalid playerId', () => {
      const state = createTestGameState(defaultGenerals);

      const result = executeSurrender(state, 'player3' as PlayerId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PLAYER');
        expect(result.error.message).toContain('유효하지 않은');
      }
    });

    it('should not mutate the original state (immutability)', () => {
      const state = createTestGameState(defaultGenerals);
      const originalPhase = state.phase;

      executeSurrender(state, 'player1');

      // 원본 상태가 변경되지 않았는지 확인
      expect(state.phase).toBe(originalPhase);
      expect(state.phase).toBe('playing');
      expect(state.victoryResult).toBeUndefined();
    });

    it('should preserve other game state fields when surrendering', () => {
      const state = createTestGameState(defaultGenerals, 'playing', 'player1', 2);
      state.turn = 5;
      state.player1KnockCount = 2;
      state.player2KnockCount = 1;

      const result = executeSurrender(state, 'player1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.turn).toBe(5);
        expect(result.data.state.player1KnockCount).toBe(2);
        expect(result.data.state.player2KnockCount).toBe(1);
        expect(result.data.state.actionsRemaining).toBe(2);
        expect(result.data.state.generals).toEqual(defaultGenerals);
      }
    });
  });
});
