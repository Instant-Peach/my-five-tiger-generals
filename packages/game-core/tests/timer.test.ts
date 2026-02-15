/**
 * Turn Timer Tests
 *
 * Story 5-3: 60초 타이머 (Sixty Second Timer)
 * Task 1.3: 타이머 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  createTurnTimerState,
  startTimer,
  stopTimer,
  tickTimer,
  resetTimer,
  pauseTimer,
  resumeTimer,
  isTimerExpired,
  isTimerWarning,
  isTimerCritical,
  setTimerTime,
} from '../src/turn/timer';
import { GAME } from '../src/constants/game';

describe('Turn Timer', () => {
  describe('createTurnTimerState', () => {
    it('초기 상태는 60초, 정지 상태여야 함', () => {
      const state = createTurnTimerState();

      expect(state.remainingTime).toBe(GAME.TURN_TIME_LIMIT);
      expect(state.remainingTime).toBe(60);
      expect(state.isRunning).toBe(false);
    });
  });

  describe('startTimer', () => {
    it('타이머를 실행 상태로 변경', () => {
      const state = createTurnTimerState();
      const started = startTimer(state);

      expect(started.isRunning).toBe(true);
      expect(started.remainingTime).toBe(60);
    });

    it('이미 실행 중이면 상태 유지', () => {
      const state = { remainingTime: 45, isRunning: true };
      const started = startTimer(state);

      expect(started.isRunning).toBe(true);
      expect(started.remainingTime).toBe(45);
    });
  });

  describe('stopTimer', () => {
    it('타이머를 정지 상태로 변경', () => {
      const state = { remainingTime: 45, isRunning: true };
      const stopped = stopTimer(state);

      expect(stopped.isRunning).toBe(false);
      expect(stopped.remainingTime).toBe(45);
    });
  });

  describe('tickTimer', () => {
    it('실행 중일 때 1초 감소', () => {
      const state = { remainingTime: 60, isRunning: true };
      const ticked = tickTimer(state);

      expect(ticked.remainingTime).toBe(59);
      expect(ticked.isRunning).toBe(true);
    });

    it('정지 상태일 때 변경 없음', () => {
      const state = { remainingTime: 60, isRunning: false };
      const ticked = tickTimer(state);

      expect(ticked.remainingTime).toBe(60);
      expect(ticked.isRunning).toBe(false);
    });

    it('0초에서 tick() 시 음수 되지 않음', () => {
      const state = { remainingTime: 0, isRunning: true };
      const ticked = tickTimer(state);

      expect(ticked.remainingTime).toBe(0);
    });

    it('1초에서 tick() 시 0초가 됨', () => {
      const state = { remainingTime: 1, isRunning: true };
      const ticked = tickTimer(state);

      expect(ticked.remainingTime).toBe(0);
    });

    it('연속 tick()으로 카운트다운 확인', () => {
      let state = { remainingTime: 5, isRunning: true };

      for (let i = 0; i < 5; i++) {
        state = tickTimer(state);
      }

      expect(state.remainingTime).toBe(0);
    });

    it('0초 이후 더 이상 감소하지 않음', () => {
      let state = { remainingTime: 2, isRunning: true };

      // 5번 tick 해도 0 이하로 안 감
      for (let i = 0; i < 5; i++) {
        state = tickTimer(state);
      }

      expect(state.remainingTime).toBe(0);
    });
  });

  describe('resetTimer', () => {
    it('reset() 시 60초로 초기화', () => {
      const state = { remainingTime: 15, isRunning: false };
      const reset = resetTimer(state);

      expect(reset.remainingTime).toBe(60);
    });

    it('reset() 시 타이머 자동 시작', () => {
      const state = { remainingTime: 0, isRunning: false };
      const reset = resetTimer(state);

      expect(reset.isRunning).toBe(true);
    });

    it('인자 없이 호출해도 동작', () => {
      const reset = resetTimer();

      expect(reset.remainingTime).toBe(60);
      expect(reset.isRunning).toBe(true);
    });
  });

  describe('pauseTimer / resumeTimer', () => {
    it('pause() 시 정지 상태로 변경', () => {
      const state = { remainingTime: 30, isRunning: true };
      const paused = pauseTimer(state);

      expect(paused.isRunning).toBe(false);
      expect(paused.remainingTime).toBe(30);
    });

    it('resume() 시 실행 상태로 변경', () => {
      const state = { remainingTime: 30, isRunning: false };
      const resumed = resumeTimer(state);

      expect(resumed.isRunning).toBe(true);
      expect(resumed.remainingTime).toBe(30);
    });

    it('0초에서 resume() 시 실행되지 않음', () => {
      const state = { remainingTime: 0, isRunning: false };
      const resumed = resumeTimer(state);

      expect(resumed.isRunning).toBe(false);
    });
  });

  describe('isTimerExpired', () => {
    it('남은 시간 0이면 만료', () => {
      const state = { remainingTime: 0, isRunning: false };
      expect(isTimerExpired(state)).toBe(true);
    });

    it('남은 시간이 있으면 만료 아님', () => {
      const state = { remainingTime: 1, isRunning: true };
      expect(isTimerExpired(state)).toBe(false);
    });

    it('음수 시간도 만료로 처리', () => {
      const state = { remainingTime: -1, isRunning: false };
      expect(isTimerExpired(state)).toBe(true);
    });
  });

  describe('isTimerWarning', () => {
    it('30초는 경고 상태', () => {
      expect(isTimerWarning(30)).toBe(true);
    });

    it('11초는 경고 상태', () => {
      expect(isTimerWarning(11)).toBe(true);
    });

    it('10초는 경고 상태 아님 (위험 상태)', () => {
      expect(isTimerWarning(10)).toBe(false);
    });

    it('31초는 경고 상태 아님 (정상)', () => {
      expect(isTimerWarning(31)).toBe(false);
    });

    it('5초는 경고 상태 아님 (위험 상태)', () => {
      expect(isTimerWarning(5)).toBe(false);
    });
  });

  describe('isTimerCritical', () => {
    it('10초는 위험 상태', () => {
      expect(isTimerCritical(10)).toBe(true);
    });

    it('1초는 위험 상태', () => {
      expect(isTimerCritical(1)).toBe(true);
    });

    it('0초는 위험 상태', () => {
      expect(isTimerCritical(0)).toBe(true);
    });

    it('11초는 위험 상태 아님', () => {
      expect(isTimerCritical(11)).toBe(false);
    });
  });

  describe('setTimerTime', () => {
    it('특정 시간으로 설정', () => {
      const state = { remainingTime: 60, isRunning: true };
      const updated = setTimerTime(state, 30);

      expect(updated.remainingTime).toBe(30);
      expect(updated.isRunning).toBe(true);
    });

    it('최대값(60초) 초과 시 60초로 제한', () => {
      const state = { remainingTime: 30, isRunning: true };
      const updated = setTimerTime(state, 100);

      expect(updated.remainingTime).toBe(60);
    });

    it('음수 시 0으로 제한', () => {
      const state = { remainingTime: 30, isRunning: true };
      const updated = setTimerTime(state, -10);

      expect(updated.remainingTime).toBe(0);
    });
  });

  describe('통합 시나리오: 전체 턴 사이클', () => {
    it('턴 시작 -> 카운트다운 -> 리셋 사이클', () => {
      // 1. 초기 상태
      let state = createTurnTimerState();
      expect(state.remainingTime).toBe(60);
      expect(state.isRunning).toBe(false);

      // 2. 타이머 시작
      state = startTimer(state);
      expect(state.isRunning).toBe(true);

      // 3. 몇 번 tick (시뮬레이션)
      for (let i = 0; i < 10; i++) {
        state = tickTimer(state);
      }
      expect(state.remainingTime).toBe(50);

      // 4. 턴 종료 -> 리셋
      state = resetTimer(state);
      expect(state.remainingTime).toBe(60);
      expect(state.isRunning).toBe(true);
    });

    it('경고 -> 위험 -> 만료 전환 확인', () => {
      // 31초: 정상 상태
      expect(isTimerWarning(31)).toBe(false);
      expect(isTimerCritical(31)).toBe(false);

      // 30초: 경고 상태 시작
      expect(isTimerWarning(30)).toBe(true);
      expect(isTimerCritical(30)).toBe(false);

      // 11초: 여전히 경고 상태
      expect(isTimerWarning(11)).toBe(true);
      expect(isTimerCritical(11)).toBe(false);

      // 10초: 위험 상태 시작
      expect(isTimerWarning(10)).toBe(false);
      expect(isTimerCritical(10)).toBe(true);

      // 0초: 만료
      const expiredState = { remainingTime: 0, isRunning: false };
      expect(isTimerExpired(expiredState)).toBe(true);
    });
  });
});
