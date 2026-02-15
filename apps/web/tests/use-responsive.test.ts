/**
 * useResponsive Hook Tests
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * Task 11.2~11.4: useResponsive 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useResponsive } from '../src/hooks/useResponsive';

/** window.innerWidth/innerHeight를 모킹하는 헬퍼 */
function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true, writable: true });
}

describe('useResponsive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 기본 뷰포트: 모바일 세로 (375x667)
    setViewport(375, 667);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Task 11.2: 기본 상태 확인
  describe('기본 상태', () => {
    it('초기 너비/높이가 window.innerWidth/innerHeight와 일치한다', () => {
      setViewport(375, 667);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
    });

    it('375px 너비에서 breakpoint가 "mobile"이다', () => {
      setViewport(375, 667);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('세로 모드(height >= width)에서 isPortrait이 true이다', () => {
      setViewport(375, 667);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });
  });

  // Task 11.3: 뷰포트 리사이즈 시 breakpoint 변경
  describe('뷰포트 리사이즈', () => {
    it('430px 이하에서 breakpoint가 "mobile"이다', () => {
      setViewport(430, 800);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.breakpoint).toBe('mobile');
    });

    it('431px~1023px에서 breakpoint가 "tablet"이다', () => {
      setViewport(768, 1024);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isTablet).toBe(true);
    });

    it('1024px 이상에서 breakpoint가 "desktop"이다', () => {
      setViewport(1024, 768);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.isDesktop).toBe(true);
    });

    it('리사이즈 이벤트 후 debounce(150ms) 경과 시 상태가 업데이트된다', () => {
      setViewport(375, 667);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.breakpoint).toBe('mobile');

      // 뷰포트를 데스크톱으로 변경
      act(() => {
        setViewport(1200, 800);
        window.dispatchEvent(new Event('resize'));
      });

      // debounce 이전에는 아직 mobile
      expect(result.current.breakpoint).toBe('mobile');

      // debounce 후 업데이트
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.width).toBe(1200);
    });
  });

  // Task 11.4: landscape/portrait 전환
  describe('방향 전환', () => {
    it('가로 모드(width > height)에서 isLandscape가 true이다', () => {
      setViewport(667, 375);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
    });

    it('리사이즈로 landscape -> portrait 전환이 감지된다', () => {
      setViewport(667, 375);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.isLandscape).toBe(true);

      // 세로로 전환
      act(() => {
        setViewport(375, 667);
        window.dispatchEvent(new Event('resize'));
      });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('width === height일 때 isPortrait이 true이다 (정사각형은 세로 모드로 취급)', () => {
      setViewport(500, 500);
      const { result } = renderHook(() => useResponsive());
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });
  });
});
