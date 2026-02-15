# Story 1.1: 34타일 삼각형 보드 표시

Status: ready-for-dev

---

## Story

As a 플레이어,
I want 34타일 삼각형 테셀레이션 보드를 화면에서 볼 수 있다,
so that 게임의 전장을 파악하고 전략을 세울 수 있다.

## Acceptance Criteria

1. **AC1**: 34개의 삼각형 타일이 화면에 렌더링된다
   - 메인 타일 30개 + 측면(Edge) 타일 4개 = 총 34개
   - 각 타일은 Up(▲) 또는 Down(▽) 방향을 가진다

2. **AC2**: 보드가 화면 중앙에 배치된다
   - 가로/세로 중앙 정렬
   - 화면 크기에 따라 적절한 여백 유지

3. **AC3**: 각 타일이 명확하게 구분되어 보인다
   - 타일 경계선(stroke) 표시
   - 인접 타일과 시각적으로 구분 가능

4. **AC4**: 삼각형 테셀레이션 패턴이 올바르게 적용된다
   - 삼각형들이 빈틈없이 맞물려야 함
   - Up/Down 타일이 번갈아 배치

## Tasks / Subtasks

- [ ] Task 1: 프로젝트 기본 구조 설정 (AC: 전체)
  - [ ] 1.1: pnpm workspace monorepo 초기화
  - [ ] 1.2: `packages/game-core` 패키지 생성 및 설정
  - [ ] 1.3: `packages/game-renderer` 패키지 생성 및 설정
  - [ ] 1.4: `apps/web` 애플리케이션 생성 (Vite + React 19)
  - [ ] 1.5: TypeScript, ESLint, Prettier 설정

- [ ] Task 2: game-core 보드 타입 및 상수 정의 (AC: 1, 4)
  - [ ] 2.1: `TileId`, `TileDirection`, `TileZone` 타입 정의
  - [ ] 2.2: `TileMeta` 인터페이스 정의 (id, direction, zone, row, col)
  - [ ] 2.3: 34타일 메타데이터 상수 정의 (`TILE_META`)
  - [ ] 2.4: 보드 상수 정의 (`BOARD.TILE_COUNT = 34` 등)

- [ ] Task 3: game-core 인접 맵 구현 (AC: 4)
  - [ ] 3.1: `ADJACENCY_MAP` 34타일 인접 관계 하드코딩
  - [ ] 3.2: `getAdjacentTiles(tileId)` 함수 구현
  - [ ] 3.3: 단위 테스트 작성 (인접 관계 검증)

- [ ] Task 4: game-renderer Phaser 설정 (AC: 전체)
  - [ ] 4.1: `createGameConfig()` 팩토리 함수 구현
  - [ ] 4.2: `BootScene` 구현 (에셋 로딩 준비)
  - [ ] 4.3: `GameScene` 기본 구조 구현

- [ ] Task 5: 삼각형 타일 렌더링 구현 (AC: 1, 3, 4)
  - [ ] 5.1: `TileRenderer` 클래스 구현
  - [ ] 5.2: Up(▲)/Down(▽) 삼각형 그리기 함수
  - [ ] 5.3: 타일 위치 계산 함수 (row, col → x, y 좌표)
  - [ ] 5.4: 타일 경계선(stroke) 스타일 적용

- [ ] Task 6: 보드 렌더러 통합 (AC: 1, 2, 4)
  - [ ] 6.1: `BoardRenderer` 클래스 구현
  - [ ] 6.2: 34타일 일괄 렌더링
  - [ ] 6.3: 보드 중앙 배치 로직 구현

- [ ] Task 7: React 통합 및 useGameLoader (AC: 전체)
  - [ ] 7.1: `useGameLoader` 훅 구현 (SSR Safe Dynamic Import)
  - [ ] 7.2: `GameCanvas` 컴포넌트 구현
  - [ ] 7.3: `/game` 라우트 페이지 구현

- [ ] Task 8: 시각적 검증 (AC: 1, 2, 3, 4)
  - [ ] 8.1: 개발 서버에서 보드 렌더링 확인
  - [ ] 8.2: 34타일 모두 표시 확인
  - [ ] 8.3: Up/Down 방향 올바른지 확인
  - [ ] 8.4: 타일 간 빈틈 없는지 확인

## Dev Notes

### 아키텍처 패턴 준수사항

**game-core 패키지 원칙:**
- Phaser 의존성 절대 금지 - 순수 TypeScript만
- Phase 2에서 Colyseus 서버에서 동일 로직 재사용 예정
- Result 타입 패턴 사용 (`{ success: true, data } | { success: false, error }`)

