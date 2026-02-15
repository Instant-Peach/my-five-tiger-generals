/**
 * Phaser 게임 설정 팩토리
 *
 * SSR Safe: 이 모듈은 클라이언트에서만 import되어야 합니다.
 */

import type Phaser from 'phaser';

/** 최소 뷰포트 크기 (WCAG 2.1 터치 타겟 기준) */
export const MIN_VIEWPORT = {
  width: 320,
  height: 480,
} as const;

export interface GameConfigOptions {
  /** 게임 캔버스 너비 (기본값: 부모 컨테이너 크기 또는 800) */
  width?: number | string;
  /** 게임 캔버스 높이 (기본값: 부모 컨테이너 크기 또는 600) */
  height?: number | string;
  /** 부모 DOM 요소 ID */
  parent?: string;
  /** 배경색 */
  backgroundColor?: string;
  /** Phaser Scene 배열 */
  scenes?: Array<new () => Phaser.Scene>;
}

const DEFAULT_CONFIG: Omit<GameConfigOptions, 'width' | 'height'> & {
  width: number;
  height: number;
} = {
  width: 800,
  height: 600,
  backgroundColor: '#d0d0d0', // 옅은 회색
};

/**
 * Phaser 게임 설정 생성
 *
 * @param PhaserModule - 동적으로 import된 Phaser 모듈
 * @param options - 게임 설정 옵션
 */
export function createGameConfig(
  PhaserModule: typeof Phaser,
  options: GameConfigOptions = {}
): Phaser.Types.Core.GameConfig {
  const config = { ...DEFAULT_CONFIG, ...options };

  return {
    type: PhaserModule.AUTO,
    parent: config.parent,
    width: config.width,
    height: config.height,
    backgroundColor: config.backgroundColor,
    scale: {
      mode: PhaserModule.Scale.NONE,
      autoCenter: PhaserModule.Scale.NO_CENTER,
    },
    scene: config.scenes ?? [],
    render: {
      antialias: true,
      pixelArt: false,
    },
  };
}

/**
 * Phaser 게임 인스턴스 생성
 *
 * @param PhaserModule - 동적으로 import된 Phaser 모듈
 * @param options - 게임 설정 옵션
 */
export function createGame(
  PhaserModule: typeof Phaser,
  options: GameConfigOptions = {}
): Phaser.Game {
  const gameConfig = createGameConfig(PhaserModule, options);
  return new PhaserModule.Game(gameConfig);
}
