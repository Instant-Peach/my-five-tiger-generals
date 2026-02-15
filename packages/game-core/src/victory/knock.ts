/**
 * 노크 행동 로직
 *
 * Story 6-1: 노크 행동 (Knock Action)
 * Story 6-2: 3회 노크 승리 (Triple Knock Victory)
 * Story 6-4: 와해 승리 (Collapse Victory) - 노크 후 와해 판정 추가
 *
 * 장수가 상대방의 끝 구역(home)에 도달했을 때 노크 행동을 수행합니다.
 * 노크 3회 성공 시 승리 조건을 충족합니다.
 * 노크 카운트는 게임 전체 누적값입니다 (리셋 없음).
 * 노크 성공 후 해당 장수는 퇴각 처리됩니다 (OUT 상태).
 */

import { getTileMeta } from '../board/tileMeta';
import { GAME } from '../constants/game';
import type { PlayerId, GeneralId } from '../generals/types';
import type { TileId, TileZone } from '../board/types';
import type { GameState, Result, PerformedAction, VictoryResult } from '../state/types';
import { checkCollapseVictory } from './collapse';

/**
 * 노크 실행 결과 데이터
 */
export interface ExecuteKnockData {
  /** 업데이트된 게임 상태 */
  state: GameState;
  /** 노크 후 카운트 */
  knockCount: number;
  /** 노크를 수행한 플레이어 */
  playerId: PlayerId;
  /** 승리 결과 (null이면 게임 계속) */
  victoryResult: VictoryResult | null;
}

/**
 * 플레이어의 노크 대상 구역 반환
 *
 * player1은 player2_home에서 노크, player2는 player1_home에서 노크
 */
export function getKnockTargetZone(playerId: PlayerId): TileZone {
  return playerId === 'player1' ? 'player2_home' : 'player1_home';
}

/**
 * 타일이 해당 플레이어의 노크 대상 구역인지 확인
 */
export function isInKnockZone(tileId: TileId, playerId: PlayerId): boolean {
  const meta = getTileMeta(tileId);
  if (!meta) return false;
  return meta.zone === getKnockTargetZone(playerId);
}

/**
 * 노크 가능 여부 판정
 *
 * AC1: 노크 가능 조건 판정
 * - 장수가 active 상태여야 함
 * - 현재 플레이어의 장수여야 함
 * - 장수가 상대의 home 구역에 위치해야 함
 * - 행동력(actionsRemaining)이 1 이상이어야 함
 * - 동일 장수 동일 행동 제한 (같은 장수가 같은 턴에 노크를 2번 수행 불가)
 * - 측면 타일(30-33)에서는 노크 불가
 *
 * @param state - 현재 게임 상태
 * @param generalId - 노크를 시도하는 장수 ID
 * @returns boolean - 노크 가능 여부
 */
export function canKnock(state: GameState, generalId: GeneralId): boolean {
  const general = state.generals.find(g => g.id === generalId);
  if (!general) return false;
  if (general.status !== 'active') return false;
  if (general.owner !== state.currentPlayer) return false;
  if (general.position === null) return false;
  if (state.actionsRemaining <= 0) return false;

  // 동일 장수 동일 행동 제한
  const alreadyKnocked = state.performedActions.some(
    a => a.generalId === generalId && a.actionType === 'knock'
  );
  if (alreadyKnocked) return false;

  // 상대 home 구역 확인
  return isInKnockZone(general.position, general.owner);
}

/**
 * 노크 유효성 검증 (Result 타입 반환)
 *
 * canKnock의 세부 에러 메시지 포함 Result<void> 반환
 *
 * @param state - 현재 게임 상태
 * @param generalId - 노크를 시도하는 장수 ID
 * @returns Result<void> - 성공 시 void, 실패 시 에러
 */
