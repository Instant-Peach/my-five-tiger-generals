/**
 * Debounce 유틸리티 함수
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * AC2: 리사이즈 시 debounce(150ms) 적용
 *
 * 게임 루프 내 new 사용 금지 원칙에 따라,
 * 이 함수는 초기화 시점에 한 번만 호출됩니다.
 */

/**
 * 주어진 함수의 호출을 지정된 시간(ms) 동안 지연시킵니다.
 * 지연 시간 내에 다시 호출되면 이전 타이머를 취소하고 새로 시작합니다.
 *
 * @param fn - 디바운스할 함수
 * @param delayMs - 지연 시간 (밀리초)
 * @returns 디바운스된 함수 (cancel 메서드 포함)
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number,
): T & { cancel: () => void } {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: unknown[]) => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced as T & { cancel: () => void };
}
