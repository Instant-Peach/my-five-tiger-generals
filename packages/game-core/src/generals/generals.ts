/**
 * 장수 팩토리 및 관리 함수
 *
 * 장수 객체 생성 및 초기 배치를 담당합니다.
 */

import type { TileId } from '../board/types';
import { GENERAL_BASE_DATA, GENERAL_ORDER, PLAYER_START_TILES } from './constants';
import type { General, GeneralBaseId, PlayerId } from './types';
import { getMaxTroops } from './troops';
import { GAME } from '../constants/game';

/**
 * 장수 생성 팩토리 함수
 *
 * @param baseId - 장수 기본 ID (예: 'guanyu')
 * @param owner - 소유 플레이어
 * @param position - 초기 위치 (기본값: null)
 * @returns General 객체
 * @throws Error - 존재하지 않는 장수 ID인 경우
 */
export function createGeneral(
  baseId: GeneralBaseId,
  owner: PlayerId,
  position: TileId | null = null
): General {
  const baseData = GENERAL_BASE_DATA[baseId];
  if (!baseData) {
    throw new Error(`Unknown general: ${baseId}`);
  }

  return {
    id: `${owner}_${baseId}`,
    baseId,
    name: baseData.name,
    nameKo: baseData.nameKo,
    owner,
    stats: { ...baseData.stats },
    troops: getMaxTroops(baseData.stats.star), // 초기 병력 = 최대 병력 (star × TROOP_MULTIPLIER)
    position,
    status: 'active',
    livesRemaining: GAME.INITIAL_LIVES,
  };
}

/**
 * 플레이어별 초기 장수 5명 생성 및 시작 타일 배치
 *
 * @param playerId - 플레이어 ID
 * @returns 5명의 장수 배열 (시작 타일에 배치된 상태)
 */
export function createInitialGenerals(playerId: PlayerId): General[] {
  const startTiles = PLAYER_START_TILES[playerId];

  return GENERAL_ORDER.map((baseId, index) =>
    createGeneral(baseId, playerId, startTiles[index])
  );
}
