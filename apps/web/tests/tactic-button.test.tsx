/**
 * TacticButton Component Tests
 *
 * Story 8-4: 책략 선택 UI (Tactic Selection UI)
 * 책략은 플레이어 단위 액션이므로 장수 선택과 무관하게 항상 활성화.
 * 게임 종료 시에만 비활성화.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TacticButton } from '../src/components/game/TacticButton';

describe('TacticButton', () => {
  // 기본 렌더링
  describe('기본 렌더링', () => {
    it('"책략" 텍스트가 표시된다', () => {
      render(<TacticButton isGameEnded={false} onClick={vi.fn()} />);
      expect(screen.getByText('책략')).toBeInTheDocument();
    });
  });

  // 활성/비활성 상태
  describe('활성/비활성 상태', () => {
    it('게임 진행 중이면 버튼이 활성화된다', () => {
      render(<TacticButton isGameEnded={false} onClick={vi.fn()} />);
      const button = screen.getByTestId('tactic-button');
      expect(button).not.toBeDisabled();
    });

    it('게임 종료 시 버튼이 비활성화된다', () => {
      render(<TacticButton isGameEnded={true} onClick={vi.fn()} />);
      const button = screen.getByTestId('tactic-button');
      expect(button).toBeDisabled();
    });
  });

  // 클릭 콜백
  describe('클릭 콜백', () => {
    it('활성 버튼 클릭 시 onClick이 호출된다', () => {
      const onClick = vi.fn();
      render(<TacticButton isGameEnded={false} onClick={onClick} />);
      fireEvent.click(screen.getByTestId('tactic-button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('게임 종료 시 버튼 클릭해도 onClick이 호출되지 않는다', () => {
      const onClick = vi.fn();
      render(<TacticButton isGameEnded={true} onClick={onClick} />);
      fireEvent.click(screen.getByTestId('tactic-button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // 접근성
  describe('접근성', () => {
    it('aria-label="책략 메뉴 열기"가 적용된다', () => {
      render(<TacticButton isGameEnded={false} onClick={vi.fn()} />);
      const button = screen.getByTestId('tactic-button');
      expect(button).toHaveAttribute('aria-label', '책략 메뉴 열기');
    });

    it('button type="button"이 적용된다', () => {
      render(<TacticButton isGameEnded={false} onClick={vi.fn()} />);
      const button = screen.getByTestId('tactic-button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
