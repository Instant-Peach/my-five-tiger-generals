# Story 1.6: 타일 좌표 시스템 (Tile Coordinate System)

Status: done

---

## Story

As a 개발자 (및 시스템),
I want 타일 좌표 시스템이 내부적으로 올바르게 동작하여 타일 ID, 행/열 좌표, 구역 정보가 정확하게 매핑된다,
so that 장수 이동, 전투 방향 판정, 승리 조건 확인 등 모든 게임 로직이 정확한 좌표 데이터를 기반으로 동작할 수 있다.

## Acceptance Criteria

1. **AC1**: 모든 34타일의 좌표가 정확하게 매핑된다
   - 메인 타일 0-29: row/col 좌표로 변환 가능
   - 측면 타일 30-33: 특수 좌표(-1 또는 5)로 구분 가능
   - TileId ↔ (row, col) 양방향 변환 함수 제공

2. **AC2**: 타일 방향(direction)이 올바르게 계산된다
   - 메인 타일: 짝수 ID = 'up'(▲), 홀수 ID = 'down'(▽)
   - 측면 타일: 좌측 = 'right', 우측 = 'left' (보드 안쪽을 향함)
   - 방향 정보가 공격 방향 판정에 활용 가능

3. **AC3**: 구역(zone) 정보가 정확하게 반환된다
   - player1_home: row 5 (타일 25-29) - Player 1 시작 배치, Player 2 노크 목표
   - player2_home: row 0 (타일 0-4) - Player 2 시작 배치, Player 1 노크 목표
   - center: row 1-4 (타일 5-24) - 중앙 구역
   - side: 타일 30-33 - 측면 특수 타일

4. **AC4**: 인접 타일 조회가 올바르게 동작한다
   - `getAdjacentTiles(tileId)`: 변 공유 인접 타일 배열 반환
   - `areAdjacent(a, b)`: 두 타일 인접 여부 boolean 반환
   - 측면 타일과 메인 타일 간 인접 관계 정확

5. **AC5**: 이동 범위 계산이 올바르게 동작한다
   - `getReachableTiles(from, distance, blocked)`: BFS 기반 도달 가능 타일 반환
   - 차단 타일 우회 로직 정확
   - 시작 타일 제외, 도달 가능 타일만 반환

6. **AC6**: 경로 탐색이 올바르게 동작한다
   - `findPath(from, to, blocked)`: 최단 경로 배열 또는 null 반환
   - 경로 없으면 null 반환
   - 시작 타일 제외, 목표 타일 포함

## Tasks / Subtasks

- [x] Task 1: 기존 좌표 시스템 검증 및 보완 (AC: 1, 2, 3)
  - [x] 1.1: TILE_META 34개 타일 모든 필드 검증 (id, direction, zone, row, col, isSideTile)
  - [x] 1.2: getTileMeta(tileId) 함수 테스트 - 모든 타일에 대해 정확한 메타데이터 반환 확인
  - [x] 1.3: getTileIdByRowCol(row, col) 함수 테스트 - 역방향 조회 정확성 확인
  - [x] 1.4: 측면 타일 특수 좌표 처리 검증 (col = -1 또는 5)

- [x] Task 2: 인접 관계 검증 (AC: 4)
  - [x] 2.1: EDGE_ADJACENCY_MAP 34개 타일 모든 인접 관계 검증
  - [x] 2.2: getAdjacentTiles() 함수 단위 테스트 작성
  - [x] 2.3: areAdjacent() 함수 단위 테스트 작성
  - [x] 2.4: 측면 타일 인접 관계 특별 검증 (30↔5,10 / 31↔15,20 / 32↔9,14 / 33↔19,24)

- [x] Task 3: 이동 범위 및 경로 탐색 검증 (AC: 5, 6)
  - [x] 3.1: getReachableTiles() 함수 다양한 시나리오 테스트
    - distance=1: 인접 타일만 반환
    - distance=2: 2칸 이내 모든 타일 반환
    - blocked 타일 우회 정확성
  - [x] 3.2: findPath() 함수 테스트
    - 인접 타일 경로: 길이 1
    - 대각선 경로: 여러 타일 거쳐 이동
    - 차단 시 우회 경로 찾기
    - 경로 없을 때 null 반환

- [x] Task 4: 공격 방향 판정 함수 구현 (AC: 2, 4)
  - [x] 4.1: getAttackDirection(attackerTile, defenderTile) 함수 구현
    - 인접하지 않으면 null 반환
    - 같은 열, 다른 행 → 'frontline'
    - 공격자보다 오른쪽 → 'sun'
    - 공격자보다 왼쪽 → 'moon'
  - [x] 4.2: 공격 방향 판정 단위 테스트 작성
  - [x] 4.3: 측면 타일 공격 방향 판정 검증

