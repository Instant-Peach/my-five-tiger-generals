/**
 * 전투 시스템 타입 정의
 *
 * Story 4-2: 공격 방향 판정 (Attack Direction Judgment)
 */

import type { AttackDirection } from '../board/types';
import type { GeneralId } from '../generals/types';
import type { TileId } from '../board/types';

/**
 * 공격 결과
 *
 * 공격 실행 후 반환되는 결과 정보입니다.
 * 방향 정보를 포함하여 후속 스토리(4-3 피해 계산)에서 활용됩니다.
 */
export interface AttackResult {
  /** 공격자 장수 ID */
  attackerId: GeneralId;
  /** 방어자 장수 ID */
  defenderId: GeneralId;
  /** 공격자 타일 ID */
  attackerTile: TileId;
  /** 방어자 타일 ID */
  defenderTile: TileId;
  /** 공격 방향 (sun/moon/frontline) */
  direction: AttackDirection;
  /** 가해진 피해량 (4-3에서 방향별 계산으로 대체 예정) */
  damage: number;
  /** 피해 적용 후 방어자 병력 수 */
  defenderTroopsAfter: number;
  /** 방어자 기절(OUT) 여부 (4-5에서 활용) */
  isKnockOut: boolean;
}
