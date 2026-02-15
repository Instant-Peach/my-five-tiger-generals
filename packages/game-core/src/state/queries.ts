/**
 * 게임 상태 조회 함수
 *
 * 게임 상태에서 필요한 정보를 조회하는 순수 함수들입니다.
 */

import type { TileId } from '../board/types';
import type { General, GeneralId, PlayerId } from '../generals/types';
import { getMaxTroops } from '../generals/troops';
import type { GameState } from './types';

/**
 * 특정 타일에 있는 장수 조회
 *
 * @param state - 게임 상태
 * @param tileId - 타일 ID
 * @returns 해당 타일의 활성 장수, 없으면 undefined
 */
export function getGeneralAtTile(
  state: GameState,
  tileId: TileId
): General | undefined {
  return state.generals.find(
    (g) => g.position === tileId && (g.status === 'active' || g.status === 'engaged')
  );
}

/**
 * ID로 장수 조회
 *
 * @param state - 게임 상태
 * @param generalId - 장수 ID
 * @returns 해당 ID의 장수, 없으면 undefined
 */
export function getGeneralById(
  state: GameState,
  generalId: GeneralId
): General | undefined {
  return state.generals.find((g) => g.id === generalId);
}

/**
 * 플레이어별 활성 장수 목록 조회
 *
 * @param state - 게임 상태
 * @param playerId - 플레이어 ID
 * @returns 해당 플레이어의 활성 장수 배열
 */
export function getGeneralsByPlayer(
  state: GameState,
  playerId: PlayerId
): General[] {
  return state.generals.filter(
    (g) => g.owner === playerId && (g.status === 'active' || g.status === 'engaged')
  );
}

/**
 * 특정 타일이 점유되었는지 확인
 *
 * @param state - 게임 상태
 * @param tileId - 타일 ID
 * @returns 타일에 활성 장수가 있으면 true
 */
export function isTileOccupied(state: GameState, tileId: TileId): boolean {
  return state.generals.some(
    (g) => g.position === tileId && (g.status === 'active' || g.status === 'engaged')
  );
}

/**
 * 현재 선택된 장수 조회
 *
 * @param state - 게임 상태
 * @returns 선택된 장수, 없으면 null
 */
export function getSelectedGeneral(state: GameState): General | null {
  if (!state.selectedGeneralId) return null;
  return getGeneralById(state, state.selectedGeneralId) ?? null;
}

/**
 * 특정 장수가 선택되었는지 확인
 *
 * @param state - 게임 상태
 * @param generalId - 장수 ID
 * @returns 해당 장수가 선택되었으면 true
 */
export function isGeneralSelected(
  state: GameState,
  generalId: GeneralId
): boolean {
  return state.selectedGeneralId === generalId;
}

/**
 * 장수 스탯 정보 타입 (UI 표시용)
 */
export interface GeneralStatsInfo {
  name: string;
  nameKo: string;
  owner: PlayerId;
  stars: number;
  troops: number;
  maxTroops: number;
  sun: number;
  moon: number;
  speed: number;
  status: import('../generals/types').GeneralStatus;
  livesRemaining: number;
}

/**
 * 장수 스탯 정보 조회
 *
 * @param state - 현재 게임 상태
 * @param generalId - 조회할 장수 ID
 * @returns 장수 스탯 또는 null (존재하지 않으면)
 */
export function getGeneralStats(
  state: GameState,
  generalId: GeneralId
): GeneralStatsInfo | null {
  const general = getGeneralById(state, generalId);
  if (!general) return null;

  return {
    name: general.name,
    nameKo: general.nameKo,
    owner: general.owner,
    stars: general.stats.star,
    troops: general.troops,
    maxTroops: getMaxTroops(general.stats.star), // 별 × TROOP_MULTIPLIER = 최대 병력
    sun: general.stats.sun,
    moon: general.stats.moon,
    speed: general.stats.speed,
    status: general.status,
    livesRemaining: general.livesRemaining,
  };
}
