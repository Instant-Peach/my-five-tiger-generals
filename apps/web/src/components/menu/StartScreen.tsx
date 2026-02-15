/**
 * StartScreen Component
 *
 * Story 8-1: 메인 메뉴 (Main Menu)
 * Story 8-5: 설정 메뉴 (Settings Menu) - 설정 버튼/모달 추가
 * 게임 시작 전 메인 메뉴 화면을 표시합니다.
 *
 * AC1: 타이틀, 부제, 게임 시작 버튼 표시
 * AC4: 반응형 레이아웃 (모바일/데스크톱)
 * AC5: 터치 타겟 최소 44x44px
 * AC6: 삼국지 테마 색상
 */

import { useState, useRef } from 'react';
import { SettingsButton } from '../settings/SettingsButton';
import { SettingsModal } from '../settings/SettingsModal';
import './StartScreen.css';

export interface StartScreenProps {
  /** 게임 시작 버튼 클릭 시 호출되는 콜백 */
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  // Story 8-5: 설정 모달 열기/닫기 상태
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="start-screen" data-testid="start-screen">
      <h1 className="start-screen__title">오호대장군</h1>
      <p className="start-screen__subtitle-chinese">五虎大將軍</p>
      <p className="start-screen__subtitle">
        관우, 장비, 조운, 황충, 마초
        <br />
        다섯 맹장과 함께 천하를 호령하라
      </p>
      <button
        className="start-screen__button"
        onClick={onStart}
        data-testid="start-game-button"
        aria-label="게임 시작"
      >
        게임 시작
      </button>
      <p className="start-screen__mode-label">2인 로컬 플레이</p>

      {/* Story 8-5: 설정 버튼 (메인 메뉴) */}
      <SettingsButton
        ref={settingsButtonRef}
        onClick={() => setIsSettingsOpen(true)}
        variant="menu"
      />

      {/* Story 8-5: 설정 모달 */}
      <SettingsModal
        isVisible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        triggerRef={settingsButtonRef}
      />
    </div>
  );
}
