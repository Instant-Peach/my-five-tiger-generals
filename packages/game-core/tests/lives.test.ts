/**
 * Lives System Tests
 *
 * W1: 목숨 시스템 (livesRemaining)
 *
 * - 초기 목숨 2개
 * - 1차 OUT: livesRemaining 1, status='out' (복귀 가능)
 * - 2차 OUT: livesRemaining 0, status='eliminated' (완전 퇴장)
 * - 와해 승리는 eliminated만 카운트
 */

import { describe, it, expect } from 'vitest';
import { executeAttack } from '../src/combat/attack';
import { executeKnock } from '../src/victory/knock';
import { moveGeneral } from '../src/movement/actions';
import { createGeneral } from '../src/generals/generals';
import { GAME } from '../src/constants/game';
import { COMBAT } from '../src/constants';
import { checkCollapseVictory } from '../src/victory/collapse';
import type { GameState, PerformedAction } from '../src/state/types';
import type { General, GeneralId, PlayerId, GeneralStats } from '../src/generals/types';
import type { TileId } from '../src/board/types';

const DEFAULT_STATS: GeneralStats = {
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
  stats: GeneralStats = DEFAULT_STATS,
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
  currentPlayer: PlayerId = 'player1',
  actionsRemaining: number = 3,
  performedActions: PerformedAction[] = [],
  player1KnockCount: number = 0,
  player2KnockCount: number = 0
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
    player1KnockCount,
    player2KnockCount,
  };
}

