/**
 * LandscapeOverlay Component Tests
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * Task 11.5~11.8: LandscapeOverlay 렌더링/접근성 테스트
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LandscapeOverlay } from '../src/components/game/LandscapeOverlay';

const defaultProps = {
  isVisible: true,
  onDismiss: vi.fn(),
};

describe('LandscapeOverlay', () => {
  // Task 11.5: isVisible=true 시 오버레이 표시
  describe('렌더링', () => {
    it('isVisible=true일 때 오버레이가 렌더링된다', () => {
      render(<LandscapeOverlay {...defaultProps} />);
      expect(screen.getByTestId('landscape-overlay')).toBeInTheDocument();
    });

    it('"세로 모드를 권장합니다" 메시지가 표시된다', () => {
      render(<LandscapeOverlay {...defaultProps} />);
      expect(screen.getByText('세로 모드를 권장합니다')).toBeInTheDocument();
    });

    it('보조 메시지가 표시된다', () => {
      render(<LandscapeOverlay {...defaultProps} />);
      expect(screen.getByText(/기기를 세로로 회전해주세요/)).toBeInTheDocument();
    });

    it('닫기 버튼이 표시된다', () => {
      render(<LandscapeOverlay {...defaultProps} />);
      expect(screen.getByTestId('landscape-overlay-close')).toBeInTheDocument();
      expect(screen.getByText('닫기')).toBeInTheDocument();
    });
  });

  // Task 11.6: isVisible=false 시 미렌더링
  describe('isVisible=false', () => {
    it('isVisible=false일 때 오버레이가 렌더링되지 않는다', () => {
      render(<LandscapeOverlay isVisible={false} onDismiss={vi.fn()} />);
      expect(screen.queryByTestId('landscape-overlay')).not.toBeInTheDocument();
    });
  });

  // Task 11.7: 닫기 버튼 클릭 테스트
  describe('닫기 버튼', () => {
    it('닫기 버튼 클릭 시 onDismiss 콜백이 호출된다', () => {
      const onDismiss = vi.fn();
      render(<LandscapeOverlay isVisible={true} onDismiss={onDismiss} />);
      fireEvent.click(screen.getByTestId('landscape-overlay-close'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  // Task 11.8: 접근성 테스트
  describe('접근성', () => {
    it('오버레이에 role="alert"가 적용된다', () => {
      render(<LandscapeOverlay {...defaultProps} />);
      const overlay = screen.getByTestId('landscape-overlay');
      expect(overlay).toHaveAttribute('role', 'alert');
    });

    it('오버레이에 aria-label="가로 모드 감지"가 적용된다', () => {
      render(<LandscapeOverlay {...defaultProps} />);
      const overlay = screen.getByTestId('landscape-overlay');
      expect(overlay).toHaveAttribute('aria-label', '가로 모드 감지');
    });

    it('닫기 버튼에 aria-label="닫기"가 적용된다', () => {
      render(<LandscapeOverlay {...defaultProps} />);
      const closeBtn = screen.getByTestId('landscape-overlay-close');
      expect(closeBtn).toHaveAttribute('aria-label', '닫기');
    });

    it('닫기 버튼의 클래스에 landscape-overlay__close-btn이 포함된다 (44x44px 보장)', () => {
      render(<LandscapeOverlay {...defaultProps} />);
      const closeBtn = screen.getByTestId('landscape-overlay-close');
      expect(closeBtn.className).toContain('landscape-overlay__close-btn');
    });
  });
});
