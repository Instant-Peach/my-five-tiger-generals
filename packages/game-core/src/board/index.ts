/**
 * Board 모듈 공개 API
 */

// 타입
export type {
  TileId,
  TileDirection,
  SideDirection,
  TileOrientation,
  TileZone,
  TileMeta,
  AttackDirection,
  MoveDirection,
} from './types';

// 메타데이터
export { TILE_META, getTileMeta, getTileIdByRowCol } from './tileMeta';

// 인접 관계
export {
  EDGE_ADJACENCY_MAP,
  VERTEX_ADJACENCY_MAP,
  getAdjacentTiles,
  getVertexAdjacentTiles,
  areAdjacent,
  areVertexAdjacent,
  getReachableTiles,
  findPath,
} from './adjacency';

// 방향 판정
export { getAttackDirection } from './direction';
