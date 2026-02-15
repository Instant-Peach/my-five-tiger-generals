/**
 * GeneralActionMenu
 *
 * 장수 선택 시 토큰 근처에 표시되는 액션 메뉴.
 * [이동][공격][노크] 버튼을 제공합니다.
 * 키보드 단축키: 1=이동, 2=공격, 3=노크
 */
import Phaser from 'phaser';

export type ActionType = 'move' | 'attack' | 'knock';

interface ActionButtonConfig {
  action: ActionType;
  label: string;
  shortcutKey: string;
  enabled: boolean;
}

export interface ActionMenuOptions {
  moveEnabled: boolean;
  attackEnabled: boolean;
  knockEnabled: boolean;
}

export class GeneralActionMenu {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private buttons: Map<ActionType, Phaser.GameObjects.Container> = new Map();
  private actionCallback?: (action: ActionType) => void;
  private visible: boolean = false;

  // 스타일 상수
  private static readonly BUTTON_WIDTH = 64;
  private static readonly BUTTON_HEIGHT = 24;
  private static readonly BUTTON_GAP = 4;
  private static readonly BG_COLOR = 0x1e1e3a;
  private static readonly BG_BORDER_COLOR = 0x4a4a6a;
  private static readonly TEXT_COLOR = '#e0d8c0';
  private static readonly ACTIVE_COLOR = 0x3a3a5c;
  private static readonly DISABLED_COLOR = 0x151530;
  private static readonly DISABLED_TEXT_COLOR = '#555566';
  private static readonly HIGHLIGHT_COLOR = 0xffd700;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(100); // 다른 렌더링 위에 표시
    this.container.setVisible(false);
  }

  /**
   * 메뉴 표시
   */
  show(x: number, y: number, options: ActionMenuOptions): void {
    // 기존 버튼 정리
    this.clearButtons();

    const configs: ActionButtonConfig[] = [
      { action: 'move', label: '[1] 이동', shortcutKey: 'ONE', enabled: options.moveEnabled },
      { action: 'attack', label: '[2] 공격', shortcutKey: 'TWO', enabled: options.attackEnabled },
      { action: 'knock', label: '[3] 노크', shortcutKey: 'THREE', enabled: options.knockEnabled },
    ];

    // 메뉴 배경 계산
    const totalHeight = configs.length * (GeneralActionMenu.BUTTON_HEIGHT + GeneralActionMenu.BUTTON_GAP) - GeneralActionMenu.BUTTON_GAP + 8; // 8 = padding
    const menuWidth = GeneralActionMenu.BUTTON_WIDTH + 8; // 8 = padding

    // 배경 그리기
    const bg = this.scene.add.graphics();
    bg.fillStyle(GeneralActionMenu.BG_COLOR, 0.95);
    bg.fillRect(-menuWidth / 2, -4, menuWidth, totalHeight);
    bg.lineStyle(1, GeneralActionMenu.BG_BORDER_COLOR, 1);
    bg.strokeRect(-menuWidth / 2, -4, menuWidth, totalHeight);
    this.container.add(bg);

    // 버튼 생성
    configs.forEach((config, index) => {
      const btnContainer = this.createButton(config, index);
      this.container.add(btnContainer);
      this.buttons.set(config.action, btnContainer);
    });

    // 위치 설정 (장수 토큰 위에 표시)
    // 화면 밖으로 나가지 않도록 조정
    const cam = this.scene.cameras.main;
    let menuX = x;
    let menuY = y - 40; // 토큰 위로 오프셋

    // 화면 위쪽 밖으로 나가면 아래로
    if (menuY - totalHeight < cam.scrollY) {
      menuY = y + 30; // 토큰 아래로
    }

    // 화면 좌우 경계 체크
    const halfWidth = menuWidth / 2;
    if (menuX - halfWidth < cam.scrollX) {
      menuX = cam.scrollX + halfWidth + 4;
    } else if (menuX + halfWidth > cam.scrollX + cam.width) {
      menuX = cam.scrollX + cam.width - halfWidth - 4;
    }

    this.container.setPosition(menuX, menuY);
    this.container.setVisible(true);
    this.visible = true;
  }

  /**
   * 메뉴 숨기기
   */
  hide(): void {
    this.container.setVisible(false);
    this.visible = false;
    this.clearButtons();
  }

  /**
   * 메뉴 표시 여부
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * 액션 콜백 등록
   */
  onAction(callback: (action: ActionType) => void): void {
    this.actionCallback = callback;
  }

  /**
   * 키보드 단축키로 액션 트리거
   */
  triggerAction(action: ActionType): void {
    const btn = this.buttons.get(action);
    if (btn && btn.getData('enabled')) {
      this.actionCallback?.(action);
    }
  }

  /**
   * 정리
   */
  destroy(): void {
    this.clearButtons();
    this.container.destroy();
  }

  private createButton(config: ActionButtonConfig, index: number): Phaser.GameObjects.Container {
    const y = index * (GeneralActionMenu.BUTTON_HEIGHT + GeneralActionMenu.BUTTON_GAP);
    const btnContainer = this.scene.add.container(0, y);

    // 버튼 배경
    const bg = this.scene.add.graphics();
    const bgColor = config.enabled ? GeneralActionMenu.ACTIVE_COLOR : GeneralActionMenu.DISABLED_COLOR;
    bg.fillStyle(bgColor, 1);
    bg.fillRect(
      -GeneralActionMenu.BUTTON_WIDTH / 2,
      0,
      GeneralActionMenu.BUTTON_WIDTH,
      GeneralActionMenu.BUTTON_HEIGHT
    );
    bg.lineStyle(1, GeneralActionMenu.BG_BORDER_COLOR, 1);
    bg.strokeRect(
      -GeneralActionMenu.BUTTON_WIDTH / 2,
      0,
      GeneralActionMenu.BUTTON_WIDTH,
      GeneralActionMenu.BUTTON_HEIGHT
    );
    btnContainer.add(bg);

    // 버튼 텍스트
    const textColor = config.enabled ? GeneralActionMenu.TEXT_COLOR : GeneralActionMenu.DISABLED_TEXT_COLOR;
    const text = this.scene.add.text(0, GeneralActionMenu.BUTTON_HEIGHT / 2, config.label, {
      fontSize: '11px',
      color: textColor,
      fontFamily: '"DungGeunMo", monospace',
      align: 'center',
    });
    text.setOrigin(0.5, 0.5);
    btnContainer.add(text);

    // 인터랙션 영역 (투명 직사각형)
    if (config.enabled) {
      const hitArea = this.scene.add.rectangle(
        0,
        GeneralActionMenu.BUTTON_HEIGHT / 2,
        GeneralActionMenu.BUTTON_WIDTH,
        GeneralActionMenu.BUTTON_HEIGHT,
        0xffffff,
        0 // 투명
      );
      hitArea.setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(GeneralActionMenu.HIGHLIGHT_COLOR, 0.3);
        bg.fillRect(
          -GeneralActionMenu.BUTTON_WIDTH / 2,
          0,
          GeneralActionMenu.BUTTON_WIDTH,
          GeneralActionMenu.BUTTON_HEIGHT
        );
        bg.lineStyle(1, GeneralActionMenu.HIGHLIGHT_COLOR, 1);
        bg.strokeRect(
          -GeneralActionMenu.BUTTON_WIDTH / 2,
          0,
          GeneralActionMenu.BUTTON_WIDTH,
          GeneralActionMenu.BUTTON_HEIGHT
        );
      });

      hitArea.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(GeneralActionMenu.ACTIVE_COLOR, 1);
        bg.fillRect(
          -GeneralActionMenu.BUTTON_WIDTH / 2,
          0,
          GeneralActionMenu.BUTTON_WIDTH,
          GeneralActionMenu.BUTTON_HEIGHT
        );
        bg.lineStyle(1, GeneralActionMenu.BG_BORDER_COLOR, 1);
        bg.strokeRect(
          -GeneralActionMenu.BUTTON_WIDTH / 2,
          0,
          GeneralActionMenu.BUTTON_WIDTH,
          GeneralActionMenu.BUTTON_HEIGHT
        );
      });

      hitArea.on('pointerdown', () => {
        this.actionCallback?.(config.action);
      });

      btnContainer.add(hitArea);
    }

    btnContainer.setData('enabled', config.enabled);
    return btnContainer;
  }

  private clearButtons(): void {
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons.clear();
    // 컨테이너 내 모든 자식 제거 (배경 포함)
    this.container.removeAll(true);
  }
}
