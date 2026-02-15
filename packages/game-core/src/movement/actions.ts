/**
 * Movement Actions
 *
 * 장수 이동 액션 처리 로직
 * Story 3-2: 장수 이동 (General Movement)
 */

import type { TileId } from '../board/types';
import type { GeneralId } from '../generals/types';
import type { GameState, Result, ActionType, PerformedAction } from '../state/types';
import { COMBAT } from '../constants';
import { checkCollapseVictory } from '../victory/collapse';
import { Logger } from '../utils/logger';
import { getMovableTilesForGeneral } from './index';

/**
 * 장수 이동 액션 실행
 *
 * 장수를 현재 위치에서 목적지 타일로 이동시킵니다.
 * 다음 조건들을 검증합니다:
 * 1. 장수 존재 여부
 * 2. 턴 소유권 (자신의 장수만 이동 가능)
 * 3. 행동력 잔여량
 * 4. 동일 장수 동일 행동 제한 (같은 턴에 같은 장수가 두 번 이동 불가)
 * 5. 이동 가능 타일 여부
 *
 * @param state - 현재 게임 상태
 * @param generalId - 이동할 장수 ID
 * @param toTileId - 목적지 타일 ID
 * @returns Result<GameState> - 성공 시 업데이트된 상태, 실패 시 에러
 */
export function moveGeneral(
  state: GameState,
  generalId: GeneralId,
  toTileId: TileId
): Result<GameState> {
  // 1. 장수 찾기
  const general = state.generals.find(g => g.id === generalId);
  if (!general) {
    return {
      success: false,
      error: {
        code: 'GENERAL_NOT_FOUND',
        message: `장수를 찾을 수 없습니다: ${generalId}`,
      },
    };
  }

  // 2. 턴 검증 (자신의 장수만 이동 가능)
  if (general.owner !== state.currentPlayer) {
    return {
      success: false,
      error: {
        code: 'NOT_YOUR_TURN',
        message: '자신의 턴이 아닙니다',
      },
    };
  }

  // 3. 행동 가능 여부 검증 (행동력 + 동일 장수 동일 행동 제한)
  if (!canPerformAction(state, generalId, 'move')) {
    // 구체적인 에러 메시지를 위해 원인 구분
    if (state.actionsRemaining <= 0) {
      return {
        success: false,
        error: {
          code: 'NO_ACTIONS_REMAINING',
          message: '행동력이 부족합니다',
        },
      };
    }
    return {
      success: false,
      error: {
        code: 'SAME_ACTION_SAME_GENERAL',
        message: '같은 장수가 같은 턴에 동일한 행동을 할 수 없습니다',
      },
    };
  }

  // 5. 이동 가능 타일 검증
  const movableTiles = getMovableTilesForGeneral(state, generalId);
  if (!movableTiles.includes(toTileId)) {
    return {
      success: false,
      error: {
        code: 'INVALID_MOVE',
        message: '이동할 수 없는 타일입니다',
      },
    };
  }

  // 6. 교전 중 이동 = 이탈 처리 (GDD §6.4)
  const isDisengaging = general.status === 'engaged' && general.engagedWith;

  if (isDisengaging) {
    const engagedWithId = general.engagedWith!;
    const troopsAfterDisengage = general.troops - COMBAT.DISENGAGE_DAMAGE;
    const isKnockOut = troopsAfterDisengage <= 0;

    Logger.info('combat', `General ${general.nameKo} disengages from ${engagedWithId}`, {
      generalId,
      engagedWithId,
      troopsBefore: general.troops,
      troopsAfter: Math.max(0, troopsAfterDisengage),
      isKnockOut,
    });

    const newPerformedAction: PerformedAction = {
      generalId,
      actionType: 'move',
    };

    const newPerformedActions: PerformedAction[] = [
      ...state.performedActions,
      newPerformedAction,
    ];

    // 이탈자 전멸: 병력 부족 시 OUT 처리 (행동 1개 소모)
    if (isKnockOut) {
      const newGenerals = state.generals.map(g => {
        if (g.id === generalId) {
          const newLives = g.livesRemaining - 1;
          const newStatus = newLives <= 0 ? ('eliminated' as const) : ('out' as const);
          return {
            ...g,
            troops: 0,
            status: newStatus,
            position: null,
            engagedWith: undefined,
            livesRemaining: newLives,
          };
        }
        // 상대도 교전 해제
        if (g.id === engagedWithId) {
          return {
            ...g,
            status: 'active' as const,
            engagedWith: undefined,
          };
        }
        return g;
      });

      let newState: GameState = {
        ...state,
        generals: newGenerals,
        actionsRemaining: state.actionsRemaining - 1,
        performedActions: newPerformedActions,
      };

      // 와해 승리 판정
      const victoryResult = checkCollapseVictory(newState);
      if (victoryResult) {
        newState = {
          ...newState,
          phase: 'ended',
          victoryResult,
        };
      }

      return { success: true, data: newState };
    }

    // 이탈 성공: 피해 적용 + 교전 해제 + 이동
    const newGenerals = state.generals.map(g => {
      if (g.id === generalId) {
        return {
          ...g,
          troops: troopsAfterDisengage,
          position: toTileId,
          status: 'active' as const,
          engagedWith: undefined,
        };
      }
      // 상대도 교전 해제
      if (g.id === engagedWithId) {
        return {
          ...g,
          status: 'active' as const,
          engagedWith: undefined,
        };
      }
      return g;
    });

    return {
      success: true,
      data: {
        ...state,
        generals: newGenerals,
        actionsRemaining: state.actionsRemaining - 1,
        performedActions: newPerformedActions,
      },
    };
  }

  // 7. 일반 이동 상태 업데이트 (불변성 유지)
  const newGenerals = state.generals.map(g =>
    g.id === generalId ? { ...g, position: toTileId } : g
  );

  const newPerformedAction: PerformedAction = {
    generalId,
    actionType: 'move',
  };

  const newPerformedActions: PerformedAction[] = [
    ...state.performedActions,
    newPerformedAction,
  ];

  return {
    success: true,
    data: {
      ...state,
      generals: newGenerals,
      actionsRemaining: state.actionsRemaining - 1,
      performedActions: newPerformedActions,
    },
  };
}

/**
 * 특정 장수가 특정 행동을 수행할 수 있는지 검증
 *
 * @param state - 현재 게임 상태
 * @param generalId - 장수 ID
 * @param actionType - 행동 타입
 * @returns boolean - 행동 가능 여부
 */
export function canPerformAction(
  state: GameState,
  generalId: GeneralId,
  actionType: ActionType
): boolean {
  // 행동력 확인
  if (state.actionsRemaining <= 0) {
    return false;
  }

  // 동일 장수 동일 행동 제한 확인
  const hasSameAction = state.performedActions.some(
    action => action.generalId === generalId && action.actionType === actionType
  );

  return !hasSameAction;
}

/**
 * 장수 위치 업데이트 헬퍼 함수
 *
 * 불변성을 유지하면서 장수 위치를 업데이트합니다.
 *
 * @param state - 현재 게임 상태
 * @param generalId - 장수 ID
 * @param newPosition - 새 위치 타일 ID
 * @returns 업데이트된 GameState
 */
export function updateGeneralPosition(
  state: GameState,
  generalId: GeneralId,
  newPosition: TileId
): GameState {
  const newGenerals = state.generals.map(g =>
    g.id === generalId ? { ...g, position: newPosition } : g
  );

  return {
    ...state,
    generals: newGenerals,
  };
}
