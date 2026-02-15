/**
 * Knock System Tests
 *
 * Story 6-1: 노크 행동 (Knock Action)
 * Story 6-2: 3회 노크 승리 (Triple Knock Victory)
 *
 * 노크 가능 조건 판정, 노크 실행, 카운트 관리, 승리 판정, 퇴각 처리 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  canKnock,
  validateKnock,
  executeKnock,
  getKnockTargetZone,
  isInKnockZone,
  checkKnockVictory,
} from '../../src/victory/knock';
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
    victoryResult: undefined,
  };
}

describe('Knock System (Story 6-1)', () => {
  // ========================================
  // 헬퍼 함수 테스트
  // ========================================
  describe('getKnockTargetZone()', () => {
    it('should return player2_home for player1', () => {
      expect(getKnockTargetZone('player1')).toBe('player2_home');
    });

    it('should return player1_home for player2', () => {
      expect(getKnockTargetZone('player2')).toBe('player1_home');
    });
  });

  describe('isInKnockZone()', () => {
    it('should return true for player1 general on row 0 (player2_home)', () => {
      // 타일 0-4는 row 0 = player2_home
      expect(isInKnockZone(0, 'player1')).toBe(true);
      expect(isInKnockZone(1, 'player1')).toBe(true);
      expect(isInKnockZone(2, 'player1')).toBe(true);
      expect(isInKnockZone(3, 'player1')).toBe(true);
      expect(isInKnockZone(4, 'player1')).toBe(true);
    });

    it('should return true for player2 general on row 5 (player1_home)', () => {
      // 타일 25-29는 row 5 = player1_home
      expect(isInKnockZone(25, 'player2')).toBe(true);
      expect(isInKnockZone(26, 'player2')).toBe(true);
      expect(isInKnockZone(27, 'player2')).toBe(true);
      expect(isInKnockZone(28, 'player2')).toBe(true);
      expect(isInKnockZone(29, 'player2')).toBe(true);
    });

    it('should return false for player1 general on center tiles', () => {
      // 타일 10-14는 row 2 = center
      expect(isInKnockZone(10, 'player1')).toBe(false);
      expect(isInKnockZone(12, 'player1')).toBe(false);
    });

    it('should return false for player1 general on own home (row 5)', () => {
      // player1은 자기 home(row 5)에서 노크 불가
      expect(isInKnockZone(25, 'player1')).toBe(false);
      expect(isInKnockZone(29, 'player1')).toBe(false);
    });

    it('should return false for player2 general on own home (row 0)', () => {
      // player2는 자기 home(row 0)에서 노크 불가
      expect(isInKnockZone(0, 'player2')).toBe(false);
      expect(isInKnockZone(4, 'player2')).toBe(false);
    });

    it('should return false for side tiles (30-33)', () => {
      // 측면 타일에서는 노크 불가
      expect(isInKnockZone(30, 'player1')).toBe(false);
      expect(isInKnockZone(31, 'player1')).toBe(false);
      expect(isInKnockZone(32, 'player1')).toBe(false);
      expect(isInKnockZone(33, 'player1')).toBe(false);
      expect(isInKnockZone(30, 'player2')).toBe(false);
      expect(isInKnockZone(31, 'player2')).toBe(false);
      expect(isInKnockZone(32, 'player2')).toBe(false);
      expect(isInKnockZone(33, 'player2')).toBe(false);
    });

    it('should return false for invalid tile ID', () => {
      expect(isInKnockZone(-1, 'player1')).toBe(false);
      expect(isInKnockZone(34, 'player1')).toBe(false);
      expect(isInKnockZone(100, 'player1')).toBe(false);
    });
  });

  // ========================================
  // canKnock() 테스트
  // ========================================
  describe('canKnock()', () => {
    it('should return true when player1 general is on player2_home (row 0)', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1');
      expect(canKnock(state, 'player1_guanyu')).toBe(true);
    });

    it('should return true when player2 general is on player1_home (row 5)', () => {
      const generals = [
        createTestGeneral('player2_guanyu', 'player2', 25),
      ];
      const state = createTestGameState(generals, 'player2');
      expect(canKnock(state, 'player2_guanyu')).toBe(true);
    });

    it('should return false when general is on own home', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 25),
      ];
      const state = createTestGameState(generals, 'player1');
      expect(canKnock(state, 'player1_guanyu')).toBe(false);
    });

    it('should return false when general is on center tile', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12),
      ];
      const state = createTestGameState(generals, 'player1');
      expect(canKnock(state, 'player1_guanyu')).toBe(false);
    });

    it('should return false when general is on side tile', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 30),
      ];
      const state = createTestGameState(generals, 'player1');
      expect(canKnock(state, 'player1_guanyu')).toBe(false);
    });

    it('should return false when no actions remaining', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1', 0);
      expect(canKnock(state, 'player1_guanyu')).toBe(false);
    });

    it('should return false when same general already knocked this turn', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'knock' },
      ];
      const state = createTestGameState(generals, 'player1', 3, performedActions);
      expect(canKnock(state, 'player1_guanyu')).toBe(false);
    });

    it('should return true when same general performed different action', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'move' },
      ];
      const state = createTestGameState(generals, 'player1', 2, performedActions);
      expect(canKnock(state, 'player1_guanyu')).toBe(true);
    });

    it('should return false when general is opponent\'s', () => {
      const generals = [
        createTestGeneral('player2_guanyu', 'player2', 25),
      ];
      const state = createTestGameState(generals, 'player1');
      expect(canKnock(state, 'player2_guanyu')).toBe(false);
    });

    it('should return false when general is OUT', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0, 0, 'out'),
      ];
      const state = createTestGameState(generals, 'player1');
      expect(canKnock(state, 'player1_guanyu')).toBe(false);
    });

    it('should return false when general does not exist', () => {
      const state = createTestGameState([], 'player1');
      expect(canKnock(state, 'nonexistent')).toBe(false);
    });

    it('should return false when general has null position', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', null),
      ];
      const state = createTestGameState(generals, 'player1');
      expect(canKnock(state, 'player1_guanyu')).toBe(false);
    });

    it('should return true for different general even if one already knocked', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
        createTestGeneral('player1_zhangfei', 'player1', 1),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'knock' },
      ];
      const state = createTestGameState(generals, 'player1', 2, performedActions);
      expect(canKnock(state, 'player1_zhangfei')).toBe(true);
    });
  });

  // ========================================
  // validateKnock() 테스트
  // ========================================
  describe('validateKnock()', () => {
    it('should return success for valid knock', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1');
      const result = validateKnock(state, 'player1_guanyu');
      expect(result.success).toBe(true);
    });

    it('should return GENERAL_NOT_FOUND when general does not exist', () => {
      const state = createTestGameState([], 'player1');
      const result = validateKnock(state, 'nonexistent');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GENERAL_NOT_FOUND');
      }
    });

    it('should return GENERAL_NOT_ACTIVE when general is out', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0, 0, 'out'),
      ];
      const state = createTestGameState(generals, 'player1');
      const result = validateKnock(state, 'player1_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GENERAL_NOT_ACTIVE');
      }
    });

    it('should return NOT_YOUR_TURN when not current player', () => {
      const generals = [
        createTestGeneral('player2_guanyu', 'player2', 25),
      ];
      const state = createTestGameState(generals, 'player1');
      const result = validateKnock(state, 'player2_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_YOUR_TURN');
      }
    });

    it('should return NO_ACTIONS_REMAINING when no actions left', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1', 0);
      const result = validateKnock(state, 'player1_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIONS_REMAINING');
      }
    });

    it('should return SAME_ACTION_SAME_GENERAL when already knocked', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_guanyu', actionType: 'knock' },
      ];
      const state = createTestGameState(generals, 'player1', 3, performedActions);
      const result = validateKnock(state, 'player1_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('SAME_ACTION_SAME_GENERAL');
      }
    });

    it('should return NOT_IN_KNOCK_ZONE when not in opponent home', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12),
      ];
      const state = createTestGameState(generals, 'player1');
      const result = validateKnock(state, 'player1_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_IN_KNOCK_ZONE');
      }
    });
  });

  // ========================================
  // executeKnock() 테스트
  // ========================================
  describe('executeKnock()', () => {
    it('should increase player1 knockCount on successful knock', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
        createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active'), // Story 6-4: 와해 승리 방지용 추가 장수
      ];
      const state = createTestGameState(generals, 'player1');
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.player1KnockCount).toBe(1);
        expect(result.data.knockCount).toBe(1);
        expect(result.data.playerId).toBe('player1');
        expect(result.data.victoryResult).toBeNull();
      }
    });

    it('should increase player2 knockCount on successful knock', () => {
      const generals = [
        createTestGeneral('player2_guanyu', 'player2', 25),
        createTestGeneral('player2_zhangfei', 'player2', 7, 5, 'active'), // Story 6-4: 와해 승리 방지용 추가 장수
      ];
      const state = createTestGameState(generals, 'player2');
      const result = executeKnock(state, 'player2_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.player2KnockCount).toBe(1);
        expect(result.data.knockCount).toBe(1);
        expect(result.data.playerId).toBe('player2');
        expect(result.data.victoryResult).toBeNull();
      }
    });

    it('should consume one action', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1', 3);
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.actionsRemaining).toBe(2); // 3 - 1 = 2
      }
    });

    it('should record knock in performedActions', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1');
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.performedActions).toContainEqual({
          generalId: 'player1_guanyu',
          actionType: 'knock',
        });
      }
    });

    it('should increment knockCount from existing value', () => {
      const generals = [
        createTestGeneral('player1_zhangfei', 'player1', 1),
      ];
      // 이미 knockCount가 1인 상태에서 시작
      const state = createTestGameState(generals, 'player1', 3, [], 1, 0);
      const result = executeKnock(state, 'player1_zhangfei');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.player1KnockCount).toBe(2);
        expect(result.data.knockCount).toBe(2);
      }
    });

    it('should return error when validation fails', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12), // center tile, not knock zone
      ];
      const state = createTestGameState(generals, 'player1');
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_IN_KNOCK_ZONE');
      }
    });

    it('should NOT allow same general to knock twice in same turn (retreated after first knock)', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1');

      // 첫 번째 노크
      const result1 = executeKnock(state, 'player1_guanyu');
      expect(result1.success).toBe(true);

      if (result1.success) {
        // 두 번째 노크 시도 (동일 장수) - 퇴각 상태이므로 GENERAL_NOT_ACTIVE
        const result2 = executeKnock(result1.data.state, 'player1_guanyu');
        expect(result2.success).toBe(false);
        if (!result2.success) {
          expect(result2.error.code).toBe('GENERAL_NOT_ACTIVE');
        }
      }
    });

    it('should allow different generals to knock in same turn', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
        createTestGeneral('player1_zhangfei', 'player1', 1),
      ];
      const state = createTestGameState(generals, 'player1');

      // 첫 번째 장수 노크
      const result1 = executeKnock(state, 'player1_guanyu');
      expect(result1.success).toBe(true);

      if (result1.success) {
        // 두 번째 장수 노크
        const result2 = executeKnock(result1.data.state, 'player1_zhangfei');
        expect(result2.success).toBe(true);

        if (result2.success) {
          expect(result2.data.state.player1KnockCount).toBe(2);
          expect(result2.data.state.actionsRemaining).toBe(1); // 3 - 2 = 1
          expect(result2.data.state.performedActions).toHaveLength(2);
        }
      }
    });

    // 퇴각 처리 테스트
    it('should set general to OUT status after knock', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1');
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        const knockedGeneral = result.data.state.generals.find(g => g.id === 'player1_guanyu');
        expect(knockedGeneral?.status).toBe('out');
        expect(knockedGeneral?.position).toBeNull();
        expect(knockedGeneral?.troops).toBe(0);
      }
    });

    it('should retreat general after knock (position null, troops 0)', () => {
      const generals = [
        createTestGeneral('player2_guanyu', 'player2', 25, 8),
      ];
      const state = createTestGameState(generals, 'player2');
      const result = executeKnock(state, 'player2_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        const knockedGeneral = result.data.state.generals.find(g => g.id === 'player2_guanyu');
        expect(knockedGeneral?.status).toBe('out');
        expect(knockedGeneral?.position).toBeNull();
        expect(knockedGeneral?.troops).toBe(0);
      }
    });

    it('should not affect other generals when one retreats after knock', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0, 5),
        createTestGeneral('player1_zhangfei', 'player1', 1, 7),
      ];
      const state = createTestGameState(generals, 'player1');
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        // 노크한 장수는 퇴각
        const knockedGeneral = result.data.state.generals.find(g => g.id === 'player1_guanyu');
        expect(knockedGeneral?.status).toBe('out');
        expect(knockedGeneral?.position).toBeNull();

        // 다른 장수는 영향 없음
        const otherGeneral = result.data.state.generals.find(g => g.id === 'player1_zhangfei');
        expect(otherGeneral?.status).toBe('active');
        expect(otherGeneral?.position).toBe(1);
        expect(otherGeneral?.troops).toBe(7);
      }
    });

    it('should preserve immutability (not mutate original state)', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1');
      const originalKnockCount = state.player1KnockCount;
      const originalActions = state.actionsRemaining;
      const originalPerformed = state.performedActions.length;

      executeKnock(state, 'player1_guanyu');

      // 원본 상태가 변경되지 않아야 함
      expect(state.player1KnockCount).toBe(originalKnockCount);
      expect(state.actionsRemaining).toBe(originalActions);
      expect(state.performedActions).toHaveLength(originalPerformed);
    });

    it('should not change opponent knockCount', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      const state = createTestGameState(generals, 'player1', 3, [], 0, 2);
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        // player1 카운트만 증가, player2 카운트는 유지
        expect(result.data.state.player1KnockCount).toBe(1);
        expect(result.data.state.player2KnockCount).toBe(2);
      }
    });

    // Story 6-2: 승리 판정 통합 테스트
    it('should trigger victory when knockCount reaches 3 (Story 6-2)', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      // 이미 knockCount가 2인 상태
      const state = createTestGameState(generals, 'player1', 3, [], 2, 0);
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.player1KnockCount).toBe(3);
        expect(result.data.knockCount).toBe(3);
        expect(result.data.state.phase).toBe('ended');
        expect(result.data.state.victoryResult).toEqual({
          winner: 'player1',
          reason: 'knock',
        });
        expect(result.data.victoryResult).toEqual({
          winner: 'player1',
          reason: 'knock',
        });
      }
    });

    it('should NOT trigger victory when knockCount is 1 (Story 6-2)', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
        createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active'), // Story 6-4: 와해 승리 방지용 추가 장수
      ];
      const state = createTestGameState(generals, 'player1', 3, [], 0, 0);
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.player1KnockCount).toBe(1);
        expect(result.data.state.phase).toBe('playing');
        expect(result.data.state.victoryResult).toBeUndefined();
        expect(result.data.victoryResult).toBeNull();
      }
    });

    it('should trigger victory for player2 when knockCount reaches 3', () => {
      const generals = [
        createTestGeneral('player2_guanyu', 'player2', 25),
      ];
      const state = createTestGameState(generals, 'player2', 3, [], 0, 2);
      const result = executeKnock(state, 'player2_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.player2KnockCount).toBe(3);
        expect(result.data.state.phase).toBe('ended');
        expect(result.data.victoryResult).toEqual({
          winner: 'player2',
          reason: 'knock',
        });
      }
    });
  });
});

// ========================================
// Story 6-2: 노크 승리 및 누적 카운트 테스트
// ========================================
describe('Knock Victory System (Story 6-2)', () => {
  // ========================================
  // checkKnockVictory() 테스트
  // ========================================
  describe('checkKnockVictory()', () => {
    it('should return VictoryResult for player1 when knockCount is 3', () => {
      const state = createTestGameState([], 'player1', 3, [], 3, 0);
      const result = checkKnockVictory(state);
      expect(result).toEqual({ winner: 'player1', reason: 'knock' });
    });

    it('should return VictoryResult for player2 when knockCount is 3', () => {
      const state = createTestGameState([], 'player1', 3, [], 0, 3);
      const result = checkKnockVictory(state);
      expect(result).toEqual({ winner: 'player2', reason: 'knock' });
    });

    it('should return null when knockCount is 2', () => {
      const state = createTestGameState([], 'player1', 3, [], 2, 0);
      const result = checkKnockVictory(state);
      expect(result).toBeNull();
    });

    it('should return null when both knockCounts are 0', () => {
      const state = createTestGameState([], 'player1', 3, [], 0, 0);
      const result = checkKnockVictory(state);
      expect(result).toBeNull();
    });

    it('should return player1 VictoryResult when both have 3 (defensive test)', () => {
      // 이론적으로 불가능하지만 방어적 테스트 - player1이 먼저 체크
      const state = createTestGameState([], 'player1', 3, [], 3, 3);
      const result = checkKnockVictory(state);
      expect(result).toEqual({ winner: 'player1', reason: 'knock' });
    });

    it('should return VictoryResult when knockCount exceeds 3', () => {
      const state = createTestGameState([], 'player1', 3, [], 4, 0);
      const result = checkKnockVictory(state);
      expect(result).toEqual({ winner: 'player1', reason: 'knock' });
    });
  });

  // ========================================
  // 누적 카운트 테스트 (리셋 없음)
  // ========================================
  describe('Cumulative knock count (no reset)', () => {
    it('should accumulate knock count across multiple turns/generals', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      // 이미 knockCount가 1인 상태에서 추가 노크
      const state = createTestGameState(generals, 'player1', 3, [], 1, 0);
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.player1KnockCount).toBe(2);
        expect(result.data.knockCount).toBe(2);
      }
    });

    it('should win with 3 cumulative knocks from different generals', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 0),
      ];
      // 이미 2회 노크 누적 (다른 장수들이 이전에 노크)
      const state = createTestGameState(generals, 'player1', 3, [], 2, 0);
      const result = executeKnock(state, 'player1_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.player1KnockCount).toBe(3);
        expect(result.data.victoryResult).toEqual({ winner: 'player1', reason: 'knock' });
        expect(result.data.state.phase).toBe('ended');
      }
    });
  });
});
