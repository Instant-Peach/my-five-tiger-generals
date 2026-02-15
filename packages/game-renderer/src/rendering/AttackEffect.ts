/**
 * Attack Effect
 *
 * 공격 시 시각적 이펙트를 제공합니다.
 * 공격자 위치에서 방어자 위치로 이동하는 원형 이펙트를 표시합니다.
 *
 * Story 4-6: 전투 피드백 (Combat Feedback)
 */

import Phaser from 'phaser';
import type { AttackDirection } from '@ftg/game-core';

/**
 * 방향별 이펙트 색상
 *
 * sun: 황금색 (골드)
 * moon: 파란색 (로열블루)
 * frontline: 흰색
 */
const EFFECT_COLORS: Record<AttackDirection, number> = {
  sun: 0xffd700,      // 골드
  moon: 0x4169e1,     // 로열블루
  frontline: 0xffffff, // 화이트
};

/**
 * 공격 이펙트 설정
 */
export interface AttackEffectConfig {
  /** 이펙트 반지름 */
  radius: number;
  /** 이펙트 초기 투명도 */
  alpha: number;
  /** 애니메이션 지속 시간 (ms) */
  duration: number;
  /** 최종 스케일 배율 */
  finalScale: number;
  /** 최종 투명도 */
  finalAlpha: number;
  /** 렌더링 깊이 */
  depth: number;
}

const DEFAULT_CONFIG: AttackEffectConfig = {
  radius: 15,
  alpha: 0.8,
  duration: 250,
  finalScale: 1.5,
  finalAlpha: 0.3,
  depth: 100,
};

/**
 * 공격 이펙트 클래스
 *
 * 공격자 위치에서 방어자 위치로 이동하는 시각 효과를 제공합니다.
 * 방향에 따라 색상이 달라집니다:
 * - sun (해): 황금색/주황색
 * - moon (달): 은색/파란색
 * - frontline (전선): 흰색/회색
 */
export class AttackEffect {
  private scene: Phaser.Scene;
  private config: AttackEffectConfig;

  constructor(scene: Phaser.Scene, config: Partial<AttackEffectConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 공격 이펙트 재생
   *
   * 공격자 위치에서 방어자 위치로 원형 이펙트가 이동하며,
   * 이동 중 크기가 커지고 투명해집니다.
   *
   * @param fromX - 공격자 X 좌표
   * @param fromY - 공격자 Y 좌표
   * @param toX - 방어자 X 좌표
   * @param toY - 방어자 Y 좌표
   * @param direction - 공격 방향 (sun/moon/frontline)
   * @param onComplete - 이펙트 완료 콜백
   */
  play(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    direction: AttackDirection,
    onComplete?: () => void
  ): void {
    const color = EFFECT_COLORS[direction];
    const { radius, alpha, duration, finalScale, finalAlpha, depth } = this.config;

    // 원형 이펙트 생성
    const effect = this.scene.add.circle(fromX, fromY, radius, color, alpha);
    effect.setDepth(depth);

    // 공격자 → 방어자로 이동하는 트윈
    this.scene.tweens.add({
      targets: effect,
      x: toX,
      y: toY,
      scaleX: finalScale,
      scaleY: finalScale,
      alpha: finalAlpha,
      duration,
      ease: 'Power2',
      onComplete: () => {
        effect.destroy();
        onComplete?.();
      },
    });
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<AttackEffectConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
