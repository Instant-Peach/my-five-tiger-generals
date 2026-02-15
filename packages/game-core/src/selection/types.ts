/**
 * 선택 상태 타입 정의
 *
 * 타일 선택 상태를 관리하기 위한 타입들입니다.
 * Phase 1에서는 클라이언트 전용, Phase 2에서 서버 동기화 예정
 */

import type { TileId } from '../board/types';

/**
 * 선택 상태
 */
export interface SelectionState {
  /** 현재 선택된 타일 ID (null이면 선택 없음) */
  selectedTileId: TileId | null;
}

/**
 * 선택 액션 타입
 */
export type SelectionAction = 'select' | 'deselect';

/**
 * 선택 이벤트 페이로드
 */
export interface SelectionEventPayload {
  /** 액션 타입 */
  action: SelectionAction;
  /** 대상 타일 ID (deselect 시 이전 선택 타일) */
  tileId: TileId | null;
  /** 이전 선택 타일 ID */
  previousTileId?: TileId | null;
}

/**
 * 호버 이벤트 페이로드
 */
export interface HoverEventPayload {
  /** 호버된 타일 ID */
  tileId: TileId;
}
