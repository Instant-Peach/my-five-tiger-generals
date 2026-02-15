/**
 * LandscapeOverlay Component
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * AC5: 가로 모드 안내 오버레이
 * AC8: 접근성 (role="alert", aria-label, prefers-reduced-motion)
 *
 * 가로 모드(landscape) 감지 시 "세로 모드를 권장합니다" 안내 표시
 * createPortal로 document.body에 렌더링 (z-index: 2000)
 */

import { createPortal } from 'react-dom';
import './LandscapeOverlay.css';

export interface LandscapeOverlayProps {
  /** 오버레이 표시 여부 */
  isVisible: boolean;
  /** 닫기 버튼 클릭 콜백 */
  onDismiss: () => void;
}

/**
 * 가로 모드 안내 오버레이 컴포넌트
 *
 * - 가로 모드에서 세로 모드 권장 안내 표시
 * - 닫기 가능 (닫은 후에도 게임 정상 동작)
 * - role="alert", aria-label="가로 모드 감지"
 * - 닫기 버튼 aria-label="닫기" (44x44px 이상)
 * - prefers-reduced-motion 지원
 */
export function LandscapeOverlay({ isVisible, onDismiss }: LandscapeOverlayProps) {
  if (!isVisible) return null;

  const overlay = (
    <div
      className="landscape-overlay"
      role="alert"
      aria-label="가로 모드 감지"
      data-testid="landscape-overlay"
    >
      <div className="landscape-overlay__icon" aria-hidden="true">
        &#x1F4F1;&#x21BB;
      </div>
      <p className="landscape-overlay__message">
        세로 모드를 권장합니다
      </p>
      <p className="landscape-overlay__sub-message">
        더 나은 게임 경험을 위해<br />
        기기를 세로로 회전해주세요
      </p>
      <button
        className="landscape-overlay__close-btn"
        onClick={onDismiss}
        aria-label="닫기"
        data-testid="landscape-overlay-close"
      >
        닫기
      </button>
    </div>
  );

  return createPortal(overlay, document.body);
}
