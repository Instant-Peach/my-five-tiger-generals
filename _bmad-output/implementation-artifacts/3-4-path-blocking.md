# Story 3.4: 경로 차단 (Path Blocking)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 적 기물이 경로를 차단하면 이동 불가로 표시된다,
so that 전략적으로 상대방의 이동을 방해하고, 이동 가능 범위를 직관적으로 파악할 수 있다.

## Acceptance Criteria

1. **AC1**: 이동 경로 상에 적 장수가 있으면 해당 경로로의 이동이 차단된다
   - 적 장수가 위치한 타일로는 이동 불가
   - 적 장수를 통과하여 그 너머 타일로 이동 불가
   - BFS 탐색 시 적 장수 위치를 blocked 집합에 포함

2. **AC2**: 아군 장수도 경로를 차단한다
   - 아군 장수가 위치한 타일로는 이동 불가
   - 아군 장수를 통과하여 그 너머 타일로 이동 불가
   - 적/아군 구분 없이 모든 장수 위치가 차단 대상

3. **AC3**: 차단된 경로는 이동 가능 타일 계산에서 제외된다
   - `getMovableTilesForGeneral()` 함수에서 blocked 타일 처리
   - 하이라이트에 차단된 타일이 표시되지 않음
   - 장수 선택 시 차단 상태가 즉시 반영됨

4. **AC4**: 차단으로 인해 이동 범위가 제한될 수 있다
   - 발 스탯이 3이어도 중간에 장수가 있으면 2칸만 이동 가능
   - 막다른 골목 상황(사방이 막힘) 처리
   - 이동 가능 타일이 0개일 수 있음

5. **AC5**: 차단 상태가 시각적으로 명확하게 전달된다
   - 이동 불가 타일은 하이라이트되지 않음 (기본 동작)
   - 장수가 있는 타일은 해당 장수 스프라이트로 구분 가능
   - (선택적) 호버 시 "이동 불가" 피드백 표시

## Tasks / Subtasks

- [x] Task 1: getMovableTilesForGeneral() 함수에 차단 로직 구현 (AC: 1, 2, 3, 4)
  - [x] 1.1: 현재 보드 상태에서 모든 장수 위치 수집
    - `packages/game-core/src/movement/index.ts` 수정 (기존 구현 확인)
    - GameState에서 모든 장수의 position 추출 (getOccupiedTiles 함수)
    - 이동하려는 장수 자신은 제외
  - [x] 1.2: blocked 집합에 장수 위치 추가
    - 적/아군 구분 없이 모든 장수 위치 포함
    - getReachableTiles() 호출 시 blocked 파라미터로 전달
  - [x] 1.3: 기존 테스트 호환성 확인 및 수정
    - 기존 테스트에서 장수 위치 없이 호출하는 경우 처리
    - 새로운 차단 테스트 케이스 추가 (movement.test.ts에 포함됨)

- [x] Task 2: 경로 차단 단위 테스트 작성 (AC: 1, 2, 4)
  - [x] 2.1: 적 장수에 의한 차단 테스트
    - 인접 타일에 적 장수가 있으면 해당 타일 이동 불가
    - 적 장수 너머 타일로 이동 불가 확인
  - [x] 2.2: 아군 장수에 의한 차단 테스트
    - 아군 장수가 있는 타일도 이동 불가
    - 적/아군 동일하게 차단 동작 확인
  - [x] 2.3: 복합 차단 시나리오 테스트
    - 여러 장수에 의한 복합 차단
    - 완전히 포위된 상황 (이동 가능 타일 0개)
    - 우회 경로가 있는 상황

- [x] Task 3: GameScene에서 차단 상태 반영 확인 (AC: 3, 5)
  - [x] 3.1: 장수 선택 시 차단 반영 확인
    - handleTileSelect()에서 이동 가능 타일 계산 시 자동 적용
    - 차단된 타일이 하이라이트에서 제외됨
  - [x] 3.2: 빌드 및 통합 테스트
    - pnpm build 성공 확인
    - 기존 테스트 통과 확인 (326개 테스트 통과)
    - 브라우저에서 수동 테스트 가능

- [ ] Task 4: (선택적) 차단 시각 피드백 개선 (AC: 5)
  - [ ] 4.1: 호버 시 이동 불가 피드백
    - 장수가 있는 타일 호버 시 "이동 불가" 표시
    - 간단한 시각적 피드백 (색상 변화 또는 아이콘)
  - [ ] 4.2: 이동 불가 사유 표시 (향후 확장)
    - "적 장수 차단", "아군 장수 차단" 등 사유 구분
    - 툴팁 또는 UI 패널에 표시

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- `getMovableTilesForGeneral()` 함수 수정
- `getReachableTiles()` 함수의 blocked 파라미터 활용
- 장수 위치 수집 로직 추가

**game-renderer 패키지 (Phaser 렌더링)**
- 이 스토리에서는 대부분 game-core 수정
- GameScene에서 이미 `getMovableTilesForGeneral()` 사용 중이므로 자동 적용

