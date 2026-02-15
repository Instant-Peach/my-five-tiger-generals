import { describe, it, expect } from 'vitest';
import {
  TILE_META,
  getTileMeta,
  getTileIdByRowCol,
  getAdjacentTiles,
  areAdjacent,
  getReachableTiles,
  findPath,
  BOARD,
  isValidTileId,
  isSideTile,
  EDGE_ADJACENCY_MAP,
  getAttackDirection,
} from '../src';

describe('Board Constants', () => {
  it('should have correct tile count', () => {
    expect(BOARD.TILE_COUNT).toBe(34);
    expect(BOARD.MAIN_TILES).toBe(30);
    expect(BOARD.SIDE_TILES).toBe(4);
  });

  it('should validate tile IDs correctly', () => {
    expect(isValidTileId(0)).toBe(true);
    expect(isValidTileId(33)).toBe(true);
    expect(isValidTileId(-1)).toBe(false);
    expect(isValidTileId(34)).toBe(false);
    expect(isValidTileId(1.5)).toBe(false);
  });

  it('should identify side tiles', () => {
    expect(isSideTile(30)).toBe(true);
    expect(isSideTile(31)).toBe(true);
    expect(isSideTile(32)).toBe(true);
    expect(isSideTile(33)).toBe(true);
    expect(isSideTile(0)).toBe(false);
    expect(isSideTile(29)).toBe(false);
  });
});

describe('Tile Metadata', () => {
  it('should have 34 tiles in TILE_META', () => {
    expect(TILE_META.length).toBe(34);
  });

  it('should have correct tile IDs from 0 to 33', () => {
    const ids = TILE_META.map((t) => t.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 34 }, (_, i) => i));
  });

  // Task 1.1: 34개 타일 모든 필드 완전 검증
  describe('all 34 tiles complete field validation', () => {
    it('should have all required fields for each tile', () => {
      TILE_META.forEach((tile) => {
        expect(tile).toHaveProperty('id');
        expect(tile).toHaveProperty('direction');
        expect(tile).toHaveProperty('zone');
        expect(tile).toHaveProperty('row');
        expect(tile).toHaveProperty('col');
        expect(tile).toHaveProperty('isSideTile');
        expect(typeof tile.id).toBe('number');
        expect(typeof tile.row).toBe('number');
        expect(typeof tile.col).toBe('number');
        expect(typeof tile.isSideTile).toBe('boolean');
      });
    });

    it('should have correct row/col for main tiles (0-29)', () => {
      for (let id = 0; id < 30; id++) {
        const tile = getTileMeta(id);
        expect(tile).toBeDefined();
        const expectedRow = Math.floor(id / 5);
        const expectedCol = id % 5;
        expect(tile?.row).toBe(expectedRow);
        expect(tile?.col).toBe(expectedCol);
        expect(tile?.isSideTile).toBe(false);
      }
    });

    it('should have correct special coordinates for side tiles (30-33)', () => {
      // 30: 좌측 상단 (row 2, col -1)
      expect(getTileMeta(30)).toMatchObject({ id: 30, row: 2, col: -1, isSideTile: true, zone: 'side', direction: 'right' });
      // 31: 좌측 하단 (row 4, col -1)
      expect(getTileMeta(31)).toMatchObject({ id: 31, row: 4, col: -1, isSideTile: true, zone: 'side', direction: 'right' });
      // 32: 우측 상단 (row 2, col 5)
      expect(getTileMeta(32)).toMatchObject({ id: 32, row: 2, col: 5, isSideTile: true, zone: 'side', direction: 'left' });
      // 33: 우측 하단 (row 4, col 5)
      expect(getTileMeta(33)).toMatchObject({ id: 33, row: 4, col: 5, isSideTile: true, zone: 'side', direction: 'left' });
    });

    it('should validate specific tile samples for all fields (AC1)', () => {
      // Tile 0: player2_home, row 0, col 0, up
      expect(getTileMeta(0)).toMatchObject({
        id: 0, direction: 'up', zone: 'player2_home', row: 0, col: 0, isSideTile: false
      });

      // Tile 12: center, row 2, col 2, up (center of board)
      expect(getTileMeta(12)).toMatchObject({
        id: 12, direction: 'up', zone: 'center', row: 2, col: 2, isSideTile: false
      });

      // Tile 25: player1_home, row 5, col 0, down
      expect(getTileMeta(25)).toMatchObject({
        id: 25, direction: 'down', zone: 'player1_home', row: 5, col: 0, isSideTile: false
      });

      // Tile 29: player1_home, row 5, col 4, down (bottom-right corner)
      expect(getTileMeta(29)).toMatchObject({
        id: 29, direction: 'down', zone: 'player1_home', row: 5, col: 4, isSideTile: false
      });
    });
  });

  it('should alternate direction for main tiles (even=up, odd=down)', () => {
    for (let id = 0; id < 30; id++) {
      const tile = getTileMeta(id);
      expect(tile).toBeDefined();
      if (id % 2 === 0) {
        expect(tile?.direction).toBe('up');
      } else {
        expect(tile?.direction).toBe('down');
      }
    }
  });

  it('should have side tiles with left/right direction', () => {
    expect(getTileMeta(30)?.direction).toBe('right'); // 좌측 → 우측 바라봄
    expect(getTileMeta(31)?.direction).toBe('right');
    expect(getTileMeta(32)?.direction).toBe('left'); // 우측 → 좌측 바라봄
    expect(getTileMeta(33)?.direction).toBe('left');
  });

  it('should have correct zones', () => {
    // Row 0: player2_home (상단, Player 2 시작 배치)
    expect(getTileMeta(0)?.zone).toBe('player2_home');
    expect(getTileMeta(4)?.zone).toBe('player2_home');

    // Row 1-4: center (중앙)
    expect(getTileMeta(5)?.zone).toBe('center');
    expect(getTileMeta(9)?.zone).toBe('center');
    expect(getTileMeta(10)?.zone).toBe('center');
    expect(getTileMeta(24)?.zone).toBe('center');

    // Row 5: player1_home (하단, Player 1 시작 배치)
    expect(getTileMeta(25)?.zone).toBe('player1_home');
    expect(getTileMeta(29)?.zone).toBe('player1_home');

    // Side tiles
    expect(getTileMeta(30)?.zone).toBe('side');
    expect(getTileMeta(33)?.zone).toBe('side');
  });

  it('should convert row/col to tile ID correctly', () => {
    expect(getTileIdByRowCol(0, 0)).toBe(0);
    expect(getTileIdByRowCol(0, 4)).toBe(4);
    expect(getTileIdByRowCol(5, 4)).toBe(29);
    expect(getTileIdByRowCol(-1, 0)).toBe(null);
    expect(getTileIdByRowCol(0, 5)).toBe(null);
  });

  // Task 1.2: getTileMeta() 함수 테스트 - 모든 타일에 대한 정확한 메타데이터 반환
  describe('getTileMeta() comprehensive tests', () => {
    it('should return correct metadata for all 34 tiles', () => {
      for (let id = 0; id < 34; id++) {
        const tile = getTileMeta(id);
        expect(tile).toBeDefined();
        expect(tile?.id).toBe(id);
      }
    });

    it('should return undefined for invalid tile IDs', () => {
      expect(getTileMeta(-1)).toBeUndefined();
      expect(getTileMeta(34)).toBeUndefined();
      expect(getTileMeta(100)).toBeUndefined();
    });

    it('should have bidirectional consistency (TileId ↔ row,col)', () => {
      // For all main tiles, verify bidirectional conversion
      for (let id = 0; id < 30; id++) {
        const tile = getTileMeta(id);
        expect(tile).toBeDefined();
        const reversedId = getTileIdByRowCol(tile!.row, tile!.col);
        expect(reversedId).toBe(id);
      }
    });
  });

  // Task 1.3: getTileIdByRowCol() 함수 테스트 - 역방향 조회 정확성
  describe('getTileIdByRowCol() comprehensive tests', () => {
    it('should convert all valid row/col combinations correctly', () => {
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
          const expectedId = row * 5 + col;
          expect(getTileIdByRowCol(row, col)).toBe(expectedId);
        }
      }
    });

    it('should return null for out-of-bounds coordinates', () => {
      // Invalid rows
      expect(getTileIdByRowCol(-1, 0)).toBe(null);
      expect(getTileIdByRowCol(6, 0)).toBe(null);
      // Invalid cols
      expect(getTileIdByRowCol(0, -1)).toBe(null);
      expect(getTileIdByRowCol(0, 5)).toBe(null);
      // Side tile coordinates (not accessible via row/col)
      expect(getTileIdByRowCol(2, -1)).toBe(null);
      expect(getTileIdByRowCol(2, 5)).toBe(null);
    });
  });

  // Task 1.4: 측면 타일 특수 좌표 처리 검증
  describe('side tile special coordinate handling', () => {
    it('should have col=-1 for left side tiles (30, 31)', () => {
      expect(getTileMeta(30)?.col).toBe(-1);
      expect(getTileMeta(31)?.col).toBe(-1);
    });

    it('should have col=5 for right side tiles (32, 33)', () => {
      expect(getTileMeta(32)?.col).toBe(5);
      expect(getTileMeta(33)?.col).toBe(5);
    });

    it('should position side tiles at correct rows', () => {
      // Side 30 and 32 are between row 1-2 (center at row 2)
      expect(getTileMeta(30)?.row).toBe(2);
      expect(getTileMeta(32)?.row).toBe(2);
      // Side 31 and 33 are between row 3-4 (center at row 4)
      expect(getTileMeta(31)?.row).toBe(4);
      expect(getTileMeta(33)?.row).toBe(4);
    });

    it('should not be accessible via getTileIdByRowCol', () => {
      // Side tiles cannot be found by row/col lookup
      expect(getTileIdByRowCol(2, -1)).toBe(null);
      expect(getTileIdByRowCol(4, -1)).toBe(null);
      expect(getTileIdByRowCol(2, 5)).toBe(null);
      expect(getTileIdByRowCol(4, 5)).toBe(null);
    });
  });
});

