/**
 * 장수 스탯 표시 패널 컴포넌트
 *
 * 선택된 장수의 스탯 정보(별/병력/해/달/발)를 표시합니다.
 * Story 2-3: 장수 스탯 표시
 * Story 2-4: 플레이어 색상 구분 추가
 * Story 2-5: 병력 시각적 표시 (TroopBar 추가)
 * Story 8-3: 반응형 CSS 분리, 닫기 버튼 필수 통합, 접근성 강화
 */

import { useEffect, useState, useRef } from 'react';
import type { General, TroopStatus } from '@ftg/game-core';
import { getPlayerColor, getMaxTroops, getTroopStatus, getTroopRatio, TROOP_COLORS } from '@ftg/game-core';
import './GeneralStatsPanel.css';

export interface GeneralStatsPanelProps {
  /** 표시할 장수 정보 (null이면 패널 숨김) */
  general: General | null;
  /** 교전 상대 장수 이름 (교전 중일 때만 전달) */
  engagedWithName?: string;
}

/**
 * TroopBar Props
 */
interface TroopBarProps {
  troops: number;
  maxTroops: number;
  status: TroopStatus;
}

/**
 * 병력 바 컴포넌트
 *
 * 현재 병력을 Progress Bar 형태로 시각화합니다.
 * 접근성을 위한 aria 속성 포함.
 */
function TroopBar({ troops, maxTroops, status }: TroopBarProps) {
  const ratio = getTroopRatio(troops, maxTroops);
  const colors = TROOP_COLORS[status];
  const percentage = Math.round(ratio * 100);

  return (
    <div className="general-stats-panel__troop-bar">
      <div className="general-stats-panel__troop-bar-header">
        <span className="general-stats-panel__troop-bar-label">병력 게이지</span>
        <span className="general-stats-panel__troop-bar-percentage">
          <span style={{ color: colors.primary }}>{colors.icon}</span>
          {percentage}%
        </span>
      </div>
      <div
        className="general-stats-panel__troop-bar-track"
        role="progressbar"
        aria-valuenow={troops}
        aria-valuemin={0}
        aria-valuemax={maxTroops}
        aria-label={`병력 ${troops}/${maxTroops} (${percentage}%)`}
      >
        <div
          className="general-stats-panel__troop-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: colors.primary,
          }}
        />
      </div>
    </div>
  );
}

/**
 * 장수 스탯 패널
 *
 * @param general - 표시할 장수 정보
 * @param onClose - 닫기 버튼 클릭 핸들러
 */
