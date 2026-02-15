/**
 * 공격 실행 로직
 *
 * Story 4-1: 인접 공격 (Adjacent Attack)
 * Story 4-2: 공격 방향 판정 (Attack Direction Judgment)
 * Story 4-3: 방향별 데미지 계산 (Directional Damage Calculation)
 * Story 6-4: 와해 승리 (Collapse Victory)
 */

import { getAdjacentTiles } from '../board/adjacency';
import { getAttackDirection } from '../board/direction';
import type { GeneralId } from '../generals/types';
import type { GameState, Result, PerformedAction, VictoryResult } from '../state/types';
import type { AttackResult } from './types';
import { Logger } from '../utils/logger';
import { calculateDamage, getAttackStat, getDefendStat } from './damage';
import { checkCollapseVictory } from '../victory/collapse';

/**
 * 공격 유효성 검증
 *
 * @param state - 현재 게임 상태
 * @param attackerId - 공격자 장수 ID
 * @param defenderId - 방어자 장수 ID
 * @returns boolean - 공격 가능 여부
 */
export function canAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): boolean {
  const attacker = state.generals.find(g => g.id === attackerId);
  const defender = state.generals.find(g => g.id === defenderId);

  // 장수 존재 확인
  if (!attacker || !defender) {
    return false;
  }

  // Story 4-5: OUT/eliminated 상태 장수는 공격할 수 없음
  if (attacker.status === 'out' || attacker.status === 'eliminated') {
    return false;
  }

  // Story 4-5: OUT/eliminated 상태 장수는 공격 대상이 될 수 없음
  if (defender.status === 'out' || defender.status === 'eliminated') {
    return false;
  }

  // 위치 확인
  if (attacker.position === null || defender.position === null) {
    return false;
  }

  // 현재 플레이어 장수인지 확인
  if (attacker.owner !== state.currentPlayer) {
    return false;
  }

  // 적 장수인지 확인 (아군 공격 불가)
  if (defender.owner === attacker.owner) {
    return false;
  }

  // 인접 타일인지 확인 (변 공유만)
  const adjacentTiles = getAdjacentTiles(attacker.position);
  if (!adjacentTiles.includes(defender.position)) {
    return false;
  }

  // 교전 중 장수는 교전 상대만 공격 가능
  if (attacker.status === 'engaged') {
    if (attacker.engagedWith !== defenderId) {
      return false;
    }
  }

  // 동일 장수 동일 행동 제한 확인
  const alreadyAttacked = state.performedActions.some(
    a => a.generalId === attackerId && a.actionType === 'attack'
  );
  if (alreadyAttacked) {
    return false;
  }

  // 행동력 확인
  if (state.actionsRemaining <= 0) {
    return false;
  }

  return true;
}

/**
 * 공격 유효성 검증 (Result 타입 반환)
 *
 * @param state - 현재 게임 상태
 * @param attackerId - 공격자 장수 ID
 * @param defenderId - 방어자 장수 ID
 * @returns Result<void> - 성공 시 void, 실패 시 에러
 */
function validateAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): Result<void> {
  const attacker = state.generals.find(g => g.id === attackerId);
  const defender = state.generals.find(g => g.id === defenderId);

  // 장수 존재 확인
  if (!attacker) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_FOUND', message: `공격자를 찾을 수 없습니다: ${attackerId}` },
    };
  }

  if (!defender) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_FOUND', message: `방어자를 찾을 수 없습니다: ${defenderId}` },
    };
  }

  // Story 4-5: OUT/eliminated 상태 검증
  if (attacker.status === 'out' || attacker.status === 'eliminated') {
    return {
      success: false,
      error: { code: 'ATTACKER_IS_OUT', message: 'OUT 상태 장수는 공격할 수 없습니다' },
    };
  }

  if (defender.status === 'out' || defender.status === 'eliminated') {
    return {
      success: false,
      error: { code: 'DEFENDER_IS_OUT', message: 'OUT 상태 장수는 공격 대상이 될 수 없습니다' },
    };
  }

  // 교전 중 장수는 교전 상대만 공격 가능
  if (attacker.status === 'engaged' && attacker.engagedWith !== defenderId) {
    return {
      success: false,
      error: { code: 'ENGAGED_CANNOT_ATTACK_OTHER', message: '교전 중에는 교전 상대만 공격할 수 있습니다' },
    };
  }

  // 위치 확인
  if (attacker.position === null) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_ACTIVE', message: '공격자가 보드에 없습니다' },
    };
  }

  if (defender.position === null) {
    return {
      success: false,
      error: { code: 'GENERAL_NOT_ACTIVE', message: '방어자가 보드에 없습니다' },
    };
  }

  // 현재 플레이어 장수인지 확인
  if (attacker.owner !== state.currentPlayer) {
    return {
      success: false,
      error: { code: 'NOT_YOUR_TURN', message: '자신의 턴이 아닙니다' },
    };
  }

  // 적 장수인지 확인 (아군 공격 불가)
  if (defender.owner === attacker.owner) {
    return {
      success: false,
      error: { code: 'CANNOT_ATTACK_ALLY', message: '아군을 공격할 수 없습니다' },
    };
  }

  // 인접 타일인지 확인 (변 공유만)
  const adjacentTiles = getAdjacentTiles(attacker.position);
  if (!adjacentTiles.includes(defender.position)) {
    return {
      success: false,
      error: { code: 'NOT_ADJACENT', message: '인접한 타일이 아닙니다' },
    };
  }

  // 동일 장수 동일 행동 제한 확인
  const alreadyAttacked = state.performedActions.some(
    a => a.generalId === attackerId && a.actionType === 'attack'
  );
  if (alreadyAttacked) {
    return {
      success: false,
      error: { code: 'SAME_ACTION_SAME_GENERAL', message: '같은 장수가 같은 턴에 동일한 행동을 할 수 없습니다' },
    };
  }

  // 행동력 확인
  if (state.actionsRemaining <= 0) {
    return {
      success: false,
      error: { code: 'NO_ACTIONS_REMAINING', message: '행동력이 부족합니다' },
    };
  }

  return { success: true, data: undefined };
}

