/**
 * useResponsive Hook
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * AC1: 브레이크포인트 통합
 * AC5: 세로/가로 방향 대응
 *
 * 현재 뷰포트 크기, 브레이크포인트, 방향 정보를 추적하는 커스텀 훅
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BREAKPOINTS, RESPONSIVE } from '@ftg/game-core';

/** 브레이크포인트 타입 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** 방향 타입 */
export type Orientation = 'portrait' | 'landscape';

/** useResponsive 반환 타입 */
export interface ResponsiveState {
  /** 뷰포트 너비 (px) */
  width: number;
  /** 뷰포트 높이 (px) */
  height: number;
  /** 현재 브레이크포인트 */
  breakpoint: Breakpoint;
  /** 세로 모드 여부 */
  isPortrait: boolean;
  /** 가로 모드 여부 */
  isLandscape: boolean;
  /** 모바일 여부 */
  isMobile: boolean;
  /** 태블릿 여부 */
  isTablet: boolean;
  /** 데스크톱 여부 */
  isDesktop: boolean;
}

/**
 * 뷰포트 너비에서 브레이크포인트를 계산합니다.
 */
function getBreakpoint(width: number): Breakpoint {
  if (width <= BREAKPOINTS.MOBILE) return 'mobile';
  if (width <= BREAKPOINTS.TABLET) return 'tablet';
  return 'desktop';
}

/**
 * 반응형 뷰포트 상태를 추적하는 커스텀 훅
 *
 * - 뷰포트 너비/높이 실시간 추적
 * - 3단계 브레이크포인트 (mobile/tablet/desktop)
 * - portrait/landscape 방향 감지
 * - 150ms debounce로 성능 최적화
 *
 * @returns ResponsiveState
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const h = typeof window !== 'undefined' ? window.innerHeight : 768;
    const bp = getBreakpoint(w);
    return {
      width: w,
      height: h,
      breakpoint: bp,
      isPortrait: h >= w,
      isLandscape: w > h,
      isMobile: bp === 'mobile',
      isTablet: bp === 'tablet',
      isDesktop: bp === 'desktop',
    };
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleResize = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bp = getBreakpoint(w);
    setState({
      width: w,
      height: h,
      breakpoint: bp,
      isPortrait: h >= w,
      isLandscape: w > h,
      isMobile: bp === 'mobile',
      isTablet: bp === 'tablet',
      isDesktop: bp === 'desktop',
    });
  }, []);

  useEffect(() => {
    const debouncedResize = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        handleResize();
      }, RESPONSIVE.DEBOUNCE_MS);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handleResize]);

  return state;
}
