# Story 1.4: 반응형 레이아웃 (Responsive Layout)

Status: done

---

## Story

As a 플레이어,
I want 보드가 다양한 화면 크기에 맞게 자동으로 조절된다,
so that 모바일, 태블릿, 데스크톱 등 어떤 기기에서든 최적의 게임 경험을 할 수 있다.

## Acceptance Criteria

1. **AC1**: 보드가 화면 크기에 맞게 자동으로 스케일 조절된다
   - 화면 비율과 관계없이 전체 보드가 보이도록 조절
   - 너무 작아서 터치하기 어려워지지 않도록 최소 스케일 제한
   - 보드가 화면 중앙에 위치

2. **AC2**: 화면 크기 변경 시 보드가 동적으로 재조정된다
   - 브라우저 창 크기 변경 시 즉시 반응
   - 모바일 기기 회전(가로/세로) 시 즉시 반응
   - 애니메이션 없이 즉각적인 크기 조정

3. **AC3**: 다양한 화면 비율을 지원한다
   - 모바일 세로 (9:16, 9:19.5 등)
   - 모바일 가로 (16:9)
   - 태블릿 (4:3, 3:4)
   - 데스크톱 (16:9, 16:10, 21:9)
   - 최소 뷰포트: 320px 너비 지원

4. **AC4**: 타일 터치 영역이 접근성 기준을 충족한다
   - 최소 타일 크기가 44x44px 이상 유지 (WCAG 2.1 터치 타겟)
   - 스케일 다운 시에도 터치 가능 영역 보장

## Tasks / Subtasks

- [x] Task 1: Phaser ScaleManager 설정 (AC: 1, 2)
  - [x] 1.1: `createGame()` 팩토리에 scale 옵션 추가
  - [x] 1.2: ScaleMode.RESIZE 또는 ScaleMode.FIT 적용
  - [x] 1.3: autoCenter 설정으로 보드 중앙 정렬

- [x] Task 2: GameCanvas 컴포넌트 반응형 개선 (AC: 1, 2, 3)
  - [x] 2.1: 고정 width/height 대신 부모 컨테이너 100% 사용
  - [x] 2.2: CSS로 컨테이너가 뷰포트에 맞게 조절되도록 수정
  - [x] 2.3: useGameLoader에 동적 크기 전달

- [x] Task 3: BoardRenderer 동적 스케일 적용 (AC: 1, 4)
  - [x] 3.1: calculateOffset()에서 화면 크기 기반 동적 타일 크기 계산
  - [x] 3.2: 최소 타일 크기 제약 조건 추가 (44px 터치 타겟)
  - [x] 3.3: 카메라 resize 이벤트에서 재계산 트리거

- [x] Task 4: 화면 크기 변경 이벤트 처리 (AC: 2)
  - [x] 4.1: Phaser resize 이벤트 리스너 추가
  - [x] 4.2: resize 시 BoardRenderer 재계산 및 재렌더링
  - [x] 4.3: InputHandler 히트 영역 동기화

- [x] Task 5: 테스트 및 검증 (AC: 전체)
  - [x] 5.1: Chrome DevTools로 다양한 뷰포트 테스트
  - [x] 5.2: 브라우저 창 리사이즈 테스트
  - [x] 5.3: 최소 뷰포트(320px)에서 타일 터치 가능 확인
  - [x] 5.4: 기존 선택/호버 기능 정상 동작 확인

## Dev Notes

### 핵심 구현 방향

**Phaser ScaleManager 활용이 핵심**. Phaser 3는 자체적으로 강력한 ScaleManager를 제공하며, 이를 적절히 설정하면 대부분의 반응형 요구사항을 충족할 수 있다.

### Phaser Scale 설정 권장 방식

```typescript
// packages/game-renderer/src/config.ts
export function createGame(
  Phaser: typeof import('phaser'),
  options: GameOptions
): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    // 고정 크기 대신 동적 크기 사용
    scale: {
      mode: Phaser.Scale.RESIZE, // 또는 FIT
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',  // 부모 컨테이너 크기에 맞춤
      height: '100%',
      min: {
        width: 320,   // 최소 너비
        height: 480,  // 최소 높이
      },
    },
    scene: options.scenes,
    backgroundColor: '#1a1a2e',
  });
}
```

