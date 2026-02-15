/**
 * 게임 상태 액션 테스트
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { selectGeneral, deselectGeneral } from '../src/state/actions';
import { createInitialGameState } from '../src/state/initialState';
import type { GameState } from '../src/state/types';

describe('장수 선택 액션', () => {
  let testState: GameState;

  beforeEach(() => {
    testState = createInitialGameState();
  });

  describe('selectGeneral', () => {
    it('현재 플레이어의 활성 장수를 선택할 수 있다', () => {
      const result = selectGeneral(testState, 'player1_guanyu');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.selectedGeneralId).toBe('player1_guanyu');
      }
    });

    it('선택 성공 시 다른 상태는 변경되지 않는다', () => {
      const result = selectGeneral(testState, 'player1_guanyu');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phase).toBe(testState.phase);
        expect(result.data.currentPlayer).toBe(testState.currentPlayer);
        expect(result.data.turn).toBe(testState.turn);
        expect(result.data.generals).toBe(testState.generals);
      }
    });

    it('이미 선택된 장수를 다시 선택할 수 있다', () => {
      const result1 = selectGeneral(testState, 'player1_guanyu');
      expect(result1.success).toBe(true);

      if (result1.success) {
        const result2 = selectGeneral(result1.data, 'player1_guanyu');
        expect(result2.success).toBe(true);
      }
    });

    it('다른 장수로 선택을 변경할 수 있다', () => {
      const result1 = selectGeneral(testState, 'player1_guanyu');
      expect(result1.success).toBe(true);

      if (result1.success) {
        const result2 = selectGeneral(result1.data, 'player1_zhangfei');
        expect(result2.success).toBe(true);
        if (result2.success) {
          expect(result2.data.selectedGeneralId).toBe('player1_zhangfei');
        }
      }
    });

    it('존재하지 않는 장수 선택 시 GENERAL_NOT_FOUND 에러를 반환한다', () => {
      const result = selectGeneral(testState, 'invalid_id');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GENERAL_NOT_FOUND');
        expect(result.error.message).toContain('invalid_id');
      }
    });

    it('상대 플레이어 장수 선택 시 INVALID_OWNER 에러를 반환한다', () => {
      // Player 1의 턴에서 Player 2의 장수를 선택 시도
      const result = selectGeneral(testState, 'player2_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_OWNER');
        expect(result.error.message).toContain('상대 장수');
      }
    });

    it('out 상태 장수 선택 시 GENERAL_NOT_ACTIVE 에러를 반환한다', () => {
      // 장수를 out 상태로 변경
      testState.generals[0].status = 'out';
      const generalId = testState.generals[0].id;

      const result = selectGeneral(testState, generalId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GENERAL_NOT_ACTIVE');
        expect(result.error.message).toContain('선택할 수 없습니다');
      }
    });

    it('Player 2 턴에 Player 2 장수를 선택할 수 있다', () => {
      const player2State: GameState = {
        ...testState,
        currentPlayer: 'player2',
      };

      const result = selectGeneral(player2State, 'player2_guanyu');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.selectedGeneralId).toBe('player2_guanyu');
      }
    });

    it('Player 2 턴에 Player 1 장수 선택 시 에러를 반환한다', () => {
      const player2State: GameState = {
        ...testState,
        currentPlayer: 'player2',
      };

      const result = selectGeneral(player2State, 'player1_guanyu');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_OWNER');
      }
    });
  });

  describe('deselectGeneral', () => {
    it('선택된 장수를 해제할 수 있다', () => {
      const result = selectGeneral(testState, 'player1_guanyu');
      expect(result.success).toBe(true);

      if (result.success) {
        const deselected = deselectGeneral(result.data);
        expect(deselected.selectedGeneralId).toBeNull();
      }
    });

    it('선택이 없는 상태에서 해제해도 에러가 발생하지 않는다', () => {
      const deselected = deselectGeneral(testState);
      expect(deselected.selectedGeneralId).toBeNull();
    });

    it('해제 시 다른 상태는 변경되지 않는다', () => {
      const result = selectGeneral(testState, 'player1_guanyu');
      expect(result.success).toBe(true);

      if (result.success) {
        const deselected = deselectGeneral(result.data);
        expect(deselected.phase).toBe(result.data.phase);
        expect(deselected.currentPlayer).toBe(result.data.currentPlayer);
        expect(deselected.turn).toBe(result.data.turn);
        expect(deselected.generals).toBe(result.data.generals);
      }
    });

    it('원본 상태를 변경하지 않는다 (불변성)', () => {
      const result = selectGeneral(testState, 'player1_guanyu');
      expect(result.success).toBe(true);

      if (result.success) {
        const originalSelectedId = result.data.selectedGeneralId;
        deselectGeneral(result.data);
        expect(result.data.selectedGeneralId).toBe(originalSelectedId);
      }
    });
  });

  describe('불변성 테스트', () => {
    it('selectGeneral이 원본 상태를 변경하지 않는다', () => {
      const originalSelectedId = testState.selectedGeneralId;
      const originalGenerals = testState.generals;
      selectGeneral(testState, 'player1_guanyu');
      expect(testState.selectedGeneralId).toBe(originalSelectedId);
      expect(testState.generals).toBe(originalGenerals);
    });

    it('여러 번 선택해도 이전 상태는 변경되지 않는다', () => {
      const state1 = testState;
      const state1Generals = state1.generals;
      const result2 = selectGeneral(state1, 'player1_guanyu');
      expect(result2.success).toBe(true);

      if (result2.success) {
        const state2 = result2.data;
        const state2Generals = state2.generals;
        const result3 = selectGeneral(state2, 'player1_zhangfei');
        expect(result3.success).toBe(true);

        // state1과 state2는 변경되지 않아야 함
        expect(state1.selectedGeneralId).toBeNull();
        expect(state1.generals).toBe(state1Generals); // generals 배열 참조 불변
        expect(state2.selectedGeneralId).toBe('player1_guanyu');
        expect(state2.generals).toBe(state2Generals); // generals 배열 참조 불변
        if (result3.success) {
          expect(result3.data.selectedGeneralId).toBe('player1_zhangfei');
        }
      }
    });
  });
});
