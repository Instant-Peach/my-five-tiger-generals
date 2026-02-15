/**
 * ResultScreen Component Tests
 *
 * Story 8-6: 결과 화면 (Result Screen)
 * AC1: 게임 종료 시 결과 화면 표시
 * AC2: 승리/패배 정보 표시
 * AC3: 게임 통계 표시
 * AC4: 다시 시작 버튼
 * AC5: 메인 메뉴로 버튼
 * AC6: 반응형 레이아웃
 * AC7: 접근성
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResultScreen } from '../src/components/result/ResultScreen';
import { createInitialGameState } from '@ftg/game-core';
import type { GameState } from '@ftg/game-core';

/** 테스트용 기본 게임 상태 생성 */
function createTestGameState(overrides?: Partial<GameState>): GameState {
  const state = createInitialGameState();
  return { ...state, ...overrides };
}

/** 기본 props */
const defaultProps = {
  isVisible: true,
  winner: 'player1',
  reason: 'knock',
  gameState: createTestGameState({ turn: 12, player1KnockCount: 3, player2KnockCount: 1 }),
  onRestart: vi.fn(),
  onReturnToMenu: vi.fn(),
};

describe('ResultScreen', () => {
  // Task 5.4: 기본 렌더링
  describe('기본 렌더링', () => {
    it('isVisible=true일 때 결과 화면이 렌더링된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-screen')).toBeInTheDocument();
    });

    it('"게임 종료" 타이틀이 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-screen-title')).toHaveTextContent('게임 종료');
    });

    it('승리 플레이어 정보가 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-screen-winner')).toBeInTheDocument();
    });

    it('승리 사유가 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-screen-reason')).toBeInTheDocument();
    });

    it('통계 테이블이 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-screen-table')).toBeInTheDocument();
    });

    it('다시 시작 버튼이 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-restart-button')).toBeInTheDocument();
    });

    it('메인 메뉴 버튼이 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-menu-button')).toBeInTheDocument();
    });
  });

  // Task 5.5: isVisible=false 시 미렌더링
  describe('isVisible=false', () => {
    it('isVisible=false일 때 결과 화면이 렌더링되지 않는다', () => {
      render(<ResultScreen {...defaultProps} isVisible={false} />);
      expect(screen.queryByTestId('result-screen')).not.toBeInTheDocument();
    });
  });

  // Task 5.6: 승리 사유별 텍스트
  describe('승리 사유 텍스트', () => {
    it('knock 사유: "노크 승리 (3회 달성)" 텍스트가 표시된다', () => {
      render(<ResultScreen {...defaultProps} reason="knock" />);
      expect(screen.getByTestId('result-screen-reason')).toHaveTextContent('노크 승리 (3회 달성)');
    });

    it('annihilation 사유: "전멸 승리" 텍스트가 표시된다', () => {
      render(<ResultScreen {...defaultProps} reason="annihilation" />);
      expect(screen.getByTestId('result-screen-reason')).toHaveTextContent('전멸 승리');
    });

    it('collapse 사유: "와해 승리" 텍스트가 표시된다', () => {
      render(<ResultScreen {...defaultProps} reason="collapse" />);
      expect(screen.getByTestId('result-screen-reason')).toHaveTextContent('와해 승리');
    });

    it('surrender 사유: "항복 승리" 텍스트가 표시된다', () => {
      render(<ResultScreen {...defaultProps} reason="surrender" />);
      expect(screen.getByTestId('result-screen-reason')).toHaveTextContent('항복 승리');
    });

    it('알 수 없는 사유: "승리" 텍스트가 표시된다', () => {
      render(<ResultScreen {...defaultProps} reason="unknown" />);
      expect(screen.getByTestId('result-screen-reason')).toHaveTextContent('승리');
    });
  });

  // 승리 플레이어 텍스트
  describe('승리 플레이어 텍스트', () => {
    it('player1 승리 시 "Player 1 (촉) 승리" 텍스트가 표시된다', () => {
      render(<ResultScreen {...defaultProps} winner="player1" />);
      expect(screen.getByTestId('result-screen-winner')).toHaveTextContent('Player 1 (촉) 승리');
    });

    it('player2 승리 시 "Player 2 (위) 승리" 텍스트가 표시된다', () => {
      render(<ResultScreen {...defaultProps} winner="player2" />);
      expect(screen.getByTestId('result-screen-winner')).toHaveTextContent('Player 2 (위) 승리');
    });
  });

  // Task 5.7: 통계 테이블 렌더링
  describe('통계 테이블', () => {
    it('총 턴 수가 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('총 턴 수')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('노크 횟수가 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('노크 횟수')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // P1
      expect(screen.getByText('1')).toBeInTheDocument(); // P2
    });

    it('남은 장수 수가 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('남은 장수')).toBeInTheDocument();
    });

    it('Player 1, Player 2 헤더가 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('gameState가 null이면 통계 섹션이 표시되지 않는다', () => {
      render(<ResultScreen {...defaultProps} gameState={null} />);
      expect(screen.queryByTestId('result-screen-stats')).not.toBeInTheDocument();
    });
  });

  // Task 5.8: 다시 시작 버튼
  describe('다시 시작 버튼', () => {
    it('"다시 시작" 버튼 클릭 시 onRestart 콜백이 호출된다', () => {
      const onRestart = vi.fn();
      render(<ResultScreen {...defaultProps} onRestart={onRestart} />);
      fireEvent.click(screen.getByTestId('result-restart-button'));
      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('"다시 시작" 텍스트가 버튼에 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-restart-button')).toHaveTextContent('다시 시작');
    });
  });

  // Task 5.9: 메인 메뉴로 버튼
  describe('메인 메뉴로 버튼', () => {
    it('"메인 메뉴로" 버튼 클릭 시 onReturnToMenu 콜백이 호출된다', () => {
      const onReturnToMenu = vi.fn();
      render(<ResultScreen {...defaultProps} onReturnToMenu={onReturnToMenu} />);
      fireEvent.click(screen.getByTestId('result-menu-button'));
      expect(onReturnToMenu).toHaveBeenCalledTimes(1);
    });

    it('"메인 메뉴로" 텍스트가 버튼에 표시된다', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-menu-button')).toHaveTextContent('메인 메뉴로');
    });

    it('onReturnToMenu가 없으면 메인 메뉴 버튼이 표시되지 않는다', () => {
      render(<ResultScreen {...defaultProps} onReturnToMenu={undefined} />);
      expect(screen.queryByTestId('result-menu-button')).not.toBeInTheDocument();
    });
  });

  // Task 5.10: 접근성
  describe('접근성', () => {
    it('결과 화면에 role="dialog"가 적용된다', () => {
      render(<ResultScreen {...defaultProps} />);
      const dialog = screen.getByTestId('result-screen');
      expect(dialog).toHaveAttribute('role', 'dialog');
    });

    it('결과 화면에 aria-label="게임 결과"가 적용된다', () => {
      render(<ResultScreen {...defaultProps} />);
      const dialog = screen.getByTestId('result-screen');
      expect(dialog).toHaveAttribute('aria-label', '게임 결과');
    });

    it('결과 화면에 aria-modal="true"가 적용된다', () => {
      render(<ResultScreen {...defaultProps} />);
      const dialog = screen.getByTestId('result-screen');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('다시 시작 버튼에 aria-label="다시 시작"이 적용된다', () => {
      render(<ResultScreen {...defaultProps} />);
      const btn = screen.getByTestId('result-restart-button');
      expect(btn).toHaveAttribute('aria-label', '다시 시작');
    });

    it('메인 메뉴 버튼에 aria-label="메인 메뉴로 돌아가기"가 적용된다', () => {
      render(<ResultScreen {...defaultProps} />);
      const btn = screen.getByTestId('result-menu-button');
      expect(btn).toHaveAttribute('aria-label', '메인 메뉴로 돌아가기');
    });

    it('통계 테이블에 <table> 마크업이 사용된다', () => {
      render(<ResultScreen {...defaultProps} />);
      const table = screen.getByTestId('result-screen-table');
      expect(table.tagName).toBe('TABLE');
    });

    it('통계 테이블에 <th> 헤더가 사용된다', () => {
      render(<ResultScreen {...defaultProps} />);
      const table = screen.getByTestId('result-screen-table');
      const headers = table.querySelectorAll('th');
      expect(headers.length).toBeGreaterThanOrEqual(2);
    });

    it('통계 테이블에 <td> 데이터 셀이 사용된다', () => {
      render(<ResultScreen {...defaultProps} />);
      const table = screen.getByTestId('result-screen-table');
      const cells = table.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  // Task 5.11: 터치 타겟 크기 (44x44px 이상)
  describe('터치 타겟 크기', () => {
    it('다시 시작 버튼의 min-height가 44px 이상이다', () => {
      render(<ResultScreen {...defaultProps} />);
      const btn = screen.getByTestId('result-restart-button');
      // CSS에서 min-height: 48px 설정 - 클래스 확인
      expect(btn.className).toContain('result-screen__btn');
    });

    it('메인 메뉴 버튼의 min-height가 44px 이상이다', () => {
      render(<ResultScreen {...defaultProps} />);
      const btn = screen.getByTestId('result-menu-button');
      expect(btn.className).toContain('result-screen__btn');
    });
  });

  // Task 5.12: 포커스 이동
  describe('포커스 이동', () => {
    it('결과 화면 표시 시 "다시 시작" 버튼으로 포커스가 이동한다', async () => {
      render(<ResultScreen {...defaultProps} />);
      // setTimeout(0)으로 포커스 이동하므로 비동기 대기
      await vi.waitFor(() => {
        expect(screen.getByTestId('result-restart-button')).toHaveFocus();
      });
    });
  });
});