**apps/web (React UI)**
- 이 스토리에서는 React UI 변경 없음

### 핵심 구현 패턴

#### 1. 장수 위치 수집 로직

```typescript
// packages/game-core/src/movement/movement.ts

/**
 * 게임 상태에서 차단된 타일 집합 생성
 *
 * @param state - 현재 게임 상태
 * @param excludeGeneralId - 제외할 장수 ID (이동하려는 장수 자신)
 * @returns 차단된 타일 ID 집합
 */
function getBlockedTiles(
  state: GameState,
  excludeGeneralId?: string
): Set<TileId> {
  const blocked = new Set<TileId>();

  for (const general of state.generals) {
    // 이동하려는 장수 자신은 제외
    if (excludeGeneralId && general.id === excludeGeneralId) {
      continue;
    }

    // 보드에 배치된 장수만 (position이 null이 아닌 경우)
    if (general.position !== null && general.position !== undefined) {
      blocked.add(general.position);
    }
  }

  return blocked;
}
```

#### 2. getMovableTilesForGeneral 수정

```typescript
// packages/game-core/src/movement/movement.ts (수정)

/**
 * 특정 장수의 이동 가능 타일 계산
 *
 * @param state - 현재 게임 상태
 * @param generalId - 장수 ID
 * @returns 이동 가능한 타일 ID 배열
 */
export function getMovableTilesForGeneral(
  state: GameState,
  generalId: string
): TileId[] {
  const general = state.generals.find(g => g.id === generalId);
  if (!general || general.position === null || general.position === undefined) {
    return [];
  }

  // 장수의 발 스탯 (이동력)
  const moveRange = general.stats.foot;

  // 차단된 타일 집합 (다른 모든 장수 위치)
  const blocked = getBlockedTiles(state, generalId);

  // BFS로 도달 가능한 타일 계산
  return getReachableTiles(general.position, moveRange, blocked);
}
```

#### 3. 기존 getReachableTiles 함수 확인

```typescript
// packages/game-core/src/board/adjacency.ts (이미 구현됨)

/**
 * 특정 거리 내 도달 가능한 타일 (BFS)
 *
 * blocked 집합에 포함된 타일은 이동 불가하며,
 * 해당 타일을 통과하여 그 너머로도 이동할 수 없음
 */
function getReachableTiles(
  from: TileId,
  distance: number,
  blocked: Set<TileId>
): TileId[] {
  const visited = new Set<TileId>([from]);
  const queue: Array<[TileId, number]> = [[from, 0]];
  const result: TileId[] = [];

  while (queue.length > 0) {
    const [current, dist] = queue.shift()!;
    if (dist > 0) result.push(current);
    if (dist >= distance) continue;

    for (const neighbor of getAdjacentTiles(current)) {
      // 차단된 타일은 방문하지 않음 (통과도 불가)
      if (!visited.has(neighbor) && !blocked.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return result;
}
```

### GDD 및 아키텍처 참고

**GDD - 이동 시스템:**
- 이동 불가 조건: 적 기물이 경로 차단
- 인접 이동만 지원: 변을 공유하는 타일로만 이동
- 이동 차단: 다른 장수(아군/적군)가 위치한 타일로는 이동 불가

**아키텍처 - Board System:**
- `getReachableTiles()`: BFS 기반 도달 가능 타일 계산
- `blocked` 파라미터로 차단 타일 전달
- 차단된 타일은 방문하지 않고, 통과도 불가

### 이전 스토리 학습 사항

**3-1 (이동 가능 타일 표시):**
- `getMovableTilesForGeneral()` 함수 구현
- `BoardRenderer.showMovableTiles()` / `clearMovableTiles()` 활용
- 하이라이트 색상: 연두색 (0x90EE90)

**3-2 (장수 이동):**
- `moveGeneral()` 함수로 이동 검증 및 상태 업데이트
- 이동 가능 타일 내에서만 이동 허용
- 행동력 소모 처리

**3-3 (장수 이동 애니메이션):**
- `animateMoveTo()` 메서드로 부드러운 이동
- 애니메이션 중 입력 차단
- 애니메이션 완료 후 이동 가능 타일 재계산

**활용할 기존 코드:**
```typescript
// 이미 구현된 BFS 탐색 (blocked 파라미터 지원)
import { getReachableTiles, getAdjacentTiles } from '@five-tiger-generals/game-core';

// 이동 가능 타일 계산 (수정 대상)
const movableTiles = getMovableTilesForGeneral(gameState, generalId);
```

### Git 커밋 분석 (최근 작업 패턴)

**최근 커밋:**
1. `fcb65f9` - feat: 3-3 장수 이동 애니메이션 (Movement Animation)
2. `3bcc0e0` - feat: 3-2 장수 이동 (General Movement)
3. `e0a0bb4` - fix: 코드 리뷰 후속 수정 - 측면 타일 꼭짓점 인접 완성 및 디버그 코드 제거
4. `1bcc422` - fix: 타일 인접 관계 수정 (변 인접 vs 꼭짓점 인접 분리)
5. `c7492b6` - feat: 3-1-moveable-tiles-display 이동 가능 타일 표시

