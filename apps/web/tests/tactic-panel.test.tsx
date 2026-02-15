/**
 * TacticPanel Component Tests
 *
 * Story 8-4: 책략 선택 UI (Tactic Selection UI)
 * AC2: 책략 패널 열기/닫기
 * AC3: 책략 목록 표시 (Phase 1 플레이스홀더)
 * AC4: 책략 슬롯 상태 시각화
 * AC5: 책략 정보 미리보기
 * AC6: 반응형 레이아웃
 * AC7: 접근성
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TacticPanel } from '../src/components/game/TacticPanel';

describe('TacticPanel', () => {
  // AC2/AC3: 기본 렌더링
  describe('AC2/AC3: 기본 렌더링', () => {
    it('패널이 렌더링된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-panel')).toBeInTheDocument();
    });

    it('장수 이름이 표시된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-panel-general-name')).toHaveTextContent('관우');
    });

    it('"책략" 타이틀이 표시된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByText('책략')).toBeInTheDocument();
    });

    it('닫기 버튼이 표시된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-panel-close')).toBeInTheDocument();
    });

    it('책략 슬롯이 3개 렌더링된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-0')).toBeInTheDocument();
      expect(screen.getByTestId('tactic-slot-1')).toBeInTheDocument();
      expect(screen.getByTestId('tactic-slot-2')).toBeInTheDocument();
    });
  });

  // AC3: 책략 슬롯 정보 표시
  describe('AC3: 책략 슬롯 정보 표시', () => {
    it('첫 번째 슬롯에 현장 책략 1 이름이 표시된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-name-0')).toHaveTextContent('현장 책략 1');
    });

    it('두 번째 슬롯에 사무 책략 이름이 표시된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-name-1')).toHaveTextContent('사무 책략');
    });

    it('세 번째 슬롯에 현장 책략 2 이름이 표시된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-name-2')).toHaveTextContent('현장 책략 2');
    });

    it('각 슬롯에 "Phase 3에서 사용 가능" 안내 텍스트가 표시된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-status-0')).toHaveTextContent('Phase 3에서 사용 가능');
      expect(screen.getByTestId('tactic-slot-status-1')).toHaveTextContent('Phase 3에서 사용 가능');
      expect(screen.getByTestId('tactic-slot-status-2')).toHaveTextContent('Phase 3에서 사용 가능');
    });

    it('유형 라벨이 표시된다 (현장용/사무용)', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      const types = screen.getAllByText(/현장용|사무용/);
      expect(types.length).toBe(3);
    });
  });

  // AC2: 닫기 기능
  describe('AC2: 닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
      const onClose = vi.fn();
      render(<TacticPanel generalName="관우" onClose={onClose} />);
      fireEvent.click(screen.getByTestId('tactic-panel-close'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('오버레이(패널 외부) 클릭 시 onClose가 호출된다', () => {
      const onClose = vi.fn();
      render(<TacticPanel generalName="관우" onClose={onClose} />);
      fireEvent.click(screen.getByTestId('tactic-panel-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('ESC 키 누르면 onClose가 호출된다', () => {
      const onClose = vi.fn();
      render(<TacticPanel generalName="관우" onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // AC4: Phase 1 비활성 스타일
  describe('AC4: Phase 1 비활성 스타일', () => {
    it('모든 슬롯에 aria-disabled="true"가 적용된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-0')).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByTestId('tactic-slot-1')).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByTestId('tactic-slot-2')).toHaveAttribute('aria-disabled', 'true');
    });

    it('모든 슬롯에 coming-soon CSS 클래스가 적용된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-0').className).toContain('coming-soon');
      expect(screen.getByTestId('tactic-slot-1').className).toContain('coming-soon');
      expect(screen.getByTestId('tactic-slot-2').className).toContain('coming-soon');
    });
  });

  // AC7: 접근성
  describe('AC7: 접근성', () => {
    it('패널에 role="dialog"가 적용된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      const panel = screen.getByTestId('tactic-panel');
      expect(panel).toHaveAttribute('role', 'dialog');
    });

    it('패널에 aria-label="책략 선택"이 적용된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      const panel = screen.getByTestId('tactic-panel');
      expect(panel).toHaveAttribute('aria-label', '책략 선택');
    });

    it('패널에 aria-modal="true"가 적용된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      const panel = screen.getByTestId('tactic-panel');
      expect(panel).toHaveAttribute('aria-modal', 'true');
    });

    it('닫기 버튼에 aria-label="책략 패널 닫기"가 적용된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      const closeBtn = screen.getByTestId('tactic-panel-close');
      expect(closeBtn).toHaveAttribute('aria-label', '책략 패널 닫기');
    });

    it('각 슬롯에 role="button"이 적용된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-0')).toHaveAttribute('role', 'button');
      expect(screen.getByTestId('tactic-slot-1')).toHaveAttribute('role', 'button');
      expect(screen.getByTestId('tactic-slot-2')).toHaveAttribute('role', 'button');
    });

    it('각 슬롯에 책략 이름이 포함된 aria-label이 적용된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByTestId('tactic-slot-0')).toHaveAttribute('aria-label', '현장 책략 1 - 현장용');
      expect(screen.getByTestId('tactic-slot-1')).toHaveAttribute('aria-label', '사무 책략 - 사무용');
      expect(screen.getByTestId('tactic-slot-2')).toHaveAttribute('aria-label', '현장 책략 2 - 현장용');
    });
  });

  // Phase 1 안내
  describe('Phase 1 안내', () => {
    it('Phase 3 안내 푸터가 표시된다', () => {
      render(<TacticPanel generalName="관우" onClose={vi.fn()} />);
      expect(screen.getByText('책략 시스템은 Phase 3에서 활성화됩니다')).toBeInTheDocument();
    });
  });
});
