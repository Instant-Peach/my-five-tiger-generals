/**
 * General Renderer
 *
 * 장수를 보드 위에 렌더링합니다.
 */

import Phaser from 'phaser';
import type { General, TileId } from '@ftg/game-core';
import { getPlayerColor, getMaxTroops, hexToNumber } from '@ftg/game-core';
import { TroopIndicator } from './TroopIndicator';
import { MOVEMENT_ANIMATION } from '../constants/animation';

/**
 * 장수 렌더링 설정
 */
export interface GeneralRenderConfig {
  /** 토큰 반지름 */
  tokenRadius: number;
  /** 테두리 두께 */
  strokeWidth: number;
  /** 테두리 색상 */
  strokeColor: number;
  /** 폰트 크기 */
  fontSize: number;
  /** 병력 표시 폰트 크기 */
  troopsFontSize: number;
}

const DEFAULT_CONFIG: GeneralRenderConfig = {
  tokenRadius: 20,
  strokeWidth: 2,
  strokeColor: 0xffffff,
  fontSize: 16,
  troopsFontSize: 12,
};

/** 하이라이트 링 색상 (노란색) */
const HIGHLIGHT_COLOR = 0xffff00;

/**
 * 타일 중앙 좌표를 가져오는 함수 타입
 */
export type GetTileCenterFn = (tileId: TileId) => { x: number; y: number };

/**
 * 이동 애니메이션 옵션
 *
 * @property duration - 애니메이션 지속 시간 (ms). 기본값: 250ms
 * @property ease - Phaser 이징 함수 이름. 기본값: 'Power2'
 *                  사용 가능한 값: 'Linear', 'Power1', 'Power2', 'Power3', 'Power4',
 *                  'Sine', 'Expo', 'Circ', 'Back', 'Bounce', 'Elastic' 등
 * @property onComplete - 애니메이션 완료 후 호출되는 콜백
 * @property skipAnimation - true면 애니메이션 없이 즉시 이동 (접근성 지원)
 */
export interface MoveAnimationOptions {
  /** 애니메이션 지속 시간 (ms). 기본값: 250ms */
  duration?: number;
  /** Phaser 이징 함수 이름. 기본값: 'Power2' */
  ease?: string;
  /** 애니메이션 완료 후 호출되는 콜백 */
  onComplete?: () => void;
  /** 애니메이션 건너뛰기 (접근성 지원) */
  skipAnimation?: boolean;
}

export class GeneralRenderer {
  private scene: Phaser.Scene;
  private config: GeneralRenderConfig;
  private containers: Map<string, Phaser.GameObjects.Container> = new Map();
  private troopIndicators: Map<string, TroopIndicator> = new Map();
  private getTileCenter: GetTileCenterFn;
  private highlightedGeneralId: string | null = null;
  private highlightGraphics: Phaser.GameObjects.Graphics | null = null;
  private selectedGeneralId: string | null = null;
  private selectedOutline: Phaser.GameObjects.Graphics | null = null;
  /** 애니메이션 진행 중 여부 */
  private isAnimating: boolean = false;
  /** 현재 이동 애니메이션 중인 장수 ID */
  private animatingGeneralId: string | null = null;
  /** 현재 이동 Tween 참조 (정리용) */
  private moveTween: Phaser.Tweens.Tween | null = null;
  /** W7: 교전 인디케이터 Map */
  private engagedIndicators: Map<string, Phaser.GameObjects.Graphics> = new Map();

