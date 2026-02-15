/**
 * SurrenderButton Component
 *
 * Story 6-5: 항복 (Surrender)
 *
 * AC2: 항복 버튼 UI
 * - 게임 HUD에 항복 버튼 배치
 * - 최소 44x44px 터치 타겟 (모바일 접근성)
 * - 게임 종료 상태에서는 비활성화
 * - 양쪽 플레이어 모두 자신의 턴/상대 턴 상관없이 항복 가능
 */

import { useCallback } from 'react';
import './SurrenderButton.css';

export interface SurrenderButtonProps {
  /** 항복 버튼 클릭 콜백 (확인 모달 표시용) */
  onSurrender: () => void;
  /** 게임 종료 여부 */
  isGameEnded: boolean;
}

/**
 * 항복 버튼 컴포넌트
 *
 * - 최소 44x44px 터치 타겟 (모바일 접근성)
 * - 위험 색상 계열 (빨간색)로 시각적 구분
 * - 게임 종료 시 비활성화
 */
export function SurrenderButton({ onSurrender, isGameEnded }: SurrenderButtonProps) {
  const handleClick = useCallback(() => {
    if (!isGameEnded) {
      onSurrender();
    }
  }, [onSurrender, isGameEnded]);

  return (
    <button
      className="action-btn surrender-button"
      onClick={handleClick}
      disabled={isGameEnded}
      aria-label="항복"
    >
      항복
    </button>
  );
}
