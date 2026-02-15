/**
 * Accessibility & Touch Target Tests
 *
 * Story 8-8: 접근성 및 터치 타겟 (Accessibility & Touch Target)
 * AC1: 터치 타겟 44x44px 보장
 * AC2: 키보드 포커스 표시
 * AC4: ARIA 속성 일괄 감사 및 보완
 * AC7: 접근성 테스트
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameHUD } from '../src/components/game/GameHUD';
import { StartScreen } from '../src/components/menu/StartScreen';
import { SurrenderConfirmModal } from '../src/components/game/SurrenderConfirmModal';

describe('GameHUD 접근성', () => {
  it('role="region"이 적용되어 있다', () => {
    render(<GameHUD />);
    const hud = screen.getByTestId('game-hud');
    expect(hud).toHaveAttribute('role', 'region');
  });

  it('aria-label="게임 HUD"가 적용되어 있다', () => {
    render(<GameHUD />);
    const hud = screen.getByTestId('game-hud');
    expect(hud).toHaveAttribute('aria-label', '게임 HUD');
  });
});

describe('StartScreen 접근성', () => {
  it('게임 시작 버튼에 aria-label="게임 시작"이 적용되어 있다', () => {
    render(<StartScreen onStart={vi.fn()} />);
    const button = screen.getByTestId('start-game-button');
    expect(button).toHaveAttribute('aria-label', '게임 시작');
  });
});

describe('SurrenderConfirmModal 접근성', () => {
  it('role="alertdialog"가 적용되어 있다', () => {
    render(
      <SurrenderConfirmModal
        isVisible={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const modal = screen.getByRole('alertdialog');
    expect(modal).toBeInTheDocument();
  });

  it('aria-modal="true"가 적용되어 있다', () => {
    render(
      <SurrenderConfirmModal
        isVisible={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const modal = screen.getByRole('alertdialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('aria-label="항복 확인"이 적용되어 있다', () => {
    render(
      <SurrenderConfirmModal
        isVisible={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const modal = screen.getByRole('alertdialog');
    expect(modal).toHaveAttribute('aria-label', '항복 확인');
  });
});
