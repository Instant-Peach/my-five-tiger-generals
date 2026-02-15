---
project_name: 'five-tiger-generals'
user_name: 'CHOI'
date: '2026-02-03'
sections_completed: ['technology_stack', 'engine_specific', 'performance', 'code_organization', 'testing', 'platform_build', 'critical_rules']
status: 'complete'
rule_count: 45
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing game code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| **Game Engine** | Phaser | 3.90.0+ | "Tsugumi" - WebGL/Canvas 렌더링 |
| **UI Framework** | React | 19.2.x | 게임 외부 UI, SSR 고려 |
| **Language** | TypeScript | 5.8+ | Strict mode 사용 |
| **Client State** | Zustand | 5.x | UI 상태 관리 |
| **Server State** | TanStack Query | 5.x | API 캐싱 (Phase 2+) |
| **Routing** | TanStack Router | - | 파일 기반 라우팅 |
| **Build Tool** | Vite | 7.x | SWC 트랜스파일러 |
| **Styling** | TailwindCSS | 4.x | UI 스타일링 |
| **Package Manager** | pnpm | 9.0+ | Monorepo 워크스페이스 |
| **Runtime** | Node.js | 22.19.0+ | Vite 7 요구사항 |
| **Deploy** | Cloudflare Pages/Workers | - | SSR + Edge |
| **Multiplayer** | Colyseus | 0.16.5+ | Phase 2+ |
| **Database** | Supabase | PostgreSQL | Phase 2+ |

**Version Constraints:**
- Node.js 22.19.0+ 필수 (Vite 7 요구사항)
- pnpm만 사용 (npm/yarn 금지)
- Phaser는 반드시 동적 import로 로드 (SSR Safe)

---

## Engine-Specific Rules

### Phaser + React 통합 규칙

**SSR Safe Dynamic Import (필수):**
- Phaser는 `window` 객체에 의존하므로 서버에서 import 불가
- 반드시 `useGameLoader` 훅을 통해 동적 로드
- `typeof window === 'undefined'` 체크 후 로드

```typescript
// ✅ 올바른 패턴
const Phaser = await import('phaser');

// ❌ 금지 - SSR 에러 발생
import Phaser from 'phaser';
```

**game-core 패키지 규칙 (핵심):**
- `packages/game-core/`에서 Phaser import 절대 금지
- 순수 TypeScript만 사용 - 브라우저/Node.js 양쪽에서 실행 가능해야 함
- Phase 2에서 Colyseus 서버에서 동일 로직 재사용

**game-renderer 패키지 규칙:**
- Phaser는 팩토리 패턴으로 주입받음
- `createGameConfig(Phaser)` 형태로 Phaser 인스턴스 전달
- Scene 클래스는 game-renderer에만 존재

### React 통합 규칙

**게임 상태 동기화:**
- Phaser Scene → React UI: 이벤트 기반 (`gameEvents.emit`)
- React UI → Phaser Scene: Zustand 스토어 subscribe

**컴포넌트 분리:**
- 게임 캔버스: Phaser가 렌더링
- HUD/UI 오버레이: React 컴포넌트
- 상태 관리: Zustand (UI), game-core (게임 로직)

### Phaser Scene 라이프사이클

**Scene 순서:**
1. `init()` - 파라미터 수신
2. `preload()` - 에셋 로드
3. `create()` - 게임 오브젝트 생성
4. `update()` - 매 프레임 호출 (60fps)

**주의사항:**
- `update()`에서 무거운 연산 금지
- 에셋은 `preload()`에서만 로드
- `create()`에서 이벤트 리스너 등록

---

## Performance Rules

### Frame Budget

| 항목 | 목표 | 비고 |
|------|------|------|
| **Target FPS** | 60fps | 모바일/데스크톱 동일 |
| **Frame Budget** | 16.67ms | 1000ms / 60fps |
| **Initial Load** | < 3초 | 첫 화면까지 |
| **Bundle Size** | < 2MB (gzip) | 전체 앱 |

### Hot Path 최적화

**update() 함수 규칙:**
- 매 프레임 호출되므로 O(1) 또는 O(n) 연산만 허용 (n = 타일 수 34 또는 장수 수 10)
- 객체 생성 금지 - 미리 할당된 객체 재사용
- 조건 분기로 불필요한 연산 스킵

