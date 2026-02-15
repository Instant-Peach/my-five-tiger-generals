/**
 * SurrenderConfirmModal Component
 *
 * Story 6-5: 항복 (Surrender)
 *
 * AC3: 항복 확인 모달
 * - 항복 버튼 클릭 시 확인 모달 표시
 * - "정말 항복하시겠습니까?" 메시지
 * - "확인" / "취소" 버튼
 * - 확인 클릭 시 항복 실행
 * - 취소 클릭 시 모달 닫기, 게임 계속
 * - 모달 오버레이 (배경 어둡게)
 */

import './SurrenderConfirmModal.css';

export interface SurrenderConfirmModalProps {
  /** 모달 표시 여부 */
  isVisible: boolean;
  /** 확인 클릭 콜백 (항복 실행) */
  onConfirm: () => void;
  /** 취소 클릭 콜백 (모달 닫기) */
  onCancel: () => void;
}

/**
 * 항복 확인 모달 컴포넌트
 *
 * - VictoryBanner.css의 오버레이 패턴 참고
 * - z-index: 150 (GameHUD(100) 위, VictoryBanner(1000) 아래)
 */
export function SurrenderConfirmModal({
  isVisible,
  onConfirm,
  onCancel,
}: SurrenderConfirmModalProps) {
  if (!isVisible) return null;

  return (
    <div
      className="surrender-modal-overlay"
      role="alertdialog"
      aria-label="항복 확인"
      aria-modal="true"
    >
      <div className="surrender-modal">
        <p className="surrender-modal-message">정말 항복하시겠습니까?</p>
        <div className="surrender-modal-buttons">
          <button
            className="surrender-modal-confirm"
            onClick={onConfirm}
          >
            확인
          </button>
          <button
            className="surrender-modal-cancel"
            onClick={onCancel}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
