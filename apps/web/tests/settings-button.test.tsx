/**
 * SettingsButton Component Tests
 *
 * Story 8-5: 설정 메뉴 (Settings Menu)
 * AC1: 게임 HUD에 설정 버튼 표시
 * AC2: 메인 메뉴에 설정 버튼 표시
 * AC7: 접근성
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsButton } from '../src/components/settings/SettingsButton';

describe('SettingsButton', () => {
  // 기본 렌더링
  describe('기본 렌더링', () => {
    it('버튼이 렌더링된다', () => {
      render(<SettingsButton onClick={vi.fn()} />);
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    });

    it('기어 아이콘이 표시된다', () => {
      render(<SettingsButton onClick={vi.fn()} />);
      const button = screen.getByTestId('settings-button');
      // 기어 문자(&#x2699; = ⚙)가 포함되어야 함
      expect(button.textContent).toContain('\u2699');
    });

    it('기본 variant는 "game"이다', () => {
      render(<SettingsButton onClick={vi.fn()} />);
      const button = screen.getByTestId('settings-button');
      expect(button.className).toContain('settings-button--game');
    });
  });

  // variant prop
  describe('variant prop', () => {
    it('variant="game"일 때 game 스타일 클래스가 적용된다', () => {
      render(<SettingsButton onClick={vi.fn()} variant="game" />);
      const button = screen.getByTestId('settings-button');
      expect(button.className).toContain('settings-button--game');
    });

    it('variant="menu"일 때 menu 스타일 클래스가 적용된다', () => {
      render(<SettingsButton onClick={vi.fn()} variant="menu" />);
      const button = screen.getByTestId('settings-button');
      expect(button.className).toContain('settings-button--menu');
    });

    it('variant="menu"일 때 "설정" 라벨 텍스트가 표시된다', () => {
      render(<SettingsButton onClick={vi.fn()} variant="menu" />);
      expect(screen.getByText('설정')).toBeInTheDocument();
    });

    it('variant="game"일 때 라벨 텍스트가 표시되지 않는다', () => {
      render(<SettingsButton onClick={vi.fn()} variant="game" />);
      expect(screen.queryByText('설정')).not.toBeInTheDocument();
    });
  });

  // 클릭 콜백
  describe('클릭 콜백', () => {
    it('클릭 시 onClick 콜백이 호출된다', () => {
      const onClick = vi.fn();
      render(<SettingsButton onClick={onClick} />);
      fireEvent.click(screen.getByTestId('settings-button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // 접근성
  describe('접근성', () => {
    it('aria-label="설정"이 적용된다', () => {
      render(<SettingsButton onClick={vi.fn()} />);
      const button = screen.getByTestId('settings-button');
      expect(button).toHaveAttribute('aria-label', '설정');
    });

    it('type="button"이 적용된다', () => {
      render(<SettingsButton onClick={vi.fn()} />);
      const button = screen.getByTestId('settings-button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  // 터치 타겟 크기
  describe('터치 타겟 크기', () => {
    it('최소 44x44px CSS 클래스가 적용된다', () => {
      render(<SettingsButton onClick={vi.fn()} />);
      const button = screen.getByTestId('settings-button');
      // settings-button 클래스가 min-width/min-height: 44px을 가짐
      expect(button.className).toContain('settings-button');
    });
  });
});
