/**
 * Tile Renderer
 *
 * 개별 삼각형 타일을 렌더링합니다.
 * 레거시 프로젝트의 테셀레이션 방식을 따릅니다.
 */

import Phaser from 'phaser';
import type { TileMeta } from '@ftg/game-core';
import { getZoneColor, MOVABLE_TILE, type ZoneState } from '@ftg/game-core';

/** 타일 렌더링 설정 */
export interface TileRenderConfig {
  /** 삼각형 밑변 길이 (픽셀) */
  width: number;
  /** 삼각형 높이 (픽셀) */
  height: number;
  /** 타일 간 간격 (픽셀) */
  gap: number;
  /** 기본 채우기 색상 */
  fillColor: number;
  /** 선택된 타일 색상 */
  selectedColor: number;
  /** 호버 타일 색상 */
  hoverColor: number;
  /** 하이라이트 색상 */
  highlightColor: number;
  /** 테두리 색상 */
  strokeColor: number;
  /** 테두리 두께 */
  strokeWidth: number;
  /** 채우기 알파 */
  fillAlpha: number;
}

export const DEFAULT_TILE_CONFIG: TileRenderConfig = {
  width: 100,
  height: 66,
  gap: 3,
  fillColor: 0xffffff,
  selectedColor: 0x4a7c59,
  hoverColor: 0x3d5c4a,
  highlightColor: 0x5a8f6a,
  strokeColor: 0x000000,
  strokeWidth: 2,
  fillAlpha: 0.5,
};

/**
 * 타일 상태에 따른 ZoneState 결정
 *
 * 우선순위: selected > hovered > highlighted > base
 */
function getZoneState(options: {
  selected?: boolean;
  hovered?: boolean;
  highlighted?: boolean;
}): ZoneState {
  if (options.selected) return 'selected';
  if (options.hovered) return 'hover';
  if (options.highlighted) return 'highlight';
  return 'base';
}


/**
 * 내접원 반지름 계산
 */
function getInradius(width: number, height: number): number {
  const side = Math.sqrt(height * height + (width / 2) * (width / 2));
  return (width * height) / (width + 2 * side);
}

/**
 * 간격을 위한 스케일 계산
 */
function getScaleForGap(width: number, height: number, gap: number): number {
  const r = getInradius(width, height);
  return Math.max(0, 1 - gap / (2 * r));
}

/**
 * 위/아래 삼각형 꼭짓점 계산 (레거시 방식 - 원점 기준 상대 좌표)
 *
 * 레거시 코드의 vertex 정의 (원점 기준):
 * - isEven(up): [0, h/2+r, w, h/2+r, w/2, -h/2+r]
 * - isOdd(down): [0, offsetY, w, offsetY, w/2, h+offsetY]
 *   where offsetY = h/2 - r
 *
 * 스케일은 원점(0,0) 기준으로 적용되므로,
 * inradius 중심에서 균일하게 축소됨
 */
function getUpDownTriangleVertices(
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
    // 위를 향하는 삼각형 (▲)
    // 레거시: [0, h/2+r, w, h/2+r, w/2, -h/2+r]
    return [
      { x: 0, y: h / 2 + r },        // 좌하단
      { x: w, y: h / 2 + r },        // 우하단
      { x: w / 2, y: -h / 2 + r },   // 상단 꼭짓점
    ];
  } else {
    // 아래를 향하는 삼각형 (▽)
    // 레거시: [0, offsetY, w, offsetY, w/2, h+offsetY]
    return [
      { x: 0, y: offsetY },          // 좌상단
      { x: w, y: offsetY },          // 우상단
      { x: w / 2, y: h + offsetY },  // 하단 꼭짓점
    ];
  }
}

/**
 * 좌/우 삼각형 꼭짓점 계산 (측면 타일)
 *
 * 측면 타일은 메인 타일의 측면에 맞닿아야 함
 * - 밑변 = 2*height (세로 방향)
 * - 높이 = width/2 (가로 방향)
 *
 * 원점을 꼭짓점에 두면 계산이 단순해짐
 */
