/**
 * 교전(Engagement) 시스템 테스트
 *
 * GDD §6.3: 전선 전투와 교착
 * GDD §6.4: 이탈 (Disengage)
 */

import { describe, it, expect } from 'vitest';
import { executeAttack, canAttack } from '../src/combat';
import { moveGeneral } from '../src/movement';
import { selectGeneral } from '../src/state/actions';
import { getMovableTilesForGeneral } from '../src/movement';
import { COMBAT } from '../src/constants';
import type { GameState, PerformedAction } from '../src/state/types';
import type { General, GeneralId, PlayerId, GeneralStats } from '../src/generals/types';
import type { TileId } from '../src/board/types';

const DEFAULT_STATS: GeneralStats = {
  star: 5,
  sun: 5,
  moon: 5,
  speed: 3,
};

function createTestGeneral(
  id: GeneralId,
  owner: PlayerId,
  position: TileId | null,
  troops: number = 10,
  status: 'active' | 'engaged' | 'out' | 'standby' = 'active',
  stats: GeneralStats = DEFAULT_STATS,
  engagedWith?: GeneralId
): General {
  return {
    id,
    baseId: id.replace(`${owner}_`, ''),
    name: id,
    nameKo: id,
    owner,
    stats,
    troops,
    position,
    status,
    livesRemaining: 2,
    engagedWith,
  };
}

function createTestGameState(
  generals: General[],
  currentPlayer: PlayerId = 'player1',
  actionsRemaining: number = 3,
  performedActions: PerformedAction[] = []
): GameState {
  return {
    phase: 'playing',
    turnPhase: 'select',
    currentPlayer,
    turn: 1,
    generals,
    selectedGeneralId: null,
    actionsRemaining,
    performedActions,
    player1KnockCount: 0,
    player2KnockCount: 0,
  };
}

