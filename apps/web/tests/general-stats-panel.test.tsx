/**
 * GeneralStatsPanel Component Tests
 *
 * Story 8-3: 장수 정보 패널 (General Info Panel)
 * AC1: 장수 기본 정보 표시 (이름, 소속 플레이어)
 * AC2: 스탯 표시 (별/해/달/발)
 * AC3: 현재 병력 표시 (TroopBar)
 * AC4: 장수 상태 표시 (OUT 배지)
 * AC5: 패널 위치 및 레이아웃
 * AC8: 접근성
 */

import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeneralStatsPanel } from '../src/components/game/GeneralStatsPanel';
import type { General } from '@ftg/game-core';

// 테스트용 장수 데이터 (star=5 → maxTroops=10)
const createMockGeneral = (overrides: Partial<General> = {}): General => ({
  id: 'player1_guanyu',
  baseId: 'guanyu',
  name: 'Guan Yu',
  nameKo: '관우',
  owner: 'player1',
  stats: { star: 5, sun: 4, moon: 3, speed: 2 },
  troops: 5,
  position: 'T0',
  status: 'active',
  ...overrides,
});

describe('GeneralStatsPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // AC1: 장수 기본 정보 표시
  describe('AC1: 장수 기본 정보 표시', () => {
    it('장수 이름(nameKo)이 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      expect(screen.getByTestId('general-name')).toHaveTextContent('관우');
    });

    it('Player 1 소속이 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ owner: 'player1' })} />);
      expect(screen.getByTestId('player-label')).toHaveTextContent('Player 1');
    });

    it('Player 2 소속이 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ owner: 'player2' })} />);
      expect(screen.getByTestId('player-label')).toHaveTextContent('Player 2');
    });
  });

  // AC2: 스탯 표시
  describe('AC2: 스탯 표시', () => {
    it('별(star) 스탯이 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const starStat = screen.getByLabelText('별 5');
      expect(starStat).toBeInTheDocument();
    });

    it('해(sun) 스탯이 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const sunStat = screen.getByLabelText('해 4');
      expect(sunStat).toBeInTheDocument();
    });

    it('달(moon) 스탯이 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const moonStat = screen.getByLabelText('달 3');
      expect(moonStat).toBeInTheDocument();
    });

    it('이동력(speed) 스탯이 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const speedStat = screen.getByLabelText('이동력 2');
      expect(speedStat).toBeInTheDocument();
    });
  });

  // AC3: 현재 병력 표시 (star=5 → maxTroops=10)
  describe('AC3: 현재 병력 표시', () => {
    it('현재 병력 / 최대 병력이 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ troops: 3 })} />);
      const troopsValue = screen.getByLabelText('병력 3 중 10');
      expect(troopsValue).toBeInTheDocument();
    });

    it('TroopBar가 올바른 aria 속성을 가진다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ troops: 3 })} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '3');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '10');
    });

    it('병력 비율이 퍼센트로 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ troops: 3 })} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', '병력 3/10 (30%)');
    });
  });

  // AC3: 병력 변화 애니메이션
  describe('AC3: 병력 변화 애니메이션', () => {
    it('병력 감소 시 빨간색 플래시 클래스가 적용된다', () => {
      const general = createMockGeneral({ troops: 5 });
      const { rerender } = render(<GeneralStatsPanel general={general} />);

      // 병력 감소: 5 -> 3
      rerender(<GeneralStatsPanel general={createMockGeneral({ troops: 3 })} />);

      const troopsCell = screen.getByTestId('troops-cell');
      expect(troopsCell.className).toContain('troops-flash-red');
    });

    it('병력 증가 시 초록색 플래시 클래스가 적용된다', () => {
      const general = createMockGeneral({ troops: 3 });
      const { rerender } = render(<GeneralStatsPanel general={general} />);

      // 병력 증가: 3 -> 5
      rerender(<GeneralStatsPanel general={createMockGeneral({ troops: 5 })} />);

      const troopsCell = screen.getByTestId('troops-cell');
      expect(troopsCell.className).toContain('troops-flash-green');
    });

    it('500ms 후 플래시가 사라진다', () => {
      const general = createMockGeneral({ troops: 5 });
      const { rerender } = render(<GeneralStatsPanel general={general} />);

      // 병력 감소
      rerender(<GeneralStatsPanel general={createMockGeneral({ troops: 3 })} />);

      // 플래시 확인
      expect(screen.getByTestId('troops-cell').className).toContain('troops-flash-red');

      // 500ms 경과
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByTestId('troops-cell').className).not.toContain('troops-flash-red');
    });
  });

  // AC4: 장수 상태 표시 (OUT)
  describe('AC4: 장수 상태 표시', () => {
    it('OUT 상태일 때 OUT 배지가 표시된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ status: 'out', troops: 0 })} />);
      expect(screen.getByTestId('out-badge')).toBeInTheDocument();
      expect(screen.getByTestId('out-badge')).toHaveTextContent('OUT');
    });

    it('active 상태일 때 OUT 배지가 표시되지 않는다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ status: 'active' })} />);
      expect(screen.queryByTestId('out-badge')).not.toBeInTheDocument();
    });

    it('OUT 배지에 role="status"가 적용된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ status: 'out', troops: 0 })} />);
      const badge = screen.getByTestId('out-badge');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('OUT 배지에 aria-label="장수 퇴장 상태"가 적용된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ status: 'out', troops: 0 })} />);
      const badge = screen.getByTestId('out-badge');
      expect(badge).toHaveAttribute('aria-label', '장수 퇴장 상태');
    });
  });

  // AC8: 접근성
  describe('AC8: 접근성', () => {
    it('패널에 role="complementary"가 적용된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const panel = screen.getByTestId('general-stats-panel');
      expect(panel).toHaveAttribute('role', 'complementary');
    });

    it('패널에 aria-label="장수 정보 패널"이 적용된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const panel = screen.getByTestId('general-stats-panel');
      expect(panel).toHaveAttribute('aria-label', '장수 정보 패널');
    });

    it('병력 바에 role="progressbar"가 적용된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('병력 바에 aria-valuenow, aria-valuemin, aria-valuemax가 적용된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral({ troops: 4 })} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '4');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '10');
    });

    it('스탯에 적절한 aria-label이 있다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      expect(screen.getByLabelText('별 5')).toBeInTheDocument();
      expect(screen.getByLabelText('해 4')).toBeInTheDocument();
      expect(screen.getByLabelText('달 3')).toBeInTheDocument();
      expect(screen.getByLabelText('이동력 2')).toBeInTheDocument();
    });
  });

  // 장수 미선택 시 패널 미렌더링
  describe('패널 렌더링 조건', () => {
    it('general이 null이면 패널이 렌더링되지 않는다', () => {
      render(<GeneralStatsPanel general={null} />);
      expect(screen.queryByTestId('general-stats-panel')).not.toBeInTheDocument();
    });
  });

  // AC5: CSS 클래스 적용
  describe('AC5: 레이아웃', () => {
    it('general-stats-panel CSS 클래스가 적용된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const panel = screen.getByTestId('general-stats-panel');
      expect(panel.className).toContain('general-stats-panel');
    });

    it('스탯 그리드 CSS 클래스가 적용된다', () => {
      render(<GeneralStatsPanel general={createMockGeneral()} />);
      const panel = screen.getByTestId('general-stats-panel');
      const grid = panel.querySelector('.general-stats-panel__stats-grid');
      expect(grid).toBeInTheDocument();
    });
  });
});
