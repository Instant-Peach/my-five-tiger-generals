/**
 * 인접 타일 맵
 *
 * 34타일의 인접 관계를 하드코딩합니다.
 * - 변 공유(edge contact): 직접 이동 가능
 * - 꼭짓점 공유(vertex contact): 특수 책략에서 사용
 *
 * 보드 레이아웃 (짝수=Up▲, 홀수=Down▽):
 *   row 0: [▲0,  ▽1,  ▲2,  ▽3,  ▲4]
 *   row 1: [▽5,  ▲6,  ▽7,  ▲8,  ▽9]
 *   row 2: [▲10, ▽11, ▲12, ▽13, ▲14]
 *   row 3: [▽15, ▲16, ▽17, ▲18, ▽19]
 *   row 4: [▲20, ▽21, ▲22, ▽23, ▲24]
 *   row 5: [▽25, ▲26, ▽27, ▲28, ▽29]
 *
 * 삼각형 인접 규칙:
 * - Up(▲): 좌우 변(같은 행 ±1), 아래 변(다음 행 같은 col)
 * - Down(▽): 좌우 변(같은 행 ±1), 위 변(이전 행 같은 col)
 *
 * 측면 타일 (우측/좌측 삼각형):
 *   30: 좌측 상단 (row 1-2) - ▶ 방향, 5, 10과 변 공유
 *   31: 좌측 하단 (row 3-4) - ▶ 방향, 15, 20과 변 공유
 *   32: 우측 상단 (row 1-2) - ◀ 방향, 9, 14와 변 공유
 *   33: 우측 하단 (row 3-4) - ◀ 방향, 19, 24와 변 공유
 */

import type { TileId } from './types';
import { isValidTileId } from '../constants/board';

/**
 * 변 공유 인접 맵 (edge contact)
 * 기본 이동에 사용됩니다.
 *
 * 규칙:
 * - Up(▲) 타일: 좌(col-1), 우(col+1), 아래(다음 행 같은 col의 Down)
 * - Down(▽) 타일: 좌(col-1), 우(col+1), 위(이전 행 같은 col의 Up)
 */
export const EDGE_ADJACENCY_MAP: ReadonlyMap<TileId, readonly TileId[]> =
  new Map([
    // Row 0: [▲0, ▽1, ▲2, ▽3, ▲4]
    [0, [1, 5]], // ▲: 우측(1), 아래(5)
    [1, [0, 2]], // ▽: 좌측(0), 우측(2) - 위(row -1)는 없음
    [2, [1, 3, 7]], // ▲: 좌측(1), 우측(3), 아래(7)
    [3, [2, 4]], // ▽: 좌측(2), 우측(4)
    [4, [3, 9]], // ▲: 좌측(3), 아래(9)

    // Row 1: [▽5, ▲6, ▽7, ▲8, ▽9]
    [5, [0, 6, 30]], // ▽: 위(0), 우측(6), 측면(30)
    [6, [5, 7, 11]], // ▲: 좌측(5), 우측(7), 아래(11)
    [7, [2, 6, 8]], // ▽: 위(2), 좌측(6), 우측(8)
    [8, [7, 9, 13]], // ▲: 좌측(7), 우측(9), 아래(13)
    [9, [4, 8, 32]], // ▽: 위(4), 좌측(8), 측면(32)

    // Row 2: [▲10, ▽11, ▲12, ▽13, ▲14]
    [10, [11, 15, 30]], // ▲: 우측(11), 아래(15), 측면(30)
    [11, [6, 10, 12]], // ▽: 위(6), 좌측(10), 우측(12)
    [12, [11, 13, 17]], // ▲: 좌측(11), 우측(13), 아래(17)
    [13, [8, 12, 14]], // ▽: 위(8), 좌측(12), 우측(14)
    [14, [13, 19, 32]], // ▲: 좌측(13), 아래(19), 측면(32)

    // Row 3: [▽15, ▲16, ▽17, ▲18, ▽19]
    [15, [10, 16, 31]], // ▽: 위(10), 우측(16), 측면(31)
    [16, [15, 17, 21]], // ▲: 좌측(15), 우측(17), 아래(21)
    [17, [12, 16, 18]], // ▽: 위(12), 좌측(16), 우측(18)
    [18, [17, 19, 23]], // ▲: 좌측(17), 우측(19), 아래(23)
    [19, [14, 18, 33]], // ▽: 위(14), 좌측(18), 측면(33)

    // Row 4: [▲20, ▽21, ▲22, ▽23, ▲24]
    [20, [21, 25, 31]], // ▲: 우측(21), 아래(25), 측면(31)
    [21, [16, 20, 22]], // ▽: 위(16), 좌측(20), 우측(22)
    [22, [21, 23, 27]], // ▲: 좌측(21), 우측(23), 아래(27)
    [23, [18, 22, 24]], // ▽: 위(18), 좌측(22), 우측(24)
    [24, [23, 29, 33]], // ▲: 좌측(23), 아래(29), 측면(33)

    // Row 5: [▽25, ▲26, ▽27, ▲28, ▽29]
    [25, [20, 26]], // ▽: 위(20), 우측(26)
    [26, [25, 27]], // ▲: 좌측(25), 우측(27) - 아래(row 6)는 없음
    [27, [22, 26, 28]], // ▽: 위(22), 좌측(26), 우측(28)
    [28, [27, 29]], // ▲: 좌측(27), 우측(29)
    [29, [24, 28]], // ▽: 위(24), 좌측(28)

    // 측면 타일 (▶/◀ 방향)
    [30, [5, 10]], // 좌측 상단: 5(▽), 10(▲)과 변 공유
    [31, [15, 20]], // 좌측 하단: 15(▽), 20(▲)과 변 공유
    [32, [9, 14]], // 우측 상단: 9(▽), 14(▲)와 변 공유
    [33, [19, 24]], // 우측 하단: 19(▽), 24(▲)와 변 공유
  ]);

