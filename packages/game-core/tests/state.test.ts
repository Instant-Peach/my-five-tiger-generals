/**
 * 게임 상태 시스템 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGenerals } from '../src/generals/generals';
import { GENERAL_ORDER, PLAYER_START_TILES } from '../src/generals/constants';
import { createInitialGameState } from '../src/state/initialState';
import {
  getGeneralAtTile,
  getGeneralById,
  getGeneralsByPlayer,
  isTileOccupied,
  getSelectedGeneral,
  isGeneralSelected,
  getGeneralStats,
} from '../src/state/queries';
import { selectGeneral, deselectGeneral } from '../src/state/actions';
import type { GameState } from '../src/state/types';

describe('게임 상태 시스템', () => {
  let testState: GameState;

  beforeEach(() => {
    const player1Generals = createInitialGenerals('player1');
    const player2Generals = createInitialGenerals('player2');

    testState = {
      phase: 'playing',
      turnPhase: 'select',
      currentPlayer: 'player1',
      turn: 1,
      generals: [...player1Generals, ...player2Generals],
      selectedGeneralId: null,
      actionsRemaining: 3,
      performedActions: [],
      player1KnockCount: 0,
      player2KnockCount: 0,
    };
  });

  describe('GameState 타입 (Task 2.2)', () => {
    it('GameState가 올바른 구조를 가진다', () => {
      expect(testState.phase).toBe('playing');
      expect(testState.turnPhase).toBe('select');
      expect(testState.currentPlayer).toBe('player1');
      expect(testState.turn).toBe(1);
      expect(testState.generals).toHaveLength(10); // 양측 5명씩
    });

    it('phase가 setup, playing, ended 값을 가질 수 있다', () => {
      const setupState: GameState = { ...testState, phase: 'setup' };
      const playingState: GameState = { ...testState, phase: 'playing' };
      const endedState: GameState = { ...testState, phase: 'ended' };

      expect(setupState.phase).toBe('setup');
      expect(playingState.phase).toBe('playing');
      expect(endedState.phase).toBe('ended');
    });

    it('turnPhase가 select, action, confirm 값을 가질 수 있다', () => {
      const selectState: GameState = { ...testState, turnPhase: 'select' };
      const actionState: GameState = { ...testState, turnPhase: 'action' };
      const confirmState: GameState = { ...testState, turnPhase: 'confirm' };

      expect(selectState.turnPhase).toBe('select');
      expect(actionState.turnPhase).toBe('action');
      expect(confirmState.turnPhase).toBe('confirm');
    });
  });

  describe('장수 조회 함수 (Task 2.3)', () => {
    describe('getGeneralAtTile', () => {
      it('타일 ID로 장수를 조회할 수 있다', () => {
        const general = getGeneralAtTile(testState, 25);
        expect(general).toBeDefined();
        expect(general?.owner).toBe('player1');
        expect(general?.baseId).toBe('guanyu'); // 첫 번째 장수
      });

      it('Player 2 타일에서 장수를 조회할 수 있다', () => {
        const general = getGeneralAtTile(testState, 0);
        expect(general).toBeDefined();
        expect(general?.owner).toBe('player2');
        expect(general?.baseId).toBe('guanyu');
      });

      it('빈 타일은 undefined를 반환한다', () => {
        const general = getGeneralAtTile(testState, 10); // center 타일
        expect(general).toBeUndefined();
      });

      it('out 상태의 장수는 조회되지 않는다', () => {
        // 첫 번째 장수를 out 상태로 변경
        testState.generals[0].status = 'out';
        const general = getGeneralAtTile(testState, 25);
        expect(general).toBeUndefined();
      });
    });

    describe('getGeneralById', () => {
      it('ID로 장수를 조회할 수 있다', () => {
        const general = getGeneralById(testState, 'player1_guanyu');
        expect(general).toBeDefined();
        expect(general?.nameKo).toBe('관우');
        expect(general?.owner).toBe('player1');
      });

      it('존재하지 않는 ID는 undefined를 반환한다', () => {
        const general = getGeneralById(testState, 'player3_unknown');
        expect(general).toBeUndefined();
      });

      it('모든 장수를 ID로 조회할 수 있다', () => {
        const ids = [
          'player1_guanyu',
          'player1_zhangfei',
          'player1_zhaoyun',
          'player1_huangzhong',
          'player1_machao',
          'player2_guanyu',
          'player2_zhangfei',
          'player2_zhaoyun',
          'player2_huangzhong',
          'player2_machao',
        ];

        for (const id of ids) {
          const general = getGeneralById(testState, id);
          expect(general).toBeDefined();
          expect(general?.id).toBe(id);
        }
      });
    });

    describe('getGeneralsByPlayer', () => {
      it('Player 1의 장수 목록을 조회할 수 있다', () => {
        const generals = getGeneralsByPlayer(testState, 'player1');
        expect(generals).toHaveLength(5);
        expect(generals.every((g) => g.owner === 'player1')).toBe(true);
      });

      it('Player 2의 장수 목록을 조회할 수 있다', () => {
        const generals = getGeneralsByPlayer(testState, 'player2');
        expect(generals).toHaveLength(5);
        expect(generals.every((g) => g.owner === 'player2')).toBe(true);
      });

      it('out 상태의 장수는 목록에서 제외된다', () => {
        testState.generals[0].status = 'out';
        testState.generals[1].status = 'out';
        const generals = getGeneralsByPlayer(testState, 'player1');
        expect(generals).toHaveLength(3);
      });
    });

    describe('isTileOccupied', () => {
      it('장수가 있는 타일은 true를 반환한다', () => {
        expect(isTileOccupied(testState, 25)).toBe(true);
        expect(isTileOccupied(testState, 0)).toBe(true);
      });

      it('빈 타일은 false를 반환한다', () => {
        expect(isTileOccupied(testState, 10)).toBe(false);
        expect(isTileOccupied(testState, 15)).toBe(false);
      });

      it('out 상태 장수의 타일은 false를 반환한다', () => {
        testState.generals[0].status = 'out';
        expect(isTileOccupied(testState, 25)).toBe(false);
      });

      it('모든 시작 타일이 점유되어 있다', () => {
        // Player 1 시작 타일 (25-29)
        for (let i = 25; i <= 29; i++) {
          expect(isTileOccupied(testState, i)).toBe(true);
        }
        // Player 2 시작 타일 (0-4)
        for (let i = 0; i <= 4; i++) {
          expect(isTileOccupied(testState, i)).toBe(true);
        }
      });

      it('중앙 타일들은 비어 있다', () => {
        for (let i = 10; i <= 19; i++) {
          expect(isTileOccupied(testState, i)).toBe(false);
        }
      });
    });

    describe('getSelectedGeneral', () => {
      it('선택된 장수가 없으면 null을 반환한다', () => {
        expect(getSelectedGeneral(testState)).toBeNull();
      });

      it('선택된 장수를 반환한다', () => {
        testState.selectedGeneralId = 'player1_guanyu';
        const selected = getSelectedGeneral(testState);
        expect(selected).toBeDefined();
        expect(selected?.id).toBe('player1_guanyu');
        expect(selected?.nameKo).toBe('관우');
      });

      it('존재하지 않는 장수 ID가 선택되어 있으면 null을 반환한다', () => {
        testState.selectedGeneralId = 'invalid_id';
        expect(getSelectedGeneral(testState)).toBeNull();
      });
    });

    describe('isGeneralSelected', () => {
      it('선택되지 않은 상태에서 false를 반환한다', () => {
        expect(isGeneralSelected(testState, 'player1_guanyu')).toBe(false);
      });

      it('선택된 장수에 대해 true를 반환한다', () => {
        testState.selectedGeneralId = 'player1_guanyu';
        expect(isGeneralSelected(testState, 'player1_guanyu')).toBe(true);
      });

      it('선택되지 않은 장수에 대해 false를 반환한다', () => {
        testState.selectedGeneralId = 'player1_guanyu';
        expect(isGeneralSelected(testState, 'player1_zhangfei')).toBe(false);
      });
    });
  });

  describe('초기 게임 상태 생성 (Task 3)', () => {
    it('createInitialGameState가 올바른 초기 상태를 반환한다', () => {
      const state = createInitialGameState();

      expect(state.phase).toBe('playing');
      expect(state.turnPhase).toBe('select');
      expect(state.currentPlayer).toBe('player1');
      expect(state.turn).toBe(1);
      expect(state.generals).toHaveLength(10);
      expect(state.selectedGeneralId).toBeNull();
    });

    it('Player 1이 선공이다', () => {
      const state = createInitialGameState();
      expect(state.currentPlayer).toBe('player1');
    });

    it('GamePhase가 playing으로 설정된다', () => {
      const state = createInitialGameState();
      expect(state.phase).toBe('playing');
    });

    it('양측 장수 5명씩 총 10명이 배치된다', () => {
      const state = createInitialGameState();
      const player1Generals = getGeneralsByPlayer(state, 'player1');
      const player2Generals = getGeneralsByPlayer(state, 'player2');

      expect(player1Generals).toHaveLength(5);
      expect(player2Generals).toHaveLength(5);
    });

    it('Player 1 장수가 row 5 (타일 25-29)에 배치된다', () => {
      const state = createInitialGameState();

      for (let i = 0; i < 5; i++) {
        const general = getGeneralAtTile(state, PLAYER_START_TILES.player1[i]);
        expect(general).toBeDefined();
        expect(general?.owner).toBe('player1');
        expect(general?.baseId).toBe(GENERAL_ORDER[i]);
      }
    });

    it('Player 2 장수가 row 0 (타일 0-4)에 배치된다', () => {
      const state = createInitialGameState();

      for (let i = 0; i < 5; i++) {
        const general = getGeneralAtTile(state, PLAYER_START_TILES.player2[i]);
        expect(general).toBeDefined();
        expect(general?.owner).toBe('player2');
        expect(general?.baseId).toBe(GENERAL_ORDER[i]);
      }
    });

    it('모든 장수가 active 상태다', () => {
      const state = createInitialGameState();
      expect(state.generals.every((g) => g.status === 'active')).toBe(true);
    });

    it('각 장수의 초기 병력이 star × 2와 같다', () => {
      const state = createInitialGameState();
      for (const general of state.generals) {
        expect(general.troops).toBe(general.stats.star * 2);
      }
    });

    it('중앙 영역 타일은 비어 있다', () => {
      const state = createInitialGameState();
      // center 영역 타일 (row 2-3)
      for (let i = 10; i <= 19; i++) {
        expect(isTileOccupied(state, i)).toBe(false);
      }
    });
  });

  describe('통합 테스트: 게임 시작 → 배치 완료 시나리오', () => {
    it('게임 시작 시 모든 AC가 충족된다', () => {
      // AC1: 장수 데이터 모델 정의 확인
      const state = createInitialGameState();
      const guanyu = getGeneralById(state, 'player1_guanyu');
      expect(guanyu).toBeDefined();
      expect(guanyu?.stats.star).toBe(5);
      expect(guanyu?.stats.sun).toBe(4);
      expect(guanyu?.stats.moon).toBe(4);
      expect(guanyu?.stats.speed).toBe(2);

      // AC2: 양측 장수 10명 시작 구역에 자동 배치
      expect(state.generals).toHaveLength(10);
      const player1Positions = state.generals
        .filter((g) => g.owner === 'player1')
        .map((g) => g.position);
      const player2Positions = state.generals
        .filter((g) => g.owner === 'player2')
        .map((g) => g.position);
      expect(player1Positions).toEqual([25, 26, 27, 28, 29]);
      expect(player2Positions).toEqual([0, 1, 2, 3, 4]);

      // AC4: 장수 위치 정보가 게임 상태에 반영
      expect(getGeneralAtTile(state, 25)).toBeDefined();
      expect(getGeneralAtTile(state, 0)).toBeDefined();
      expect(getGeneralAtTile(state, 15)).toBeUndefined(); // 중앙은 비어있음

      // AC5: 배치 완료 후 게임 진행 가능 상태
      expect(state.phase).toBe('playing');
      expect(state.turnPhase).toBe('select');
      expect(state.currentPlayer).toBe('player1');
    });

    it('각 타일에 최대 1장수만 존재한다', () => {
      const state = createInitialGameState();
      const occupiedTiles = new Set<number>();

      for (const general of state.generals) {
        if (general.position !== null) {
          expect(occupiedTiles.has(general.position)).toBe(false);
          occupiedTiles.add(general.position);
        }
      }
    });

    it('같은 장수가 양측에 각각 존재한다', () => {
      const state = createInitialGameState();

      for (const baseId of GENERAL_ORDER) {
        const player1General = getGeneralById(state, `player1_${baseId}`);
        const player2General = getGeneralById(state, `player2_${baseId}`);

        expect(player1General).toBeDefined();
        expect(player2General).toBeDefined();
        expect(player1General?.baseId).toBe(baseId);
        expect(player2General?.baseId).toBe(baseId);
        expect(player1General?.nameKo).toBe(player2General?.nameKo);
      }
    });
  });

  describe('E2E 시나리오: 장수 선택 (Story 2-2)', () => {
    it('Player 1이 자신의 장수를 선택하고 해제한다', () => {
      // 초기 상태
      const state = createInitialGameState();
      expect(state.currentPlayer).toBe('player1');
      expect(state.selectedGeneralId).toBeNull();

      // 타일 25에 있는 관우 선택 (Player 1)
      const guanyu = getGeneralAtTile(state, 25);
      expect(guanyu).toBeDefined();
      expect(guanyu?.owner).toBe('player1');

      // 장수 선택
      const selected = selectGeneral(state, guanyu!.id);
      expect(selected.success).toBe(true);
      if (!selected.success) return;

      // 상태 검증
      expect(selected.data.selectedGeneralId).toBe(guanyu!.id);
      expect(getSelectedGeneral(selected.data)).toEqual(guanyu);
      expect(isGeneralSelected(selected.data, guanyu!.id)).toBe(true);

      // 선택 해제
      const deselected = deselectGeneral(selected.data);
      expect(deselected.selectedGeneralId).toBeNull();
      expect(getSelectedGeneral(deselected)).toBeNull();
    });

    it('Player 1이 상대 장수를 선택하려고 하면 실패한다', () => {
      const state = createInitialGameState();

      // 타일 0에 있는 관우 선택 시도 (Player 2)
      const enemyGuanyu = getGeneralAtTile(state, 0);
      expect(enemyGuanyu).toBeDefined();
      expect(enemyGuanyu?.owner).toBe('player2');

      // 장수 선택 시도
      const result = selectGeneral(state, enemyGuanyu!.id);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_OWNER');
        expect(result.error.message).toContain('상대 장수');
      }

      // 상태 변경 없음
      expect(state.selectedGeneralId).toBeNull();
    });

    it('Player 1이 장수를 선택하고 다른 장수로 변경한다', () => {
      const state = createInitialGameState();

      // 첫 번째 장수 선택 (관우)
      const guanyu = getGeneralById(state, 'player1_guanyu')!;
      const selected1 = selectGeneral(state, guanyu.id);
      expect(selected1.success).toBe(true);
      if (!selected1.success) return;

      expect(selected1.data.selectedGeneralId).toBe(guanyu.id);

      // 두 번째 장수로 변경 (장비)
      const zhangfei = getGeneralById(selected1.data, 'player1_zhangfei')!;
      const selected2 = selectGeneral(selected1.data, zhangfei.id);
      expect(selected2.success).toBe(true);
      if (!selected2.success) return;

      expect(selected2.data.selectedGeneralId).toBe(zhangfei.id);
      expect(getSelectedGeneral(selected2.data)?.id).toBe(zhangfei.id);
    });

    it('OUT 상태 장수는 선택할 수 없다', () => {
      const state = createInitialGameState();

      // 첫 번째 장수를 OUT 상태로 변경
      const guanyu = state.generals.find((g) => g.owner === 'player1')!;
      state.generals = state.generals.map((g) =>
        g.id === guanyu.id ? { ...g, status: 'out' as const } : g
      );

      // 선택 시도
      const result = selectGeneral(state, guanyu.id);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GENERAL_NOT_ACTIVE');
      }
    });

    it('Player 2 턴에는 Player 2 장수만 선택할 수 있다', () => {
      const state = createInitialGameState();

      // Player 2 턴으로 변경
      const player2State: GameState = {
        ...state,
        currentPlayer: 'player2',
      };

      // Player 2 장수 선택 성공
      const p2Guanyu = getGeneralById(player2State, 'player2_guanyu')!;
      const result1 = selectGeneral(player2State, p2Guanyu.id);
      expect(result1.success).toBe(true);

      // Player 1 장수 선택 실패
      const p1Guanyu = getGeneralById(player2State, 'player1_guanyu')!;
      const result2 = selectGeneral(player2State, p1Guanyu.id);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error.code).toBe('INVALID_OWNER');
      }
    });

    it('선택된 장수가 있는 상태에서 빈 타일 클릭 시나리오', () => {
      const state = createInitialGameState();

      // 장수 선택
      const guanyu = getGeneralById(state, 'player1_guanyu')!;
      const selected = selectGeneral(state, guanyu.id);
      expect(selected.success).toBe(true);
      if (!selected.success) return;

      expect(selected.data.selectedGeneralId).toBe(guanyu.id);

      // 빈 타일 클릭 (선택 해제)
      const deselected = deselectGeneral(selected.data);
      expect(deselected.selectedGeneralId).toBeNull();
    });

    it('모든 Player 1 장수를 순차적으로 선택할 수 있다', () => {
      let currentState = createInitialGameState();

      const player1Generals = getGeneralsByPlayer(currentState, 'player1');
      expect(player1Generals).toHaveLength(5);

      for (const general of player1Generals) {
        const result = selectGeneral(currentState, general.id);
        expect(result.success).toBe(true);
        if (!result.success) continue;

        expect(result.data.selectedGeneralId).toBe(general.id);
        expect(getSelectedGeneral(result.data)?.id).toBe(general.id);
        expect(isGeneralSelected(result.data, general.id)).toBe(true);

        currentState = result.data;
      }
    });
  });

  describe('getGeneralStats (Task 1.1, 1.2 - Story 2.3)', () => {
    it('장수 스탯 정보를 올바르게 조회한다', () => {
      const state = createInitialGameState();
      const general = state.generals[0]; // 첫 번째 장수

      const stats = getGeneralStats(state, general.id);

      expect(stats).not.toBeNull();
      expect(stats?.name).toBe(general.name);
      expect(stats?.nameKo).toBe(general.nameKo);
      expect(stats?.owner).toBe(general.owner);
      expect(stats?.stars).toBe(general.stats.star);
      expect(stats?.troops).toBe(general.troops);
      expect(stats?.maxTroops).toBe(general.stats.star * 2);
      expect(stats?.sun).toBe(general.stats.sun);
      expect(stats?.moon).toBe(general.stats.moon);
      expect(stats?.speed).toBe(general.stats.speed);
      expect(stats?.status).toBe(general.status);
    });

    it('존재하지 않는 장수 ID는 null을 반환한다', () => {
      const state = createInitialGameState();
      const stats = getGeneralStats(state, 'invalid_id');

      expect(stats).toBeNull();
    });

    it('병력이 변경된 장수의 스탯을 올바르게 조회한다', () => {
      const state = createInitialGameState();
      const general = state.generals[0];

      // 병력 감소 시뮬레이션
      general.troops = 3;

      const stats = getGeneralStats(state, general.id);

      expect(stats?.troops).toBe(3);
      expect(stats?.maxTroops).toBe(general.stats.star * 2);
    });

    it('OUT 상태 장수의 스탯을 올바르게 조회한다', () => {
      const state = createInitialGameState();
      const general = state.generals[0];

      // OUT 상태 시뮬레이션
      general.status = 'out';
      general.troops = 0;

      const stats = getGeneralStats(state, general.id);

      expect(stats).not.toBeNull();
      expect(stats?.status).toBe('out');
      expect(stats?.troops).toBe(0);
    });
  });
});