- [x] Task 5: 통합 테스트 및 문서화 (AC: 전체)
  - [x] 5.1: 좌표 시스템 통합 테스트 (실제 게임 시나리오 기반)
  - [x] 5.2: 모든 public API의 JSDoc 주석 완성
  - [x] 5.3: 좌표 시스템 README 또는 인라인 문서 작성 (옵션) - 인라인 문서로 대체

## Dev Notes

### 현재 구현 상태

좌표 시스템 핵심 구성요소가 이미 `game-core`에 구현되어 있음:

**1. 타입 정의** (`packages/game-core/src/board/types.ts`)
- `TileId`, `TileDirection`, `SideDirection`, `TileOrientation`
- `TileZone`: 'player1_home' | 'player2_home' | 'center' | 'side'
- `TileMeta` 인터페이스: id, direction, zone, row, col, isSideTile
- `AttackDirection`: 'sun' | 'moon' | 'frontline'

**2. 타일 메타데이터** (`packages/game-core/src/board/tileMeta.ts`)
- `TILE_META`: 34개 타일 전체 메타데이터 배열
- `getTileMeta(tileId)`: ID로 메타데이터 조회
- `getTileIdByRowCol(row, col)`: 행/열로 타일 ID 조회

**3. 인접 관계** (`packages/game-core/src/board/adjacency.ts`)
- `EDGE_ADJACENCY_MAP`: 34개 타일 인접 관계 맵
- `getAdjacentTiles(tileId)`: 인접 타일 조회
- `areAdjacent(a, b)`: 인접 여부 확인
- `getReachableTiles(from, distance, blocked)`: BFS 이동 범위
- `findPath(from, to, blocked)`: 최단 경로 탐색

### 보완이 필요한 부분

1. **공격 방향 판정 함수 미구현**
   - `types.ts`에 `AttackDirection` 타입은 정의되어 있으나
   - 실제 두 타일 간 공격 방향 판정 함수가 없음
   - `getAttackDirection(attackerTile, defenderTile)` 함수 구현 필요

2. **단위 테스트 부족**
   - 현재 좌표 시스템 관련 테스트 파일 확인 필요
   - 모든 AC에 대한 체계적인 테스트 작성 필요

3. **타일 방향과 공격 방향 연관 로직**
   - 타일 방향(up/down)과 공격 방향(sun/moon/frontline) 연계 로직 명확화

### 공격 방향 판정 로직 (아키텍처 문서 기반)

```
보드 레이아웃 (서버/데이터 관점):
         Row 0: [0,  1,  2,  3,  4]   ← player2_home
         Row 1: [5,  6,  7,  8,  9]
Side 30 ─────── Row 2: [10, 11, 12, 13, 14] ───────── Side 32
Side 31 ─────── Row 3: [15, 16, 17, 18, 19] ───────── Side 33
         Row 4: [20, 21, 22, 23, 24]
         Row 5: [25, 26, 27, 28, 29]  ← player1_home

공격 방향 판정:
- 전선(Frontline) ⚔️: 같은 열, 다른 행 (수직 방향)
- 해(Sun) ☀️: 공격자보다 col이 큰 쪽 (우측 대각선)
- 달(Moon) 🌙: 공격자보다 col이 작은 쪽 (좌측 대각선)
```

### 구현 예시

```typescript
// packages/game-core/src/board/direction.ts (신규 파일)

import type { TileId, AttackDirection } from './types';
import { getTileMeta } from './tileMeta';
import { areAdjacent } from './adjacency';

/**
 * 두 타일 간 공격 방향 판정
 *
 * @param attackerTile 공격자 타일 ID
 * @param defenderTile 방어자 타일 ID
 * @returns 공격 방향 또는 null (인접하지 않은 경우)
 */
export function getAttackDirection(
  attackerTile: TileId,
  defenderTile: TileId
): AttackDirection | null {
  // 인접하지 않으면 공격 불가
  if (!areAdjacent(attackerTile, defenderTile)) {
    return null;
  }

  const attacker = getTileMeta(attackerTile);
  const defender = getTileMeta(defenderTile);

  if (!attacker || !defender) {
    return null;
  }

  // 측면 타일 특수 처리
  if (attacker.isSideTile || defender.isSideTile) {
    // 측면 타일은 항상 해/달 방향
    // 측면 타일(col = -1 또는 5)과 메인 타일 간 공격
    if (attacker.isSideTile) {
      // 측면에서 메인으로 공격
      return attacker.col === -1 ? 'sun' : 'moon'; // 좌측→우측=sun, 우측→좌측=moon
    } else {
      // 메인에서 측면으로 공격
      return defender.col === -1 ? 'moon' : 'sun'; // 좌측으로=moon, 우측으로=sun
    }
  }

  // 메인 타일 간 공격
  // 같은 열, 다른 행 → 전선
  if (attacker.col === defender.col) {
    return 'frontline';
  }

  // 공격자보다 col이 큰 쪽 → 해 (우측)
  if (defender.col > attacker.col) {
    return 'sun';
  }

  // 공격자보다 col이 작은 쪽 → 달 (좌측)
  return 'moon';
}
```

