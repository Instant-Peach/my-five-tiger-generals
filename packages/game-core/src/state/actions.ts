/**
 * 게임 상태 변경 액션
 *
 * 게임 상태를 변경하는 순수 함수들입니다.
 * 모든 액션은 불변성을 유지하며 새로운 상태를 반환합니다.
 */

import type { GeneralId } from '../generals/types';
import { getGeneralById } from './queries';
import type { GameState, Result } from './types';

/**
 * 장수 선택 액션
 *
 * @param state - 현재 게임 상태
 * @param generalId - 선택할 장수 ID
 * @returns Result<GameState> - 성공 시 새 상태, 실패 시 에러
 */
export function selectGeneral(
  state: GameState,
  generalId: GeneralId
): Result<GameState> {
  const general = getGeneralById(state, generalId);

  // 검증: 장수가 존재하는가?
  if (!general) {
    return {
      success: false,
      error: {
        code: 'GENERAL_NOT_FOUND',
        message: `장수 ${generalId}를 찾을 수 없습니다`,
      },
    };
  }

  // 검증: 현재 플레이어의 장수인가?
  if (general.owner !== state.currentPlayer) {
    return {
      success: false,
      error: {
        code: 'INVALID_OWNER',
        message: '상대 장수는 선택할 수 없습니다',
      },
    };
  }

  // 검증: 활성 또는 교전 상태인가?
  if (general.status !== 'active' && general.status !== 'engaged') {
    return {
      success: false,
      error: {
        code: 'GENERAL_NOT_ACTIVE',
        message: '이 장수는 선택할 수 없습니다',
      },
    };
  }

  // 선택 성공
  return {
    success: true,
    data: {
      ...state,
      selectedGeneralId: generalId,
    },
  };
}

/**
 * 장수 선택 해제 액션
 *
 * @param state - 현재 게임 상태
 * @returns 선택이 해제된 새 상태
 */
export function deselectGeneral(state: GameState): GameState {
  return {
    ...state,
    selectedGeneralId: null,
  };
}
