/**
 * Zone Colors 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  ZONE_COLORS,
  ZONE_STROKE_WIDTH,
  getZoneColor,
  type ZoneState,
} from '../src/constants/colors';
import type { TileZone } from '../src/board/types';

describe('ZONE_COLORS', () => {
  const zones: TileZone[] = ['player1_home', 'player2_home', 'center', 'side'];
  const states: ZoneState[] = ['base', 'hover', 'selected', 'highlight'];

  it('모든 구역에 대해 색상 팔레트가 정의되어 있다', () => {
    for (const zone of zones) {
      expect(ZONE_COLORS[zone]).toBeDefined();
    }
  });

  it('각 구역의 모든 상태에 대해 색상이 정의되어 있다', () => {
    for (const zone of zones) {
      for (const state of states) {
        expect(ZONE_COLORS[zone][state]).toBeDefined();
        expect(typeof ZONE_COLORS[zone][state]).toBe('number');
      }
    }
  });

  it('모든 색상 값이 유효한 hex 범위(0x000000 ~ 0xFFFFFF) 내에 있다', () => {
    for (const zone of zones) {
      for (const state of states) {
        const color = ZONE_COLORS[zone][state];
        expect(color).toBeGreaterThanOrEqual(0x000000);
        expect(color).toBeLessThanOrEqual(0xffffff);
      }
    }
  });

  it('player1_home은 파란색 계열(R < G 또는 R < B)이다', () => {
    const baseColor = ZONE_COLORS.player1_home.base;
    const r = (baseColor >> 16) & 0xff;
    const b = baseColor & 0xff;
    // 파란색 계열: B > R
    expect(b).toBeGreaterThan(r);
  });

  it('player2_home은 빨간색 계열(R > B)이다', () => {
    const baseColor = ZONE_COLORS.player2_home.base;
    const r = (baseColor >> 16) & 0xff;
    const b = baseColor & 0xff;
    // 빨간색 계열: R > B
    expect(r).toBeGreaterThan(b);
  });

  it('center는 녹색 계열(G가 지배적)이다', () => {
    const baseColor = ZONE_COLORS.center.base;
    const r = (baseColor >> 16) & 0xff;
    const g = (baseColor >> 8) & 0xff;
    const b = baseColor & 0xff;
    // 녹색 계열: G >= R, G >= B
    expect(g).toBeGreaterThanOrEqual(r);
    expect(g).toBeGreaterThanOrEqual(b);
  });

  it('side는 황색 계열(R과 G가 높고 B가 낮음)이다', () => {
    const baseColor = ZONE_COLORS.side.base;
    const r = (baseColor >> 16) & 0xff;
    const g = (baseColor >> 8) & 0xff;
    const b = baseColor & 0xff;
    // 황색 계열: R >= B, G >= B
    expect(r).toBeGreaterThanOrEqual(b);
    expect(g).toBeGreaterThanOrEqual(b);
  });

  it('각 구역에서 selected가 base보다 밝다 (총 RGB 합계 기준)', () => {
    for (const zone of zones) {
      const baseColor = ZONE_COLORS[zone].base;
      const selectedColor = ZONE_COLORS[zone].selected;

      const baseSum =
        ((baseColor >> 16) & 0xff) +
        ((baseColor >> 8) & 0xff) +
        (baseColor & 0xff);
      const selectedSum =
        ((selectedColor >> 16) & 0xff) +
        ((selectedColor >> 8) & 0xff) +
        (selectedColor & 0xff);

      expect(selectedSum).toBeGreaterThan(baseSum);
    }
  });
});

describe('ZONE_STROKE_WIDTH', () => {
  const zones: TileZone[] = ['player1_home', 'player2_home', 'center', 'side'];

  it('모든 구역에 대해 테두리 두께가 정의되어 있다', () => {
    for (const zone of zones) {
      expect(ZONE_STROKE_WIDTH[zone]).toBeDefined();
      expect(typeof ZONE_STROKE_WIDTH[zone]).toBe('number');
    }
  });

  it('테두리 두께가 양수이다', () => {
    for (const zone of zones) {
      expect(ZONE_STROKE_WIDTH[zone]).toBeGreaterThan(0);
    }
  });

  it('side 구역의 테두리가 가장 두껍다 (특수 구역 강조)', () => {
    const sideWidth = ZONE_STROKE_WIDTH.side;
    expect(sideWidth).toBeGreaterThanOrEqual(ZONE_STROKE_WIDTH.player1_home);
    expect(sideWidth).toBeGreaterThanOrEqual(ZONE_STROKE_WIDTH.player2_home);
    expect(sideWidth).toBeGreaterThanOrEqual(ZONE_STROKE_WIDTH.center);
  });
});

describe('getZoneColor', () => {
  it('zone과 state에 따라 올바른 색상을 반환한다', () => {
    expect(getZoneColor('player1_home', 'base')).toBe(
      ZONE_COLORS.player1_home.base
    );
    expect(getZoneColor('player2_home', 'selected')).toBe(
      ZONE_COLORS.player2_home.selected
    );
    expect(getZoneColor('center', 'hover')).toBe(ZONE_COLORS.center.hover);
    expect(getZoneColor('side', 'highlight')).toBe(ZONE_COLORS.side.highlight);
  });

  it('state를 생략하면 base 색상을 반환한다', () => {
    expect(getZoneColor('player1_home')).toBe(ZONE_COLORS.player1_home.base);
    expect(getZoneColor('center')).toBe(ZONE_COLORS.center.base);
  });
});
