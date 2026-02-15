# Story 3.1: 이동 가능 타일 표시 (Moveable Tiles Display)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 장수 선택 시 이동 가능 타일을 볼 수 있다,
so that 어디로 이동할 수 있는지 명확히 파악하고 전략적 결정을 내릴 수 있다.

## Acceptance Criteria

1. **AC1**: 자신의 장수를 선택하면 해당 장수의 이동 가능 타일이 하이라이트된다
   - 장수의 `speed` (발) 스탯에 따라 이동 범위 계산
   - 현재 위치에서 `speed` 칸 이내의 모든 타일 하이라이트
   - 시작 타일(현재 위치)은 결과에 포함하지 않음

2. **AC2**: 다른 장수가 위치한 타일은 이동 가능 범위에서 제외된다
   - 아군 장수가 있는 타일: 이동 불가 (통과도 불가)
   - 적군 장수가 있는 타일: 이동 불가 (통과도 불가)
   - 차단된 타일 너머로도 이동 불가 (경로 차단)

3. **AC3**: 이동 가능 타일이 시각적으로 구분된다
   - 이동 가능 타일: 밝은 녹색/청록색 하이라이트
   - 기존 선택 하이라이트와 명확히 구분
   - 하이라이트 애니메이션 (선택적: 펄스/깜빡임)

4. **AC4**: 장수 선택 해제 시 이동 가능 타일 하이라이트가 사라진다
   - 다른 타일 클릭 시 선택 해제
   - 같은 장수 다시 클릭 시 토글
   - 상대 턴에는 선택 불가

5. **AC5**: 이동 범위 계산이 정확하다
   - BFS 알고리즘으로 최단 거리 계산
   - 측면 타일(30-33)도 포함
   - 이동 불가 타일(차단된 타일)을 우회하는 경로 고려

## Tasks / Subtasks

- [x] Task 1: 이동 가능 타일 계산 로직 연동 (AC: 1, 2, 5)
  - [x] 1.1: `getMovableTiles()` 헬퍼 함수 생성
    - `packages/game-core/src/movement/index.ts` 생성
    - `getReachableTiles()` 래핑하여 장수 기반 API 제공
    - 차단된 타일 Set 생성 (모든 장수 위치)
  - [x] 1.2: GameState 쿼리 함수 확장
    - `packages/game-core/src/movement/index.ts`에 통합
    - `getOccupiedTiles(state)` 함수 추가
    - `getMovableTilesForGeneral(state, generalId)` 함수 추가