### 테스트 시나리오

**1. 타일 메타데이터 검증**
```typescript
// 메인 타일 검증
expect(getTileMeta(0)).toEqual({ id: 0, direction: 'up', zone: 'player2_home', row: 0, col: 0, isSideTile: false });
expect(getTileMeta(25)).toEqual({ id: 25, direction: 'down', zone: 'player1_home', row: 5, col: 0, isSideTile: false });

// 측면 타일 검증
expect(getTileMeta(30)).toEqual({ id: 30, direction: 'right', zone: 'side', row: 2, col: -1, isSideTile: true });
expect(getTileMeta(32)).toEqual({ id: 32, direction: 'left', zone: 'side', row: 2, col: 5, isSideTile: true });
```

**2. 인접 관계 검증**
```typescript
// 기본 인접
expect(areAdjacent(0, 1)).toBe(true);
expect(areAdjacent(0, 5)).toBe(true);
expect(areAdjacent(0, 6)).toBe(false); // 대각선은 인접 아님

// 측면 타일 인접
expect(areAdjacent(5, 30)).toBe(true);
expect(areAdjacent(10, 30)).toBe(true);
expect(areAdjacent(0, 30)).toBe(false); // row 0은 측면과 인접 안함
```

**3. 공격 방향 검증**
```typescript
// 전선 공격 (같은 열, 다른 행)
expect(getAttackDirection(0, 5)).toBe('frontline'); // 0→5: 위→아래
expect(getAttackDirection(5, 0)).toBe('frontline'); // 5→0: 아래→위

// 해 공격 (우측)
expect(getAttackDirection(0, 1)).toBe('sun'); // col 0 → col 1
expect(getAttackDirection(5, 6)).toBe('sun'); // col 0 → col 1

// 달 공격 (좌측)
expect(getAttackDirection(1, 0)).toBe('moon'); // col 1 → col 0
expect(getAttackDirection(6, 5)).toBe('moon'); // col 1 → col 0

// 인접하지 않은 타일
expect(getAttackDirection(0, 2)).toBe(null);
```

### Project Structure Notes

**아키텍처 경계 준수:**
- 모든 좌표 로직은 `packages/game-core/src/board/`에 위치
- Phaser 의존성 없음 - 순수 TypeScript
- game-renderer는 game-core의 좌표 데이터만 사용

**파일 구조:**
```
packages/game-core/src/board/
├── types.ts       # 타입 정의 (TileId, TileMeta, AttackDirection 등)
├── tileMeta.ts    # 34타일 메타데이터, getTileMeta(), getTileIdByRowCol()
├── adjacency.ts   # 인접 맵, getAdjacentTiles(), getReachableTiles(), findPath()
├── direction.ts   # [신규] getAttackDirection()
└── index.ts       # public API export
```

**패턴 준수:**
- 상수는 `as const` 타입 좁히기
- 함수는 순수 함수 (부수 효과 없음)
- Result 패턴 필요 없음 (null 반환으로 에러 표현)

### 성능 고려사항

- `TILE_META`와 `EDGE_ADJACENCY_MAP`은 상수로 초기화 시 한 번만 생성
- `getTileMeta()`는 O(n) 검색 → 자주 호출 시 Map으로 최적화 고려
- `getReachableTiles()`와 `findPath()`는 BFS O(V+E) - 34타일 작은 그래프에서 충분히 빠름

### References

