/**
 * 게임 통계 추출 함수
 *
 * Story 8-6: 결과 화면 (Result Screen)
 * GameState에서 결과 화면에 필요한 통계를 추출하는 순수 함수
 */

import type { GameState, GameStats } from './types';

/**
 * 게임 상태에서 통계 데이터를 추출하는 순수 함수
 *
 * @param state - 현재 게임 상태
 * @returns 게임 통계 (총 턴 수, 노크 횟수, 남은 장수 수)
 */
export function extractGameStats(state: GameState): GameStats {
  const player1RemainingGenerals = state.generals.filter(
    (g) => g.owner === 'player1' && g.status === 'active',
  ).length;

  const player2RemainingGenerals = state.generals.filter(
    (g) => g.owner === 'player2' && g.status === 'active',
  ).length;

  return {
    totalTurns: state.turn,
    player1KnockCount: state.player1KnockCount,
    player2KnockCount: state.player2KnockCount,
    player1RemainingGenerals,
    player2RemainingGenerals,
  };
}
