/**
 * Boot Scene
 *
 * 게임 에셋 로딩 및 초기화를 담당합니다.
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 로딩 프로그레스 표시
    this.createLoadingUI();

    // Story 4-6: 사운드 에셋 로드
    // 사운드 로드 실패해도 게임은 진행 가능
    this.load.audio('sfx_attack', 'assets/audio/sfx/sfx_attack.mp3');
    this.load.audio('sfx_defeat', 'assets/audio/sfx/sfx_defeat.mp3');

    // 로드 실패 시 경고만 출력 (에러로 게임 중단 방지)
    this.load.on('loaderror', (file: { key: string }) => {
      console.warn(`[BootScene] Failed to load asset: ${file.key}`);
    });
  }

  create(): void {
    // GameScene으로 전환
    this.scene.start('GameScene');
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // 로딩 텍스트
    this.add
      .text(centerX, centerY, 'Loading...', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // 프로그레스 바 배경
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x333333);
    progressBg.fillRect(centerX - 150, centerY + 30, 300, 20);

    // 프로그레스 바
    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xc9302c);
      progressBar.fillRect(centerX - 148, centerY + 32, 296 * value, 16);
    });
  }
}
