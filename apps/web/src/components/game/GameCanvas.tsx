/**
 * GameCanvas Component
 *
 * Phaser 게임 캔버스를 렌더링하는 React 컴포넌트입니다.
 * 반응형 레이아웃을 지원하며 부모 컨테이너 크기에 맞게 자동 조절됩니다.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameLoader } from '../../hooks/useGameLoader';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useResponsive } from '../../hooks/useResponsive';
import { GameHUD } from './GameHUD';
import { SidePanel } from './SidePanel';
import { BottomActionBar } from './BottomActionBar';
import { PlayerInfoBar } from './PlayerInfoBar';
import { MobileGeneralDrawer } from './MobileGeneralDrawer';
import { AutoEndToast } from './AutoEndToast';
import { LandscapeOverlay } from './LandscapeOverlay';
import { ResultScreen } from '../result/ResultScreen';
import { SurrenderConfirmModal } from './SurrenderConfirmModal';
import { TacticPanel } from './TacticPanel';
import { SettingsModal } from '../settings/SettingsModal';
import { useGameUiStore } from '../../stores/gameUiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { debounce } from '../../utils/debounce';
import { getGeneralById, RESPONSIVE } from '@ftg/game-core';
import type { GameState } from '@ftg/game-core';
import type { GameScene } from '@ftg/game-renderer';

const GAME_CONTAINER_ID = 'game-container';
const MIN_WIDTH = 320;
const MIN_HEIGHT = 480;

/**
 * 턴 상태 인터페이스
 * Story 5-1: 턴 종료 버튼
 * Story 5-3: 60초 타이머
 */
interface TurnState {
  currentPlayer: 'player1' | 'player2';
  turn: number;
  isGameEnded: boolean;
  /** Story 5-3: 남은 시간 (초) */
  remainingTime: number;
}

export interface GameCanvasProps {
  /** Story 8-1: 메인 메뉴로 복귀 콜백 */
  onReturnToMenu?: () => void;
}

