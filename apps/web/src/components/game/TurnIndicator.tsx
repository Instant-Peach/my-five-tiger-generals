/**
 * TurnIndicator Component
 *
 * 현재 턴 정보를 표시하는 UI 컴포넌트입니다.
 * Story 5-2: 현재 턴 표시 (Current Turn Display)
 * Story 5-3: 60초 타이머 (Sixty Second Timer)
 *
 * AC1: 게임 HUD 영역에 현재 턴 정보 표시
 * AC2: 플레이어 색상 구분 (Player 1: 푸른색, Player 2: 붉은색)
 * AC3: 턴 번호 표시
 * AC4: 턴 전환 시 UI 업데이트 (색상 변경, 애니메이션)
 * Story 5-3 AC1: TurnIndicator 근처 또는 내부에 타이머 표시
 */

import { useState, useEffect } from 'react';
import { TurnTimer } from './TurnTimer';
import './TurnIndicator.css';

export interface TurnIndicatorProps {
  /** 현재 플레이어 */
  currentPlayer: 'player1' | 'player2';
  /** 현재 턴 번호 */
  turn: number;
  /** Story 5-3: 남은 시간 (초) */
  remainingTime?: number;
}

/**
 * 턴 표시 컴포넌트
 *
 * - Player 1: 푸른색 계열 (#2563EB, 아군)
 * - Player 2: 붉은색 계열 (#DC2626, 적군)
 * - 색맹 지원: 아이콘으로 추가 시각적 구분
 * - 턴 전환 시 펄스 애니메이션
 * - Story 5-3: 타이머 통합
 */
export function TurnIndicator({
  currentPlayer,
  turn,
  remainingTime = 60,
}: TurnIndicatorProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isPlayer1 = currentPlayer === 'player1';

  // 턴 전환 시 애니메이션 트리거
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [currentPlayer]);

  // 플레이어별 색상 클래스
  const playerColorClass = isPlayer1
    ? 'turn-indicator--player1'
    : 'turn-indicator--player2';

  // 플레이어 이름과 아이콘 (색맹 지원)
  const playerName = isPlayer1 ? 'Player 1' : 'Player 2';
  const playerIcon = isPlayer1 ? '🔵' : '🔴';

  return (
    <div
      className={`
        turn-indicator
        ${playerColorClass}
        ${isTransitioning ? 'turn-indicator--transitioning' : ''}
      `.trim()}
      role="status"
      aria-live="polite"
      aria-label={`${playerName}의 턴, 턴 ${turn}`}
    >
      <div className="turn-indicator__turn-number">
        턴 {turn}
      </div>
      <div className="turn-indicator__player">
        <span className="turn-indicator__icon" aria-hidden="true">
          {playerIcon}
        </span>
        <span>{playerName}의 턴</span>
      </div>
      {/* Story 5-3: 타이머 표시 */}
      <TurnTimer remainingTime={remainingTime} />
    </div>
  );
}
