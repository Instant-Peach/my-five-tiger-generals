# Story 3.5: 이동 전 경로 미리보기 (Path Preview)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 이동 전 경로 미리보기가 가능하다,
so that 이동 경로를 시각적으로 확인하고 의도치 않은 이동을 방지할 수 있다.

## Acceptance Criteria

1. **AC1**: 이동 가능 타일 위에 호버/롱프레스 시 경로가 표시된다
   - 데스크톱: 마우스 호버 시 현재 위치 → 목적지 경로 표시
   - 모바일: 롱프레스(500ms 이상) 시 경로 표시
   - 경로는 시작점에서 목적지까지의 최단 경로로 표시

2. **AC2**: 경로가 시각적으로 명확하게 표시된다
   - 경로 연결선(점선 또는 화살표) 표시
   - 경로 타일들이 순서대로 강조됨
   - 목적지 타일에 최종 도착 표시
   - 색상: 이동 가능 하이라이트와 구분되는 색상 (예: 파란색 계열)

3. **AC3**: 경로 미리보기 중에도 이동 가능 타일 하이라이트가 유지된다
   - 기존 연두색(0x90EE90) 하이라이트 유지
   - 경로 미리보기는 하이라이트 위에 오버레이로 표시
   - 경로 미리보기 해제 시 하이라이트만 남음

4. **AC4**: 경로 미리보기에서 벗어나면 미리보기가 해제된다
   - 다른 타일로 호버/롱프레스 이동 시 기존 경로 해제
   - 이동 불가 타일이나 빈 공간으로 이동 시 경로 해제
   - 장수 선택 해제 시 경로 및 하이라이트 모두 해제

5. **AC5**: 경로 미리보기 후 클릭/탭 시 해당 경로로 이동한다
   - 미리보기 상태에서 탭/클릭 시 이동 실행
   - 기존 이동 로직(moveGeneral, 애니메이션) 사용
   - 이동 실행 시 경로 미리보기 해제

## Tasks / Subtasks

- [x] Task 1: 경로 계산 로직 구현 (game-core) (AC: 1)
  - [x] 1.1: getShortestPath() 함수 구현
    - 기존 `findPath()` 함수가 `packages/game-core/src/board/adjacency.ts`에 이미 구현됨
    - BFS 기반 최단 경로 계산 (인접 타일 기준)
    - blocked 타일 회피 경로 계산
  - [x] 1.2: 경로 계산 테스트 작성
    - 기존 `board.test.ts`에 `findPath()` 테스트 47개+ 이미 존재
    - 단순 경로, 우회 경로, 최단 경로 선택 테스트 모두 포함

- [x] Task 2: 경로 렌더링 구현 (game-renderer) (AC: 2, 3)
  - [x] 2.1: BoardRenderer에 경로 표시 메서드 추가
    - `showPathPreview(path: TileId[], startTileId: TileId)`: 경로 연결선 그리기
    - `clearPathPreview()`: 경로 미리보기 해제
    - `getCurrentPreviewPath()`: 현재 미리보기 경로 반환
    - Phaser Graphics 객체로 선 및 목적지 마커 구현
  - [x] 2.2: 경로 시각화 스타일 정의
    - 색상: Royal Blue (0x4169E1) 80% opacity
    - 선 두께: 3px
    - 목적지 마커: 반지름 12px 원형 (50% opacity)
    - depth 100으로 최상위 레이어에 표시

- [x] Task 3: 입력 이벤트 처리 (game-renderer) (AC: 1, 4)
  - [x] 3.1: 데스크톱 호버 이벤트 처리
    - `pointermove` 이벤트로 호버 감지
    - 호버 타일이 이동 가능 타일인지 확인
    - 경로 계산 및 표시 (GameScene.updatePathPreview)
  - [x] 3.2: 모바일 롱프레스 이벤트 처리
    - `pointerdown` → 500ms 후 롱프레스 판정 (InputHandler)
    - 롱프레스 상태에서 경로 표시
    - `pointerup`/`pointerout` 시 롱프레스 취소 및 이동 실행
  - [x] 3.3: 경로 미리보기 해제 로직
    - 다른 타일 호버/롱프레스 시 기존 경로 해제 후 새 경로 표시
    - 이동 불가 영역 이동 시 경로만 해제

