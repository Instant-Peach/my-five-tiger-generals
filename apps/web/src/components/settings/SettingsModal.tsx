/**
 * SettingsModal Component
 *
 * Story 8-5: 설정 메뉴 (Settings Menu)
 *
 * AC3: 설정 모달 열기/닫기
 * AC4: 사운드 ON/OFF 토글
 * AC5: 설정 항목 확장 구조 (Phase 2 준비)
 * AC6: 반응형 레이아웃
 * AC7: 접근성
 * AC8: 게임 일시정지 효과 없음
 *
 * createPortal로 document.body에 렌더링 (z-index: 9997)
 */

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSettingsStore } from '../../stores/settingsStore';
import './SettingsModal.css';

export interface SettingsModalProps {
  /** 모달 표시 여부 */
  isVisible: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 포커스 복귀 대상 (설정 버튼 ref) */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * 설정 모달 컴포넌트
 *
 * - 사운드 ON/OFF 토글
 * - Phase 2 확장을 위한 리스트 구조
 * - createPortal로 body에 렌더링
 * - z-index: 9997 (TacticPanel(9998)/GeneralStatsPanel(9999)보다 아래)
 */
export function SettingsModal({ isVisible, onClose, triggerRef }: SettingsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  // 모달 열림 시 닫기 버튼으로 포커스 이동, 닫힘 시 설정 버튼으로 포커스 복귀
  useEffect(() => {
    if (isVisible) {
      // 닫기 버튼으로 포커스 이동
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // 닫힘 시 포커스 복귀
  useEffect(() => {
    if (!isVisible && triggerRef?.current) {
      triggerRef.current.focus();
    }
  }, [isVisible, triggerRef]);

  // ESC 키로 모달 닫기 + 포커스 트랩
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // 포커스 트랩: Tab/Shift+Tab 키로 모달 내 포커스 순환
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  // 오버레이(모달 외부) 클릭 시 닫기
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isVisible) return null;

  const modalContent = (
    <div
      className="settings-modal__overlay"
      onClick={handleOverlayClick}
      data-testid="settings-modal-overlay"
    >
      <div
        className="settings-modal"
        ref={modalRef}
        role="dialog"
        aria-label="게임 설정"
        aria-modal="true"
        data-testid="settings-modal"
      >
        {/* 모달 헤더 */}
        <div className="settings-modal__header">
          <h2 className="settings-modal__title" data-testid="settings-modal-title">
            설정
          </h2>
          <button
            ref={closeButtonRef}
            className="settings-modal__close-btn"
            onClick={onClose}
            aria-label="설정 닫기"
            type="button"
            data-testid="settings-modal-close"
          >
            &#x2715;
          </button>
        </div>

        {/* 설정 항목 리스트 */}
        <div className="settings-modal__list" data-testid="settings-modal-list">
          {/* 사운드 토글 행 */}
          <div className="settings-modal__item" data-testid="settings-sound-item">
            <span className="settings-modal__item-label">사운드</span>
            <button
              className={`settings-modal__toggle ${soundEnabled ? 'settings-modal__toggle--on' : 'settings-modal__toggle--off'}`}
              role="switch"
              aria-checked={soundEnabled}
              aria-label="사운드"
              onClick={toggleSound}
              type="button"
              data-testid="settings-sound-toggle"
            >
              <span className="settings-modal__toggle-knob" />
              <span className="settings-modal__toggle-text">
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Phase 2 안내 */}
        <div className="settings-modal__footer" data-testid="settings-modal-footer">
          <p className="settings-modal__footer-text">
            추가 설정은 업데이트 예정입니다
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