  constructor(
    scene: Phaser.Scene,
    getTileCenter: GetTileCenterFn,
    config: Partial<GeneralRenderConfig> = {}
  ) {
    this.scene = scene;
    this.getTileCenter = getTileCenter;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<GeneralRenderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 단일 장수 렌더링
   *
   * @param general - 렌더링할 장수
   */
  renderGeneral(general: General): void {
    // position이 null이면 렌더링하지 않음
    if (general.position === null) {
      this.removeGeneral(general.id);
      return;
    }

    // 기존 스프라이트 제거
    this.removeGeneral(general.id);

    // 타일 중앙 좌표 획득
    const { x, y } = this.getTileCenter(general.position);

    // 컨테이너 생성 (장수 토큰 + 이니셜 + 병력 표시)
    const container = this.scene.add.container(x, y);

    // 장수 토큰 (원형 플레이스홀더) - game-core 색상 사용
    const playerColor = getPlayerColor(general.owner);
    const token = this.scene.add.circle(
      0,
      0,
      this.config.tokenRadius,
      hexToNumber(playerColor.primary)
    );
    token.setStrokeStyle(this.config.strokeWidth, this.config.strokeColor);

    // 장수 이니셜 (한글 이름 첫 글자)
    const initial = this.scene.add
      .text(0, 0, general.nameKo.charAt(0), {
        fontSize: `${this.config.fontSize}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 플레이어 아이콘 (색맹 지원 - 토큰 우측 상단)
    const iconText = playerColor.icon === 'shield' ? '🛡️' : '⚔️';
    const playerIcon = this.scene.add
      .text(this.config.tokenRadius * 0.6, -this.config.tokenRadius * 0.6, iconText, {
        fontSize: '10px',
      })
      .setOrigin(0.5);

    // 병력 인디케이터 (토큰 하단 중앙)
    const troopIndicator = new TroopIndicator(
      this.scene,
      0,
      this.config.tokenRadius + 12,
      {
        radius: 10,
        fontSize: this.config.troopsFontSize,
        showAccessibilityIcon: true,
      }
    );
    troopIndicator.update(general.troops, getMaxTroops(general.stats.star), false);

    container.add([token, initial, playerIcon, troopIndicator.getContainer()]);
    this.containers.set(general.id, container);
    this.troopIndicators.set(general.id, troopIndicator);
  }

  /**
   * 특정 장수 제거
   *
   * Story 4-5: OUT 처리 시 애니메이션 지원
   *
   * @param generalId - 제거할 장수 ID
   * @param animate - 애니메이션 여부 (기본 false, OUT 처리 시 true)
   */
  removeGeneral(generalId: string, animate: boolean = false): void {
    const container = this.containers.get(generalId);

    // 제거되는 장수가 하이라이트되어 있으면 하이라이트도 제거
    if (this.highlightedGeneralId === generalId) {
      this.clearHighlight();
    }

    // 선택 상태도 해제
    if (this.selectedGeneralId === generalId) {
      this.clearSelection();
    }

    // W7: 교전 인디케이터도 제거
    this.clearEngagedIndicator(generalId);

    if (!container) {
      // 컨테이너가 없으면 인디케이터만 정리
      const indicator = this.troopIndicators.get(generalId);
      if (indicator) {
        indicator.destroy();
        this.troopIndicators.delete(generalId);
      }
      return;
    }

    if (animate) {
      // Story 4-5: 페이드아웃 + 스케일 축소 애니메이션
      this.scene.tweens.add({
        targets: container,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          // TroopIndicator 제거
          const indicator = this.troopIndicators.get(generalId);
          if (indicator) {
            indicator.destroy();
            this.troopIndicators.delete(generalId);
          }

          container.destroy();
          this.containers.delete(generalId);
        },
      });
    } else {
      // 즉시 제거 (기존 동작)
      const indicator = this.troopIndicators.get(generalId);
      if (indicator) {
        indicator.destroy();
        this.troopIndicators.delete(generalId);
      }

      container.destroy();
      this.containers.delete(generalId);
    }
  }

  /**
   * 모든 장수 렌더링
   *
   * @param generals - 장수 배열
   */
  renderAllGenerals(generals: General[]): void {
    for (const general of generals) {
      if ((general.status === 'active' || general.status === 'engaged') && general.position !== null) {
        this.renderGeneral(general);
        // W7: 교전 상태 인디케이터 관리
        if (general.status === 'engaged') {
          this.showEngagedIndicator(general.id);
        } else {
          this.clearEngagedIndicator(general.id);
        }
      } else {
        this.removeGeneral(general.id);
        this.clearEngagedIndicator(general.id);
      }
    }
  }

  /**
   * 장수 위치 업데이트 (즉시 이동, 애니메이션 없음)
   *
   * @param generalId - 장수 ID
   * @param newPosition - 새 타일 위치
   */
  updatePosition(generalId: string, newPosition: TileId): void {
    const container = this.containers.get(generalId);
    if (container && newPosition !== null) {
      const { x, y } = this.getTileCenter(newPosition);
      container.setPosition(x, y);
    }
  }

  /**
   * 애니메이션 진행 중 여부 반환
   */
  getIsAnimating(): boolean {
    return this.isAnimating;
  }

  /**
   * 장수 애니메이션 이동
   *
   * @param generalId - 장수 ID
   * @param toTileId - 목적지 타일 ID
   * @param options - 애니메이션 옵션
   * @returns 애니메이션 시작 성공 여부
   */
  animateMoveTo(
    generalId: string,
    toTileId: TileId,
    options: MoveAnimationOptions = {}
  ): boolean {
    // 이미 애니메이션 중이면 무시 (동일 장수 이중 이동 방지)
    if (this.isAnimating) {
      console.warn(`[GeneralRenderer] Animation already in progress for ${this.animatingGeneralId}`);
      return false;
    }

    const container = this.containers.get(generalId);
    if (!container) {
      console.warn(`[GeneralRenderer] Container not found for ${generalId}`);
      return false;
    }

    const { x: targetX, y: targetY } = this.getTileCenter(toTileId);

    const {
      duration = MOVEMENT_ANIMATION.DURATION,
      ease = MOVEMENT_ANIMATION.EASE,
      onComplete,
      skipAnimation = false,
    } = options;

    // 접근성: 애니메이션 건너뛰기
    if (skipAnimation) {
      container.setPosition(targetX, targetY);
      onComplete?.();
      return true;
    }

    // 애니메이션 시작
    this.isAnimating = true;
    this.animatingGeneralId = generalId;

    // 기존 Tween이 있으면 정리
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = null;
    }

    this.moveTween = this.scene.tweens.add({
      targets: container,
      x: targetX,
      y: targetY,
      duration,
      ease,
      onComplete: () => {
        this.cleanupMoveTween();
        onComplete?.();
      },
    });

    return true;
  }

  /**
   * 이동 Tween 정리 (내부용)
   */
  private cleanupMoveTween(): void {
    this.isAnimating = false;
    this.animatingGeneralId = null;
    this.moveTween = null;
  }

  /**
   * 현재 애니메이션 중인 장수 ID 반환
   */
  getAnimatingGeneralId(): string | null {
    return this.animatingGeneralId;
  }

  /**
   * 장수 병력 업데이트
   *
   * @param generalId - 장수 ID
   * @param troops - 새 병력 수
   * @param maxTroops - 최대 병력 수 (별 스탯)
   */
  updateTroops(generalId: string, troops: number, maxTroops: number): void {
    const indicator = this.troopIndicators.get(generalId);
    if (indicator) {
      indicator.update(troops, maxTroops);
    }
  }

  /**
   * 모든 장수 스프라이트 정리
   */
  clear(): void {
    // W7: 교전 인디케이터 정리
    this.clearAllEngagedIndicators();

    for (const indicator of this.troopIndicators.values()) {
      indicator.destroy();
    }
    this.troopIndicators.clear();

    for (const container of this.containers.values()) {
      container.destroy();
    }
    this.containers.clear();
  }

  /**
   * 장수 하이라이트 표시
   *
   * @param generalId - 하이라이트할 장수 ID
   */
  highlightGeneral(generalId: string): void {
    // 기존 하이라이트 제거
    this.clearHighlight();

    // 장수 컨테이너 찾기
    const container = this.containers.get(generalId);
    if (!container) return;

    // 하이라이트 링 생성 (노란색 원형 테두리)
    const highlight = this.scene.add.graphics();
    highlight.lineStyle(4, HIGHLIGHT_COLOR, 1); // 노란색, 두께 4
    highlight.strokeCircle(0, 0, this.config.tokenRadius + 8); // 반지름 = 토큰 + 여유

    // 맥동 애니메이션
    this.scene.tweens.add({
      targets: highlight,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // 컨테이너에 추가
    container.addAt(highlight, 0); // 토큰 뒤에 배치
    highlight.setDepth(-1);

    this.highlightedGeneralId = generalId;
    this.highlightGraphics = highlight;
  }

  /**
   * 하이라이트 제거
   */
  clearHighlight(): void {
    if (this.highlightGraphics) {
      // 애니메이션 중지
      this.scene.tweens.killTweensOf(this.highlightGraphics);
      this.highlightGraphics.destroy();
      this.highlightGraphics = null;
    }
    this.highlightedGeneralId = null;
  }

  /**
   * 현재 하이라이트된 장수 ID 반환
   */
  getHighlightedGeneralId(): string | null {
    return this.highlightedGeneralId;
  }

  /**
   * 장수 선택 상태 설정 (색상 하이라이트)
   *
   * @param generalId - 장수 ID
   * @param isSelected - 선택 여부
   * @param owner - 장수 소유자 (색상 조회용)
   */
  setGeneralSelected(generalId: string, isSelected: boolean, owner: 'player1' | 'player2'): void {
    const container = this.containers.get(generalId);
    if (!container) return;

    const playerColor = getPlayerColor(owner);

    if (isSelected) {
      // 기존 선택 해제
      this.clearSelection();

      // 토큰 색상을 highlight 색상으로 변경 (index 0 = token)
      const token = container.getAt(0) as Phaser.GameObjects.Arc;
      if (token) {
        this.scene.tweens.add({
          targets: token,
          fillColor: hexToNumber(playerColor.highlight),
          duration: 200,
          ease: 'Power2',
        });
      }

      // 외곽선 추가 (흰색 glow)
      const outline = this.scene.add.graphics();
      outline.lineStyle(3, 0xffffff, 0.8);
      outline.strokeCircle(0, 0, this.config.tokenRadius + 4);
      container.addAt(outline, 0); // 토큰 뒤에 추가

      this.selectedGeneralId = generalId;
      this.selectedOutline = outline;
    } else {
      // 선택 해제 시: 원래 색상으로 복귀 (index 0 = token)
      const token = container.getAt(0) as Phaser.GameObjects.Arc;
      if (token) {
        this.scene.tweens.add({
          targets: token,
          fillColor: hexToNumber(playerColor.primary),
          duration: 200,
          ease: 'Power2',
        });
      }

      // 외곽선 제거
      if (this.selectedOutline && this.selectedGeneralId === generalId) {
        this.selectedOutline.destroy();
        this.selectedOutline = null;
        this.selectedGeneralId = null;
      }
    }
  }

  /**
   * 선택 상태 제거
   */
  clearSelection(): void {
    if (this.selectedGeneralId && this.selectedOutline) {
      const container = this.containers.get(this.selectedGeneralId);
      if (container) {
        // 원래 색상 복원 필요 시 여기서 처리 (index 0 = token)
        const general = this.getGeneralFromContainer(this.selectedGeneralId);
        if (general) {
          const token = container.getAt(0) as Phaser.GameObjects.Arc;
          const playerColor = getPlayerColor(general.owner);
          if (token) {
            token.setFillStyle(hexToNumber(playerColor.primary));
          }
        }
      }
      this.selectedOutline.destroy();
      this.selectedOutline = null;
      this.selectedGeneralId = null;
    }
  }

  /**
   * 컨테이너에서 장수 owner 조회 헬퍼 (내부용)
   */
  private getGeneralFromContainer(_generalId: string): { owner: 'player1' | 'player2' } | null {
    // Note: 실제로는 gameState에서 조회해야 하지만,
    // 여기서는 간단히 generalId에서 player 정보를 추론
    // 실제 구현에서는 GameScene에서 general 정보를 전달받아야 함
    return null;
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    // W7: 교전 인디케이터 정리
    this.clearAllEngagedIndicators();

    // 이동 Tween 정리
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = null;
    }
    this.isAnimating = false;
    this.animatingGeneralId = null;

    this.clearHighlight();
    this.clearSelection();
    this.clear();
  }

  /**
   * 특정 장수 컨테이너 반환 (테스트/디버그용)
   */
  getContainer(generalId: string): Phaser.GameObjects.Container | undefined {
    return this.containers.get(generalId);
  }

  /**
   * 장수 스프라이트 흔들림 효과
   *
   * 피격 시 좌우로 짧게 흔들리는 효과를 제공합니다.
   *
   * Story 4-6: 전투 피드백 (Combat Feedback)
   *
   * @param generalId - 흔들릴 장수 ID
   * @param intensity - 흔들림 강도 (px). 기본값: 5
   * @param duration - 단일 흔들림 지속 시간 (ms). 기본값: 50
   * @param repeat - 반복 횟수. 기본값: 3
   */
  shakeGeneral(
    generalId: string,
    intensity: number = 5,
    duration: number = 50,
    repeat: number = 3
  ): void {
    const container = this.containers.get(generalId);
    if (!container) return;

    const originalX = container.x;

    // 좌우 흔들림 시퀀스
    this.scene.tweens.add({
      targets: container,
      x: originalX - intensity,
      duration,
      yoyo: true,
      repeat,
      ease: 'Linear',
      onComplete: () => {
        container.x = originalX; // 원래 위치로 복귀
      },
    });
  }

  /**
   * 특정 장수의 TroopIndicator 반환
   *
   * @param generalId - 장수 ID
   * @returns TroopIndicator 인스턴스 또는 undefined
   */
  getTroopIndicator(generalId: string): TroopIndicator | undefined {
    return this.troopIndicators.get(generalId);
  }

  /**
   * W7: 교전 인디케이터 표시 (빨간색 맥동 글로우 링)
   */
  showEngagedIndicator(generalId: string): void {
    this.clearEngagedIndicator(generalId);
    const container = this.containers.get(generalId);
    if (!container) return;

    const indicator = this.scene.add.graphics();
    indicator.lineStyle(3, 0xff4444, 0.8); // 빨간색
    indicator.strokeCircle(0, 0, this.config.tokenRadius + 6);

    // 맥동 애니메이션
    this.scene.tweens.add({
      targets: indicator,
      alpha: { from: 0.8, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    container.addAt(indicator, 0); // 토큰 뒤에 배치
    this.engagedIndicators.set(generalId, indicator);
  }

  /**
   * W7: 교전 인디케이터 제거
   */
  clearEngagedIndicator(generalId: string): void {
    const indicator = this.engagedIndicators.get(generalId);
    if (indicator) {
      this.scene.tweens.killTweensOf(indicator);
      indicator.destroy();
      this.engagedIndicators.delete(generalId);
    }
  }

  /**
   * W7: 모든 교전 인디케이터 제거
   */
  clearAllEngagedIndicators(): void {
    for (const [generalId] of this.engagedIndicators) {
      this.clearEngagedIndicator(generalId);
    }
  }
}
