/**
 * Collapse Victory Tests
 *
 * Story 6-4: 와해 승리 (Collapse Victory)
 *
 * 와해 승리 판정 함수 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import { checkCollapseVictory } from '../../src/victory/collapse';
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
  status: 'active' | 'out' | 'eliminated' | 'standby' = 'active',
  stats: GeneralStats = DEFAULT_STATS,
  livesRemaining: number = 2
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

describe('Collapse Victory System (Story 6-4)', () => {
  // ========================================
  // checkCollapseVictory() 테스트
  // ========================================
  describe('checkCollapseVictory()', () => {
    it('should return player1 victory when all player2 generals are eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player1_zhangfei', 'player1', 13, 4, 'active'),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhangfei', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhaoyun', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_huangzhong', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_machao', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toEqual({ winner: 'player1', reason: 'collapse' });
    });

    it('should return player2 victory when all player1 generals are eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player1_zhangfei', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player1_zhaoyun', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player1_huangzhong', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player1_machao', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_guanyu', 'player2', 12, 5, 'active'),
        createTestGeneral('player2_zhangfei', 'player2', 13, 4, 'active'),
      ];
      const state = createTestGameState(generals, 'player2');

      const result = checkCollapseVictory(state);
      expect(result).toEqual({ winner: 'player2', reason: 'collapse' });
    });

    it('should return null when some player2 generals are still active', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhangfei', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhaoyun', 'player2', 7, 3, 'active'), // 1명 active
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toBeNull();
    });

    it('should return null when only one player2 general is active', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhangfei', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhaoyun', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_huangzhong', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_machao', 'player2', 3, 1, 'active'), // 1명만 active
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toBeNull();
    });

    it('should return null when both sides have active generals', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player1_zhangfei', 'player1', 13, 4, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 7, 5, 'active'),
        createTestGeneral('player2_zhangfei', 'player2', 8, 4, 'active'),
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toBeNull();
    });

    it('should return null when player2 has no generals (defensive case)', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toBeNull();
    });

    it('should return null when player1 has no generals (defensive case)', () => {
      const generals = [
        createTestGeneral('player2_guanyu', 'player2', 7, 5, 'active'),
      ];
      const state = createTestGameState(generals, 'player2');

      const result = checkCollapseVictory(state);
      expect(result).toBeNull();
    });

    it('should return player1 victory first when both sides are all eliminated (defensive test)', () => {
      // 이론적으로 불가능하지만 방어적 테스트 - player1(player2 전멸)이 먼저 체크
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      // player2 전멸을 먼저 체크하므로 player1 승리
      expect(result).toEqual({ winner: 'player1', reason: 'collapse' });
    });

    it('should work with single general per player - all eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toEqual({ winner: 'player1', reason: 'collapse' });
    });

    it('should return null when generals are empty', () => {
      const state = createTestGameState([]);
      const result = checkCollapseVictory(state);
      expect(result).toBeNull();
    });
  });
});
