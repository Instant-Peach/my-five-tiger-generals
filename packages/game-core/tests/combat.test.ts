/**
 * Combat System Tests
 *
 * Story 4-1: 인접 공격 (Adjacent Attack)
 * Story 4-2: 공격 방향 판정 (Attack Direction Judgment)
 * Story 4-3: 방향별 데미지 계산 (Directional Damage Calculation)
 *
 * 공격 가능 타일 계산 및 공격 실행 로직 테스트
 */

import { describe, it, expect } from 'vitest';
import { getAttackableTiles, executeAttack, canAttack, calculateDamage, getAttackStat, getDefendStat } from '../src/combat';
import type { GameState, PerformedAction } from '../src/state/types';
import type { General, GeneralId, PlayerId, GeneralStats } from '../src/generals/types';
import type { TileId, AttackDirection } from '../src/board/types';

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
 *
 * @param id - 장수 ID
 * @param owner - 소유 플레이어
 * @param position - 타일 위치
 * @param troops - 병력 수
 * @param status - 상태
 * @param stats - 스탯 (옵션, 기본값: sun:5, moon:5)
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

describe('Combat System', () => {
  describe('getAttackableTiles()', () => {
    it('should return empty array when general does not exist', () => {
      const state = createTestGameState([]);
      const attackable = getAttackableTiles(state, 'non_existent');
      expect(attackable).toEqual([]);
    });

    it('should return empty array when general has null position', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', null),
      ];
      const state = createTestGameState(generals);
      const attackable = getAttackableTiles(state, 'player1_general1');
      expect(attackable).toEqual([]);
    });

    it('should return empty array when no enemies are adjacent', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 0), // Not adjacent to 12
      ];
      const state = createTestGameState(generals);
      const attackable = getAttackableTiles(state, 'player1_general1');
      expect(attackable).toEqual([]);
    });

    it('should return adjacent tiles with enemy generals', () => {
      // Tile 12 (▲) has edge-adjacent tiles: 11, 13, 17
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11), // Adjacent enemy
      ];
      const state = createTestGameState(generals);
      const attackable = getAttackableTiles(state, 'player1_general1');

      expect(attackable.length).toBe(1);
      expect(attackable).toContain(11);
    });

    it('should return multiple adjacent tiles with enemy generals', () => {
      // Tile 12 (▲) has edge-adjacent tiles: 11, 13, 17
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11), // Adjacent enemy
        createTestGeneral('player2_general2', 'player2', 17), // Adjacent enemy
      ];
      const state = createTestGameState(generals);
      const attackable = getAttackableTiles(state, 'player1_general1');

      expect(attackable.length).toBe(2);
      expect(attackable).toContain(11);
      expect(attackable).toContain(17);
    });

    it('should NOT include allied generals in attackable tiles', () => {
      // Tile 12 (▲) has edge-adjacent tiles: 11, 13, 17
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player1_general2', 'player1', 11), // Adjacent ally
        createTestGeneral('player2_general1', 'player2', 17), // Adjacent enemy
      ];
      const state = createTestGameState(generals);
      const attackable = getAttackableTiles(state, 'player1_general1');

      expect(attackable.length).toBe(1);
      expect(attackable).not.toContain(11); // Ally
      expect(attackable).toContain(17); // Enemy
    });

    it('should NOT include vertex-adjacent enemies', () => {
      // Tile 12 (▲) is vertex-adjacent to 7 but NOT edge-adjacent
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 7), // Vertex-adjacent enemy (NOT edge-adjacent)
      ];
      const state = createTestGameState(generals);
      const attackable = getAttackableTiles(state, 'player1_general1');

      expect(attackable).not.toContain(7);
      expect(attackable).toEqual([]);
    });

    it('should NOT include enemies with out status', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11, 5, 'out'), // Adjacent but OUT
      ];
      const state = createTestGameState(generals);
      const attackable = getAttackableTiles(state, 'player1_general1');

      expect(attackable).toEqual([]);
    });

    it('should handle side tile attacks', () => {
      // Side tile 30 is edge-adjacent to 5, 10
      const generals = [
        createTestGeneral('player1_general1', 'player1', 30),
        createTestGeneral('player2_general1', 'player2', 5), // Adjacent to side tile
      ];
      const state = createTestGameState(generals);
      const attackable = getAttackableTiles(state, 'player1_general1');

      expect(attackable.length).toBe(1);
      expect(attackable).toContain(5);
    });
  });

  describe('canAttack()', () => {
    it('should return false when attacker does not exist', () => {
      const state = createTestGameState([]);
      const result = canAttack(state, 'non_existent', 'player2_general1');
      expect(result).toBe(false);
    });

    it('should return false when defender does not exist', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
      ];
      const state = createTestGameState(generals);
      const result = canAttack(state, 'player1_general1', 'non_existent');
      expect(result).toBe(false);
    });

    it('should return false when attacker is not current player', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const state = createTestGameState(generals, 'player2'); // Player2's turn
      const result = canAttack(state, 'player1_general1', 'player2_general1');
      expect(result).toBe(false);
    });

    it('should return false when trying to attack allied general', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player1_general2', 'player1', 11),
      ];
      const state = createTestGameState(generals);
      const result = canAttack(state, 'player1_general1', 'player1_general2');
      expect(result).toBe(false);
    });

    it('should return false when not adjacent', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 0), // Not adjacent
      ];
      const state = createTestGameState(generals);
      const result = canAttack(state, 'player1_general1', 'player2_general1');
      expect(result).toBe(false);
    });

    it('should return false when already attacked this turn', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_general1', actionType: 'attack' },
      ];
      const state = createTestGameState(generals, 'player1', 3, performedActions);
      const result = canAttack(state, 'player1_general1', 'player2_general1');
      expect(result).toBe(false);
    });

    it('should return false when no actions remaining', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const state = createTestGameState(generals, 'player1', 0); // No actions left
      const result = canAttack(state, 'player1_general1', 'player2_general1');
      expect(result).toBe(false);
    });

    it('should return true for valid attack', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11), // Adjacent enemy
      ];
      const state = createTestGameState(generals);
      const result = canAttack(state, 'player1_general1', 'player2_general1');
      expect(result).toBe(true);
    });

    it('should allow attack after move (different action type)', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const performedActions: PerformedAction[] = [
        { generalId: 'player1_general1', actionType: 'move' }, // Already moved
      ];
      const state = createTestGameState(generals, 'player1', 2, performedActions);
      const result = canAttack(state, 'player1_general1', 'player2_general1');
      expect(result).toBe(true); // Can still attack
    });
  });

  describe('executeAttack()', () => {
    it('should return error when attack is not valid', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 0), // Not adjacent
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_general1', 'player2_general1');

      expect(result.success).toBe(false);
    });

    it('should reduce defender troops based on direction (frontline = 1 fixed)', () => {
      // Tile 12 -> Tile 17 = frontline (same col), fixed 1 damage
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12, 5),
        createTestGeneral('player2_general1', 'player2', 17, 5), // Adjacent via frontline
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_general1', 'player2_general1');

      expect(result.success).toBe(true);
      if (result.success) {
        const defender = result.data.state.generals.find(g => g.id === 'player2_general1');
        expect(defender?.troops).toBe(4); // 5 - 1 = 4 (frontline fixed)
        expect(result.data.result.direction).toBe('frontline');
        expect(result.data.result.damage).toBe(1);
      }
    });

    it('should consume one action', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const state = createTestGameState(generals, 'player1', 3);
      const result = executeAttack(state, 'player1_general1', 'player2_general1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.actionsRemaining).toBe(2); // 3 - 1 = 2
      }
    });

    it('should record attack action', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_general1', 'player2_general1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.performedActions).toContainEqual({
          generalId: 'player1_general1',
          actionType: 'attack',
        });
      }
    });

    it('should NOT allow same general to attack twice in same turn', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
        createTestGeneral('player2_general2', 'player2', 17),
      ];
      const state = createTestGameState(generals);

      // First attack
      const result1 = executeAttack(state, 'player1_general1', 'player2_general1');
      expect(result1.success).toBe(true);

      if (result1.success) {
        // Second attack with same general
        const result2 = executeAttack(result1.data.state, 'player1_general1', 'player2_general2');
        expect(result2.success).toBe(false);
        if (!result2.success) {
          expect(result2.error.code).toBe('SAME_ACTION_SAME_GENERAL');
        }
      }
    });

    it('should allow different generals to attack in same turn', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player1_general2', 'player1', 16),
        createTestGeneral('player2_general1', 'player2', 11), // Adjacent to 12
        createTestGeneral('player2_general2', 'player2', 17), // Adjacent to 12 and 16
      ];
      const state = createTestGameState(generals);

      // First general attacks
      const result1 = executeAttack(state, 'player1_general1', 'player2_general1');
      expect(result1.success).toBe(true);

      if (result1.success) {
        // Second general attacks (tile 16 adjacent to 17: 15, 17, 21)
        const result2 = executeAttack(result1.data.state, 'player1_general2', 'player2_general2');
        expect(result2.success).toBe(true);
      }
    });

    it('should fail when 3 actions have been used', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const state = createTestGameState(generals, 'player1', 0);
      const result = executeAttack(state, 'player1_general1', 'player2_general1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIONS_REMAINING');
      }
    });

    it('should not change attacker position', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_general1', 'player2_general1');

      expect(result.success).toBe(true);
      if (result.success) {
        const attacker = result.data.state.generals.find(g => g.id === 'player1_general1');
        expect(attacker?.position).toBe(12); // Unchanged
      }
    });

    it('should not change defender position', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 12),
        createTestGeneral('player2_general1', 'player2', 11),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_general1', 'player2_general1');

      expect(result.success).toBe(true);
      if (result.success) {
        const defender = result.data.state.generals.find(g => g.id === 'player2_general1');
        expect(defender?.position).toBe(11); // Unchanged
      }
    });
  });

  // ========================================
  // Story 4-2: 공격 방향 판정 (Attack Direction Judgment)
  // ========================================
  describe('Attack Direction in executeAttack() (Story 4-2)', () => {
    describe('AttackResult contains direction', () => {
      it('should return AttackResult with direction for valid attack', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12),
          createTestGeneral('player2_general1', 'player2', 11), // Adjacent enemy (left)
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result).toBeDefined();
          expect(result.data.result.direction).toBeDefined();
          expect(['sun', 'moon', 'frontline']).toContain(result.data.result.direction);
        }
      });

      it('should include all AttackResult fields', () => {
        // Tile 12 -> Tile 17 = frontline (same col), fixed 1 damage
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 5),
          createTestGeneral('player2_general1', 'player2', 17, 3), // Adjacent via frontline, 3 troops
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          const attackResult = result.data.result;
          expect(attackResult.attackerId).toBe('player1_general1');
          expect(attackResult.defenderId).toBe('player2_general1');
          expect(attackResult.attackerTile).toBe(12);
          expect(attackResult.defenderTile).toBe(17);
          expect(attackResult.direction).toBe('frontline');
          expect(attackResult.damage).toBe(1); // Frontline fixed damage
          expect(attackResult.defenderTroopsAfter).toBe(2); // 3 - 1 = 2
          expect(attackResult.isKnockOut).toBe(false);
        }
      });
    });

    describe('direction judgment correctness', () => {
      it('should return moon for left attack (col decrease)', () => {
        // Tile 12 (col=2) -> Tile 11 (col=1) = left = moon
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12),
          createTestGeneral('player2_general1', 'player2', 11),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('moon');
        }
      });

      it('should return sun for right attack (col increase)', () => {
        // Tile 12 (col=2) -> Tile 13 (col=3) = right = sun
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12),
          createTestGeneral('player2_general1', 'player2', 13),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('sun');
        }
      });

      it('should return frontline for vertical attack (same col)', () => {
        // Tile 12 (▲, row=2, col=2) -> Tile 17 (▽, row=3, col=2) = same col = frontline
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12),
          createTestGeneral('player2_general1', 'player2', 17),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('frontline');
        }
      });

      it('should return frontline for upward vertical attack', () => {
        // Tile 17 (▽, row=3, col=2) -> Tile 12 (▲, row=2, col=2) = same col = frontline
        const generals = [
          createTestGeneral('player1_general1', 'player1', 17),
          createTestGeneral('player2_general1', 'player2', 12),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('frontline');
        }
      });
    });

    describe('side tile direction judgment', () => {
      it('should return sun for attack from left side tile (col=-1 to col=0)', () => {
        // Side tile 30 (col=-1) -> Tile 5 (col=0) = right direction = sun
        const generals = [
          createTestGeneral('player1_general1', 'player1', 30),
          createTestGeneral('player2_general1', 'player2', 5),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('sun');
        }
      });

      it('should return moon for attack to left side tile (col=0 to col=-1)', () => {
        // Tile 5 (col=0) -> Side tile 30 (col=-1) = left direction = moon
        const generals = [
          createTestGeneral('player1_general1', 'player1', 5),
          createTestGeneral('player2_general1', 'player2', 30),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('moon');
        }
      });

      it('should return moon for attack from right side tile (col=5 to col=4)', () => {
        // Side tile 32 (col=5) -> Tile 9 (col=4) = left direction = moon
        const generals = [
          createTestGeneral('player1_general1', 'player1', 32),
          createTestGeneral('player2_general1', 'player2', 9),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('moon');
        }
      });

      it('should return sun for attack to right side tile (col=4 to col=5)', () => {
        // Tile 9 (col=4) -> Side tile 32 (col=5) = right direction = sun
        const generals = [
          createTestGeneral('player1_general1', 'player1', 9),
          createTestGeneral('player2_general1', 'player2', 32),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('sun');
        }
      });
    });

    describe('isKnockOut detection', () => {
      it('should set isKnockOut=true when defender reaches 0 troops', () => {
        // Use frontline attack (tile 12 -> 17) for guaranteed 1 damage
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12),
          createTestGeneral('player2_general1', 'player2', 17, 1), // 1 troop, will be knocked out
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('frontline');
          expect(result.data.result.damage).toBe(1);
          expect(result.data.result.defenderTroopsAfter).toBe(0);
          expect(result.data.result.isKnockOut).toBe(true);
        }
      });

      it('should set isKnockOut=false when defender has remaining troops', () => {
        // Use frontline attack (tile 12 -> 17) for guaranteed 1 damage
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12),
          createTestGeneral('player2_general1', 'player2', 17, 5), // 5 troops
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('frontline');
          expect(result.data.result.damage).toBe(1);
          expect(result.data.result.defenderTroopsAfter).toBe(4);
          expect(result.data.result.isKnockOut).toBe(false);
        }
      });
    });

    describe('attack result consistency with state', () => {
      it('should have consistent defenderTroopsAfter with updated state', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 5),
          createTestGeneral('player2_general1', 'player2', 11, 3),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          const defenderInState = result.data.state.generals.find(g => g.id === 'player2_general1');
          expect(defenderInState?.troops).toBe(result.data.result.defenderTroopsAfter);
        }
      });

      it('should have consistent attackerTile/defenderTile with general positions', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12),
          createTestGeneral('player2_general1', 'player2', 17),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          const attackerInState = result.data.state.generals.find(g => g.id === 'player1_general1');
          const defenderInState = result.data.state.generals.find(g => g.id === 'player2_general1');
          expect(result.data.result.attackerTile).toBe(attackerInState?.position);
          expect(result.data.result.defenderTile).toBe(defenderInState?.position);
        }
      });
    });

    describe('multiple attacks with direction tracking', () => {
      it('should track different directions for different attacks', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12),
          createTestGeneral('player1_general2', 'player1', 13),
          createTestGeneral('player2_general1', 'player2', 11), // Left of 12
          createTestGeneral('player2_general2', 'player2', 14), // Right of 13 (edge-adjacent)
        ];
        const state = createTestGameState(generals);

        // First attack: 12 -> 11 (moon - left)
        const result1 = executeAttack(state, 'player1_general1', 'player2_general1');
        expect(result1.success).toBe(true);
        if (result1.success) {
          expect(result1.data.result.direction).toBe('moon');

          // Second attack: 13 -> 14 (sun - right)
          const result2 = executeAttack(result1.data.state, 'player1_general2', 'player2_general2');
          expect(result2.success).toBe(true);
          if (result2.success) {
            expect(result2.data.result.direction).toBe('sun');
          }
        }
      });
    });

    describe('Up/Down tile direction judgment (AC2)', () => {
      it('should correctly determine direction from Up (▲) tile', () => {
        // Tile 12 (▲, row=2, col=2)
        // Edge-adjacent: 11 (left), 13 (right), 17 (below, same col)

        // Test attack to each adjacent tile
        const testCases: Array<{ defenderTile: TileId; expectedDirection: AttackDirection }> = [
          { defenderTile: 11, expectedDirection: 'moon' },     // left
          { defenderTile: 13, expectedDirection: 'sun' },      // right
          { defenderTile: 17, expectedDirection: 'frontline' }, // below (same col)
        ];

        for (const { defenderTile, expectedDirection } of testCases) {
          const generals = [
            createTestGeneral('player1_general1', 'player1', 12),
            createTestGeneral('player2_general1', 'player2', defenderTile),
          ];
          const state = createTestGameState(generals);
          const result = executeAttack(state, 'player1_general1', 'player2_general1');

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.result.direction).toBe(expectedDirection);
          }
        }
      });

      it('should correctly determine direction from Down (▽) tile', () => {
        // Tile 11 (▽, row=2, col=1)
        // Edge-adjacent: 6 (above, same col), 10 (left), 12 (right)

        const testCases: Array<{ defenderTile: TileId; expectedDirection: AttackDirection }> = [
          { defenderTile: 6, expectedDirection: 'frontline' },  // above (same col)
          { defenderTile: 10, expectedDirection: 'moon' },      // left
          { defenderTile: 12, expectedDirection: 'sun' },       // right
        ];

        for (const { defenderTile, expectedDirection } of testCases) {
          const generals = [
            createTestGeneral('player1_general1', 'player1', 11),
            createTestGeneral('player2_general1', 'player2', defenderTile),
          ];
          const state = createTestGameState(generals);
          const result = executeAttack(state, 'player1_general1', 'player2_general1');

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.result.direction).toBe(expectedDirection);
          }
        }
      });
    });

    describe('row 0 and row 5 boundary attacks', () => {
      it('should handle row 0 attacks correctly', () => {
        // Tile 0 (▲, row=0, col=0) -> Tile 1 (▽, row=0, col=1) = sun
        const generals = [
          createTestGeneral('player1_general1', 'player1', 0),
          createTestGeneral('player2_general1', 'player2', 1),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('sun');
        }
      });

      it('should handle row 5 attacks correctly', () => {
        // Tile 26 (▲, row=5, col=1) -> Tile 27 (▽, row=5, col=2) = sun
        const generals = [
          createTestGeneral('player1_general1', 'player1', 26),
          createTestGeneral('player2_general1', 'player2', 27),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('sun');
        }
      });

      it('should handle cross-row frontline attack', () => {
        // Tile 5 (▽, row=1, col=0) -> Tile 0 (▲, row=0, col=0) = frontline
        const generals = [
          createTestGeneral('player1_general1', 'player1', 5),
          createTestGeneral('player2_general1', 'player2', 0),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_general1', 'player2_general1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('frontline');
        }
      });
    });
  });

  // ========================================
  // Story 4-5: 장수 OUT 처리 (General OUT Handling)
  // ========================================
  describe('General OUT Handling (Story 4-5)', () => {
    describe('executeAttack OUT state transition (AC1)', () => {
      it('should set status to out when troops reach 0', () => {
        // Given: 병력 1인 방어자 (frontline 공격 = 1 피해)
        const generals = [
          createTestGeneral('player1_attacker', 'player1', 12, 5),
          createTestGeneral('player2_defender', 'player2', 17, 1), // 1 troop, frontline
        ];
        const state = createTestGameState(generals);

        // When: 공격 실행 (frontline = 1 피해)
        const result = executeAttack(state, 'player1_attacker', 'player2_defender');

        // Then: OUT 상태
        expect(result.success).toBe(true);
        if (result.success) {
          const defender = result.data.state.generals.find(g => g.id === 'player2_defender');
          expect(defender?.troops).toBe(0);
          expect(defender?.status).toBe('out');
          expect(defender?.position).toBeNull();
          expect(result.data.result.isKnockOut).toBe(true);
        }
      });

      it('should NOT change status to OUT when troops remain > 0 (frontline → engaged)', () => {
        // Given: 병력 5인 방어자
        const generals = [
          createTestGeneral('player1_attacker', 'player1', 12, 5),
          createTestGeneral('player2_defender', 'player2', 17, 5), // 5 troops
        ];
        const state = createTestGameState(generals);

        // When: 공격 실행 (frontline = 1 피해)
        const result = executeAttack(state, 'player1_attacker', 'player2_defender');

        // Then: 전선 공격이므로 교전 상태 진입 (OUT이 아님)
        expect(result.success).toBe(true);
        if (result.success) {
          const defender = result.data.state.generals.find(g => g.id === 'player2_defender');
          expect(defender?.troops).toBe(4);
          expect(defender?.status).toBe('engaged');
          expect(defender?.position).toBe(17);
          expect(result.data.result.isKnockOut).toBe(false);
        }
      });
    });

    describe('canAttack OUT general exclusion (AC4)', () => {
      it('should return false when defender status is out', () => {
        // Given: OUT 상태 방어자
        const generals = [
          createTestGeneral('player1_attacker', 'player1', 12, 5),
          createTestGeneral('player2_outGeneral', 'player2', 11, 0, 'out'), // OUT status
        ];
        const state = createTestGameState(generals);

        // When: OUT 장수 공격 시도
        const canAttackResult = canAttack(state, 'player1_attacker', 'player2_outGeneral');

        // Then: 공격 불가
        expect(canAttackResult).toBe(false);
      });

      it('should return false when attacker status is out', () => {
        // Given: OUT 상태 공격자
        const generals = [
          createTestGeneral('player1_outAttacker', 'player1', 12, 0, 'out'), // OUT status
          createTestGeneral('player2_defender', 'player2', 11, 5, 'active'),
        ];
        const state = createTestGameState(generals);

        // When: OUT 장수가 공격 시도
        const canAttackResult = canAttack(state, 'player1_outAttacker', 'player2_defender');

        // Then: 공격 불가
        expect(canAttackResult).toBe(false);
      });

      it('should return true for active defender', () => {
        // Given: 활성 상태 장수
        const generals = [
          createTestGeneral('player1_attacker', 'player1', 12, 5),
          createTestGeneral('player2_defender', 'player2', 11, 5, 'active'),
        ];
        const state = createTestGameState(generals);

        // When: 활성 장수 공격 시도
        const canAttackResult = canAttack(state, 'player1_attacker', 'player2_defender');

        // Then: 공격 가능
        expect(canAttackResult).toBe(true);
      });
    });

    describe('getAttackableTiles OUT general exclusion (AC4)', () => {
      it('should NOT include tiles with OUT generals', () => {
        // Given: OUT 장수가 인접 타일에 있음
        const generals = [
          createTestGeneral('player1_attacker', 'player1', 12, 5),
          createTestGeneral('player2_outGeneral', 'player2', 11, 0, 'out'), // Adjacent but OUT
          createTestGeneral('player2_activeGeneral', 'player2', 17, 5, 'active'), // Adjacent and active
        ];
        const state = createTestGameState(generals);

        // When: 공격 가능 타일 조회
        const attackable = getAttackableTiles(state, 'player1_attacker');

        // Then: OUT 장수 제외, 활성 장수만 포함
        expect(attackable).not.toContain(11);
        expect(attackable).toContain(17);
      });
    });
  });

  // ========================================
  // Story 4-3: 방향별 데미지 계산 (Directional Damage Calculation)
  // ========================================
  describe('Directional Damage Calculation (Story 4-3)', () => {
    /**
     * 장수 스탯 참조 (GDD 기준):
     * | 장수   | 별  | Sun | Moon | 발  |
     * |--------|-----|-----|------|-----|
     * | 관우   | 5   | 4   | 4    | 2   |
     * | 장비   | 4   | 5   | 3    | 2   |
     * | 조운   | 4   | 3   | 4    | 3   |
     * | 황충   | 3   | 5   | 2    | 2   |
     * | 마초   | 5   | 4   | 3    | 3   |
     */
    const GUANYU_STATS: GeneralStats = { star: 5, sun: 4, moon: 4, speed: 2 };
    const ZHANGFEI_STATS: GeneralStats = { star: 4, sun: 5, moon: 3, speed: 2 };
    const ZHAOYUN_STATS: GeneralStats = { star: 4, sun: 3, moon: 4, speed: 3 };
    const HUANGZHONG_STATS: GeneralStats = { star: 3, sun: 5, moon: 2, speed: 2 };
    const MACHAO_STATS: GeneralStats = { star: 5, sun: 4, moon: 3, speed: 3 };

    describe('calculateDamage()', () => {
      describe('Sun direction (AC1)', () => {
        it('should calculate damage as attacker sun - defender sun', () => {
          // 장비(sun:5) -> 관우(sun:4) = 5 - 4 = 1
          const attacker = createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active', ZHANGFEI_STATS);
          const defender = createTestGeneral('player2_guanyu', 'player2', 13, 5, 'active', GUANYU_STATS);

          const damage = calculateDamage(attacker, defender, 'sun');
          expect(damage).toBe(1);
        });

        it('should return 0 when defender sun is higher', () => {
          // 관우(sun:4) -> 황충(sun:5) = 4 - 5 = -1 -> 0 (최소값)
          const attacker = createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS);
          const defender = createTestGeneral('player2_huangzhong', 'player2', 13, 5, 'active', HUANGZHONG_STATS);

          const damage = calculateDamage(attacker, defender, 'sun');
          expect(damage).toBe(0);
        });

        it('should return 0 when sun stats are equal', () => {
          // 관우(sun:4) -> 마초(sun:4) = 4 - 4 = 0
          const attacker = createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS);
          const defender = createTestGeneral('player2_machao', 'player2', 13, 5, 'active', MACHAO_STATS);

          const damage = calculateDamage(attacker, defender, 'sun');
          expect(damage).toBe(0);
        });

        it('should calculate higher damage for larger stat difference', () => {
          // 황충(sun:5) -> 조운(sun:3) = 5 - 3 = 2
          const attacker = createTestGeneral('player1_huangzhong', 'player1', 12, 5, 'active', HUANGZHONG_STATS);
          const defender = createTestGeneral('player2_zhaoyun', 'player2', 13, 5, 'active', ZHAOYUN_STATS);

          const damage = calculateDamage(attacker, defender, 'sun');
          expect(damage).toBe(2);
        });
      });

      describe('Moon direction (AC2)', () => {
        it('should calculate damage as attacker moon - defender moon', () => {
          // 조운(moon:4) -> 장비(moon:3) = 4 - 3 = 1
          const attacker = createTestGeneral('player1_zhaoyun', 'player1', 12, 5, 'active', ZHAOYUN_STATS);
          const defender = createTestGeneral('player2_zhangfei', 'player2', 11, 5, 'active', ZHANGFEI_STATS);

          const damage = calculateDamage(attacker, defender, 'moon');
          expect(damage).toBe(1);
        });

        it('should return 0 when defender moon is higher', () => {
          // 황충(moon:2) -> 관우(moon:4) = 2 - 4 = -2 -> 0 (최소값)
          const attacker = createTestGeneral('player1_huangzhong', 'player1', 12, 5, 'active', HUANGZHONG_STATS);
          const defender = createTestGeneral('player2_guanyu', 'player2', 11, 5, 'active', GUANYU_STATS);

          const damage = calculateDamage(attacker, defender, 'moon');
          expect(damage).toBe(0);
        });

        it('should return 0 when moon stats are equal', () => {
          // 관우(moon:4) -> 조운(moon:4) = 4 - 4 = 0
          const attacker = createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS);
          const defender = createTestGeneral('player2_zhaoyun', 'player2', 11, 5, 'active', ZHAOYUN_STATS);

          const damage = calculateDamage(attacker, defender, 'moon');
          expect(damage).toBe(0);
        });

        it('should calculate higher damage for larger stat difference', () => {
          // 관우(moon:4) -> 황충(moon:2) = 4 - 2 = 2
          const attacker = createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS);
          const defender = createTestGeneral('player2_huangzhong', 'player2', 11, 5, 'active', HUANGZHONG_STATS);

          const damage = calculateDamage(attacker, defender, 'moon');
          expect(damage).toBe(2);
        });
      });

      describe('Frontline direction (AC3)', () => {
        it('should always return 1 for frontline (fixed damage)', () => {
          // 어떤 스탯 조합이든 전선은 고정 1 피해
          const attacker = createTestGeneral('player1_zhaoyun', 'player1', 12, 5, 'active', ZHAOYUN_STATS);
          const defender = createTestGeneral('player2_huangzhong', 'player2', 17, 5, 'active', HUANGZHONG_STATS);

          const damage = calculateDamage(attacker, defender, 'frontline');
          expect(damage).toBe(1);
        });

        it('should return 1 even when defender would normally have advantage', () => {
          // 조운(sun:3) vs 황충(sun:5)이라도 전선은 고정 1
          const attacker = createTestGeneral('player1_zhaoyun', 'player1', 12, 5, 'active', ZHAOYUN_STATS);
          const defender = createTestGeneral('player2_huangzhong', 'player2', 17, 5, 'active', HUANGZHONG_STATS);

          const damage = calculateDamage(attacker, defender, 'frontline');
          expect(damage).toBe(1);
        });

        it('should return 1 with high stat generals', () => {
          // 장비(sun:5) vs 장비(sun:5) 전선 공격 = 고정 1
          const attacker = createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active', ZHANGFEI_STATS);
          const defender = createTestGeneral('player2_zhangfei', 'player2', 17, 5, 'active', ZHANGFEI_STATS);

          const damage = calculateDamage(attacker, defender, 'frontline');
          expect(damage).toBe(1);
        });
      });
    });

    describe('getAttackStat()', () => {
      it('should return sun stat for sun direction', () => {
        const general = createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active', ZHANGFEI_STATS);
        expect(getAttackStat(general, 'sun')).toBe(5);
      });

      it('should return moon stat for moon direction', () => {
        const general = createTestGeneral('player1_zhaoyun', 'player1', 12, 5, 'active', ZHAOYUN_STATS);
        expect(getAttackStat(general, 'moon')).toBe(4);
      });

      it('should return 0 for frontline direction', () => {
        const general = createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS);
        expect(getAttackStat(general, 'frontline')).toBe(0);
      });
    });

    describe('getDefendStat()', () => {
      it('should return sun stat for sun direction', () => {
        const general = createTestGeneral('player2_guanyu', 'player2', 13, 5, 'active', GUANYU_STATS);
        expect(getDefendStat(general, 'sun')).toBe(4);
      });

      it('should return moon stat for moon direction', () => {
        const general = createTestGeneral('player2_zhangfei', 'player2', 11, 5, 'active', ZHANGFEI_STATS);
        expect(getDefendStat(general, 'moon')).toBe(3);
      });

      it('should return 0 for frontline direction', () => {
        const general = createTestGeneral('player2_huangzhong', 'player2', 17, 5, 'active', HUANGZHONG_STATS);
        expect(getDefendStat(general, 'frontline')).toBe(0);
      });
    });

    describe('executeAttack integration (AC4)', () => {
      it('should apply sun direction damage correctly', () => {
        // Tile 12 -> Tile 13 = sun direction (right)
        // 장비(sun:5) -> 조운(sun:3) = 2 피해
        const generals = [
          createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active', ZHANGFEI_STATS),
          createTestGeneral('player2_zhaoyun', 'player2', 13, 5, 'active', ZHAOYUN_STATS),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_zhangfei', 'player2_zhaoyun');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('sun');
          expect(result.data.result.damage).toBe(2);
          expect(result.data.result.defenderTroopsAfter).toBe(3); // 5 - 2 = 3
        }
      });

      it('should apply moon direction damage correctly', () => {
        // Tile 12 -> Tile 11 = moon direction (left)
        // 조운(moon:4) -> 장비(moon:3) = 1 피해
        const generals = [
          createTestGeneral('player1_zhaoyun', 'player1', 12, 5, 'active', ZHAOYUN_STATS),
          createTestGeneral('player2_zhangfei', 'player2', 11, 5, 'active', ZHANGFEI_STATS),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_zhaoyun', 'player2_zhangfei');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('moon');
          expect(result.data.result.damage).toBe(1);
          expect(result.data.result.defenderTroopsAfter).toBe(4); // 5 - 1 = 4
        }
      });

      it('should apply frontline direction damage correctly', () => {
        // Tile 12 -> Tile 17 = frontline direction (same col)
        // 어떤 장수든 전선은 고정 1 피해
        const generals = [
          createTestGeneral('player1_zhaoyun', 'player1', 12, 5, 'active', ZHAOYUN_STATS),
          createTestGeneral('player2_huangzhong', 'player2', 17, 5, 'active', HUANGZHONG_STATS),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_zhaoyun', 'player2_huangzhong');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('frontline');
          expect(result.data.result.damage).toBe(1);
          expect(result.data.result.defenderTroopsAfter).toBe(4); // 5 - 1 = 4
        }
      });

      it('should deal 0 damage when defender has higher stat', () => {
        // Tile 12 -> Tile 13 = sun direction
        // 관우(sun:4) -> 황충(sun:5) = 0 피해 (방어 우위)
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS),
          createTestGeneral('player2_huangzhong', 'player2', 13, 5, 'active', HUANGZHONG_STATS),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_guanyu', 'player2_huangzhong');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.direction).toBe('sun');
          expect(result.data.result.damage).toBe(0);
          expect(result.data.result.defenderTroopsAfter).toBe(5); // 변화 없음
          expect(result.data.result.isKnockOut).toBe(false);
        }
      });

      it('should knock out defender when damage exceeds remaining troops', () => {
        // Tile 12 -> Tile 13 = sun direction
        // 황충(sun:5) -> 조운(sun:3, troops:2) = 2 피해 -> 0 troops
        const generals = [
          createTestGeneral('player1_huangzhong', 'player1', 12, 5, 'active', HUANGZHONG_STATS),
          createTestGeneral('player2_zhaoyun', 'player2', 13, 2, 'active', ZHAOYUN_STATS), // Only 2 troops
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_huangzhong', 'player2_zhaoyun');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.result.damage).toBe(2);
          expect(result.data.result.defenderTroopsAfter).toBe(0);
          expect(result.data.result.isKnockOut).toBe(true);
        }
      });
    });

    describe('GDD example scenarios', () => {
      it('장비(sun:5) -> 관우(sun:4) Sun 공격 = 1 피해', () => {
        const attacker = createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active', ZHANGFEI_STATS);
        const defender = createTestGeneral('player2_guanyu', 'player2', 13, 5, 'active', GUANYU_STATS);
        expect(calculateDamage(attacker, defender, 'sun')).toBe(1);
      });

      it('관우(sun:4) -> 황충(sun:5) Sun 공격 = 0 피해 (방어 우위)', () => {
        const attacker = createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS);
        const defender = createTestGeneral('player2_huangzhong', 'player2', 13, 5, 'active', HUANGZHONG_STATS);
        expect(calculateDamage(attacker, defender, 'sun')).toBe(0);
      });

      it('조운(moon:4) -> 장비(moon:3) Moon 공격 = 1 피해', () => {
        const attacker = createTestGeneral('player1_zhaoyun', 'player1', 12, 5, 'active', ZHAOYUN_STATS);
        const defender = createTestGeneral('player2_zhangfei', 'player2', 11, 5, 'active', ZHANGFEI_STATS);
        expect(calculateDamage(attacker, defender, 'moon')).toBe(1);
      });

      it('황충(moon:2) -> 관우(moon:4) Moon 공격 = 0 피해 (방어 우위)', () => {
        const attacker = createTestGeneral('player1_huangzhong', 'player1', 12, 5, 'active', HUANGZHONG_STATS);
        const defender = createTestGeneral('player2_guanyu', 'player2', 11, 5, 'active', GUANYU_STATS);
        expect(calculateDamage(attacker, defender, 'moon')).toBe(0);
      });

      it('아무 장수 -> 아무 장수 Frontline 공격 = 1 피해 (고정)', () => {
        const attacker = createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS);
        const defender = createTestGeneral('player2_zhangfei', 'player2', 17, 5, 'active', ZHANGFEI_STATS);
        expect(calculateDamage(attacker, defender, 'frontline')).toBe(1);
      });
    });

    describe('damage consistency with state (AC4)', () => {
      it('should have consistent defenderTroopsAfter with updated state after sun attack', () => {
        const generals = [
          createTestGeneral('player1_zhangfei', 'player1', 12, 5, 'active', ZHANGFEI_STATS),
          createTestGeneral('player2_zhaoyun', 'player2', 13, 5, 'active', ZHAOYUN_STATS),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_zhangfei', 'player2_zhaoyun');

        expect(result.success).toBe(true);
        if (result.success) {
          const defenderInState = result.data.state.generals.find(g => g.id === 'player2_zhaoyun');
          expect(defenderInState?.troops).toBe(result.data.result.defenderTroopsAfter);
          expect(defenderInState?.troops).toBe(3); // 5 - 2 = 3
        }
      });

      it('should have consistent defenderTroopsAfter with updated state after moon attack', () => {
        const generals = [
          createTestGeneral('player1_guanyu', 'player1', 12, 5, 'active', GUANYU_STATS),
          createTestGeneral('player2_huangzhong', 'player2', 11, 5, 'active', HUANGZHONG_STATS),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_guanyu', 'player2_huangzhong');

        expect(result.success).toBe(true);
        if (result.success) {
          const defenderInState = result.data.state.generals.find(g => g.id === 'player2_huangzhong');
          expect(defenderInState?.troops).toBe(result.data.result.defenderTroopsAfter);
          // 관우(moon:4) -> 황충(moon:2) = 2 피해
          expect(defenderInState?.troops).toBe(3); // 5 - 2 = 3
        }
      });

      it('should have consistent defenderTroopsAfter with updated state after frontline attack', () => {
        const generals = [
          createTestGeneral('player1_machao', 'player1', 12, 5, 'active', MACHAO_STATS),
          createTestGeneral('player2_guanyu', 'player2', 17, 5, 'active', GUANYU_STATS),
        ];
        const state = createTestGameState(generals);
        const result = executeAttack(state, 'player1_machao', 'player2_guanyu');

        expect(result.success).toBe(true);
        if (result.success) {
          const defenderInState = result.data.state.generals.find(g => g.id === 'player2_guanyu');
          expect(defenderInState?.troops).toBe(result.data.result.defenderTroopsAfter);
          expect(defenderInState?.troops).toBe(4); // 5 - 1 = 4 (frontline fixed)
        }
      });
    });
  });
});
