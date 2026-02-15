/**
 * 피해 계산 로직
 *
 * Story 4-3: 방향별 데미지 계산 (Directional Damage Calculation)
 *
 * GDD 기준 피해 계산 규칙:
 * - 해(Sun) ☀️: 공격자 sun - 방어자 sun (최소 0)
 * - 달(Moon) 🌙: 공격자 moon - 방어자 moon (최소 0)
 * - 전선(Frontline) ⚔️: 고정 1 피해
 */

import type { General } from '../generals/types';
import type { AttackDirection } from '../board/types';
import { COMBAT } from '../constants';

/**
 * 방향에 따른 공격 스탯 조회
 *
 * @param general - 장수 엔티티
 * @param direction - 공격 방향
 * @returns 해당 방향의 공격 스탯 값 (전선은 0 반환)
 */
export function getAttackStat(general: General, direction: AttackDirection): number {
  switch (direction) {
    case 'sun':
      return general.stats.sun;
    case 'moon':
      return general.stats.moon;
    case 'frontline':
      return 0; // 전선은 스탯 미사용 (고정 피해)
  }
}

/**
 * 방향에 따른 방어 스탯 조회
 *
 * @param general - 장수 엔티티
 * @param direction - 공격 방향
 * @returns 해당 방향의 방어 스탯 값 (전선은 0 반환)
 */
export function getDefendStat(general: General, direction: AttackDirection): number {
  switch (direction) {
    case 'sun':
      return general.stats.sun;
    case 'moon':
      return general.stats.moon;
    case 'frontline':
      return 0; // 전선은 스탯 미사용 (고정 피해)
  }
}

/**
 * 전투 피해 계산
 *
 * GDD 기준:
 * - 해(Sun) ☀️: 공격자 sun - 방어자 sun (최소 0)
 * - 달(Moon) 🌙: 공격자 moon - 방어자 moon (최소 0)
 * - 전선(Frontline) ⚔️: 고정 1 피해
 *
 * @param attacker - 공격자 장수
 * @param defender - 방어자 장수
 * @param direction - 공격 방향
 * @returns 피해량
 *
 * @example
 * ```typescript
 * // 장비(sun:5) -> 관우(sun:4) Sun 공격: 5-4 = 1 피해
 * const damage = calculateDamage(zhangfei, guanyu, 'sun'); // 1
 *
 * // 관우(sun:4) -> 황충(sun:5) Sun 공격: 4-5 = 0 피해 (방어 우위)
 * const damage = calculateDamage(guanyu, huangzhong, 'sun'); // 0
 *
 * // 전선 공격: 고정 1 피해
 * const damage = calculateDamage(any, any, 'frontline'); // 1
 * ```
 */
export function calculateDamage(
  attacker: General,
  defender: General,
  direction: AttackDirection
): number {
  // 전선은 고정 피해
  if (direction === 'frontline') {
    return COMBAT.FRONTLINE_DAMAGE;
  }

  // 해/달: 공격 스탯 - 방어 스탯 (최소 0)
  const attackStat = getAttackStat(attacker, direction);
  const defendStat = getDefendStat(defender, direction);

  return Math.max(COMBAT.MIN_DAMAGE, attackStat - defendStat);
}
