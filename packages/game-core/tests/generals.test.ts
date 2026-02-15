/**
 * 장수 시스템 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  GENERAL_BASE_DATA,
  GENERAL_ORDER,
  GENERALS_PER_PLAYER,
  PLAYER_START_TILES,
  TOTAL_GENERALS,
} from '../src/generals/constants';
import {
  createGeneral,
  createInitialGenerals,
} from '../src/generals/generals';
import type {
  General,
  GeneralBaseData,
  GeneralStats,
  PlayerId,
} from '../src/generals/types';

describe('장수 시스템', () => {
  describe('장수 타입 정의 (Task 1.1)', () => {
    it('GeneralStats 타입이 모든 필수 필드를 포함한다', () => {
      const stats: GeneralStats = {
        star: 5,
        sun: 4,
        moon: 4,
        speed: 2,
      };

      expect(stats.star).toBe(5);
      expect(stats.sun).toBe(4);
      expect(stats.moon).toBe(4);
      expect(stats.speed).toBe(2);
    });

    it('GeneralBaseData 타입이 올바른 구조를 가진다', () => {
      const baseData: GeneralBaseData = {
        baseId: 'guanyu',
        name: 'Guan Yu',
        nameKo: '관우',
        stats: {
          star: 5,
          sun: 4,
          moon: 4,
          speed: 2,
        },
      };

      expect(baseData.baseId).toBe('guanyu');
      expect(baseData.name).toBe('Guan Yu');
      expect(baseData.nameKo).toBe('관우');
      expect(baseData.stats.star).toBe(5);
    });

    it('General 타입이 모든 필수 필드를 포함한다', () => {
      const general: General = {
        id: 'player1_guanyu',
        baseId: 'guanyu',
        name: 'Guan Yu',
        nameKo: '관우',
        owner: 'player1',
        stats: {
          star: 5,
          sun: 4,
          moon: 4,
          speed: 2,
        },
        troops: 10,
        position: 25,
        status: 'active',
      };

      expect(general.id).toBe('player1_guanyu');
      expect(general.baseId).toBe('guanyu');
      expect(general.owner).toBe('player1');
      expect(general.troops).toBe(10);
      expect(general.position).toBe(25);
      expect(general.status).toBe('active');
    });

    it('PlayerId 타입이 player1과 player2만 허용한다', () => {
      const player1: PlayerId = 'player1';
      const player2: PlayerId = 'player2';

      expect(player1).toBe('player1');
      expect(player2).toBe('player2');
    });
  });

  describe('장수 상수 정의 (Task 1.2)', () => {
    it('GENERAL_BASE_DATA에 5명의 장수가 정의되어 있다', () => {
      const generalIds = Object.keys(GENERAL_BASE_DATA);
      expect(generalIds).toHaveLength(5);
      expect(generalIds).toContain('guanyu');
      expect(generalIds).toContain('zhangfei');
      expect(generalIds).toContain('zhaoyun');
      expect(generalIds).toContain('huangzhong');
      expect(generalIds).toContain('machao');
    });

    it('관우의 스탯이 GDD와 일치한다 (별:5, 해:4, 달:4, 발:2)', () => {
      const guanyu = GENERAL_BASE_DATA.guanyu;
      expect(guanyu.nameKo).toBe('관우');
      expect(guanyu.stats.star).toBe(5);
      expect(guanyu.stats.sun).toBe(4);
      expect(guanyu.stats.moon).toBe(4);
      expect(guanyu.stats.speed).toBe(2);
    });

    it('장비의 스탯이 GDD와 일치한다 (별:4, 해:5, 달:3, 발:2)', () => {
      const zhangfei = GENERAL_BASE_DATA.zhangfei;
      expect(zhangfei.nameKo).toBe('장비');
      expect(zhangfei.stats.star).toBe(4);
      expect(zhangfei.stats.sun).toBe(5);
      expect(zhangfei.stats.moon).toBe(3);
      expect(zhangfei.stats.speed).toBe(2);
    });

    it('조운의 스탯이 GDD와 일치한다 (별:4, 해:3, 달:4, 발:3)', () => {
      const zhaoyun = GENERAL_BASE_DATA.zhaoyun;
      expect(zhaoyun.nameKo).toBe('조운');
      expect(zhaoyun.stats.star).toBe(4);
      expect(zhaoyun.stats.sun).toBe(3);
      expect(zhaoyun.stats.moon).toBe(4);
      expect(zhaoyun.stats.speed).toBe(3);
    });

    it('황충의 스탯이 GDD와 일치한다 (별:3, 해:5, 달:2, 발:2)', () => {
      const huangzhong = GENERAL_BASE_DATA.huangzhong;
      expect(huangzhong.nameKo).toBe('황충');
      expect(huangzhong.stats.star).toBe(3);
      expect(huangzhong.stats.sun).toBe(5);
      expect(huangzhong.stats.moon).toBe(2);
      expect(huangzhong.stats.speed).toBe(2);
    });

    it('마초의 스탯이 GDD와 일치한다 (별:5, 해:4, 달:3, 발:3)', () => {
      const machao = GENERAL_BASE_DATA.machao;
      expect(machao.nameKo).toBe('마초');
      expect(machao.stats.star).toBe(5);
      expect(machao.stats.sun).toBe(4);
      expect(machao.stats.moon).toBe(3);
      expect(machao.stats.speed).toBe(3);
    });

    it('GENERAL_ORDER가 5명의 장수를 올바른 순서로 포함한다', () => {
      expect(GENERAL_ORDER).toHaveLength(5);
      expect(GENERAL_ORDER).toEqual([
        'guanyu',
        'zhangfei',
        'zhaoyun',
        'huangzhong',
        'machao',
      ]);
    });

    it('PLAYER_START_TILES가 올바른 시작 타일을 정의한다', () => {
      // Player 1: row 5 (타일 25-29) - player1_home 구역
      expect(PLAYER_START_TILES.player1).toEqual([25, 26, 27, 28, 29]);

      // Player 2: row 0 (타일 0-4) - player2_home 구역
      expect(PLAYER_START_TILES.player2).toEqual([0, 1, 2, 3, 4]);
    });

    it('GENERALS_PER_PLAYER가 5이다', () => {
      expect(GENERALS_PER_PLAYER).toBe(5);
    });

    it('TOTAL_GENERALS가 10이다 (양측 5명씩)', () => {
      expect(TOTAL_GENERALS).toBe(10);
    });

    it('모든 장수 데이터에 필수 필드가 있다', () => {
      for (const [baseId, data] of Object.entries(GENERAL_BASE_DATA)) {
        expect(data.baseId).toBe(baseId);
        expect(data.name).toBeTruthy();
        expect(data.nameKo).toBeTruthy();
        expect(data.stats).toBeDefined();
        expect(data.stats.star).toBeGreaterThan(0);
        expect(data.stats.sun).toBeGreaterThan(0);
        expect(data.stats.moon).toBeGreaterThan(0);
        expect(data.stats.speed).toBeGreaterThan(0);
      }
    });

    it('GENERAL_ORDER의 모든 ID가 GENERAL_BASE_DATA에 존재한다', () => {
      for (const baseId of GENERAL_ORDER) {
        expect(GENERAL_BASE_DATA[baseId]).toBeDefined();
      }
    });

    it('시작 타일 수가 장수 수와 일치한다', () => {
      expect(PLAYER_START_TILES.player1).toHaveLength(GENERALS_PER_PLAYER);
      expect(PLAYER_START_TILES.player2).toHaveLength(GENERALS_PER_PLAYER);
    });
  });

  describe('장수 생성 (Task 2.1)', () => {
    it('관우 장수가 올바른 스탯으로 생성된다', () => {
      const guanyu = createGeneral('guanyu', 'player1');
      expect(guanyu.id).toBe('player1_guanyu');
      expect(guanyu.baseId).toBe('guanyu');
      expect(guanyu.name).toBe('Guan Yu');
      expect(guanyu.nameKo).toBe('관우');
      expect(guanyu.owner).toBe('player1');
      expect(guanyu.stats.star).toBe(5);
      expect(guanyu.stats.sun).toBe(4);
      expect(guanyu.stats.moon).toBe(4);
      expect(guanyu.stats.speed).toBe(2);
      expect(guanyu.troops).toBe(10); // 초기 병력 = star × TROOP_MULTIPLIER
      expect(guanyu.status).toBe('active');
      expect(guanyu.position).toBeNull();
    });

    it('장비 장수가 올바른 스탯으로 생성된다', () => {
      const zhangfei = createGeneral('zhangfei', 'player2');
      expect(zhangfei.id).toBe('player2_zhangfei');
      expect(zhangfei.nameKo).toBe('장비');
      expect(zhangfei.owner).toBe('player2');
      expect(zhangfei.stats.star).toBe(4);
      expect(zhangfei.stats.sun).toBe(5);
      expect(zhangfei.stats.moon).toBe(3);
      expect(zhangfei.troops).toBe(8); // 초기 병력 = star × TROOP_MULTIPLIER
    });

    it('position을 지정하여 장수를 생성할 수 있다', () => {
      const guanyu = createGeneral('guanyu', 'player1', 25);
      expect(guanyu.position).toBe(25);
    });

    it('존재하지 않는 장수 ID로 생성 시 에러가 발생한다', () => {
      expect(() => createGeneral('unknown', 'player1')).toThrow(
        'Unknown general: unknown'
      );
    });

    it('모든 5명 장수를 생성할 수 있다', () => {
      for (const baseId of GENERAL_ORDER) {
        const general = createGeneral(baseId, 'player1');
        expect(general.baseId).toBe(baseId);
        expect(general.troops).toBe(GENERAL_BASE_DATA[baseId].stats.star * 2);
      }
    });
  });

  describe('플레이어별 장수 초기 생성 (Task 2.1)', () => {
    it('Player 1의 5명 장수가 올바르게 생성된다', () => {
      const generals = createInitialGenerals('player1');
      expect(generals).toHaveLength(5);
      expect(generals.every((g) => g.owner === 'player1')).toBe(true);
    });

    it('Player 2의 5명 장수가 올바르게 생성된다', () => {
      const generals = createInitialGenerals('player2');
      expect(generals).toHaveLength(5);
      expect(generals.every((g) => g.owner === 'player2')).toBe(true);
    });

    it('Player 1 장수가 row 5 (타일 25-29)에 배치된다', () => {
      const generals = createInitialGenerals('player1');
      const positions = generals.map((g) => g.position);
      expect(positions).toEqual([25, 26, 27, 28, 29]);
    });

    it('Player 2 장수가 row 0 (타일 0-4)에 배치된다', () => {
      const generals = createInitialGenerals('player2');
      const positions = generals.map((g) => g.position);
      expect(positions).toEqual([0, 1, 2, 3, 4]);
    });

    it('장수가 GENERAL_ORDER 순서대로 배치된다', () => {
      const generals = createInitialGenerals('player1');
      const baseIds = generals.map((g) => g.baseId);
      expect(baseIds).toEqual(GENERAL_ORDER);
    });

    it('모든 장수가 active 상태로 생성된다', () => {
      const generals = createInitialGenerals('player1');
      expect(generals.every((g) => g.status === 'active')).toBe(true);
    });

    it('각 장수의 초기 병력이 star × 2와 같다', () => {
      const generals = createInitialGenerals('player1');
      for (const general of generals) {
        expect(general.troops).toBe(general.stats.star * 2);
      }
    });
  });
});