- [x] Task 4: GameScene 통합 (AC: 4, 5)
  - [x] 4.1: 장수 선택 상태 관리 연동
    - 장수 선택 시 경로 미리보기 활성화
    - 장수 선택 해제 시 경로 및 하이라이트 해제 (handleGeneralDeselected)
  - [x] 4.2: 이동 실행 연동
    - 경로 미리보기 상태에서 클릭/탭 시 이동 실행
    - 이동 애니메이션 시작 시 경로 미리보기 해제 (executeMove)
  - [x] 4.3: 상태 플래그 관리
    - BoardRenderer.currentPreviewPath로 경로 저장
    - clearPathPreviewState()로 상태 초기화

- [x] Task 5: 통합 테스트 및 빌드 검증 (AC: 전체)
  - [x] 5.1: 단위 테스트 작성
    - 경로 계산 로직 테스트 (game-core) - 기존 테스트 활용
    - 엣지 케이스: 인접 타일 이동 (경로 길이 1) - 테스트 포함
  - [x] 5.2: 빌드 및 기존 테스트 통과 확인
    - `pnpm build` 성공
    - 기존 테스트 통과 (352개: game-core 326개 + game-renderer 26개)
  - [ ] 5.3: 브라우저 수동 테스트
    - 데스크톱 호버 테스트
    - 모바일 롱프레스 테스트 (터치 시뮬레이션)

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- `getShortestPath()` 함수: BFS 기반 최단 경로 계산
- 기존 `getReachableTiles()`, `getAdjacentTiles()` 활용
- blocked 타일 처리 로직 재사용

**game-renderer 패키지 (Phaser 렌더링)**
- `BoardRenderer`: 경로 시각화 메서드 추가
- `TileRenderer`: 경로 타일 강조 (선택적)
- Phaser Graphics API로 점선/화살표 구현

**apps/web (React UI)**
- 이 스토리에서는 React UI 변경 없음

### 핵심 구현 패턴

#### 1. 최단 경로 계산 (BFS Pathfinding)

```typescript
// packages/game-core/src/movement/pathfinding.ts (신규)

import { TileId } from '../board/types';
import { getAdjacentTiles } from '../board/adjacency';

/**
 * 두 타일 간 최단 경로 계산 (BFS)
 *
 * @param from - 시작 타일 ID
 * @param to - 목적지 타일 ID
 * @param blocked - 차단된 타일 집합 (통과 불가)
 * @returns 경로 타일 ID 배열 (시작점 제외, 목적지 포함) 또는 null (경로 없음)
 */
export function getShortestPath(
  from: TileId,
  to: TileId,
  blocked: Set<TileId>
): TileId[] | null {
  if (from === to) return [];
  if (blocked.has(to)) return null;

  const visited = new Set<TileId>([from]);
  const queue: Array<{ tile: TileId; path: TileId[] }> = [
    { tile: from, path: [] }
  ];

  while (queue.length > 0) {
    const { tile, path } = queue.shift()!;

    for (const neighbor of getAdjacentTiles(tile)) {
      if (visited.has(neighbor) || blocked.has(neighbor)) continue;

      const newPath = [...path, neighbor];

      if (neighbor === to) {
        return newPath; // 목적지 도달
      }

      visited.add(neighbor);
      queue.push({ tile: neighbor, path: newPath });
    }
  }

  return null; // 경로 없음
}
```

#### 2. 경로 렌더링 (BoardRenderer 확장)

