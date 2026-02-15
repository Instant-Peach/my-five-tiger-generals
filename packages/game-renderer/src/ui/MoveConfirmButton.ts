/**
 * MoveConfirmButton
 *
 * 이동 미리보기 후 확정하는 버튼.
 * 선택한 타일 근처에 "확정" 버튼을 표시합니다.
 */
import Phaser from 'phaser';

export class MoveConfirmButton {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private confirmCallback?: () => void;
  private visible: boolean = false;

  private static readonly BUTTON_WIDTH = 56;
  private static readonly BUTTON_HEIGHT = 22;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(101); // 액션 메뉴보다 위
    this.container.setVisible(false);
  }

  show(x: number, y: number): void {
    // 기존 내용 제거
    this.container.removeAll(true);

    // 배경
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x228822, 0.95);
    bg.fillRect(-MoveConfirmButton.BUTTON_WIDTH / 2, 0, MoveConfirmButton.BUTTON_WIDTH, MoveConfirmButton.BUTTON_HEIGHT);
    bg.lineStyle(1, 0x44aa44, 1);
    bg.strokeRect(-MoveConfirmButton.BUTTON_WIDTH / 2, 0, MoveConfirmButton.BUTTON_WIDTH, MoveConfirmButton.BUTTON_HEIGHT);
    this.container.add(bg);

    // 텍스트
    const text = this.scene.add.text(0, MoveConfirmButton.BUTTON_HEIGHT / 2, '확정', {
      fontSize: '11px',
      color: '#e0d8c0',
      fontFamily: '"DungGeunMo", monospace',
      align: 'center',
    });
    text.setOrigin(0.5, 0.5);
    this.container.add(text);

    // 인터랙션
    const hitArea = this.scene.add.rectangle(
      0,
      MoveConfirmButton.BUTTON_HEIGHT / 2,
      MoveConfirmButton.BUTTON_WIDTH,
      MoveConfirmButton.BUTTON_HEIGHT,
      0xffffff, 0
    );
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x33aa33, 0.95);
      bg.fillRect(-MoveConfirmButton.BUTTON_WIDTH / 2, 0, MoveConfirmButton.BUTTON_WIDTH, MoveConfirmButton.BUTTON_HEIGHT);
      bg.lineStyle(1, 0xffd700, 1);
      bg.strokeRect(-MoveConfirmButton.BUTTON_WIDTH / 2, 0, MoveConfirmButton.BUTTON_WIDTH, MoveConfirmButton.BUTTON_HEIGHT);
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x228822, 0.95);
      bg.fillRect(-MoveConfirmButton.BUTTON_WIDTH / 2, 0, MoveConfirmButton.BUTTON_WIDTH, MoveConfirmButton.BUTTON_HEIGHT);
      bg.lineStyle(1, 0x44aa44, 1);
      bg.strokeRect(-MoveConfirmButton.BUTTON_WIDTH / 2, 0, MoveConfirmButton.BUTTON_WIDTH, MoveConfirmButton.BUTTON_HEIGHT);
    });
    hitArea.on('pointerdown', () => {
      this.confirmCallback?.();
    });
    this.container.add(hitArea);

    this.container.setPosition(x, y + 15); // 타일 아래에 표시
    this.container.setVisible(true);
    this.visible = true;
  }

  hide(): void {
    this.container.setVisible(false);
    this.container.removeAll(true);
    this.visible = false;
  }

  isVisible(): boolean {
    return this.visible;
  }

  onConfirm(callback: () => void): void {
    this.confirmCallback = callback;
  }

  destroy(): void {
    this.hide();
    this.container.destroy();
  }
}
