/**
 * SettingsButton Component
 *
 * Story 8-5: 설정 메뉴 (Settings Menu)
 *
 * AC1: 게임 HUD에 설정 버튼 표시
 * AC2: 메인 메뉴에 설정 버튼 표시
 * AC7: 접근성 (aria-label="설정")
 *
 * - 기어 아이콘 (CSS 기반)
 * - 최소 44x44px 터치 타겟
 * - variant prop으로 게임 중/메인 메뉴 스타일 분기
 */

import { forwardRef } from 'react';
import './SettingsButton.css';

export interface SettingsButtonProps {
  /** 클릭 콜백 (설정 모달 열기) */
  onClick: () => void;
  /** 버튼 스타일 변형: 'game' = 게임 중 HUD, 'menu' = 메인 메뉴 */
  variant?: 'game' | 'menu';
}

/**
 * 설정 버튼 컴포넌트
 *
 * forwardRef로 포커스 복귀 지원
 */
export const SettingsButton = forwardRef<HTMLButtonElement, SettingsButtonProps>(
  function SettingsButton({ onClick, variant = 'game' }, ref) {
    return (
      <button
        ref={ref}
        className={`settings-button settings-button--${variant}`}
        onClick={onClick}
        aria-label="설정"
        type="button"
        data-testid="settings-button"
      >
        <span className="settings-button__icon" aria-hidden="true">
          &#x2699;
        </span>
        {variant === 'menu' && (
          <span className="settings-button__label">설정</span>
        )}
      </button>
    );
  },
);
