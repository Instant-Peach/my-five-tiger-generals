/**
 * Tactics Module Tests
 *
 * Story 8-4: 책략 선택 UI (Tactic Selection UI)
 * game-core tactics 타입 및 상수 검증
 */

import { describe, it, expect } from 'vitest';
import {
  TACTIC_SLOTS_PER_GENERAL,
  PLACEHOLDER_TACTICS,
  PLACEHOLDER_TACTIC_SLOTS,
} from '../src/tactics';
import type {
  TacticId,
  TacticType,
  TacticSlotStatus,
  TacticInfo,
  TacticSlot,
} from '../src/tactics';

describe('Tactics Constants', () => {
  describe('TACTIC_SLOTS_PER_GENERAL', () => {
    it('장수당 책략 슬롯 수는 3이다', () => {
      expect(TACTIC_SLOTS_PER_GENERAL).toBe(3);
    });
  });

  describe('PLACEHOLDER_TACTICS', () => {
    it('플레이스홀더 책략이 3개이다', () => {
      expect(PLACEHOLDER_TACTICS).toHaveLength(3);
    });

    it('각 책략에 id, name, nameKo, type, description이 있다', () => {
      for (const tactic of PLACEHOLDER_TACTICS) {
        expect(tactic.id).toBeTruthy();
        expect(tactic.name).toBeTruthy();
        expect(tactic.nameKo).toBeTruthy();
        expect(tactic.type).toBeTruthy();
        expect(tactic.description).toBeTruthy();
      }
    });

    it('첫 번째 책략은 현장용(field)이다', () => {
      expect(PLACEHOLDER_TACTICS[0].type).toBe('field');
    });

    it('두 번째 책략은 사무용(office)이다', () => {
      expect(PLACEHOLDER_TACTICS[1].type).toBe('office');
    });

    it('세 번째 책략은 현장용(field)이다', () => {
      expect(PLACEHOLDER_TACTICS[2].type).toBe('field');
    });

    it('모든 책략 ID가 고유하다', () => {
      const ids = PLACEHOLDER_TACTICS.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('type은 field 또는 office만 허용된다', () => {
      for (const tactic of PLACEHOLDER_TACTICS) {
        expect(['field', 'office']).toContain(tactic.type);
      }
    });
  });

  describe('PLACEHOLDER_TACTIC_SLOTS', () => {
    it('플레이스홀더 슬롯이 3개이다', () => {
      expect(PLACEHOLDER_TACTIC_SLOTS).toHaveLength(3);
    });

    it('모든 슬롯의 상태가 coming_soon이다', () => {
      for (const slot of PLACEHOLDER_TACTIC_SLOTS) {
        expect(slot.status).toBe('coming_soon');
      }
    });

    it('모든 슬롯의 usesRemaining이 1이다', () => {
      for (const slot of PLACEHOLDER_TACTIC_SLOTS) {
        expect(slot.usesRemaining).toBe(1);
      }
    });

    it('각 슬롯에 tactic 정보가 있다', () => {
      for (const slot of PLACEHOLDER_TACTIC_SLOTS) {
        expect(slot.tactic).toBeDefined();
        expect(slot.tactic.id).toBeTruthy();
        expect(slot.tactic.nameKo).toBeTruthy();
      }
    });
  });

  // 타입 호환성 검증 (컴파일 타임 체크)
  describe('타입 호환성', () => {
    it('TacticId는 string이다', () => {
      const id: TacticId = 'test_id';
      expect(typeof id).toBe('string');
    });

    it('TacticType은 field 또는 office이다', () => {
      const fieldType: TacticType = 'field';
      const officeType: TacticType = 'office';
      expect(fieldType).toBe('field');
      expect(officeType).toBe('office');
    });

    it('TacticSlotStatus 값들이 유효하다', () => {
      const statuses: TacticSlotStatus[] = ['available', 'unavailable', 'exhausted', 'coming_soon'];
      expect(statuses).toHaveLength(4);
    });

    it('TacticInfo 인터페이스가 올바른 구조이다', () => {
      const info: TacticInfo = {
        id: 'test',
        name: 'Test',
        nameKo: '테스트',
        type: 'field',
        description: '테스트 책략',
      };
      expect(info.id).toBe('test');
      expect(info.type).toBe('field');
    });

    it('TacticSlot 인터페이스가 올바른 구조이다', () => {
      const slot: TacticSlot = {
        tactic: {
          id: 'test',
          name: 'Test',
          nameKo: '테스트',
          type: 'office',
          description: '테스트',
        },
        status: 'coming_soon',
        usesRemaining: 1,
      };
      expect(slot.status).toBe('coming_soon');
      expect(slot.usesRemaining).toBe(1);
    });
  });
});
