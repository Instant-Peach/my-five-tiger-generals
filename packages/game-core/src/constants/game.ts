/**
 * 게임 규칙 상수 정의
 *
 * GDD에 정의된 게임 규칙 관련 상수들
 */

/**
 * 게임 핵심 상수
 */
export const GAME = {
  /** 각 플레이어의 최대 장수 수 */
  MAX_GENERALS: 5,
  /** 턴당 최대 행동 횟수 */
  ACTIONS_PER_TURN: 3,
  /** 턴 제한 시간 (초) */
  TURN_TIME_LIMIT: 60,
  /** 타이머 경고 임계값 (초) - 노란색/주황색 표시 */
  TIMER_WARNING_THRESHOLD: 30,
  /** 타이머 위험 임계값 (초) - 빨간색 + 깜빡임 표시 */
  TIMER_CRITICAL_THRESHOLD: 10,
  /** 노크 승리 조건 (횟수) */
  KNOCK_COUNT_TO_WIN: 3,
  /** 장수 초기 목숨 수 */
  INITIAL_LIVES: 2,
} as const;
