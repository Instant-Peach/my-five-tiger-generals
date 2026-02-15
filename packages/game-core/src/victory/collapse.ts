/**
 * 와해 승리 판정 로직
 *
 * Story 6-4: 와해 승리 (Collapse Victory)
 *
 * 상대 플레이어의 모든 장수가 eliminated 상태(완전 퇴장)이면 와해 승리입니다.
 * 게임 규칙 section 7.3: 아군 측의 모든 장수가 완전 퇴장된 상태를 "와해"로 정의
 *
 * 목숨 시스템: 1차 OUT은 복귀 가능, 2차 OUT(eliminated)이 완전 퇴장
 */

import type { GameState, VictoryResult } from '../state/types';

/**
 * 장수가 완전 퇴장(복귀 불가) 상태인지 확인
 */
function isFullyOut(status: string): boolean {
  return status === 'eliminated';
}

/**
 * 와해 승리 조건 확인
 *
 * 상대 플레이어의 모든 장수가 eliminated 상태(완전 퇴장)이면 와해 승리
 *
 * @param state - 현재 게임 상태
 * @returns VictoryResult | null - 승리 시 결과, 아직 승리가 아니면 null
 */
export function checkCollapseVictory(state: GameState): VictoryResult | null {
  // player1 관점: player2의 모든 장수가 eliminated인지 확인
  const player2Generals = state.generals.filter(g => g.owner === 'player2');
  if (player2Generals.length > 0 && player2Generals.every(g => isFullyOut(g.status))) {
    return { winner: 'player1', reason: 'collapse' };
  }

  // player2 관점: player1의 모든 장수가 eliminated인지 확인
  const player1Generals = state.generals.filter(g => g.owner === 'player1');
  if (player1Generals.length > 0 && player1Generals.every(g => isFullyOut(g.status))) {
    return { winner: 'player2', reason: 'collapse' };
  }

  return null;
}
