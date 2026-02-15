/**
 * Turn Actions
 *
 * 턴 관련 액션 처리 로직
 * Story 3-2: 장수 이동 (행동 시스템 리셋)
 */

import type { GameState } from '../state/types';
import { GAME } from '../constants/game';

/**
 * 새 턴을 위한 행동 시스템 리셋
 *
 * 턴이 종료되고 다음 턴이 시작될 때 호출됩니다.
 * - performedActions 배열을 초기화
 * - actionsRemaining을 기본값(3)으로 리셋
 *
 * @param state - 현재 게임 상태
 * @returns 리셋된 GameState
 */
export function resetActionsForNewTurn(state: GameState): GameState {
  return {
    ...state,
    actionsRemaining: GAME.ACTIONS_PER_TURN,
    performedActions: [],
  };
}

/**
 * 턴 종료 처리
 *
 * 현재 턴을 종료하고 다음 플레이어에게 턴을 넘깁니다.
 * - 현재 플레이어 변경
 * - 턴 번호 증가 (player2 → player1일 때)
 * - 행동 시스템 리셋
 *
 * @param state - 현재 게임 상태
 * @returns 업데이트된 GameState
 */
export function endTurn(state: GameState): GameState {
  const nextPlayer = state.currentPlayer === 'player1' ? 'player2' : 'player1';
  const nextTurn = nextPlayer === 'player1' ? state.turn + 1 : state.turn;

  // knockCount는 턴 전환 시 리셋하지 않음 (Story 6-1)
  // 리셋 조건은 Story 6-2에서 구현 예정 (장수가 상대 home에서 밀려날 때)
  return {
    ...state,
    currentPlayer: nextPlayer,
    turn: nextTurn,
    turnPhase: 'select',
    selectedGeneralId: null,
    actionsRemaining: GAME.ACTIONS_PER_TURN,
    performedActions: [],
  };
}