describe('Lives System (W1)', () => {
  // ========================================
  // 초기값 테스트
  // ========================================
  describe('Initial Lives', () => {
    it('GAME.INITIAL_LIVES should be 2', () => {
      expect(GAME.INITIAL_LIVES).toBe(2);
    });

    it('createGeneral should set livesRemaining to INITIAL_LIVES', () => {
      const general = createGeneral('guanyu', 'player1', 12);
      expect(general.livesRemaining).toBe(GAME.INITIAL_LIVES);
      expect(general.livesRemaining).toBe(2);
    });
  });

  // ========================================
  // 1차 OUT (livesRemaining 2 → 1, status='out')
  // ========================================
  describe('First KO (livesRemaining 2 → 1)', () => {
    it('attack KO should reduce livesRemaining to 1 and set status to out', () => {
      // Tile 12 → Tile 17 = frontline (1 damage)
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 17, 1, 'active', DEFAULT_STATS, 2),
      ];
      const state = createTestGameState(generals);

      const result = executeAttack(state, 'player1_guanyu', 'player2_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.isKnockOut).toBe(true);
        const defender = result.data.state.generals.find(g => g.id === 'player2_guanyu')!;
        expect(defender.status).toBe('out');
        expect(defender.livesRemaining).toBe(1);
        expect(defender.position).toBeNull();
        expect(defender.troops).toBe(0);
      }
    });

    it('knock should reduce livesRemaining to 1 and set status to out', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 1, 5, 'active', DEFAULT_STATS, 2),
        createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 7, 5, 'active'),
      ];
      const state = createTestGameState(generals, 'player1');

      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        const knocker = result.data.state.generals.find(g => g.id === 'player1_guanyu')!;
        expect(knocker.status).toBe('out');
        expect(knocker.livesRemaining).toBe(1);
        expect(knocker.position).toBeNull();
        expect(knocker.troops).toBe(0);
      }
    });

    it('disengage KO should reduce livesRemaining to 1 and set status to out', () => {
      // Tile 12 → Tile 17 = engaged, 이탈 시 DISENGAGE_DAMAGE 적용
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 1, 'engaged', DEFAULT_STATS, 2, 'player2_guanyu'),
        createTestGeneral('player2_guanyu', 'player2', 17, 5, 'engaged', DEFAULT_STATS, 2, 'player1_guanyu'),
      ];
      const state = createTestGameState(generals);

      // 이탈 시 병력 1 - DISENGAGE_DAMAGE = 0 이하 → OUT
      const result = moveGeneral(state, 'player1_guanyu', 11);

      expect(result.success).toBe(true);
      if (result.success) {
        const general = result.data.generals.find(g => g.id === 'player1_guanyu')!;
        expect(general.status).toBe('out');
        expect(general.livesRemaining).toBe(1);
        expect(general.troops).toBe(0);
        expect(general.position).toBeNull();
      }
    });
  });

  // ========================================
  // 2차 OUT (livesRemaining 1 → 0, status='eliminated')
  // ========================================
  describe('Second KO (livesRemaining 1 → 0 = eliminated)', () => {
    it('attack KO on general with livesRemaining=1 should set status to eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 17, 1, 'active', DEFAULT_STATS, 1),
      ];
      const state = createTestGameState(generals);

      const result = executeAttack(state, 'player1_guanyu', 'player2_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.isKnockOut).toBe(true);
        const defender = result.data.state.generals.find(g => g.id === 'player2_guanyu')!;
        expect(defender.status).toBe('eliminated');
        expect(defender.livesRemaining).toBe(0);
        expect(defender.position).toBeNull();
        expect(defender.troops).toBe(0);
      }
    });

    it('knock with livesRemaining=1 should set status to eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 1, 5, 'active', DEFAULT_STATS, 1),
        createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 7, 5, 'active'),
      ];
      const state = createTestGameState(generals, 'player1');

      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        const knocker = result.data.state.generals.find(g => g.id === 'player1_guanyu')!;
        expect(knocker.status).toBe('eliminated');
        expect(knocker.livesRemaining).toBe(0);
      }
    });

    it('disengage KO with livesRemaining=1 should set status to eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 1, 'engaged', DEFAULT_STATS, 1, 'player2_guanyu'),
        createTestGeneral('player2_guanyu', 'player2', 17, 5, 'engaged', DEFAULT_STATS, 2, 'player1_guanyu'),
      ];
      const state = createTestGameState(generals);

      const result = moveGeneral(state, 'player1_guanyu', 11);

      expect(result.success).toBe(true);
      if (result.success) {
        const general = result.data.generals.find(g => g.id === 'player1_guanyu')!;
        expect(general.status).toBe('eliminated');
        expect(general.livesRemaining).toBe(0);
      }
    });
  });

  // ========================================
  // 와해 승리 (eliminated만 카운트)
  // ========================================
  describe('Collapse Victory with Lives System', () => {
    it('should NOT trigger collapse when all enemies are out (not eliminated)', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'out', DEFAULT_STATS, 1),
        createTestGeneral('player2_zhangfei', 'player2', null, 0, 'out', DEFAULT_STATS, 1),
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toBeNull();
    });

    it('should trigger collapse when all enemies are eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhangfei', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toEqual({ winner: 'player1', reason: 'collapse' });
    });

    it('should NOT trigger collapse with mix of out and eliminated', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhangfei', 'player2', null, 0, 'out', DEFAULT_STATS, 1),
      ];
      const state = createTestGameState(generals);

      const result = checkCollapseVictory(state);
      expect(result).toBeNull();
    });
  });

  // ========================================
  // eliminated 상태의 장수는 공격 불가
  // ========================================
  describe('Eliminated generals cannot participate in combat', () => {
    it('eliminated general cannot attack', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_guanyu', 'player2', 17, 5, 'active'),
      ];
      const state = createTestGameState(generals);

      const result = executeAttack(state, 'player1_guanyu', 'player2_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ATTACKER_IS_OUT');
      }
    });

    it('eliminated general cannot be attacked', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 17, 0, 'eliminated', DEFAULT_STATS, 0),
      ];
      const state = createTestGameState(generals);

      const result = executeAttack(state, 'player1_guanyu', 'player2_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('DEFENDER_IS_OUT');
      }
    });
  });
});
