/**
 * 공격 방향 판정 모듈
 *
 * 두 타일 간의 공격 방향을 판정합니다.
 * - 전선(Frontline) ⚔️: 같은 열, 다른 행 (수직 방향)
 * - 해(Sun) ☀️: 공격자보다 col이 큰 쪽 (우측 대각선)
 * - 달(Moon) 🌙: 공격자보다 col이 작은 쪽 (좌측 대각선)
 */

import type { TileId, AttackDirection } from './types';
import { getTileMeta } from './tileMeta';
import { areAdjacent } from './adjacency';

/**
 * 두 타일 간 공격 방향 판정
 *
 * @param attackerTile 공격자 타일 ID
 * @param defenderTile 방어자 타일 ID
 * @returns 공격 방향 또는 null (인접하지 않은 경우)
 *
 * @example
 * ```typescript
 * // 타일 12에서 타일 13으로 공격 (같은 행, 우측)
 * getAttackDirection(12, 13); // 'sun'
 *
 * // 타일 12에서 타일 11로 공격 (같은 행, 좌측)
 * getAttackDirection(12, 11); // 'moon'
 *
 * // 타일 12에서 타일 7로 공격 (같은 열, 위)
 * getAttackDirection(12, 7); // 'frontline'
 * ```
 */
export function getAttackDirection(
  attackerTile: TileId,
  defenderTile: TileId
): AttackDirection | null {
  // 인접하지 않으면 공격 불가
  if (!areAdjacent(attackerTile, defenderTile)) {
    return null;
  }

  const attacker = getTileMeta(attackerTile);
  const defender = getTileMeta(defenderTile);

  if (!attacker || !defender) {
    return null;
  }

  // 측면 타일 특수 처리
  if (attacker.isSideTile || defender.isSideTile) {
    // 측면 타일은 항상 해/달 방향
    // 측면 타일(col = -1 또는 5)과 메인 타일 간 공격
    if (attacker.isSideTile) {
      // 측면에서 메인으로 공격
      // 좌측(col=-1)에서 공격 → 우측으로 가므로 sun
      // 우측(col=5)에서 공격 → 좌측으로 가므로 moon
      return attacker.col === -1 ? 'sun' : 'moon';
    } else {
      // 메인에서 측면으로 공격
      // 좌측(col=-1)으로 공격 → 좌측으로 가므로 moon
      // 우측(col=5)으로 공격 → 우측으로 가므로 sun
      return defender.col === -1 ? 'moon' : 'sun';
    }
  }

  // 메인 타일 간 공격
  // 같은 열, 다른 행 → 전선 (수직 이동)
  if (attacker.col === defender.col) {
    return 'frontline';
  }

  // 공격자보다 col이 큰 쪽 → 해 (우측)
  if (defender.col > attacker.col) {
    return 'sun';
  }

  // 공격자보다 col이 작은 쪽 → 달 (좌측)
  return 'moon';
}
