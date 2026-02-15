/**
 * DisengageWarningModal
 *
 * 교전 중인 장수가 [이동]을 클릭할 때 표시되는 경고 모달.
 * 교전 회피 시 피해를 경고하고 확인/취소를 선택할 수 있습니다.
 */
import Phaser from 'phaser';

interface DisengageWarningOptions {
  currentTroops: number;
  disengageDamage: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export class DisengageWarningModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private overlay: Phaser.GameObjects.Graphics;
  private visible: boolean = false;

  // 스타일 상수
  private static readonly MODAL_WIDTH = 200;
  private static readonly MODAL_HEIGHT = 140;
  private static readonly BG_COLOR = 0x1e1e3a;
  private static readonly BG_BORDER_COLOR = 0x4a4a6a;
  private static readonly TEXT_COLOR = '#e0d8c0';
  private static readonly WARNING_COLOR = '#ff6666';
  private static readonly BUTTON_WIDTH = 64;
  private static readonly BUTTON_HEIGHT = 22;
  private static readonly CONFIRM_COLOR = 0x228822;
  private static readonly CONFIRM_BORDER_COLOR = 0x44aa44;
  private static readonly CANCEL_COLOR = 0x555566;
  private static readonly CANCEL_BORDER_COLOR = 0x777788;
  private static readonly HIGHLIGHT_COLOR = 0xffd700;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 어두운 배경 오버레이 (전체 화면)
    this.overlay = scene.add.graphics();
    this.overlay.setDepth(199);
    this.overlay.setVisible(false);

