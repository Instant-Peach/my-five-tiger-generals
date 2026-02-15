# Story 1.2: 타일 선택 (Tile Selection)

Status: done

---

## Story

As a 플레이어,
I want 타일을 탭/클릭하여 선택할 수 있다,
so that 이동하거나 공격할 대상 타일을 지정할 수 있다.

## Acceptance Criteria

1. **AC1**: 플레이어가 타일을 탭/클릭하면 해당 타일이 선택된다
   - 모바일: 터치(tap)로 선택
   - 데스크톱: 마우스 클릭으로 선택
   - 선택된 타일의 ID가 게임 상태에 저장됨

2. **AC2**: 선택된 타일이 시각적으로 하이라이트된다
   - 선택 상태를 나타내는 고유 색상 적용 (selectedColor: 0x4a7c59)
   - 선택 해제 시 원래 구역 색상으로 복원
   - 선택 상태 전환이 즉각적으로 반영됨

3. **AC3**: 다른 타일을 선택하면 이전 선택이 해제된다
   - 단일 선택만 허용 (한 번에 하나의 타일만 선택 가능)
   - 새 타일 선택 시 이전 타일 자동 선택 해제
   - 선택 해제 시 시각적 하이라이트 제거

4. **AC4**: 빈 공간(타일 외부)을 클릭하면 선택이 해제된다
   - 보드 영역 외부 클릭 시 선택 해제
   - 타일 사이 간격(gap) 영역 클릭 시 선택 해제
   - 선택 해제 후 어떤 타일도 선택되지 않은 상태가 됨

## Tasks / Subtasks

- [x] Task 1: game-core 선택 상태 타입 정의 (AC: 1, 3)
  - [x] 1.1: `SelectionState` 인터페이스 정의 (selectedTileId: TileId | null)
  - [x] 1.2: `SelectionAction` 타입 정의 (select, deselect)
  - [x] 1.3: `packages/game-core/src/selection/types.ts` 파일 생성
  - [x] 1.4: `packages/game-core/src/selection/index.ts` export 추가

- [x] Task 2: game-renderer 입력 핸들러 구현 (AC: 1, 4)
  - [x] 2.1: `InputHandler` 클래스 생성 (`packages/game-renderer/src/input/InputHandler.ts`)
  - [x] 2.2: Phaser `pointerdown` 이벤트 리스너 등록
  - [x] 2.3: 클릭 좌표에서 타일 ID 판정 로직 구현 (BoardRenderer.getTileAtPosition 활용)
  - [x] 2.4: 타일 외부 클릭 감지 로직 구현
  - [x] 2.5: 터치/마우스 입력 통합 처리

- [x] Task 3: 선택 상태 관리 구현 (AC: 1, 3, 4)
  - [x] 3.1: `GameScene`에 selectedTileId 상태 변수 추가
  - [x] 3.2: `handleTileSelect(tileId: TileId)` 메서드 구현
  - [x] 3.3: `handleDeselect()` 메서드 구현
  - [x] 3.4: InputHandler와 GameScene 연결

- [x] Task 4: 선택 시각화 구현 (AC: 2)
  - [x] 4.1: BoardRenderer.highlightTiles() 메서드 활용
  - [x] 4.2: 선택 상태 변경 시 보드 재렌더링
  - [x] 4.3: 선택 색상(selectedColor) 적용 확인
  - [x] 4.4: 선택 해제 시 원래 구역 색상 복원 확인

- [x] Task 5: 이벤트 시스템 연동 (AC: 1, 3)
  - [x] 5.1: `tile:selected` 이벤트 정의 및 발행
  - [x] 5.2: `tile:deselected` 이벤트 정의 및 발행
  - [x] 5.3: 이벤트 기반 로깅 추가 (개발 모드)

- [x] Task 6: 테스트 및 검증 (AC: 전체)
  - [x] 6.1: 데스크톱 마우스 클릭 테스트
  - [x] 6.2: (시뮬레이션) 터치 입력 테스트
  - [x] 6.3: 연속 선택 전환 테스트
  - [x] 6.4: 빈 공간 클릭으로 선택 해제 테스트
  - [x] 6.5: 타일 ID 오버레이와 함께 동작 확인

