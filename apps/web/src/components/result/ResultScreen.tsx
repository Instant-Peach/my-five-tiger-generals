/**
 * ResultScreen Component
 *
 * Story 8-6: 결과 화면 (Result Screen)
 * 게임 종료 시 승리/패배 결과와 게임 통계를 표시하는 풀 스크린 오버레이
 *
 * AC1: 게임 종료 시 풀 스크린 결과 화면 (페이드인 0.5s ease-out)
 * AC2: 승리 플레이어 + 승리 사유 표시
 * AC3: 게임 통계 테이블 (총 턴 수, 노크 횟수, 남은 장수)
 * AC4: "다시 시작" 버튼 (44x44px 이상)
 * AC5: "메인 메뉴로" 버튼 (44x44px 이상)
 * AC6: 반응형 레이아웃 (모바일 전체 / 데스크톱 카드형 max-width: 500px)
 * AC7: 접근성 (role="dialog", aria-label, aria-modal, table 마크업)
 * AC8: VictoryBanner 완전 대체
 *
 * createPortal로 document.body에 렌더링 (z-index: 1000)
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { extractGameStats, RESULT_STATS_LABELS } from '@ftg/game-core';
import type { GameState } from '@ftg/game-core';
import './ResultScreen.css';

export interface ResultScreenProps {
  /** 결과 화면 표시 여부 */
  isVisible: boolean;
  /** 승리 플레이어 ID ('player1' | 'player2') */
  winner: string;
  /** 승리 사유 ('knock' | 'annihilation' | 'collapse' | 'surrender') */
  reason: string;
  /** 게임 종료 시점의 게임 상태 (통계 추출용) */
  gameState: GameState | null;
  /** 다시 시작 콜백 */
  onRestart: () => void;
  /** 메인 메뉴로 복귀 콜백 */
  onReturnToMenu?: () => void;
}

/**
 * 승리 사유에 따른 텍스트 반환
 * (VictoryBanner에서 이전)
 */
function getReasonText(reason: string): string {
  switch (reason) {
    case 'knock':
      return '노크 승리 (3회 달성)';
    case 'annihilation':
      return '전멸 승리';
    case 'collapse':
      return '와해 승리';
    case 'surrender':
      return '항복 승리';
    default:
      return '승리';
  }
}

/**
 * 승리 플레이어에 따른 텍스트 반환
 * (VictoryBanner에서 이전)
 */
function getWinnerText(winner: string): string {
  return winner === 'player1' ? 'Player 1 (촉) 승리' : 'Player 2 (위) 승리';
}

/**
 * 결과 화면 컴포넌트
 *
 * - 게임 종료 시 풀 스크린 오버레이로 표시
 * - 승리 정보 + 통계 테이블 + 다시 시작/메인 메뉴 버튼
 * - createPortal로 body에 렌더링 (z-index: 1000)
 */
export function ResultScreen({
  isVisible,
  winner,
  reason,
  gameState,
  onRestart,
  onReturnToMenu,
}: ResultScreenProps) {
  const restartButtonRef = useRef<HTMLButtonElement>(null);

  // AC7: 결과 화면 표시 시 "다시 시작" 버튼으로 포커스 이동
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        restartButtonRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const reasonText = getReasonText(reason);
  const winnerText = getWinnerText(winner);
  const stats = gameState ? extractGameStats(gameState) : null;

  const modalContent = (
    <div
      className="result-screen__overlay"
      data-testid="result-screen-overlay"
    >
      <div
        className="result-screen"
        role="dialog"
        aria-label="게임 결과"
        aria-modal="true"
        data-testid="result-screen"
      >
        {/* 승리 정보 섹션 */}
        <div className="result-screen__header">
          <h2 className="result-screen__title" data-testid="result-screen-title">
            게임 종료
          </h2>
          <p className="result-screen__winner" data-testid="result-screen-winner">
            {winnerText}
          </p>
          <p className="result-screen__reason" data-testid="result-screen-reason">
            {reasonText}
          </p>
        </div>

        {/* 구분선 */}
        <hr className="result-screen__divider" />

        {/* 게임 통계 섹션 */}
        {stats && (
          <div className="result-screen__stats" data-testid="result-screen-stats">
            <h3 className="result-screen__stats-title">게임 통계</h3>
            <table className="result-screen__table" data-testid="result-screen-table">
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Player 1</th>
                  <th scope="col">Player 2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{RESULT_STATS_LABELS.totalTurns}</td>
                  <td colSpan={2} className="result-screen__table-center">
                    {stats.totalTurns}
                  </td>
                </tr>
                <tr>
                  <td>노크 횟수</td>
                  <td>{stats.player1KnockCount}</td>
                  <td>{stats.player2KnockCount}</td>
                </tr>
                <tr>
                  <td>남은 장수</td>
                  <td>{stats.player1RemainingGenerals}</td>
                  <td>{stats.player2RemainingGenerals}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="result-screen__actions" data-testid="result-screen-actions">
          <button
            ref={restartButtonRef}
            className="result-screen__btn result-screen__btn--restart"
            onClick={onRestart}
            aria-label="다시 시작"
            type="button"
            data-testid="result-restart-button"
          >
            다시 시작
          </button>
          {onReturnToMenu && (
            <button
              className="result-screen__btn result-screen__btn--menu"
              onClick={onReturnToMenu}
              aria-label="메인 메뉴로 돌아가기"
              type="button"
              data-testid="result-menu-button"
            >
              메인 메뉴로
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