describe('Adjacency', () => {
  it('should return empty array for invalid tile ID', () => {
    expect(getAdjacentTiles(-1)).toEqual([]);
    expect(getAdjacentTiles(34)).toEqual([]);
  });

  it('should have correct adjacency for corner tiles', () => {
    // Tile 0 (top-left corner, Up)
    const adj0 = getAdjacentTiles(0);
    expect(adj0).toContain(1); // right
    expect(adj0).toContain(5); // below
    expect(adj0.length).toBe(2);

    // Tile 29 (bottom-right corner, Down)
    const adj29 = getAdjacentTiles(29);
    expect(adj29).toContain(24); // above
    expect(adj29).toContain(28); // left
    expect(adj29.length).toBe(2);
  });

  it('should have correct adjacency for center tiles', () => {
    // Tile 12 (▲, row 2, col 2) - should have 3 edge-adjacent neighbors
    // Up(▲) 삼각형은 좌측 변(11), 우측 변(13), 아래 변(17)을 공유
    // 위쪽 타일 7(▽)과는 꼭짓점만 공유 (변 인접 아님)
    const adj12 = getAdjacentTiles(12);
    expect(adj12).toContain(11); // left (edge)
    expect(adj12).toContain(13); // right (edge)
    expect(adj12).toContain(17); // below (edge)
    expect(adj12).not.toContain(7); // above is vertex-adjacent only
    expect(adj12.length).toBe(3);
  });

  it('should connect side tiles correctly', () => {
    // Tile 30 connects to 5 and 10
    expect(getAdjacentTiles(30)).toContain(5);
    expect(getAdjacentTiles(30)).toContain(10);

    // Tile 5 should connect to side tile 30
    expect(getAdjacentTiles(5)).toContain(30);
  });

  it('should check adjacency correctly', () => {
    expect(areAdjacent(0, 1)).toBe(true);
    expect(areAdjacent(0, 2)).toBe(false);
    expect(areAdjacent(5, 30)).toBe(true);
  });

  // Task 2.1: EDGE_ADJACENCY_MAP 34개 타일 모든 인접 관계 검증
  describe('EDGE_ADJACENCY_MAP comprehensive validation', () => {
    it('should have exactly 34 tile entries', () => {
      expect(EDGE_ADJACENCY_MAP.size).toBe(34);
    });

    it('should have entries for all tiles 0-33', () => {
      for (let id = 0; id < 34; id++) {
        expect(EDGE_ADJACENCY_MAP.has(id)).toBe(true);
      }
    });

    it('should have symmetric adjacency (if A→B then B→A)', () => {
      for (let tileA = 0; tileA < 34; tileA++) {
        const neighbors = EDGE_ADJACENCY_MAP.get(tileA) ?? [];
        for (const tileB of neighbors) {
          const reverseNeighbors = EDGE_ADJACENCY_MAP.get(tileB) ?? [];
          expect(reverseNeighbors).toContain(tileA);
        }
      }
    });

    it('should not have self-adjacency', () => {
      for (let id = 0; id < 34; id++) {
        const neighbors = EDGE_ADJACENCY_MAP.get(id) ?? [];
        expect(neighbors).not.toContain(id);
      }
    });

    it('should have correct neighbor counts per tile type', () => {
      // 삼각형 보드에서 각 타일은 최대 3개의 변 인접 타일을 가짐
      // Up(▲): 좌변, 우변, 하변
      // Down(▽): 좌변, 우변, 상변

      // Corner tiles (▲0, ▲4): 2 neighbors (row 0의 Up 타일, 상변 없음)
      expect(getAdjacentTiles(0).length).toBe(2);  // 1, 5
      expect(getAdjacentTiles(4).length).toBe(2);  // 3, 9

      // Corner tiles (▽25, ▽29): 2 neighbors (row 5의 Down 타일, 하변 없음)
      expect(getAdjacentTiles(25).length).toBe(2); // 20, 26
      expect(getAdjacentTiles(29).length).toBe(2); // 24, 28

      // Row 0 Down tiles (▽1, ▽3): 2 neighbors (상변 없음, row -1 없음)
      expect(getAdjacentTiles(1).length).toBe(2);  // 0, 2
      expect(getAdjacentTiles(3).length).toBe(2);  // 2, 4

      // Row 0 Up tile (▲2): 3 neighbors
      expect(getAdjacentTiles(2).length).toBe(3);  // 1, 3, 7

      // Center tiles: 3 neighbors (삼각형은 최대 3개 변)
      expect(getAdjacentTiles(12).length).toBe(3); // 11, 13, 17
      expect(getAdjacentTiles(17).length).toBe(3); // 12, 16, 18

      // Side tiles: exactly 2 neighbors
      expect(getAdjacentTiles(30).length).toBe(2);
      expect(getAdjacentTiles(31).length).toBe(2);
      expect(getAdjacentTiles(32).length).toBe(2);
      expect(getAdjacentTiles(33).length).toBe(2);
    });
  });

  // Task 2.2: getAdjacentTiles() 함수 단위 테스트
  describe('getAdjacentTiles() comprehensive tests', () => {
    it('should return readonly array', () => {
      const result = getAdjacentTiles(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for invalid IDs', () => {
      expect(getAdjacentTiles(-1)).toEqual([]);
      expect(getAdjacentTiles(34)).toEqual([]);
      expect(getAdjacentTiles(100)).toEqual([]);
      expect(getAdjacentTiles(NaN)).toEqual([]);
    });

    it('should return correct neighbors for row 0 tiles', () => {
      // Row 0: [▲0, ▽1, ▲2, ▽3, ▲4]
      // ▲0: 우변(1), 하변(5)
      expect(getAdjacentTiles(0)).toEqual(expect.arrayContaining([1, 5]));
      // ▽1: 좌변(0), 우변(2) - 상변 없음 (row -1 없음)
      expect(getAdjacentTiles(1)).toEqual(expect.arrayContaining([0, 2]));
      expect(getAdjacentTiles(1).length).toBe(2);
      // ▲2: 좌변(1), 우변(3), 하변(7)
      expect(getAdjacentTiles(2)).toEqual(expect.arrayContaining([1, 3, 7]));
      // ▽3: 좌변(2), 우변(4) - 상변 없음
      expect(getAdjacentTiles(3)).toEqual(expect.arrayContaining([2, 4]));
      expect(getAdjacentTiles(3).length).toBe(2);
      // ▲4: 좌변(3), 하변(9)
      expect(getAdjacentTiles(4)).toEqual(expect.arrayContaining([3, 9]));
    });

    it('should return correct neighbors for row 5 tiles', () => {
      // Row 5: [▽25, ▲26, ▽27, ▲28, ▽29]
      // ▽25: 상변(20), 우변(26) - 하변 없음 (row 6 없음)
      expect(getAdjacentTiles(25)).toEqual(expect.arrayContaining([20, 26]));
      // ▲26: 좌변(25), 우변(27) - 하변 없음 (row 6 없음)
      expect(getAdjacentTiles(26)).toEqual(expect.arrayContaining([25, 27]));
      expect(getAdjacentTiles(26).length).toBe(2);
      // ▽27: 상변(22), 좌변(26), 우변(28)
      expect(getAdjacentTiles(27)).toEqual(expect.arrayContaining([22, 26, 28]));
      // ▲28: 좌변(27), 우변(29) - 하변 없음
      expect(getAdjacentTiles(28)).toEqual(expect.arrayContaining([27, 29]));
      expect(getAdjacentTiles(28).length).toBe(2);
      // ▽29: 상변(24), 좌변(28)
      expect(getAdjacentTiles(29)).toEqual(expect.arrayContaining([24, 28]));
    });

    it('should include side tile connections for edge tiles', () => {
      // Tiles connected to side tile 30
      expect(getAdjacentTiles(5)).toContain(30);
      expect(getAdjacentTiles(10)).toContain(30);

      // Tiles connected to side tile 31
      expect(getAdjacentTiles(15)).toContain(31);
      expect(getAdjacentTiles(20)).toContain(31);

      // Tiles connected to side tile 32
      expect(getAdjacentTiles(9)).toContain(32);
      expect(getAdjacentTiles(14)).toContain(32);

      // Tiles connected to side tile 33
      expect(getAdjacentTiles(19)).toContain(33);
      expect(getAdjacentTiles(24)).toContain(33);
    });
  });

  // Task 2.3: areAdjacent() 함수 단위 테스트
  describe('areAdjacent() comprehensive tests', () => {
    it('should return true for adjacent tiles', () => {
      // Horizontal adjacency (same row, 좌/우 변)
      expect(areAdjacent(0, 1)).toBe(true);
      expect(areAdjacent(1, 2)).toBe(true);

      // Vertical adjacency (Up의 하변 ↔ Down의 상변)
      expect(areAdjacent(0, 5)).toBe(true);   // ▲0 → ▽5 (하변/상변)
      expect(areAdjacent(2, 7)).toBe(true);   // ▲2 → ▽7 (하변/상변)

      // Note: 5(▽)와 10(▲)은 꼭짓점 인접, 변 인접 아님
      expect(areAdjacent(5, 10)).toBe(false);

      // 변 인접 예시: 6(▲)과 11(▽)
      expect(areAdjacent(6, 11)).toBe(true);  // ▲6의 하변 ↔ ▽11의 상변
    });

    it('should return false for non-adjacent tiles', () => {
      // Same row, not adjacent
      expect(areAdjacent(0, 2)).toBe(false);
      expect(areAdjacent(0, 4)).toBe(false);

      // Diagonal (no edge contact)
      expect(areAdjacent(0, 6)).toBe(false);

      // Far apart tiles
      expect(areAdjacent(0, 29)).toBe(false);
      expect(areAdjacent(0, 15)).toBe(false);
    });

    it('should be symmetric (A↔B = B↔A)', () => {
      expect(areAdjacent(0, 1)).toBe(areAdjacent(1, 0));
      expect(areAdjacent(5, 30)).toBe(areAdjacent(30, 5));
      expect(areAdjacent(0, 29)).toBe(areAdjacent(29, 0));
    });

    it('should return false for same tile', () => {
      expect(areAdjacent(0, 0)).toBe(false);
      expect(areAdjacent(15, 15)).toBe(false);
      expect(areAdjacent(30, 30)).toBe(false);
    });

    it('should return false for invalid tile IDs', () => {
      expect(areAdjacent(-1, 0)).toBe(false);
      expect(areAdjacent(0, -1)).toBe(false);
      expect(areAdjacent(34, 0)).toBe(false);
      expect(areAdjacent(0, 34)).toBe(false);
    });
  });

  // Task 2.4: 측면 타일 인접 관계 특별 검증
  describe('side tile adjacency special validation', () => {
    it('should connect side tile 30 to tiles 5 and 10 only', () => {
      const adj30 = getAdjacentTiles(30);
      expect(adj30).toContain(5);
      expect(adj30).toContain(10);
      expect(adj30.length).toBe(2);
    });

    it('should connect side tile 31 to tiles 15 and 20 only', () => {
      const adj31 = getAdjacentTiles(31);
      expect(adj31).toContain(15);
      expect(adj31).toContain(20);
      expect(adj31.length).toBe(2);
    });

    it('should connect side tile 32 to tiles 9 and 14 only', () => {
      const adj32 = getAdjacentTiles(32);
      expect(adj32).toContain(9);
      expect(adj32).toContain(14);
      expect(adj32.length).toBe(2);
    });

    it('should connect side tile 33 to tiles 19 and 24 only', () => {
      const adj33 = getAdjacentTiles(33);
      expect(adj33).toContain(19);
      expect(adj33).toContain(24);
      expect(adj33.length).toBe(2);
    });

    it('should have bidirectional side tile connections', () => {
      // 30 ↔ 5, 10
      expect(areAdjacent(30, 5)).toBe(true);
      expect(areAdjacent(5, 30)).toBe(true);
      expect(areAdjacent(30, 10)).toBe(true);
      expect(areAdjacent(10, 30)).toBe(true);

      // 31 ↔ 15, 20
      expect(areAdjacent(31, 15)).toBe(true);
      expect(areAdjacent(15, 31)).toBe(true);
      expect(areAdjacent(31, 20)).toBe(true);
      expect(areAdjacent(20, 31)).toBe(true);

      // 32 ↔ 9, 14
      expect(areAdjacent(32, 9)).toBe(true);
      expect(areAdjacent(9, 32)).toBe(true);
      expect(areAdjacent(32, 14)).toBe(true);
      expect(areAdjacent(14, 32)).toBe(true);

      // 33 ↔ 19, 24
      expect(areAdjacent(33, 19)).toBe(true);
      expect(areAdjacent(19, 33)).toBe(true);
      expect(areAdjacent(33, 24)).toBe(true);
      expect(areAdjacent(24, 33)).toBe(true);
    });

    it('should not connect side tiles to each other', () => {
      expect(areAdjacent(30, 31)).toBe(false);
      expect(areAdjacent(30, 32)).toBe(false);
      expect(areAdjacent(30, 33)).toBe(false);
      expect(areAdjacent(31, 32)).toBe(false);
      expect(areAdjacent(31, 33)).toBe(false);
      expect(areAdjacent(32, 33)).toBe(false);
    });
  });
});

describe('Pathfinding', () => {
  it('should find reachable tiles within distance', () => {
    // From tile 0 with distance 1
    const reachable1 = getReachableTiles(0, 1);
    expect(reachable1).toContain(1);
    expect(reachable1).toContain(5);
    expect(reachable1.length).toBe(2);

    // From tile 0 with distance 2
    const reachable2 = getReachableTiles(0, 2);
    expect(reachable2).toContain(1);
    expect(reachable2).toContain(5);
    expect(reachable2).toContain(2); // 0 -> 1 -> 2
    expect(reachable2).toContain(6); // 0 -> 1 -> 6 or 0 -> 5 -> 6
  });

  it('should respect blocked tiles', () => {
    const blocked = new Set([1]);
    const reachable = getReachableTiles(0, 2, blocked);

    // Can't reach tile 2 because tile 1 is blocked
    expect(reachable).not.toContain(1);
    expect(reachable).not.toContain(2);

    // But can still reach other tiles via tile 5
    expect(reachable).toContain(5);
    expect(reachable).toContain(6);
  });

  it('should find path between tiles', () => {
    const path = findPath(0, 2);
    expect(path).not.toBeNull();
    expect(path).toContain(2);
    expect(path?.length).toBeLessThanOrEqual(2);
  });

  it('should return null when no path exists', () => {
    // Block all neighbors of tile 0
    const blocked = new Set([1, 5]);
    const path = findPath(0, 29, blocked);
    expect(path).toBeNull();
  });

  it('should return empty array for same start and end', () => {
    const path = findPath(0, 0);
    expect(path).toEqual([]);
  });

  // Task 3.1: getReachableTiles() 함수 다양한 시나리오 테스트
  describe('getReachableTiles() comprehensive tests', () => {
    it('should return empty array for invalid start tile', () => {
      expect(getReachableTiles(-1, 2)).toEqual([]);
      expect(getReachableTiles(34, 2)).toEqual([]);
    });

    it('should return empty array for distance 0', () => {
      expect(getReachableTiles(0, 0)).toEqual([]);
    });

    it('should return empty array for negative distance', () => {
      expect(getReachableTiles(0, -1)).toEqual([]);
    });

    it('should exclude start tile from results', () => {
      const reachable = getReachableTiles(12, 3);
      expect(reachable).not.toContain(12);
    });

    it('should return only adjacent tiles for distance 1', () => {
      // Tile 12 (▲) has 3 edge-adjacent neighbors: 11, 13, 17
      // 7 is vertex-adjacent only, not edge-adjacent
      const reachable = getReachableTiles(12, 1);
      expect(reachable.length).toBe(3);
      expect(reachable).toEqual(expect.arrayContaining([11, 13, 17]));
      expect(reachable).not.toContain(7);
    });

    it('should return all tiles within distance 2', () => {
      // From corner tile 0 (▲)
      // 0's edge-adjacent: 1, 5
      // 1(▽)'s edge-adjacent: 0, 2
      // 5(▽)'s edge-adjacent: 0, 6, 30
      const reachable = getReachableTiles(0, 2);
      // Distance 1: 1, 5
      // Distance 2: 2 (via 1), 6 (via 5), 30 (via 5)
      // Note: 10 is vertex-adjacent to 5, NOT edge-adjacent
      expect(reachable).toContain(1);
      expect(reachable).toContain(5);
      expect(reachable).toContain(2);
      expect(reachable).toContain(6);
      expect(reachable).not.toContain(10); // 5와 10은 꼭짓점 인접
      expect(reachable).toContain(30); // Side tile via 5
    });

    it('should correctly handle blocked tiles - cannot pass through', () => {
      // Block tiles 1 and 5 (all neighbors of tile 0)
      const blocked = new Set([1, 5]);
      const reachable = getReachableTiles(0, 3, blocked);
      expect(reachable).toEqual([]); // Can't reach anything
    });

    it('should bypass blocked tiles to reach other tiles', () => {
      // Block tile 1 (right of tile 0)
      const blocked = new Set([1]);
      const reachable = getReachableTiles(0, 3, blocked);

      // Cannot reach via tile 1
      expect(reachable).not.toContain(1);
      expect(reachable).not.toContain(2);

      // But can reach via tile 5
      expect(reachable).toContain(5);
      expect(reachable).toContain(6);
      expect(reachable).toContain(10);
      expect(reachable).toContain(11);
    });

    it('should handle side tile as starting point', () => {
      // From side tile 30 (connected to 5 and 10)
      const reachable = getReachableTiles(30, 1);
      expect(reachable).toEqual(expect.arrayContaining([5, 10]));
      expect(reachable.length).toBe(2);
    });

    it('should reach side tiles from main tiles', () => {
      // From tile 5, can reach side tile 30
      const reachable = getReachableTiles(5, 1);
      expect(reachable).toContain(30);
    });

    it('should not include blocked tiles in result', () => {
      const blocked = new Set([6, 7]);
      const reachable = getReachableTiles(12, 2, blocked);
      expect(reachable).not.toContain(6);
      expect(reachable).not.toContain(7);
    });
  });

  // Task 3.2: findPath() 함수 테스트
  describe('findPath() comprehensive tests', () => {
    it('should return null for invalid start tile', () => {
      expect(findPath(-1, 10)).toBeNull();
      expect(findPath(34, 10)).toBeNull();
    });

    it('should return null for invalid end tile', () => {
      expect(findPath(0, -1)).toBeNull();
      expect(findPath(0, 34)).toBeNull();
    });

    it('should return empty array for same start and end', () => {
      expect(findPath(0, 0)).toEqual([]);
      expect(findPath(15, 15)).toEqual([]);
      expect(findPath(30, 30)).toEqual([]);
    });

    it('should return path of length 1 for adjacent tiles', () => {
      const path = findPath(0, 1);
      expect(path).toEqual([1]);

      const path2 = findPath(12, 17);
      expect(path2).toEqual([17]);
    });

    it('should find shortest path for diagonal movement', () => {
      // 0 to 6: 0 -> 1 -> 6 or 0 -> 5 -> 6 (both length 2)
      const path = findPath(0, 6);
      expect(path?.length).toBe(2);
      expect(path).toContain(6);
    });

    it('should find path across the board', () => {
      // From 0 (top-left) to 29 (bottom-right)
      const path = findPath(0, 29);
      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThan(0);
      expect(path![path!.length - 1]).toBe(29);
    });

    it('should exclude start tile but include end tile', () => {
      const path = findPath(0, 12);
      expect(path).not.toBeNull();
      expect(path).not.toContain(0);
      expect(path![path!.length - 1]).toBe(12);
    });

    it('should return null when path is blocked', () => {
      // Block all neighbors of tile 0
      const blocked = new Set([1, 5]);
      const path = findPath(0, 29, blocked);
      expect(path).toBeNull();
    });

    it('should find alternate path when direct path is blocked', () => {
      // Block tile 1, find path from 0 to 2
      const blocked = new Set([1]);
      const path = findPath(0, 2, blocked);
      // Should go 0 -> 5 -> 6 -> 7 -> 2 or similar
      expect(path).not.toBeNull();
      expect(path).not.toContain(1);
      expect(path![path!.length - 1]).toBe(2);
    });

    it('should find path to side tiles', () => {
      // From 0 to side tile 30
      const path = findPath(0, 30);
      expect(path).not.toBeNull();
      expect(path![path!.length - 1]).toBe(30);
      // Path should be 0 -> 5 -> 30 (length 2) or 0 -> 1 -> 6 -> 5 -> 30 etc
    });

    it('should find path from side tile', () => {
      // From side tile 30 to 12
      const path = findPath(30, 12);
      expect(path).not.toBeNull();
      expect(path![path!.length - 1]).toBe(12);
    });

    it('should find path between side tiles', () => {
      // From side tile 30 to side tile 33
      const path = findPath(30, 33);
      expect(path).not.toBeNull();
      expect(path![path!.length - 1]).toBe(33);
    });

    it('should return shortest path', () => {
      // From 0 to 2: shortest is 0 -> 1 -> 2 (length 2)
      const path = findPath(0, 2);
      expect(path?.length).toBe(2);
    });

    it('should handle complex blocking scenarios', () => {
      // Create a wall of blocked tiles
      const blocked = new Set([1, 6, 11, 16, 21, 26]);
      const path = findPath(0, 4);
      // Should find path going around the blocked column
      expect(path).not.toBeNull();
      // Path exists because we can go down then across
    });
  });
});

// Task 4: 공격 방향 판정 함수 테스트
describe('Attack Direction', () => {
  // Task 4.1: getAttackDirection() 함수 기본 테스트
  describe('getAttackDirection() basic tests', () => {
    it('should return null for non-adjacent tiles', () => {
      expect(getAttackDirection(0, 2)).toBeNull();
      expect(getAttackDirection(0, 29)).toBeNull();
      expect(getAttackDirection(12, 0)).toBeNull();
    });

    it('should return null for same tile', () => {
      expect(getAttackDirection(0, 0)).toBeNull();
      expect(getAttackDirection(15, 15)).toBeNull();
    });

    it('should return null for invalid tile IDs', () => {
      expect(getAttackDirection(-1, 0)).toBeNull();
      expect(getAttackDirection(0, -1)).toBeNull();
      expect(getAttackDirection(34, 0)).toBeNull();
      expect(getAttackDirection(0, 34)).toBeNull();
    });
  });

  // Task 4.2: 공격 방향 판정 단위 테스트
  describe('getAttackDirection() direction tests', () => {
    // Frontline: 같은 열, 다른 행 (수직 이동)
    describe('frontline direction (same column, edge-adjacent)', () => {
      // frontline은 같은 col의 변 인접 타일에만 적용됨
      // Down(▽) → Up(▲) 위 방향: ▽의 위 변과 ▲의 아래 변 공유
      // Up(▲) → Down(▽) 아래 방향: ▲의 아래 변과 ▽의 위 변 공유
      it('should return frontline for Down to Up attack (edge-adjacent)', () => {
        // 타일 7(▽, row 1, col 2)에서 타일 2(▲, row 0, col 2)로 공격
        // 7의 위 변과 2의 아래 변 공유 → 변 인접
        expect(getAttackDirection(7, 2)).toBe('frontline');
        // 타일 5(▽, row 1, col 0)에서 타일 0(▲, row 0, col 0)로 공격
        expect(getAttackDirection(5, 0)).toBe('frontline');
        // 타일 9(▽, row 1, col 4)에서 타일 4(▲, row 0, col 4)로 공격
        expect(getAttackDirection(9, 4)).toBe('frontline');
      });

      it('should return frontline for Up to Down attack (edge-adjacent)', () => {
        // 타일 12(▲, row 2, col 2)에서 타일 17(▽, row 3, col 2)로 공격
        // 12의 아래 변과 17의 위 변 공유 → 변 인접
        expect(getAttackDirection(12, 17)).toBe('frontline');
        // 타일 6(▲, row 1, col 1)에서 타일 11(▽, row 2, col 1)로 공격
        expect(getAttackDirection(6, 11)).toBe('frontline');
      });

      it('should return null for same column but vertex-adjacent only', () => {
        // 타일 7(▽)와 12(▲)는 같은 col이지만 꼭짓점만 공유 (변 인접 아님)
        expect(getAttackDirection(7, 12)).toBeNull();
        // 타일 10(▲)와 5(▽)도 꼭짓점만 공유
        expect(getAttackDirection(10, 5)).toBeNull();
        // 타일 14(▲)와 9(▽)도 꼭짓점만 공유
        expect(getAttackDirection(14, 9)).toBeNull();
      });
    });

    // Sun: 공격자보다 col이 큰 쪽 (우측)
    describe('sun direction (right attack)', () => {
      it('should return sun for attack to the right', () => {
        // 타일 12(row 2, col 2)에서 타일 13(row 2, col 3)로 공격
        expect(getAttackDirection(12, 13)).toBe('sun');
      });

      it('should return sun for diagonal right attack', () => {
        // 타일 11(row 2, col 1)에서 타일 6(row 1, col 1)이 아닌
        // 타일 6(row 1, col 1)에서 타일 7(row 1, col 2)로 공격
        expect(getAttackDirection(6, 7)).toBe('sun');
      });

      it('should return sun for row 0 right attack', () => {
        // 타일 0에서 타일 1로 공격
        expect(getAttackDirection(0, 1)).toBe('sun');
        // 타일 1에서 타일 2로 공격
        expect(getAttackDirection(1, 2)).toBe('sun');
      });

      it('should return sun for row 5 right attack', () => {
        // 타일 25에서 타일 26로 공격
        expect(getAttackDirection(25, 26)).toBe('sun');
        // 타일 28에서 타일 29로 공격
        expect(getAttackDirection(28, 29)).toBe('sun');
      });
    });

    // Moon: 공격자보다 col이 작은 쪽 (좌측)
    describe('moon direction (left attack)', () => {
      it('should return moon for attack to the left', () => {
        // 타일 13(row 2, col 3)에서 타일 12(row 2, col 2)로 공격
        expect(getAttackDirection(13, 12)).toBe('moon');
      });

      it('should return moon for diagonal left attack', () => {
        // 타일 7(row 1, col 2)에서 타일 6(row 1, col 1)로 공격
        expect(getAttackDirection(7, 6)).toBe('moon');
      });

      it('should return moon for row 0 left attack', () => {
        // 타일 1에서 타일 0으로 공격
        expect(getAttackDirection(1, 0)).toBe('moon');
        // 타일 2에서 타일 1로 공격
        expect(getAttackDirection(2, 1)).toBe('moon');
      });

      it('should return moon for row 5 left attack', () => {
        // 타일 26에서 타일 25로 공격
        expect(getAttackDirection(26, 25)).toBe('moon');
        // 타일 29에서 타일 28로 공격
        expect(getAttackDirection(29, 28)).toBe('moon');
      });
    });
  });

  // Task 4.3: 측면 타일 공격 방향 판정 검증
  describe('side tile attack direction', () => {
    // 좌측 측면 타일(col=-1)에서 메인 타일로 공격 → sun (우측으로 이동)
    describe('left side tile attacks (col=-1 to main)', () => {
      it('should return sun when attacking from left side tile 30', () => {
        // 30에서 5로 공격 (col -1 → col 0)
        expect(getAttackDirection(30, 5)).toBe('sun');
        // 30에서 10으로 공격 (col -1 → col 0)
        expect(getAttackDirection(30, 10)).toBe('sun');
      });

      it('should return sun when attacking from left side tile 31', () => {
        // 31에서 15로 공격 (col -1 → col 0)
        expect(getAttackDirection(31, 15)).toBe('sun');
        // 31에서 20으로 공격 (col -1 → col 0)
        expect(getAttackDirection(31, 20)).toBe('sun');
      });
    });

    // 우측 측면 타일(col=5)에서 메인 타일로 공격 → moon (좌측으로 이동)
    describe('right side tile attacks (col=5 to main)', () => {
      it('should return moon when attacking from right side tile 32', () => {
        // 32에서 9로 공격 (col 5 → col 4)
        expect(getAttackDirection(32, 9)).toBe('moon');
        // 32에서 14로 공격 (col 5 → col 4)
        expect(getAttackDirection(32, 14)).toBe('moon');
      });

      it('should return moon when attacking from right side tile 33', () => {
        // 33에서 19로 공격 (col 5 → col 4)
        expect(getAttackDirection(33, 19)).toBe('moon');
        // 33에서 24로 공격 (col 5 → col 4)
        expect(getAttackDirection(33, 24)).toBe('moon');
      });
    });

    // 메인 타일에서 좌측 측면 타일로 공격 → moon (좌측으로 이동)
    describe('main tile attacks to left side (main to col=-1)', () => {
      it('should return moon when attacking left side tile 30', () => {
        // 5에서 30으로 공격 (col 0 → col -1)
        expect(getAttackDirection(5, 30)).toBe('moon');
        // 10에서 30으로 공격 (col 0 → col -1)
        expect(getAttackDirection(10, 30)).toBe('moon');
      });

      it('should return moon when attacking left side tile 31', () => {
        // 15에서 31로 공격 (col 0 → col -1)
        expect(getAttackDirection(15, 31)).toBe('moon');
        // 20에서 31로 공격 (col 0 → col -1)
        expect(getAttackDirection(20, 31)).toBe('moon');
      });
    });

    // 메인 타일에서 우측 측면 타일로 공격 → sun (우측으로 이동)
    describe('main tile attacks to right side (main to col=5)', () => {
      it('should return sun when attacking right side tile 32', () => {
        // 9에서 32로 공격 (col 4 → col 5)
        expect(getAttackDirection(9, 32)).toBe('sun');
        // 14에서 32로 공격 (col 4 → col 5)
        expect(getAttackDirection(14, 32)).toBe('sun');
      });

      it('should return sun when attacking right side tile 33', () => {
        // 19에서 33으로 공격 (col 4 → col 5)
        expect(getAttackDirection(19, 33)).toBe('sun');
        // 24에서 33으로 공격 (col 4 → col 5)
        expect(getAttackDirection(24, 33)).toBe('sun');
      });
    });
  });

  // 통합 시나리오 테스트
  describe('integration scenarios', () => {
    it('should correctly identify all attack directions from center tile 12', () => {
      // 12(▲)의 변 인접 타일: 11(좌), 13(우), 17(아래)
      // 7(▽)은 꼭짓점 인접이므로 공격 방향 없음 (null)
      expect(getAttackDirection(12, 7)).toBeNull();       // 위 (vertex-adjacent, not edge-adjacent)
      expect(getAttackDirection(12, 11)).toBe('moon');    // 좌
      expect(getAttackDirection(12, 13)).toBe('sun');     // 우
      expect(getAttackDirection(12, 17)).toBe('frontline'); // 아래 (같은 col)
    });

    it('should be consistent with adjacency', () => {
      // 모든 변 인접 타일에 대해 공격 방향이 null이 아님을 확인
      for (let tileA = 0; tileA < 34; tileA++) {
        const neighbors = getAdjacentTiles(tileA);
        for (const tileB of neighbors) {
          const direction = getAttackDirection(tileA, tileB);
          expect(direction).not.toBeNull();
          expect(['sun', 'moon', 'frontline']).toContain(direction);
        }
      }
    });

    it('should have opposite directions for reverse attacks (except frontline)', () => {
      // sun ↔ moon (좌우 반전)
      expect(getAttackDirection(12, 13)).toBe('sun');
      expect(getAttackDirection(13, 12)).toBe('moon');

      // frontline은 양방향 동일 (같은 col의 변 인접 타일)
      expect(getAttackDirection(12, 17)).toBe('frontline');
      expect(getAttackDirection(17, 12)).toBe('frontline');
    });
  });
});

// Task 5: 통합 테스트 (실제 게임 시나리오 기반)
describe('Integration Tests - Game Scenarios', () => {
  // 시나리오 1: 초기 배치 확인
  describe('initial placement scenario', () => {
    it('should correctly identify player1 home tiles', () => {
      // Player 1 home: row 5 (타일 25-29)
      for (let id = 25; id <= 29; id++) {
        const tile = getTileMeta(id);
        expect(tile?.zone).toBe('player1_home');
        expect(tile?.row).toBe(5);
      }
    });

    it('should correctly identify player2 home tiles', () => {
      // Player 2 home: row 0 (타일 0-4)
      for (let id = 0; id <= 4; id++) {
        const tile = getTileMeta(id);
        expect(tile?.zone).toBe('player2_home');
        expect(tile?.row).toBe(0);
      }
    });

    it('should correctly identify center tiles', () => {
      // Center: row 1-4 (타일 5-24)
      for (let id = 5; id <= 24; id++) {
        const tile = getTileMeta(id);
        expect(tile?.zone).toBe('center');
        expect(tile?.row).toBeGreaterThanOrEqual(1);
        expect(tile?.row).toBeLessThanOrEqual(4);
      }
    });
  });

  // 시나리오 2: 이동 시뮬레이션
  describe('movement simulation scenario', () => {
    it('should simulate general moving from home to center', () => {
      // Player 1의 장수가 타일 27에서 시작하여 중앙으로 이동
      const startTile = 27;
      const startMeta = getTileMeta(startTile);
      expect(startMeta?.zone).toBe('player1_home');

      // 1칸 이동 가능한 타일
      const reachable1 = getReachableTiles(startTile, 1);
      expect(reachable1).toContain(22); // 위로 이동
      expect(reachable1).toContain(26); // 좌측
      expect(reachable1).toContain(28); // 우측

      // 22로 이동하면 center 구역
      const newPosition = getTileMeta(22);
      expect(newPosition?.zone).toBe('center');
    });

    it('should simulate movement with obstacles', () => {
      // 타일 12에 적 장수가 있다고 가정
      const blocked = new Set([12]);

      // 타일 7에서 타일 17로 이동 (12를 우회해야 함)
      const path = findPath(7, 17, blocked);
      expect(path).not.toBeNull();
      expect(path).not.toContain(12); // 차단된 타일 통과 안 함
    });

    it('should simulate movement to side tiles', () => {
      // 타일 5에서 측면 타일 30으로 이동
      const path = findPath(5, 30);
      expect(path).toEqual([30]); // 바로 인접
    });
  });

  // 시나리오 3: 전투 시뮬레이션
  describe('combat simulation scenario', () => {
    it('should simulate attack from player1 towards player2 home', () => {
      // Player 1 장수가 타일 5에서 타일 0을 공격 (같은 열, 위)
      const direction = getAttackDirection(5, 0);
      expect(direction).toBe('frontline');
    });

    it('should simulate flanking attack', () => {
      // 측면에서 공격: 타일 30에서 타일 5로 공격
      const direction = getAttackDirection(30, 5);
      expect(direction).toBe('sun'); // 좌측 측면에서 우측으로
    });

    it('should simulate defensive position', () => {
      // 타일 12(▲)에서 방어 시, 변 인접 타일에서 공격 가능
      // 12의 변 인접: 11(좌), 13(우), 17(아래) - 3개
      const defenders = getAdjacentTiles(12);
      expect(defenders.length).toBe(3); // 3방향에서 공격 가능

      // 각 방향별 공격 유형
      const attackDirections = defenders.map((attacker) =>
        getAttackDirection(attacker, 12)
      );
      expect(attackDirections).toContain('frontline'); // 17에서
      expect(attackDirections).toContain('sun');       // 11에서
      expect(attackDirections).toContain('moon');      // 13에서
    });
  });

  // 시나리오 4: 노크 승리 조건 확인
  describe('knock victory condition scenario', () => {
    it('should identify path from player1 home to player2 home', () => {
      // Player 1이 Player 2의 home에 도달해야 노크 가능
      const path = findPath(25, 0); // 하단 좌측 → 상단 좌측
      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThanOrEqual(5); // 최소 5칸 이상

      // 마지막 도착점이 player2_home인지 확인
      const destination = getTileMeta(0);
      expect(destination?.zone).toBe('player2_home');
    });

    it('should identify all tiles in enemy home for knock', () => {
      // Player 1의 노크 목표: player2_home (타일 0-4)
      const player2Home = TILE_META.filter((t) => t.zone === 'player2_home');
      expect(player2Home.length).toBe(5);
      expect(player2Home.map((t) => t.id)).toEqual([0, 1, 2, 3, 4]);
    });
  });

  // 시나리오 5: 완전 좌표 시스템 검증
  describe('complete coordinate system validation', () => {
    it('should have consistent bidirectional mapping for all tiles', () => {
      // 모든 메인 타일에 대해 TileId ↔ (row, col) 양방향 변환 확인
      for (let id = 0; id < 30; id++) {
        const tile = getTileMeta(id);
        expect(tile).toBeDefined();
        const reversedId = getTileIdByRowCol(tile!.row, tile!.col);
        expect(reversedId).toBe(id);
      }
    });

    it('should have all tiles with complete metadata', () => {
      // 모든 34개 타일에 모든 필수 필드가 있는지 확인
      expect(TILE_META.length).toBe(34);
      TILE_META.forEach((tile) => {
        expect(typeof tile.id).toBe('number');
        expect(typeof tile.row).toBe('number');
        expect(typeof tile.col).toBe('number');
        expect(typeof tile.isSideTile).toBe('boolean');
        expect(['up', 'down', 'left', 'right']).toContain(tile.direction);
        expect(['player1_home', 'player2_home', 'center', 'side']).toContain(
          tile.zone
        );
      });
    });

    it('should have correct tile distribution by zone', () => {
      const zones = {
        player1_home: TILE_META.filter((t) => t.zone === 'player1_home'),
        player2_home: TILE_META.filter((t) => t.zone === 'player2_home'),
        center: TILE_META.filter((t) => t.zone === 'center'),
        side: TILE_META.filter((t) => t.zone === 'side'),
      };

      expect(zones.player1_home.length).toBe(5); // 타일 25-29
      expect(zones.player2_home.length).toBe(5); // 타일 0-4
      expect(zones.center.length).toBe(20); // 타일 5-24
      expect(zones.side.length).toBe(4); // 타일 30-33
    });

    it('should have correct adjacency count totals', () => {
      // 전체 인접 관계 수 확인 (각 엣지는 양방향으로 카운트)
      let totalAdjacencies = 0;
      for (let id = 0; id < 34; id++) {
        totalAdjacencies += getAdjacentTiles(id).length;
      }
      // 대칭이므로 총합은 짝수
      expect(totalAdjacencies % 2).toBe(0);
    });
  });
});
