/**
 * Movement System Tests (Story 3-1)
 *
 * 이동 가능 타일 계산 로직 테스트
 */

import { describe, it, expect } from 'vitest';
import { getOccupiedTiles, getMovableTilesForGeneral } from '../src/movement';
import type { GameState } from '../src/state/types';
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
function createTestGameState(generals: General[]): GameState {
  return {
    phase: 'playing',
    turnPhase: 'select',
    currentPlayer: 'player1',
    turn: 1,
    generals,
    selectedGeneralId: null,
    actionsRemaining: 3,
    performedActions: [],
    player1KnockCount: 0,
    player2KnockCount: 0,
  };
}

describe('Movement System', () => {
  describe('getOccupiedTiles()', () => {
    it('should return empty set when no generals exist', () => {
      const state = createTestGameState([]);
      const occupied = getOccupiedTiles(state);
      expect(occupied.size).toBe(0);
    });

    it('should return tiles occupied by active generals', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 25, 3, 'active'),
        createTestGeneral('player1_general2', 'player1', 26, 3, 'active'),
        createTestGeneral('player2_general1', 'player2', 0, 3, 'active'),
      ];
      const state = createTestGameState(generals);
      const occupied = getOccupiedTiles(state);

      expect(occupied.size).toBe(3);
      expect(occupied.has(25)).toBe(true);
      expect(occupied.has(26)).toBe(true);
      expect(occupied.has(0)).toBe(true);
    });

    it('should exclude generals with null position', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 25, 3, 'active'),
        createTestGeneral('player1_general2', 'player1', null, 3, 'active'),
      ];
      const state = createTestGameState(generals);
      const occupied = getOccupiedTiles(state);

      expect(occupied.size).toBe(1);
      expect(occupied.has(25)).toBe(true);
    });

    it('should exclude generals with out status', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 25, 3, 'active'),
        createTestGeneral('player1_general2', 'player1', 26, 3, 'out'),
      ];
      const state = createTestGameState(generals);
      const occupied = getOccupiedTiles(state);

      expect(occupied.size).toBe(1);
      expect(occupied.has(25)).toBe(true);
      expect(occupied.has(26)).toBe(false);
    });

    it('should exclude generals with standby status', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 25, 3, 'active'),
        createTestGeneral('player1_general2', 'player1', null, 3, 'standby'),
      ];
      const state = createTestGameState(generals);
      const occupied = getOccupiedTiles(state);

      expect(occupied.size).toBe(1);
    });

    it('should include both player generals', () => {
      const generals = [
        createTestGeneral('player1_general1', 'player1', 25, 3, 'active'),
        createTestGeneral('player2_general1', 'player2', 0, 3, 'active'),
      ];
      const state = createTestGameState(generals);
      const occupied = getOccupiedTiles(state);

      expect(occupied.size).toBe(2);
      expect(occupied.has(25)).toBe(true);
      expect(occupied.has(0)).toBe(true);
    });
  });

  describe('getMovableTilesForGeneral()', () => {
    describe('basic functionality', () => {
      it('should return empty array for non-existent general', () => {
        const state = createTestGameState([]);
        const movable = getMovableTilesForGeneral(state, 'non_existent');
        expect(movable).toEqual([]);
      });

      it('should return empty array for general with null position', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', null, 3, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');
        expect(movable).toEqual([]);
      });

      it('should return empty array for general with out status', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 3, 'out'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');
        expect(movable).toEqual([]);
      });

      it('should return empty array for general with standby status', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 3, 'standby'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');
        expect(movable).toEqual([]);
      });
    });

    describe('movement range based on speed', () => {
      it('should return adjacent tiles for speed 1', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 1, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Tile 12 (▲) has 3 edge-adjacent tiles: 11, 13, 17
        // 7 is vertex-adjacent only, not edge-adjacent
        expect(movable.length).toBe(3);
        expect(movable).not.toContain(7); // vertex-adjacent only
        expect(movable).toContain(11);
        expect(movable).toContain(13);
        expect(movable).toContain(17);
      });

      it('should return empty array for speed 0', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 0, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');
        expect(movable).toEqual([]);
      });

      it('should return tiles within speed range for speed 2', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 2, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Tile 12 (▲): edge-adjacent = 11, 13, 17
        // Distance 1: 11, 13, 17
        // Distance 2:
        //   - from 11(▽): 6, 10 (11's edge-adjacent excluding 12)
        //   - from 13(▽): 8, 14 (13's edge-adjacent excluding 12)
        //   - from 17(▽): 16, 18 (17's edge-adjacent excluding 12)
        // Note: 22 is vertex-adjacent to 17, not edge-adjacent
        expect(movable).not.toContain(7);  // vertex-adjacent only to 12
        expect(movable).not.toContain(22); // vertex-adjacent only to 17
        expect(movable).toContain(11);
        expect(movable).toContain(13);
        expect(movable).toContain(17);
        expect(movable).toContain(6);  // via 11
        expect(movable).toContain(10); // via 11
        expect(movable).toContain(8);  // via 13
        expect(movable).toContain(14); // via 13
        expect(movable).toContain(16); // via 17
        expect(movable).toContain(18); // via 17
      });

      it('should return more tiles for higher speed', () => {
        const generals1 = [
          createTestGeneral('player1_general1', 'player1', 12, 1, 'active'),
        ];
        const generals2 = [
          createTestGeneral('player1_general1', 'player1', 12, 2, 'active'),
        ];
        const generals3 = [
          createTestGeneral('player1_general1', 'player1', 12, 3, 'active'),
        ];

        const state1 = createTestGameState(generals1);
        const state2 = createTestGameState(generals2);
        const state3 = createTestGameState(generals3);

        const movable1 = getMovableTilesForGeneral(state1, 'player1_general1');
        const movable2 = getMovableTilesForGeneral(state2, 'player1_general1');
        const movable3 = getMovableTilesForGeneral(state3, 'player1_general1');

        expect(movable2.length).toBeGreaterThan(movable1.length);
        expect(movable3.length).toBeGreaterThan(movable2.length);
      });
    });

    describe('blocking by other generals', () => {
      it('should exclude tiles occupied by other generals', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 1, 'active'),
          createTestGeneral('player1_general2', 'player1', 11, 3, 'active'), // Blocking tile 11
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Tile 12's edge-adjacent: 11, 13, 17
        // Should not include tile 11 (occupied)
        expect(movable).not.toContain(11);
        // Should still include other adjacent tiles
        expect(movable).toContain(13);
        expect(movable).toContain(17);
        expect(movable.length).toBe(2);
      });

      it('should exclude tiles occupied by enemy generals', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 1, 'active'),
          createTestGeneral('player2_general1', 'player2', 11, 3, 'active'), // Enemy on tile 11
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Tile 12's edge-adjacent: 11, 13, 17 (3 tiles)
        // 11 is blocked by enemy
        expect(movable).not.toContain(11);
        expect(movable.length).toBe(2); // 13, 17
      });

      it('should block path through occupied tiles', () => {
        // Create scenario where general at tile 12 cannot reach tile 6
        // because tile 11 is blocked
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 2, 'active'),
          createTestGeneral('player2_general1', 'player2', 11, 3, 'active'), // Blocks path via 11
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Tile 11 is blocked, so can't reach tiles via 11 (like 6, 10)
        expect(movable).not.toContain(11);
        // 12's edge-adjacent: 11 (blocked), 13, 17
        // via 13: 8, 14
        // via 17: 16, 18 (22 is vertex-adjacent to 17, not reachable)
        expect(movable).toContain(13);
        expect(movable).toContain(17);
        expect(movable).toContain(8);
        expect(movable).toContain(14);
        expect(movable).toContain(16);
        expect(movable).toContain(18);
        // Cannot reach 6, 10 (need to go through blocked 11)
        expect(movable).not.toContain(6);
        expect(movable).not.toContain(10);
        // 22 is vertex-adjacent to 17, not edge-adjacent
        expect(movable).not.toContain(22);
      });

      it('should not include self position as blocked', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 1, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Should not include start position
        expect(movable).not.toContain(12);
        // But should include all edge-adjacent tiles (3 tiles for ▲12)
        expect(movable.length).toBe(3); // 11, 13, 17
      });

      it('should handle completely surrounded general', () => {
        // General at tile 12 (▲) surrounded by other generals on all 3 edge-adjacent tiles
        const generals = [
          createTestGeneral('player1_general1', 'player1', 12, 3, 'active'),
          createTestGeneral('player1_general2', 'player1', 11, 3, 'active'),
          createTestGeneral('player1_general3', 'player1', 13, 3, 'active'),
          createTestGeneral('player1_general4', 'player1', 17, 3, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Cannot move anywhere
        expect(movable).toEqual([]);
      });
    });

    describe('corner and edge cases', () => {
      it('should handle corner tile (0) with limited neighbors', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 0, 1, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Tile 0 only has 2 neighbors: 1, 5
        expect(movable.length).toBe(2);
        expect(movable).toContain(1);
        expect(movable).toContain(5);
      });

      it('should handle corner tile (29) with limited neighbors', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 29, 1, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Tile 29 only has 2 neighbors: 24, 28
        expect(movable.length).toBe(2);
        expect(movable).toContain(24);
        expect(movable).toContain(28);
      });

      it('should include side tiles in movement range', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 5, 1, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Tile 5 is adjacent to side tile 30
        expect(movable).toContain(30);
      });

      it('should handle movement from side tile', () => {
        const generals = [
          createTestGeneral('player1_general1', 'player1', 30, 1, 'active'),
        ];
        const state = createTestGameState(generals);
        const movable = getMovableTilesForGeneral(state, 'player1_general1');

        // Side tile 30 is adjacent to 5 and 10
        expect(movable.length).toBe(2);
        expect(movable).toContain(5);
        expect(movable).toContain(10);
      });
    });

    describe('integration scenarios', () => {
      it('should calculate movable tiles in realistic game scenario', () => {
        // Simulate mid-game scenario
        const generals = [
          // Player 1 generals
          createTestGeneral('player1_guanyu', 'player1', 15, 2, 'active'),
          createTestGeneral('player1_zhangfei', 'player1', 20, 3, 'active'),
          // Player 2 generals
          createTestGeneral('player2_caocao', 'player2', 12, 2, 'active'),
          createTestGeneral('player2_xiahou', 'player2', 7, 3, 'active'),
        ];
        const state = createTestGameState(generals);

        // Check movable tiles for player1_guanyu at tile 15
        const movable = getMovableTilesForGeneral(state, 'player1_guanyu');

        // Should not include occupied tiles
        expect(movable).not.toContain(20); // player1_zhangfei
        expect(movable).not.toContain(12); // player2_caocao
        expect(movable).not.toContain(7); // player2_xiahou

        // Should not include starting position
        expect(movable).not.toContain(15);

        // Should include valid movement tiles
        expect(movable).toContain(10); // Adjacent
        expect(movable).toContain(16); // Adjacent
        expect(movable).toContain(31); // Side tile (via 20 blocked? check adjacency)
      });
    });
  });
});