### BoardRenderer 동적 스케일 계산

현재 `calculateOffset()`은 고정 타일 크기(width: 100, height: 66)를 사용. 이를 화면 크기에 따라 동적으로 계산하도록 개선:

```typescript
// BoardRenderer.ts 개선안
private calculateDynamicTileSize(): void {
  const { width: screenWidth, height: screenHeight } = this.scene.cameras.main;

  // 보드 영역 계산 (패딩 제외)
  const availableWidth = screenWidth - 2 * this.config.padding;
  const availableHeight = screenHeight - 2 * this.config.padding;

  // 보드는 가로 3*W, 세로 6*H 차지 (레거시 레이아웃)
  // 가로/세로 중 더 제약이 큰 쪽에 맞춤
  const widthBasedTileWidth = availableWidth / 3;
  const heightBasedTileHeight = availableHeight / 6;

  // 정삼각형 비율 유지 (height = width * 0.66)
  const widthBasedTileHeight = widthBasedTileWidth * 0.66;
  const heightBasedTileWidth = heightBasedTileHeight / 0.66;

  let tileWidth: number;
  let tileHeight: number;

  if (widthBasedTileHeight <= availableHeight / 6) {
    // 가로가 제약
    tileWidth = widthBasedTileWidth;
    tileHeight = widthBasedTileHeight;
  } else {
    // 세로가 제약
    tileWidth = heightBasedTileWidth;
    tileHeight = heightBasedTileHeight;
  }

  // 최소 타일 크기 제약 (44px 터치 타겟)
  const MIN_TILE_SIZE = 44;
  if (tileWidth < MIN_TILE_SIZE) {
    tileWidth = MIN_TILE_SIZE;
    tileHeight = MIN_TILE_SIZE * 0.66;
  }

  // TileRenderer에 동적 크기 전달
  this.tileRenderer.updateConfig({ width: tileWidth, height: tileHeight });
}
```

### Resize 이벤트 처리

```typescript
// GameScene.ts 확장
create(): void {
  // 기존 코드...

  // resize 이벤트 리스너
  this.scale.on('resize', this.handleResize, this);
}

private handleResize(gameSize: Phaser.Structs.Size): void {
  // 카메라 뷰포트 업데이트
  this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);

  // 보드 재계산 및 재렌더링
  if (this.boardRenderer) {
    this.boardRenderer.recalculateAndRender();
    this.updateTileVisuals(); // 선택/호버 상태 복원
  }

  // InputHandler 히트 영역도 자동으로 업데이트됨 (BoardRenderer 참조)
}
```

### GameCanvas 컴포넌트 수정

```tsx
// GameCanvas.tsx
export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 컨테이너 크기 추적
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const { isLoading, error, restart } = useGameLoader({
    parentId: GAME_CONTAINER_ID,
    width: size.width,
    height: size.height,
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%', // 또는 calc(100vh - header높이)
        minWidth: 320,
        minHeight: 480,
      }}
    >
      <div id={GAME_CONTAINER_ID} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
```

### 기존 코드 영향도

**수정 필요 파일:**
- `packages/game-renderer/src/config.ts` - scale 옵션 추가
- `packages/game-renderer/src/rendering/BoardRenderer.ts` - 동적 크기 계산, resize 핸들링
- `packages/game-renderer/src/rendering/TileRenderer.ts` - `updateConfig()` 메서드 추가
- `packages/game-renderer/src/scenes/GameScene.ts` - resize 이벤트 리스너
- `apps/web/src/components/game/GameCanvas.tsx` - 반응형 컨테이너

**하위 호환:**
- 기존 선택/호버 로직은 BoardRenderer 좌표계를 사용하므로 자동 호환
- `getTileAtPosition()` 메서드는 동적 크기 반영됨
- InputHandler는 BoardRenderer 참조를 사용하므로 자동 동기화

### 성능 고려사항

