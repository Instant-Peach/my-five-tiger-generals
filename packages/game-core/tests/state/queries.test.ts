/**
 * Queries Tests
 *
 * W0: queries.ts 버그 수정 검증
 *
 * - getGeneralAtTile: engaged 장수도 반환
 * - getGeneralsByPlayer: engaged 장수도 포함
 * - isTileOccupied: engaged 장수도 인식
 * - getGeneralStats: livesRemaining 포함
 */

import { describe, it, expect } from 'vitest';
import {
  getGeneralAtTile,
  getGeneralsByPlayer,
  isTileOccupied,
  getGeneralStats,
} from '../../src/state/queries';
import { GAME } from '../../src/constants/game';
import type { GameState, PerformedAction } from '../../src/state/types';
import type { General, GeneralId, PlayerId, GeneralStats as GeneralStatsType } from '../../src/generals/types';
import type { TileId } from '../../src/board/types';

const DEFAULT_STATS: GeneralStatsType = {
  star: 5,
  sun: 5,
  moon: 5,
  speed: 3,
};

function createTestGeneral(
  id: GeneralId,
  owner: PlayerId,
  position: TileId | null,
  troops: number = 10,
  status: 'active' | 'engaged' | 'out' | 'eliminated' | 'standby' = 'active',
  stats: GeneralStatsType = DEFAULT_STATS,
  livesRemaining: number = GAME.INITIAL_LIVES,
  engagedWith?: GeneralId
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
    livesRemaining,
    engagedWith,
  };
}

function createTestGameState(
  generals: General[],
  currentPlayer: PlayerId = 'player1'
): GameState {
  return {
    phase: 'playing',
    turnPhase: 'select',
    currentPlayer,
    turn: 1,
    generals,
    selectedGeneralId: null,
    actionsRemaining: 3,
    performedActions: [],
    player1KnockCount: 0,
    player2KnockCount: 0,
  };
}

describe('Queries (W0 Bug Fix)', () => {
  // ========================================
  // getGeneralAtTile - engaged 상태 포함
  // ========================================
  describe('getGeneralAtTile', () => {
    it('should return active general at tile', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralAtTile(state, 12);
      expect(result).toBeDefined();
      expect(result!.id).toBe('player1_guanyu');
    });

    it('should return engaged general at tile', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 2, 'player2_guanyu'),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralAtTile(state, 12);
      expect(result).toBeDefined();
      expect(result!.id).toBe('player1_guanyu');
      expect(result!.status).toBe('engaged');
    });

    it('should NOT return out general at tile', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', null, 0, 'out', DEFAULT_STATS, 1),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralAtTile(state, 12);
      expect(result).toBeUndefined();
    });

    it('should NOT return eliminated general', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralAtTile(state, 12);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty tile', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralAtTile(state, 17);
      expect(result).toBeUndefined();
    });
  });

  // ========================================
  // getGeneralsByPlayer - engaged 상태 포함
  // ========================================
  describe('getGeneralsByPlayer', () => {
    it('should include active generals', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12),
        createTestGeneral('player1_zhangfei', 'player1', 13),
        createTestGeneral('player2_guanyu', 'player2', 7),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralsByPlayer(state, 'player1');
      expect(result).toHaveLength(2);
    });

    it('should include engaged generals', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 10, 'active'),
        createTestGeneral('player1_zhangfei', 'player1', 17, 8, 'engaged', DEFAULT_STATS, 2, 'player2_guanyu'),
        createTestGeneral('player2_guanyu', 'player2', 12, 8, 'engaged', DEFAULT_STATS, 2, 'player1_zhangfei'),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralsByPlayer(state, 'player1');
      expect(result).toHaveLength(2);
      expect(result.map(g => g.id)).toContain('player1_zhangfei');
    });

    it('should NOT include out generals', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 10, 'active'),
        createTestGeneral('player1_zhangfei', 'player1', null, 0, 'out', DEFAULT_STATS, 1),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralsByPlayer(state, 'player1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('player1_guanyu');
    });

    it('should NOT include eliminated generals', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 10, 'active'),
        createTestGeneral('player1_zhangfei', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
      ];
      const state = createTestGameState(generals);

      const result = getGeneralsByPlayer(state, 'player1');
      expect(result).toHaveLength(1);
    });
  });

  // ========================================
  // isTileOccupied - engaged 상태 포함
  // ========================================
  describe('isTileOccupied', () => {
    it('should return true for tile with active general', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12),
      ];
      const state = createTestGameState(generals);

      expect(isTileOccupied(state, 12)).toBe(true);
    });

    it('should return true for tile with engaged general', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 2, 'player2_guanyu'),
      ];
      const state = createTestGameState(generals);

      expect(isTileOccupied(state, 12)).toBe(true);
    });

    it('should return false for empty tile', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12),
      ];
      const state = createTestGameState(generals);

      expect(isTileOccupied(state, 17)).toBe(false);
    });
  });

  // ========================================
  // getGeneralStats - livesRemaining 포함
  // ========================================
  describe('getGeneralStats', () => {
    it('should include livesRemaining in stats', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 10, 'active', DEFAULT_STATS, 2),
      ];
      const state = createTestGameState(generals);

      const stats = getGeneralStats(state, 'player1_guanyu');
      expect(stats).not.toBeNull();
      expect(stats!.livesRemaining).toBe(2);
    });

    it('should reflect reduced livesRemaining', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', null, 0, 'out', DEFAULT_STATS, 1),
      ];
      const state = createTestGameState(generals);

      const stats = getGeneralStats(state, 'player1_guanyu');
      expect(stats).not.toBeNull();
      expect(stats!.livesRemaining).toBe(1);
      expect(stats!.status).toBe('out');
    });

    it('should show livesRemaining 0 for eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
      ];
      const state = createTestGameState(generals);

      const stats = getGeneralStats(state, 'player1_guanyu');
      expect(stats).not.toBeNull();
      expect(stats!.livesRemaining).toBe(0);
      expect(stats!.status).toBe('eliminated');
    });
  });
});
