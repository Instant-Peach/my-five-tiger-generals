/**
 * Damage Floater
 *
 * 전투 시 피해량을 표시하는 플로팅 텍스트
 * 위로 떠오르며 페이드아웃되는 애니메이션을 제공합니다.
 */

import Phaser from 'phaser';

/**
 * DamageFloater 설정
 */
export interface DamageFloaterConfig {
  /** 폰트 크기 (px) */
  fontSize: number;
  /** 텍스트 색상 (hex string) */
  color: string;
  /** 떠오르는 거리 (px) */
  floatDistance: number;
  /** 애니메이션 지속 시간 (ms) */
  duration: number;
  /** 외곽선 색상 */
  strokeColor: string;
  /** 외곽선 두께 */
  strokeThickness: number;
  /** 애니메이션 건너뛰기 (접근성) */
  skipAnimation: boolean;
}

const DEFAULT_CONFIG: DamageFloaterConfig = {
  fontSize: 18,
  color: '#ff4444',
  floatDistance: 40,
  duration: 800,
  strokeColor: '#000000',
  strokeThickness: 2,
  skipAnimation: false,
};

/**
 * 플로팅 데미지 텍스트 클래스
 *
 * 전투 피해량을 "-N" 형식으로 표시하며,
 * 위로 떠오르면서 점점 사라지는 애니메이션을 제공합니다.
 */
export class DamageFloater {
  private text: Phaser.GameObjects.Text;
  private tween: Phaser.Tweens.Tween | null = null;

  /**
   * DamageFloater 생성자
   *
   * @param scene - Phaser Scene
   * @param x - 시작 x 좌표
   * @param y - 시작 y 좌표
   * @param damage - 표시할 피해량
   * @param config - 선택적 설정
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    damage: number,
    config: Partial<DamageFloaterConfig> = {}
  ) {
    const {
      fontSize,
      color,
      floatDistance,
      duration,
      strokeColor,
      strokeThickness,
      skipAnimation,
    } = { ...DEFAULT_CONFIG, ...config };

    // 텍스트 생성 ("-N" 형식)
    this.text = scene.add.text(x, y, `-${damage}`, {
      fontSize: `${fontSize}px`,
      color,
      fontStyle: 'bold',
      stroke: strokeColor,
      strokeThickness,
    }).setOrigin(0.5);

    // 접근성: 애니메이션 건너뛰기
    if (skipAnimation) {
      // 짧은 시간 표시 후 즉시 제거
      scene.time.delayedCall(300, () => {
        this.destroy();
      });
      return;
    }

    // 떠오르며 페이드아웃 애니메이션
    this.tween = scene.tweens.add({
      targets: this.text,
      y: y - floatDistance,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * 애니메이션이 진행 중인지 확인
   */
  isAnimating(): boolean {
    return this.tween !== null && this.tween.isPlaying();
  }

  /**
   * 리소스 정리
   *
   * 텍스트와 트윈을 정리합니다.
   * 애니메이션 완료 시 자동으로 호출됩니다.
   */
  destroy(): void {
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
    if (this.text) {
      this.text.destroy();
    }
  }
}
