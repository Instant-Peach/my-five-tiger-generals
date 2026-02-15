/**
 * 항복 실행 로직
 *
 * Story 6-5: 항복 (Surrender)
 *
 * 항복을 선언한 플레이어가 패배하고, 상대 플레이어가 승리합니다.
 * 게임 규칙 section 8.2: 항복 승리 (우선순위 없음 - 즉시 종료)
 *
 * Phaser 의존성 없음 - 순수 TypeScript 함수
 */

import type { PlayerId } from '../generals/types';
import type { GameState, Result, VictoryResult } from '../state/types';

/**
 * 항복 실행 결과 데이터
 */
export interface ExecuteSurrenderData {
  /** 업데이트된 게임 상태 */
  state: GameState;
  /** 승리 결과 */
  victoryResult: VictoryResult;
}

/**
 * 항복 실행
 *
 * 항복을 선언한 플레이어가 패배하고, 상대 플레이어가 승리합니다.
 * 게임 규칙 section 8.2: 항복 승리 (우선순위 없음 - 즉시 종료)
 *
 * @param state - 현재 게임 상태
 * @param playerId - 항복을 선언하는 플레이어 ID
 * @returns Result<ExecuteSurrenderData>
 */
export function executeSurrender(
  state: GameState,
  playerId: PlayerId
): Result<ExecuteSurrenderData> {
  // 유효성 검증: playerId
  if (playerId !== 'player1' && playerId !== 'player2') {
    return {
      success: false,
      error: { code: 'INVALID_PLAYER', message: '유효하지 않은 플레이어입니다' },
    };
  }

  // 유효성 검증: 게임 진행 중인지 확인
  if (state.phase !== 'playing') {
    return {
      success: false,
      error: {
        code: 'GAME_NOT_IN_PROGRESS',
        message: state.phase === 'ended'
          ? '이미 종료된 게임에서는 항복할 수 없습니다'
          : '아직 시작되지 않은 게임에서는 항복할 수 없습니다',
      },
    };
  }

  // 승리자 결정 (항복한 플레이어의 상대)
  const winner: PlayerId = playerId === 'player1' ? 'player2' : 'player1';
  const victoryResult: VictoryResult = { winner, reason: 'surrender' };

  const newState: GameState = {
    ...state,
    phase: 'ended',
    victoryResult,
  };

  return {
    success: true,
    data: {
      state: newState,
      victoryResult,
    },
  };
}
