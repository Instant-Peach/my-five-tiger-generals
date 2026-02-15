/**
 * KnockButton Component
 *
 * 노크 버튼 UI 컴포넌트입니다.
 * Story 6-1: 노크 행동 (Knock Action)
 *
 * AC5: 노크 버튼 UI
 * - 장수가 상대 home에 위치할 때 노크 버튼 표시
 * - 노크 불가 조건이면 버튼 비활성화 또는 숨김
 * - 노크 실행 시 시각적 피드백
 * - 현재 노크 카운트 표시
 */

import { useCallback } from 'react';
import './KnockButton.css';

export interface KnockButtonProps {
  /** 버튼 표시 여부 */
  isVisible: boolean;
  /** 버튼 활성화 여부 */
  isEnabled: boolean;
  /** 현재 노크 카운트 */
  knockCount: number;
  /** 최대 노크 카운트 (승리 조건) */
  maxKnockCount: number;
  /** 노크 실행 콜백 */
  onKnock: () => void;
}

/**
 * 노크 버튼 컴포넌트
 *
 * - 최소 44x44px 터치 타겟 (모바일 접근성)
 * - 황금색 배경 (GDD의 중요 정보/승리 컬러)
 * - 노크 카운트를 시각적 도트로 표시
 * - 펄스 애니메이션으로 카운트 증가 강조
 */
export function KnockButton({
  isVisible,
  isEnabled,
  knockCount,
  maxKnockCount,
  onKnock,
}: KnockButtonProps) {
  const handleClick = useCallback(() => {
    if (isEnabled) {
      onKnock();
    }
  }, [onKnock, isEnabled]);

  if (!isVisible) return null;

  return (
    <button
      className={`knock-button ${isEnabled ? '' : 'disabled'} ${knockCount > 0 ? 'has-count' : ''}`}
      onClick={handleClick}
      disabled={!isEnabled}
      aria-label={`노크 ${knockCount}/${maxKnockCount}`}
    >
      <span className="knock-icon">&#x270A;</span>
      <span className="knock-text">노크</span>
      <span className="knock-count-dots">
        {Array.from({ length: maxKnockCount }, (_, i) => (
          <span
            key={i}
            className={`knock-dot ${i < knockCount ? 'filled' : ''}`}
          />
        ))}
      </span>
      <span className="knock-count-text">{knockCount}/{maxKnockCount}</span>
    </button>
  );
}
