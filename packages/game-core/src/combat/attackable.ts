/**
 * 공격 가능 타일 계산
 *
 * Story 4-1: 인접 공격 (Adjacent Attack)
 */

import type { TileId } from '../board/types';
import { getAdjacentTiles } from '../board/adjacency';
import type { GeneralId } from '../generals/types';
import type { GameState } from '../state/types';

/**
 * 공격 가능한 타일 목록 반환
 *
 * 선택된 장수의 인접 타일(변 인접) 중 적 장수가 있는 타일을 반환합니다.
 *
 * @param state - 현재 게임 상태
 * @param generalId - 공격자 장수 ID
 * @returns 공격 가능한 타일 ID 배열
 */
export function getAttackableTiles(
  state: GameState,
  generalId: GeneralId
): TileId[] {
  const attacker = state.generals.find(g => g.id === generalId);

  // 공격자가 없거나 위치가 없으면 빈 배열
  if (!attacker || attacker.position === null) {
    return [];
  }

  const attackerPlayerId = attacker.owner;
  const adjacentTiles = getAdjacentTiles(attacker.position);

  // 인접 타일 중 적 장수(active 상태)가 있는 타일 필터링
  return adjacentTiles.filter(tileId => {
    const generalOnTile = state.generals.find(
      g =>
        g.position === tileId &&
        g.owner !== attackerPlayerId &&
        g.status === 'active'
    );
    return generalOnTile !== undefined;
  });
}
