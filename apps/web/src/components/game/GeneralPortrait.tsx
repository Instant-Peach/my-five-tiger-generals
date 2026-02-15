/**
 * GeneralPortrait Component
 *
 * 삼국지 영걸전 스타일 장수 초상화 컴포넌트입니다.
 * 사이드패널 내 장수 목록에서 각 장수를 표시합니다.
 */

import type { General } from '@ftg/game-core';
import { getPlayerColor, getMaxTroops, getTroopRatio, TROOP_COLORS, getTroopStatus } from '@ftg/game-core';
import './GeneralPortrait.css';

export interface GeneralPortraitProps {
  general: General;
  isSelected: boolean;
  onSelect: (generalId: string) => void;
}

export function GeneralPortrait({ general, isSelected, onSelect }: GeneralPortraitProps) {
  const isOut = general.status === 'out';
  const isEliminated = general.status === 'eliminated';
  const isEngaged = general.status === 'engaged';
  const playerColor = getPlayerColor(general.owner);
  const maxTroops = getMaxTroops(general.stats.star);
  const ratio = getTroopRatio(general.troops, maxTroops);
  const troopStatus = getTroopStatus(general.troops, maxTroops);
  const colors = TROOP_COLORS[troopStatus];

  const className = [
    'general-portrait',
    isSelected && 'general-portrait--selected',
    isOut && 'general-portrait--out',
    isEliminated && 'general-portrait--eliminated',
    isEngaged && 'general-portrait--engaged',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={className}
      onClick={() => onSelect(general.id)}
      style={{ borderTopColor: playerColor.primary }}
      aria-label={`${general.nameKo} - ${isEliminated ? '퇴장' : isOut ? 'OUT' : isEngaged ? '교전 중' : `병력 ${Math.round(ratio * 100)}%`}`}
      data-testid={`general-portrait-${general.id}`}
      disabled={isEliminated}
      type="button"
    >
      <span className="general-portrait__name">{general.nameKo}</span>
      <div className="general-portrait__right">
        {/* 병력 미니 바 */}
        {!isOut && !isEliminated && (
          <div className="general-portrait__troop-mini">
            <div
              className="general-portrait__troop-mini-fill"
              style={{ width: `${Math.round(ratio * 100)}%`, backgroundColor: colors.primary }}
            />
          </div>
        )}
        {/* 목숨 도트 */}
        <span className="general-portrait__lives">
          {Array.from({ length: 2 }, (_, i) => (
            <span
              key={i}
              className={`general-portrait__life-dot ${i < general.livesRemaining ? 'general-portrait__life-dot--filled' : ''}`}
            />
          ))}
        </span>
      </div>
      {/* OUT/ELIMINATED 오버레이 */}
      {(isOut || isEliminated) && (
        <span className="general-portrait__overlay">{isEliminated ? '✕' : 'OUT'}</span>
      )}
      {/* 교전 배지 */}
      {isEngaged && (
        <span className="general-portrait__engaged-badge" aria-label="교전 중">⚔</span>
      )}
    </button>
  );
}
