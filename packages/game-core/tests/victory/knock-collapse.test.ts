/**
 * Knock + Collapse Victory Integration Tests
 *
 * Story 6-4: 와해 승리 (Collapse Victory)
 *
 * executeKnock() 후 와해 승리 판정 통합 테스트
 *
 * 시나리오:
 * - 노크로 마지막 장수 OUT (노크 카운트 3 미만) -> 와해 승리 판정
 * - 노크 3회 달성 + 동시 와해 -> 노크 승리 우선
 */

import { describe, it, expect } from 'vitest';
import { executeKnock } from '../../src/victory/knock';
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

describe('Knock + Collapse Victory Integration (Story 6-4)', () => {
  describe('executeKnock() collapse victory detection', () => {
    it('should trigger collapse victory when knock causes last enemy general to be eliminated (knock count < 3)', () => {
      // Given: player1의 유일한 장수가 player2_home(타일 1)에 있고 livesRemaining: 1
      // player1이 노크를 수행하면 퇴각 처리로 livesRemaining 0 -> eliminated
      // 노크 카운트는 1 (3 미만)이므로 노크 승리가 아닌 와해 승리
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 1, 5, 'active', DEFAULT_STATS, 1), // 목숨 1, 노크 후 eliminated
        createTestGeneral('player2_guanyu', 'player2', 12, 5, 'active'),
        createTestGeneral('player2_zhangfei', 'player2', 13, 4, 'active'),
      ];
      const state = createTestGameState(generals, 'player1', 3, [], 0, 0);

      // When: player1_guanyu가 노크 실행 (player2_home 구역에서)
      const result = executeKnock(state, 'player1_guanyu');

      // Then: 노크 성공, 노크 장수 eliminated (퇴각 처리, 목숨 0)
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.knockCount).toBe(1); // 노크 카운트 1 (3 미만 -> 노크 승리 아님)

        // player1의 유일한 장수가 퇴각으로 eliminated -> player1 전원 eliminated -> player2 와해 승리
        expect(result.data.victoryResult).toEqual({
          winner: 'player2',
          reason: 'collapse',
        });
        expect(result.data.state.phase).toBe('ended');
      }
    });

    it('should prioritize knock victory over collapse victory when both conditions are met', () => {
      // Given: player1의 노크 카운트가 2 (다음 노크로 3 달성)
      // 동시에 노크 장수가 player1의 마지막 장수 (노크 후 OUT -> player1 전원 OUT)
      // -> 노크 승리(3회)와 와해 승리(player2)가 동시 성립
      // -> 노크 승리가 우선
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 1, 5, 'active'), // player2_home에서 노크
        createTestGeneral('player2_guanyu', 'player2', 12, 5, 'active'),
      ];
      const state = createTestGameState(generals, 'player1', 3, [], 2, 0); // player1KnockCount = 2

      // When: 노크 실행 (3번째 노크)
      const result = executeKnock(state, 'player1_guanyu');

      // Then: 노크 승리 (3회 달성) 우선
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.knockCount).toBe(3);
        expect(result.data.victoryResult).toEqual({
          winner: 'player1',
          reason: 'knock',
        });
        expect(result.data.state.phase).toBe('ended');
      }
    });

    it('should not trigger collapse victory when knocked general is not the last active enemy', () => {
      // Given: player1에 2명의 active 장수가 있음
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', 1, 5, 'active'), // player2_home에서 노크
        createTestGeneral('player1_zhangfei', 'player1', 12, 4, 'active'), // 다른 active 장수
        createTestGeneral('player2_guanyu', 'player2', 7, 5, 'active'),
      ];
      const state = createTestGameState(generals, 'player1', 3, [], 0, 0);

      // When: 노크 실행
      const result = executeKnock(state, 'player1_guanyu');

      // Then: 승리 없음 (노크 카운트 1, player1 아직 active 장수 있음)
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.knockCount).toBe(1);
        expect(result.data.victoryResult).toBeNull();
        expect(result.data.state.phase).toBe('playing');
      }
    });

    it('should trigger collapse victory when multiple enemy generals are already eliminated and knock causes the last to be eliminated', () => {
      // Given: player1의 장수 4명이 이미 eliminated, 마지막 1명(livesRemaining: 1)이 player2_home에서 노크
      const generals = [
        createTestGeneral('player1_guanyu', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player1_zhangfei', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player1_zhaoyun', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player1_huangzhong', 'player1', null, 0, 'eliminated', DEFAULT_STATS, 0),
        createTestGeneral('player1_machao', 'player1', 1, 5, 'active', DEFAULT_STATS, 1), // 마지막 장수, 목숨 1
        createTestGeneral('player2_guanyu', 'player2', 12, 5, 'active'),
      ];
      const state = createTestGameState(generals, 'player1', 3, [], 0, 0);

      // When: player1_machao가 노크 (마지막 장수, 노크 후 eliminated)
      const result = executeKnock(state, 'player1_machao');

      // Then: player1 전원 eliminated -> player2 와해 승리
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.knockCount).toBe(1);
        expect(result.data.victoryResult).toEqual({
          winner: 'player2',
          reason: 'collapse',
        });
        expect(result.data.state.phase).toBe('ended');
      }
    });
  });
});
