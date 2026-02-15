/**
 * Board Renderer
 *
 * 34타일 삼각형 보드 전체를 렌더링합니다.
 */

import Phaser from 'phaser';
import { TILE_META, ATTACKABLE_TILE, type TileMeta, type TileId } from '@ftg/game-core';
import {
  TileRenderer,
  getTileCenter,
  getTileCentroid,
  type TileRenderConfig,
} from './TileRenderer';

export interface BoardRenderConfig {
  /** 타일 렌더링 설정 */
  tile?: Partial<TileRenderConfig>;
  /** 보드 여백 */
  padding?: number;
}

const DEFAULT_BOARD_CONFIG: Required<BoardRenderConfig> = {
  tile: {},
  padding: 50,
};

/** WCAG 2.1 터치 타겟 최소 크기 */
const MIN_TOUCH_TARGET = 44;

/** 경로 미리보기 색상 설정 */
const PATH_PREVIEW = {
  LINE_COLOR: 0x4169e1, // Royal Blue
  LINE_ALPHA: 0.8,
  LINE_WIDTH: 3,
  DEST_MARKER_COLOR: 0x4169e1,
  DEST_MARKER_ALPHA: 0.5,
  DEST_MARKER_RADIUS: 12,
};

export class BoardRenderer {
  private scene: Phaser.Scene;
  private config: Required<BoardRenderConfig>;
  private tileRenderer: TileRenderer;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private showingIds: boolean = false;
  private movableTileIds: Set<TileId> = new Set();
  private attackableTileIds: Set<TileId> = new Set();
  private pathGraphics: Phaser.GameObjects.Graphics | null = null;
  private attackGraphics: Phaser.GameObjects.Graphics | null = null;
  private flashGraphics: Phaser.GameObjects.Graphics | null = null;
  private currentPreviewPath: TileId[] = [];

