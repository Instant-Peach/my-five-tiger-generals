/**
 * TurnEndButton Component
 *
 * 턴 종료 버튼 UI 컴포넌트입니다.
 * Story 5-1: 턴 종료 버튼 (Turn End Button)
 *
 * AC1: 게임 HUD 영역에 "턴 종료" 버튼 표시
 * AC2: 내 턴일 때만 버튼 활성화, 상대 턴/게임 종료 시 비활성화
 */

import { useCallback } from 'react';
import './TurnEndButton.css';

export interface TurnEndButtonProps {
  /** 턴 종료 콜백 */
  onEndTurn: () => void;
  /** 내 턴 여부 (로컬 모드: 항상 true) */
  isMyTurn: boolean;
  /** 게임 종료 여부 */
  isGameEnded: boolean;
}

/**
 * 턴 종료 버튼 컴포넌트
 *
 * - 최소 44x44px 터치 타겟 (모바일 접근성)
 * - 활성화/비활성화 시각적 구분
 * - CSS 기반 호버/클릭 피드백 (:hover, :active 의사 클래스 사용)
 */
export function TurnEndButton({
  onEndTurn,
  isMyTurn,
  isGameEnded,
}: TurnEndButtonProps) {
  const handleClick = useCallback(() => {
    if (isMyTurn && !isGameEnded) {
      onEndTurn();
    }
  }, [onEndTurn, isMyTurn, isGameEnded]);

  const isDisabled = !isMyTurn || isGameEnded;

  return (
    <button
      className="action-btn turn-end-button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label="턴 종료"
    >
      턴 종료
    </button>
  );
}