1. **resize 이벤트 빈도**: 브라우저 resize는 빈번히 발생 → Phaser ScaleManager가 내부적으로 throttle 처리
2. **전체 재렌더링**: resize 시 전체 보드 재렌더링 필요 → 34타일이므로 성능 영향 미미
3. **텍스트 재생성**: 타일 ID 텍스트도 재생성 필요 → 기존 `showTileIds()` 재사용

### 제약사항

1. **최소 해상도**: 320x480px 미만에서는 타일이 너무 작아짐 → 스크롤 또는 경고 표시 검토
2. **가로 모드 권장**: 보드가 세로로 긴 형태 → 세로 모드에서는 좌우 여백 많아짐
3. **60fps 유지**: resize 중에도 프레임 드롭 없어야 함

### Project Structure Notes

**아키텍처 경계 준수:**
- 스케일 계산 로직은 `game-renderer`에서 담당 (렌더링 책임)
- `game-core`는 좌표 시스템(타일 ID 기반)이므로 영향 없음
- React 레이어는 컨테이너 크기만 관리, 실제 스케일링은 Phaser 담당

### References

- [Source: _bmad-output/gdd.md#Platform Considerations] - 반응형 레이아웃 요구사항
- [Source: _bmad-output/gdd.md#Accessibility Controls] - 44x44px 터치 타겟
- [Source: _bmad-output/gdd.md#Resolution Support] - 지원 해상도 범위
- [Source: _bmad-output/game-architecture.md#Engine & Framework] - Phaser 3.90.0
- [Source: _bmad-output/epics.md#Epic 1: 보드 시스템] - Story [BOARD-004]
- [Source: packages/game-renderer/src/rendering/BoardRenderer.ts] - calculateOffset(), 현재 고정 크기 사용
- [Source: packages/game-renderer/src/rendering/TileRenderer.ts:35-46] - DEFAULT_TILE_CONFIG
- [Source: apps/web/src/components/game/GameCanvas.tsx] - 현재 고정 800x600
- [Source: apps/web/src/hooks/useGameLoader.ts] - width/height 옵션
- [Source: _bmad-output/implementation-artifacts/1-3-tile-highlight.md] - 이전 스토리 참고

### 이전 스토리(1-3) 학습 사항

- `BoardRenderer.renderWithStates()` 메서드가 다중 상태 통합 렌더링 담당
- resize 시에도 `updateTileVisuals()` 호출하여 선택/호버 상태 유지 필요
- `showTileIds()` 토글 상태(`showingIds`)도 resize 후 복원 필요

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 없음 (빌드 및 타입 체크 모두 성공)

### Completion Notes List

1. config.ts에 Scale.NONE 모드로 변경 (React에서 직접 크기 제어)
2. GameCanvas 컴포넌트를 ResizeObserver 기반 반응형으로 개선 (외부/내부 컨테이너 분리)
3. TileRenderer에 updateConfig() 메서드 추가
4. BoardRenderer에 calculateDynamicTileSize() 및 recalculateAndRender() 메서드 추가
5. GameScene에 resize 이벤트 리스너 추가 (handleResize)
6. 최소 타일 크기 44px (WCAG 2.1 터치 타겟) 제약 적용
7. useGameLoader에 enabled 옵션 추가 및 게임 인스턴스 단일 생성 보장

### File List

**수정 파일:**
- packages/game-renderer/src/config.ts (Scale.NONE 모드, MIN_VIEWPORT 상수 추가)
- packages/game-renderer/src/rendering/TileRenderer.ts (updateConfig() 메서드 추가)
- packages/game-renderer/src/rendering/BoardRenderer.ts (동적 타일 크기 계산, recalculateAndRender() 추가)
- packages/game-renderer/src/scenes/GameScene.ts (resize 이벤트 핸들러 추가)
- apps/web/src/components/game/GameCanvas.tsx (ResizeObserver 기반 반응형 컨테이너, 외부/내부 컨테이너 분리)
- apps/web/src/hooks/useGameLoader.ts (enabled 옵션, 초기 크기 옵션 추가)
