/**
 * Victory System
 *
 * 승리 조건 관련 모듈
 * Story 6-1: 노크 행동 (Knock Action)
 * Story 6-2: 3회 노크 승리 (Triple Knock Victory)
 * Story 6-4: 와해 승리 (Collapse Victory)
 * Story 6-5: 항복 (Surrender)
 */

export {
  canKnock,
  validateKnock,
  executeKnock,
  getKnockTargetZone,
  isInKnockZone,
  checkKnockVictory,
} from './knock';

export type { ExecuteKnockData } from './knock';

export { checkCollapseVictory } from './collapse';

export { executeSurrender } from './surrender';

export type { ExecuteSurrenderData } from './surrender';