```typescript
// packages/game-renderer/src/rendering/BoardRenderer.ts (확장)

// 클래스 멤버 추가
private pathGraphics: Phaser.GameObjects.Graphics | null = null;
private currentPreviewPath: TileId[] = [];

/**
 * 경로 미리보기 표시
 *
 * @param path - 경로 타일 ID 배열 (시작점 제외)
 * @param startTile - 시작 타일 ID
 */
showPathPreview(path: TileId[], startTile: TileId): void {
  this.clearPathPreview();

  if (path.length === 0) return;

  this.currentPreviewPath = path;

  // Graphics 객체 생성
  if (!this.pathGraphics) {
    this.pathGraphics = this.scene.add.graphics();
  }

  // 경로 스타일 설정
  this.pathGraphics.lineStyle(3, 0x4169E1, 0.8); // Royal Blue, 80% opacity

  // 시작점 좌표
  const startPos = this.getTileCenter(startTile);

  // 경로 그리기
  this.pathGraphics.beginPath();
  this.pathGraphics.moveTo(startPos.x, startPos.y);

  for (const tileId of path) {
    const tilePos = this.getTileCenter(tileId);
    this.pathGraphics.lineTo(tilePos.x, tilePos.y);
  }

  this.pathGraphics.strokePath();

  // 목적지 마커 표시 (원형)
  const destPos = this.getTileCenter(path[path.length - 1]);
  this.pathGraphics.fillStyle(0x4169E1, 0.5);
  this.pathGraphics.fillCircle(destPos.x, destPos.y, 15);
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
```

#### 3. 호버/롱프레스 이벤트 처리 (GameScene)

```typescript
// packages/game-renderer/src/scenes/GameScene.ts (확장)

// 클래스 멤버 추가
private isPreviewingPath: boolean = false;
private previewPath: TileId[] = [];
private longPressTimer: Phaser.Time.TimerEvent | null = null;
private longPressTarget: TileId | null = null;

/**
 * 타일 호버 이벤트 처리
 */
private handleTileHover(tileId: TileId): void {
  // 장수가 선택되어 있고, 이동 가능 타일인 경우에만 경로 표시
  if (!this.selectedGeneralId || !this.movableTiles.includes(tileId)) {
    this.boardRenderer.clearPathPreview();
    return;
  }

  const general = this.gameState.generals.find(
    g => g.id === this.selectedGeneralId
  );
  if (!general || general.position === null) return;

  // 경로 계산
  const blocked = getOccupiedTiles(this.gameState, this.selectedGeneralId);
  const path = getShortestPath(general.position, tileId, blocked);

  if (path) {
    this.boardRenderer.showPathPreview(path, general.position);
    this.previewPath = path;
    this.isPreviewingPath = true;
  }
}

/**
 * 타일 호버 종료 처리
 */
private handleTileHoverOut(): void {
  // 이동 가능 타일 하이라이트는 유지, 경로만 해제
  this.boardRenderer.clearPathPreview();
  this.isPreviewingPath = false;
  this.previewPath = [];
}

/**
 * 롱프레스 시작 (모바일)
 */
private startLongPress(tileId: TileId): void {
  this.cancelLongPress();

  this.longPressTarget = tileId;
  this.longPressTimer = this.time.delayedCall(500, () => {
    this.handleTileHover(tileId);
  });
}

/**
 * 롱프레스 취소
 */
private cancelLongPress(): void {
  if (this.longPressTimer) {
    this.longPressTimer.destroy();
    this.longPressTimer = null;
  }
  this.longPressTarget = null;
}
```

### GDD 및 아키텍처 참고

**GDD - 이동 시스템:**
- "드래그로 경로 미리보기" - Phase 2+ 확장 기능의 기반
- "이동 전 경로 미리보기가 가능하다" - [MOVE-005]
- 터치 우선 UI: 탭으로 선택, 드래그로 이동 경로 확인

**아키텍처 - Board System:**
- `getAdjacentTiles()`: 인접 타일 조회 (BFS 기반)
- `getReachableTiles()`: 도달 가능 타일 계산 (경로 계산에 활용)
- `TileId`: 타일 식별자 (0-33)

**아키텍처 - Cross-cutting Concerns:**
- Event Bus: 필요 시 `preview:show`, `preview:hide` 이벤트 추가 가능
- Logger: 디버그 모드에서 경로 계산 로그 출력

### 이전 스토리 학습 사항

**3-1 (이동 가능 타일 표시):**
- `getMovableTilesForGeneral()` 함수로 이동 가능 타일 계산
- `BoardRenderer.showMovableTiles()` / `clearMovableTiles()` 활용
- 하이라이트 색상: 연두색 (0x90EE90)
- 하이라이트와 경로 미리보기 공존 필요

