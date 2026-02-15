/**
 * MobileGeneralDrawer Component
 *
 * 모바일 전용 장수 정보 하단 드로어입니다.
 * 장수 선택 시 하단에서 슬라이드업으로 나타납니다.
 * 데스크톱/태블릿에서는 SidePanel 내부에 인라인으로 표시되므로 이 컴포넌트는 사용되지 않습니다.
 */

import { useEffect } from 'react';
import type { General } from '@ftg/game-core';
import { getPlayerColor, getMaxTroops, getTroopStatus, getTroopRatio, TROOP_COLORS } from '@ftg/game-core';
import './MobileGeneralDrawer.css';

export interface MobileGeneralDrawerProps {
  /** 표시할 장수 (null이면 닫힘) */
  general: General | null;
  /** 닫기 핸들러 */
  onClose: () => void;
}

export function MobileGeneralDrawer({ general, onClose }: MobileGeneralDrawerProps) {
  // ESC로 닫기
  useEffect(() => {
    if (!general) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [general, onClose]);

  if (!general) return null;

  const playerColorInfo = getPlayerColor(general.owner);
  const maxTroops = getMaxTroops(general.stats.star);
  const troopStatus = getTroopStatus(general.troops, maxTroops);
  const ratio = getTroopRatio(general.troops, maxTroops);
  const percentage = Math.round(ratio * 100);
  const colors = TROOP_COLORS[troopStatus];
  const isOut = general.status === 'out';

  return (
    <div className="mobile-general-drawer" data-testid="mobile-general-drawer">
      {/* 백드롭 */}
      <div className="mobile-general-drawer__backdrop" onClick={onClose} />

      {/* 드로어 본체 */}
      <div
        className="mobile-general-drawer__content"
        style={{ borderTopColor: playerColorInfo.primary }}
        role="complementary"
        aria-label="장수 정보"
      >
        {/* 드래그 핸들 */}
        <div className="mobile-general-drawer__handle" aria-hidden="true">
          <div className="mobile-general-drawer__handle-bar" />
        </div>

        {/* 헤더 */}
        <div className="mobile-general-drawer__header">
          <div className="mobile-general-drawer__name-row">
            <span
              className="mobile-general-drawer__portrait"
              style={{ backgroundColor: playerColorInfo.primary }}
              aria-hidden="true"
            >
              🎭
            </span>
            <div>
              <h3 className="mobile-general-drawer__name">{general.nameKo}</h3>
              <span
                className="mobile-general-drawer__player-label"
                style={{ color: playerColorInfo.primary }}
              >
                {general.owner === 'player1' ? 'Player 1' : 'Player 2'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mobile-general-drawer__close"
            aria-label="닫기"
            type="button"
          >
            ✕
          </button>
        </div>

        {isOut && (
          <div className="mobile-general-drawer__out-badge">OUT</div>
        )}

        {/* 스탯 */}
        <div className="mobile-general-drawer__stats">
          <div className="mobile-general-drawer__stat">
            <span>⭐</span><span>{general.stats.star}</span>
          </div>
          <div className="mobile-general-drawer__stat">
            <span>☀️</span><span>{general.stats.sun}</span>
          </div>
          <div className="mobile-general-drawer__stat">
            <span>🌙</span><span>{general.stats.moon}</span>
          </div>
          <div className="mobile-general-drawer__stat">
            <span>👣</span><span>{general.stats.speed}</span>
          </div>
        </div>

        {/* 병력 바 */}
        <div className="mobile-general-drawer__troop-bar">
          <div className="mobile-general-drawer__troop-info">
            <span>병력 {general.troops}/{maxTroops}</span>
            <span style={{ color: colors.primary }}>{percentage}%</span>
          </div>
          <div className="mobile-general-drawer__troop-track">
            <div
              className="mobile-general-drawer__troop-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: colors.primary,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