export function GameCanvas({ onReturnToMenu }: GameCanvasProps = {}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Story 5-1, 5-3: 턴 상태 관리 (타이머 포함)
  const [turnState, setTurnState] = useState<TurnState>({
    currentPlayer: 'player1',
    turn: 1,
    isGameEnded: false,
    remainingTime: 60, // Story 5-3: 초기값 60초
  });

  // Story 5-4: 자동 종료 알림 표시 상태
  const [showAutoEndToast, setShowAutoEndToast] = useState(false);

  // Story 8-2: 행동 카운터 상태 (actionsRemaining)
  const [actionsRemaining, setActionsRemaining] = useState(3);

  // Story 8-2: 양 플레이어 노크 카운트 상태
  const [player1KnockCount, setPlayer1KnockCount] = useState(0);
  const [player2KnockCount, setPlayer2KnockCount] = useState(0);

  // Story 6-2: 승리 상태 관리
  const [victoryState, setVictoryState] = useState({
    isVisible: false,
    winner: '',
    reason: '',
  });

  // Story 8-6: 게임 종료 시점의 상태 스냅샷 (통계 추출용)
  const [endGameState, setEndGameState] = useState<GameState | null>(null);

  // Story 6-5: 항복 확인 모달 상태
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);

  // Story 8-4: 책략 패널 열기/닫기 상태
  const [isTacticPanelOpen, setIsTacticPanelOpen] = useState(false);

  // CR-3: TacticButton ref (포커스 복귀 대상)
  const tacticButtonRef = useRef<HTMLButtonElement>(null);

  // Story 8-5: 설정 모달 열기/닫기 상태
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Story 8-5: SettingsButton ref (포커스 복귀 대상)
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  // Story 5-1: GameScene 참조 저장 (턴 종료 호출용)
  const gameSceneRef = useRef<GameScene | null>(null);

  // Zustand 스토어에서 선택된 장수 ID 가져오기
  const { selectedGeneralId, setSelectedGeneral, clearSelectedGeneral } = useGameUiStore();

  // Story 8-7: useResponsive 훅으로 뷰포트/방향/브레이크포인트 감지
  const responsive = useResponsive();

  // Story 8-7 AC5: 가로 모드 안내 오버레이 dismissal 상태
  const [landscapeDismissed, setLandscapeDismissed] = useState(false);

  // Story 8-7 AC5: 세로 모드로 돌아오면 landscapeDismissed 리셋
  const prevIsLandscapeRef = useRef(responsive.isLandscape);
  useEffect(() => {
    if (prevIsLandscapeRef.current && !responsive.isLandscape) {
      // 가로 → 세로 전환 시 리셋 (다음 가로 전환 시 다시 표시)
      setLandscapeDismissed(false);
    }
    prevIsLandscapeRef.current = responsive.isLandscape;
  }, [responsive.isLandscape]);

  // Story 8-7 AC5: 가로 모드 안내 닫기 핸들러
  const handleLandscapeDismiss = useCallback(() => {
    setLandscapeDismissed(true);
  }, []);

  // 사이드바/하단바를 제외한 Phaser 캔버스 크기 계산
  const BOTTOM_BAR_HEIGHT = 104;
  const sidebarWidth = responsive.isMobile ? 0 : responsive.isTablet ? 400 : 500;
  const canvasWidth = size ? Math.max(size.width - sidebarWidth, MIN_WIDTH) : undefined;
  const canvasHeight = size ? Math.max(size.height - BOTTOM_BAR_HEIGHT, MIN_HEIGHT) : undefined;

  // 외부 컨테이너 크기 감지 (Phaser canvas와 분리)
  // Story 8-7 AC2: debounce(150ms) 적용
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const updateSize = () => {
      const { width, height } = outer.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setSize({
          width: Math.floor(Math.max(width, MIN_WIDTH)),
          height: Math.floor(Math.max(height, MIN_HEIGHT)),
        });
      }
    };

    updateSize();

    const debouncedUpdateSize = debounce(updateSize, RESPONSIVE.DEBOUNCE_MS);
    const resizeObserver = new ResizeObserver(debouncedUpdateSize);
    resizeObserver.observe(outer);

    return () => {
      resizeObserver.disconnect();
      debouncedUpdateSize.cancel();
    };
  }, []);

  const { isLoading, error, restart, game } = useGameLoader({
    parentId: GAME_CONTAINER_ID,
    width: canvasWidth,
    height: canvasHeight,
    enabled: size !== null,
  });

  // 크기 변경 시 Phaser에 알림 (사이드바/하단바 공간 제외)
  useEffect(() => {
    if (game && canvasWidth && canvasHeight) {
      game.scale.resize(canvasWidth, canvasHeight);
    }
  }, [game, canvasWidth, canvasHeight]);

  // game-core 이벤트 구독 및 gameState 동기화
  useEffect(() => {
    if (!game) return;

    const scene = game.scene.getScene('GameScene') as GameScene;
    if (!scene) return;

    // Story 8-2: gameState에서 HUD 상태 동기화 헬퍼
    const syncHudState = (state: GameState) => {
      setActionsRemaining(state.actionsRemaining);
      setPlayer1KnockCount(state.player1KnockCount);
      setPlayer2KnockCount(state.player2KnockCount);
    };

    // 초기 게임 상태 가져오기
    const initialState = scene.getGameState();
    if (initialState) {
      setGameState(initialState);
      syncHudState(initialState); // Story 8-2: 초기 HUD 동기화
    } else {
      // 씬 create() 완료 전이면, 준비 후 재시도
      const onSceneCreate = () => {
        const state = scene.getGameState();
        if (state) {
          setGameState(state);
          syncHudState(state);
        }
      };
      scene.events.once('create', onSceneCreate);
    }

    // 디버그 함수를 window 객체에 노출 (개발 환경만)
    if (import.meta.env.DEV) {
      const ftg = {
        // 기본 명령어
        damage: (n?: number) => scene.debugDamage(n),
        setTroops: (n: number) => scene.debugSetTroops(n),
        damageById: (id: string, n?: number) => scene.debugDamageById(id, n),
        out: () => scene.debugOut(),
        outById: (id: string) => scene.debugOutById(id),
        list: () => scene.debugListGenerals(),
        help: () => scene.debugHelp(),
        // Story 4-6: 전투 피드백 테스트
        attack: (a?: string, d?: string, dir?: 'sun' | 'moon' | 'frontline') => scene.debugAttack(a, d, dir),
        hit: (id?: string) => scene.debugHit(id),
        effect: (dir?: 'sun' | 'moon' | 'frontline') => scene.debugEffect(dir),
        sound: (type?: 'attack' | 'defeat') => scene.debugSound(type),
        toggleSound: () => scene.debugToggleSound(),
        fullCombat: () => scene.debugFullCombat(),
        scene, // 고급 디버깅용
      };
      (window as unknown as { ftg: typeof ftg }).ftg = ftg;

      // 콘솔에 도움말 출력
      console.log('%c🎮 오호대장군 디버그 모드', 'color: #ffd700; font-size: 16px; font-weight: bold;');
      console.log('%c콘솔에서 ftg.help()를 입력하여 사용 가능한 명령어를 확인하세요.', 'color: #aaa;');
    }

    // 장수 선택 이벤트 리스너
    const handleGeneralSelected = (data: { generalId: string }) => {
      setSelectedGeneral(data.generalId);
      // 게임 상태 업데이트
      const currentState = scene.getGameState();
      if (currentState) {
        setGameState({ ...currentState });
        syncHudState(currentState); // Story 8-2
      }
    };

    const handleGeneralDeselected = () => {
      clearSelectedGeneral();
      setIsTacticPanelOpen(false); // Story 8-4 AC8: 장수 선택 해제 시 패널 닫기
      // 게임 상태 업데이트
      const currentState = scene.getGameState();
      if (currentState) {
        setGameState({ ...currentState });
        syncHudState(currentState); // Story 8-2
      }
    };

    // Story 5-1: 턴 전환 이벤트 리스너
    const handleTurnStart = (data: { turn: number; playerId: string }) => {
      setTurnState((prev) => ({
        ...prev,
        currentPlayer: data.playerId as 'player1' | 'player2',
        turn: data.turn,
        remainingTime: 60, // Story 5-3 AC3: 턴 전환 시 타이머 리셋
      }));
      setIsTacticPanelOpen(false); // Story 8-4 AC8: 턴 전환 시 패널 자동 닫기
      // 게임 상태 업데이트
      const currentState = scene.getGameState();
      if (currentState) {
        setGameState({ ...currentState });
        syncHudState(currentState); // Story 8-2: 턴 시작 시 행동/노크 동기화
      }
    };

    // Story 5-3 AC5, AC6: 타이머 틱 이벤트 리스너
    const handleTimerTick = (data: { remainingTime: number }) => {
      setTurnState((prev) => ({
        ...prev,
        remainingTime: data.remainingTime,
      }));
    };

    // Story 5-4 AC2: 자동 종료 이벤트 리스너 (알림 표시)
    const handleAutoEnd = () => {
      setShowAutoEndToast(true);
    };

    // Story 8-2 AC4: 장수 이동 완료 이벤트 리스너
    const handleGeneralMoved = () => {
      const currentState = scene.getGameState();
      if (currentState) {
        setGameState({ ...currentState });
        syncHudState(currentState);
      }
    };

    // Story 8-2 AC4: 전투 공격 완료 이벤트 리스너
    const handleCombatAttack = () => {
      const currentState = scene.getGameState();
      if (currentState) {
        setGameState({ ...currentState });
        syncHudState(currentState);
      }
    };

    // Issue #4, Story 6-2 AC6: 게임 종료 이벤트 리스너
    const handleGameEnd = (data: { winner: string; reason?: string }) => {
      setTurnState((prev) => ({
        ...prev,
        isGameEnded: true,
      }));
      // Story 6-2: 승리 화면 표시
      setVictoryState({
        isVisible: true,
        winner: data.winner,
        reason: data.reason ?? 'knock',
      });
      // 게임 상태 업데이트
      const currentState = scene.getGameState();
      if (currentState) {
        setGameState({ ...currentState });
        syncHudState(currentState); // Story 8-2: 게임 종료 시 최종 상태 동기화
        // Story 8-6: 결과 화면 통계용 스냅샷 저장
        setEndGameState({ ...currentState });
      }
      console.log(`[GameCanvas] 게임 종료: ${data.winner} 승리 (사유: ${data.reason ?? 'unknown'})`);
    };

    // Story 5-1: GameScene 참조 저장
    gameSceneRef.current = scene;

    // 이벤트 리스너 등록
    scene.events.on('general:selected', handleGeneralSelected);
    scene.events.on('general:deselected', handleGeneralDeselected);
    scene.events.on('turn:start', handleTurnStart);
    scene.events.on('game:end', handleGameEnd);
    scene.events.on('timer:tick', handleTimerTick); // Story 5-3
    scene.events.on('turn:auto-end', handleAutoEnd); // Story 5-4
    scene.events.on('general:moved', handleGeneralMoved); // Story 8-2 AC4
    scene.events.on('combat:attack', handleCombatAttack); // Story 8-2 AC4

    // 클린업
    return () => {
      scene.events.off('general:selected', handleGeneralSelected);
      scene.events.off('general:deselected', handleGeneralDeselected);
      scene.events.off('turn:start', handleTurnStart);
      scene.events.off('game:end', handleGameEnd);
      scene.events.off('timer:tick', handleTimerTick); // Story 5-3
      scene.events.off('turn:auto-end', handleAutoEnd); // Story 5-4
      scene.events.off('general:moved', handleGeneralMoved); // Story 8-2 AC4
      scene.events.off('combat:attack', handleCombatAttack); // Story 8-2 AC4
      gameSceneRef.current = null;
    };
  }, [game, setSelectedGeneral, clearSelectedGeneral]);

  // Story 4-6: settingsStore의 사운드 설정을 GameScene에 동기화
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  useEffect(() => {
    if (!game) return;
    const scene = game.scene.getScene('GameScene') as GameScene;
    if (scene) {
      scene.setSoundEnabled(soundEnabled);
    }
  }, [game, soundEnabled]);

  // 선택된 장수 정보 조회
  const selectedGeneral =
    selectedGeneralId && gameState
      ? getGeneralById(gameState, selectedGeneralId) ?? null
      : null;

  // Story 5-4: 자동 종료 알림 숨김 핸들러
  const handleAutoEndToastHide = useCallback(() => {
    setShowAutoEndToast(false);
  }, []);

  // Story 5-1: 턴 종료 핸들러
  const handleEndTurn = useCallback(() => {
    const scene = gameSceneRef.current;
    if (scene) {
      scene.executeEndTurn();
    }
  }, []);

  // Story 6-5: 항복 버튼 클릭 핸들러 (확인 모달 표시)
  const handleSurrenderClick = useCallback(() => {
    setShowSurrenderModal(true);
  }, []);

  // Story 6-5: 항복 확인 핸들러
  const handleSurrenderConfirm = useCallback(() => {
    const scene = gameSceneRef.current;
    if (scene) {
      scene.handleSurrender(turnState.currentPlayer);
    }
    setShowSurrenderModal(false);
  }, [turnState.currentPlayer]);

  // Story 6-5: 항복 취소 핸들러
  const handleSurrenderCancel = useCallback(() => {
    setShowSurrenderModal(false);
  }, []);

  // Story 8-4: 책략 버튼 클릭 핸들러 (패널 열기)
  const handleTacticButtonClick = useCallback(() => {
    setIsTacticPanelOpen(true);
  }, []);

  // Story 8-4: 책략 패널 닫기 핸들러
  const handleTacticPanelClose = useCallback(() => {
    setIsTacticPanelOpen(false);
  }, []);

  // Story 8-6: 다시 시작 핸들러
  const handleRestart = useCallback(() => {
    const scene = gameSceneRef.current;
    if (scene) {
      // Phaser 내장 scene.restart()로 GameScene을 재시작 (create() 재호출)
      scene.scene.restart();
    }
    // 로컬 상태 초기화
    setVictoryState({ isVisible: false, winner: '', reason: '' });
    setEndGameState(null);
    setTurnState({
      currentPlayer: 'player1',
      turn: 1,
      isGameEnded: false,
      remainingTime: 60,
    });
    setActionsRemaining(3);
    setPlayer1KnockCount(0);
    setPlayer2KnockCount(0);
    setShowSurrenderModal(false);
    setIsTacticPanelOpen(false);
    setIsSettingsModalOpen(false);
  }, []);

  // Story 8-5: 설정 버튼 클릭 핸들러 (모달 열기)
  const handleSettingsClick = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  // Story 8-5: 설정 모달 닫기 핸들러
  const handleSettingsClose = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  // 장수 초상화 클릭 핸들러 (W2)
  const handleGeneralPortraitClick = useCallback((generalId: string) => {
    const scene = gameSceneRef.current;
    if (scene && typeof (scene as GameScene).selectGeneralById === 'function') {
      (scene as GameScene).selectGeneralById(generalId);
    }
    setSelectedGeneral(generalId);
  }, [setSelectedGeneral]);

  // Story 5-1: 로컬 2인 플레이에서는 항상 "내 턴" (같은 기기에서 번갈아 플레이)
  const isMyTurn = true;

  // Story 5-1: 키보드 단축키 (Space로 턴 종료)
  useKeyboardShortcuts({
    onEndTurn: handleEndTurn,
    isMyTurn,
    isGameEnded: turnState.isGameEnded,
    enabled: !isLoading,
  });

  if (error) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: '#ff6b6b',
        }}
      >
        <h2>게임 로드 실패</h2>
        <p>{error.message}</p>
        <button
          onClick={restart}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#c9302c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    // 외부 컨테이너: 크기 감지용 (flex로 뷰포트 채움)
    <div
      ref={outerRef}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        position: 'relative',
      }}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffd700',
            fontSize: '1.5rem',
            zIndex: 10,
          }}
        >
          게임 로딩 중...
        </div>
      )}
      {/* 내부 컨테이너: Phaser canvas용 (사이드바/하단바 공간 제외) */}
      <div
        id={GAME_CONTAINER_ID}
        style={{
          width: canvasWidth ?? '100%',
          height: canvasHeight ?? '100%',
          backgroundColor: '#1a1a2e',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* 삼국지 영걸전 스타일 HUD: 우측 사이드바 + 하단 액션바 */}
      {!isLoading && (
        <GameHUD
          sidebarContent={
            <SidePanel
              currentPlayer={turnState.currentPlayer}
              player1KnockCount={player1KnockCount}
              player2KnockCount={player2KnockCount}
              selectedGeneral={selectedGeneral}

              generals={gameState?.generals ?? []}
              selectedGeneralId={selectedGeneralId}
              onGeneralPortraitClick={handleGeneralPortraitClick}
            />
          }
          mobileInfoContent={
            <PlayerInfoBar
              currentPlayer={turnState.currentPlayer}
              turn={turnState.turn}
              remainingTime={turnState.remainingTime}
              actionsRemaining={actionsRemaining}
              player1KnockCount={player1KnockCount}
              player2KnockCount={player2KnockCount}
            />
          }
          bottomBarContent={
            <BottomActionBar
              turn={turnState.turn}
              remainingTime={turnState.remainingTime}
              actionsRemaining={actionsRemaining}
              isGameEnded={turnState.isGameEnded}
              onTacticClick={handleTacticButtonClick}
              tacticButtonRef={tacticButtonRef}
              onSettingsClick={handleSettingsClick}
              settingsButtonRef={settingsButtonRef}
              onSurrender={handleSurrenderClick}
              onEndTurn={handleEndTurn}
              isMyTurn={isMyTurn}
            />
          }
        />
      )}

      {/* 모바일 전용: 장수 선택 시 하단 드로어 */}
      {responsive.isMobile && (
        <MobileGeneralDrawer
          general={selectedGeneral}
          onClose={clearSelectedGeneral}
        />
      )}

      {/* 자동 종료 알림 */}
      <AutoEndToast
        isVisible={showAutoEndToast}
        onHide={handleAutoEndToastHide}
      />

      {/* 항복 확인 모달 */}
      <SurrenderConfirmModal
        isVisible={showSurrenderModal}
        onConfirm={handleSurrenderConfirm}
        onCancel={handleSurrenderCancel}
      />

      {/* 결과 화면 */}
      <ResultScreen
        isVisible={victoryState.isVisible}
        winner={victoryState.winner}
        reason={victoryState.reason}
        gameState={endGameState}
        onRestart={handleRestart}
        onReturnToMenu={onReturnToMenu}
      />

      {/* 책략 선택 패널 */}
      {isTacticPanelOpen && (
        <TacticPanel
          generalName={selectedGeneral?.nameKo ?? ''}
          onClose={handleTacticPanelClose}
          triggerRef={tacticButtonRef}
        />
      )}

      {/* 설정 모달 */}
      <SettingsModal
        isVisible={isSettingsModalOpen}
        onClose={handleSettingsClose}
        triggerRef={settingsButtonRef}
      />

      {/* 가로 모드 안내 오버레이 */}
      <LandscapeOverlay
        isVisible={responsive.isLandscape && !landscapeDismissed}
        onDismiss={handleLandscapeDismiss}
      />
    </div>
  );
}
