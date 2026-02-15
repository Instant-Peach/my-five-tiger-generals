/**
 * Attack + Collapse Victory Integration Tests
 *
 * Story 6-4: 와해 승리 (Collapse Victory)
 *
 * executeAttack() 후 와해 승리 판정 통합 테스트
 */

import { describe, it, expect } from 'vitest';
import { executeAttack } from '../../src/combat/attack';
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

describe('Attack + Collapse Victory Integration (Story 6-4)', () => {
  describe('executeAttack() collapse victory detection', () => {
    it('should trigger collapse victory when last enemy general is knocked out', () => {
      // Given: player2의 마지막 장수 1명만 남아있고 병력 1 (frontline 공격 = 1 피해)
      // livesRemaining: 1 (이미 1차 OUT 복귀 후) -> KO 시 eliminated
      // Tile 12 -> Tile 17 = frontline (fixed 1 damage)
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 17, 1, 'active', DEFAULT_STATS, 1), // 마지막 장수, 병력 1, 목숨 1
      ];
      const state = createTestGameState(generals);

      // When: 공격 실행
      const result = executeAttack(state, 'player1_guanyu', 'player2_guanyu');

      // Then: 와해 승리
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.isKnockOut).toBe(true);
        expect(result.data.victoryResult).toEqual({
          winner: 'player1',
          reason: 'collapse',
        });
        expect(result.data.state.phase).toBe('ended');
        expect(result.data.state.victoryResult).toEqual({
          winner: 'player1',
          reason: 'collapse',
        });
      }
    });

    it('should trigger collapse victory when last of multiple enemy generals is knocked out', () => {
      // Given: player2의 다른 장수들은 이미 eliminated, 마지막 1명만 active (livesRemaining: 1)
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhangfei', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_zhaoyun', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_huangzhong', 'player2', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player2_machao', 'player2', 17, 1, 'active', DEFAULT_STATS, 1), // 마지막 장수, 목숨 1
      ];
      const state = createTestGameState(generals);

      // When: 마지막 장수 공격 (frontline = 1 damage)
      const result = executeAttack(state, 'player1_guanyu', 'player2_machao');

      // Then: 와해 승리
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.isKnockOut).toBe(true);
        expect(result.data.victoryResult).toEqual({
          winner: 'player1',
          reason: 'collapse',
        });
        expect(result.data.state.phase).toBe('ended');
      }
    });

    it('should NOT trigger collapse victory when knocked out general is not the last one', () => {
      // Given: player2에 장수 2명 남아있음
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 17, 1, 'active'), // 이 장수가 OUT 되지만
        createTestGeneral('player2_zhangfei', 'player2', 7, 4, 'active'), // 이 장수는 아직 active
      ];
      const state = createTestGameState(generals);

      // When: 공격 실행 (frontline = 1 damage, player2_guanyu OUT)
      const result = executeAttack(state, 'player1_guanyu', 'player2_guanyu');

      // Then: 승리 아님
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.isKnockOut).toBe(true);
        expect(result.data.victoryResult).toBeNull();
        expect(result.data.state.phase).toBe('playing');
        expect(result.data.state.victoryResult).toBeUndefined();
      }
    });

    it('should return victoryResult null when defender survives', () => {
      // Given: 방어자가 살아남는 공격
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 17, 5, 'active'), // 병력 5, frontline 1 damage -> 4
      ];
      const state = createTestGameState(generals);

      // When: 공격 실행
      const result = executeAttack(state, 'player1_guanyu', 'player2_guanyu');

      // Then: victoryResult = null
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.isKnockOut).toBe(false);
        expect(result.data.victoryResult).toBeNull();
        expect(result.data.state.phase).toBe('playing');
      }
    });

    it('should include victoryResult in ExecuteAttackData', () => {
      // victoryResult 필드가 항상 ExecuteAttackData에 포함되는지 확인
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 17, 5, 'active'),
      ];
      const state = createTestGameState(generals);

      const result = executeAttack(state, 'player1_guanyu', 'player2_guanyu');

      expect(result.success).toBe(true);
      if (result.success) {
        // victoryResult 필드가 존재하는지 확인
        expect('victoryResult' in result.data).toBe(true);
        expect(result.data.victoryResult).toBeNull();
      }
    });

    it('should trigger player2 collapse victory when all player1 generals are knocked out', () => {
      // Given: player2의 턴, player1의 마지막 장수 1명 (livesRemaining: 1)
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 17, 1, 'active', DEFAULT_STATS, 1), // 마지막 장수, 병력 1, 목숨 1
        createTestGeneral('player2_guanyu', 'player2', 12, 5, 'active'),
      ];
      const state = createTestGameState(generals, 'player2');

      // When: player2가 player1의 마지막 장수 공격 (frontline = 1 damage)
      const result = executeAttack(state, 'player2_guanyu', 'player1_guanyu');

      // Then: player2 와해 승리
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.isKnockOut).toBe(true);
        expect(result.data.victoryResult).toEqual({
          winner: 'player2',
          reason: 'collapse',
        });
        expect(result.data.state.phase).toBe('ended');
      }
    });

    it('should preserve immutability (not mutate original state)', () => {
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active'),
        createTestGeneral('player2_guanyu', 'player2', 17, 1, 'active'),
      ];
      const state = createTestGameState(generals);
      const originalPhase = state.phase;

      executeAttack(state, 'player1_guanyu', 'player2_guanyu');

      // 원본 상태가 변경되지 않아야 함
      expect(state.phase).toBe(originalPhase);
      expect(state.phase).toBe('playing');
    });
  });
});