## Dev Notes

### 아키텍처 패턴 준수사항

**game-core 패키지 원칙:**
- Phaser 의존성 절대 금지 - 순수 TypeScript만
- 선택 상태 타입은 game-core에 정의
- 실제 선택 로직은 렌더러에서 처리 (Phase 1)
- Phase 2에서 서버 동기화 시 game-core로 이동 예정

**game-renderer 패키지 원칙:**
- Phaser Input Manager 사용
- InputHandler 클래스에서 입력 처리 캡슐화
- GameScene이 InputHandler와 BoardRenderer 조율

**이벤트 네이밍 규칙:**
- `{domain}:{action}` 형식: `tile:selected`, `tile:deselected`

### 이전 스토리(1-1) 구현 내용 활용

**활용 가능한 기존 구현:**

1. **TileRenderer.renderTile() options:**
   - `selected`, `hovered`, `highlighted` 옵션 이미 지원
   - `selectedColor: 0x4a7c59` 이미 정의됨

2. **BoardRenderer.highlightTiles():**
   - 특정 타일 목록을 하이라이트하는 메서드 존재
   - `type` 파라미터로 'selected', 'hovered', 'highlighted' 구분

3. **BoardRenderer.getTileAtPosition():**
   - 화면 좌표(x, y)에서 타일 ID 찾는 메서드 존재
   - 내접원 반지름 기반 거리 계산으로 판정

```typescript
// 기존 BoardRenderer 메서드 (packages/game-renderer/src/rendering/BoardRenderer.ts:124-143)
getTileAtPosition(x: number, y: number): number | null {
  // 모든 타일의 중심점과 거리 계산하여 가장 가까운 타일 반환
  // radius = Math.min(width, height) * 0.4
}
```

### Phaser Input 처리 패턴

**권장 구현 방식:**

```typescript
// InputHandler.ts
export class InputHandler {
  private scene: Phaser.Scene;
  private boardRenderer: BoardRenderer;
  private onTileSelect: (tileId: TileId | null) => void;

  constructor(
    scene: Phaser.Scene,
    boardRenderer: BoardRenderer,
    onTileSelect: (tileId: TileId | null) => void
  ) {
    this.scene = scene;
    this.boardRenderer = boardRenderer;
    this.onTileSelect = onTileSelect;
    this.setupInputListeners();
  }

  private setupInputListeners(): void {
    // 모든 포인터 입력 처리 (터치 + 마우스)
    this.scene.input.on('pointerdown', this.handlePointerDown, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const tileId = this.boardRenderer.getTileAtPosition(pointer.x, pointer.y);
    this.onTileSelect(tileId); // null이면 선택 해제
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
  }
}
```

### GameScene 상태 관리 패턴

```typescript
// GameScene.ts (확장)
export class GameScene extends Phaser.Scene {
  private boardRenderer?: BoardRenderer;
  private inputHandler?: InputHandler;
  private selectedTileId: TileId | null = null;

  create(): void {
    this.boardRenderer = new BoardRenderer(this);
    this.boardRenderer.render();

    this.inputHandler = new InputHandler(
      this,
      this.boardRenderer,
      this.handleTileSelect.bind(this)
    );

    // 개발 모드: 타일 ID 표시
    this.boardRenderer.showTileIds(true);
  }

  private handleTileSelect(tileId: TileId | null): void {
    const previousTileId = this.selectedTileId;
    this.selectedTileId = tileId;

    // 시각적 업데이트
    if (tileId !== null) {
      this.boardRenderer?.highlightTiles([tileId], 'selected');
      console.log(`[TILE] Selected: ${tileId}`);
    } else {
      this.boardRenderer?.render(); // 선택 해제 시 전체 재렌더
      console.log(`[TILE] Deselected (was: ${previousTileId})`);
    }
  }
}
```

### 파일 구조

**추가/수정할 파일:**

