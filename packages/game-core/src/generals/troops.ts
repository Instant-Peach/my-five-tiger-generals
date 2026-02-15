/**
 * Troop System
 *
 * 병력 상태 판정 로직
 * 규칙 기준: 별(star) × TROOP_MULTIPLIER = 최대 병력, 병력(troops) = 현재 HP
 */

/** 별 1개당 병력 배수 (별 × TROOP_MULTIPLIER = 최대 병력) */
export const TROOP_MULTIPLIER = 2;

/**
 * 별(star) 스탯으로부터 최대 병력을 계산
 *
 * @param star - 별(통솔력) 스탯
 * @returns 최대 병력 (star × TROOP_MULTIPLIER)
 *
 * @example
 * getMaxTroops(5) // 10 (관우)
 * getMaxTroops(3) // 6 (황충)
 */
export function getMaxTroops(star: number): number {
  return star * TROOP_MULTIPLIER;
}

/** 병력 상태 */
export type TroopStatus = 'full' | 'warning' | 'danger' | 'out';

/** 병력 상태 임계값 */
export const TROOP_THRESHOLDS = {
  /** 50% 이하일 때 위험 (danger) */
  WARNING: 0.5,
} as const;

/**
 * 장수의 병력 상태 판정
 *
 * @param troops - 현재 병력
 * @param maxTroops - 최대 병력 (별 스탯)
 * @returns TroopStatus
 *
 * @example
 * getTroopStatus(5, 5) // 'full'
 * getTroopStatus(3, 5) // 'warning' (60% >= 50%)
 * getTroopStatus(2, 5) // 'danger' (40% < 50%)
 * getTroopStatus(0, 5) // 'out'
 */
export function getTroopStatus(troops: number, maxTroops: number): TroopStatus {
  if (maxTroops <= 0) return 'out';
  if (troops <= 0) return 'out';
  if (troops >= maxTroops) return 'full';

  const ratio = troops / maxTroops;
  if (ratio < TROOP_THRESHOLDS.WARNING) return 'danger';
  return 'warning';
}

/**
 * 병력 비율 계산
 *
 * @param troops - 현재 병력
 * @param maxTroops - 최대 병력
 * @returns 0~1 사이의 비율
 */
export function getTroopRatio(troops: number, maxTroops: number): number {
  if (maxTroops <= 0) return 0;
  return Math.max(0, Math.min(1, troops / maxTroops));
}
