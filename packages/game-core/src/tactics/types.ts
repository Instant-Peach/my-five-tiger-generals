/**
 * 책략 시스템 타입 정의
 *
 * Story 8-4: 책략 선택 UI (Tactic Selection UI)
 * Phase 1: UI 쉘(플레이스홀더)만 구현
 *
 * 게임 규칙 Section 9:
 * - 책략은 현장용(field)과 사무용(office)으로 구분
 * - 장수별로 책략 3개를 장착 (덱 빌딩)
 * - 각 책략은 해당 장수 기준 일회용
 */

/** 책략 ID */
export type TacticId = string;

/** 책략 유형: 현장용(field) / 사무용(office) */
export type TacticType = 'field' | 'office';

/**
 * 책략 슬롯 상태
 * - available: 사용 가능 (Phase 3)
 * - unavailable: 사용 불가/조건 불일치 (Phase 3)
 * - exhausted: 소진됨 (Phase 3)
 * - coming_soon: 준비 중 (Phase 1 플레이스홀더)
 */
export type TacticSlotStatus = 'available' | 'unavailable' | 'exhausted' | 'coming_soon';

/**
 * 책략 정보
 */
export interface TacticInfo {
  /** 책략 고유 ID */
  id: TacticId;
  /** 책략 이름 (영문) */
  name: string;
  /** 책략 이름 (한국어) */
  nameKo: string;
  /** 책략 유형 */
  type: TacticType;
  /** 책략 설명 */
  description: string;
}

/**
 * 책략 슬롯 (장수에게 장착된 책략)
 */
export interface TacticSlot {
  /** 책략 정보 */
  tactic: TacticInfo;
  /** 슬롯 상태 */
  status: TacticSlotStatus;
  /** 남은 사용 횟수 (Phase 3: 1=미사용, 0=소진) */
  usesRemaining: number;
}
