/**
 * GameHUD Component
 *
 * 게임 HUD(Heads-Up Display) 컨테이너입니다.
 * 삼국지 영걸전 스타일: 우측 사이드바 + 하단 액션바 레이아웃
 *
 * 데스크톱/태블릿: 우측 사이드바(정보) + 하단 바(액션 버튼)
 * 모바일: 사이드바 없음, 하단 정보바 + 하단 액션바
 */

import type { ReactNode } from 'react';
import './game-variables.css';
import './GameHUD.css';

export interface GameHUDProps {
  /** 우측 사이드바 컨텐츠 (P1정보 / 장수정보 / P2정보 / 턴상태) */
  sidebarContent?: ReactNode;
  /** 하단 액션바 컨텐츠 (노크/책략/설정/항복/턴종료) */
  bottomBarContent?: ReactNode;
  /** 모바일 전용: 축약 정보바 컨텐츠 */
  mobileInfoContent?: ReactNode;
}

/**
 * 게임 HUD 컨테이너 컴포넌트
 *
 * 삼국지 영걸전 스타일 레이아웃:
 * - 데스크톱/태블릿: 우측 사이드바 + 하단 액션바
 * - 모바일: 하단 정보바 + 하단 액션바
 * - safe-area 대응, 반응형 전환
 */
export function GameHUD({ sidebarContent, bottomBarContent, mobileInfoContent }: GameHUDProps) {
  return (
    <div className="game-hud" data-testid="game-hud" role="region" aria-label="게임 HUD">
      {/* 우측 사이드바 (데스크톱/태블릿 전용, 모바일에서 숨김) */}
      {sidebarContent && (
        <aside className="game-hud__sidebar" aria-label="게임 정보 패널">
          {sidebarContent}
        </aside>
      )}

      {/* 모바일 전용 축약 정보바 (데스크톱/태블릿에서 숨김) */}
      {mobileInfoContent && (
        <div className="game-hud__mobile-info" role="status" aria-label="게임 상태 정보">
          {mobileInfoContent}
        </div>
      )}

      {/* 하단 액션바 (모든 브레이크포인트 공통) */}
      {bottomBarContent && (
        <div className="game-hud__bottom-bar">
          {bottomBarContent}
        </div>
      )}
    </div>
  );
}