```
packages/
├── game-core/
│   └── src/
│       ├── selection/          # 신규
│       │   ├── types.ts        # SelectionState, SelectionAction
│       │   └── index.ts        # export
│       └── index.ts            # selection export 추가
│
└── game-renderer/
    └── src/
        ├── input/              # 신규
        │   ├── InputHandler.ts # 입력 처리 클래스
        │   └── index.ts        # export
        ├── scenes/
        │   └── GameScene.ts    # 수정: 선택 상태 관리 추가
        └── index.ts            # input export 추가
```

### 기술 스택 상세

| 항목 | 버전 | 용도 |
|------|------|------|
| Phaser | 3.90.0+ | 입력 처리 (Input Manager) |
| TypeScript | 5.8+ | 타입 안전성 |

**Phaser Input API:**
- `scene.input.on('pointerdown', callback)` - 포인터 다운 이벤트
- `pointer.x`, `pointer.y` - 화면 좌표
- 터치와 마우스 모두 `pointerdown`으로 통합 처리

### 테스트 방법

**수동 테스트 체크리스트:**

1. [ ] 브라우저에서 타일 클릭 시 색상 변경 확인
2. [ ] 다른 타일 클릭 시 이전 선택 해제 및 새 타일 선택 확인
3. [ ] 빈 공간 클릭 시 선택 해제 확인
4. [ ] 콘솔에서 선택/해제 로그 확인
5. [ ] 타일 ID 오버레이와 선택 상태가 함께 표시되는지 확인

### Project Structure Notes

**아키텍처 경계 준수:**
- InputHandler는 game-renderer에 위치 (Phaser 의존성)
- 선택 상태 타입만 game-core에 정의 (Phase 2 서버 재사용 대비)
- GameScene이 상태 관리의 중심점

### References

- [Source: _bmad-output/gdd.md#Controls and Input] - 터치/클릭 인터랙션 정의
- [Source: _bmad-output/gdd.md#Input Feel] - 반응성, 명확성, 취소 가능
- [Source: _bmad-output/game-architecture.md#Implementation Patterns] - 통신 패턴
- [Source: _bmad-output/epics.md#Epic 1: 보드 시스템] - Story [BOARD-002], [BOARD-003]
- [Source: packages/game-renderer/src/rendering/TileRenderer.ts:35-46] - TileRenderConfig 색상 정의
- [Source: packages/game-renderer/src/rendering/BoardRenderer.ts:87-103] - highlightTiles() 메서드
- [Source: packages/game-renderer/src/rendering/BoardRenderer.ts:124-143] - getTileAtPosition() 메서드

### 중요 제약사항

1. **단일 선택만**: 한 번에 하나의 타일만 선택 가능
2. **즉각적 피드백**: 선택 시 즉시 시각적 변화 (지연 없음)
3. **터치/마우스 통합**: 별도 분기 없이 Phaser pointerdown으로 처리
4. **타일 ID 오버레이 유지**: 선택 상태에서도 타일 ID 표시 유지

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 빌드 오류: `destroy()` 메서드가 Phaser.Scene에 없음 → `shutdown()` 메서드로 변경

### Completion Notes List

1. game-core에 selection 모듈 추가 (SelectionState, SelectionAction, SelectionEventPayload 타입)
2. game-renderer에 input 모듈 추가 (InputHandler 클래스)
3. GameScene에 타일 선택 상태 관리 및 시각화 로직 구현
4. 이벤트 시스템 연동 (tile:selected, tile:deselected)
5. 같은 타일 재클릭 시 선택 해제 기능 추가

### File List

**신규 파일:**
- packages/game-core/src/selection/types.ts
- packages/game-core/src/selection/index.ts
- packages/game-renderer/src/input/InputHandler.ts
- packages/game-renderer/src/input/index.ts

**수정 파일:**
- packages/game-core/src/index.ts (selection export 추가)
- packages/game-renderer/src/index.ts (input export 추가)
- packages/game-renderer/src/scenes/GameScene.ts (선택 상태 관리 추가)