  constructor(scene: Phaser.Scene, config: BoardRenderConfig = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_BOARD_CONFIG, ...config };
    this.tileRenderer = new TileRenderer(scene, this.config.tile);
    this.calculateDynamicTileSize();
    this.calculateOffset();
  }

  /**
   * 화면 크기에 맞는 동적 타일 크기 계산
   *
   * 보드는 가로 3.5W(측면 포함), 세로 6H 차지
   * 가로/세로 중 더 제약이 큰 쪽에 맞춤
   */
  private calculateDynamicTileSize(): void {
    const { width: screenWidth, height: screenHeight } = this.scene.cameras.main;
    const padding = this.config.padding;

    // 사용 가능한 영역 (패딩 제외)
    const availableWidth = screenWidth - 2 * padding;
    const availableHeight = screenHeight - 2 * padding;

    // 보드 영역: 가로 3.5W (측면 타일 포함), 세로 6H
    const boardWidthRatio = 3.5;
    const boardHeightRatio = 6;

    // 가로/세로 기준 타일 크기 계산
    const widthBasedTileWidth = availableWidth / boardWidthRatio;
    const heightBasedTileHeight = availableHeight / boardHeightRatio;

    // 정삼각형 비율 유지 (height ≈ width * 0.66)
    const aspectRatio = 0.66;
    const widthBasedTileHeight = widthBasedTileWidth * aspectRatio;
    const heightBasedTileWidth = heightBasedTileHeight / aspectRatio;

    let tileWidth: number;
    let tileHeight: number;

    // 더 제약이 큰 쪽에 맞춤
    if (widthBasedTileHeight * boardHeightRatio <= availableHeight) {
      // 가로가 제약
      tileWidth = widthBasedTileWidth;
      tileHeight = widthBasedTileHeight;
    } else {
      // 세로가 제약
      tileWidth = heightBasedTileWidth;
      tileHeight = heightBasedTileHeight;
    }

    // 최소 타일 크기 제약 (WCAG 2.1 터치 타겟: 44px)
    if (tileWidth < MIN_TOUCH_TARGET) {
      tileWidth = MIN_TOUCH_TARGET;
      tileHeight = MIN_TOUCH_TARGET * aspectRatio;
    }

    // TileRenderer에 동적 크기 전달
    this.tileRenderer.updateConfig({ width: tileWidth, height: tileHeight });
  }

  /**
   * 보드 중앙 배치를 위한 오프셋 계산 (레거시 방식)
   *
   * 레거시에서:
   * - 보드 Container가 화면 중심에 위치
   * - startX = -boardWidth/2 = -1.5W (보드의 로컬 좌표)
   * - startY = -boardHeight/2 = -3H
   * - 메인 타일 col=0: x = startX
   * - 좌측 측면: x = startX - W/2
   *
   * 화면 좌표로 변환:
   * - offsetX = screenCenterX + startX = screenCenterX - 1.5W
   * - offsetY = screenCenterY + startY = screenCenterY - 3H
   */
  private calculateOffset(): void {
    const { width: screenWidth, height: screenHeight } = this.scene.cameras.main;
    const tileConfig = this.tileRenderer.tileConfig;
    const W = tileConfig.width;
    const H = tileConfig.height;

    // 화면 중심
    const screenCenterX = screenWidth / 2;
    const screenCenterY = screenHeight / 2;

    // 레거시 startX, startY를 화면 좌표로 변환
    // startX = -1.5W, startY = -3H
    this.offsetX = screenCenterX - 1.5 * W;
    this.offsetY = screenCenterY - 3 * H;
  }

  /**
   * 화면 크기 변경 시 재계산 및 재렌더링
   */
  recalculateAndRender(): void {
    this.calculateDynamicTileSize();
    this.calculateOffset();
  }

  /**
   * 전체 보드 렌더링
   */
  render(): void {
    this.tileRenderer.clear();

    // 모든 34타일 렌더링
    for (const tile of TILE_META) {
      this.tileRenderer.renderTile(tile, this.offsetX, this.offsetY);
    }
  }

  /**
   * 특정 타일 강조 표시
   */
  highlightTiles(tileIds: number[], type: 'selected' | 'hovered' | 'highlighted' = 'highlighted'): void {
    // 해당 타일만 다시 그리기 (전체 재렌더링 없이)
    for (const id of tileIds) {
      const tile = TILE_META.find((t) => t.id === id);
      if (tile) {
        this.tileRenderer.renderTile(tile, this.offsetX, this.offsetY, {
          [type]: true,
        });
      }
    }

    // ID 표시가 켜져 있으면 해당 타일 ID만 다시 그리기
    if (this.showingIds) {
      for (const id of tileIds) {
        const tile = TILE_META.find((t) => t.id === id);
        if (tile) {
          this.tileRenderer.showTileId(tile, this.offsetX, this.offsetY);
        }
      }
    }
  }

  /**
   * 다중 상태 통합 렌더링
   * 우선순위: selected > hovered > attackable > movable > highlighted > normal
   */
  renderWithStates(
    selectedId: TileId | null,
    hoveredId: TileId | null,
    highlightedIds: TileId[] = []
  ): void {
    this.render(); // 기본 렌더링

    // 하이라이트된 타일 (선택/호버 제외)
    const highlightOnly = highlightedIds.filter(
      (id) => id !== selectedId && id !== hoveredId
    );
    for (const id of highlightOnly) {
      const tile = TILE_META.find((t) => t.id === id);
      if (tile) {
        this.tileRenderer.renderTile(tile, this.offsetX, this.offsetY, {
          highlighted: true,
        });
      }
    }

    // 이동 가능 타일 (movable) - selected/hovered/attackable 제외
    for (const tileId of this.movableTileIds) {
      if (tileId === selectedId || tileId === hoveredId || this.attackableTileIds.has(tileId)) continue;
      const tile = TILE_META.find((t) => t.id === tileId);
      if (tile) {
        this.tileRenderer.renderTile(tile, this.offsetX, this.offsetY, {
          movable: true,
        });
      }
    }

    // 공격 가능 타일 (attackable) - 이동 가능 타일 위에 오버레이
    this.renderAttackableTilesOverlay();

    // 호버된 타일 (선택 제외)
    if (hoveredId !== null && hoveredId !== selectedId) {
      const tile = TILE_META.find((t) => t.id === hoveredId);
      if (tile) {
        this.tileRenderer.renderTile(tile, this.offsetX, this.offsetY, {
          hovered: true,
        });
      }
    }

    // 선택된 타일 (최상위)
    if (selectedId !== null) {
      const tile = TILE_META.find((t) => t.id === selectedId);
      if (tile) {
        this.tileRenderer.renderTile(tile, this.offsetX, this.offsetY, {
          selected: true,
        });
      }
    }

    // ID 표시 복원
    if (this.showingIds) {
      this.showTileIds(true);
    }
  }

  /**
   * 공격 가능 타일 오버레이 렌더링
   */
  private renderAttackableTilesOverlay(): void {
    // 기존 공격 그래픽 클리어
    if (this.attackGraphics) {
      this.attackGraphics.clear();
    }

    if (this.attackableTileIds.size === 0) return;

    // Graphics 객체 생성 (존재하지 않으면)
    if (!this.attackGraphics) {
      this.attackGraphics = this.scene.add.graphics();
      this.attackGraphics.setDepth(50); // 이동 타일과 경로 사이
    }

    const tileConfig = this.tileRenderer.tileConfig;
    const scale = this.tileRenderer.tileScale;

    for (const tileId of this.attackableTileIds) {
      const tile = TILE_META.find((t) => t.id === tileId);
      if (!tile) continue;

      // 타일의 스케일이 적용된 꼭지점 좌표 계산
      const vertices = this.getScaledTileVertices(tile, tileConfig, this.tileRenderer.tileInradius, scale);

      // 공격 가능 타일 하이라이트 그리기
      this.attackGraphics.fillStyle(ATTACKABLE_TILE.COLOR_HEX, ATTACKABLE_TILE.ALPHA);
      this.attackGraphics.lineStyle(
        ATTACKABLE_TILE.STROKE_WIDTH,
        ATTACKABLE_TILE.STROKE_COLOR_HEX,
        0.8
      );

      this.attackGraphics.beginPath();
      this.attackGraphics.moveTo(vertices[0].x, vertices[0].y);
      this.attackGraphics.lineTo(vertices[1].x, vertices[1].y);
      this.attackGraphics.lineTo(vertices[2].x, vertices[2].y);
      this.attackGraphics.closePath();

      this.attackGraphics.fillPath();
      this.attackGraphics.strokePath();
    }
  }

  /**
   * 타일 ID 표시 토글
   */
  showTileIds(show: boolean): void {
    this.showingIds = show;

    if (show) {
      this.tileRenderer.hideTileIds();
      for (const tile of TILE_META) {
        this.tileRenderer.showTileId(tile, this.offsetX, this.offsetY);
      }
    } else {
      this.tileRenderer.hideTileIds();
    }
  }

  /**
   * 화면 좌표에서 타일 ID 찾기
   * Phaser.Geom.Triangle.Contains()를 사용한 정확한 point-in-triangle 판정
   */
  getTileAtPosition(x: number, y: number): number | null {
    const tileConfig = this.tileRenderer.tileConfig;
    const inradius = this.tileRenderer.tileInradius;
    const scale = this.tileRenderer.tileScale;

    for (const tile of TILE_META) {
      // 타일의 스케일이 적용된 꼭지점 좌표 계산
      const vertices = this.getScaledTileVertices(tile, tileConfig, inradius, scale);

      // Phaser의 point-in-triangle 판정 사용
      const triangle = new Phaser.Geom.Triangle(
        vertices[0].x, vertices[0].y,
        vertices[1].x, vertices[1].y,
        vertices[2].x, vertices[2].y
      );

      if (Phaser.Geom.Triangle.Contains(triangle, x, y)) {
        return tile.id;
      }
    }

    return null;
  }

  /**
   * 타일의 스케일이 적용된 실제 꼭지점 좌표 계산
   */
  private getScaledTileVertices(
    tile: TileMeta,
    config: TileRenderConfig,
    inradius: number,
    scale: number
  ): { x: number; y: number }[] {
    const { width, height } = config;

    // 타일 원점 계산
    const origin = getTileCenter(tile, config, this.offsetX, this.offsetY, inradius);

    // 원점 기준 상대 좌표로 vertex 계산
    let vertices: { x: number; y: number }[];

    if (tile.isSideTile) {
      vertices = this.getLeftRightTriangleVertices(width, height, tile.direction === 'left');
    } else {
      vertices = this.getUpDownTriangleVertices(width, height, inradius, tile.direction === 'up');
    }

    // 스케일 적용: TileRenderer와 동일한 centroid 기준 스케일링
    const centroidX = (vertices[0].x + vertices[1].x + vertices[2].x) / 3;
    const centroidY = (vertices[0].y + vertices[1].y + vertices[2].y) / 3;

    return vertices.map((v) => ({
      x: origin.x + centroidX + (v.x - centroidX) * scale,
      y: origin.y + centroidY + (v.y - centroidY) * scale,
    }));
  }

  /**
   * 위/아래 삼각형 꼭지점 (TileRenderer와 동일한 로직)
   */
  private getUpDownTriangleVertices(
    width: number,
    height: number,
    inradius: number,
    isUp: boolean
  ): { x: number; y: number }[] {
    const w = width;
    const h = height;
    const r = inradius;
    const offsetY = h / 2 - r;

    if (isUp) {
      return [
        { x: 0, y: h / 2 + r },
        { x: w, y: h / 2 + r },
        { x: w / 2, y: -h / 2 + r },
      ];
    } else {
      return [
        { x: 0, y: offsetY },
        { x: w, y: offsetY },
        { x: w / 2, y: h + offsetY },
      ];
    }
  }

  /**
   * 좌/우 삼각형 꼭지점 (TileRenderer와 동일한 로직)
   */
  private getLeftRightTriangleVertices(
    width: number,
    height: number,
    isLeft: boolean
  ): { x: number; y: number }[] {
    const h = height;
    const w = width;

    if (isLeft) {
      return [
        { x: 0, y: -h },
        { x: 0, y: h },
        { x: -w / 2, y: 0 },
      ];
    } else {
      return [
        { x: 0, y: -h },
        { x: 0, y: h },
        { x: w / 2, y: 0 },
      ];
    }
  }

  /**
   * 이동 가능 타일 설정
   * 실제 렌더링은 renderWithStates()에서 수행
   */
  showMovableTiles(tileIds: TileId[]): void {
    this.movableTileIds = new Set(tileIds);
  }

  /**
   * 이동 가능 타일 하이라이트 제거
   */
  clearMovableTiles(): void {
    this.movableTileIds.clear();
  }

  /**
   * 공격 가능 타일 설정
   * 실제 렌더링은 renderWithStates()에서 수행
   */
  showAttackableTiles(tileIds: TileId[]): void {
    this.attackableTileIds = new Set(tileIds);
  }

  /**
   * 공격 가능 타일 하이라이트 제거
   */
  clearAttackableTiles(): void {
    this.attackableTileIds.clear();
  }

  /**
   * 특정 타일이 공격 가능한지 확인
   */
  isAttackableTile(tileId: TileId): boolean {
    return this.attackableTileIds.has(tileId);
  }

  /**
   * 경로 미리보기 표시
   *
   * @param path - 경로 타일 ID 배열 (시작점 제외, 목적지 포함)
   * @param startTileId - 시작 타일 ID
   */
  showPathPreview(path: TileId[], startTileId: TileId): void {
    this.clearPathPreview();

    if (path.length === 0) return;

    this.currentPreviewPath = path;

    // Graphics 객체 생성 (존재하지 않으면)
    if (!this.pathGraphics) {
      this.pathGraphics = this.scene.add.graphics();
      // 경로 미리보기를 최상위 레이어에 표시
      this.pathGraphics.setDepth(100);
    }

    // 경로 스타일 설정
    this.pathGraphics.lineStyle(
      PATH_PREVIEW.LINE_WIDTH,
      PATH_PREVIEW.LINE_COLOR,
      PATH_PREVIEW.LINE_ALPHA
    );

    // 시작점 좌표 가져오기
    const startPos = this.getTileCentroid(startTileId);
    if (!startPos) return;

    // 경로 그리기
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(startPos.x, startPos.y);

    for (const tileId of path) {
      const tilePos = this.getTileCentroid(tileId);
      if (tilePos) {
        this.pathGraphics.lineTo(tilePos.x, tilePos.y);
      }
    }

    this.pathGraphics.strokePath();

    // 목적지 마커 표시 (원형)
    const destTileId = path[path.length - 1];
    const destPos = this.getTileCentroid(destTileId);
    if (destPos) {
      this.pathGraphics.fillStyle(
        PATH_PREVIEW.DEST_MARKER_COLOR,
        PATH_PREVIEW.DEST_MARKER_ALPHA
      );
      this.pathGraphics.fillCircle(
        destPos.x,
        destPos.y,
        PATH_PREVIEW.DEST_MARKER_RADIUS
      );
    }
  }

  /**
   * 경로 미리보기 해제
   */
  clearPathPreview(): void {
    if (this.pathGraphics) {
      this.pathGraphics.clear();
    }
    this.currentPreviewPath = [];
  }

  /**
   * 현재 미리보기 경로 반환
   */
  getCurrentPreviewPath(): TileId[] {
    return [...this.currentPreviewPath];
  }

  /**
   * 타일의 기하학적 중심(centroid) 좌표 반환
   *
   * @param tileId - 타일 ID
   * @returns 중심 좌표 또는 null
   */
  private getTileCentroid(tileId: TileId): { x: number; y: number } | null {
    const tile = TILE_META.find((t) => t.id === tileId);
    if (!tile) return null;

    return getTileCentroid(
      tile,
      this.tileRenderer.tileConfig,
      this.offsetX,
      this.offsetY,
      this.tileRenderer.tileScale
    );
  }

  /**
   * 타일 플래시 효과
   *
   * 피격 시 빨간색 깜빡임 효과를 제공합니다.
   *
   * Story 4-6: 전투 피드백 (Combat Feedback)
   *
   * @param tileId - 플래시할 타일 ID
   * @param color - 플래시 색상 (기본: 빨간색)
   * @param duration - 플래시 지속 시간 (ms). 기본: 100
   */
  flashTile(tileId: TileId, color: number = 0xff0000, duration: number = 100): void {
    const tile = TILE_META.find((t) => t.id === tileId);
    if (!tile) return;

    // 이전 플래시 애니메이션 정리
    if (this.flashGraphics) {
      this.scene.tweens.killTweensOf(this.flashGraphics);
      this.flashGraphics.clear();
    }

    // Graphics 객체 생성 (존재하지 않으면)
    if (!this.flashGraphics) {
      this.flashGraphics = this.scene.add.graphics();
      this.flashGraphics.setDepth(60); // 공격 타일과 경로 사이
    }

    const tileConfig = this.tileRenderer.tileConfig;
    const scale = this.tileRenderer.tileScale;

    // 타일의 스케일이 적용된 꼭지점 좌표 계산
    const vertices = this.getScaledTileVertices(tile, tileConfig, this.tileRenderer.tileInradius, scale);

    // 플래시 오버레이 그리기 (alpha 1로 그리고, Graphics 객체 alpha로 제어)
    this.flashGraphics.fillStyle(color, 1);
    this.flashGraphics.beginPath();
    this.flashGraphics.moveTo(vertices[0].x, vertices[0].y);
    this.flashGraphics.lineTo(vertices[1].x, vertices[1].y);
    this.flashGraphics.lineTo(vertices[2].x, vertices[2].y);
    this.flashGraphics.closePath();
    this.flashGraphics.fillPath();

    // 초기 alpha를 0으로 설정하고 페이드 인/아웃
    this.flashGraphics.setAlpha(0);

    // 페이드 인/아웃 애니메이션
    this.scene.tweens.add({
      targets: this.flashGraphics,
      alpha: 0.4,
      duration,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        if (this.flashGraphics) {
          this.flashGraphics.clear();
          this.flashGraphics.setAlpha(1);
        }
      },
    });
  }

  /**
   * 타일 설정 반환 (외부 접근용)
   */
  getTileConfig(): TileRenderConfig {
    return this.tileRenderer.tileConfig;
  }

  /**
   * 타일 스케일 반환 (외부 접근용)
   */
  getTileScale(): number {
    return this.tileRenderer.tileScale;
  }

  /**
   * 보드 오프셋 반환 (외부 접근용)
   */
  getOffsets(): { x: number; y: number } {
    return { x: this.offsetX, y: this.offsetY };
  }

  /**
   * 타일 중심 좌표 반환 (외부 접근용)
   *
   * GameScene에서 공격 이펙트 좌표 계산에 사용됩니다.
   *
   * Story 4-6: 전투 피드백 (Combat Feedback)
   *
   * @param tileId - 타일 ID
   * @returns 타일 중심 좌표 또는 null
   */
  getTileCenter(tileId: TileId): { x: number; y: number } | null {
    return this.getTileCentroid(tileId);
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    this.tileRenderer.destroy();
    if (this.pathGraphics) {
      this.pathGraphics.destroy();
      this.pathGraphics = null;
    }
    if (this.attackGraphics) {
      this.attackGraphics.destroy();
      this.attackGraphics = null;
    }
    if (this.flashGraphics) {
      this.flashGraphics.destroy();
      this.flashGraphics = null;
    }
  }
}
