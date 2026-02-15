/**
 * 책략 시스템 상수 정의
 *
 * Story 8-4: 책략 선택 UI (Tactic Selection UI)
 * Phase 1: 플레이스홀더 데이터 정의
 *
 * 게임 규칙 Section 9:
 * - 장수별 책략 슬롯 3개
 * - 현장용(field) / 사무용(office) 구분
 */

import type { TacticInfo, TacticSlot } from './types';

/** 장수 당 책략 슬롯 수 */
export const TACTIC_SLOTS_PER_GENERAL = 3;

/**
 * Phase 1 플레이스홀더 책략 데이터
 *
 * UI 표시용으로만 사용됩니다.
 * Phase 3에서 실제 책략 데이터로 교체됩니다.
 */
export const PLACEHOLDER_TACTICS: readonly TacticInfo[] = [
  {
    id: 'placeholder_field_1',
    name: 'Field Tactic 1',
    nameKo: '현장 책략 1',
    type: 'field',
    description: 'Phase 3에서 활성화',
  },
  {
    id: 'placeholder_office_1',
    name: 'Office Tactic',
    nameKo: '사무 책략',
    type: 'office',
    description: 'Phase 3에서 활성화',
  },
  {
    id: 'placeholder_field_2',
    name: 'Field Tactic 2',
    nameKo: '현장 책략 2',
    type: 'field',
    description: 'Phase 3에서 활성화',
  },
] as const;

/**
 * Phase 1 플레이스홀더 책략 슬롯 데이터
 *
 * 모든 슬롯은 'coming_soon' 상태로 표시됩니다.
 */
export const PLACEHOLDER_TACTIC_SLOTS: readonly Readonly<TacticSlot>[] = PLACEHOLDER_TACTICS.map(
  (tactic) => ({
    tactic,
    status: 'coming_soon' as const,
    usesRemaining: 1,
  }),
);
