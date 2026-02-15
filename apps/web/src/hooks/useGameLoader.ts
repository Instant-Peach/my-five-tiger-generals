/**
 * useGameLoader Hook
 *
 * SSR Safe Dynamic Import 패턴으로 Phaser를 로드합니다.
 * Cloudflare Workers/Pages 호환을 위해 클라이언트에서만 로드합니다.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type Phaser from 'phaser';

export interface UseGameLoaderOptions {
  /** 게임 캔버스 부모 요소 ID */
  parentId: string;
  /** 초기 게임 너비 */
  width?: number;
  /** 초기 게임 높이 */
  height?: number;
  /** 게임 로드 활성화 여부 (기본값: true) */
  enabled?: boolean;
}

export interface UseGameLoaderResult {
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** Phaser 게임 인스턴스 */
  game: Phaser.Game | null;
  /** 게임 다시 시작 */
  restart: () => void;
}

/**
 * Phaser 게임 로더 훅
 *
 * SSR 환경에서 안전하게 Phaser를 동적으로 로드하고
 * 게임 인스턴스를 생성합니다.
 */
export function useGameLoader(
  options: UseGameLoaderOptions
): UseGameLoaderResult {
  const { parentId, width = 800, height = 600, enabled = true } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);

  const gameRef = useRef<Phaser.Game | null>(null);
  const mountedRef = useRef(false);
  const initializedRef = useRef(false);
  // 초기 크기 저장 (게임 생성 시에만 사용)
  const initialSizeRef = useRef({ width, height });

  // 최초 enabled 시점의 크기를 저장
  useEffect(() => {
    if (enabled && !initializedRef.current) {
      initialSizeRef.current = { width, height };
    }
  }, [enabled, width, height]);

  const initGame = useCallback(async () => {
    // 이미 게임이 있으면 스킵
    if (gameRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 동적으로 Phaser와 game-renderer 로드
      const [PhaserModule, RendererModule] = await Promise.all([
        import('phaser'),
        import('@ftg/game-renderer'),
      ]);

      // 컴포넌트가 언마운트되었으면 중단
      if (!mountedRef.current) return;

      const Phaser = PhaserModule.default;
      const { createGame, BootScene, GameScene } = RendererModule;

      // 게임 인스턴스 생성 (초기 크기 사용)
      const gameInstance = createGame(Phaser, {
        parent: parentId,
        width: initialSizeRef.current.width,
        height: initialSizeRef.current.height,
        scenes: [BootScene, GameScene],
      });

      gameRef.current = gameInstance;
      initializedRef.current = true;
      setGame(gameInstance);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load game:', err);
      setError(err instanceof Error ? err : new Error('Failed to load game'));
      setIsLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled && !initializedRef.current) {
      initGame();
    }

    return () => {
      mountedRef.current = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [initGame, enabled]);

  const restart = useCallback(() => {
    initGame();
  }, [initGame]);

  return { isLoading, error, game, restart };
}
