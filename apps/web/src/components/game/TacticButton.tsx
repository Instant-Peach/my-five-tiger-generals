/**
 * TacticButton Component
 *
 * 책략 버튼 UI 컴포넌트입니다.
 * Story 8-4: 책략 선택 UI (Tactic Selection UI)
 *
 * 책략은 플레이어 단위 액션이므로 장수 선택과 무관하게 항상 활성화.
 * 장수가 필요한 책략은 책략 선택 후 장수 선택 단계에서 처리.
 * 게임 종료 시에만 비활성화.
 */

import { useCallback, forwardRef } from 'react';
import './TacticButton.css';

export interface TacticButtonProps {
  /** 게임 종료 여부 */
  isGameEnded: boolean;
  /** 클릭 핸들러 (패널 열기) */
  onClick: () => void;
}

export const TacticButton = forwardRef<HTMLButtonElement, TacticButtonProps>(
  function TacticButton({ isGameEnded, onClick }, ref) {
    const handleClick = useCallback(() => {
      if (!isGameEnded) {
        onClick();
      }
    }, [onClick, isGameEnded]);

    return (
      <button
        ref={ref}
        className="action-btn tactic-button"
        onClick={handleClick}
        disabled={isGameEnded}
        aria-label="책략 메뉴 열기"
        type="button"
        data-testid="tactic-button"
      >
        책략
      </button>
    );
  },
);
