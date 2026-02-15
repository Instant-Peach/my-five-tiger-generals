/**
 * useKeyboardShortcuts Hook
 *
 * 게임 키보드 단축키를 관리합니다.
 * Story 5-1: 턴 종료 버튼 (Turn End Button)
 *
 * AC5: 키보드 단축키
 * - Space 키로 턴 종료 가능 (데스크톱 사용자)
 * - 내 턴일 때만 단축키 동작
 * - 포커스가 다른 입력 필드에 있을 때는 동작하지 않음
 *
 * @example
 * ```tsx
 * // IMPORTANT: onEndTurn 콜백은 useCallback으로 메모이제이션해야 합니다.
 * // 그렇지 않으면 매 렌더링마다 이벤트 리스너가 재등록됩니다.
 * const handleEndTurn = useCallback(() => {
 *   gameScene.executeEndTurn();
 * }, [gameScene]);
 *
 * useKeyboardShortcuts({
 *   onEndTurn: handleEndTurn,
 *   isMyTurn: true,
 *   isGameEnded: false,
 * });
 * ```
 */

import { useEffect } from 'react';

export interface UseKeyboardShortcutsOptions {
  /**
   * 턴 종료 콜백
   *
   * NOTE: 이 콜백은 useCallback으로 메모이제이션하는 것을 권장합니다.
   * 메모이제이션하지 않으면 매 렌더링마다 이벤트 리스너가 재등록되어
   * 불필요한 성능 오버헤드가 발생할 수 있습니다.
   */
  onEndTurn: () => void;
  /** 내 턴 여부 */
  isMyTurn: boolean;
  /** 게임 종료 여부 */
  isGameEnded: boolean;
  /** 단축키 활성화 여부 (기본값: true) */
  enabled?: boolean;
}

/**
 * 게임 키보드 단축키 훅
 *
 * Space 키: 턴 종료
 */
export function useKeyboardShortcuts({
  onEndTurn,
  isMyTurn,
  isGameEnded,
  enabled = true,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에 포커스가 있으면 무시
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Space 키로 턴 종료
      if (event.code === 'Space' && isMyTurn && !isGameEnded) {
        event.preventDefault(); // 스크롤 방지
        onEndTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEndTurn, isMyTurn, isGameEnded, enabled]);
}
