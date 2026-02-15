/**
 * SettingsModal Component Tests
 *
 * Story 8-5: 설정 메뉴 (Settings Menu)
 * AC3: 설정 모달 열기/닫기
 * AC4: 사운드 ON/OFF 토글
 * AC5: 설정 항목 확장 구조
 * AC6: 반응형 레이아웃
 * AC7: 접근성
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsModal } from '../src/components/settings/SettingsModal';
import { useSettingsStore } from '../src/stores/settingsStore';

describe('SettingsModal', () => {
  // 각 테스트 전 settingsStore 초기화
  beforeEach(() => {
    act(() => {
      useSettingsStore.setState({ soundEnabled: true });
    });
  });

  // 기본 렌더링
  describe('기본 렌더링', () => {
    it('isVisible=true일 때 모달이 렌더링된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
    });

    it('"설정" 타이틀이 표시된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByTestId('settings-modal-title')).toHaveTextContent('설정');
    });

    it('닫기 버튼이 표시된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByTestId('settings-modal-close')).toBeInTheDocument();
    });

    it('사운드 토글이 표시된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByTestId('settings-sound-toggle')).toBeInTheDocument();
    });

    it('사운드 라벨이 표시된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByText('사운드')).toBeInTheDocument();
    });
  });

  // isVisible=false 시 미렌더링
  describe('isVisible=false', () => {
    it('isVisible=false일 때 모달이 렌더링되지 않는다', () => {
      render(<SettingsModal isVisible={false} onClose={vi.fn()} />);
      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
    });
  });

  // 사운드 토글
  describe('사운드 토글', () => {
    it('초기 상태에서 사운드가 ON이다 (aria-checked=true)', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const toggle = screen.getByTestId('settings-sound-toggle');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('토글 클릭 시 사운드가 OFF로 전환된다 (aria-checked=false)', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const toggle = screen.getByTestId('settings-sound-toggle');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('토글 두 번 클릭 시 사운드가 다시 ON이 된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const toggle = screen.getByTestId('settings-sound-toggle');
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('ON 상태에서 "ON" 텍스트가 표시된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByText('ON')).toBeInTheDocument();
    });

    it('OFF 상태에서 "OFF" 텍스트가 표시된다', () => {
      act(() => {
        useSettingsStore.setState({ soundEnabled: false });
      });
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByText('OFF')).toBeInTheDocument();
    });

    it('ON 상태에서 on CSS 클래스가 적용된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const toggle = screen.getByTestId('settings-sound-toggle');
      expect(toggle.className).toContain('settings-modal__toggle--on');
    });

    it('OFF 상태에서 off CSS 클래스가 적용된다', () => {
      act(() => {
        useSettingsStore.setState({ soundEnabled: false });
      });
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const toggle = screen.getByTestId('settings-sound-toggle');
      expect(toggle.className).toContain('settings-modal__toggle--off');
    });
  });

  // 닫기 기능
  describe('닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
      const onClose = vi.fn();
      render(<SettingsModal isVisible={true} onClose={onClose} />);
      fireEvent.click(screen.getByTestId('settings-modal-close'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('오버레이(모달 외부) 클릭 시 onClose가 호출된다', () => {
      const onClose = vi.fn();
      render(<SettingsModal isVisible={true} onClose={onClose} />);
      fireEvent.click(screen.getByTestId('settings-modal-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('모달 내부 클릭 시 onClose가 호출되지 않는다', () => {
      const onClose = vi.fn();
      render(<SettingsModal isVisible={true} onClose={onClose} />);
      fireEvent.click(screen.getByTestId('settings-modal'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('ESC 키 누르면 onClose가 호출된다', () => {
      const onClose = vi.fn();
      render(<SettingsModal isVisible={true} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // 접근성
  describe('접근성', () => {
    it('모달에 role="dialog"가 적용된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const modal = screen.getByTestId('settings-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
    });

    it('모달에 aria-label="게임 설정"이 적용된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const modal = screen.getByTestId('settings-modal');
      expect(modal).toHaveAttribute('aria-label', '게임 설정');
    });

    it('모달에 aria-modal="true"가 적용된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const modal = screen.getByTestId('settings-modal');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('닫기 버튼에 aria-label="설정 닫기"가 적용된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const closeBtn = screen.getByTestId('settings-modal-close');
      expect(closeBtn).toHaveAttribute('aria-label', '설정 닫기');
    });

    it('사운드 토글에 role="switch"가 적용된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const toggle = screen.getByTestId('settings-sound-toggle');
      expect(toggle).toHaveAttribute('role', 'switch');
    });

    it('사운드 토글에 aria-label="사운드"가 적용된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const toggle = screen.getByTestId('settings-sound-toggle');
      expect(toggle).toHaveAttribute('aria-label', '사운드');
    });

    it('사운드 토글에 aria-checked가 적용된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      const toggle = screen.getByTestId('settings-sound-toggle');
      expect(toggle).toHaveAttribute('aria-checked');
    });
  });

  // Phase 2 안내 텍스트
  describe('Phase 2 안내', () => {
    it('"추가 설정은 업데이트 예정입니다" 텍스트가 표시된다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByText('추가 설정은 업데이트 예정입니다')).toBeInTheDocument();
    });

    it('푸터 영역이 존재한다', () => {
      render(<SettingsModal isVisible={true} onClose={vi.fn()} />);
      expect(screen.getByTestId('settings-modal-footer')).toBeInTheDocument();
    });
  });
});
