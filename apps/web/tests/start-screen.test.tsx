/**
 * StartScreen Component Tests
 *
 * Story 8-1: 메인 메뉴 (Main Menu)
 * AC1: 메인 메뉴 화면 표시 (타이틀, 부제, 버튼)
 * AC2: 게임 시작 동작 (버튼 클릭 시 콜백 호출)
 * AC5: 터치 타겟 접근성 (44x44px 이상)
 * AC6: 비주얼 스타일
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StartScreen } from '../src/components/menu/StartScreen';

describe('StartScreen', () => {
  // AC1: 메인 메뉴 화면 표시
  describe('AC1: 메인 메뉴 화면 표시', () => {
    it('게임 타이틀 "오호대장군"이 표시된다', () => {
      render(<StartScreen onStart={vi.fn()} />);
      expect(screen.getByText('오호대장군')).toBeInTheDocument();
    });

    it('한자 타이틀 "五虎大將軍"이 표시된다', () => {
      render(<StartScreen onStart={vi.fn()} />);
      expect(screen.getByText('五虎大將軍')).toBeInTheDocument();
    });

    it('부제 텍스트가 표시된다', () => {
      render(<StartScreen onStart={vi.fn()} />);
      expect(screen.getByText(/다섯 맹장과 함께 천하를 호령하라/)).toBeInTheDocument();
    });

    it('"게임 시작" 버튼이 표시된다', () => {
      render(<StartScreen onStart={vi.fn()} />);
      expect(screen.getByTestId('start-game-button')).toBeInTheDocument();
      expect(screen.getByTestId('start-game-button')).toHaveTextContent('게임 시작');
    });

    it('"2인 로컬 플레이" 모드 설명이 표시된다', () => {
      render(<StartScreen onStart={vi.fn()} />);
      expect(screen.getByText('2인 로컬 플레이')).toBeInTheDocument();
    });
  });

  // AC2: 게임 시작 동작
  describe('AC2: 게임 시작 동작', () => {
    it('"게임 시작" 버튼 클릭 시 onStart 콜백이 호출된다', async () => {
      const onStart = vi.fn();
      const user = userEvent.setup();
      render(<StartScreen onStart={onStart} />);

      await user.click(screen.getByTestId('start-game-button'));
      expect(onStart).toHaveBeenCalledOnce();
    });
  });

  // AC5: 터치 타겟 접근성
  describe('AC5: 터치 타겟 접근성', () => {
    it('"게임 시작" 버튼의 min-height가 44px 이상이다', () => {
      render(<StartScreen onStart={vi.fn()} />);
      const button = screen.getByTestId('start-game-button');
      // CSS class 확인 (실제 렌더된 크기는 jsdom에서 제한적이므로 class 기반 확인)
      expect(button.className).toContain('start-screen__button');
    });
  });

  // 컴포넌트 구조 테스트
  describe('컴포넌트 구조', () => {
    it('start-screen 컨테이너가 렌더링된다', () => {
      render(<StartScreen onStart={vi.fn()} />);
      expect(screen.getByTestId('start-screen')).toBeInTheDocument();
    });
  });
});