describe('교전(Engagement) 시스템', () => {
  // ========================================
  // 교전 진입 (GDD §6.3)
  // ========================================
  describe('교전 진입', () => {
    it('전선 공격 시 양측이 engaged 상태가 된다', () => {
      // Tile 12 (▲, col=2) -> Tile 17 (▽, col=2) = frontline (같은 열)
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10),
        createTestGeneral('player2_g1', 'player2', 17, 10),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_g1', 'player2_g1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.direction).toBe('frontline');

        const attacker = result.data.state.generals.find(g => g.id === 'player1_g1');
        const defender = result.data.state.generals.find(g => g.id === 'player2_g1');

        expect(attacker?.status).toBe('engaged');
        expect(attacker?.engagedWith).toBe('player2_g1');
        expect(defender?.status).toBe('engaged');
        expect(defender?.engagedWith).toBe('player1_g1');
        expect(defender?.troops).toBe(9); // 10 - 1 (frontline fixed)
      }
    });

    it('해/달 방향 공격은 교전 상태를 발생시키지 않는다', () => {
      // Tile 12 (col=2) -> Tile 13 (col=3) = sun direction
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10),
        createTestGeneral('player2_g1', 'player2', 13, 10),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_g1', 'player2_g1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.direction).toBe('sun');

        const attacker = result.data.state.generals.find(g => g.id === 'player1_g1');
        const defender = result.data.state.generals.find(g => g.id === 'player2_g1');

        expect(attacker?.status).toBe('active');
        expect(attacker?.engagedWith).toBeUndefined();
        expect(defender?.status).toBe('active');
        expect(defender?.engagedWith).toBeUndefined();
      }
    });

    it('전선 공격으로 방어자가 OUT되면 교전이 발생하지 않는다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10),
        createTestGeneral('player2_g1', 'player2', 17, 1), // 1 troop -> OUT
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_g1', 'player2_g1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result.direction).toBe('frontline');
        expect(result.data.result.isKnockOut).toBe(true);

        const attacker = result.data.state.generals.find(g => g.id === 'player1_g1');
        const defender = result.data.state.generals.find(g => g.id === 'player2_g1');

        expect(attacker?.status).toBe('active');
        expect(attacker?.engagedWith).toBeUndefined();
        expect(defender?.status).toBe('out');
      }
    });

    it('이미 교전 중인 상태에서 전선 공격해도 교전 상태 유지', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_g1', 'player2_g1');

      expect(result.success).toBe(true);
      if (result.success) {
        const attacker = result.data.state.generals.find(g => g.id === 'player1_g1');
        const defender = result.data.state.generals.find(g => g.id === 'player2_g1');

        expect(attacker?.status).toBe('engaged');
        expect(attacker?.engagedWith).toBe('player2_g1');
        expect(defender?.status).toBe('engaged');
        expect(defender?.engagedWith).toBe('player1_g1');
        expect(defender?.troops).toBe(9);
      }
    });

    it('교전 중 공격으로 상대가 OUT되면 공격자의 교전이 해제된다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 1, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_g1', 'player2_g1');

      expect(result.success).toBe(true);
      if (result.success) {
        const attacker = result.data.state.generals.find(g => g.id === 'player1_g1');
        const defender = result.data.state.generals.find(g => g.id === 'player2_g1');

        expect(attacker?.status).toBe('active');
        expect(attacker?.engagedWith).toBeUndefined();
        expect(defender?.status).toBe('out');
        expect(defender?.troops).toBe(0);
      }
    });
  });

  // ========================================
  // 교전 중 행동 제한
  // ========================================
  describe('교전 중 행동 제한', () => {
    it('교전 중 장수를 선택할 수 있다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);
      const result = selectGeneral(state, 'player1_g1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.selectedGeneralId).toBe('player1_g1');
      }
    });

    it('교전 중 장수는 교전 상대만 공격할 수 있다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
        createTestGeneral('player2_g2', 'player2', 11, 10), // 다른 적
      ];
      const state = createTestGameState(generals);

      // 교전 상대 공격 가능
      expect(canAttack(state, 'player1_g1', 'player2_g1')).toBe(true);

      // 다른 적 공격 불가
      expect(canAttack(state, 'player1_g1', 'player2_g2')).toBe(false);
    });

    it('교전 중 장수가 다른 적을 공격하면 에러를 반환한다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
        createTestGeneral('player2_g2', 'player2', 11, 10),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_g1', 'player2_g2');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ENGAGED_CANNOT_ATTACK_OTHER');
      }
    });

    it('교전 중이지 않은 장수는 제한 없이 공격할 수 있다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10), // active
        createTestGeneral('player2_g1', 'player2', 11, 10),
        createTestGeneral('player2_g2', 'player2', 17, 10),
      ];
      const state = createTestGameState(generals);

      expect(canAttack(state, 'player1_g1', 'player2_g1')).toBe(true);
      expect(canAttack(state, 'player1_g1', 'player2_g2')).toBe(true);
    });

    it('교전 중 장수도 이동 가능 타일을 계산할 수 있다 (이탈 옵션)', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);
      const movable = getMovableTilesForGeneral(state, 'player1_g1');

      // engaged 상태에서도 이동 가능 타일이 반환되어야 함
      expect(movable.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // 이탈 (GDD §6.4)
  // ========================================
  describe('이탈 (Disengage)', () => {
    it('DISENGAGE_DAMAGE 상수가 2이다', () => {
      expect(COMBAT.DISENGAGE_DAMAGE).toBe(2);
    });

    it('교전 중 이동 시 이탈자에게 피해 2가 적용된다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);

      // 이동 가능 타일 중 하나로 이동
      const movable = getMovableTilesForGeneral(state, 'player1_g1');
      expect(movable.length).toBeGreaterThan(0);

      const result = moveGeneral(state, 'player1_g1', movable[0]);

      expect(result.success).toBe(true);
      if (result.success) {
        const mover = result.data.generals.find(g => g.id === 'player1_g1');
        expect(mover?.troops).toBe(8); // 10 - 2 (disengage damage)
        expect(mover?.status).toBe('active');
        expect(mover?.engagedWith).toBeUndefined();
        expect(mover?.position).toBe(movable[0]);
      }
    });

    it('이탈 시 양측 모두 교전 해제된다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);
      const movable = getMovableTilesForGeneral(state, 'player1_g1');
      const result = moveGeneral(state, 'player1_g1', movable[0]);

      expect(result.success).toBe(true);
      if (result.success) {
        const opponent = result.data.generals.find(g => g.id === 'player2_g1');
        expect(opponent?.status).toBe('active');
        expect(opponent?.engagedWith).toBeUndefined();
      }
    });

    it('이탈 시 행동력이 1 소모된다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals, 'player1', 3);
      const movable = getMovableTilesForGeneral(state, 'player1_g1');
      const result = moveGeneral(state, 'player1_g1', movable[0]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actionsRemaining).toBe(2);
      }
    });

    it('이탈 시 병력이 2 이하이면 전멸(OUT) 처리된다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 2, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);
      const movable = getMovableTilesForGeneral(state, 'player1_g1');
      const result = moveGeneral(state, 'player1_g1', movable[0]);

      expect(result.success).toBe(true);
      if (result.success) {
        const mover = result.data.generals.find(g => g.id === 'player1_g1');
        expect(mover?.troops).toBe(0);
        expect(mover?.status).toBe('out');
        expect(mover?.position).toBeNull();
        expect(mover?.engagedWith).toBeUndefined();

        // 상대도 교전 해제
        const opponent = result.data.generals.find(g => g.id === 'player2_g1');
        expect(opponent?.status).toBe('active');
        expect(opponent?.engagedWith).toBeUndefined();
      }
    });

    it('이탈 시 병력이 1이면 전멸 처리된다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 1, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);
      const movable = getMovableTilesForGeneral(state, 'player1_g1');
      const result = moveGeneral(state, 'player1_g1', movable[0]);

      expect(result.success).toBe(true);
      if (result.success) {
        const mover = result.data.generals.find(g => g.id === 'player1_g1');
        expect(mover?.troops).toBe(0);
        expect(mover?.status).toBe('out');
        expect(mover?.position).toBeNull();
      }
    });

    it('이탈 전멸 시에도 행동력이 1 소모된다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 1, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 10, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals, 'player1', 3);
      const movable = getMovableTilesForGeneral(state, 'player1_g1');
      const result = moveGeneral(state, 'player1_g1', movable[0]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actionsRemaining).toBe(2);
      }
    });

    it('일반 이동(비교전)은 이탈 페널티 없이 정상 이동한다', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10), // active, not engaged
      ];
      const state = createTestGameState(generals);
      const movable = getMovableTilesForGeneral(state, 'player1_g1');
      expect(movable.length).toBeGreaterThan(0);

      const result = moveGeneral(state, 'player1_g1', movable[0]);

      expect(result.success).toBe(true);
      if (result.success) {
        const mover = result.data.generals.find(g => g.id === 'player1_g1');
        expect(mover?.troops).toBe(10); // 변동 없음
        expect(mover?.position).toBe(movable[0]);
        expect(mover?.status).toBe('active');
      }
    });
  });

  // ========================================
  // 교전 해제 시나리오
  // ========================================
  describe('교전 해제 시나리오', () => {
    it('교전 상대가 전멸하면 교전이 해제된다 (해/달 공격)', () => {
      // 교전 중이지만 해/달 방향으로 공격 가능한 상황은 불가능 (교전 상대만 공격 가능)
      // 따라서 이 테스트는 전선 공격으로 상대를 OUT시키는 시나리오
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 1, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);
      const result = executeAttack(state, 'player1_g1', 'player2_g1');

      expect(result.success).toBe(true);
      if (result.success) {
        const attacker = result.data.state.generals.find(g => g.id === 'player1_g1');
        expect(attacker?.status).toBe('active');
        expect(attacker?.engagedWith).toBeUndefined();
      }
    });
  });

  // ========================================
  // 복합 시나리오
  // ========================================
  describe('복합 시나리오', () => {
    it('전선 공격 → 교전 진입 → 다음 턴에서 이탈 시나리오', () => {
      // 1단계: 전선 공격으로 교전 진입
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10),
        createTestGeneral('player2_g1', 'player2', 17, 10),
      ];
      const state = createTestGameState(generals);
      const attackResult = executeAttack(state, 'player1_g1', 'player2_g1');

      expect(attackResult.success).toBe(true);
      if (!attackResult.success) return;

      // 교전 상태 확인
      const afterAttack = attackResult.data.state;
      const attackerAfter = afterAttack.generals.find(g => g.id === 'player1_g1');
      expect(attackerAfter?.status).toBe('engaged');

      // 2단계: 다음 턴 시뮬레이션 (player2의 턴)
      const nextTurnState: GameState = {
        ...afterAttack,
        currentPlayer: 'player2',
        actionsRemaining: 3,
        performedActions: [],
      };

      // player2의 교전 장수가 이탈
      const movable = getMovableTilesForGeneral(nextTurnState, 'player2_g1');
      expect(movable.length).toBeGreaterThan(0);

      const moveResult = moveGeneral(nextTurnState, 'player2_g1', movable[0]);

      expect(moveResult.success).toBe(true);
      if (moveResult.success) {
        const p2General = moveResult.data.generals.find(g => g.id === 'player2_g1');
        expect(p2General?.troops).toBe(7); // 9 - 2 (disengage)
        expect(p2General?.status).toBe('active');
        expect(p2General?.engagedWith).toBeUndefined();

        const p1General = moveResult.data.generals.find(g => g.id === 'player1_g1');
        expect(p1General?.status).toBe('active');
        expect(p1General?.engagedWith).toBeUndefined();
      }
    });

    it('교전 중 계속 전선 공격하여 상대 전멸 시나리오', () => {
      const generals = [
        createTestGeneral('player1_g1', 'player1', 12, 10, 'engaged', DEFAULT_STATS, 'player2_g1'),
        createTestGeneral('player2_g1', 'player2', 17, 2, 'engaged', DEFAULT_STATS, 'player1_g1'),
      ];
      const state = createTestGameState(generals);

      // 첫 번째 공격: 2 → 1
      const result1 = executeAttack(state, 'player1_g1', 'player2_g1');
      expect(result1.success).toBe(true);
      if (!result1.success) return;

      const defender1 = result1.data.state.generals.find(g => g.id === 'player2_g1');
      expect(defender1?.troops).toBe(1);
      expect(defender1?.status).toBe('engaged');

      // 다음 턴: player2 공격 (교전 중이므로 교전 상대만 공격 가능)
      const p2Turn: GameState = {
        ...result1.data.state,
        currentPlayer: 'player2',
        actionsRemaining: 3,
        performedActions: [],
      };
      const result2 = executeAttack(p2Turn, 'player2_g1', 'player1_g1');
      expect(result2.success).toBe(true);
      if (!result2.success) return;

      const p1After = result2.data.state.generals.find(g => g.id === 'player1_g1');
      expect(p1After?.troops).toBe(9); // 10 - 1

      // 다시 player1 턴: 최종 공격으로 전멸
      const p1Turn: GameState = {
        ...result2.data.state,
        currentPlayer: 'player1',
        actionsRemaining: 3,
        performedActions: [],
      };
      const result3 = executeAttack(p1Turn, 'player1_g1', 'player2_g1');
      expect(result3.success).toBe(true);
      if (!result3.success) return;

      const defenderFinal = result3.data.state.generals.find(g => g.id === 'player2_g1');
      expect(defenderFinal?.troops).toBe(0);
      expect(defenderFinal?.status).toBe('out');

      const attackerFinal = result3.data.state.generals.find(g => g.id === 'player1_g1');
      expect(attackerFinal?.status).toBe('active');
      expect(attackerFinal?.engagedWith).toBeUndefined();
    });
  });
});