/**
 * 꼭짓점 공유 인접 맵 (vertex contact)
 * 특수 책략에서 사용됩니다.
 * 변 공유는 포함하지 않고, 순수하게 꼭짓점만 공유하는 타일입니다.
 *
 * 규칙:
 * - Up(▲) 타일: 위쪽 꼭짓점과 맞닿는 타일들 (이전 행의 col-1, col, col+1 중 Down 타일)
 * - Down(▽) 타일: 아래쪽 꼭짓점과 맞닿는 타일들 (다음 행의 col-1, col, col+1 중 Up 타일)
 */
export const VERTEX_ADJACENCY_MAP: ReadonlyMap<TileId, readonly TileId[]> =
  new Map([
    // Row 0: [▲0, ▽1, ▲2, ▽3, ▲4]
    [0, []], // ▲: 위 꼭짓점 - row -1 없음
    [1, [6]], // ▽: 아래 꼭짓점 - 6(▲)
    [2, [1, 3]], // ▲: 위 꼭짓점 - 1(▽), 3(▽)
    [3, [8]], // ▽: 아래 꼭짓점 - 8(▲)
    [4, [3]], // ▲: 위 꼭짓점 - 3(▽)

    // Row 1: [▽5, ▲6, ▽7, ▲8, ▽9]
    [5, [10]], // ▽: 아래 꼭짓점 - 10(▲)
    [6, [1, 5, 7]], // ▲: 위 꼭짓점 - 1(▽), 5(▽), 7(▽)
    [7, [12]], // ▽: 아래 꼭짓점 - 12(▲)
    [8, [3, 7, 9]], // ▲: 위 꼭짓점 - 3(▽), 7(▽), 9(▽)
    [9, [14]], // ▽: 아래 꼭짓점 - 14(▲)

    // Row 2: [▲10, ▽11, ▲12, ▽13, ▲14]
    [10, [5, 11]], // ▲: 위 꼭짓점 - 5(▽), 11(▽)
    [11, [16]], // ▽: 아래 꼭짓점 - 16(▲)
    [12, [7, 11, 13]], // ▲: 위 꼭짓점 - 7(▽), 11(▽), 13(▽)
    [13, [18]], // ▽: 아래 꼭짓점 - 18(▲)
    [14, [9, 13]], // ▲: 위 꼭짓점 - 9(▽), 13(▽)

    // Row 3: [▽15, ▲16, ▽17, ▲18, ▽19]
    [15, [20]], // ▽: 아래 꼭짓점 - 20(▲)
    [16, [11, 15, 17]], // ▲: 위 꼭짓점 - 11(▽), 15(▽), 17(▽)
    [17, [22]], // ▽: 아래 꼭짓점 - 22(▲)
    [18, [13, 17, 19]], // ▲: 위 꼭짓점 - 13(▽), 17(▽), 19(▽)
    [19, [24]], // ▽: 아래 꼭짓점 - 24(▲)

    // Row 4: [▲20, ▽21, ▲22, ▽23, ▲24]
    [20, [15, 21]], // ▲: 위 꼭짓점 - 15(▽), 21(▽)
    [21, [26]], // ▽: 아래 꼭짓점 - 26(▲)
    [22, [17, 21, 23]], // ▲: 위 꼭짓점 - 17(▽), 21(▽), 23(▽)
    [23, [28]], // ▽: 아래 꼭짓점 - 28(▲)
    [24, [19, 23]], // ▲: 위 꼭짓점 - 19(▽), 23(▽)

    // Row 5: [▽25, ▲26, ▽27, ▲28, ▽29]
    [25, []], // ▽: 아래 꼭짓점 - row 6 없음
    [26, [21, 25, 27]], // ▲: 위 꼭짓점 - 21(▽), 25(▽), 27(▽)
    [27, []], // ▽: 아래 꼭짓점 - row 6 없음
    [28, [23, 27, 29]], // ▲: 위 꼭짓점 - 23(▽), 27(▽), 29(▽)
    [29, []], // ▽: 아래 꼭짓점 - row 6 없음

    // 측면 타일 - 꼭짓점 인접
    // 측면 타일은 인접한 메인 타일들의 이웃 타일 및 상하 측면 타일과 꼭짓점 공유
    [30, [0, 6, 11, 15, 31]], // 좌측 상단: 0(▲), 6(▲), 11(▽), 15(▽), 31(측면)
    [31, [30, 10, 16, 21, 25]], // 좌측 하단: 30(측면), 10(▲), 16(▲), 21(▽), 25(▽)
    [32, [4, 8, 13, 19, 33]], // 우측 상단: 4(▲), 8(▲), 13(▽), 19(▽), 33(측면)
    [33, [32, 14, 18, 23, 29]], // 우측 하단: 32(측면), 14(▲), 18(▲), 23(▽), 29(▽)
  ]);

