/**
 * App Component
 *
 * Story 8-1: 메인 메뉴 (Main Menu)
 * 화면 전환 로직: menu → game → menu
 */

import { useCallback, useState } from 'react';
import { StartScreen } from './components/menu/StartScreen';
import { GameCanvas } from './components/game/GameCanvas';

type Screen = 'menu' | 'game';

export function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  const handleStart = useCallback(() => {
    setScreen('game');
  }, []);

  const handleReturnToMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {screen === 'menu' ? (
        <StartScreen onStart={handleStart} />
      ) : (
        <GameCanvas onReturnToMenu={handleReturnToMenu} />
      )}
    </div>
  );
}
