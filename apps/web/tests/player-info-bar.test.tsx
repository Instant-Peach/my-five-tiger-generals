/**
 * PlayerInfoBar Component Tests
 *
 * Story 8-2: 게임 HUD (Game HUD)
 * AC1: 플레이어 정보 바 (양 플레이어 이름, 노크 카운트, 현재 턴 강조)
 * AC3: 턴/타이머 통합 표시
 * AC5: 반응형 레이아웃 기본 렌더링
 * AC6: 접근성 (role, aria-label)
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlayerInfoBar } from '../src/components/game/PlayerInfoBar';

describe('PlayerInfoBar', () => {
  const defaultProps = {
    currentPlayer: 'player1' as const,
    turn: 1,
    remainingTime: 60,
    actionsRemaining: 3,
    player1KnockCount: 0,
    player2KnockCount: 0,
  };

  // AC1: 플레이어 정보 바
  describe('AC1: 플레이어 정보 바', () => {
    it('Player 1 이름이 표시된다', () => {
      render(<PlayerInfoBar {...defaultProps} />);
      expect(screen.getByTestId('player-info-p1-name')).toHaveTextContent('Player 1');
    });

    it('Player 2 이름이 표시된다', () => {
      render(<PlayerInfoBar {...defaultProps} />);
      expect(screen.getByTestId('player-info-p2-name')).toHaveTextContent('Player 2');
    });

    it('Player 1이 현재 턴일 때 P1 영역에 active 클래스가 적용된다', () => {
      render(<PlayerInfoBar {...defaultProps} currentPlayer="player1" />);
      const p1 = screen.getByTestId('player-info-p1');
      const p2 = screen.getByTestId('player-info-p2');
      expect(p1.className).toContain('player-info-bar__player--active');
      expect(p2.className).not.toContain('player-info-bar__player--active');
    });

    it('Player 2가 현재 턴일 때 P2 영역에 active 클래스가 적용된다', () => {
      render(<PlayerInfoBar {...defaultProps} currentPlayer="player2" />);
      const p1 = screen.getByTestId('player-info-p1');
      const p2 = screen.getByTestId('player-info-p2');
      expect(p1.className).not.toContain('player-info-bar__player--active');
      expect(p2.className).toContain('player-info-bar__player--active');
    });

    it('Player 1 노크 카운트가 올바르게 표시된다 (2/3)', () => {
      render(<PlayerInfoBar {...defaultProps} player1KnockCount={2} />);
      const dots = screen.getByTestId('p1-knock-dots');
      // 3개 도트 중 2개가 filled
      expect(screen.getByTestId('p1-knock-dot-0').className).toContain('--filled');
      expect(screen.getByTestId('p1-knock-dot-1').className).toContain('--filled');
      expect(screen.getByTestId('p1-knock-dot-2').className).not.toContain('--filled');
      expect(dots).toBeInTheDocument();
    });

    it('Player 2 노크 카운트가 올바르게 표시된다 (1/3)', () => {
      render(<PlayerInfoBar {...defaultProps} player2KnockCount={1} />);
      expect(screen.getByTestId('p2-knock-dot-0').className).toContain('--filled');
      expect(screen.getByTestId('p2-knock-dot-1').className).not.toContain('--filled');
      expect(screen.getByTestId('p2-knock-dot-2').className).not.toContain('--filled');
    });

    it('노크 카운트가 0이면 모든 도트가 비어있다', () => {
      render(<PlayerInfoBar {...defaultProps} player1KnockCount={0} player2KnockCount={0} />);
      expect(screen.getByTestId('p1-knock-dot-0').className).not.toContain('--filled');
      expect(screen.getByTestId('p2-knock-dot-0').className).not.toContain('--filled');
    });
  });

  // AC3: 턴/타이머 통합 표시
  describe('AC3: 턴/타이머 통합 표시', () => {
    it('턴 번호가 표시된다', () => {
      render(<PlayerInfoBar {...defaultProps} turn={5} />);
      expect(screen.getByTestId('turn-number')).toHaveTextContent('턴 5');
    });

    it('중앙 영역이 렌더링된다', () => {
      render(<PlayerInfoBar {...defaultProps} />);
      expect(screen.getByTestId('player-info-center')).toBeInTheDocument();
    });

    it('행동 카운터가 표시된다', () => {
      render(<PlayerInfoBar {...defaultProps} actionsRemaining={2} />);
      expect(screen.getByTestId('action-counter')).toBeInTheDocument();
    });
  });

  // AC5: 반응형 레이아웃 기본 렌더링
  describe('AC5: 반응형 레이아웃 기본 렌더링', () => {
    it('player-info-bar 컨테이너가 렌더링된다', () => {
      render(<PlayerInfoBar {...defaultProps} />);
      expect(screen.getByTestId('player-info-bar')).toBeInTheDocument();
    });

    it('축약 이름(P1/P2) 요소가 존재한다 (모바일용)', () => {
      render(<PlayerInfoBar {...defaultProps} />);
      const p1Name = screen.getByTestId('player-info-p1-name');
      const p2Name = screen.getByTestId('player-info-p2-name');
      // full과 short 이름 모두 DOM에 존재 (CSS로 표시/숨김 전환)
      expect(p1Name.textContent).toContain('P1');
      expect(p2Name.textContent).toContain('P2');
    });
  });

  // AC6: 접근성
  describe('AC6: 접근성', () => {
    it('role="status" 속성이 적용된다', () => {
      render(<PlayerInfoBar {...defaultProps} />);
      const bar = screen.getByTestId('player-info-bar');
      expect(bar).toHaveAttribute('role', 'status');
    });

    it('aria-label에 턴 정보가 포함된다', () => {
      render(<PlayerInfoBar {...defaultProps} turn={3} currentPlayer="player2" remainingTime={45} />);
      const bar = screen.getByTestId('player-info-bar');
      expect(bar).toHaveAttribute('aria-label');
      const label = bar.getAttribute('aria-label') ?? '';
      expect(label).toContain('턴 3');
      expect(label).toContain('Player 2');
      expect(label).toContain('45초');
    });
  });
});