**피해야 할 패턴:**
```typescript
// ❌ 금지 - 매 프레임 객체 생성
update() {
  const newArray = tiles.filter(t => t.isActive);
}

// ✅ 권장 - 캐싱 사용
private cachedActiveTiles: Tile[] = [];
update() {
  // 상태 변경 시에만 캐시 갱신
}
```

### Memory Management

**Allocation 규칙:**
- 게임 루프 내 `new` 사용 금지
- 자주 사용되는 객체는 Object Pool 패턴 적용
- 배열은 미리 할당 후 재사용

**Asset Loading:**
- Scene-based Loading 사용
- MenuScene: UI 에셋만 (가벼움)
- GameScene: 게임 에셋 로드
- 사용하지 않는 텍스처는 명시적으로 해제

### 34 타일 시스템 최적화

- 인접 맵 하드코딩으로 런타임 계산 제거
- BFS 탐색 시 `Set` 사용으로 중복 체크 O(1)
- 타일 렌더링은 변경 시에만 업데이트 (dirty flag)

---

## Code Organization Rules

### Monorepo 구조

```
five-tiger-generals/
├── apps/
│   ├── web/                 # React + Phaser 클라이언트
│   ├── server/              # NestJS API (Phase 2+)
│   └── game-server/         # Colyseus (Phase 2+)
├── packages/
│   ├── game-core/           # 순수 게임 로직 (Phaser 금지)
│   ├── game-renderer/       # Phaser 렌더링 (팩토리 패턴)
│   └── ui/                  # 공유 UI 컴포넌트
```

### 파일 명명 규칙

| 타입 | 컨벤션 | 예시 |
|------|--------|------|
| React 컴포넌트 | PascalCase.tsx | `GameBoard.tsx` |
| TypeScript 모듈 | camelCase.ts | `adjacency.ts` |
| Phaser Scene | PascalCase + Scene.ts | `GameScene.ts` |
| 타입 정의 | types.ts | `board/types.ts` |
| 테스트 | *.test.ts | `combat.test.ts` |
| 상수 | camelCase.ts | `constants/board.ts` |

### 코드 요소 명명 규칙

| 요소 | 컨벤션 | 예시 |
|------|--------|------|
| 클래스 | PascalCase | `Board`, `GameState` |
| 함수 | camelCase | `moveGeneral`, `calculateDamage` |
| 상수 | UPPER_SNAKE | `TILE_COUNT`, `MAX_GENERALS` |
| 타입/인터페이스 | PascalCase | `TileId`, `AttackDirection` |
| 이벤트 | domain:action | `turn:start`, `combat:result` |

### 에셋 명명 규칙

| 타입 | 컨벤션 | 예시 |
|------|--------|------|
| 이미지 | snake_case | `tile_up.png` |
| 스프라이트 | snake_case | `generals_spritesheet.png` |
| 오디오 | snake_case | `bgm_battle.mp3` |

---

## Testing Rules

### 테스트 피라미드

```
        ┌───────────┐
        │   E2E     │  Playwright (10%)
        ├───────────┤
        │Integration│  Vitest (30%)
        ├───────────┤
        │   Unit    │  Vitest (60%)
        └───────────┘
```

### game-core 테스트 규칙

**필수 테스트 커버리지:**
- 코드 커버리지 80% 이상
- 모든 공개 함수에 단위 테스트 필수

**테스트 파일 위치:**
- `packages/game-core/tests/` 디렉토리
- 파일명: `{module}.test.ts`

**핵심 테스트 케이스:**
- 보드 인접 판정
- 전투 데미지 계산 (해/달/전선)
- 승리 조건 (노크 3회, 전멸, 와해)
- 이동 유효성 검증

### 테스트 작성 패턴

```typescript
// ✅ 올바른 패턴 - 순수 함수 테스트
describe('calculateDamage', () => {
  it('전선 공격 시 고정 데미지 1 반환', () => {
    const result = calculateDamage(attacker, defender, 'frontline');
    expect(result).toBe(1);
  });
});
```

---

## Platform & Build Rules

