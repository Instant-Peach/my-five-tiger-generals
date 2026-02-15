/**
 * 결과 화면 관련 상수 정의
 *
 * Story 8-6: 결과 화면 (Result Screen)
 * 게임 종료 시 표시되는 통계 라벨 상수
 */

/**
 * 결과 화면 통계 라벨
 * Phase 2에서 항목 추가 시 여기에 정의
 */
export const RESULT_STATS_LABELS = {
  /** 총 턴 수 */
  totalTurns: '총 턴 수',
  /** Player 1 노크 횟수 */
  player1KnockCount: 'P1 노크 횟수',
  /** Player 2 노크 횟수 */
  player2KnockCount: 'P2 노크 횟수',
  /** Player 1 남은 장수 */
  player1RemainingGenerals: 'P1 남은 장수',
  /** Player 2 남은 장수 */
  player2RemainingGenerals: 'P2 남은 장수',
} as const;