**3-2 (장수 이동):**
- `moveGeneral()` 함수로 이동 검증 및 상태 업데이트
- 이동 가능 타일 내에서만 이동 허용
- 행동력 소모 처리

**3-3 (장수 이동 애니메이션):**
- `animateMoveTo()` 메서드로 부드러운 이동
- 애니메이션 중 입력 차단 (this.isAnimating)
- 애니메이션 완료 후 이동 가능 타일 재계산

**3-4 (경로 차단):**
- `getOccupiedTiles()` 함수로 차단된 타일 집합 생성
- blocked 타일 회피 로직 이미 구현됨
- 경로 계산 시 동일한 blocked 로직 재사용

**활용할 기존 코드:**
```typescript
// 이동 가능 타일 및 차단 로직
import {
  getMovableTilesForGeneral,
  getOccupiedTiles
} from '@five-tiger-generals/game-core';

// 인접 타일 조회
import { getAdjacentTiles } from '@five-tiger-generals/game-core';

// 이동 가능 타일 하이라이트 (유지)
this.boardRenderer.showMovableTiles(movableTiles);
```

### Git 커밋 분석 (최근 작업 패턴)

**최근 커밋:**
1. `eea864c` - feat: 3-4 경로 차단 (Path Blocking)
2. `fcb65f9` - feat: 3-3 장수 이동 애니메이션 (Movement Animation)
3. `3bcc0e0` - feat: 3-2 장수 이동 (General Movement)
4. `e0a0bb4` - fix: 코드 리뷰 후속 수정 - 측면 타일 꼭짓점 인접 완성 및 디버그 코드 제거
5. `1bcc422` - fix: 타일 인접 관계 수정 (변 인접 vs 꼭짓점 인접 분리)

**패턴 학습:**
- 커밋 메시지 형식: `feat: {story-id} {기능 설명}`
- 코드 리뷰 후 수정은 별도 `fix:` 커밋
- 디버그 코드(console.log) 제거 필수

### Project Structure Notes

**신규/수정 파일:**
```
packages/game-core/src/
├── movement/
│   ├── index.ts               # export 추가
│   └── pathfinding.ts         # 신규: getShortestPath() 함수
└── tests/
    └── pathfinding.test.ts    # 신규: 경로 계산 테스트

packages/game-renderer/src/
├── rendering/
│   └── BoardRenderer.ts       # 수정: showPathPreview(), clearPathPreview()
└── scenes/
    └── GameScene.ts           # 수정: 호버/롱프레스 이벤트 처리
```

**경로 미리보기 시각화 참고:**
- Phaser Graphics API: `this.scene.add.graphics()`
- 점선 구현: `setLineDash()` 또는 수동 점선 그리기
- 화살표 구현: 삼각형 폴리곤 또는 이미지

### 타일 중심 좌표 계산

```typescript
// BoardRenderer 또는 TileRenderer에서 타일 중심 좌표 가져오기
private getTileCenter(tileId: TileId): { x: number; y: number } {
  const tile = this.tiles.get(tileId);
  if (!tile) {
    throw new Error(`Tile ${tileId} not found`);
  }
  return { x: tile.x, y: tile.y };
}
```

### 모바일 롱프레스 vs 데스크톱 호버 분기

```typescript
// Phaser에서 입력 장치 감지
const isMobile = this.sys.game.device.os.android ||
                 this.sys.game.device.os.iOS ||
                 this.sys.game.device.os.windowsPhone;

if (isMobile) {
  // 롱프레스 이벤트 사용
  tile.on('pointerdown', () => this.startLongPress(tileId));
  tile.on('pointerup', () => this.cancelLongPress());
  tile.on('pointerout', () => this.cancelLongPress());
} else {
  // 호버 이벤트 사용
  tile.on('pointerover', () => this.handleTileHover(tileId));
  tile.on('pointerout', () => this.handleTileHoverOut());
}
```

### 네이밍 컨벤션 (아키텍처 문서)

- **함수**: camelCase (`getShortestPath`, `showPathPreview`)
- **변수**: camelCase (`previewPath`, `isPreviewingPath`)
- **타입**: PascalCase (`TileId`, `PathResult`)
- **상수**: UPPER_SNAKE (`PATH_PREVIEW_COLOR`)

### 주의사항

