/**
 * AutoEndToast Component
 *
 * 타이머 만료로 턴이 자동 종료되었을 때 알림을 표시하는 컴포넌트입니다.
 * Story 5-4: 타이머 자동 종료 (Timer Auto End)
 *
 * AC2: 자동 종료 알림 UI
 * - 타이머 만료로 턴이 종료됨을 사용자에게 알림
 * - 토스트/알림 메시지 표시: "시간 초과! 턴이 자동으로 종료되었습니다."
 * - 알림은 2-3초 후 자동 사라짐
 */

import { useEffect, useState } from 'react';
import './AutoEndToast.css';

export interface AutoEndToastProps {
  /** 알림 표시 여부 */
  isVisible: boolean;
  /** 알림 숨김 콜백 */
  onHide: () => void;
}

/**
 * 자동 턴 종료 알림 컴포넌트
 *
 * - 위치: 화면 상단 중앙 (top: 80px)
 * - 색상: 빨간색 배경 (경고 느낌)
 * - 표시 시간: 3초
 * - 애니메이션: fade in/out (0.3초)
 */
export function AutoEndToast({ isVisible, onHide }: AutoEndToastProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // 3초 후 자동 숨김
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // fade out 애니메이션 후 렌더링 제거 (0.3초)
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!shouldRender) return null;

  return (
    <div
      className={`auto-end-toast ${isVisible ? 'auto-end-toast--visible' : 'auto-end-toast--hidden'}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="auto-end-toast__icon" aria-hidden="true">
        ⏰
      </span>
      <span className="auto-end-toast__message">
        시간 초과! 턴이 자동으로 종료되었습니다.
      </span>
    </div>
  );
}