    // 모달 컨테이너
    this.container = scene.add.container(0, 0);
    this.container.setDepth(200);
    this.container.setVisible(false);
  }

  /**
   * 모달 표시
   */
  show(options: DisengageWarningOptions): void {
    const { currentTroops, disengageDamage, onConfirm, onCancel } = options;

    // 기존 내용 정리
    this.container.removeAll(true);

    // 화면 중앙 위치 계산
    const cam = this.scene.cameras.main;
    const centerX = cam.scrollX + cam.width / 2;
    const centerY = cam.scrollY + cam.height / 2;

    // 오버레이 그리기 (반투명 어두운 배경)
    this.overlay.clear();
    this.overlay.fillStyle(0x000000, 0.7);
    this.overlay.fillRect(cam.scrollX, cam.scrollY, cam.width, cam.height);
    this.overlay.setVisible(true);

    // 모달 배경
    const bg = this.scene.add.graphics();
    bg.fillStyle(DisengageWarningModal.BG_COLOR, 0.98);
    bg.fillRect(
      -DisengageWarningModal.MODAL_WIDTH / 2,
      -DisengageWarningModal.MODAL_HEIGHT / 2,
      DisengageWarningModal.MODAL_WIDTH,
      DisengageWarningModal.MODAL_HEIGHT
    );
    bg.lineStyle(2, DisengageWarningModal.BG_BORDER_COLOR, 1);
    bg.strokeRect(
      -DisengageWarningModal.MODAL_WIDTH / 2,
      -DisengageWarningModal.MODAL_HEIGHT / 2,
      DisengageWarningModal.MODAL_WIDTH,
      DisengageWarningModal.MODAL_HEIGHT
    );
    this.container.add(bg);

    // 제목
    const title = this.scene.add.text(0, -55, '⚠ 교전 회피 경고', {
      fontSize: '12px',
      color: DisengageWarningModal.WARNING_COLOR,
      fontFamily: '"DungGeunMo", monospace',
      align: 'center',
    });
    title.setOrigin(0.5, 0.5);
    this.container.add(title);

    // 본문
    const bodyText = `교전 회피 시 피해 ${disengageDamage}를 받습니다`;
    const body = this.scene.add.text(0, -30, bodyText, {
      fontSize: '10px',
      color: DisengageWarningModal.TEXT_COLOR,
      fontFamily: '"DungGeunMo", monospace',
      align: 'center',
    });
    body.setOrigin(0.5, 0.5);
    this.container.add(body);

    // 현재 병력
    const currentText = `현재 병력: ${currentTroops}`;
    const current = this.scene.add.text(0, -10, currentText, {
      fontSize: '10px',
      color: DisengageWarningModal.TEXT_COLOR,
      fontFamily: '"DungGeunMo", monospace',
      align: 'center',
    });
    current.setOrigin(0.5, 0.5);
    this.container.add(current);

    // 예상 병력
    const expectedTroops = currentTroops - disengageDamage;
    const expectedText = `예상 병력: ${expectedTroops}`;
    const expectedColor = expectedTroops <= 0 ? DisengageWarningModal.WARNING_COLOR : DisengageWarningModal.TEXT_COLOR;
    const expected = this.scene.add.text(0, 5, expectedText, {
      fontSize: '10px',
      color: expectedColor,
      fontFamily: '"DungGeunMo", monospace',
      align: 'center',
    });
    expected.setOrigin(0.5, 0.5);
    this.container.add(expected);

    // OUT 위험 경고
    if (expectedTroops <= 0) {
      const danger = this.scene.add.text(0, 20, '⚠ OUT 위험!', {
        fontSize: '11px',
        color: DisengageWarningModal.WARNING_COLOR,
        fontFamily: '"DungGeunMo", monospace',
        align: 'center',
        fontStyle: 'bold',
      });
      danger.setOrigin(0.5, 0.5);
      this.container.add(danger);
    }

    // 버튼 Y 위치
    const buttonY = 45;
    const buttonGap = 8;

    // [확인] 버튼 (녹색)
    const confirmBtn = this.createButton(
      -DisengageWarningModal.BUTTON_WIDTH / 2 - buttonGap / 2,
      buttonY,
      '확인',
      DisengageWarningModal.CONFIRM_COLOR,
      DisengageWarningModal.CONFIRM_BORDER_COLOR,
      () => {
        this.hide();
        onConfirm();
      }
    );
    this.container.add(confirmBtn);

    // [취소] 버튼 (회색)
    const cancelBtn = this.createButton(
      DisengageWarningModal.BUTTON_WIDTH / 2 + buttonGap / 2,
      buttonY,
      '취소',
      DisengageWarningModal.CANCEL_COLOR,
      DisengageWarningModal.CANCEL_BORDER_COLOR,
      () => {
        this.hide();
        onCancel();
      }
    );
    this.container.add(cancelBtn);

    // 모달 위치 설정 (화면 중앙)
    this.container.setPosition(centerX, centerY);
    this.container.setVisible(true);
    this.visible = true;
  }

  /**
   * 모달 숨기기
   */
  hide(): void {
    this.overlay.setVisible(false);
    this.overlay.clear();
    this.container.setVisible(false);
    this.container.removeAll(true);
    this.visible = false;
  }

  /**
   * 모달 표시 여부
   */
  get isVisible(): boolean {
    return this.visible;
  }

  /**
   * 정리
   */
  destroy(): void {
    this.hide();
    this.overlay.destroy();
    this.container.destroy();
  }

  /**
   * 버튼 생성 헬퍼
   */
  private createButton(
    x: number,
    y: number,
    label: string,
    bgColor: number,
    borderColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btnContainer = this.scene.add.container(x, y);

    // 버튼 배경
    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRect(
      -DisengageWarningModal.BUTTON_WIDTH / 2,
      -DisengageWarningModal.BUTTON_HEIGHT / 2,
      DisengageWarningModal.BUTTON_WIDTH,
      DisengageWarningModal.BUTTON_HEIGHT
    );
    bg.lineStyle(1, borderColor, 1);
    bg.strokeRect(
      -DisengageWarningModal.BUTTON_WIDTH / 2,
      -DisengageWarningModal.BUTTON_HEIGHT / 2,
      DisengageWarningModal.BUTTON_WIDTH,
      DisengageWarningModal.BUTTON_HEIGHT
    );
    btnContainer.add(bg);

    // 버튼 텍스트
    const text = this.scene.add.text(0, 0, label, {
      fontSize: '11px',
      color: DisengageWarningModal.TEXT_COLOR,
      fontFamily: '"DungGeunMo", monospace',
      align: 'center',
    });
    text.setOrigin(0.5, 0.5);
    btnContainer.add(text);

    // 인터랙션 영역
    const hitArea = this.scene.add.rectangle(
      0,
      0,
      DisengageWarningModal.BUTTON_WIDTH,
      DisengageWarningModal.BUTTON_HEIGHT,
      0xffffff,
      0
    );
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRect(
        -DisengageWarningModal.BUTTON_WIDTH / 2,
        -DisengageWarningModal.BUTTON_HEIGHT / 2,
        DisengageWarningModal.BUTTON_WIDTH,
        DisengageWarningModal.BUTTON_HEIGHT
      );
      bg.lineStyle(2, DisengageWarningModal.HIGHLIGHT_COLOR, 1);
      bg.strokeRect(
        -DisengageWarningModal.BUTTON_WIDTH / 2,
        -DisengageWarningModal.BUTTON_HEIGHT / 2,
        DisengageWarningModal.BUTTON_WIDTH,
        DisengageWarningModal.BUTTON_HEIGHT
      );
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRect(
        -DisengageWarningModal.BUTTON_WIDTH / 2,
        -DisengageWarningModal.BUTTON_HEIGHT / 2,
        DisengageWarningModal.BUTTON_WIDTH,
        DisengageWarningModal.BUTTON_HEIGHT
      );
      bg.lineStyle(1, borderColor, 1);
      bg.strokeRect(
        -DisengageWarningModal.BUTTON_WIDTH / 2,
        -DisengageWarningModal.BUTTON_HEIGHT / 2,
        DisengageWarningModal.BUTTON_WIDTH,
        DisengageWarningModal.BUTTON_HEIGHT
      );
    });

    hitArea.on('pointerdown', onClick);

    btnContainer.add(hitArea);

    return btnContainer;
  }
}
