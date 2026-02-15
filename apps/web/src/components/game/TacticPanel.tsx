/**
 * TacticPanel Component
 *
 * 책략 선택 패널 UI 컴포넌트입니다.
 * Story 8-4: 책략 선택 UI (Tactic Selection UI)
 *
 * AC2: 책략 패널 열기/닫기
 * - 닫기 버튼(X) 또는 패널 외부 탭으로 닫기
 * - 닫기 버튼 터치 타겟 최소 44x44px
 *
 * AC3: 책략 목록 표시 (Phase 1 플레이스홀더)
 * - 책략 3개 슬롯 형태 표시
 * - "Phase 3에서 사용 가능" 안내 텍스트
 *
 * AC4: 책략 슬롯 상태 시각화
 * - Phase 1: 모든 슬롯 "준비 중" (점선 테두리, 반투명)
 *
 * AC5: 책략 정보 미리보기
 * - 호버/롱프레스 시 툴팁
 *
 * AC6: 반응형 레이아웃
 * - 모바일: 하단 슬라이드업 (max-height: 40vh)
 * - 데스크톱: 하단 중앙 카드 (max-width: 400px)
 *
 * AC7: 접근성
 * - role="dialog", aria-label, aria-modal
 * - 포커스 트랩, ESC 닫기
 */

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PLACEHOLDER_TACTIC_SLOTS } from '@ftg/game-core';
import type { TacticSlot, TacticType } from '@ftg/game-core';
import './TacticPanel.css';

export interface TacticPanelProps {
  /** 선택된 장수 이름 (한국어) */
  generalName: string;
  /** 패널 닫기 콜백 */
  onClose: () => void;
  /** CR-3: 포커스 복귀 대상 (책략 버튼 ref) */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

/** 책략 유형별 아이콘 반환 */
function getTacticTypeIcon(type: TacticType): string {
  return type === 'field' ? '\u2694\uFE0F' : '\uD83D\uDCD6';
}

/** 책략 유형별 라벨 반환 */
function getTacticTypeLabel(type: TacticType): string {
  return type === 'field' ? '현장용' : '사무용';
}

/**
 * TacticSlotCard 서브컴포넌트
 *
 * 개별 책략 슬롯을 카드 형태로 렌더링합니다.
 * Phase 1에서는 모든 슬롯이 "준비 중" 상태입니다.
 */
function TacticSlotCard({ slot, index }: { slot: TacticSlot; index: number }) {
  const { tactic, status } = slot;
  const isComingSoon = status === 'coming_soon';

  return (
    <div
      className={`tactic-panel__slot ${isComingSoon ? 'tactic-panel__slot--coming-soon' : ''}`}
      role="button"
      aria-label={`${tactic.nameKo} - ${getTacticTypeLabel(tactic.type)}`}
      aria-disabled="true"
      tabIndex={-1}
      title="이 책략은 Phase 3에서 활성화됩니다"
      data-testid={`tactic-slot-${index}`}
    >
      {/* 유형 아이콘 */}
      <span
        className={`tactic-panel__slot-icon ${tactic.type === 'field' ? 'tactic-panel__slot-icon--field' : 'tactic-panel__slot-icon--office'}`}
        aria-hidden="true"
      >
        {getTacticTypeIcon(tactic.type)}
      </span>

      {/* 책략 정보 */}
      <div className="tactic-panel__slot-info">
        <span className="tactic-panel__slot-name" data-testid={`tactic-slot-name-${index}`}>
          {tactic.nameKo}
        </span>
        <span className="tactic-panel__slot-type">
          {getTacticTypeLabel(tactic.type)}
        </span>
      </div>

      {/* Phase 1 안내 텍스트 */}
      {isComingSoon && (
        <span className="tactic-panel__slot-coming-soon" data-testid={`tactic-slot-status-${index}`}>
          Phase 3에서 사용 가능
        </span>
      )}
    </div>
  );
}

/**
 * 책략 선택 패널 컴포넌트
 *
 * createPortal로 document.body에 렌더링됩니다.
 * z-index: 9998 (GeneralStatsPanel보다 아래)
 */
export function TacticPanel({ generalName, onClose, triggerRef }: TacticPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // 패널 열림 시 포커스 저장 및 이동, 닫힘 시 포커스 복귀
  useEffect(() => {
    previousFocusRef.current = document.activeElement;

    // 닫기 버튼으로 포커스 이동
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // CR-3: 패널 닫힘 시 triggerRef로 포커스 복귀 (fallback: previousFocusRef)
    return () => {
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [triggerRef]);

  // ESC 키로 패널 닫기 + CR-2: 포커스 트랩 (Tab/Shift+Tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // CR-2: 포커스 트랩 - Tab/Shift+Tab 키로 패널 내 포커스 순환
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: 첫 번째 요소에서 마지막으로 순환
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: 마지막 요소에서 첫 번째로 순환
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 오버레이(패널 외부) 클릭 시 닫기
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const tacticSlots = PLACEHOLDER_TACTIC_SLOTS;

  const panelContent = (
    <div
      className="tactic-panel__overlay"
      onClick={handleOverlayClick}
      data-testid="tactic-panel-overlay"
    >
      <div
        className="tactic-panel"
        ref={panelRef}
        role="dialog"
        aria-label="책략 선택"
        aria-modal="true"
        data-testid="tactic-panel"
      >
        {/* 패널 헤더 */}
        <div className="tactic-panel__header">
          <div className="tactic-panel__header-info">
            <span className="tactic-panel__general-name" data-testid="tactic-panel-general-name">
              {generalName}
            </span>
            <span className="tactic-panel__title">책략</span>
          </div>
          <button
            ref={closeButtonRef}
            className="tactic-panel__close-btn"
            onClick={onClose}
            aria-label="책략 패널 닫기"
            type="button"
            data-testid="tactic-panel-close"
          >
            &#x2715;
          </button>
        </div>

        {/* 책략 슬롯 목록 */}
        <div className="tactic-panel__slots" data-testid="tactic-panel-slots">
          {tacticSlots.map((slot, index) => (
            <TacticSlotCard key={slot.tactic.id} slot={slot} index={index} />
          ))}
        </div>

        {/* Phase 1 안내 */}
        <div className="tactic-panel__footer">
          <span className="tactic-panel__footer-text">
            책략 시스템은 Phase 3에서 활성화됩니다
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(panelContent, document.body);
}
