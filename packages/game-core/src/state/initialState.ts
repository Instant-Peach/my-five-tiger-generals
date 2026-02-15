/**
 * 초기 게임 상태 생성
 *
 * 게임 시작 시 양측 장수를 시작 구역에 배치하고
 * 초기 게임 상태를 생성합니다.
 */

import { createGeneral, createInitialGenerals } from '../generals/generals';
import { GAME } from '../constants/game';
import type { GameState } from './types';

/**
 * 초기 게임 상태 생성
 *
 * - 양측 장수 5명씩 시작 구역에 배치
 * - Player 1이 선공
 * - GamePhase = 'playing' 설정
 *
 * @returns 초기 GameState
 */
export function createInitialGameState(): GameState {
  const player1Generals = createInitialGenerals('player1');
  const player2Generals = createInitialGenerals('player2');

  return {
    phase: 'playing',
    turnPhase: 'select',
    currentPlayer: 'player1',
    turn: 1,
    generals: [...player1Generals, ...player2Generals],
    selectedGeneralId: null,
    actionsRemaining: GAME.ACTIONS_PER_TURN,
    performedActions: [],
    player1KnockCount: 0,
    player2KnockCount: 0,
    victoryResult: undefined,
  };
}

/**
 * 노크 테스트용 초기 상태 생성
 *
 * - Player 1: 관우만 상대 home 구역(타일 2, row 0)에 배치
 * - Player 2: 장수 없음 (방해 없이 노크 테스트 가능)
 * - 바로 노크 행동 테스트 가능
 */
export function createKnockTestState(): GameState {
  const guanyu = createGeneral('guanyu', 'player1', 2);

  return {
    phase: 'playing',
    turnPhase: 'select',
    currentPlayer: 'player1',
    turn: 1,
    generals: [guanyu],
    selectedGeneralId: null,
    actionsRemaining: GAME.ACTIONS_PER_TURN,
    performedActions: [],
    player1KnockCount: 0,
    player2KnockCount: 0,
    victoryResult: undefined,
  };
}
