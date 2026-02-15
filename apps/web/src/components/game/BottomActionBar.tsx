/**
 * BottomActionBar Component
 *
 * 삼국지 영걸전 스타일 하단 액션바입니다.
 * 좌측: 설정, 턴 번호, 타이머, 행동 카운터
 * 우측: 항복, 책략, 턴 종료
 *
 * 모든 브레이크포인트에서 공통 사용합니다.
 */

import type { RefObject } from 'react';
import { TacticButton } from './TacticButton';
import { TurnEndButton } from './TurnEndButton';
import { SurrenderButton } from './SurrenderButton';
import { SettingsButton } from '../settings/SettingsButton';
import { TurnTimer } from './TurnTimer';
import { ActionCounter } from './ActionCounter';
import './BottomActionBar.css';

export interface BottomActionBarProps {
  /* 턴 정보 */
  turn: number;
  remainingTime: number;
  actionsRemaining: number;
  /* 책략 */
  isGameEnded: boolean;
  onTacticClick: () => void;
  tacticButtonRef: RefObject<HTMLButtonElement | null>;
  /* 설정 */
  onSettingsClick: () => void;
  settingsButtonRef: RefObject<HTMLButtonElement | null>;
  /* 항복 */
  onSurrender: () => void;
  /* 턴 종료 */
  onEndTurn: () => void;
  isMyTurn: boolean;
}

export function BottomActionBar({
  turn,
  remainingTime,
  actionsRemaining,
  isGameEnded,
  onTacticClick,
  tacticButtonRef,
  onSettingsClick,
  settingsButtonRef,
  onSurrender,
  onEndTurn,
  isMyTurn,
}: BottomActionBarProps) {
  return (
    <div className="bottom-action-bar" data-testid="bottom-action-bar">
      {/* 좌측: 설정 + 턴 정보 */}
      <div className="bottom-action-bar__left">
        <SettingsButton
          ref={settingsButtonRef}
          onClick={onSettingsClick}
          variant="game"
        />
        <span className="bottom-action-bar__turn-label">턴 {turn}</span>
        <TurnTimer remainingTime={remainingTime} />
        <ActionCounter actionsRemaining={actionsRemaining} />
      </div>

      {/* 우측: 시스템 + 게임 액션 */}
      <div className="bottom-action-bar__right">
        <SurrenderButton
          onSurrender={onSurrender}
          isGameEnded={isGameEnded}
        />
        <TacticButton
          ref={tacticButtonRef}
          isGameEnded={isGameEnded}
          onClick={onTacticClick}
        />
        <TurnEndButton
          onEndTurn={onEndTurn}
          isMyTurn={isMyTurn}
          isGameEnded={isGameEnded}
        />
      </div>
    </div>
  );
}