export function validateKnock(
  state: GameState,
  generalId: GeneralId
): Result<void> {
  const general = state.generals.find(g => g.id === generalId);

  if (!general) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_FOUND', message: `장수를 찾을 수 없습니다: ${generalId}` },
    };
  }

  if (general.status !== 'active') {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_ACTIVE', message: 'active 상태가 아닌 장수는 노크할 수 없습니다' },
    };
  }

  if (general.owner !== state.currentPlayer) {
    return {
      success: false,
      error: { code: 'NOT_YOUR_TURN', message: '자신의 턴이 아닙니다' },
    };
  }

  if (general.position === null) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_ACTIVE', message: '보드에 없는 장수는 노크할 수 없습니다' },
    };
  }

  if (state.actionsRemaining <= 0) {
    return {
      success: false,
      error: { code: 'NO_ACTIONS_REMAINING', message: '행동력이 부족합니다' },
    };
  }

  // 동일 장수 동일 행동 제한
  const alreadyKnocked = state.performedActions.some(
    a => a.generalId === generalId && a.actionType === 'knock'
  );
  if (alreadyKnocked) {
    return {
      success: false,
      error: { code: 'SAME_ACTION_SAME_GENERAL', message: '같은 장수가 같은 턴에 동일한 행동을 할 수 없습니다' },
    };
  }

  // 상대 home 구역 확인
  if (!isInKnockZone(general.position, general.owner)) {
    return {
      success: false,
      error: { code: 'NOT_IN_KNOCK_ZONE', message: '상대방의 끝 구역에 있지 않아 노크할 수 없습니다' },
    };
  }

  return { success: true, data: undefined };
}

/**
 * 노크 승리 조건 확인
 *
 * Story 6-2 AC1: knockCount가 KNOCK_COUNT_TO_WIN(3)에 도달한 플레이어가 있는지 확인
 *
 * @param state - 현재 게임 상태
 * @returns VictoryResult | null - 승리 시 결과, 아직 승리가 아니면 null
 */
export function checkKnockVictory(state: GameState): VictoryResult | null {
  if (state.player1KnockCount >= GAME.KNOCK_COUNT_TO_WIN) {
    return { winner: 'player1', reason: 'knock' };
  }
  if (state.player2KnockCount >= GAME.KNOCK_COUNT_TO_WIN) {
    return { winner: 'player2', reason: 'knock' };
  }
  return null;
}

/**
 * 노크 실행
 *
 * Story 6-1 AC2: 노크 행동 실행
 * Story 6-2 AC1: 승리 판정 통합
 * - 검증 -> knockCount 증가 -> 행동력 소모 -> performedActions 기록 -> 승리 판정
 * - 순수 함수로 구현 (불변 상태 반환)
 *
 * @param state - 현재 게임 상태
 * @param generalId - 노크를 수행하는 장수 ID
 * @returns Result<ExecuteKnockData> - 업데이트된 게임 상태와 노크 결과, 또는 에러
 */
export function executeKnock(
  state: GameState,
  generalId: GeneralId
): Result<ExecuteKnockData> {
  // 1. 유효성 검증
  const validation = validateKnock(state, generalId);
  if (!validation.success) return validation;

  const general = state.generals.find(g => g.id === generalId)!;
  const playerId = general.owner;

  // 2. 노크 카운트 증가
  const knockCountKey = playerId === 'player1' ? 'player1KnockCount' : 'player2KnockCount';
  const newKnockCount = state[knockCountKey] + 1;

  // 3. 행동 기록
  const newPerformedAction: PerformedAction = {
    generalId,
    actionType: 'knock',
  };

  // 장수 퇴각 처리 (노크 후 보드에서 제거)
  const updatedGenerals = state.generals.map(g => {
    if (g.id !== generalId) return g;
    const newLives = g.livesRemaining - 1;
    const newStatus = newLives <= 0 ? ('eliminated' as const) : ('out' as const);
    return {
      ...g,
      status: newStatus,
      position: null,
      troops: 0,
      livesRemaining: newLives,
    };
  });

  let newState: GameState = {
    ...state,
    generals: updatedGenerals,
    [knockCountKey]: newKnockCount,
    actionsRemaining: state.actionsRemaining - 1,
    performedActions: [...state.performedActions, newPerformedAction],
  };

  // 4. 승리 판정
  // Story 6-2: 노크 승리 판정 (우선)
  let victoryResult = checkKnockVictory(newState);

  // Story 6-4: 노크 승리가 아닌 경우, 와해 승리 판정
  if (!victoryResult) {
    victoryResult = checkCollapseVictory(newState);
  }

  if (victoryResult) {
    newState = {
      ...newState,
      phase: 'ended',
      victoryResult,
    };
  }

  return {
    success: true,
    data: {
      state: newState,
      knockCount: newKnockCount,
      playerId,
      victoryResult: victoryResult ?? null,
    },
  };
}