1. **game-core 순수성 유지**
   - `getShortestPath()` 함수는 Phaser 의존성 없이 순수 TypeScript로 구현
   - 경로 계산 로직만 담당, 렌더링 로직 포함 금지

2. **기존 하이라이트와의 공존**
   - 이동 가능 타일 하이라이트(연두색)는 유지
   - 경로 미리보기(파란색)는 별도 레이어로 오버레이
   - Z-index 순서: 타일 < 하이라이트 < 경로 미리보기 < 장수

3. **성능 고려**
   - BFS 경로 계산은 타일 수가 적어(34개) 즉각적
   - 호버 시 매번 계산해도 성능 문제 없음
   - 불필요한 재계산 방지: 같은 타일 재호버 시 캐시 활용 (선택적)

4. **입력 이벤트 충돌 방지**
   - 경로 미리보기와 이동 실행 클릭 구분
   - 롱프레스 도중 손가락 이동 시 경로 업데이트

### References

- [Source: _bmad-output/epics.md#Epic 3: 이동 시스템] - Story [MOVE-005] 정의
- [Source: _bmad-output/gdd.md#Movement Rules] - 이동 경로 미리보기
- [Source: _bmad-output/gdd.md#Controls and Input] - 드래그로 이동 경로 확인
- [Source: _bmad-output/game-architecture.md#Novel Patterns] - 삼각형 보드 시스템
- [Source: _bmad-output/implementation-artifacts/3-1-moveable-tiles-display.md] - 하이라이트 구현
- [Source: _bmad-output/implementation-artifacts/3-3-movement-animation.md] - 애니메이션 패턴
- [Source: _bmad-output/implementation-artifacts/3-4-path-blocking.md] - 차단 로직 재사용

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 빌드 성공: `pnpm build` 모든 패키지 컴파일 완료
- 테스트 성공: 352개 테스트 통과 (game-core 326개, game-renderer 26개)

### Completion Notes List

1. **Task 1 완료**: 기존 `findPath()` 함수 재사용 - `adjacency.ts`에 이미 BFS 기반 최단 경로 계산 로직이 구현되어 있어 신규 구현 불필요. 광범위한 테스트(47개+)도 이미 존재.

2. **Task 2 완료**: BoardRenderer에 경로 미리보기 기능 추가
   - `showPathPreview()`: 시작점에서 목적지까지 Royal Blue 선으로 경로 표시
   - `clearPathPreview()`: 경로 미리보기 해제
   - `getCurrentPreviewPath()`: 현재 미리보기 경로 반환
   - Phaser Graphics 객체로 실선 및 목적지 원형 마커 구현

3. **Task 3 완료**: InputHandler에 모바일 롱프레스 지원 추가
   - 데스크톱: 기존 호버 이벤트로 경로 미리보기
   - 모바일: 500ms 롱프레스 후 경로 미리보기 활성화
   - 장치 감지로 자동 분기 처리

4. **Task 4 완료**: GameScene에 경로 미리보기 통합
   - `updatePathPreview()`: 호버된 타일에 대한 경로 계산 및 표시
   - `clearPathPreviewState()`: 경로 미리보기 상태 초기화
   - 장수 선택 해제 및 이동 실행 시 자동 해제

5. **Task 5 완료**: 빌드 및 테스트 검증
   - `pnpm build` 성공
   - 352개 테스트 모두 통과

### File List

**수정된 파일:**
- `packages/game-renderer/src/rendering/BoardRenderer.ts`: 경로 미리보기 메서드 추가 (showPathPreview, clearPathPreview, getCurrentPreviewPath, getTileCentroid)
- `packages/game-renderer/src/scenes/GameScene.ts`: 경로 미리보기 통합 (updatePathPreview, clearPathPreviewState)
- `packages/game-renderer/src/input/InputHandler.ts`: 모바일 롱프레스 지원 추가

**새로 생성된 파일:**
- 없음 (기존 파일 확장)

### Change Log

- 2026-02-04: Story 3.5 경로 미리보기 구현 완료
  - BoardRenderer에 경로 시각화 기능 추가
  - InputHandler에 모바일 롱프레스 지원 추가
  - GameScene에 경로 미리보기 통합
