/**
 * SidePanel Component
 *
 * 삼국지 영걸전 스타일 우측 사이드바 패널입니다.
 * P2 요약 → P2 장수 5명 → 선택 장수 상세 → P1 장수 5명 → P1 요약
 *
 * 데스크톱/태블릿에서만 표시되며, 모바일에서는 GameHUD에서 숨깁니다.
 */

import type { General } from '@ftg/game-core';
import { GeneralPortrait } from './GeneralPortrait';
import { GeneralStatsPanel } from './GeneralStatsPanel';
import './SidePanel.css';

export interface SidePanelProps {
  /** 현재 플레이어 */
  currentPlayer: 'player1' | 'player2';
  /** Player 1 노크 카운트 */
  player1KnockCount: number;
  /** Player 2 노크 카운트 */
  player2KnockCount: number;
  /** 최대 노크 카운트 (기본값: 3) */
  maxKnockCount?: number;
  /** 선택된 장수 정보 (null이면 빈 영역) */
  selectedGeneral: General | null;
  /** 전체 장수 목록 (양쪽 플레이어) */
  generals: General[];
  /** 선택된 장수 ID */
  selectedGeneralId: string | null;
  /** 장수 초상화 클릭 핸들러 */
  onGeneralPortraitClick?: (generalId: string) => void;
}

/**
 * 노크 도트 표시
 */
function KnockDots({ count, maxCount }: { count: number; maxCount: number }) {
  return (
    <span className="side-panel__knock-dots">
      {Array.from({ length: maxCount }, (_, i) => (
        <span
          key={i}
          className={`side-panel__knock-dot ${i < count ? 'side-panel__knock-dot--filled' : ''}`}
        />
      ))}
    </span>
  );
}

/**
 * 플레이어 요약 카드
 */
function PlayerSummary({
  playerId,
  knockCount,
  maxKnockCount,
  isActive,
}: {
  playerId: 'player1' | 'player2';
  knockCount: number;
  maxKnockCount: number;
  isActive: boolean;
}) {
  const isP1 = playerId === 'player1';
  const label = isP1 ? 'Player 1' : 'Player 2';
  const icon = isP1 ? '\u25B2' : '\u25BC';

  return (
    <div
      className={`side-panel__player-card ${
        isP1 ? 'side-panel__player-card--p1' : 'side-panel__player-card--p2'
      } ${isActive ? 'side-panel__player-card--active' : ''}`}
      data-testid={`side-panel-${playerId}`}
    >
      <div className="side-panel__player-header">
        <span className="side-panel__player-icon" aria-hidden="true">{icon}</span>
        <span className="side-panel__player-name">{label}</span>
      </div>
      <KnockDots count={knockCount} maxCount={maxKnockCount} />
    </div>
  );
}

/**
 * 장수 목록 (5명)
 */
function GeneralList({
  generals,
  selectedGeneralId,
  onSelect,
}: {
  generals: General[];
  selectedGeneralId: string | null;
  onSelect?: (generalId: string) => void;
}) {
  return (
    <div className="side-panel__general-list">
      {generals.map((general) => (
        <GeneralPortrait
          key={general.id}
          general={general}
          isSelected={selectedGeneralId === general.id}
          onSelect={onSelect ?? (() => {})}
        />
      ))}
    </div>
  );
}

/**
 * SidePanel 메인 컴포넌트
 */
export function SidePanel({
  currentPlayer,
  player1KnockCount,
  player2KnockCount,
  maxKnockCount = 3,
  selectedGeneral,
  generals,
  selectedGeneralId,
  onGeneralPortraitClick,
}: SidePanelProps) {
  const p1Generals = generals.filter((g) => g.owner === 'player1');
  const p2Generals = generals.filter((g) => g.owner === 'player2');

  // 교전 상대 장수 이름 조회
  const engagedWithName = selectedGeneral?.engagedWith
    ? generals.find(g => g.id === selectedGeneral.engagedWith)?.nameKo
    : undefined;

  return (
    <div className="side-panel" data-testid="side-panel">
      {/* P2 요약 (상단: 상대편) */}
      <PlayerSummary
        playerId="player2"
        knockCount={player2KnockCount}
        maxKnockCount={maxKnockCount}
        isActive={currentPlayer === 'player2'}
      />

      {/* P2 장수 목록 */}
      <GeneralList
        generals={p2Generals}
        selectedGeneralId={selectedGeneralId}
        onSelect={onGeneralPortraitClick}
      />

      {/* 선택 장수 상세 정보 */}
      <div className="side-panel__general-slot">
        {selectedGeneral ? (
          <GeneralStatsPanel
            general={selectedGeneral}
            engagedWithName={engagedWithName}
          />
        ) : (
          <div className="side-panel__general-empty">
            <span className="side-panel__general-empty-text">장수를 선택하세요</span>
          </div>
        )}
      </div>

      {/* P1 장수 목록 */}
      <GeneralList
        generals={p1Generals}
        selectedGeneralId={selectedGeneralId}
        onSelect={onGeneralPortraitClick}
      />

      {/* P1 요약 (하단: 내 쪽) */}
      <PlayerSummary
        playerId="player1"
        knockCount={player1KnockCount}
        maxKnockCount={maxKnockCount}
        isActive={currentPlayer === 'player1'}
      />
    </div>
  );
}