export function GeneralStatsPanel({
  general,
  engagedWithName,
}: GeneralStatsPanelProps) {
  // 병력 변화 애니메이션 (hooks는 early return 이전에 호출)
  const [flashColor, setFlashColor] = useState<'red' | 'green' | null>(null);
  const prevTroopsRef = useRef(general?.troops ?? 0);
  const prevGeneralIdRef = useRef(general?.id ?? '');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!general) return;

    const currentTroops = general.troops;
    const prevTroops = prevTroopsRef.current;

    // 이전 타이머 클리어 (빠른 연속 변화 대응)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 장수가 변경된 경우: 플래시 없이 ref만 업데이트
    if (prevGeneralIdRef.current !== general.id) {
      prevGeneralIdRef.current = general.id;
      prevTroopsRef.current = currentTroops;
      setFlashColor(null);
      return;
    }

    // 같은 장수의 병력 변화 감지
    if (currentTroops < prevTroops) {
      // 병력 감소 → 빨간색 깜빡임
      setFlashColor('red');
      timerRef.current = window.setTimeout(() => {
        setFlashColor(null);
        timerRef.current = null;
      }, 500);
      prevTroopsRef.current = currentTroops;
    } else if (currentTroops > prevTroops) {
      // 병력 증가 → 초록색 깜빡임
      setFlashColor('green');
      timerRef.current = window.setTimeout(() => {
        setFlashColor(null);
        timerRef.current = null;
      }, 500);
      prevTroopsRef.current = currentTroops;
    } else {
      // 병력이 같으면 ref만 업데이트
      prevTroopsRef.current = currentTroops;
    }

    // 클린업: 컴포넌트 언마운트 또는 effect 재실행 시 타이머 정리
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [general?.id, general?.troops]);

  // 장수가 없으면 렌더링하지 않음
  if (!general) return null;

  const isOut = general.status === 'out';

  // 플레이어 색상 (game-core 사용)
  const playerColorInfo = getPlayerColor(general.owner);

  // 병력 상태 (game-core 사용)
  const maxTroops = getMaxTroops(general.stats.star);
  const troopStatus = getTroopStatus(general.troops, maxTroops);

  // 병력 표시 CSS 클래스 (애니메이션)
  const troopsStatClass = [
    'general-stats-panel__stat',
    'general-stats-panel__stat--troops',
    flashColor === 'red' ? 'general-stats-panel__stat--troops-flash-red' : '',
    flashColor === 'green' ? 'general-stats-panel__stat--troops-flash-green' : '',
    !flashColor && general.troops === 0 ? 'general-stats-panel__stat--troops-zero' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className="general-stats-panel"
      style={{
        borderTop: `4px solid ${playerColorInfo.primary}`,
      }}
      role="complementary"
      aria-label="장수 정보 패널"
      data-testid="general-stats-panel"
    >
      {/* 헤더 */}
      <div className="general-stats-panel__header">
        <div className="general-stats-panel__header-left">
          {/* 장수 초상화 + 색상 인디케이터 */}
          <div
            className="general-stats-panel__portrait"
            style={{ backgroundColor: playerColorInfo.primary }}
            aria-label={`${general.owner === 'player1' ? 'Player 1' : 'Player 2'} 장수`}
          >
            <span className="general-stats-panel__portrait-emoji" aria-hidden="true">
              🎭
            </span>
          </div>

          {/* 장수 이름 + 플레이어 정보 */}
          <div>
            <h3 className="general-stats-panel__name" data-testid="general-name">
              {general.nameKo}
            </h3>
            <div className="general-stats-panel__player-info">
              {/* 플레이어 아이콘 (색맹 지원) */}
              <span className="general-stats-panel__player-icon" aria-hidden="true">
                {playerColorInfo.icon === 'shield' ? '🛡️' : '⚔️'}
              </span>
              {/* 플레이어 텍스트 (색상 적용) */}
              <span
                className="general-stats-panel__player-label"
                style={{ color: playerColorInfo.primary }}
                data-testid="player-label"
              >
                {general.owner === 'player1' ? 'Player 1' : 'Player 2'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* OUT 상태 표시 */}
      {isOut && (
        <div
          className="general-stats-panel__out-badge"
          role="status"
          aria-label="장수 퇴장 상태"
          data-testid="out-badge"
        >
          OUT
        </div>
      )}

      {/* 교전 상태 표시 */}
      {general.status === 'engaged' && (
        <div className="general-stats-panel__engaged-badge" role="status" aria-label="교전 중" data-testid="engaged-badge">
          <span className="general-stats-panel__engaged-icon">⚔️</span>
          <span className="general-stats-panel__engaged-text">
            교전 중{engagedWithName ? ` - ${engagedWithName}` : ''}
          </span>
        </div>
      )}

      {/* 목숨 표시 */}
      <div className="general-stats-panel__lives" data-testid="lives-display">
        <span className="general-stats-panel__lives-label">목숨</span>
        <span className="general-stats-panel__lives-dots">
          {Array.from({ length: 2 }, (_, i) => (
            <span
              key={i}
              className={`general-stats-panel__life-dot ${i < general.livesRemaining ? 'general-stats-panel__life-dot--filled' : ''}`}
            />
          ))}
        </span>
      </div>

      {/* 스탯 그리드 */}
      <div className="general-stats-panel__stats-grid">
        {/* 별 (최대 병력) */}
        <div className="general-stats-panel__stat">
          <div className="general-stats-panel__stat-label">별</div>
          <div className="general-stats-panel__stat-value" aria-label={`별 ${general.stats.star}`}>
            ⭐ {general.stats.star}
          </div>
        </div>

        {/* 병력 (현재/최대) */}
        <div className={troopsStatClass} data-testid="troops-cell">
          <div className="general-stats-panel__stat-label">병력</div>
          <div className="general-stats-panel__stat-value" aria-label={`병력 ${general.troops} 중 ${maxTroops}`}>
            {general.troops} / {maxTroops}
          </div>
        </div>

        {/* 해 (Sun) */}
        <div className="general-stats-panel__stat">
          <div className="general-stats-panel__stat-label">해</div>
          <div className="general-stats-panel__stat-value" aria-label={`해 ${general.stats.sun}`}>
            ☀️ {general.stats.sun}
          </div>
        </div>

        {/* 달 (Moon) */}
        <div className="general-stats-panel__stat">
          <div className="general-stats-panel__stat-label">달</div>
          <div className="general-stats-panel__stat-value" aria-label={`달 ${general.stats.moon}`}>
            🌙 {general.stats.moon}
          </div>
        </div>

        {/* 발 (이동력) - 전체 너비 */}
        <div className="general-stats-panel__stat general-stats-panel__stat--full-width">
          <div className="general-stats-panel__stat-label">이동력</div>
          <div className="general-stats-panel__stat-value" aria-label={`이동력 ${general.stats.speed}`}>
            👣 {general.stats.speed}
          </div>
        </div>
      </div>

      {/* 병력 바 (Progress Bar) */}
      <TroopBar
        troops={general.troops}
        maxTroops={maxTroops}
        status={troopStatus}
      />
    </div>
  );
}
