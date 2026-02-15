/**
 * 병력 시스템 테스트 (Story 2-5)
 */

import { describe, it, expect } from 'vitest';
import {
  getTroopStatus,
  getTroopRatio,
  getMaxTroops,
  TROOP_THRESHOLDS,
  TROOP_MULTIPLIER,
} from '../src/generals/troops';
import { TROOP_COLORS, getTroopColor } from '../src/constants/troops';
import type { TroopStatus } from '../src/generals/troops';

describe('병력 시스템', () => {
  describe('getTroopStatus', () => {
    it('병력이 0 이하일 때 "out" 상태를 반환한다', () => {
      expect(getTroopStatus(0, 5)).toBe('out');
      expect(getTroopStatus(-1, 5)).toBe('out');
    });

    it('maxTroops가 0 이하일 때 "out" 상태를 반환한다 (division by zero 방지)', () => {
      expect(getTroopStatus(5, 0)).toBe('out');
      expect(getTroopStatus(5, -1)).toBe('out');
      expect(getTroopStatus(0, 0)).toBe('out');
    });

    it('병력이 최대 병력과 같을 때 "full" 상태를 반환한다', () => {
      expect(getTroopStatus(5, 5)).toBe('full');
      expect(getTroopStatus(3, 3)).toBe('full');
    });

    it('병력이 최대 병력보다 많을 때 "full" 상태를 반환한다', () => {
      // 버프 등으로 초과할 수 있는 경우 대비
      expect(getTroopStatus(6, 5)).toBe('full');
    });

    it('병력 비율이 50% 이상 100% 미만일 때 "warning" 상태를 반환한다', () => {
      // 50% = 2.5/5, 정확히 50%는 warning
      expect(getTroopStatus(3, 5)).toBe('warning'); // 60%
      expect(getTroopStatus(4, 5)).toBe('warning'); // 80%
    });

    it('병력 비율이 50% 미만일 때 "danger" 상태를 반환한다', () => {
      expect(getTroopStatus(2, 5)).toBe('danger'); // 40%
      expect(getTroopStatus(1, 5)).toBe('danger'); // 20%
    });

    it('경계값 50%에서 올바른 상태를 반환한다', () => {
      // 정확히 50% = 2.5, 하지만 병력은 정수이므로
      // 5병력 기준: 2 = 40% (danger), 3 = 60% (warning)
      // 4병력 기준: 2 = 50% (warning)
      expect(getTroopStatus(2, 4)).toBe('warning'); // 정확히 50%
      expect(getTroopStatus(1, 4)).toBe('danger'); // 25%
    });

    it('maxTroops가 1일 때 올바르게 동작한다', () => {
      expect(getTroopStatus(1, 1)).toBe('full');
      expect(getTroopStatus(0, 1)).toBe('out');
    });
  });

  describe('getTroopRatio', () => {
    it('병력 비율을 0~1 사이로 반환한다', () => {
      expect(getTroopRatio(5, 5)).toBe(1);
      expect(getTroopRatio(2, 5)).toBeCloseTo(0.4);
      expect(getTroopRatio(0, 5)).toBe(0);
    });

    it('maxTroops가 0일 때 0을 반환한다', () => {
      expect(getTroopRatio(5, 0)).toBe(0);
    });

    it('음수 병력에 대해 0을 반환한다', () => {
      expect(getTroopRatio(-1, 5)).toBe(0);
    });

    it('100%를 초과하는 경우 1로 제한한다', () => {
      expect(getTroopRatio(10, 5)).toBe(1);
    });
  });

  describe('TROOP_MULTIPLIER & getMaxTroops', () => {
    it('TROOP_MULTIPLIER가 2이다', () => {
      expect(TROOP_MULTIPLIER).toBe(2);
    });

    it('getMaxTroops가 star × TROOP_MULTIPLIER를 반환한다', () => {
      expect(getMaxTroops(5)).toBe(10); // 관우
      expect(getMaxTroops(4)).toBe(8);  // 장비/조운
      expect(getMaxTroops(3)).toBe(6);  // 황충
      expect(getMaxTroops(1)).toBe(2);
      expect(getMaxTroops(0)).toBe(0);
    });
  });

  describe('TROOP_THRESHOLDS', () => {
    it('WARNING 임계값이 0.5이다', () => {
      expect(TROOP_THRESHOLDS.WARNING).toBe(0.5);
    });
  });

  describe('TROOP_COLORS', () => {
    it('모든 상태에 대해 색상이 정의되어 있다', () => {
      const statuses: TroopStatus[] = ['full', 'warning', 'danger', 'out'];
      for (const status of statuses) {
        expect(TROOP_COLORS[status]).toBeDefined();
        expect(TROOP_COLORS[status].primary).toBeDefined();
        expect(TROOP_COLORS[status].text).toBeDefined();
        expect(TROOP_COLORS[status].icon).toBeDefined();
      }
    });

    it('full 상태는 초록색이다', () => {
      expect(TROOP_COLORS.full.primary).toBe('#22C55E');
    });

    it('warning 상태는 노란색/주황색이다', () => {
      expect(TROOP_COLORS.warning.primary).toBe('#F59E0B');
    });

    it('danger 상태는 빨간색이다', () => {
      expect(TROOP_COLORS.danger.primary).toBe('#EF4444');
    });

    it('out 상태는 회색이다', () => {
      expect(TROOP_COLORS.out.primary).toBe('#6B7280');
    });

    it('각 상태에 접근성 아이콘이 정의되어 있다', () => {
      expect(TROOP_COLORS.full.icon).toBe('✓');
      expect(TROOP_COLORS.warning.icon).toBe('⚠');
      expect(TROOP_COLORS.danger.icon).toBe('!');
      expect(TROOP_COLORS.out.icon).toBe('✕');
    });
  });

  describe('getTroopColor', () => {
    it('상태에 따른 색상을 반환한다', () => {
      expect(getTroopColor('full')).toBe(TROOP_COLORS.full);
      expect(getTroopColor('warning')).toBe(TROOP_COLORS.warning);
      expect(getTroopColor('danger')).toBe(TROOP_COLORS.danger);
      expect(getTroopColor('out')).toBe(TROOP_COLORS.out);
    });
  });

  describe('실제 장수 시나리오 테스트 (maxTroops = star × 2)', () => {
    it('관우 (별 5, 최대 병력 10): 병력 상태 확인', () => {
      const maxTroops = 10; // star(5) × TROOP_MULTIPLIER(2)
      expect(getTroopStatus(10, maxTroops)).toBe('full');    // 100%
      expect(getTroopStatus(8, maxTroops)).toBe('warning');  // 80%
      expect(getTroopStatus(6, maxTroops)).toBe('warning');  // 60%
      expect(getTroopStatus(5, maxTroops)).toBe('warning');  // 50%
      expect(getTroopStatus(4, maxTroops)).toBe('danger');   // 40%
      expect(getTroopStatus(2, maxTroops)).toBe('danger');   // 20%
      expect(getTroopStatus(0, maxTroops)).toBe('out');      // 0%
    });

    it('황충 (별 3, 최대 병력 6): 병력 상태 확인', () => {
      const maxTroops = 6; // star(3) × TROOP_MULTIPLIER(2)
      expect(getTroopStatus(6, maxTroops)).toBe('full');    // 100%
      expect(getTroopStatus(4, maxTroops)).toBe('warning'); // 66.7%
      expect(getTroopStatus(3, maxTroops)).toBe('warning'); // 50%
      expect(getTroopStatus(2, maxTroops)).toBe('danger');  // 33.3%
      expect(getTroopStatus(0, maxTroops)).toBe('out');     // 0%
    });
  });
});
