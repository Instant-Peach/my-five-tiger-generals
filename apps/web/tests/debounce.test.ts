/**
 * Debounce Utility Tests
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * Task 11.11: debounce 유틸 함수 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../src/utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('지연 시간 후 함수가 호출된다', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('지연 시간 내 재호출 시 이전 호출이 취소된다', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    vi.advanceTimersByTime(100);
    debounced(); // 리셋
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('여러 번 빠르게 호출해도 마지막 호출만 실행된다', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    debounced();
    debounced();
    debounced();
    debounced();

    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancel() 호출 시 대기 중인 호출이 취소된다', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    debounced.cancel();

    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it('인자가 올바르게 전달된다', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced('a', 'b');
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledWith('a', 'b');
  });

  it('충분한 간격으로 호출하면 각각 실행된다', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 150);

    debounced();
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced();
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
