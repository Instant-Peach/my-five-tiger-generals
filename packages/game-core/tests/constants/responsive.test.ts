/**
 * Responsive Constants Tests
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * Task 11.1: BREAKPOINTS/RESPONSIVE 상수 존재 확인
 */

import { describe, it, expect } from 'vitest';
import { BREAKPOINTS, RESPONSIVE } from '../../src/constants/responsive';

describe('BREAKPOINTS', () => {
  it('BREAKPOINTS 객체가 존재한다', () => {
    expect(BREAKPOINTS).toBeDefined();
  });

  it('MOBILE이 430으로 정의되어 있다', () => {
    expect(BREAKPOINTS.MOBILE).toBe(430);
  });

  it('TABLET이 1023으로 정의되어 있다', () => {
    expect(BREAKPOINTS.TABLET).toBe(1023);
  });

  it('DESKTOP이 1024로 정의되어 있다', () => {
    expect(BREAKPOINTS.DESKTOP).toBe(1024);
  });

  it('MOBILE < DESKTOP (모바일 최대 < 데스크톱 최소)', () => {
    expect(BREAKPOINTS.MOBILE).toBeLessThan(BREAKPOINTS.DESKTOP);
  });

  it('TABLET + 1 === DESKTOP (태블릿 최대 + 1 = 데스크톱 최소)', () => {
    expect(BREAKPOINTS.TABLET + 1).toBe(BREAKPOINTS.DESKTOP);
  });
});

describe('RESPONSIVE', () => {
  it('RESPONSIVE 객체가 존재한다', () => {
    expect(RESPONSIVE).toBeDefined();
  });

  it('DEBOUNCE_MS가 150으로 정의되어 있다', () => {
    expect(RESPONSIVE.DEBOUNCE_MS).toBe(150);
  });

  it('MIN_FONT_SIZE가 14로 정의되어 있다', () => {
    expect(RESPONSIVE.MIN_FONT_SIZE).toBe(14);
  });

  it('SAFE_AREA_FALLBACK이 0으로 정의되어 있다', () => {
    expect(RESPONSIVE.SAFE_AREA_FALLBACK).toBe(0);
  });
});