**패턴 학습:**
- 커밋 메시지 형식: `feat: {story-id} {기능 설명}`
- 코드 리뷰 후 수정은 별도 `fix:` 커밋
- 디버그 코드(console.log) 제거 필수

### Project Structure Notes

**수정 파일:**
```
packages/game-core/src/
└── movement/
    └── movement.ts               # getMovableTilesForGeneral() 수정
        - getBlockedTiles() 함수 추가
        - 장수 위치 기반 차단 로직
```

**테스트 파일:**
```
packages/game-core/tests/
└── movement/
    └── pathBlocking.test.ts      # 경로 차단 테스트 (신규)
        - 적 장수 차단 테스트
        - 아군 장수 차단 테스트
        - 복합 차단 시나리오
```

### 차단 시나리오 예시

**시나리오 1: 단순 차단**
```
     [0]  [1]  [2]  [3]  [4]
        [5]  [6]  [7]  [8]  [9]

장수 A (발 2): 타일 6에 위치
장수 B (적): 타일 7에 위치

A의 이동 가능 타일: [1, 2, 5, 11] (7번 타일 차단)
7번을 통과해야 하는 [3, 8] 등은 이동 불가
```

**시나리오 2: 완전 포위**
```
        [1]
     [5] [A] [7]
        [11]

모든 인접 타일에 장수 존재 시:
A의 이동 가능 타일: [] (빈 배열)
```

**시나리오 3: 우회 가능**
```
     [0]  [1]  [2]
        [5]  [B]  [7]
     [10] [11] [12]

A (발 3, 타일 0):
- 직선 경로 [1] → [6] → [7] 차단됨 (B가 6에 위치)
- 우회 경로 [0] → [5] → [10] → [11] 가능
```

### 네이밍 컨벤션 (아키텍처 문서)

- **함수**: camelCase (`getBlockedTiles`, `getMovableTilesForGeneral`)
- **변수**: camelCase (`blocked`, `excludeGeneralId`)
- **타입**: PascalCase (`TileId`, `GameState`)
- **상수**: UPPER_SNAKE (필요 시)

### 주의사항

1. **game-core 순수성 유지**
   - Phaser 의존성 절대 금지
   - 순수 TypeScript 로직만 작성

2. **기존 동작 호환성**
   - 기존 테스트 통과 필수
   - getMovableTilesForGeneral() 시그니처 유지

3. **성능 고려**
   - 장수 수가 적으므로 (최대 10명) O(n) 탐색 허용
   - BFS는 이미 최적화되어 있음

### References

- [Source: _bmad-output/epics.md#Epic 3: 이동 시스템] - Story [MOVE-004] 정의
- [Source: _bmad-output/gdd.md#Movement Rules] - 이동 차단 조건
- [Source: _bmad-output/game-architecture.md#Novel Patterns] - 삼각형 보드 시스템, getReachableTiles()
- [Source: _bmad-output/implementation-artifacts/3-1-moveable-tiles-display.md] - getMovableTilesForGeneral() 구현
- [Source: _bmad-output/implementation-artifacts/3-3-movement-animation.md] - 최신 이동 로직 패턴
- [Source: packages/game-core/src/board/adjacency.ts] - getReachableTiles() 함수

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 테스트 실행 로그: 326개 테스트 전체 통과
- 빌드 로그: pnpm build 성공

### Completion Notes List

- **기존 구현 확인**: Story 3-1에서 이미 경로 차단 로직이 구현됨
  - `getOccupiedTiles()`: 모든 active 장수 위치 수집
  - `getMovableTilesForGeneral()`: 차단된 타일을 제외한 이동 가능 타일 계산
  - `getReachableTiles()`: BFS 기반 도달 가능 타일 계산 (blocked 파라미터 지원)
- **테스트 커버리지 확인**: `movement.test.ts`의 "blocking by other generals" 섹션에서 모든 시나리오 검증
  - 아군 장수 차단
  - 적 장수 차단
  - 경로 통과 차단 (blocked tile 너머로 이동 불가)
  - 완전 포위 상황 (이동 가능 타일 0개)
- **GameScene 통합 확인**: `handleGeneralSelected()`, `executeMove()`, `onMoveAnimationComplete()`에서 `getMovableTilesForGeneral()` 사용
- **Task 4 (선택적)**: 호버 시 이동 불가 피드백은 향후 확장 사항으로 보류

### File List

- `packages/game-core/src/movement/index.ts` - 경로 차단 로직 (기존 구현)
- `packages/game-core/src/board/adjacency.ts` - BFS 탐색 로직 (기존 구현)
- `packages/game-core/tests/movement.test.ts` - 경로 차단 테스트 케이스 (기존 구현)
- `packages/game-renderer/src/scenes/GameScene.ts` - 차단 상태 반영 (기존 구현)

### Change Log

- 2026-02-04: Story 검증 및 완료 처리 - 모든 AC가 기존 구현에서 충족됨 확인

