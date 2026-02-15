/**
 * Result Constants Tests
 *
 * Story 8-6: 결과 화면 (Result Screen)
 * Task 5.3: RESULT_STATS_LABELS 존재 확인
 */

import { describe, it, expect } from 'vitest';
import { RESULT_STATS_LABELS } from '../../src/constants/result';

describe('RESULT_STATS_LABELS', () => {
  it('RESULT_STATS_LABELS 객체가 존재한다', () => {
    expect(RESULT_STATS_LABELS).toBeDefined();
  });

  it('totalTurns 라벨이 정의되어 있다', () => {
    expect(RESULT_STATS_LABELS.totalTurns).toBe('총 턴 수');
  });

  it('player1KnockCount 라벨이 정의되어 있다', () => {
    expect(RESULT_STATS_LABELS.player1KnockCount).toBe('P1 노크 횟수');
  });

  it('player2KnockCount 라벨이 정의되어 있다', () => {
    expect(RESULT_STATS_LABELS.player2KnockCount).toBe('P2 노크 횟수');
  });

  it('player1RemainingGenerals 라벨이 정의되어 있다', () => {
    expect(RESULT_STATS_LABELS.player1RemainingGenerals).toBe('P1 남은 장수');
  });

  it('player2RemainingGenerals 라벨이 정의되어 있다', () => {
    expect(RESULT_STATS_LABELS.player2RemainingGenerals).toBe('P2 남은 장수');
  });
});
