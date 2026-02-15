/**
 * 게임 설정 상태 관리 (Zustand)
 *
 * 사운드 ON/OFF 등 게임 설정을 관리합니다.
 * LocalStorage에 영속화됩니다.
 *
 * Story 4-6: 전투 피드백 (Combat Feedback)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 설정 상태 인터페이스
 */
export interface SettingsState {
  /** 사운드 활성화 여부 */
  soundEnabled: boolean;

  /** 사운드 토글 */
  toggleSound: () => void;

  /** 사운드 설정 */
  setSound: (enabled: boolean) => void;
}

/**
 * 설정 스토어
 *
 * LocalStorage 'game-settings' 키에 영속화됩니다.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      setSound: (enabled) => set({ soundEnabled: enabled }),
    }),
    {
      name: 'game-settings',
    }
  )
);

/**
 * 사운드 활성화 여부 가져오기 (Phaser에서 사용)
 *
 * React 외부(Phaser Scene)에서 사운드 설정을 확인할 때 사용합니다.
 */
export function isSoundEnabled(): boolean {
  return useSettingsStore.getState().soundEnabled;
}
