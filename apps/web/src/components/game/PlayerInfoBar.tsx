/**
 * PlayerInfoBar Component
 *
 * 게임 HUD 상단에 양 플레이어 정보를 통합 표시하는 바 컴포넌트입니다.
 * Story 8-2: 게임 HUD (Game HUD)
 *
 * AC1: 플레이어 정보 바
 * - 좌측: Player 1 정보 (이름, 노크 카운트)
 * - 중앙: 턴 번호 + 타이머 + 행동 카운터
 * - 우측: Player 2 정보 (이름, 노크 카운트)
 * - 현재 턴 플레이어 시각적 강조
 *
 * AC3: 턴/타이머 통합 표시
 * AC5: 반응형 레이아웃
 * AC6: 터치 타겟 접근성 (pointerEvents: 'none' - 표시 전용)
 */

import { TurnTimer } from './TurnTimer';
import { ActionCounter } from './ActionCounter';
import './PlayerInfoBar.css';

export interface PlayerInfoBarProps {
  /** 현재 플레이어 */
  currentPlayer: 'player1' | 'player2';
  /** 현재 턴 번호 */
  turn: number;
  /** 남은 시간 (초) */
  remainingTime: number;
  /** 남은 행동 횟수 */
  actionsRemaining: number;
  /** Player 1 노크 카운트 */
  player1KnockCount: number;
  /** Player 2 노크 카운트 */
  player2KnockCount: number;
  /** 최대 노크 카운트 (승리 조건, 기본값: 3) */
  maxKnockCount?: number;
}

/**
 * 노크 카운트 도트 렌더링
 */
function KnockDots({
  count,
  maxCount,
  testIdPrefix,
}: {
  count: number;
  maxCount: number;
  testIdPrefix: string;
}) {
  return (
    <span
      className="player-info-bar__knock-dots"
      data-testid={`${testIdPrefix}-knock-dots`}
      role="img"
      aria-label={`노크 ${count}/${maxCount}`}
    >
      {Array.from({ length: maxCount }, (_, i) => (
        <span
          key={i}
          className={`player-info-bar__knock-dot ${
            i < count ? 'player-info-bar__knock-dot--filled' : ''
          }`}
          data-testid={`${testIdPrefix}-knock-dot-${i}`}
        />
      ))}
    </span>
  );
}

/**
 * PlayerInfoBar 컴포넌트
 *
 * - Player 1: 파란색 (#2563EB)
 * - Player 2: 빨간색 (#DC2626)
 * - 현재 턴 플레이어: 금색 강조 (#ffd700)
 * - 색맹 지원: 실선(P1)/점선(P2) 테두리로 추가 구분
 * - 반응형: 모바일(320-430px)에서 이름 축약
 */
export function PlayerInfoBar({
  currentPlayer,
  turn,
  remainingTime,
  actionsRemaining,
  player1KnockCount,
  player2KnockCount,
  maxKnockCount = 3,
}: PlayerInfoBarProps) {
  const isPlayer1Turn = currentPlayer === 'player1';

  return (
    <div
      className="player-info-bar"
      role="status"
      aria-label={`턴 ${turn}, ${isPlayer1Turn ? 'Player 1' : 'Player 2'}의 턴, 남은 시간 ${remainingTime}초`}
      data-testid="player-info-bar"
    >
      {/* 좌측: Player 1 정보 */}
      <div
        className={`player-info-bar__player player-info-bar__player--p1 ${
          isPlayer1Turn ? 'player-info-bar__player--active' : ''
        }`}
        data-testid="player-info-p1"
      >
        <span className="player-info-bar__player-icon" aria-hidden="true">
          &#9650;{/* 실선 삼각형 - Player 1 색맹 지원 아이콘 */}
        </span>
        <span className="player-info-bar__player-name" data-testid="player-info-p1-name">
          <span className="player-info-bar__player-name--full">Player 1</span>
          <span className="player-info-bar__player-name--short">P1</span>
        </span>
        <KnockDots
          count={player1KnockCount}
          maxCount={maxKnockCount}
          testIdPrefix="p1"
        />
      </div>

      {/* 중앙: 턴 번호 + 타이머 + 행동 카운터 */}
      <div className="player-info-bar__center" data-testid="player-info-center">
        <div className="player-info-bar__turn-info">
          <span className="player-info-bar__turn-number" data-testid="turn-number">
            턴 {turn}
          </span>
          <TurnTimer remainingTime={remainingTime} />
        </div>
        <ActionCounter actionsRemaining={actionsRemaining} />
      </div>

      {/* 우측: Player 2 정보 */}
      <div
        className={`player-info-bar__player player-info-bar__player--p2 ${
          !isPlayer1Turn ? 'player-info-bar__player--active' : ''
        }`}
        data-testid="player-info-p2"
      >
        <KnockDots
          count={player2KnockCount}
          maxCount={maxKnockCount}
          testIdPrefix="p2"
        />
        <span className="player-info-bar__player-name" data-testid="player-info-p2-name">
          <span className="player-info-bar__player-name--full">Player 2</span>
          <span className="player-info-bar__player-name--short">P2</span>
        </span>
        <span className="player-info-bar__player-icon" aria-hidden="true">
          &#9660;{/* 역삼각형 - Player 2 색맹 지원 아이콘 */}
        </span>
      </div>
    </div>
  );
}
