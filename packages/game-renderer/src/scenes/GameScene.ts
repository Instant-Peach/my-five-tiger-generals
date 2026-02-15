/**
 * Game Scene
 *
 * 메인 게임 플레이 화면을 담당합니다.
 */

import Phaser from 'phaser';
import {
  type TileId,
  type HoverEventPayload,
  type GameState,
  createInitialGameState,
  TILE_META,
  getGeneralAtTile,
  selectGeneral,
  deselectGeneral,
  getMovableTilesForGeneral,
  getOccupiedTiles,
  findPath,
  moveGeneral,
  getAttackableTiles,
  executeAttack,
  endTurn,
  // Story 5-3: 타이머 관련 import
  type TurnTimerState,
  createTurnTimerState,
  startTimer,
  tickTimer,
  resetTimer,
  isTimerExpired,
  // Story 6-1: 노크 관련 import
  canKnock,
  executeKnock,
  GAME,
  COMBAT,
  getMaxTroops,
  // Story 6-2: 노크 승리 관련 import
  // Story 6-5: 항복 관련 import
  type PlayerId,
  executeSurrender,
} from '@ftg/game-core';
import { BoardRenderer } from '../rendering/BoardRenderer';
import { GeneralRenderer } from '../rendering/GeneralRenderer';
import { getTileCentroid } from '../rendering/TileRenderer';
import { InputHandler } from '../input/InputHandler';
import { DamageFloater } from '../rendering/DamageFloater';
import { AttackEffect } from '../rendering/AttackEffect';
import { GeneralActionMenu, type ActionType } from '../ui/GeneralActionMenu';
import { MoveConfirmButton } from '../ui/MoveConfirmButton';
import { DisengageWarningModal } from '../ui/DisengageWarningModal';

export class GameScene extends Phaser.Scene {
  private boardRenderer?: BoardRenderer;
  private generalRenderer?: GeneralRenderer;
  private inputHandler?: InputHandler;
  private gameState?: GameState;
  private selectedTileId: TileId | null = null;
  private hoveredTileId: TileId | null = null;
  private highlightedTileIds: TileId[] = [];

  /** Story 4-6: 공격 이펙트 시스템 */
  private attackEffect?: AttackEffect;
  /** Story 4-6: 사운드 활성화 상태 (외부에서 설정 가능) */
  private soundEnabled: boolean = true;

  /** Story 5-3: 턴 타이머 상태 */
  private timerState: TurnTimerState = createTurnTimerState();
  /** Story 5-3: 마지막 타이머 틱 시간 (밀리초) */
  private lastTickTime: number = 0;

  /** Story 5-4: 턴 종료 진행 중 플래그 (동시 처리 방지) */
  private isEndingTurn: boolean = false;

  /** W4: 장수 액션 팝업 */
  private actionMenu?: GeneralActionMenu;

  /** W5: 인터랙션 모드 */
  private interactionMode: 'select' | 'move' | 'attack' = 'select';
  /** W5: 이동 미리보기 대상 타일 */
  private pendingMoveTileId: TileId | null = null;
  /** W5: 이동 확정 버튼 */
  private moveConfirmButton?: MoveConfirmButton;
  /** W6: 교전 회피 경고 모달 */
  private disengageWarningModal?: DisengageWarningModal;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 보드 렌더러 생성
    this.boardRenderer = new BoardRenderer(this);
    this.boardRenderer.render();

    // 게임 상태 초기화 및 장수 렌더러 생성
    // TODO: 노크 테스트 완료 후 createInitialGameState()로 복원
    this.gameState = createInitialGameState();
    this.generalRenderer = new GeneralRenderer(
      this,
      this.getTileCenterForGeneral.bind(this)
    );

    // 장수 렌더링
    this.generalRenderer.renderAllGenerals(this.gameState.generals);

    // 입력 핸들러 생성
    this.inputHandler = new InputHandler(
      this,
      this.boardRenderer,
      this.handleTileSelect.bind(this),
      this.handleTileHover.bind(this)
    );

    // 장수 선택 이벤트 리스너 등록
    this.events.on('general:selected', this.handleGeneralSelected, this);
    this.events.on('general:deselected', this.handleGeneralDeselected, this);

    // Story 4-6: 공격 이펙트 시스템 초기화
    this.attackEffect = new AttackEffect(this);

    // Story 5-3: 타이머 초기화 및 시작
    this.timerState = createTurnTimerState();
    this.timerState = startTimer(this.timerState);
    this.lastTickTime = Date.now();

    // Story 5-4: 타이머 만료 이벤트 리스너 (자동 턴 종료)
    this.events.on('timer:expired', this.handleTimerExpired, this);

    // 개발 중에는 항상 타일 ID 표시
    this.boardRenderer.showTileIds(true);

    // W4: 장수 액션 메뉴 초기화
    this.actionMenu = new GeneralActionMenu(this);
    this.actionMenu.onAction((action: ActionType) => {
      this.handleActionMenuSelect(action);
    });

