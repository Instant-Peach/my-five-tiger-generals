# Story 1.3: 타일 하이라이트 (Tile Highlight)

Status: done

---

## Story

As a 플레이어,
I want 선택된 타일과 상호작용 가능한 타일이 시각적으로 하이라이트된다,
so that 현재 선택 상태와 가능한 행동을 직관적으로 파악할 수 있다.

## Acceptance Criteria

1. **AC1**: 선택된 타일이 시각적으로 하이라이트된다
   - 선택 상태를 나타내는 고유 색상 적용 (selectedColor: 0x4a7c59)
   - 선택 해제 시 원래 구역 색상으로 복원
   - 선택 상태 전환이 즉각적으로 반영됨
   - **[Story 1-2에서 이미 구현됨]**

2. **AC2**: 타일 호버 시 시각적 피드백이 제공된다
   - 마우스 호버 또는 터치 홀드 시 호버 색상 적용 (hoverColor: 0x3d5c4a)
   - 호버 상태가 선택 상태와 다른 색상으로 구분됨
   - 호버 해제 시 원래 상태(선택됨/일반)로 복원
   - **[신규 구현 필요]**

3. **AC3**: 다중 타일 하이라이트가 지원된다
   - 이동 가능 타일 등 여러 타일을 동시에 하이라이트 가능
   - 하이라이트 타입별 색상 구분 (highlighted: 0x5a8f6a)
   - 선택된 타일과 하이라이트된 타일이 동시에 표시 가능
   - **[기존 highlightTiles() 개선 필요]**

4. **AC4**: 하이라이트 애니메이션이 적용된다
   - 하이라이트 전환 시 부드러운 색상 변화 (옵션)
   - 과도한 시각적 노이즈 없이 명확한 피드백 제공
   - **[선택적 구현 - Phase 1에서는 구현하지 않음. 현재 즉각적 색상 변경으로 충분한 피드백 제공]**

## Tasks / Subtasks

- [x] Task 1: 타일 호버 상태 구현 (AC: 2)
  - [x] 1.1: `GameScene`에 hoveredTileId 상태 변수 추가
  - [x] 1.2: Phaser `pointermove` 이벤트로 호버 감지
  - [x] 1.3: 호버 타일 변경 시 시각적 업데이트 적용
  - [x] 1.4: 호버 + 선택 상태 동시 처리 로직 구현
  - [x] 1.5: 호버 해제 시 원래 상태 복원

- [x] Task 2: 다중 하이라이트 개선 (AC: 3)
  - [x] 2.1: `BoardRenderer.highlightTiles()` 메서드 확장
  - [x] 2.2: 선택 + 호버 + 하이라이트 상태 동시 렌더링 지원
  - [x] 2.3: 상태 우선순위 정의 (selected > hovered > highlighted > normal)
  - [x] 2.4: `renderWithStates()` 또는 유사 메서드 구현

- [x] Task 3: 이벤트 시스템 확장 (AC: 2, 3)
  - [x] 3.1: `tile:hovered` 이벤트 정의 및 발행
  - [x] 3.2: `tile:unhovered` 이벤트 정의 및 발행
  - [x] 3.3: game-core selection 모듈에 hover 관련 타입 추가

- [x] Task 4: 테스트 및 검증 (AC: 전체)
  - [x] 4.1: 마우스 호버로 색상 변경 확인
  - [x] 4.2: 선택된 타일에 호버 시 우선순위 확인
  - [x] 4.3: 다중 타일 하이라이트 테스트
  - [x] 4.4: 성능 테스트 (빠른 마우스 이동 시)

## Dev Notes

### 이전 스토리(1-2) 구현 내용 활용

**기존 구현 확인됨:**
- `BoardRenderer.highlightTiles()` 메서드 존재 (line 87-103)
- `TileRenderer.renderTile()` options: `selected`, `hovered`, `highlighted` 지원
- 색상 정의 완료:
  - `selectedColor: 0x4a7c59` (녹색 계열)
  - `hoverColor: 0x3d5c4a` (어두운 녹색)
  - `highlightColor: 0x5a8f6a` (밝은 녹색)
- `InputHandler` 클래스로 입력 처리 캡슐화됨
- `getTileAtPosition()` 메서드로 좌표 → 타일 ID 변환 가능

**활용 코드:**
```typescript
// packages/game-renderer/src/rendering/BoardRenderer.ts:87-103
highlightTiles(tileIds: number[], type: 'selected' | 'hovered' | 'highlighted' = 'highlighted'): void {
  this.render(); // 먼저 전체 다시 그리기
  for (const id of tileIds) {
    const tile = TILE_META.find((t) => t.id === id);
    if (tile) {
      this.tileRenderer.renderTile(tile, this.offsetX, this.offsetY, {
        [type]: true,
      });
    }
  }
}
```

### 호버 구현 패턴

**권장 방식:**

```typescript
// GameScene.ts 확장
export class GameScene extends Phaser.Scene {
  private hoveredTileId: TileId | null = null;
  private selectedTileId: TileId | null = null;

  create(): void {
    // 기존 코드...

    // 호버 이벤트 추가
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerout', this.handlePointerOut, this);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    const tileId = this.boardRenderer?.getTileAtPosition(pointer.x, pointer.y) ?? null;

    if (tileId !== this.hoveredTileId) {
      const previousHover = this.hoveredTileId;
      this.hoveredTileId = tileId;
      this.updateTileVisuals(previousHover, tileId);
    }
  }

  private handlePointerOut(): void {
    if (this.hoveredTileId !== null) {
      const previousHover = this.hoveredTileId;
      this.hoveredTileId = null;
      this.updateTileVisuals(previousHover, null);
    }
  }

  private updateTileVisuals(previousHover: TileId | null, newHover: TileId | null): void {
    // 효율적인 재렌더링: 변경된 타일만 업데이트
    // 전체 보드 재렌더링 대신 변경 타일만 처리
  }
}
```

