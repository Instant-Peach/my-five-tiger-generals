/**
 * ActionCounter Component Tests
 *
 * Story 8-2: 게임 HUD (Game HUD)
 * AC2: 행동 카운터 표시 (도트 개수, 남은 행동 표시)
 * AC6: 접근성 (role="status", aria-label)
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActionCounter } from '../src/components/game/ActionCounter';

describe('ActionCounter', () => {
  // AC2: 행동 카운터 표시
  describe('AC2: 행동 카운터 표시', () => {
    it('기본 3개 도트가 렌더링된다', () => {
      render(<ActionCounter actionsRemaining={3} />);
      expect(screen.getByTestId('action-dot-0')).toBeInTheDocument();
      expect(screen.getByTestId('action-dot-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-dot-2')).toBeInTheDocument();
    });

    it('actionsRemaining=3이면 모든 도트가 filled 상태이다', () => {
      render(<ActionCounter actionsRemaining={3} />);
      expect(screen.getByTestId('action-dot-0').className).toContain('--filled');
      expect(screen.getByTestId('action-dot-1').className).toContain('--filled');
      expect(screen.getByTestId('action-dot-2').className).toContain('--filled');
    });

    it('actionsRemaining=2이면 2개만 filled이고 1개는 empty이다', () => {
      render(<ActionCounter actionsRemaining={2} />);
      expect(screen.getByTestId('action-dot-0').className).toContain('--filled');
      expect(screen.getByTestId('action-dot-1').className).toContain('--filled');
      expect(screen.getByTestId('action-dot-2').className).toContain('--empty');
    });

    it('actionsRemaining=1이면 1개만 filled이고 2개는 empty이다', () => {
      render(<ActionCounter actionsRemaining={1} />);
      expect(screen.getByTestId('action-dot-0').className).toContain('--filled');
      expect(screen.getByTestId('action-dot-1').className).toContain('--empty');
      expect(screen.getByTestId('action-dot-2').className).toContain('--empty');
    });

    it('actionsRemaining=0이면 모든 도트가 empty이다', () => {
      render(<ActionCounter actionsRemaining={0} />);
      expect(screen.getByTestId('action-dot-0').className).toContain('--empty');
      expect(screen.getByTestId('action-dot-1').className).toContain('--empty');
      expect(screen.getByTestId('action-dot-2').className).toContain('--empty');
    });

    it('maxActions를 커스텀 값으로 설정할 수 있다', () => {
      render(<ActionCounter actionsRemaining={2} maxActions={5} />);
      expect(screen.getByTestId('action-dot-0')).toBeInTheDocument();
      expect(screen.getByTestId('action-dot-4')).toBeInTheDocument();
      // 5개 도트 중 2개만 filled
      expect(screen.getByTestId('action-dot-0').className).toContain('--filled');
      expect(screen.getByTestId('action-dot-1').className).toContain('--filled');
      expect(screen.getByTestId('action-dot-2').className).toContain('--empty');
    });
  });

  // AC2: 행동 소모 시 업데이트 테스트 (리렌더링)
  describe('AC2: 행동 소모 시 업데이트', () => {
    it('actionsRemaining이 변경되면 도트 상태가 업데이트된다', () => {
      const { rerender } = render(<ActionCounter actionsRemaining={3} />);
      // 초기: 모두 filled
      expect(screen.getByTestId('action-dot-2').className).toContain('--filled');

      // 행동 소모: 3 -> 2
      rerender(<ActionCounter actionsRemaining={2} />);
      expect(screen.getByTestId('action-dot-2').className).toContain('--empty');
      expect(screen.getByTestId('action-dot-1').className).toContain('--filled');

      // 행동 소모: 2 -> 0
      rerender(<ActionCounter actionsRemaining={0} />);
      expect(screen.getByTestId('action-dot-0').className).toContain('--empty');
      expect(screen.getByTestId('action-dot-1').className).toContain('--empty');
      expect(screen.getByTestId('action-dot-2').className).toContain('--empty');
    });
  });

  // AC6: 접근성
  describe('AC6: 접근성', () => {
    it('role="status" 속성이 적용된다', () => {
      render(<ActionCounter actionsRemaining={3} />);
      const counter = screen.getByTestId('action-counter');
      expect(counter).toHaveAttribute('role', 'status');
    });

    it('aria-label에 남은 행동 수가 포함된다', () => {
      render(<ActionCounter actionsRemaining={2} />);
      const counter = screen.getByTestId('action-counter');
      const label = counter.getAttribute('aria-label') ?? '';
      expect(label).toContain('2');
      expect(label).toContain('3'); // maxActions 기본값
    });

    it('커스텀 maxActions에 대한 aria-label이 올바르다', () => {
      render(<ActionCounter actionsRemaining={1} maxActions={5} />);
      const counter = screen.getByTestId('action-counter');
      const label = counter.getAttribute('aria-label') ?? '';
      expect(label).toContain('1');
      expect(label).toContain('5');
    });

    it('도트는 aria-hidden="true"이다 (장식적 요소)', () => {
      render(<ActionCounter actionsRemaining={3} />);
      const dot = screen.getByTestId('action-dot-0');
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // 컴포넌트 구조 테스트
  describe('컴포넌트 구조', () => {
    it('action-counter 컨테이너가 렌더링된다', () => {
      render(<ActionCounter actionsRemaining={3} />);
      expect(screen.getByTestId('action-counter')).toBeInTheDocument();
    });

    it('action-counter-dots 컨테이너가 렌더링된다', () => {
      render(<ActionCounter actionsRemaining={3} />);
      expect(screen.getByTestId('action-counter-dots')).toBeInTheDocument();
    });
  });
});
