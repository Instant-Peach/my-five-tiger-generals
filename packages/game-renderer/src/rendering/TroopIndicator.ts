/**
 * Troop Indicator
 *
 * 장수 토큰에 표시되는 병력 인디케이터
 * 병력 숫자와 상태별 색상을 표시합니다.
 */

import Phaser from 'phaser';
import {
  getTroopStatus,
  TROOP_COLORS,
  hexToNumber,
  type TroopStatus,
} from '@ftg/game-core';

/** TroopIndicator 설정 */
export interface TroopIndicatorConfig {
  /** 배경 원 반지름 */
  radius: number;
  /** 폰트 크기 */
  fontSize: number;
  /** 색맹 지원 아이콘 표시 여부 */
  showAccessibilityIcon: boolean;
}

const DEFAULT_CONFIG: TroopIndicatorConfig = {
  radius: 12,
  fontSize: 14,
  showAccessibilityIcon: true,
};

/**
 * 병력 인디케이터 클래스
 *
 * 장수 토큰 하단에 배치되어 현재 병력을 표시합니다.
 * 병력 상태에 따라 색상이 변경되며, 변화 시 애니메이션이 재생됩니다.
 */
export class TroopIndicator {
  private scene: Phaser.Scene;
  private config: TroopIndicatorConfig;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Arc;
  private troopText: Phaser.GameObjects.Text;
  private accessibilityIcon: Phaser.GameObjects.Text;
  private currentTroops: number = 0;
  private maxTroops: number = 0;
  private currentStatus: TroopStatus = 'full';
  private baseX: number = 0;
  private baseY: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: Partial<TroopIndicatorConfig> = {}
  ) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseX = x;
    this.baseY = y;
    this.container = scene.add.container(x, y);

    // 배경 원형
    this.background = scene.add.circle(
      0,
      0,
      this.config.radius,
      hexToNumber(TROOP_COLORS.full.primary)
    );
    this.background.setStrokeStyle(1, 0x000000, 0.5);
    this.container.add(this.background);

    // 병력 숫자 텍스트
    this.troopText = scene.add.text(0, 0, '0', {
      fontSize: `${this.config.fontSize}px`,
      fontStyle: 'bold',
      color: TROOP_COLORS.full.text,
    });
    this.troopText.setOrigin(0.5, 0.5);
    this.container.add(this.troopText);

    // 접근성 아이콘 (우측 상단, 색맹 지원)
    this.accessibilityIcon = scene.add.text(
      this.config.radius * 0.7,
      -this.config.radius * 0.7,
      '',
      {
        fontSize: '8px',
      }
    );
    this.accessibilityIcon.setOrigin(0.5, 0.5);
    this.accessibilityIcon.setVisible(this.config.showAccessibilityIcon);
    this.container.add(this.accessibilityIcon);
  }

  /**
   * 병력 업데이트
   *
   * @param troops - 현재 병력
   * @param maxTroops - 최대 병력 (별 스탯)
   * @param animate - 애니메이션 적용 여부 (기본: true)
   */
  update(troops: number, maxTroops: number, animate: boolean = true): void {
    const previousTroops = this.currentTroops;
    const previousStatus = this.currentStatus;

    this.currentTroops = troops;
    this.maxTroops = maxTroops;
    this.currentStatus = getTroopStatus(troops, maxTroops);

    const colors = TROOP_COLORS[this.currentStatus];

    // 텍스트 업데이트
    this.troopText.setText(troops.toString());
    this.troopText.setColor(colors.text);

    // 접근성 아이콘 업데이트
    this.accessibilityIcon.setText(colors.icon);

    // 색상 변경 (애니메이션 또는 즉시)
    if (animate && previousStatus !== this.currentStatus) {
      this.scene.tweens.add({
        targets: this.background,
        fillColor: hexToNumber(colors.primary),
        duration: 200,
        ease: 'Power2',
      });
    } else {
      this.background.setFillStyle(hexToNumber(colors.primary));
    }

    // 병력 변화 애니메이션
    if (animate && previousTroops !== 0 && troops !== previousTroops) {
      this.playChangeAnimation(troops > previousTroops);
    }
  }

  /**
   * 병력 변화 애니메이션
   *
   * @param isIncrease - 증가 여부
   */
  private playChangeAnimation(isIncrease: boolean): void {
    // 기존 tween 정리 후 위치/스케일 복원
    this.scene.tweens.killTweensOf(this.container);
    this.container.setPosition(this.baseX, this.baseY);
    this.container.setScale(1);

    if (isIncrease) {
      // 증가: scale up + 초록 플래시
      this.scene.tweens.add({
        targets: this.container,
        scale: 1.3,
        duration: 150,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.container.setScale(1);
        },
      });
    } else {
      // 감소: shake 애니메이션
      this.scene.tweens.add({
        targets: this.container,
        x: this.baseX + 3,
        duration: 50,
        repeat: 3,
        yoyo: true,
        onComplete: () => {
          this.container.setX(this.baseX);
        },
      });
    }
  }

  /**
   * 현재 병력 상태 반환
   */
  getStatus(): TroopStatus {
    return this.currentStatus;
  }

  /**
   * 현재 병력 수 반환
   */
  getTroops(): number {
    return this.currentTroops;
  }

  /**
   * 최대 병력 수 반환
   */
  getMaxTroops(): number {
    return this.maxTroops;
  }

  /**
   * 컨테이너 반환 (부모 컨테이너에 추가용)
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 위치 설정
   */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
   * 표시/숨김
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * 애니메이션과 함께 병력 업데이트
   *
   * danger 상태 진입 시 강조 효과와 펄스 애니메이션을 제공합니다.
   *
   * @param troops - 새 병력
   * @param maxTroops - 최대 병력 (별 스탯)
   * @param skipAnimation - 애니메이션 건너뛰기 (접근성 지원)
   */
  updateWithAnimation(
    troops: number,
    maxTroops: number,
    skipAnimation: boolean = false
  ): void {
    const previousStatus = this.currentStatus;
    const newStatus = getTroopStatus(troops, maxTroops);

    // 기본 업데이트 (animate: false - 별도 애니메이션 처리)
    this.update(troops, maxTroops, false);

    if (skipAnimation) return;

    // 펄스 애니메이션 (scale 1.0 → 1.3 → 1.0)
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        this.container.setScale(1);
      },
    });

    // danger 상태 진입 시 3회 깜빡임 효과
    if (previousStatus !== 'danger' && newStatus === 'danger') {
      this.playDangerFlash();
    }
  }

  /**
   * danger 상태 진입 시 깜빡임 효과
   *
   * 배경 원이 3회 깜빡여서 위험 상태를 강조합니다.
   */
  private playDangerFlash(): void {
    this.scene.tweens.add({
      targets: this.background,
      alpha: { from: 1, to: 0.3 },
      duration: 150,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.background.setAlpha(1);
      },
    });
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.background);
    this.container.destroy();
  }
}
