/**
 * Combat System
 *
 * 전투 시스템 모듈
 * Story 4-1: 인접 공격 (Adjacent Attack)
 * Story 4-2: 공격 방향 판정 (Attack Direction Judgment)
 * Story 4-3: 방향별 데미지 계산 (Directional Damage Calculation)
 */

export { getAttackableTiles } from './attackable';
export { canAttack, executeAttack } from './attack';
export type { ExecuteAttackData } from './attack';
export type { AttackResult } from './types';
export { calculateDamage, getAttackStat, getDefendStat } from './damage';