function getLeftRightTriangleVertices(
  width: number,
  height: number
): { left: { x: number; y: number }[]; right: { x: number; y: number }[] } {
  const h = height;
  const w = width;

  // Right triangle (▷): 오른쪽을 향함, 꼭짓점이 오른쪽
  // 원점을 왼쪽 밑변 중앙에 둠
  const right = [
    { x: 0, y: -h },        // 밑변 상단
    { x: 0, y: h },         // 밑변 하단
    { x: w / 2, y: 0 },     // 우측 꼭짓점
  ];

  // Left triangle (◁): 왼쪽을 향함, 꼭짓점이 왼쪽
  // 원점을 오른쪽 밑변 중앙에 둠
  const left = [
    { x: 0, y: -h },        // 밑변 상단
    { x: 0, y: h },         // 밑변 하단
    { x: -w / 2, y: 0 },    // 좌측 꼭짓점
  ];

  return { left, right };
}

/**
 * 타일 원점 좌표 계산 (레거시 방식)
 *
 * 레거시에서 (x, y0)는 삼각형의 원점(0,0)이 배치될 위치
 * vertex는 이 원점 기준 상대 좌표로 정의됨
 *
 * 핵심: up/down 삼각형은 같은 행이라도 y 오프셋이 다름
 * - up(▲, 짝수 ID): y0 = y + offsetY
 * - down(▽, 홀수 ID): y0 = y - offsetY
 * where offsetY = h/2 - inradius
 */
export function getTileOrigin(
  tile: TileMeta,
  config: TileRenderConfig,
  boardOffsetX: number,
  boardOffsetY: number,
  inradius?: number
): { x: number; y: number } {
  const { width, height } = config;

  if (tile.isSideTile) {
    // 측면 타일 위치 계산
    //
    // 측면 타일은 메인 보드의 좌우 끝에 맞닿아야 함
    // - 좌측 측면 타일(30, 31): col=0 타일의 왼쪽 끝에 맞닿음
    // - 우측 측면 타일(32, 33): col=4 타일의 오른쪽 끝에 맞닿음
    //
    // 메인 타일의 vertex는 원점에서 오른쪽으로 width만큼 뻗어있음 (x: 0 ~ width)
    // col=0 타일의 왼쪽 끝: boardOffsetX + 0 = boardOffsetX
    // col=4 타일의 오른쪽 끝: boardOffsetX + 4*(width/2) + width = boardOffsetX + 3*width
    //
    // Right 삼각형(▷) 원점이 밑변 중앙이면, 밑변이 col=0 왼쪽 끝에 위치
    // Left 삼각형(◁) 원점이 밑변 중앙이면, 밑변이 col=4 오른쪽 끝에 위치
    //
    // row 1.5, 3.5 위치
    const baseY = boardOffsetY + tile.row * height;

    if (tile.col < 0) {
      // 좌측 측면 타일 (RightTriangle ▷ - 오른쪽을 바라봄)
      // 밑변이 메인 보드의 왼쪽 끝(boardOffsetX)에 맞닿음
      return {
        x: boardOffsetX,
        y: baseY,
      };
    } else {
      // 우측 측면 타일 (LeftTriangle ◁ - 왼쪽을 바라봄)
      // 밑변이 메인 보드의 오른쪽 끝에 맞닿음
      // col=4 타일 원점: boardOffsetX + 4*(width/2) = boardOffsetX + 2*width
      // col=4 타일 오른쪽 끝: boardOffsetX + 2*width + width = boardOffsetX + 3*width
      return {
        x: boardOffsetX + 3 * width,
        y: baseY,
      };
    }
  }

  // 메인 타일 원점 계산 (레거시 방식)
  // 레거시: x = startX + col * (w/2), y = startY + row * h
  const x = boardOffsetX + tile.col * (width / 2);
  const baseY = boardOffsetY + tile.row * height;

  // 핵심: up/down에 따른 y 오프셋 적용
  // 레거시: y0 = y + (isEven ? offsetY : -offsetY)
  const r = inradius ?? getInradius(width, height);
  const directionOffsetY = height / 2 - r;
  const isUp = tile.direction === 'up';
  const y = baseY + (isUp ? directionOffsetY : -directionOffsetY);

  return { x, y };
}