/**
 * 공격 실행 결과 타입
 *
 * Story 4-2: 공격 방향 판정 통합
 */
export interface ExecuteAttackData {
  /** 업데이트된 게임 상태 */
  state: GameState;
  /** 공격 결과 (방향 정보 포함) */
  result: AttackResult;
  /** 승리 결과 (null이면 게임 계속) */
  victoryResult: VictoryResult | null;
}

/**
 * 공격 실행
 *
 * Story 4-2에서 방향 판정을 통합하여 AttackResult를 함께 반환합니다.
 *
 * @param state - 현재 게임 상태
 * @param attackerId - 공격자 장수 ID
 * @param defenderId - 방어자 장수 ID
 * @returns Result<ExecuteAttackData> - 업데이트된 게임 상태와 공격 결과, 또는 에러
 */
export function executeAttack(
  state: GameState,
  attackerId: GeneralId,
  defenderId: GeneralId
): Result<ExecuteAttackData> {
  // 1. 공격 유효성 검증
  const validationResult = validateAttack(state, attackerId, defenderId);
  if (!validationResult.success) {
    return validationResult;
  }

  // 2. 공격자/방어자 정보 조회 (검증 통과했으므로 반드시 존재)
  const attacker = state.generals.find(g => g.id === attackerId)!;
  const defender = state.generals.find(g => g.id === defenderId)!;
  const attackerTile = attacker.position!;
  const defenderTile = defender.position!;

  // 3. 방향 판정 (Story 4-2)
  const direction = getAttackDirection(attackerTile, defenderTile);
  if (direction === null) {
    // 인접하지 않은 경우 (validateAttack에서 이미 검증했으므로 여기 도달 불가)
    return {
      success: false,
      error: { code: 'NOT_ADJACENT', message: '인접한 타일이 아닙니다' },
    };
  }

  // 4. 피해 계산 (Story 4-3: 방향별 계산)
  const damage = calculateDamage(attacker, defender, direction);

  // 5. 피해 적용
  const defenderTroopsAfter = Math.max(0, defender.troops - damage);
  const isKnockOut = defenderTroopsAfter === 0;

  // 교전 진입 판정: 전선 공격 + 방어자 생존 시 양측 교전
  const shouldEngage = direction === 'frontline' && !isKnockOut;

  const newGenerals = state.generals.map(g => {
    if (g.id === defenderId) {
      if (isKnockOut) {
        // Story 4-5: OUT 상태 전환 → 교전 해제
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
      if (shouldEngage) {
        return {
          ...g,
          troops: defenderTroopsAfter,
          status: 'engaged' as const,
          engagedWith: attackerId,
        };
      }
      return { ...g, troops: defenderTroopsAfter };
    }
    if (g.id === attackerId) {
      if (shouldEngage) {
        return {
          ...g,
          status: 'engaged' as const,
          engagedWith: defenderId,
        };
      }
      // 방어자가 OUT되면 공격자 교전 해제
      if (isKnockOut && g.status === 'engaged' && g.engagedWith === defenderId) {
        return {
          ...g,
          status: 'active' as const,
          engagedWith: undefined,
        };
      }
      return g;
    }
    return g;
  });

  // Story 4-5: OUT 로깅
  if (isKnockOut) {
    Logger.info('combat', `General ${defender.nameKo} is OUT`, {
      generalId: defenderId,
      attackerId,
    });
  }

  // 6. 행동 기록
  const newPerformedAction: PerformedAction = {
    generalId: attackerId,
    actionType: 'attack',
  };

  const newPerformedActions: PerformedAction[] = [
    ...state.performedActions,
    newPerformedAction,
  ];

  // 7. 공격 결과 생성
  const attackResult: AttackResult = {
    attackerId,
    defenderId,
    attackerTile,
    defenderTile,
    direction,
    damage,
    defenderTroopsAfter,
    isKnockOut,
  };

  // 8. 디버그 로깅 (Story 4-3: 피해 계산 세부 정보)
  if (direction === 'frontline') {
    Logger.debug('combat', `Damage: ${damage} (frontline: fixed)`, {
      attacker: attackerTile,
      defender: defenderTile,
      defenderTroopsAfter,
    });
  } else {
    const attackStat = getAttackStat(attacker, direction);
    const defendStat = getDefendStat(defender, direction);
    Logger.debug('combat', `Damage: ${damage} (${direction}: attacker ${attackStat} - defender ${defendStat})`, {
      attacker: attackerTile,
      defender: defenderTile,
      attackStat,
      defendStat,
      defenderTroopsAfter,
    });
  }

  // Story 6-4: 와해 승리 판정 (방어자가 OUT된 경우에만)
  let newState: GameState = {
    ...state,
    generals: newGenerals,
    actionsRemaining: state.actionsRemaining - 1,
    performedActions: newPerformedActions,
  };

  let victoryResult: VictoryResult | null = null;
  if (isKnockOut) {
    victoryResult = checkCollapseVictory(newState);
    if (victoryResult) {
      newState = {
        ...newState,
        phase: 'ended',
        victoryResult,
      };
    }
  }

  return {
    success: true,
    data: {
      state: newState,
      result: attackResult,
      victoryResult,
    },
  };
}
