/**
 * 보드 타일 타입 정의
 *
 * 삼각형 테셀레이션 보드의 핵심 타입을 정의합니다.
 * 34타일: 메인 30개 (6행 × 5열) + 측면 4개
 */

/** 타일 ID (0-33) - 레거시 호환을 위해 0-based */
export type TileId = number;

/** 타일 방향 - 삼각형이 위/아래를 향하는지 */
export type TileDirection = 'up' | 'down';

/** 측면 타일 방향 - 좌/우를 향하는지 */
export type SideDirection = 'left' | 'right';

/** 타일 방향 통합 타입 */
export type TileOrientation = TileDirection | SideDirection;

/**
 * 타일 영역 (서버/데이터 관점 - 고정)
 * - player1_home: row 5 (타일 25-29) - player1 시작 배치, player2 노크 목표
 * - player2_home: row 0 (타일 0-4) - player2 시작 배치, player1 노크 목표
 * - center: row 1-4 (타일 5-24) - 중앙 구역
 * - side: 타일 30-33 - 측면 특수 타일
 */
export type TileZone = 'player1_home' | 'player2_home' | 'center' | 'side';

/**
 * 타일 메타데이터
 */
export interface TileMeta {
  /** 타일 고유 ID (0-33) */
  id: TileId;
  /** 삼각형 방향 */
  direction: TileOrientation;
  /** 타일 영역 */
  zone: TileZone;
  /** 행 인덱스 (0-5, 측면 타일은 가상 좌표) */
  row: number;
  /** 열 인덱스 (0-4, 측면 타일은 -1 또는 5) */
  col: number;
  /** 측면 타일 여부 */
  isSideTile: boolean;
}

/**
 * 공격 방향
 * - sun: 해 (우측 대각선 방향)
 * - moon: 달 (좌측 대각선 방향)
 * - frontline: 전선 (수직 방향, 변 공유)
 */
export type AttackDirection = 'sun' | 'moon' | 'frontline';

/**
 * 이동 방향 (6방향)
 */
export type MoveDirection =
  | 'up'
  | 'down'
  | 'upLeft'
  | 'upRight'
  | 'downLeft'
  | 'downRight';