// 하위 호환을 위한 alias
export const getTileCenter = getTileOrigin;

/**
 * 타일의 기하학적 중심(centroid) 계산
 *
 * 장수 배치 등에 사용됨. 삼각형의 세 꼭짓점 평균으로 계산.
 */
export function getTileCentroid(
  tile: TileMeta,
  config: TileRenderConfig,
  boardOffsetX: number,
  boardOffsetY: number,
  scale: number = 1
): { x: number; y: number } {
  const { width, height } = config;
  const inradius = getInradius(width, height);

  // 타일 원점 계산
  const origin = getTileOrigin(tile, config, boardOffsetX, boardOffsetY, inradius);

  // 타일 꼭짓점 계산 (원점 기준 상대 좌표)
  let vertices: { x: number; y: number }[];

  if (tile.isSideTile) {
    const sideVertices = getLeftRightTriangleVertices(width, height);
    vertices = tile.direction === 'left' ? sideVertices.left : sideVertices.right;
  } else {
    vertices = getUpDownTriangleVertices(width, height, inradius, tile.direction === 'up');
  }

  // centroid 계산 (원점 기준)
  const centroidX = (vertices[0].x + vertices[1].x + vertices[2].x) / 3;
  const centroidY = (vertices[0].y + vertices[1].y + vertices[2].y) / 3;

  // 스케일 적용된 최종 좌표 반환
  return {
    x: origin.x + centroidX * scale,
    y: origin.y + centroidY * scale,
  };
}

export class TileRenderer {
  private scene: Phaser.Scene;
  private config: TileRenderConfig;
  private graphics: Phaser.GameObjects.Graphics;
  private textObjects: Map<number, Phaser.GameObjects.Text> = new Map();
  private inradius: number;
  private scale: number;

  constructor(scene: Phaser.Scene, config: Partial<TileRenderConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_TILE_CONFIG, ...config };
    this.graphics = scene.add.graphics();