    // W4: 키보드 단축키 등록 (1/2/3)
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ONE', () => {
        if (this.actionMenu?.isVisible()) this.actionMenu.triggerAction('move');
      });
      this.input.keyboard.on('keydown-TWO', () => {
        if (this.actionMenu?.isVisible()) this.actionMenu.triggerAction('attack');
      });
      this.input.keyboard.on('keydown-THREE', () => {
        if (this.actionMenu?.isVisible()) this.actionMenu.triggerAction('knock');
      });
    }

    // W5: 이동 확정 버튼 초기화
    this.moveConfirmButton = new MoveConfirmButton(this);
    this.moveConfirmButton.onConfirm(() => {
      this.confirmMove();
    });

    // W6: 교전 회피 경고 모달 초기화
    this.disengageWarningModal = new DisengageWarningModal(this);

    // W5: ESC 키로 이동/공격 모드 취소
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.interactionMode !== 'select') {
          this.exitMoveMode();
        }
      });
    }

    // resize 이벤트 리스너 추가
    this.scale.on('resize', this.handleResize, this);
  }

  /**
   * 장수 렌더링을 위한 타일 중심(centroid) 좌표 반환
   */
  private getTileCenterForGeneral(tileId: TileId): { x: number; y: number } {
    const tile = TILE_META.find((t) => t.id === tileId);
    if (!tile || !this.boardRenderer) {
      return { x: 0, y: 0 };
    }

    // BoardRenderer의 public getter를 통해 설정값 가져오기
    const tileConfig = this.boardRenderer.getTileConfig();
    const tileScale = this.boardRenderer.getTileScale();
    const offsets = this.boardRenderer.getOffsets();

    return getTileCentroid(tile, tileConfig, offsets.x, offsets.y, tileScale);
  }

  /**
   * 화면 크기 변경 핸들러
   */
  private handleResize(gameSize: Phaser.Structs.Size): void {
    // 카메라 뷰포트 업데이트
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);

    // 보드 재계산 및 재렌더링
    if (this.boardRenderer) {
      this.boardRenderer.recalculateAndRender();
      this.updateTileVisuals();
    }

    // 장수 재렌더링
    if (this.generalRenderer && this.gameState) {
      this.generalRenderer.clear();
      this.generalRenderer.renderAllGenerals(this.gameState.generals);
    }

    // W4: 리사이즈 시 메뉴 숨김
    this.actionMenu?.hide();

    // W5: 리사이즈 시 확정 버튼 숨김
    this.moveConfirmButton?.hide();

    // W6: 리사이즈 시 모달 숨김
    this.disengageWarningModal?.hide();
  }

  /**
   * 타일 선택 핸들러
   */
  private handleTileSelect(tileId: TileId | null): void {
    if (!this.gameState) return;

    // 애니메이션 중이면 입력 무시
    if (this.generalRenderer?.getIsAnimating()) {
      return;
    }

    // W5: 이동 모드에서는 별도 처리
    if (this.interactionMode === 'move' && tileId !== null) {
      this.handleTileSelectInMoveMode(tileId);
      return;
    }

    const previousTileId = this.selectedTileId;
    const previousSelectedGeneralId = this.gameState.selectedGeneralId;

    // 같은 타일 클릭 시 선택 해제 (장수가 있는 경우만)
    if (tileId !== null && tileId === previousTileId) {
      const general = getGeneralAtTile(this.gameState, tileId);
      // 장수가 있고 현재 선택되어 있으면 토글 (선택 해제)
      if (general && this.gameState.selectedGeneralId === general.id) {
        this.handleDeselect();
        return;
      }
      // 장수가 없으면 그냥 같은 타일이므로 아무 동작 안 함
      return;
    }

    // 타일이 null이면 선택 해제
    if (tileId === null) {
      this.handleDeselect();
      return;
    }

    // 장수가 선택된 상태에서 공격/이동 가능 타일 클릭 시 처리
    if (previousSelectedGeneralId !== null) {
      // 먼저 공격 가능 타일인지 확인 (공격이 이동보다 우선)
      const attackableTiles = getAttackableTiles(this.gameState, previousSelectedGeneralId);
      if (attackableTiles.includes(tileId)) {
        // 공격 가능 타일 클릭 -> 공격 실행
        const defender = getGeneralAtTile(this.gameState, tileId);
        if (defender) {
          this.executeAttack(previousSelectedGeneralId, defender.id);
        }
        return;
      }

      const movableTiles = getMovableTilesForGeneral(this.gameState, previousSelectedGeneralId);

      if (movableTiles.includes(tileId)) {
        // 이동 가능 타일 클릭 -> 이동 실행
        this.executeMove(previousSelectedGeneralId, tileId);
        return;
      }
    }

    this.selectedTileId = tileId;

    // 클릭한 타일에 장수가 있는지 확인
    const general = getGeneralAtTile(this.gameState, tileId);

    if (general) {
      // 장수가 있으면 선택 시도
      const result = selectGeneral(this.gameState, general.id);

      if (result.success) {
        this.gameState = result.data;

        // 장수 선택 이벤트 발행
        this.events.emit('general:selected', { generalId: general.id });
      } else {
        // 에러 처리 (예: 상대 장수 선택 시도)
        console.warn(`[GameScene] ${result.error.message}`);
        this.events.emit('action:invalid', {
          reason: result.error.code,
          message: result.error.message
        });

        // 선택 실패 시 기존 선택 해제
        this.gameState = deselectGeneral(this.gameState);
        if (previousSelectedGeneralId !== null) {
          this.events.emit('general:deselected', { generalId: previousSelectedGeneralId });
        }
      }
    } else {
      // 장수가 없고, 이동 가능 타일도 아니면 선택 해제
      this.gameState = deselectGeneral(this.gameState);

      // 장수 선택 해제 이벤트 발행
      if (previousSelectedGeneralId !== null) {
        this.events.emit('general:deselected', { generalId: previousSelectedGeneralId });
      }
    }

    // 시각적 업데이트 (호버 상태도 함께 고려)
    this.updateTileVisuals();

    // 기존 타일 선택 이벤트도 발행 (호환성)
    this.events.emit('tile:selected', { tileId, previousTileId });
  }

  /**
   * 장수 이동 실행 (애니메이션 포함)
   *
   * @param generalId - 이동할 장수 ID
   * @param toTileId - 목적지 타일 ID
   */
  private executeMove(generalId: string, toTileId: TileId): void {
    if (!this.gameState) return;

    // 애니메이션 중이면 무시
    if (this.generalRenderer?.getIsAnimating()) {
      return;
    }

    // 이동 실행 (내부에서 모든 검증 수행)
    const result = moveGeneral(this.gameState, generalId, toTileId);

    if (result.success) {
      const previousPosition = this.gameState.generals.find(g => g.id === generalId)?.position;

      // 게임 상태 업데이트 (즉시)
      this.gameState = result.data;

      // 경로 미리보기 해제 (이동 시작 시)
      this.clearPathPreviewState();

      // 장수 애니메이션 이동
      if (this.generalRenderer) {
        this.generalRenderer.animateMoveTo(generalId, toTileId, {
          onComplete: () => {
            // 애니메이션 완료 후 처리
            this.onMoveAnimationComplete(generalId, toTileId, previousPosition);
          },
        });
      }
    } else {
      // 이동 실패 처리
      console.warn(`[GameScene] 이동 실패: ${result.error.message}`);
      this.events.emit('action:invalid', {
        reason: result.error.code,
        message: result.error.message,
      });
    }
  }

  /**
   * 공격 실행
   *
   * Story 4-6: 전투 피드백 시퀀스 통합
   * 순서: 공격 이펙트 → 피격 효과 + 사운드 → 데미지 표시 → 병력 갱신 → (OUT 처리)
   *
   * @param attackerId - 공격자 장수 ID
   * @param defenderId - 방어자 장수 ID
   */
  private executeAttack(attackerId: string, defenderId: string): void {
    if (!this.gameState) return;

    // 공격 전 방어자 병력 기록 (Story 4-4: 병력 감소 이벤트용)
    const attacker = this.gameState.generals.find(g => g.id === attackerId);
    const defender = this.gameState.generals.find(g => g.id === defenderId);
    const previousTroops = defender?.troops ?? 0;

    // 공격자/방어자 위치 확인
    if (!attacker?.position || !defender?.position) {
      console.warn('[GameScene] 공격자 또는 방어자의 위치가 없습니다.');
      return;
    }

    const result = executeAttack(this.gameState, attackerId, defenderId);

    if (result.success) {
      const { state: newState, result: attackResult, victoryResult } = result.data;

      // Story 4-6: 공격 이펙트 시작 좌표 계산
      const attackerCoords = this.boardRenderer?.getTileCenter(attacker.position);
      const defenderCoords = this.boardRenderer?.getTileCenter(defender.position);

      if (attackerCoords && defenderCoords && this.attackEffect) {
        // 1. 공격 이펙트 시작 (즉시)
        this.attackEffect.play(
          attackerCoords.x,
          attackerCoords.y,
          defenderCoords.x,
          defenderCoords.y,
          attackResult.direction,
          () => {
            // 2. 이펙트 도달 시 피격 효과 (200-300ms 후)
            this.applyHitEffects(defenderId, defender.position!);
          }
        );
      } else {
        // 좌표 계산 실패 시 피격 효과만 즉시 적용
        this.applyHitEffects(defenderId, defender.position);
      }

      // 게임 상태 업데이트
      this.gameState = newState;

      // 장수 상태 재렌더링 (병력 감소 표시)
      const updatedDefender = newState.generals.find((g: { id: string }) => g.id === defenderId);
      if (this.generalRenderer && updatedDefender) {
        // Story 4-4: 플로팅 데미지 텍스트 표시
        if (attackResult.damage > 0) {
          const defenderContainer = this.generalRenderer.getContainer(defenderId);
          if (defenderContainer) {
            // 토큰 위쪽에 데미지 표시
            new DamageFloater(
              this,
              defenderContainer.x,
              defenderContainer.y - 20,
              attackResult.damage
            );
          }
        }

        // Story 4-4: 애니메이션과 함께 병력 업데이트
        const indicator = this.generalRenderer.getTroopIndicator(defenderId);
        if (indicator) {
          indicator.updateWithAnimation(
            updatedDefender.troops,
            updatedDefender.stats.star,
            false // skipAnimation
          );
        } else {
          // fallback: 기존 메서드 사용
          this.generalRenderer.updateTroops(
            defenderId,
            updatedDefender.troops,
            updatedDefender.stats.star
          );
        }

        // Story 4-4: 병력 감소 이벤트 발행 (AC4)
        this.events.emit('troops:reduced', {
          generalId: defenderId,
          previousTroops,
          newTroops: updatedDefender.troops,
          damage: attackResult.damage,
        });

        // Story 4-5: OUT 처리 (AC2, AC3)
        if (attackResult.isKnockOut) {
          // 페이드아웃 애니메이션으로 장수 제거
          this.generalRenderer.removeGeneral(defenderId, true);

          // Story 4-6: OUT 사운드 재생
          this.playDefeatSound();

          // general:out 이벤트 발행
          this.events.emit('general:out', {
            generalId: defenderId,
            owner: defender?.owner,
            lastPosition: attackResult.defenderTile,
          });
        }
      }

      // Story 6-4: 와해 승리 판정
      if (victoryResult) {
        // 타이머 정지
        this.timerState = { ...this.timerState, isRunning: false };
        // 게임 종료 이벤트 발행
        this.events.emit('game:end', {
          winner: victoryResult.winner,
          reason: victoryResult.reason,
        });
      }

      // 공격 가능/이동 가능 타일 재계산
      this.updateSelectedGeneralHighlights();

      // 시각적 업데이트
      this.updateTileVisuals();

      // 공격 완료 이벤트 발행 (Story 4-2: 방향 정보 포함)
      this.events.emit('combat:attack', {
        attackerId,
        defenderId,
        defenderTileId: attackResult.defenderTile,
        direction: attackResult.direction, // Story 4-2: 공격 방향
        damage: attackResult.damage,
        defenderRemainingTroops: attackResult.defenderTroopsAfter,
        isKnockOut: attackResult.isKnockOut,
        actionsRemaining: newState.actionsRemaining,
      });
    } else {
      // 공격 실패 처리
      console.warn(`[GameScene] 공격 실패: ${result.error.message}`);
      this.events.emit('action:invalid', {
        reason: result.error.code,
        message: result.error.message,
      });
    }
  }

  /**
   * 피격 효과 적용 (흔들림 + 타일 플래시 + 사운드)
   *
   * Story 4-6: 전투 피드백 (Combat Feedback)
   *
   * @param defenderId - 방어자 장수 ID
   * @param defenderTileId - 방어자 타일 ID
   */
  private applyHitEffects(defenderId: string, defenderTileId: TileId): void {
    // 장수 흔들림 효과
    this.generalRenderer?.shakeGeneral(defenderId);

    // 타일 플래시 효과
    this.boardRenderer?.flashTile(defenderTileId);

    // 공격 사운드 재생
    this.playAttackSound();
  }

  /**
   * 공격 효과음 재생
   *
   * Story 4-6: 전투 피드백 (Combat Feedback)
   */
  private playAttackSound(): void {
    if (!this.soundEnabled) return;

    // 사운드가 로드되어 있는지 확인 후 재생
    if (this.cache.audio.exists('sfx_attack')) {
      this.sound.play('sfx_attack', { volume: 0.5 });
    }
  }

  /**
   * OUT 효과음 재생
   *
   * Story 4-6: 전투 피드백 (Combat Feedback)
   */
  private playDefeatSound(): void {
    if (!this.soundEnabled) return;

    // 사운드가 로드되어 있는지 확인 후 재생
    if (this.cache.audio.exists('sfx_defeat')) {
      this.sound.play('sfx_defeat', { volume: 0.6 });
    }
  }

  /**
   * 사운드 활성화 상태 설정
   *
   * Story 4-6: 전투 피드백 (Combat Feedback)
   * React 설정 스토어와 연동하여 호출됩니다.
   *
   * @param enabled - 사운드 활성화 여부
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * 사운드 활성화 상태 반환
   */
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * 선택된 장수의 이동/공격 가능 타일 하이라이트 업데이트
   */
  private updateSelectedGeneralHighlights(): void {
    if (!this.gameState || !this.boardRenderer) return;

    const selectedId = this.gameState.selectedGeneralId;
    if (selectedId === null) {
      this.boardRenderer.clearMovableTiles();
      this.boardRenderer.clearAttackableTiles();
      return;
    }

    // 이동 가능 타일 계산 및 표시
    const movableTiles = getMovableTilesForGeneral(this.gameState, selectedId);
    this.boardRenderer.showMovableTiles(movableTiles);

    // 공격 가능 타일 계산 및 표시
    const attackableTiles = getAttackableTiles(this.gameState, selectedId);
    this.boardRenderer.showAttackableTiles(attackableTiles);
  }

  /**
   * 이동 애니메이션 완료 후 처리
   */
  private onMoveAnimationComplete(
    generalId: string,
    toTileId: TileId,
    previousPosition: TileId | null | undefined
  ): void {
    // 선택된 타일 업데이트
    this.selectedTileId = toTileId;

    // 이동/공격 가능 타일 재계산 및 표시
    this.updateSelectedGeneralHighlights();

    // 시각적 업데이트
    this.updateTileVisuals();

    // 이동 완료 이벤트 발행
    this.events.emit('general:moved', {
      generalId,
      from: previousPosition,
      to: toTileId,
      actionsRemaining: this.gameState?.actionsRemaining,
    });
  }

  /**
   * 선택 해제 핸들러
   */
  private handleDeselect(): void {
    if (!this.gameState) return;

    // W5: 이동/공격 모드 해제
    if (this.interactionMode !== 'select') {
      this.exitMoveMode();
    }

    const previousTileId = this.selectedTileId;
    const previousSelectedGeneralId = this.gameState.selectedGeneralId;

    this.selectedTileId = null;
    this.gameState = deselectGeneral(this.gameState);

    // W4: 액션 메뉴 숨김
    this.actionMenu?.hide();

    // 시각적 업데이트 (호버 상태도 함께 고려)
    this.updateTileVisuals();

    // 장수 선택 해제 이벤트 발행
    if (previousSelectedGeneralId !== null) {
      this.events.emit('general:deselected', { generalId: previousSelectedGeneralId });
    }

    this.events.emit('tile:deselected', { previousTileId });
  }

  /**
   * 타일 호버 핸들러
   */
  private handleTileHover(tileId: TileId | null): void {
    // 애니메이션 중이면 호버 효과 무시
    if (this.generalRenderer?.getIsAnimating()) {
      return;
    }

    // 같은 타일이면 무시 (불필요한 재렌더링 방지)
    if (tileId === this.hoveredTileId) {
      return;
    }

    const previousHoveredId = this.hoveredTileId;
    this.hoveredTileId = tileId;

    // 경로 미리보기 처리
    this.updatePathPreview(tileId);

    // 시각적 업데이트
    this.updateTileVisuals();

    // 이벤트 발행
    if (previousHoveredId !== null) {
      const unhoverPayload: HoverEventPayload = { tileId: previousHoveredId };
      this.events.emit('tile:unhovered', unhoverPayload);
    }
    if (tileId !== null) {
      const hoverPayload: HoverEventPayload = { tileId };
      this.events.emit('tile:hovered', hoverPayload);
    }
  }

  /**
   * 경로 미리보기 업데이트
   *
   * @param hoveredTileId - 호버된 타일 ID (null이면 미리보기 해제)
   */
  private updatePathPreview(hoveredTileId: TileId | null): void {
    if (!this.boardRenderer || !this.gameState) return;

    // 장수가 선택되어 있지 않으면 경로 미리보기 해제
    if (this.gameState.selectedGeneralId === null) {
      this.clearPathPreviewState();
      return;
    }

    // 호버 해제 시 경로 미리보기 해제
    if (hoveredTileId === null) {
      this.clearPathPreviewState();
      return;
    }

    // 이동 가능 타일이 아니면 경로 미리보기 해제
    const movableTiles = getMovableTilesForGeneral(
      this.gameState,
      this.gameState.selectedGeneralId
    );
    if (!movableTiles.includes(hoveredTileId)) {
      this.clearPathPreviewState();
      return;
    }

    // 선택된 장수의 현재 위치 확인
    const general = this.gameState.generals.find(
      (g) => g.id === this.gameState?.selectedGeneralId
    );
    if (!general || general.position === null) {
      this.clearPathPreviewState();
      return;
    }

    // 경로 계산 (차단된 타일 = 자기 자신 제외한 모든 장수 위치)
    const blocked = getOccupiedTiles(this.gameState);
    blocked.delete(general.position); // 자기 위치는 차단에서 제외

    const path = findPath(general.position, hoveredTileId, blocked);

    if (path && path.length > 0) {
      // 경로 미리보기 표시
      this.boardRenderer.showPathPreview(path, general.position);
    } else {
      this.clearPathPreviewState();
    }
  }

  /**
   * 경로 미리보기 상태 초기화
   */
  private clearPathPreviewState(): void {
    if (this.boardRenderer) {
      this.boardRenderer.clearPathPreview();
    }
  }

  /**
   * 타일 시각적 상태 업데이트
   * 우선순위: selected > hovered > highlighted > normal
   */
  private updateTileVisuals(): void {
    if (!this.boardRenderer) return;

    // 다중 상태 통합 렌더링 사용
    this.boardRenderer.renderWithStates(
      this.selectedTileId,
      this.hoveredTileId,
      this.highlightedTileIds
    );
  }

  /**
   * 현재 선택된 타일 ID 반환
   */
  getSelectedTileId(): TileId | null {
    return this.selectedTileId;
  }

  /**
   * 현재 호버된 타일 ID 반환
   */
  getHoveredTileId(): TileId | null {
    return this.hoveredTileId;
  }

  /**
   * 하이라이트할 타일 목록 설정 (이동 가능 타일 등)
   */
  setHighlightedTiles(tileIds: TileId[]): void {
    this.highlightedTileIds = tileIds;
    this.updateTileVisuals();
  }

  /**
   * 하이라이트 해제
   */
  clearHighlightedTiles(): void {
    this.highlightedTileIds = [];
    this.updateTileVisuals();
  }

  /**
   * 현재 하이라이트된 타일 목록 반환
   */
  getHighlightedTileIds(): TileId[] {
    return [...this.highlightedTileIds];
  }

  /**
   * 장수 선택 이벤트 핸들러
   */
  private handleGeneralSelected(payload: { generalId: string }): void {
    // 장수 하이라이트
    if (this.generalRenderer) {
      this.generalRenderer.highlightGeneral(payload.generalId);
    }

    // 이동 가능 타일 및 공격 가능 타일 표시
    if (this.gameState && this.boardRenderer) {
      const movableTiles = getMovableTilesForGeneral(this.gameState, payload.generalId);
      this.boardRenderer.showMovableTiles(movableTiles);

      const attackableTiles = getAttackableTiles(this.gameState, payload.generalId);
      this.boardRenderer.showAttackableTiles(attackableTiles);
    }

    // Story 6-1 AC5: 노크 가능 여부를 React에 전달
    if (this.gameState) {
      const knockAvailable = canKnock(this.gameState, payload.generalId);
      const playerId = this.gameState.currentPlayer;
      const knockCountKey = playerId === 'player1' ? 'player1KnockCount' : 'player2KnockCount';
      this.events.emit('knock:availability', {
        generalId: payload.generalId,
        knockAvailable,
        knockCount: this.gameState[knockCountKey],
        maxKnockCount: GAME.KNOCK_COUNT_TO_WIN,
      });
    }

    // W4: 액션 메뉴 표시
    this.showActionMenu(payload.generalId);
  }

  /**
   * 장수 선택 해제 이벤트 핸들러
   */
  private handleGeneralDeselected(): void {
    // 장수 하이라이트 해제
    if (this.generalRenderer) {
      this.generalRenderer.clearHighlight();
    }

    // 이동 가능 타일 및 공격 가능 타일 하이라이트 제거
    if (this.boardRenderer) {
      this.boardRenderer.clearMovableTiles();
      this.boardRenderer.clearAttackableTiles();
    }

    // 경로 미리보기 해제
    this.clearPathPreviewState();

    // W4: 액션 메뉴 숨김
    this.actionMenu?.hide();

    // Story 6-1: 노크 가능 상태 초기화
    this.events.emit('knock:availability', {
      generalId: null,
      knockAvailable: false,
      knockCount: 0,
      maxKnockCount: GAME.KNOCK_COUNT_TO_WIN,
    });
  }

  /**
   * W4: 액션 메뉴에서 선택된 액션 처리
   */
  private handleActionMenuSelect(action: ActionType): void {
    if (!this.gameState || !this.gameState.selectedGeneralId) return;

    const generalId = this.gameState.selectedGeneralId;
    this.actionMenu?.hide();

    switch (action) {
      case 'move': {
        this.enterMoveMode();
        break;
      }
      case 'attack': {
        // 공격 가능 타일 표시
        const attackableTiles = getAttackableTiles(this.gameState, generalId);
        if (attackableTiles.length > 0) {
          this.highlightedTileIds = attackableTiles;
          this.boardRenderer?.showAttackableTiles(attackableTiles);
        }
        break;
      }
      case 'knock': {
        // 노크 실행
        this.handleKnock(generalId);
        break;
      }
    }
  }

  /**
   * W5: 이동 모드 진입
   * W6: 교전 중인 경우 경고 모달 먼저 표시
   */
  private enterMoveMode(): void {
    if (!this.gameState || !this.gameState.selectedGeneralId) return;

    const generalId = this.gameState.selectedGeneralId;
    const general = this.gameState.generals.find(g => g.id === generalId);
    if (!general) return;

    // W6: 교전 중이면 경고 모달 먼저 표시
    if (general.engagedWith) {
      const DISENGAGE_DAMAGE = COMBAT.DISENGAGE_DAMAGE;
      this.disengageWarningModal?.show({
        currentTroops: general.troops,
        disengageDamage: DISENGAGE_DAMAGE,
        onConfirm: () => {
          // 확인 -> 이동 모드 진입
          this.proceedToMoveMode(generalId);
        },
        onCancel: () => {
          // 취소 -> 현재 상태 유지
        },
      });
      return;
    }

    this.proceedToMoveMode(generalId);
  }

  /**
   * W6: 이동 모드 진입 로직 (교전 회피 확인 후 호출)
   */
  private proceedToMoveMode(generalId?: string): void {
    if (!this.gameState) return;

    const gId = generalId ?? this.gameState.selectedGeneralId;
    if (!gId) return;

    this.interactionMode = 'move';
    this.actionMenu?.hide();

    const movableTiles = getMovableTilesForGeneral(this.gameState, gId);
    if (movableTiles.length > 0) {
      this.highlightedTileIds = movableTiles;
      this.boardRenderer?.showMovableTiles(movableTiles);
    }

    this.events.emit('mode:changed', { mode: 'move' });
  }

  /**
   * W5: 이동 모드에서 타일 선택 처리
   */
  private handleTileSelectInMoveMode(tileId: TileId): void {
    if (!this.gameState || !this.gameState.selectedGeneralId) return;

    // 이동 가능 타일인지 확인
    const generalId = this.gameState.selectedGeneralId;
    const movableTiles = getMovableTilesForGeneral(this.gameState, generalId);

    if (movableTiles.includes(tileId)) {
      // 경로 미리보기 표시
      this.pendingMoveTileId = tileId;

      // 경로 하이라이트 (현재 위치 -> 선택 타일)
      const general = this.gameState.generals.find(g => g.id === generalId);
      if (general && general.position) {
        const occupiedTiles = getOccupiedTiles(this.gameState);
        const path = findPath(general.position, tileId, occupiedTiles);
        if (path && path.length > 0) {
          this.boardRenderer?.showPathPreview(path, general.position);
        }
      }

      // 확정 버튼 표시
      const pos = this.getTileCenterForGeneral(tileId);
      this.moveConfirmButton?.show(pos.x, pos.y);
    } else {
      // 이동 불가 타일 클릭 -> 이동 모드 취소
      this.exitMoveMode();
    }
  }

  /**
   * W5: 이동 확정
   */
  private confirmMove(): void {
    if (!this.gameState || !this.gameState.selectedGeneralId || !this.pendingMoveTileId) return;

    const generalId = this.gameState.selectedGeneralId;
    const tileId = this.pendingMoveTileId;

    this.moveConfirmButton?.hide();
    this.pendingMoveTileId = null;
    this.interactionMode = 'select';

    // 기존 이동 실행 로직 호출
    this.executeMove(generalId, tileId);
  }

  /**
   * W5: 이동/공격 모드 해제
   */
  private exitMoveMode(): void {
    this.interactionMode = 'select';
    this.pendingMoveTileId = null;
    this.moveConfirmButton?.hide();

    // 하이라이트 원복
    this.updateTileVisuals();

    this.events.emit('mode:changed', { mode: 'select' });
  }

  /**
   * W4: 액션 메뉴 표시 (장수 선택 시)
   */
  private showActionMenu(generalId: string): void {
    if (!this.gameState || !this.actionMenu) return;

    const general = this.gameState.generals.find(g => g.id === generalId);
    if (!general || !general.position) return;

    // 현재 플레이어의 장수만 메뉴 표시
    if (general.owner !== this.gameState.currentPlayer) return;

    // 장수 토큰 위치 가져오기
    const pos = this.getTileCenterForGeneral(general.position);

    // 각 액션 활성화 여부 판단
    const movableTiles = getMovableTilesForGeneral(this.gameState, generalId);
    const attackableTiles = getAttackableTiles(this.gameState, generalId);
    const knockAvailable = canKnock(this.gameState, generalId);

    this.actionMenu.show(pos.x, pos.y, {
      moveEnabled: movableTiles.length > 0 && this.gameState.actionsRemaining > 0,
      attackEnabled: attackableTiles.length > 0 && this.gameState.actionsRemaining > 0,
      knockEnabled: knockAvailable && this.gameState.actionsRemaining > 0,
    });
  }

  /**
   * W2: 외부에서 장수 ID로 선택하는 public API
   * (SidePanel 초상화 클릭 등에서 사용)
   */
  public selectGeneralById(generalId: string): void {
    if (!this.gameState) return;
    const general = this.gameState.generals.find(g => g.id === generalId);
    if (!general || !general.position) return;

    // 이미 선택된 장수면 선택 해제
    if (this.gameState.selectedGeneralId === generalId) {
      this.handleDeselect();
      return;
    }

    // 내부 handleTileSelect를 거치지 않고 직접 선택 처리
    this.selectedTileId = general.position;
    const result = selectGeneral(this.gameState, generalId);
    if (result.success) {
      this.gameState = result.data;
      this.events.emit('general:selected', { generalId: general.id });
    }
  }

  update(_time: number, _delta: number): void {
    // Story 5-3: 타이머 업데이트 (1초마다)
    this.updateTimer();
  }

  /**
   * Story 5-3: 타이머 업데이트 로직
   *
   * AC2: 타이머 카운트다운 로직
   * - 1초마다 감소
   * - 0초 도달 시 타이머 정지 및 이벤트 발행
   *
   * AC5: 타이머 이벤트 발행
   * - 'timer:tick' 이벤트: 매초 남은 시간 전달
   * - 'timer:expired' 이벤트: 0초 도달 시
   */
  private updateTimer(): void {
    if (!this.timerState.isRunning) return;

    // Issue #5: 게임 종료 상태에서는 타이머 정지
    if (this.gameState?.phase === 'ended') {
      this.timerState = { ...this.timerState, isRunning: false };
      return;
    }

    const now = Date.now();
    const elapsed = now - this.lastTickTime;

    // 1초(1000ms) 경과 시 tick
    if (elapsed >= 1000) {
      this.lastTickTime = now;

      // 이전 상태 저장
      const previousTime = this.timerState.remainingTime;

      // 타이머 감소
      this.timerState = tickTimer(this.timerState);

      // 시간이 변경된 경우에만 이벤트 발행
      if (this.timerState.remainingTime !== previousTime) {
        // AC5: 'timer:tick' 이벤트 발행 (매초)
        this.events.emit('timer:tick', {
          remainingTime: this.timerState.remainingTime,
        });
      }

      // AC5: 0초 도달 시 'timer:expired' 이벤트 발행
      if (isTimerExpired(this.timerState)) {
        this.timerState = { ...this.timerState, isRunning: false };
        this.events.emit('timer:expired', {});
      }
    }
  }

  /**
   * Story 5-3: 현재 타이머 상태 반환
   *
   * @returns 타이머 상태 (남은 시간, 실행 여부)
   */
  getTimerState(): TurnTimerState {
    return { ...this.timerState };
  }

  // ============================================================
  // 디버그 함수들 (콘솔에서 테스트용)
  // ============================================================

  /**
   * 선택된 장수에게 데미지를 입힌다 (시각적 테스트용)
   * @param damage - 입힐 데미지 (기본값: 1)
   */
  debugDamage(damage: number = 1): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    const selectedId = this.gameState.selectedGeneralId;
    if (!selectedId) {
      console.warn('[DEBUG] 장수를 먼저 선택해주세요.');
      return;
    }

    const general = this.gameState.generals.find(g => g.id === selectedId);
    if (!general) {
      console.warn('[DEBUG] 선택된 장수를 찾을 수 없습니다.');
      return;
    }

    const previousTroops = general.troops;
    const newTroops = Math.max(0, previousTroops - damage);

    // 게임 상태 업데이트 (불변성 유지)
    this.gameState = {
      ...this.gameState,
      generals: this.gameState.generals.map(g =>
        g.id === selectedId ? { ...g, troops: newTroops } : g
      ),
    };

    // 시각적 피드백
    if (this.generalRenderer) {
      // 플로팅 데미지 텍스트
      const container = this.generalRenderer.getContainer(selectedId);
      if (container) {
        new DamageFloater(this, container.x, container.y - 20, damage);
      }

      // 병력 인디케이터 애니메이션 업데이트
      const indicator = this.generalRenderer.getTroopIndicator(selectedId);
      if (indicator) {
        indicator.updateWithAnimation(newTroops, getMaxTroops(general.stats.star), false);
      }
    }

    // 이벤트 발행
    this.events.emit('troops:reduced', {
      generalId: selectedId,
      previousTroops,
      newTroops,
      damage,
    });

    console.log(`[DEBUG] ${general.name}에게 ${damage} 데미지! (${previousTroops} → ${newTroops})`);
  }

  /**
   * 선택된 장수의 병력을 특정 값으로 설정 (시각적 테스트용)
   * @param troops - 설정할 병력 수
   */
  debugSetTroops(troops: number): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    const selectedId = this.gameState.selectedGeneralId;
    if (!selectedId) {
      console.warn('[DEBUG] 장수를 먼저 선택해주세요.');
      return;
    }

    const general = this.gameState.generals.find(g => g.id === selectedId);
    if (!general) {
      console.warn('[DEBUG] 선택된 장수를 찾을 수 없습니다.');
      return;
    }

    const previousTroops = general.troops;
    const newTroops = Math.max(0, Math.min(troops, getMaxTroops(general.stats.star)));
    const damage = previousTroops - newTroops;

    // 게임 상태 업데이트 (불변성 유지)
    this.gameState = {
      ...this.gameState,
      generals: this.gameState.generals.map(g =>
        g.id === selectedId ? { ...g, troops: newTroops } : g
      ),
    };

    // 시각적 피드백 (데미지가 있을 때만)
    if (this.generalRenderer) {
      if (damage > 0) {
        const container = this.generalRenderer.getContainer(selectedId);
        if (container) {
          new DamageFloater(this, container.x, container.y - 20, damage);
        }
      }

      const indicator = this.generalRenderer.getTroopIndicator(selectedId);
      if (indicator) {
        indicator.updateWithAnimation(newTroops, getMaxTroops(general.stats.star), false);
      }
    }

    console.log(`[DEBUG] ${general.name} 병력 설정: ${previousTroops} → ${newTroops}`);
  }

  /**
   * 특정 장수 ID로 데미지를 입힌다
   * @param generalId - 장수 ID
   * @param damage - 입힐 데미지
   */
  debugDamageById(generalId: string, damage: number = 1): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    const general = this.gameState.generals.find(g => g.id === generalId);
    if (!general) {
      console.warn(`[DEBUG] 장수 ID "${generalId}"를 찾을 수 없습니다.`);
      this.debugListGenerals();
      return;
    }

    const previousTroops = general.troops;
    const newTroops = Math.max(0, previousTroops - damage);

    // 게임 상태 업데이트 (불변성 유지)
    this.gameState = {
      ...this.gameState,
      generals: this.gameState.generals.map(g =>
        g.id === generalId ? { ...g, troops: newTroops } : g
      ),
    };

    // 시각적 피드백
    if (this.generalRenderer) {
      const container = this.generalRenderer.getContainer(generalId);
      if (container) {
        new DamageFloater(this, container.x, container.y - 20, damage);
      }

      const indicator = this.generalRenderer.getTroopIndicator(generalId);
      if (indicator) {
        indicator.updateWithAnimation(newTroops, getMaxTroops(general.stats.star), false);
      }
    }

    console.log(`[DEBUG] ${general.name}에게 ${damage} 데미지! (${previousTroops} → ${newTroops})`);
  }

  /**
   * 모든 장수 목록 출력
   */
  debugListGenerals(): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    console.log('[DEBUG] 장수 목록:');
    console.table(
      this.gameState.generals.map(g => ({
        id: g.id,
        name: g.name,
        owner: g.owner,
        troops: g.troops,
        star: g.stats.star,
        position: g.position,
      }))
    );
  }

  /**
   * 선택된 장수를 OUT 처리 (시각적 테스트용)
   * Story 4-5 페이드아웃 애니메이션 테스트
   *
   * Note: 게임 로직상 selectedGeneralId는 현재 턴 플레이어의 장수만 설정됨
   * 디버그용으로 selectedTileId 기반으로 장수를 찾음
   */
  debugOut(): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    // 선택된 타일에서 장수 찾기 (턴 제한 없이)
    let general = null;
    if (this.selectedTileId !== null) {
      general = this.gameState.generals.find(
        g => g.position === this.selectedTileId && g.status !== 'out'
      );
    }

    // fallback: gameState의 selectedGeneralId 사용
    if (!general && this.gameState.selectedGeneralId) {
      general = this.gameState.generals.find(g => g.id === this.gameState!.selectedGeneralId);
    }

    if (!general) {
      console.warn('[DEBUG] 장수를 먼저 선택해주세요. (타일을 클릭하세요)');
      console.log('[DEBUG] 또는 ftg.outById("장수ID") 를 사용하세요. ftg.list()로 ID 확인 가능.');
      return;
    }

    if (general.status === 'out') {
      console.warn(`[DEBUG] ${general.name}은(는) 이미 OUT 상태입니다.`);
      return;
    }

    const generalId = general.id;
    const lastPosition = general.position;

    // 게임 상태 업데이트: status='out', troops=0, position=null
    this.gameState = {
      ...this.gameState,
      selectedGeneralId: this.gameState.selectedGeneralId === generalId ? null : this.gameState.selectedGeneralId,
      generals: this.gameState.generals.map(g =>
        g.id === generalId
          ? { ...g, status: 'out' as const, troops: 0, position: null }
          : g
      ),
    };

    // 시각적 처리: 페이드아웃 애니메이션으로 제거
    if (this.generalRenderer) {
      this.generalRenderer.removeGeneral(generalId, true);
    }

    // 선택 상태 초기화
    this.selectedTileId = null;
    this.updateTileVisuals();

    // 이벤트 발행
    this.events.emit('general:deselected', { generalId });
    this.events.emit('general:out', {
      generalId,
      owner: general.owner,
      lastPosition,
    });

    console.log(`[DEBUG] ${general.name} OUT! 페이드아웃 애니메이션 실행 중...`);
  }

  /**
   * 특정 장수 ID를 OUT 처리 (시각적 테스트용)
   * @param generalId - OUT 처리할 장수 ID
   */
  debugOutById(generalId: string): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    const general = this.gameState.generals.find(g => g.id === generalId);
    if (!general) {
      console.warn(`[DEBUG] 장수 ID "${generalId}"를 찾을 수 없습니다.`);
      this.debugListGenerals();
      return;
    }

    if (general.status === 'out') {
      console.warn(`[DEBUG] ${general.name}은(는) 이미 OUT 상태입니다.`);
      return;
    }

    const lastPosition = general.position;
    const wasSelected = this.gameState.selectedGeneralId === generalId;

    // 게임 상태 업데이트
    this.gameState = {
      ...this.gameState,
      selectedGeneralId: wasSelected ? null : this.gameState.selectedGeneralId,
      generals: this.gameState.generals.map(g =>
        g.id === generalId
          ? { ...g, status: 'out' as const, troops: 0, position: null }
          : g
      ),
    };

    // 시각적 처리
    if (this.generalRenderer) {
      this.generalRenderer.removeGeneral(generalId, true);
    }

    // 선택 상태가 해당 장수였으면 초기화
    if (wasSelected) {
      this.selectedTileId = null;
      this.updateTileVisuals();
      this.events.emit('general:deselected', { generalId });
    }

    // 이벤트 발행
    this.events.emit('general:out', {
      generalId,
      owner: general.owner,
      lastPosition,
    });

    console.log(`[DEBUG] ${general.name} OUT! 페이드아웃 애니메이션 실행 중...`);
  }

  /**
   * Story 4-6: 공격 이펙트 테스트 (두 장수 간 공격 시뮬레이션)
   *
   * @param attackerId - 공격자 장수 ID (생략 시 첫 번째 촉 장수)
   * @param defenderId - 방어자 장수 ID (생략 시 첫 번째 위 장수)
   * @param direction - 공격 방향 ('sun' | 'moon' | 'frontline')
   */
  debugAttack(
    attackerId?: string,
    defenderId?: string,
    direction: 'sun' | 'moon' | 'frontline' = 'sun'
  ): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    // 기본값: 첫 player1 장수 -> 첫 player2 장수
    const attacker = attackerId
      ? this.gameState.generals.find(g => g.id === attackerId)
      : this.gameState.generals.find(g => g.owner === 'player1' && g.status === 'active');
    const defender = defenderId
      ? this.gameState.generals.find(g => g.id === defenderId)
      : this.gameState.generals.find(g => g.owner === 'player2' && g.status === 'active');

    if (!attacker || !defender) {
      console.warn('[DEBUG] 공격자 또는 방어자를 찾을 수 없습니다.');
      this.debugListGenerals();
      return;
    }

    if (!attacker.position || !defender.position) {
      console.warn('[DEBUG] 공격자 또는 방어자의 위치가 없습니다.');
      return;
    }

    const attackerCoords = this.boardRenderer?.getTileCenter(attacker.position);
    const defenderCoords = this.boardRenderer?.getTileCenter(defender.position);

    if (!attackerCoords || !defenderCoords) {
      console.warn('[DEBUG] 좌표 계산 실패');
      return;
    }

    console.log(`[DEBUG] 공격 시뮬레이션: ${attacker.name} → ${defender.name} (방향: ${direction})`);

    // 1. 공격 이펙트
    if (this.attackEffect) {
      this.attackEffect.play(
        attackerCoords.x,
        attackerCoords.y,
        defenderCoords.x,
        defenderCoords.y,
        direction,
        () => {
          // 2. 피격 효과
          this.applyHitEffects(defender.id, defender.position!);

          // 3. 데미지 표시
          const damage = Math.floor(Math.random() * 3) + 1;
          const container = this.generalRenderer?.getContainer(defender.id);
          if (container) {
            new DamageFloater(this, container.x, container.y - 20, damage);
          }

          // 4. 병력 감소 (시각적으로만)
          const newTroops = Math.max(0, defender.troops - damage);
          const indicator = this.generalRenderer?.getTroopIndicator(defender.id);
          if (indicator) {
            indicator.updateWithAnimation(newTroops, defender.stats.star, false);
          }

          console.log(`[DEBUG] 피격! ${damage} 데미지 (${defender.troops} → ${newTroops})`);
        }
      );
    }
  }

  /**
   * Story 4-6: 피격 효과만 테스트
   *
   * @param generalId - 대상 장수 ID (생략 시 선택된 장수 또는 첫 장수)
   */
  debugHit(generalId?: string): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    let general = generalId
      ? this.gameState.generals.find(g => g.id === generalId)
      : null;

    // 선택된 타일의 장수 또는 첫 번째 장수
    if (!general && this.selectedTileId) {
      general = this.gameState.generals.find(g => g.position === this.selectedTileId);
    }
    if (!general) {
      general = this.gameState.generals.find(g => g.status === 'active');
    }

    if (!general || !general.position) {
      console.warn('[DEBUG] 대상 장수를 찾을 수 없습니다.');
      return;
    }

    console.log(`[DEBUG] 피격 효과 테스트: ${general.name}`);
    this.applyHitEffects(general.id, general.position);
  }

  /**
   * Story 4-6: 공격 이펙트만 테스트 (방향별 색상 확인)
   *
   * @param direction - 공격 방향 ('sun' | 'moon' | 'frontline')
   */
  debugEffect(direction: 'sun' | 'moon' | 'frontline' = 'sun'): void {
    if (!this.attackEffect) {
      console.warn('[DEBUG] 공격 이펙트 시스템이 초기화되지 않았습니다.');
      return;
    }

    // 화면 중앙에서 시작해서 오른쪽으로 이동
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    console.log(`[DEBUG] 공격 이펙트 테스트 (방향: ${direction})`);
    console.log(`   - sun: 골드 (→ 방향)`);
    console.log(`   - moon: 블루 (← 방향)`);
    console.log(`   - frontline: 화이트 (↑↓ 방향)`);

    this.attackEffect.play(
      centerX - 100,
      centerY,
      centerX + 100,
      centerY,
      direction,
      () => console.log('[DEBUG] 이펙트 완료')
    );
  }

  /**
   * Story 4-6: 사운드 테스트
   *
   * @param type - 사운드 타입 ('attack' | 'defeat')
   */
  debugSound(type: 'attack' | 'defeat' = 'attack'): void {
    if (type === 'attack') {
      console.log('[DEBUG] 공격 사운드 재생');
      this.playAttackSound();
    } else {
      console.log('[DEBUG] OUT 사운드 재생');
      this.playDefeatSound();
    }
  }

  /**
   * Story 4-6: 사운드 ON/OFF 토글
   */
  debugToggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    console.log(`[DEBUG] 사운드: ${this.soundEnabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Story 4-6: 전체 전투 시퀀스 테스트 (공격 → 피격 → 데미지 → OUT)
   */
  debugFullCombat(): void {
    if (!this.gameState) {
      console.warn('[DEBUG] 게임 상태가 없습니다.');
      return;
    }

    const defender = this.gameState.generals.find(g => g.owner === 'player2' && g.status === 'active');
    if (!defender) {
      console.warn('[DEBUG] player2 장수가 없습니다.');
      return;
    }

    console.log(`[DEBUG] 전체 전투 시퀀스: ${defender.name} OUT까지`);
    console.log('   1. 공격 이펙트 → 2. 피격 효과 → 3. 데미지 표시 → 4. OUT');

    // 병력을 1로 설정
    this.gameState = {
      ...this.gameState,
      generals: this.gameState.generals.map(g =>
        g.id === defender.id ? { ...g, troops: 1 } : g
      ),
    };

    const indicator = this.generalRenderer?.getTroopIndicator(defender.id);
    if (indicator) {
      indicator.updateWithAnimation(1, defender.stats.star, false);
    }

    // 1초 후 공격 실행
    this.time.delayedCall(1000, () => {
      this.debugAttack(undefined, defender.id, 'sun');

      // 공격 완료 후 OUT
      this.time.delayedCall(600, () => {
        this.debugOutById(defender.id);
      });
    });
  }

  /**
   * 디버그 도움말 출력
   */
  debugHelp(): void {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║             🎮 오호대장군 디버그 콘솔 명령어                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ▶ 기본 명령어                                                  ║
║  ftg.damage(n)      - 선택된 장수에게 n 데미지 (기본 1)         ║
║  ftg.setTroops(n)   - 선택된 장수의 병력을 n으로 설정           ║
║  ftg.damageById(id, n) - 특정 장수(ID)에게 n 데미지             ║
║  ftg.out()          - 선택된 장수를 OUT 처리 (애니메이션)       ║
║  ftg.outById(id)    - 특정 장수(ID)를 OUT 처리                  ║
║  ftg.list()         - 모든 장수 목록 출력                       ║
║  ftg.help()         - 이 도움말 출력                            ║
║                                                                ║
║  ▶ Story 4-6 전투 피드백 테스트                                 ║
║  ftg.attack()       - 촉→위 공격 시뮬레이션 (이펙트+피격+데미지)  ║
║  ftg.attack(a,d,'moon') - 특정 장수 공격 (방향: sun/moon/frontline)║
║  ftg.hit()          - 피격 효과만 테스트 (흔들림+플래시)         ║
║  ftg.hit('장수ID')  - 특정 장수 피격 효과                        ║
║  ftg.effect('sun')  - 공격 이펙트만 테스트 (sun/moon/frontline)  ║
║  ftg.sound('attack')- 사운드 테스트 (attack/defeat)             ║
║  ftg.toggleSound()  - 사운드 ON/OFF 토글                        ║
║  ftg.fullCombat()   - 전체 전투 시퀀스 (공격→피격→데미지→OUT)   ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  💡 Story 4-6 테스트 순서:                                      ║
║     1. ftg.effect('sun')  - 골드 이펙트 확인                    ║
║     2. ftg.effect('moon') - 블루 이펙트 확인                    ║
║     3. ftg.effect('frontline') - 화이트 이펙트 확인             ║
║     4. ftg.hit()          - 흔들림+타일 플래시 확인              ║
║     5. ftg.attack()       - 전체 공격 피드백 확인                ║
║     6. ftg.fullCombat()   - OUT까지 전체 시퀀스 확인             ║
╚════════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * 현재 게임 상태 반환
   */
  getGameState(): GameState | undefined {
    return this.gameState;
  }

  /**
   * Story 5-4: 타이머 만료 시 자동 턴 종료 핸들러
   *
   * AC1: 타이머 만료 시 자동 턴 종료
   * - 'timer:expired' 이벤트 수신 시 호출
   * - 이미 턴 종료 중이면 무시 (동시 처리 방지)
   * - 진행 중인 행동 취소 후 턴 종료
   *
   * AC4: 동시 처리 방지
   * - isEndingTurn 플래그로 중복 실행 방지
   */
  private handleTimerExpired(): void {
    // AC4: 이미 턴 종료 중이면 무시
    if (this.isEndingTurn) return;

    // Issue #5: 게임 종료 상태에서는 자동 종료 무시
    if (this.gameState?.phase === 'ended') return;

    // 애니메이션 진행 중이면 완료 후 재시도
    if (this.generalRenderer?.getIsAnimating()) {
      this.time.delayedCall(100, () => this.handleTimerExpired());
      return;
    }

    // AC1: 진행 중인 행동 취소
    this.cancelCurrentAction();

    // AC3: 자동 종료 이벤트 발행 (수동 종료와 구분)
    this.events.emit('turn:auto-end', {
      playerId: this.gameState?.currentPlayer,
      turn: this.gameState?.turn,
    });

    // AC1: 턴 종료 실행
    this.executeEndTurn();
  }

  /**
   * Story 5-4: 현재 진행 중인 행동 취소
   *
   * AC1: 현재 진행 중인 행동이 있으면 취소 후 턴 종료
   * - 선택된 장수 해제
   * - 선택된 타일 해제
   * - 이동 가능 타일 하이라이트 해제
   */
  private cancelCurrentAction(): void {
    // 선택된 장수 해제
    if (this.gameState && this.gameState.selectedGeneralId !== null) {
      const previousGeneralId = this.gameState.selectedGeneralId;
      this.gameState = deselectGeneral(this.gameState);
      this.events.emit('general:deselected', {
        generalId: previousGeneralId,
      });
    }

    // 선택된 타일 해제
    this.selectedTileId = null;
    this.hoveredTileId = null;

    // 시각적 하이라이트 해제
    if (this.boardRenderer) {
      this.boardRenderer.clearMovableTiles();
      this.boardRenderer.clearAttackableTiles();
      this.boardRenderer.clearPathPreview();
    }

    // 장수 하이라이트 해제
    if (this.generalRenderer) {
      this.generalRenderer.clearHighlight();
    }
  }

  /**
   * Story 6-1: 노크 행동 실행
   *
   * AC4: 노크 이벤트 발행
   * - 선택된 장수로 executeKnock() 호출
   * - 성공 시 gameState 업데이트
   * - 'knock:success' 이벤트 발행
   * - 노크 이펙트 표시
   *
   * @param generalId - 노크를 수행하는 장수 ID
   */
  handleKnock(generalId: string): void {
    if (!this.gameState) return;

    const general = this.gameState.generals.find(g => g.id === generalId);
    if (!general || general.position === null) return;

    const knockTileId = general.position;
    const result = executeKnock(this.gameState, generalId);

    if (result.success) {
      const { state: newState, knockCount, playerId, victoryResult } = result.data;

      // 게임 상태 업데이트
      this.gameState = newState;

      // Story 6-1 AC4: 'knock:success' 이벤트 발행
      this.events.emit('knock:success', {
        playerId,
        generalId,
        knockCount,
        tileId: knockTileId,
        maxKnockCount: GAME.KNOCK_COUNT_TO_WIN,
      });

      // 노크 후 장수 퇴각 처리 (보드에서 시각적 제거)
      this.generalRenderer?.removeGeneral(generalId, true);

      // Story 6-1 AC6: 노크 이펙트 표시 (황금색 임팩트)
      const tileCoords = this.boardRenderer?.getTileCenter(knockTileId);
      if (tileCoords && this.attackEffect) {
        // 타일 위에서 위쪽으로 확산하는 이펙트 (황금색)
        this.attackEffect.play(
          tileCoords.x,
          tileCoords.y + 15,
          tileCoords.x,
          tileCoords.y - 15,
          'sun', // 황금색 (sun 방향 = 골드 컬러)
          () => {
            // 이펙트 완료 후 타일 플래시
            this.boardRenderer?.flashTile(knockTileId);
          }
        );
      }

      // Story 6-2 AC4: 승리 판정
      if (victoryResult) {
        // 타이머 정지
        this.timerState = { ...this.timerState, isRunning: false };
        // 게임 종료 이벤트 발행
        this.events.emit('game:end', {
          winner: victoryResult.winner,
          reason: victoryResult.reason,
        });
      }

      // 이동/공격 가능 타일 재계산
      this.updateSelectedGeneralHighlights();

      // 시각적 업데이트
      this.updateTileVisuals();
    } else {
      console.warn(`[GameScene] 노크 실패: ${result.error.message}`);
      this.events.emit('action:invalid', {
        reason: result.error.code,
        message: result.error.message,
      });
    }
  }

  /**
   * Story 6-5: 항복 실행
   *
   * AC4: GameScene에 handleSurrender 메서드 추가
   * - executeSurrender() 호출 후 gameState 업데이트
   * - 타이머 정지
   * - 'game:end' 이벤트 발행 (winner, reason: 'surrender')
   * - 기존 handleGameEnd() 로직으로 VictoryBanner 자동 표시
   *
   * @param playerId - 항복을 선언하는 플레이어 ID
   */
  handleSurrender(playerId: PlayerId): void {
    if (!this.gameState) return;

    const result = executeSurrender(this.gameState, playerId);

    if (result.success) {
      const { state: newState, victoryResult } = result.data;

      // 게임 상태 업데이트
      this.gameState = newState;

      // 타이머 정지
      this.timerState = { ...this.timerState, isRunning: false };

      // 게임 종료 이벤트 발행
      this.events.emit('game:end', {
        winner: victoryResult.winner,
        reason: victoryResult.reason,
      });
    }
  }

  /**
   * 턴 종료 실행
   *
   * Story 5-1: 턴 종료 버튼 (Turn End Button)
   * 버튼 클릭 또는 키보드 단축키(Space)로 호출됩니다.
   *
   * AC3: 턴 종료 로직 실행
   * - 현재 플레이어 변경 (player1 <-> player2)
   * - 턴 번호 증가 (player2 -> player1일 때)
   * - 행동 시스템 리셋 (actionsRemaining=3, performedActions=[])
   * - 선택 상태 초기화 (selectedGeneralId=null, turnPhase='select')
   *
   * AC4: 턴 전환 이벤트 및 시각적 피드백
   * - 'turn:end' 이벤트 발행
   * - 'turn:start' 이벤트 발행
   * - 장수 선택 해제 및 하이라이트 제거
   *
   * Story 5-4: 동시 처리 방지
   * - isEndingTurn 플래그로 중복 실행 방지
   */
  executeEndTurn(): void {
    if (!this.gameState) return;

    // Story 5-4 AC4: 이미 턴 종료 중이면 무시 (동시 처리 방지)
    if (this.isEndingTurn) {
      console.log('[GameScene] Turn end already in progress, ignoring');
      return;
    }

    // Issue #5: 게임 종료 상태에서는 턴 종료 불가
    if (this.gameState.phase === 'ended') {
      console.warn('[GameScene] 게임이 이미 종료되어 턴 종료가 불가능합니다.');
      return;
    }

    // Story 5-4 AC4: 턴 종료 시작 플래그 설정
    this.isEndingTurn = true;

    try {
      const previousPlayer = this.gameState.currentPlayer;
      const previousTurn = this.gameState.turn;

      // AC4: 턴 종료 이벤트 발행
      this.events.emit('turn:end', {
        turn: previousTurn,
        playerId: previousPlayer,
      });

      // AC3: 게임 상태 업데이트 (game-core의 endTurn 함수 사용)
      this.gameState = endTurn(this.gameState);

      // Story 5-3 AC3: 턴 전환 시 타이머 리셋
      this.timerState = resetTimer(this.timerState);
      this.lastTickTime = Date.now();

      // AC4: 선택 상태 초기화
      this.selectedTileId = null;
      this.hoveredTileId = null;

      // AC4: 시각적 상태 초기화 (장수 선택 해제 및 하이라이트 제거)
      if (this.boardRenderer) {
        this.boardRenderer.clearMovableTiles();
        this.boardRenderer.clearAttackableTiles();
        this.boardRenderer.clearPathPreview();
      }
      if (this.generalRenderer) {
        this.generalRenderer.clearHighlight();
      }

      // 타일 시각적 상태 업데이트
      this.updateTileVisuals();

      // AC4: 다음 턴 시작 이벤트 발행
      this.events.emit('turn:start', {
        turn: this.gameState.turn,
        playerId: this.gameState.currentPlayer,
      });
    } finally {
      // Story 5-4 AC4: 턴 종료 완료 플래그 해제
      this.isEndingTurn = false;
    }
  }

  /**
   * 씬 종료 시 리소스 정리
   */
  shutdown(): void {
    this.scale.off('resize', this.handleResize, this);
    this.events.off('general:selected', this.handleGeneralSelected, this);
    this.events.off('general:deselected', this.handleGeneralDeselected, this);
    // Story 5-4: 타이머 만료 이벤트 리스너 해제
    this.events.off('timer:expired', this.handleTimerExpired, this);
    this.inputHandler?.destroy();
    this.generalRenderer?.destroy();
    this.boardRenderer?.destroy();
    // W4: 액션 메뉴 정리
    this.actionMenu?.destroy();
    // W5: 이동 확정 버튼 정리
    this.moveConfirmButton?.destroy();
    // W6: 교전 회피 경고 모달 정리
    this.disengageWarningModal?.destroy();
  }

  /**
   * 씬 파괴 시 리소스 정리 (완전한 정리 보장)
   */
  destroy(): void {
    this.shutdown();
  }
}