/**
 * 인접 타일 조회 (변 공유)
 * 기본 이동에 사용됩니다.
 */
export function getAdjacentTiles(tileId: TileId): readonly TileId[] {
  if (!isValidTileId(tileId)) {
    return [];
  }
  return EDGE_ADJACENCY_MAP.get(tileId) ?? [];
}

/**
 * 꼭짓점 인접 타일 조회 (꼭짓점 공유, 변 공유 제외)
 * 특수 책략에서 사용됩니다.
 */
export function getVertexAdjacentTiles(tileId: TileId): readonly TileId[] {
  if (!isValidTileId(tileId)) {
    return [];
  }
  return VERTEX_ADJACENCY_MAP.get(tileId) ?? [];
}

/**
 * 두 타일이 변으로 인접한지 확인
 */
export function areAdjacent(tileA: TileId, tileB: TileId): boolean {
  const neighbors = getAdjacentTiles(tileA);
  return neighbors.includes(tileB);
}

/**
 * 두 타일이 꼭짓점으로 인접한지 확인 (변 공유 제외)
 */
export function areVertexAdjacent(tileA: TileId, tileB: TileId): boolean {
  const neighbors = getVertexAdjacentTiles(tileA);
  return neighbors.includes(tileB);
}

/**
 * 특정 거리 내 도달 가능한 타일 계산 (BFS)
 *
 * @param from 시작 타일 ID
 * @param distance 최대 이동 거리
 * @param blocked 차단된 타일 ID 집합
 * @returns 도달 가능한 타일 ID 배열
 */
export function getReachableTiles(
  from: TileId,
  distance: number,
  blocked: ReadonlySet<TileId> = new Set()
): TileId[] {
  if (!isValidTileId(from) || distance < 0) {
    return [];
  }

  const visited = new Set<TileId>([from]);
  const queue: Array<{ id: TileId; dist: number }> = [{ id: from, dist: 0 }];
  const result: TileId[] = [];

  while (queue.length > 0) {
    const { id: current, dist } = queue.shift()!;

    // 시작 타일은 결과에 포함하지 않음
    if (dist > 0) {
      result.push(current);
    }

    // 최대 거리에 도달하면 더 이상 탐색하지 않음
    if (dist >= distance) {
      continue;
    }

    // 인접 타일 탐색
    for (const neighbor of getAdjacentTiles(current)) {
      if (!visited.has(neighbor) && !blocked.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ id: neighbor, dist: dist + 1 });
      }
    }
  }

  return result;
}

/**
 * 두 타일 간 최단 경로 찾기 (BFS)
 *
 * @param from 시작 타일 ID
 * @param to 목표 타일 ID
 * @param blocked 차단된 타일 ID 집합
 * @returns 경로 배열 (시작 타일 제외, 목표 타일 포함) 또는 null (경로 없음)
 */
export function findPath(
  from: TileId,
  to: TileId,
  blocked: ReadonlySet<TileId> = new Set()
): TileId[] | null {
  if (!isValidTileId(from) || !isValidTileId(to)) {
    return null;
  }

  if (from === to) {
    return [];
  }

  const visited = new Set<TileId>([from]);
  const parent = new Map<TileId, TileId>();
  const queue: TileId[] = [from];

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const neighbor of getAdjacentTiles(current)) {
      if (visited.has(neighbor) || blocked.has(neighbor)) {
        continue;
      }

      visited.add(neighbor);
      parent.set(neighbor, current);

      if (neighbor === to) {
        // 경로 재구성
        const path: TileId[] = [];
        let node: TileId | undefined = to;
        while (node !== undefined && node !== from) {
          path.unshift(node);
          node = parent.get(node);
        }
        return path;
      }

      queue.push(neighbor);
    }
  }

  return null; // 경로 없음
}
