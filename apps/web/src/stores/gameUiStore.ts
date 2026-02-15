/**
 * 게임 UI 상태 관리 (Zustand)
 *
 * React UI의 게임 관련 상태를 관리합니다.
 * Story 2-3: 장수 스탯 표시
 */

import { create } from 'zustand';
import type { GeneralId } from '@ftg/game-core';

/**
 * 게임 UI 상태 인터페이스
 */
export interface GameUiState {
  /** 선택된 장수 ID (null이면 선택 없음) */
  selectedGeneralId: GeneralId | null;

  /** 장수 선택 */
  setSelectedGeneral: (id: GeneralId) => void;

  /** 장수 선택 해제 */
  clearSelectedGeneral: () => void;
}

/**
 * 게임 UI 상태 스토어
 *
 * game-core 이벤트와 연동하여 UI 상태를 관리합니다.
 */
export const useGameUiStore = create<GameUiState>((set) => ({
  selectedGeneralId: null,

  setSelectedGeneral: (id) => set({ selectedGeneralId: id }),

  clearSelectedGeneral: () => set({ selectedGeneralId: null }),
}));
