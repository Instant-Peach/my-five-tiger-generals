/**
 * Turn Timer Logic
 *
 * 턴 타이머 순수 로직
 * Story 5-3: 60초 타이머 (Sixty Second Timer)
 *
 * AC2: 타이머 카운트다운 로직
 * - 턴 시작 시 60초부터 카운트다운 시작
 * - 1초마다 감소
 * - 0초 도달 시 타이머 정지
 *
 * AC3: 턴 전환 시 타이머 리셋
 * - 'turn:start' 이벤트 수신 시 타이머를 60초로 리셋
 *
 * 특징:
 * - Phaser 의존성 없는 순수 TypeScript
 * - Phase 2 서버에서 재사용 가능
 */

import { GAME } from '../constants/game';

/**
 * 타이머 상태 인터페이스
 */
export interface TurnTimerState {
  /** 남은 시간 (초) */
  remainingTime: number;
  /** 타이머 실행 중 여부 */
  isRunning: boolean;
}

/**
 * 초기 타이머 상태 생성
 *
 * @returns 60초로 설정된 초기 타이머 상태 (정지 상태)
 */
export function createTurnTimerState(): TurnTimerState {
  return {
    remainingTime: GAME.TURN_TIME_LIMIT,
    isRunning: false,
  };
}

/**
 * 타이머 시작
 *
 * @param state - 현재 타이머 상태
 * @returns 실행 중으로 변경된 타이머 상태
 */
export function startTimer(state: TurnTimerState): TurnTimerState {
  return { ...state, isRunning: true };
}

/**
 * 타이머 정지
 *
 * @param state - 현재 타이머 상태
 * @returns 정지 상태로 변경된 타이머 상태
 */
export function stopTimer(state: TurnTimerState): TurnTimerState {
  return { ...state, isRunning: false };
}

/**
 * 타이머 1초 감소 (tick)
 *
 * - 실행 중이 아니거나 남은 시간이 0 이하이면 아무 동작 안 함
 * - 1초 감소 후 0 미만이 되지 않도록 보장
 *
 * @param state - 현재 타이머 상태
 * @returns 1초 감소된 타이머 상태
 */
export function tickTimer(state: TurnTimerState): TurnTimerState {
  if (!state.isRunning || state.remainingTime <= 0) {
    return state;
  }
  return {
    ...state,
    remainingTime: Math.max(0, state.remainingTime - 1),
  };
}

/**
 * 타이머 리셋 (턴 전환 시 호출)
 *
 * AC3: 턴 전환 시 타이머 리셋
 * - 60초로 초기화
 * - 타이머 자동 시작
 *
 * @param state - 현재 타이머 상태 (사용되지 않음, 인터페이스 일관성용)
 * @returns 60초로 리셋되고 실행 중인 타이머 상태
 */
export function resetTimer(_state?: TurnTimerState): TurnTimerState {
  return {
    remainingTime: GAME.TURN_TIME_LIMIT,
    isRunning: true,
  };
}

/**
 * 타이머 일시정지
 *
 * @param state - 현재 타이머 상태
 * @returns 일시정지된 타이머 상태
 */
export function pauseTimer(state: TurnTimerState): TurnTimerState {
  return { ...state, isRunning: false };
}

/**
 * 타이머 재개
 *
 * @param state - 현재 타이머 상태
 * @returns 재개된 타이머 상태
 */
export function resumeTimer(state: TurnTimerState): TurnTimerState {
  // 남은 시간이 0이면 재개하지 않음
  if (state.remainingTime <= 0) {
    return state;
  }
  return { ...state, isRunning: true };
}

/**
 * 타이머 만료 여부 확인
 *
 * @param state - 타이머 상태
 * @returns 남은 시간이 0 이하이면 true
 */
export function isTimerExpired(state: TurnTimerState): boolean {
  return state.remainingTime <= 0;
}

/**
 * 경고 상태 여부 확인 (30초 이하, 10초 초과)
 *
 * AC4: 30초 이하 주의 색상
 *
 * @param remainingTime - 남은 시간 (초)
 * @returns 경고 상태이면 true
 */
export function isTimerWarning(remainingTime: number): boolean {
  return (
    remainingTime <= GAME.TIMER_WARNING_THRESHOLD &&
    remainingTime > GAME.TIMER_CRITICAL_THRESHOLD
  );
}

/**
 * 위험 상태 여부 확인 (10초 이하)
 *
 * AC4: 10초 이하 경고 색상 + 깜빡임
 *
 * @param remainingTime - 남은 시간 (초)
 * @returns 위험 상태이면 true
 */
export function isTimerCritical(remainingTime: number): boolean {
  return remainingTime <= GAME.TIMER_CRITICAL_THRESHOLD;
}

/**
 * 특정 시간으로 타이머 설정 (테스트/디버그용)
 *
 * @param state - 현재 타이머 상태
 * @param time - 설정할 시간 (초)
 * @returns 시간이 설정된 타이머 상태
 */
export function setTimerTime(state: TurnTimerState, time: number): TurnTimerState {
  return {
    ...state,
    remainingTime: Math.max(0, Math.min(time, GAME.TURN_TIME_LIMIT)),
  };
}