- [x] Task 2: 타일 하이라이트 렌더링 구현 (AC: 3)
  - [x] 2.1: `TileRenderer` 이동 가능 상태 추가
    - `packages/game-renderer/src/rendering/TileRenderer.ts` 수정
    - `renderTile()` 옵션에 `movable` 추가
    - MOVABLE_TILE 상수 사용
  - [x] 2.2: 하이라이트 스타일 구현
    - 반투명 오버레이 (fillAlpha: 0.4)
    - 청록색 계열 (#10B981)
    - 선택 하이라이트와 명확히 구분

- [x] Task 3: BoardRenderer 이동 가능 타일 표시 메서드 (AC: 1, 3, 4)
  - [x] 3.1: `showMovableTiles()` 메서드 구현
    - `packages/game-renderer/src/rendering/BoardRenderer.ts` 수정
    - 타일 ID 배열을 받아 해당 타일들 하이라이트
  - [x] 3.2: `clearMovableTiles()` 메서드 구현
    - 모든 타일의 movable 상태 해제
    - 선택 해제 시 호출

- [x] Task 4: GameScene에서 선택-이동 가능 타일 연동 (AC: 1, 4)
  - [x] 4.1: 장수 선택 시 이동 가능 타일 표시
    - `handleGeneralSelected()` 확장
    - getMovableTilesForGeneral() 호출
    - boardRenderer.showMovableTiles() 호출
  - [x] 4.2: 선택 해제 시 하이라이트 제거
    - `handleGeneralDeselected()` 확장
    - boardRenderer.clearMovableTiles() 호출
  - [x] 4.3: 턴 검증 (기존 구현 활용)
    - selectGeneral()에서 이미 턴 검증 수행
    - 상대 턴 시 선택 불가

- [x] Task 5: 이동 가능 타일 상수 정의 (AC: 3)
  - [x] 5.1: `packages/game-core/src/constants/movement.ts` 생성
    - MOVABLE_TILE 상수 정의 (COLOR, ALPHA, STROKE)
  - [x] 5.2: index.ts에서 export

- [x] Task 6: 테스트 작성 (AC: 전체)
  - [x] 6.1: Vitest 단위 테스트 (24개 테스트)
    - getOccupiedTiles() 테스트
    - getMovableTilesForGeneral() 테스트
    - 차단 경로 테스트 (우회 케이스)
    - 경계 케이스 (speed=0, 모든 타일 차단)
  - [x] 6.2: 통합 테스트
    - 빌드 성공 확인 (pnpm build)
    - 기존 테스트 통과 확인 (286개 테스트)

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 이동 로직: `packages/game-core/src/movement/index.ts` (신규)
- 쿼리 함수: `packages/game-core/src/state/queries.ts`
- 색상 상수: `packages/game-core/src/constants/movement.ts` (신규)
- `getReachableTiles()` 함수는 이미 `board/adjacency.ts`에 구현됨

**game-renderer 패키지 (Phaser 렌더링)**
- TileRenderer: setMovable() 메서드 추가
- BoardRenderer: showMovableTiles(), clearMovableTiles() 메서드 추가
- GameScene: 장수 선택 이벤트에서 이동 가능 타일 표시

**apps/web (React UI)**
- 이 스토리에서는 React UI 변경 없음
- Phaser 씬에서 직접 처리

### 핵심 구현 패턴

#### 1. 이동 가능 타일 계산 (game-core)

```typescript
// packages/game-core/src/movement/index.ts

import { getReachableTiles } from '../board/adjacency';
import type { TileId } from '../board/types';
import type { General, GeneralId } from '../generals/types';
import type { GameState } from '../state/types';

/**
 * 게임 상태에서 모든 장수가 점유한 타일 ID 집합 반환
 */
export function getOccupiedTiles(state: GameState): Set<TileId> {
  const occupied = new Set<TileId>();
  for (const general of state.generals) {
    if (general.position !== null && general.status === 'active') {
      occupied.add(general.position);
    }
  }
  return occupied;
}

/**
 * 특정 장수의 이동 가능 타일 계산
 *
 * @param state - 현재 게임 상태
 * @param generalId - 이동할 장수 ID
 * @returns 이동 가능한 타일 ID 배열 (빈 배열 = 이동 불가)
 */
export function getMovableTilesForGeneral(
  state: GameState,
  generalId: GeneralId
): TileId[] {
  const general = state.generals.find(g => g.id === generalId);

  // 장수를 찾을 수 없거나 위치가 없으면 빈 배열
  if (!general || general.position === null) {
    return [];
  }

  // active 상태가 아니면 이동 불가
  if (general.status !== 'active') {
    return [];
  }

  // 차단된 타일 = 모든 장수 위치 (자기 자신 제외)
  const blocked = getOccupiedTiles(state);
  blocked.delete(general.position); // 자기 위치는 차단에서 제외

  // BFS로 이동 가능 타일 계산
  return getReachableTiles(general.position, general.stats.speed, blocked);
}
```

#### 2. 이동 가능 색상 상수

```typescript
// packages/game-core/src/constants/movement.ts

/** 이동 가능 타일 하이라이트 색상 */
export const MOVABLE_TILE = {
  /** 하이라이트 색상 (청록색 계열) */
  COLOR: '#10B981',  // emerald-500
  /** 16진수 숫자 형식 */
  COLOR_HEX: 0x10B981,
  /** 하이라이트 투명도 */
  ALPHA: 0.4,
  /** 테두리 색상 */
  STROKE_COLOR: '#059669',  // emerald-600
  STROKE_COLOR_HEX: 0x059669,
  /** 테두리 두께 */
  STROKE_WIDTH: 2,
} as const;
```

#### 3. TileRenderer 이동 가능 상태 추가

```typescript
// packages/game-renderer/src/rendering/TileRenderer.ts (수정)

import { MOVABLE_TILE } from '@five-tiger-generals/game-core';

export class TileRenderer {
  // ... 기존 속성들
  private movableOverlay: Phaser.GameObjects.Graphics | null = null;
  private isMovable: boolean = false;

  // ... 기존 메서드들

  /**
   * 이동 가능 상태 설정
   */
  setMovable(movable: boolean): void {
    if (this.isMovable === movable) return;
    this.isMovable = movable;

    if (movable) {
      this.showMovableOverlay();
    } else {
      this.hideMovableOverlay();
    }
  }

  /**
   * 이동 가능 오버레이 표시
   */
  private showMovableOverlay(): void {
    if (this.movableOverlay) return;

    this.movableOverlay = this.scene.add.graphics();
    this.movableOverlay.fillStyle(MOVABLE_TILE.COLOR_HEX, MOVABLE_TILE.ALPHA);
    this.movableOverlay.lineStyle(
      MOVABLE_TILE.STROKE_WIDTH,
      MOVABLE_TILE.STROKE_COLOR_HEX,
      0.8
    );

    // 삼각형 경로 그리기 (기존 drawTriangle 로직 재사용)
    this.drawTrianglePath(this.movableOverlay);
    this.movableOverlay.fillPath();
    this.movableOverlay.strokePath();

    // 컨테이너에 추가
    this.container.add(this.movableOverlay);
  }

  /**
   * 이동 가능 오버레이 숨기기
   */
  private hideMovableOverlay(): void {
    if (this.movableOverlay) {
      this.movableOverlay.destroy();
      this.movableOverlay = null;
    }
  }

  /**
   * 삼각형 경로 그리기 (오버레이용)
   */
  private drawTrianglePath(graphics: Phaser.GameObjects.Graphics): void {
    const { direction } = this.tileMeta;
    const size = this.size;
    const h = size * Math.sqrt(3) / 2;

    graphics.beginPath();

    if (direction === 'up') {
      graphics.moveTo(0, -h / 2);
      graphics.lineTo(-size / 2, h / 2);
      graphics.lineTo(size / 2, h / 2);
    } else if (direction === 'down') {
      graphics.moveTo(0, h / 2);
      graphics.lineTo(-size / 2, -h / 2);
      graphics.lineTo(size / 2, -h / 2);
    }
    // 측면 타일은 별도 처리 필요시 추가

    graphics.closePath();
  }

  /**
   * 정리
   */
  destroy(): void {
    this.hideMovableOverlay();
    // ... 기존 destroy 로직
  }
}
```

#### 4. BoardRenderer 이동 가능 타일 표시

```typescript
// packages/game-renderer/src/rendering/BoardRenderer.ts (수정)

export class BoardRenderer {
  // ... 기존 코드

  private movableTileIds: Set<TileId> = new Set();

  /**
   * 이동 가능 타일 하이라이트 표시
   */
  showMovableTiles(tileIds: TileId[]): void {
    // 이전 하이라이트 제거
    this.clearMovableTiles();

    // 새 하이라이트 표시
    for (const tileId of tileIds) {
      const tileRenderer = this.tileRenderers.get(tileId);
      if (tileRenderer) {
        tileRenderer.setMovable(true);
        this.movableTileIds.add(tileId);
      }
    }
  }

  /**
   * 이동 가능 타일 하이라이트 제거
   */
  clearMovableTiles(): void {
    for (const tileId of this.movableTileIds) {
      const tileRenderer = this.tileRenderers.get(tileId);
      if (tileRenderer) {
        tileRenderer.setMovable(false);
      }
    }
    this.movableTileIds.clear();
  }
}
```

#### 5. GameScene 장수 선택 시 이동 가능 타일 표시

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (수정)

import { getMovableTilesForGeneral } from '@five-tiger-generals/game-core';

export class GameScene extends Phaser.Scene {
  // ... 기존 코드

  /**
   * 장수 선택 처리
   */
  private handleGeneralSelected(generalId: GeneralId): void {
    const general = this.gameState.generals.find(g => g.id === generalId);
    if (!general) return;

    // 턴 검증: 현재 플레이어의 장수만 선택 가능
    if (general.owner !== this.gameState.currentPlayer) {
      return;
    }

    // 기존 선택 하이라이트 로직
    this.generalRenderer.setSelected(generalId, true);

    // 이동 가능 타일 계산 및 표시
    const movableTiles = getMovableTilesForGeneral(this.gameState, generalId);
    this.boardRenderer.showMovableTiles(movableTiles);

    // UI 상태 업데이트 (Zustand)
    // ... 기존 코드
  }

  /**
   * 장수 선택 해제 처리
   */
  private handleGeneralDeselected(): void {
    // 이동 가능 타일 하이라이트 제거
    this.boardRenderer.clearMovableTiles();

    // 기존 선택 해제 로직
    // ... 기존 코드
  }
}
```

### GDD 및 아키텍처 참고

**GDD - 이동 시스템:**
- 인접 이동만 지원: 변을 공유하는 타일로만 이동
- 대각 이동 불가: 기본적으로 꼭짓점만 공유하는 타일로는 이동 불가
- 장수별 발(이동력): 발 스탯에 따라 이동 범위 결정
- 경로 상 적 기물 존재 시 이동 불가

**아키텍처 - 보드 시스템:**
- `getReachableTiles()`: BFS 기반 도달 가능 타일 계산 (이미 구현됨)
- `getAdjacentTiles()`: 변 공유 인접 타일 조회 (이미 구현됨)
- `areAdjacent()`: 두 타일 인접 여부 확인 (이미 구현됨)

**아키텍처 - 상태 관리:**
- GameState에서 generals 배열로 모든 장수 위치 추적
- general.position: 현재 타일 ID (null = 배치 전/OUT)
- general.stats.speed: 이동력 (발 스탯)

### 이전 스토리 학습 사항

**Epic 1 (보드 시스템)에서:**
- TileRenderer 클래스 구조 확립
- setSelected() 메서드로 선택 하이라이트 구현
- 삼각형 경로 그리기 로직 존재

**Epic 2 Story 2-2 (장수 선택)에서:**
- handleGeneralSelected/Deselected 이벤트 핸들러 구현
- gameState.selectedGeneralId로 선택 상태 관리
- 턴 검증 패턴 (currentPlayer 확인)

**Epic 2 Story 2-4 (플레이어 색상)에서:**
- 색상 상수 정의 패턴 (PLAYER_COLORS)
- hexToNumber() 헬퍼 함수 활용

### 기존 구현 활용

**이미 구현된 핵심 로직:**
```typescript
// packages/game-core/src/board/adjacency.ts

// 이동 가능 타일 계산 - BFS 알고리즘
export function getReachableTiles(
  from: TileId,
  distance: number,
  blocked: ReadonlySet<TileId> = new Set()
): TileId[] {
  // BFS로 distance 칸 내의 모든 도달 가능 타일 반환
  // blocked 타일은 통과 불가
}

// 인접 타일 조회
export function getAdjacentTiles(tileId: TileId): readonly TileId[]

// 인접 여부 확인
export function areAdjacent(tileA: TileId, tileB: TileId): boolean
```

**장수 스탯 구조:**
```typescript
// packages/game-core/src/generals/types.ts

interface GeneralStats {
  star: number;   // 최대 병력
  sun: number;    // 해 공격/방어
  moon: number;   // 달 공격/방어
  speed: number;  // 이동력 (발 스탯) ← 이동 범위 결정
}

interface General {
  id: GeneralId;
  stats: GeneralStats;
  position: TileId | null;  // 현재 위치
  status: GeneralStatus;    // active/out/standby
}
```

### Project Structure Notes

**신규 파일:**
```
packages/game-core/src/
├── movement/
│   └── index.ts                    # 이동 시스템 로직
│       - getOccupiedTiles() 함수
│       - getMovableTilesForGeneral() 함수
│
└── constants/
    └── movement.ts                 # 이동 관련 상수
        - MOVABLE_TILE 색상/스타일
```

**수정 파일:**
```
packages/game-core/src/
├── state/
│   └── queries.ts                  # 쿼리 함수 확장 (선택적)
│
├── constants/
│   └── index.ts                    # movement 모듈 export 추가
│
└── index.ts                        # movement 모듈 export 추가

packages/game-renderer/src/
├── rendering/
│   ├── TileRenderer.ts             # setMovable() 메서드 추가
│   │   - movableOverlay 속성
│   │   - showMovableOverlay() 메서드
│   │   - hideMovableOverlay() 메서드
│   │
│   └── BoardRenderer.ts            # 이동 가능 타일 표시
│       - showMovableTiles() 메서드
│       - clearMovableTiles() 메서드
│
└── scenes/
    └── GameScene.ts                # 선택 시 이동 타일 표시
        - handleGeneralSelected() 수정
        - handleGeneralDeselected() 수정
```

**테스트 파일:**
```
packages/game-core/tests/
└── movement/
    └── index.test.ts               # 이동 시스템 테스트
        - getOccupiedTiles() 테스트
        - getMovableTilesForGeneral() 테스트
        - 차단 경로 테스트
        - 경계값 테스트
```

### 이동 가능 타일 시각화 가이드

**하이라이트 스타일:**

| 상태 | 색상 | 투명도 | 테두리 |
|------|------|--------|--------|
| 선택됨 (기존) | 노란색 (#FCD34D) | 0.5 | 없음 |
| 이동 가능 (신규) | 청록색 (#10B981) | 0.4 | #059669, 2px |
| 공격 가능 (Epic 4) | 빨간색 (예정) | - | - |

**레이어 순서 (z-index):**
1. 타일 배경
2. 이동 가능 오버레이
3. 선택 오버레이
4. 장수 스프라이트

### 네이밍 컨벤션 (아키텍처 문서)

- **함수**: camelCase (`getMovableTilesForGeneral`, `getOccupiedTiles`)
- **상수**: UPPER_SNAKE (`MOVABLE_TILE`)
- **메서드**: camelCase (`setMovable`, `showMovableTiles`, `clearMovableTiles`)
- **속성**: camelCase (`movableOverlay`, `isMovable`, `movableTileIds`)

### References

- [Source: _bmad-output/epics.md#Epic 3: 이동 시스템] - Story [MOVE-001] 정의
- [Source: _bmad-output/gdd.md#Movement Rules] - 인접 이동, 발 스탯 기반 범위
- [Source: _bmad-output/gdd.md#Pathfinding Visualization] - 이동 가능 타일 하이라이트
- [Source: _bmad-output/game-architecture.md#Triangular Board System] - getReachableTiles() 패턴
- [Source: packages/game-core/src/board/adjacency.ts] - getReachableTiles(), getAdjacentTiles()
- [Source: packages/game-core/src/generals/types.ts] - GeneralStats.speed, General.position
- [Source: packages/game-renderer/src/rendering/TileRenderer.ts] - setSelected() 패턴
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - handleGeneralSelected() 이벤트

## Future Work / Technical Debt

### 타일 인접 관계 검증 필요

**배경**: 이동 가능 타일 표시 구현 중 변 인접(edge-adjacent)과 꼭짓점 인접(vertex-adjacent)이 혼동되어 있음을 발견하고 수정함.

**수정 내용 (2026-02-04)**:
- `EDGE_ADJACENCY_MAP` 전면 재작성 - 변으로 접하는 타일만 포함
- `VERTEX_ADJACENCY_MAP` 신규 추가 - 꼭짓점으로만 접하는 타일 별도 관리
- `getVertexAdjacentTiles()`, `areVertexAdjacent()` 함수 추가

**추후 확인 필요**:
- [ ] 34개 모든 타일의 변 인접 목록이 정확한지 수동/시각적 검증
- [ ] 34개 모든 타일의 꼭짓점 인접 목록이 정확한지 수동/시각적 검증
- [x] 측면 타일(30-33)의 꼭짓점 인접 관계 정의 ✓ (2026-02-04 추가)
  - 30: [0, 6, 11, 15, 31] - 좌측 상단
  - 31: [30, 10, 16, 21, 25] - 좌측 하단
  - 32: [4, 8, 13, 19, 33] - 우측 상단
  - 33: [32, 14, 18, 23, 29] - 우측 하단

**삼각형 인접 규칙 요약**:
- Up(▲) 타일: 좌변, 우변, 아래 변 → 최대 3개 변 인접
- Down(▽) 타일: 좌변, 우변, 위 변 → 최대 3개 변 인접
- 같은 col의 위/아래 타일이라도 방향에 따라 꼭짓점 인접일 수 있음

**관련 파일**: `packages/game-core/src/board/adjacency.ts`

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- 모든 Task 완료 (6개)
- 전체 테스트 통과 (286개, movement 24개 추가)
- 빌드 성공 (pnpm build)
- Red-Green-Refactor 사이클 적용

### File List

**신규 생성:**
- `packages/game-core/src/movement/index.ts` - getOccupiedTiles(), getMovableTilesForGeneral()
- `packages/game-core/src/constants/movement.ts` - MOVABLE_TILE 상수
- `packages/game-core/tests/movement.test.ts` - 24개 단위 테스트

**수정:**
- `packages/game-core/src/index.ts` - movement 모듈 export 추가
- `packages/game-core/src/constants/index.ts` - MOVABLE_TILE export 추가
- `packages/game-core/src/board/adjacency.ts` - 변 인접 vs 꼭짓점 인접 분리, 측면 타일 꼭짓점 인접 추가
- `packages/game-core/src/board/index.ts` - 꼭짓점 인접 관련 함수 export 추가
- `packages/game-core/tests/board.test.ts` - 인접 관계 테스트 개선
- `packages/game-renderer/src/rendering/TileRenderer.ts` - movable 옵션 추가
- `packages/game-renderer/src/rendering/BoardRenderer.ts` - showMovableTiles(), clearMovableTiles() 추가, 렌더링 순서 수정
- `packages/game-renderer/src/scenes/GameScene.ts` - 장수 선택 시 이동 가능 타일 표시 연동