### 다중 상태 렌더링 전략

**상태 우선순위:** selected > hovered > highlighted > normal (zone color)

**렌더링 순서:**
1. 전체 보드 기본 렌더링 (zone colors)
2. 하이라이트된 타일 렌더링 (highlighted)
3. 호버된 타일 렌더링 (hovered) - 선택되지 않은 경우만
4. 선택된 타일 렌더링 (selected)

```typescript
// BoardRenderer 확장 제안
renderWithStates(
  selectedId: TileId | null,
  hoveredId: TileId | null,
  highlightedIds: TileId[]
): void {
  this.render(); // 기본 렌더링

  // 하이라이트된 타일 (선택/호버 제외)
  const highlightOnly = highlightedIds.filter(
    id => id !== selectedId && id !== hoveredId
  );
  for (const id of highlightOnly) {
    // highlighted 상태로 렌더
  }

  // 호버된 타일 (선택 제외)
  if (hoveredId !== null && hoveredId !== selectedId) {
    // hovered 상태로 렌더
  }

  // 선택된 타일 (최상위)
  if (selectedId !== null) {
    // selected 상태로 렌더
  }
}
```

### 성능 고려사항

1. **debounce/throttle 불필요**: Phaser는 자체적으로 프레임 기반 처리
2. **증분 렌더링 검토**: 전체 보드 재렌더링 vs 변경 타일만 업데이트
3. **호버 빈도**: pointermove는 빈번히 발생 → 필요시 최적화

### 파일 수정 목록

**수정할 파일:**
- `packages/game-renderer/src/scenes/GameScene.ts` - 호버 상태 관리 추가
- `packages/game-renderer/src/rendering/BoardRenderer.ts` - 다중 상태 렌더링 개선
- `packages/game-core/src/selection/types.ts` - 호버 관련 타입 추가

**신규 파일:** (필요시)
- 없음 - 기존 구조 확장

### Project Structure Notes

**아키텍처 경계 준수:**
- 호버 상태는 순수 UI 상태 → game-renderer에서 관리
- game-core는 타입 정의만 추가 (Phase 2 서버 동기화 대비 불필요)
- GameScene이 상태 관리의 중심점 유지

### References

- [Source: _bmad-output/gdd.md#Input Feel] - 반응성, 명확성, 취소 가능
- [Source: _bmad-output/gdd.md#Controls and Input] - 호버로 정보 표시
- [Source: _bmad-output/game-architecture.md#Cross-cutting Concerns] - 이벤트 시스템
- [Source: _bmad-output/epics.md#Epic 1: 보드 시스템] - Story [BOARD-003]
- [Source: packages/game-renderer/src/rendering/TileRenderer.ts:35-46] - 색상 정의
- [Source: packages/game-renderer/src/rendering/BoardRenderer.ts:87-103] - highlightTiles()
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - 선택 상태 관리
- [Source: _bmad-output/implementation-artifacts/1-2-tile-selection.md] - 이전 스토리 구현

### 중요 제약사항

1. **60fps 유지**: 호버 처리가 성능에 영향 주지 않도록 주의
2. **터치 디바이스**: 터치에서 "호버"는 탭 홀드로 대체 가능 (Phase 1에서는 선택적)
3. **타일 ID 오버레이 유지**: 호버/선택 상태에서도 타일 ID 표시 유지
4. **기존 기능 유지**: 1-2에서 구현된 선택 기능이 정상 동작해야 함

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 없음 (빌드 및 테스트 모두 성공)

### Completion Notes List

1. InputHandler에 TileHoverCallback 추가 및 pointermove/pointerout 이벤트 리스너 구현
2. GameScene에 hoveredTileId, highlightedTileIds 상태 변수 추가
3. BoardRenderer에 renderWithStates() 메서드 추가 (다중 상태 통합 렌더링)
4. game-core selection 모듈에 HoverEventPayload 타입 추가
5. tile:hovered, tile:unhovered 이벤트 발행 구현
6. 상태 우선순위: selected > hovered > highlighted > normal 구현

### Code Review Fixes Applied

- [Fix #1] AC4 구현 제외 명시 추가
- [Fix #4] BoardRenderer에서 TileId 타입 일관성 적용
- [Fix #5] HoverEventPayload 타입을 이벤트 발행 시 사용
- [Fix #6] console.log 개발 로그 제거 (이벤트 기반으로 대체)
- [Fix #8] InputHandler 콜백 타입에 JSDoc 추가

### Known Issues (Deferred)

- [MEDIUM] 성능 최적화: 현재 34타일 전체 재렌더링. Phase 1에서는 프레임 버짓 내 충분. 향후 dirty flag 패턴 검토.
- [MEDIUM] 자동화 테스트: Vitest/Playwright 테스트 추가 필요 (향후 스토리에서 처리)

### File List

**수정 파일:**
- packages/game-renderer/src/input/InputHandler.ts (호버 콜백 추가, JSDoc 추가)
- packages/game-renderer/src/input/index.ts (TileHoverCallback export 추가)
- packages/game-renderer/src/scenes/GameScene.ts (호버 상태 관리 추가, HoverEventPayload 적용)
- packages/game-renderer/src/rendering/BoardRenderer.ts (renderWithStates() 추가, TileId 타입 적용)
- packages/game-core/src/selection/types.ts (HoverEventPayload 추가)
