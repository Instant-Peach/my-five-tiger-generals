/**
 * Input Handler
 *
 * 타일 선택을 위한 입력 처리를 담당합니다.
 * 터치와 마우스 입력을 통합 처리합니다.
 * 데스크톱: 호버로 경로 미리보기
 * 모바일: 롱프레스(500ms)로 경로 미리보기
 */

import Phaser from 'phaser';
import type { TileId } from '@ftg/game-core';
import type { BoardRenderer } from '../rendering/BoardRenderer';

/** 타일 선택 시 호출되는 콜백. null이면 선택 해제. */
export type TileSelectCallback = (tileId: TileId | null) => void;

/** 타일 호버 시 호출되는 콜백. null이면 호버 해제. */
export type TileHoverCallback = (tileId: TileId | null) => void;

/** 롱프레스 판정 시간 (밀리초) */
const LONG_PRESS_DURATION = 500;

export class InputHandler {
  private scene: Phaser.Scene;
  private boardRenderer: BoardRenderer;
  private onTileSelect: TileSelectCallback;
  private onTileHover?: TileHoverCallback;

  // 롱프레스 상태 (모바일용)
  private longPressTimer: Phaser.Time.TimerEvent | null = null;
  private longPressTarget: TileId | null = null;
  private isLongPressing: boolean = false;
  private isMobile: boolean = false;

  constructor(
    scene: Phaser.Scene,
    boardRenderer: BoardRenderer,
    onTileSelect: TileSelectCallback,
    onTileHover?: TileHoverCallback
  ) {
    this.scene = scene;
    this.boardRenderer = boardRenderer;
    this.onTileSelect = onTileSelect;
    this.onTileHover = onTileHover;

    // 모바일 장치 감지
    this.isMobile = this.detectMobile();

    this.setupInputListeners();
  }

  /**
   * 모바일 장치 감지
   */
  private detectMobile(): boolean {
    const device = this.scene.sys.game.device;
    return device.os.android || device.os.iOS || device.os.windowsPhone;
  }

  /**
   * 입력 이벤트 리스너 설정
   */
  private setupInputListeners(): void {
    // 모든 포인터 입력 처리 (터치 + 마우스)
    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);

    // 호버/이동 이벤트
    if (this.onTileHover) {
      this.scene.input.on('pointermove', this.handlePointerMove, this);
      this.scene.input.on('pointerout', this.handlePointerOut, this);
    }
  }

  /**
   * 포인터 다운 이벤트 처리
   */
  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const tileId = this.boardRenderer.getTileAtPosition(pointer.x, pointer.y);

    if (this.isMobile && this.onTileHover) {
      // 모바일: 롱프레스 타이머 시작
      this.startLongPress(tileId, pointer);
    } else {
      // 데스크톱: 즉시 선택
      this.onTileSelect(tileId);
    }
  }

  /**
   * 포인터 업 이벤트 처리
   */
  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.isMobile) {
      const tileId = this.boardRenderer.getTileAtPosition(pointer.x, pointer.y);

      if (this.isLongPressing) {
        // 롱프레스 후 터치 업 -> 이동 실행 (미리보기된 경로로)
        if (tileId !== null && tileId === this.longPressTarget) {
          this.onTileSelect(tileId);
        }
        this.isLongPressing = false;
      } else if (!this.longPressTimer) {
        // 롱프레스 없이 빠른 탭 -> 일반 선택 (이미 타이머가 취소된 경우)
        // 이 경우는 cancelLongPress에서 이미 선택 처리됨
      }

      this.cancelLongPress();
    }
  }

  /**
   * 포인터 이동 이벤트 처리 (호버/드래그)
   */
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    const tileId = this.boardRenderer.getTileAtPosition(pointer.x, pointer.y);

    if (this.isMobile && pointer.isDown) {
      // 모바일 드래그 중: 롱프레스 타겟 변경 시 타이머 리셋
      if (tileId !== this.longPressTarget) {
        this.cancelLongPress();
        if (tileId !== null) {
          this.startLongPress(tileId, pointer);
        }
      }
    } else if (!this.isMobile) {
      // 데스크톱: 일반 호버
      this.onTileHover?.(tileId);
    }
  }

  /**
   * 포인터 아웃 이벤트 처리 (호버 해제)
   */
  private handlePointerOut(): void {
    this.cancelLongPress();
    this.onTileHover?.(null);
  }

  /**
   * 롱프레스 시작 (모바일)
   */
  private startLongPress(tileId: TileId | null, _pointer: Phaser.Input.Pointer): void {
    this.cancelLongPress();

    if (tileId === null) return;

    this.longPressTarget = tileId;
    this.longPressTimer = this.scene.time.delayedCall(LONG_PRESS_DURATION, () => {
      // 롱프레스 완료 -> 경로 미리보기 활성화
      this.isLongPressing = true;
      this.onTileHover?.(tileId);
      this.longPressTimer = null;
    });
  }

  /**
   * 롱프레스 취소
   */
  private cancelLongPress(): void {
    if (this.longPressTimer) {
      this.longPressTimer.destroy();
      this.longPressTimer = null;

      // 롱프레스가 완료되지 않았으면 일반 탭으로 처리
      if (!this.isLongPressing && this.longPressTarget !== null) {
        this.onTileSelect(this.longPressTarget);
      }
    }

    this.longPressTarget = null;

    // 롱프레스 해제 시 경로 미리보기도 해제
    if (this.isLongPressing) {
      this.onTileHover?.(null);
    }
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    this.cancelLongPress();
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerout', this.handlePointerOut, this);
  }
}