- [Source: _bmad-output/game-architecture.md#삼각형 보드 시스템] - ID 기반 보드 시스템 설계
- [Source: _bmad-output/game-architecture.md#방향성 전투 시스템] - 공격 방향 판정 로직
- [Source: _bmad-output/gdd.md#Grid System and Movement] - 타일 구역 정의
- [Source: _bmad-output/gdd.md#Positioning and Tactics] - 해/달/전선 방향 설명
- [Source: _bmad-output/epics.md#Epic 1: 보드 시스템] - Story [BOARD-006]
- [Source: packages/game-core/src/board/types.ts] - 현재 타입 정의
- [Source: packages/game-core/src/board/tileMeta.ts] - 현재 메타데이터 구현
- [Source: packages/game-core/src/board/adjacency.ts] - 현재 인접 관계 구현

### 이전 스토리 학습 사항

**1-5 진영 시각적 구분에서:**
- ZONE_COLORS가 game-core로 이동됨 → 아키텍처 경계 준수의 좋은 예
- 구역(zone) 정보가 렌더링에 활용됨 → 정확한 zone 데이터 필수

**1-1~1-4 스토리에서:**
- 보드 레이아웃과 타일 배치가 안정적으로 동작
- 선택/호버/하이라이트 기능이 좌표 시스템에 의존
- 반응형 레이아웃에서도 좌표 일관성 유지

### 복잡도 평가

**복잡도: 2 (단일 컴포넌트/함수)**
- 대부분 기존 구현 검증 및 테스트 작성
- 신규 구현은 `getAttackDirection()` 함수 하나
- 아키텍처 변경 없음, 기존 패턴 준수

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 없음 (모든 테스트 첫 시도에 통과)

### Completion Notes List

1. **Task 1 완료**: 기존 좌표 시스템 검증 및 보완
   - TILE_META 34개 타일 모든 필드 검증 테스트 추가
   - getTileMeta(), getTileIdByRowCol() 함수 단위 테스트 작성
   - 측면 타일 특수 좌표(col=-1, col=5) 처리 검증

2. **Task 2 완료**: 인접 관계 검증
   - EDGE_ADJACENCY_MAP 34개 타일 모든 인접 관계 검증
   - 대칭성, 자기 참조 불가, 타일 타입별 인접 개수 테스트
   - getAdjacentTiles(), areAdjacent() 포괄적 단위 테스트
   - 측면 타일 인접 관계 특별 검증 (30↔5,10 / 31↔15,20 / 32↔9,14 / 33↔19,24)

3. **Task 3 완료**: 이동 범위 및 경로 탐색 검증
   - getReachableTiles() 다양한 시나리오 테스트 (distance, blocked, side tiles)
   - findPath() 포괄적 테스트 (최단 경로, 우회 경로, 차단 시나리오)
   - 측면 타일 경로 탐색 검증

4. **Task 4 완료**: 공격 방향 판정 함수 구현
   - `packages/game-core/src/board/direction.ts` 신규 파일 생성
   - getAttackDirection() 함수 구현 (frontline/sun/moon 판정)
   - 측면 타일 공격 방향 특수 처리 로직
   - 26개 공격 방향 단위 테스트 작성

5. **Task 5 완료**: 통합 테스트 및 문서화
   - 게임 시나리오 기반 통합 테스트 (초기 배치, 이동, 전투, 노크)
   - direction.ts에 JSDoc 주석 완성
   - 인라인 문서로 코드 내 문서화 완료

### File List

**신규 파일:**
- `packages/game-core/src/board/direction.ts` - 공격 방향 판정 함수

**수정 파일:**
- `packages/game-core/src/board/index.ts` - getAttackDirection export 추가
- `packages/game-core/tests/board.test.ts` - 19개 → 119개 테스트 (100개 신규 추가)

### Test Results

- 총 132개 테스트 통과 (board.test.ts: 119개, colors.test.ts: 13개)
- 테스트 실행 시간: ~36ms

---

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-02-03
**Result:** ✅ APPROVED (with fixes applied)

### Issues Found & Fixed

| Severity | Issue | Resolution |
|----------|-------|------------|
| MEDIUM | 스토리 테스트 수 기록 부정확 (84개 → 100개) | 문서 수정 완료 |
| MEDIUM | getTileMeta() O(n) 검색 → O(1) 최적화 필요 | 인덱스 접근으로 최적화 |
| LOW | adjacency.ts 주석 불일치 | 주석 정리 완료 |

### Verification

- 모든 132개 테스트 통과
- 빌드 성공
- 아키텍처 경계 준수 확인 (game-core에 Phaser 의존성 없음)
- 모든 6개 AC 구현 확인

### Change Log Entry

- 2026-02-03: Code Review 완료 - getTileMeta() O(1) 최적화, 문서/주석 수정