### 타겟 플랫폼

| 순위 | 플랫폼 | 비고 |
|------|--------|------|
| 1 | 모바일 웹 (PWA) | 주요 타겟 |
| 2 | 데스크톱 웹 | 동일 코드베이스 |
| 3 | 네이티브 앱 | Phase 3 이후 |

### 브라우저 지원

- Chrome 90+
- Safari 15+
- Firefox (최신)
- Edge (최신)
- WebGL 2.0 필수

### 빌드 설정

**개발:**
```bash
pnpm dev          # Vite 개발 서버 (5173)
```

**프로덕션:**
```bash
pnpm build        # 프로덕션 빌드
pnpm preview      # 로컬 프리뷰
```

### 환경 변수

```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:2567
VITE_DEBUG=true
```

- `import.meta.env.DEV` - 개발 환경 체크
- `import.meta.env.PROD` - 프로덕션 환경 체크

### 모바일 최적화

- 터치 영역 최소 44px
- 반응형 보드 스케일링
- 백그라운드 시 렌더링 중지

---

## Critical Don't-Miss Rules

### 절대 금지 사항

1. **game-core에서 Phaser import 금지**
   - 순수 TypeScript만 사용
   - 서버 재사용 불가능해짐

2. **상수 하드코딩 금지**
   - 반드시 `constants/` 모듈에서 import
   ```typescript
   // ❌ 금지
   const maxGenerals = 5;

   // ✅ 올바름
   import { GAME } from '@five-tiger-generals/game-core';
   const maxGenerals = GAME.MAX_GENERALS;
   ```

3. **throw 대신 Result 타입 사용**
   ```typescript
   // ❌ 금지
   throw new Error('Invalid move');

   // ✅ 올바름
   return { success: false, error: { code: 'INVALID_MOVE', message: '이동 불가' } };
   ```

4. **new 직접 사용 금지 (엔티티 생성)**
   - Factory 함수 사용: `createGeneral()`, `createGameState()`

5. **직접 상태 mutation 금지**
   - 상태 전이 함수 사용: `transitionPhase()`

### 삼각형 보드 시스템 규칙

**TileId:** 0-33 (34개 타일)
**TileDirection:** `'up'` | `'down'`
**AttackDirection:** `'sun'` | `'moon'` | `'frontline'`

**인접 맵 규칙:**
- `ADJACENCY_MAP`은 하드코딩 (런타임 계산 X)
- 인접 타일 조회: `getAdjacentTiles(tileId)`
- 이동 범위: `getReachableTiles(from, distance, blocked)`

### 방향성 전투 규칙

| 방향 | 공격 스탯 | 데미지 계산 |
|------|----------|-------------|
| 해 (Sun) | attacker.sun | max(0, attackerSun - defenderSun) |
| 달 (Moon) | attacker.moon | max(0, attackerMoon - defenderMoon) |
| 전선 (Frontline) | - | 고정 1 |

### 이벤트 명명 규칙

```typescript
// 형식: domain:action
'turn:start'      // 턴 시작
'turn:end'        // 턴 종료
'combat:result'   // 전투 결과
'move:complete'   // 이동 완료
'game:end'        // 게임 종료
'knock:progress'  // 노크 진행
```

### 디버그 도구 (개발 환경만)

```typescript
if (import.meta.env.DEV) {
  window.debug = {
    showTileIds: () => { /* 타일 ID 표시 */ },
    inspectState: () => console.log(gameState),
    forceWin: (playerId) => { /* 강제 승리 */ },
  };
}
```

---

## Usage Guidelines

**For AI Agents:**
- 게임 코드 구현 전 반드시 이 파일을 읽을 것
- 모든 규칙을 문서화된 대로 정확히 따를 것
- 불확실한 경우, 더 제한적인 옵션을 선택할 것
- 새로운 패턴이 발견되면 이 파일을 업데이트할 것

**For Humans:**
- 이 파일을 간결하고 에이전트 니즈에 집중하여 유지할 것
- 기술 스택 변경 시 업데이트할 것
- 분기별로 오래된 규칙 검토할 것
- 시간이 지나 명백해진 규칙은 제거할 것

---

**Last Updated:** 2026-02-03
