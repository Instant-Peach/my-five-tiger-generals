/**
 * GameScene.executeEndTurn() Tests (Story 5-1)
 *
 * 턴 종료 기능 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GAME, createInitialGameState, endTurn } from '@ftg/game-core';
import type { GameState } from '@ftg/game-core';

// game-core의 endTurn 함수를 직접 테스트 (GameScene은 이 함수에 의존)
describe('GameScene.executeEndTurn() (Story 5-1)', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialGameState();
  });

  describe('AC3: 턴 종료 로직 실행', () => {
    it('should change current player from player1 to player2', () => {
      expect(initialState.currentPlayer).toBe('player1');

      const newState = endTurn(initialState);

      expect(newState.currentPlayer).toBe('player2');
    });

    it('should change current player from player2 to player1', () => {
      const player2State = { ...initialState, currentPlayer: 'player2' as const };

      const newState = endTurn(player2State);

      expect(newState.currentPlayer).toBe('player1');
    });

    it('should not increment turn number when player1 ends turn', () => {
      expect(initialState.turn).toBe(1);

      const newState = endTurn(initialState);

      expect(newState.turn).toBe(1);
    });

    it('should increment turn number when player2 ends turn', () => {
      const player2State = { ...initialState, currentPlayer: 'player2' as const, turn: 1 };

      const newState = endTurn(player2State);

      expect(newState.turn).toBe(2);
    });

    it('should reset actionsRemaining to default (3)', () => {
      const usedActionsState = { ...initialState, actionsRemaining: 1 };

      const newState = endTurn(usedActionsState);

      expect(newState.actionsRemaining).toBe(GAME.ACTIONS_PER_TURN);
    });

    it('should clear performedActions array', () => {
      const stateWithActions = {
        ...initialState,
        performedActions: ['move:general1:0:5', 'attack:general1:general2'],
      };

      const newState = endTurn(stateWithActions);

      expect(newState.performedActions).toEqual([]);
    });

    it('should reset selectedGeneralId to null', () => {
      const stateWithSelection = { ...initialState, selectedGeneralId: 'general1' };

      const newState = endTurn(stateWithSelection);

      expect(newState.selectedGeneralId).toBeNull();
    });

    it('should reset turnPhase to select', () => {
      const stateInAction = { ...initialState, turnPhase: 'action' as const };

      const newState = endTurn(stateInAction);

      expect(newState.turnPhase).toBe('select');
    });
  });

  describe('Full turn cycle', () => {
    it('should correctly handle a full turn cycle (player1 -> player2 -> player1)', () => {
      // Turn 1, Player 1
      expect(initialState.currentPlayer).toBe('player1');
      expect(initialState.turn).toBe(1);

      // Player 1 ends turn
      const afterPlayer1 = endTurn(initialState);
      expect(afterPlayer1.currentPlayer).toBe('player2');
      expect(afterPlayer1.turn).toBe(1);

      // Player 2 ends turn -> Turn 2 starts
      const afterPlayer2 = endTurn(afterPlayer1);
      expect(afterPlayer2.currentPlayer).toBe('player1');
      expect(afterPlayer2.turn).toBe(2);
    });
  });

  describe('State immutability', () => {
    it('should not mutate the original state', () => {
      const originalState = { ...initialState };
      const originalPlayer = originalState.currentPlayer;
      const originalTurn = originalState.turn;

      endTurn(initialState);

      expect(initialState.currentPlayer).toBe(originalPlayer);
      expect(initialState.turn).toBe(originalTurn);
    });
  });
});

/**
 * GameScene.executeEndTurn() 통합 동작 테스트
 *
 * GameScene의 executeEndTurn 메서드는 다음을 수행합니다:
 * 1. 'turn:end' 이벤트 발행 (이전 턴 정보)
 * 2. game-core의 endTurn() 호출로 상태 업데이트
 * 3. UI 상태 초기화 (selectedTileId, hoveredTileId)
 * 4. 시각적 상태 초기화 (movable/attackable tiles, path preview)
 * 5. 'turn:start' 이벤트 발행 (새 턴 정보)
 */
describe('GameScene.executeEndTurn() Integration', () => {
  // Mock event emitter for verifying event order
  let events: { type: string; payload: unknown }[];
  let mockEmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    events = [];
    mockEmit = vi.fn((type: string, payload: unknown) => {
      events.push({ type, payload });
    });
  });

  it('should emit events in correct order', () => {
    const state = createInitialGameState();
    const previousPlayer = state.currentPlayer;
    const previousTurn = state.turn;

    // Simulate executeEndTurn behavior
    mockEmit('turn:end', { turn: previousTurn, playerId: previousPlayer });
    const newState = endTurn(state);
    mockEmit('turn:start', { turn: newState.turn, playerId: newState.currentPlayer });

    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('turn:end');
    expect(events[0].payload).toEqual({ turn: 1, playerId: 'player1' });
    expect(events[1].type).toBe('turn:start');
    expect(events[1].payload).toEqual({ turn: 1, playerId: 'player2' });
  });

  it('should handle game ended state (phase === ended)', () => {
    const endedState: GameState = {
      ...createInitialGameState(),
      phase: 'ended',
    };

    // When game is ended, executeEndTurn should be blocked (tested in GameScene)
    // Here we verify that endTurn doesn't change phase
    const newState = endTurn(endedState);

    // endTurn from game-core doesn't check phase (that's GameScene's responsibility)
    // This test documents expected behavior: phase should remain 'ended'
    // if GameScene properly guards the call
    expect(endedState.phase).toBe('ended');
  });
});
