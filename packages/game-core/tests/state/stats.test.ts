/**
 * extractGameStats Tests
 *
 * Story 8-6: 결과 화면 (Result Screen)
 * Task 5.1, 5.2: 게임 상태에서 통계 추출 확인
 */

import { describe, it, expect } from 'vitest';
import { extractGameStats } from '../../src/state/stats';
import { createInitialGameState } from '../../src/state/initialState';
import type { GameState } from '../../src/state/types';

describe('extractGameStats', () => {
  it('초기 게임 상태에서 통계를 올바르게 추출한다', () => {
    const state = createInitialGameState();
    const stats = extractGameStats(state);

    expect(stats.totalTurns).toBe(1);
    expect(stats.player1KnockCount).toBe(0);
    expect(stats.player2KnockCount).toBe(0);
    expect(stats.player1RemainingGenerals).toBe(5);
    expect(stats.player2RemainingGenerals).toBe(5);
  });

  it('턴이 진행된 상태에서 총 턴 수를 정확히 추출한다', () => {
    const state = createInitialGameState();
    state.turn = 12;

    const stats = extractGameStats(state);
    expect(stats.totalTurns).toBe(12);
  });

  it('노크 횟수가 반영된 상태에서 정확히 추출한다', () => {
    const state = createInitialGameState();
    state.player1KnockCount = 3;
    state.player2KnockCount = 1;

    const stats = extractGameStats(state);
    expect(stats.player1KnockCount).toBe(3);
    expect(stats.player2KnockCount).toBe(1);
  });

  it('장수가 OUT된 상태에서 남은 장수 수를 정확히 추출한다', () => {
    const state = createInitialGameState();
    // Player 1 장수 2명 OUT
    state.generals[0].status = 'out';
    state.generals[1].status = 'out';

    const stats = extractGameStats(state);
    expect(stats.player1RemainingGenerals).toBe(3);
    expect(stats.player2RemainingGenerals).toBe(5);
  });

  it('노크 승리 종료 상태에서 통계가 정확하다', () => {
    const state = createInitialGameState();
    state.phase = 'ended';
    state.turn = 15;
    state.player1KnockCount = 3;
    state.player2KnockCount = 2;
    state.victoryResult = { winner: 'player1', reason: 'knock' };

    const stats = extractGameStats(state);
    expect(stats.totalTurns).toBe(15);
    expect(stats.player1KnockCount).toBe(3);
    expect(stats.player2KnockCount).toBe(2);
    expect(stats.player1RemainingGenerals).toBe(5);
    expect(stats.player2RemainingGenerals).toBe(5);
  });

  it('전멸 승리 종료 상태에서 통계가 정확하다', () => {
    const state = createInitialGameState();
    state.phase = 'ended';
    state.turn = 20;
    state.victoryResult = { winner: 'player1', reason: 'annihilation' };
    // Player 2 장수 전원 OUT은 아니지만, 병력 0 (annihilation은 총 병력 0)
    // 하지만 남은 장수는 active 상태 기준이므로 OUT된 것만 카운트

    const stats = extractGameStats(state);
    expect(stats.totalTurns).toBe(20);
  });

  it('와해 승리 종료 상태에서 통계가 정확하다', () => {
    const state = createInitialGameState();
    state.phase = 'ended';
    state.turn = 18;
    state.victoryResult = { winner: 'player1', reason: 'collapse' };
    // Player 2 장수 전원 OUT
    for (let i = 5; i < 10; i++) {
      state.generals[i].status = 'out';
    }

    const stats = extractGameStats(state);
    expect(stats.totalTurns).toBe(18);
    expect(stats.player2RemainingGenerals).toBe(0);
    expect(stats.player1RemainingGenerals).toBe(5);
  });

  it('항복 승리 종료 상태에서 통계가 정확하다', () => {
    const state = createInitialGameState();
    state.phase = 'ended';
    state.turn = 5;
    state.victoryResult = { winner: 'player1', reason: 'surrender' };

    const stats = extractGameStats(state);
    expect(stats.totalTurns).toBe(5);
    expect(stats.player1RemainingGenerals).toBe(5);
    expect(stats.player2RemainingGenerals).toBe(5);
  });

  it('양측 장수가 모두 OUT된 경우 남은 장수가 0이다', () => {
    const state = createInitialGameState();
    for (const general of state.generals) {
      general.status = 'out';
    }

    const stats = extractGameStats(state);
    expect(stats.player1RemainingGenerals).toBe(0);
    expect(stats.player2RemainingGenerals).toBe(0);
  });
});