**game-renderer 패키지 원칙:**
- Phaser를 팩토리 패턴으로 주입받음
- game-core의 타입/상수만 import
- 렌더링 전용 로직만 포함

**apps/web 원칙:**
- `useGameLoader` 패턴으로 SSR Safe Dynamic Import
- Cloudflare Workers/Pages 호환 필수

### 삼각형 보드 좌표 시스템

**ID 기반 + 인접 맵 접근방식:**
```
타일 ID: 0-33 (정수)
인접 관계: ADJACENCY_MAP에 하드코딩
타일 방향: TileMeta.direction = 'up' | 'down'
```

**보드 레이아웃 참고:**
- 5행 × 6열 기본 그리드 (30타일)
- 양쪽 측면에 Edge 타일 2개씩 (4타일)
- 총 34타일

**좌표 → 화면 위치 변환:**
```typescript
// 삼각형 한 변의 길이
const TILE_SIZE = 60; // 픽셀

// row, col에서 중심 좌표 계산
function getTileCenter(row: number, col: number, direction: TileDirection): { x: number, y: number } {
  const height = TILE_SIZE * Math.sqrt(3) / 2;
  const x = col * (TILE_SIZE / 2);
  const y = row * height + (direction === 'up' ? height / 3 : height * 2 / 3);
  return { x, y };
}
```

### 기술 스택 상세

| 항목 | 버전 | 용도 |
|------|------|------|
| Node.js | 22.19.0+ | 런타임 |
| pnpm | 9.0+ | 패키지 매니저 |
| TypeScript | 5.8+ | 타입 안전성 |
| React | 19.2.x | UI 프레임워크 |
| Phaser | 3.90.0+ | 게임 렌더링 |
| Vite | 7.x | 빌드 도구 |
| TanStack Router | 최신 | 라우팅 |

### 파일 네이밍 컨벤션

| 타입 | 컨벤션 | 예시 |
|------|--------|------|
| TypeScript 모듈 | camelCase.ts | `adjacency.ts`, `types.ts` |
| React 컴포넌트 | PascalCase.tsx | `GameCanvas.tsx` |
| Phaser Scene | PascalCase + Scene.ts | `GameScene.ts` |
| 테스트 | *.test.ts | `board.test.ts` |

### Project Structure Notes

**목표 구조:**
```
five-tiger-generals/
├── apps/
│   └── web/                    # React + Vite 앱
│       ├── src/
│       │   ├── components/
│       │   │   └── game/
│       │   │       └── GameCanvas.tsx
│       │   ├── hooks/
│       │   │   └── useGameLoader.ts
│       │   └── routes/
│       │       └── game.tsx
│       ├── vite.config.ts
│       └── package.json
├── packages/
│   ├── game-core/              # 순수 게임 로직
│   │   ├── src/
│   │   │   ├── board/
│   │   │   │   ├── types.ts
│   │   │   │   ├── adjacency.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   └── board.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   └── board.test.ts
│   │   └── package.json
│   └── game-renderer/          # Phaser 렌더링
│       ├── src/
│       │   ├── config.ts
│       │   ├── scenes/
│       │   │   ├── BootScene.ts
│       │   │   └── GameScene.ts
│       │   ├── rendering/
│       │   │   ├── TileRenderer.ts
│       │   │   └── BoardRenderer.ts
│       │   └── index.ts
│       └── package.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

### References

- [Source: _bmad-output/gdd.md#Grid System and Movement] - 삼각형 테셀레이션 34타일 정의
- [Source: _bmad-output/gdd.md#Technical Specifications] - 60fps, WebGL 2.0 요구사항
- [Source: _bmad-output/game-architecture.md#Board Coordinate System] - ID 기반 + 인접 맵 접근방식
- [Source: _bmad-output/game-architecture.md#Project Structure] - Monorepo 구조, 패키지 분리
- [Source: _bmad-output/game-architecture.md#Novel Patterns] - 삼각형 보드 시스템 패턴
- [Source: _bmad-output/epics.md#Epic 1: 보드 시스템] - 스토리 상세

### 중요 제약사항

1. **SSR Safe**: Phaser는 클라이언트에서만 로드 (`dynamic import`)
2. **패키지 경계**: game-core에서 Phaser import 절대 금지
3. **타일 수**: 정확히 34개 (30 메인 + 4 측면)
4. **테셀레이션**: 삼각형 타일 간 빈틈 없어야 함

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
