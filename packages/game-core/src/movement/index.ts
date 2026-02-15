/**
 * Movement System
 *
 * 장수 이동 가능 타일 계산 로직
 * Story 3-1: 이동 가능 타일 표시
 * Story 3-2: 장수 이동
 */

import { getReachableTiles } from '../board/adjacency';
import type { TileId } from '../board/types';
import type { GeneralId } from '../generals/types';
import type { GameState } from '../state/types';

// Re-export action functions
export {
  moveGeneral,
  canPerformAction,
  updateGeneralPosition,
} from './actions';

/**
 * 게임 상태에서 모든 장수가 점유한 타일 ID 집합 반환
 *
 * @param state - 현재 게임 상태
 * @returns 점유된 타일 ID Set
 */
export function getOccupiedTiles(state: GameState): Set<TileId> {
  const occupied = new Set<TileId>();
  for (const general of state.generals) {
    if (general.position !== null && general.status === 'active') {
      occupied.add(general.position);
    }
  }
  return occupied;
}

/**
 * 특정 장수의 이동 가능 타일 계산
 *
 * @param state - 현재 게임 상태
 * @param generalId - 이동할 장수 ID
 * @returns 이동 가능한 타일 ID 배열 (빈 배열 = 이동 불가)
 */
export function getMovableTilesForGeneral(
  state: GameState,
  generalId: GeneralId
): TileId[] {
  const general = state.generals.find((g) => g.id === generalId);

  // 장수를 찾을 수 없거나 위치가 없으면 빈 배열
  if (!general || general.position === null) {
    return [];
  }

  // active 또는 engaged 상태가 아니면 이동 불가
  // engaged 장수의 이동 = 이탈 (moveGeneral에서 이탈 페널티 처리)
  if (general.status !== 'active' && general.status !== 'engaged') {
    return [];
  }

  // 차단된 타일 = 모든 장수 위치 (자기 자신 제외)
  const blocked = getOccupiedTiles(state);
  blocked.delete(general.position); // 자기 위치는 차단에서 제외

  // BFS로 이동 가능 타일 계산
  return getReachableTiles(general.position, general.stats.speed, blocked);
}