    // 캐시된 계산값 (메인 타일 기준, 측면 타일도 동일한 scale 사용 - 레거시 방식)
    this.inradius = getInradius(this.config.width, this.config.height);
    this.scale = getScaleForGap(
      this.config.width,
      this.config.height,
      this.config.gap
    );
  }

  /**
   * 단일 타일 렌더링
   */
  renderTile(
    tile: TileMeta,
    offsetX: number,
    offsetY: number,
    options: {
      selected?: boolean;
      hovered?: boolean;
      highlighted?: boolean;
      movable?: boolean;
    } = {}
  ): void {
    // 타일 원점 계산 (레거시의 x, y0)
    const origin = getTileOrigin(tile, this.config, offsetX, offsetY, this.inradius);

    // 원점 기준 상대 좌표로 vertex 계산
    let vertices: { x: number; y: number }[];

    if (tile.isSideTile) {
      const sideVerts = getLeftRightTriangleVertices(
        this.config.width,
        this.config.height
      );
      vertices = tile.direction === 'left' ? sideVerts.left : sideVerts.right;
    } else {
      vertices = getUpDownTriangleVertices(
        this.config.width,
        this.config.height,
        this.inradius,
        tile.direction === 'up'
      );
    }

    // 스케일 적용: 삼각형의 기하학적 중심(centroid)을 기준으로 축소
    // 이렇게 해야 간격이 균일하게 유지됨
    const centroidX = (vertices[0].x + vertices[1].x + vertices[2].x) / 3;
    const centroidY = (vertices[0].y + vertices[1].y + vertices[2].y) / 3;

    const scaledPoints = vertices.map((v) => ({
      x: origin.x + centroidX + (v.x - centroidX) * this.scale,
      y: origin.y + centroidY + (v.y - centroidY) * this.scale,
    }));

    // 색상 결정: 구역 색상 + 상태에 따른 밝기 변화
    const zoneState = getZoneState(options);
    const fillColor = getZoneColor(tile.zone, zoneState);

    // 삼각형 그리기
    this.graphics.fillStyle(fillColor, this.config.fillAlpha);
    this.graphics.lineStyle(
      this.config.strokeWidth,
      this.config.strokeColor,
      this.config.fillAlpha
    );

    this.graphics.beginPath();
    this.graphics.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    this.graphics.lineTo(scaledPoints[1].x, scaledPoints[1].y);
    this.graphics.lineTo(scaledPoints[2].x, scaledPoints[2].y);
    this.graphics.closePath();

    this.graphics.fillPath();
    this.graphics.strokePath();

    // 이동 가능 오버레이 (movable 상태)
    if (options.movable) {
      this.graphics.fillStyle(MOVABLE_TILE.COLOR_HEX, MOVABLE_TILE.ALPHA);
      this.graphics.lineStyle(
        MOVABLE_TILE.STROKE_WIDTH,
        MOVABLE_TILE.STROKE_COLOR_HEX,
        0.8
      );

      this.graphics.beginPath();
      this.graphics.moveTo(scaledPoints[0].x, scaledPoints[0].y);
      this.graphics.lineTo(scaledPoints[1].x, scaledPoints[1].y);
      this.graphics.lineTo(scaledPoints[2].x, scaledPoints[2].y);
      this.graphics.closePath();

      this.graphics.fillPath();
      this.graphics.strokePath();
    }
  }

  /**
   * 타일 ID 텍스트 표시
   * 텍스트는 삼각형의 기하학적 중심(centroid)에 배치
   */
  showTileId(tile: TileMeta, offsetX: number, offsetY: number): void {
    // 타일 원점 계산
    const origin = getTileOrigin(tile, this.config, offsetX, offsetY, this.inradius);

    // 원점 기준 상대 좌표로 vertex 계산
    let vertices: { x: number; y: number }[];

    if (tile.isSideTile) {
      const sideVerts = getLeftRightTriangleVertices(
        this.config.width,
        this.config.height
      );
      vertices = tile.direction === 'left' ? sideVerts.left : sideVerts.right;
    } else {
      vertices = getUpDownTriangleVertices(
        this.config.width,
        this.config.height,
        this.inradius,
        tile.direction === 'up'
      );
    }

    // 스케일 적용: renderTile()과 동일한 centroid 기준 스케일링 사용
    const centroidX = (vertices[0].x + vertices[1].x + vertices[2].x) / 3;
    const centroidY = (vertices[0].y + vertices[1].y + vertices[2].y) / 3;

    const scaledPoints = vertices.map((v) => ({
      x: origin.x + centroidX + (v.x - centroidX) * this.scale,
      y: origin.y + centroidY + (v.y - centroidY) * this.scale,
    }));

    // 기하학적 중심(centroid) = 세 꼭짓점의 평균
    const centroid = {
      x: (scaledPoints[0].x + scaledPoints[1].x + scaledPoints[2].x) / 3,
      y: (scaledPoints[0].y + scaledPoints[1].y + scaledPoints[2].y) / 3,
    };

    // 기존 텍스트가 있으면 먼저 제거 (메모리 누수 방지)
    const existing = this.textObjects.get(tile.id);
    if (existing) {
      existing.destroy();
    }

    const text = this.scene.add
      .text(centroid.x, centroid.y, String(tile.id), {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

    this.textObjects.set(tile.id, text);
  }

  /**
   * 타일 ID 텍스트 숨기기
   */
  hideTileIds(): void {
    this.textObjects.forEach((text) => text.destroy());
    this.textObjects.clear();
  }

  /**
   * 그래픽 클리어
   */
  clear(): void {
    this.graphics.clear();
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    this.graphics.destroy();
    this.hideTileIds();
  }

  /**
   * 타일 설정 동적 업데이트 (반응형 레이아웃용)
   */
  updateConfig(newConfig: Partial<TileRenderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // 캐시된 계산값 재계산
    this.inradius = getInradius(this.config.width, this.config.height);
    this.scale = getScaleForGap(
      this.config.width,
      this.config.height,
      this.config.gap
    );
  }

  get tileConfig(): TileRenderConfig {
    return this.config;
  }

  get tileInradius(): number {
    return this.inradius;
  }

  get tileScale(): number {
    return this.scale;
  }
}
