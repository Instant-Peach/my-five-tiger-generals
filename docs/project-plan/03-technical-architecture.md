# 오호대장군 - 기술 아키텍처

> 작성일: 2026-02-02
> 버전: 1.1.0 (SSOT 정합성 반영)
> 작성자: Cloud Dragonborn (Game Architect)

---

## 1. 아키텍처 개요

### 1.1 설계 원칙

| 원칙 | 설명 |
|------|------|
| **점진적 배포** | Phase별 독립 배포 가능한 구조 |
| **관심사 분리** | 게임 로직 / 렌더링 / UI 분리 |
| **SSR 안전** | 서버 사이드에서 Phaser 없이 동작 |
| **타입 안전** | End-to-End TypeScript |
| **60fps 보장** | 34 타일 + 10 장수 최적화 |

### 1.2 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  React   │  │  Phaser  │  │ Zustand  │  │ TanStack │    │
│  │   UI     │  │  Game    │  │  Store   │  │  Query   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
│       └─────────────┴──────┬──────┴─────────────┘           │
│                            │                                 │
│                    ┌───────┴───────┐                        │
│                    │  Game Core    │ (Pure TypeScript)      │
│                    │  - Engine     │                        │
│                    │  - Types      │                        │
│                    │  - BoardGraph │                        │
│                    └───────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ WebSocket (Phase 2+)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Server (Phase 2+)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐          ┌──────────────┐                 │
│  │   NestJS     │          │   Colyseus   │                 │
│  │   API        │          │   Game       │                 │
│  │   (tRPC)     │          │   Server     │                 │
│  └──────┬───────┘          └──────┬───────┘                 │
│         │                         │                          │
│         └────────────┬────────────┘                          │
│                      │                                       │
│              ┌───────┴───────┐                              │
│              │   Supabase    │                              │
│              │   (DB/Auth)   │                              │
│              └───────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 모노레포 구조

### 2.1 디렉토리 구조

```
five-tiger-generals/
├── apps/
│   ├── web/                    # React + Phaser 클라이언트
│   ├── server/                 # NestJS API (Phase 2+)
│   └── game-server/            # Colyseus (Phase 2+)
├── packages/
│   ├── game-core/              # 순수 게임 로직
│   │   ├── src/
│   │   │   ├── engine.ts       # 게임 엔진
│   │   │   ├── types.ts        # 타입 정의
│   │   │   ├── board-graph.ts  # 보드 그래프
│   │   │   └── index.ts        # 공개 API
│   │   └── package.json
│   ├── api-types/              # tRPC 타입 (Phase 2+)
│   └── ui/                     # 공유 UI 컴포넌트
├── docs/
│   ├── analysis/               # 프로젝트 분석
│   └── project-plan/           # 계획 문서
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

### 2.2 패키지 의존성

```
apps/web
  ├── @five-tiger-generals/game-core
  ├── @five-tiger-generals/ui
  └── (Phase 2+) @five-tiger-generals/api-types

apps/server (Phase 2+)
  ├── @five-tiger-generals/game-core
  └── @five-tiger-generals/api-types

apps/game-server (Phase 2+)
  └── @five-tiger-generals/game-core
```

---

## 3. 기술 스택

### 3.1 Phase 1 (Local Demo)

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **Framework** | React | 19.x | UI 컴포넌트 |
| **Language** | TypeScript | 5.8+ | 타입 안전성 |
| **Game Engine** | Phaser | 3.90+ | 2D 렌더링 |
| **State** | Zustand | 5.x | 클라이언트 상태 |
| **Build** | Vite | 7.x | 번들링 |
| **Transpiler** | SWC | 5.x | 빠른 빌드 |
| **Styling** | TailwindCSS | 4.x | UI 스타일링 |
| **Deploy** | Cloudflare Pages | - | 정적 호스팅 |

### 3.2 Phase 2+ (Online)

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **API Framework** | NestJS | 10.x | REST/tRPC API |
| **Type Layer** | tRPC | 10.x | E2E 타입 안전 |
| **Validation** | Zod | 3.x | 런타임 검증 |
| **Game Server** | Colyseus | 0.15+ | 실시간 멀티플레이어 |
| **Database** | Supabase | - | PostgreSQL + Auth |
| **Cache** | TanStack Query | 5.x | 서버 상태 |
| **Deploy** | Docker | - | 컨테이너화 |

---

## 4. 핵심 모듈 설계

### 4.1 Game Core (packages/game-core)

**목적**: 순수 게임 로직, 어떤 환경에서도 동작

```typescript
// packages/game-core/src/types.ts
export interface GameState {
  board: Board;
  players: [Player, Player];
  currentTurn: PlayerId;
  turnNumber: number;
  actionsRemaining: number;  // 기본값: ACTIONS_PER_TURN (현재 3)
  knockCount: [number, number];
  status: 'playing' | 'finished';
  winner?: PlayerId;
}

// 행동력 상수 - 하드코딩 금지, 설정/주입받아 사용
export const ACTIONS_PER_TURN = 3;  // 턴당 기본 행동력

// 오호대장군: 관우, 장비, 조운, 황충, 마초
export type GeneralType = 'guan-yu' | 'zhang-fei' | 'zhao-yun' | 'huang-zhong' | 'ma-chao';

export interface Piece {
  id: string;
  playerId: PlayerId;
  generalType: GeneralType;
  position: TileId;
  stats: PieceStats;
  troops: number;
  status: 'active' | 'standby' | 'out';
}

export interface PieceStats {
  sun: number;    // 해 - 해 라인 방향 공격력 (1~3)
  moon: number;   // 달 - 달 라인 방향 공격력 (1~3)
  move: number;   // 발 - 이동력, 발 수만큼 연속 이동 (1~5)
  star: number;   // 별 - 통솔력/병력 상한, 별 1개당 2단위 (1~5)
}

// 병력 상한 계산: star * 2
export const calculateTroopCapacity = (star: number): number => star * 2;
```

```typescript
// packages/game-core/src/engine.ts
export function applyAction(
  state: GameState,
  action: Action
): GameState | ActionError {
  // 1. 액션 유효성 검증
  const validation = validateAction(state, action);
  if (!validation.valid) return validation.error;

  // 2. 액션 적용 (불변 업데이트)
  const newState = executeAction(state, action);

  // 3. 승리 조건 체크
  return checkWinCondition(newState);
}

export function validateAction(
  state: GameState,
  action: Action
): ValidationResult {
  // 턴 검증, 액션 제한 검증, 이동/공격 유효성 등
}
```

```typescript
// packages/game-core/src/board-graph.ts
export class BoardGraph {
  private tiles: Map<TileId, Tile>;
  private adjacency: Map<TileId, TileId[]>;

  constructor(config: BoardConfig) {
    this.buildBoard(config);
  }

  getAdjacentTiles(tileId: TileId): TileId[] { ... }

  getAttackTargets(
    tileId: TileId,
    direction: AttackDirection
  ): TileId[] { ... }

  findPath(from: TileId, to: TileId, maxSteps: number): TileId[] | null { ... }
}
```

### 4.2 Web App (apps/web)

**목적**: 브라우저에서 게임 플레이 UI 제공

```
apps/web/src/
├── components/
│   ├── Game.tsx              # Phaser 게임 래퍼
│   ├── GameUI.tsx            # React UI 오버레이
│   ├── PieceInfo.tsx         # 선택된 기물 정보
│   └── TurnIndicator.tsx     # 턴 표시
├── game/
│   ├── scenes/
│   │   └── MainScene.ts      # Phaser 메인 씬
│   ├── objects/
│   │   ├── Board.ts          # 보드 렌더링
│   │   ├── Tile.ts           # 타일 렌더링
│   │   └── Piece.ts          # 기물 렌더링
│   └── config.ts             # Phaser 설정
├── hooks/
│   ├── useGameLoader.ts      # SSR Safe Phaser 로딩
│   └── useGameState.ts       # 게임 상태 훅
├── stores/
│   └── gameStore.ts          # Zustand 스토어
└── App.tsx
```

**SSR Safe Phaser 로딩**:

```typescript
// apps/web/src/hooks/useGameLoader.ts
import { useQuery } from '@tanstack/react-query';

export function useGameLoader() {
  return useQuery({
    queryKey: ['phaser'],
    queryFn: async () => {
      if (typeof window === 'undefined') {
        return null; // 서버에서는 null 반환
      }
      const Phaser = await import('phaser');
      return Phaser;
    },
    staleTime: Infinity,
  });
}
```

### 4.3 Game Store (Zustand)

```typescript
// apps/web/src/stores/gameStore.ts
import { create } from 'zustand';
import { GameState, Action, applyAction } from '@five-tiger-generals/game-core';

interface GameStore {
  // State
  gameState: GameState | null;
  selectedPiece: string | null;
  validMoves: TileId[];

  // Actions
  initGame: () => void;
  selectPiece: (pieceId: string) => void;
  executeAction: (action: Action) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  selectedPiece: null,
  validMoves: [],

  initGame: () => {
    const initialState = createInitialGameState();
    set({ gameState: initialState });
  },

  executeAction: (action) => {
    const { gameState } = get();
    if (!gameState) return;

    const result = applyAction(gameState, action);
    if ('error' in result) {
      console.error(result.error);
      return;
    }

    set({ gameState: result });
  },
}));
```

---

## 5. 렌더링 아키텍처

### 5.1 Phaser + React 통합

```
┌────────────────────────────────────────────┐
│              React App                      │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │
│  │         Game Component               │  │
│  │  ┌────────────────────────────────┐  │  │
│  │  │      Phaser Canvas             │  │  │
│  │  │  ┌─────────────────────────┐   │  │  │
│  │  │  │     MainScene           │   │  │  │
│  │  │  │  - Board (Container)    │   │  │  │
│  │  │  │    - Tiles (Graphics)   │   │  │  │
│  │  │  │    - Pieces (Sprites)   │   │  │  │
│  │  │  └─────────────────────────┘   │  │  │
│  │  └────────────────────────────────┘  │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │         GameUI (Overlay)             │  │
│  │  - Turn Indicator                    │  │
│  │  - Piece Info Panel                  │  │
│  │  - Action Buttons                    │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### 5.2 이벤트 플로우

```
[User Click on Tile]
      │
      ▼
[Phaser Scene] ──emit──> 'tile-clicked'
      │
      ▼
[Game Component] ──call──> gameStore.executeAction()
      │
      ▼
[Zustand Store] ──call──> applyAction() from game-core
      │
      ▼
[New GameState] ──subscribe──> Phaser Scene
      │
      ▼
[Phaser Scene] ──render──> Updated Board/Pieces
```

---

## 6. 데이터 플로우

### 6.1 Phase 1 (Local)

```
┌─────────────────────────────────────────┐
│              Browser                     │
│                                          │
│  [User Input]                            │
│       │                                  │
│       ▼                                  │
│  [Zustand Store]                         │
│       │                                  │
│       ▼                                  │
│  [Game Core Engine]                      │
│       │                                  │
│       ▼                                  │
│  [New State] ──> [Phaser Render]         │
│              ──> [React UI Update]       │
└─────────────────────────────────────────┘
```

### 6.2 Phase 2 (Online)

```
┌─────────────┐         ┌─────────────────┐
│  Client A   │         │   Game Server   │
│             │         │   (Colyseus)    │
│ [Action] ───┼────────>│                 │
│             │         │ [Validate]      │
│             │         │ [Apply]         │
│             │<────────┼─[Broadcast]     │
│ [Render]    │         │                 │
└─────────────┘         └─────────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  Client B   │
                        │             │
                        │<─[State]    │
                        │ [Render]    │
                        └─────────────┘
```

---

## 7. 배포 아키텍처

### 7.1 Phase 1 배포

```
┌─────────────────────────────────────────┐
│          Cloudflare Pages               │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Static Assets (dist/client/)      │ │
│  │  - index.html                      │ │
│  │  - assets/*.js                     │ │
│  │  - assets/*.css                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Global CDN] ──> [Edge Caching]        │
└─────────────────────────────────────────┘
```

### 7.2 Phase 2 배포

```
┌────────────────────────────────────────────────────────────┐
│                    Production Environment                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │ Cloudflare Pages │    │  Docker Containers           │  │
│  │ (Web Frontend)   │    │                              │  │
│  │                  │    │  ┌────────────────────────┐  │  │
│  │  Static + SSR    │    │  │ NestJS API             │  │  │
│  │                  │    │  │ :4000                  │  │  │
│  └────────┬─────────┘    │  └────────────────────────┘  │  │
│           │              │                              │  │
│           │ HTTPS        │  ┌────────────────────────┐  │  │
│           │              │  │ Colyseus Game Server   │  │  │
│           └──────────────┼─>│ :2567                  │  │  │
│                          │  └────────────────────────┘  │  │
│                          └──────────────────────────────┘  │
│                                       │                     │
│                                       ▼                     │
│                          ┌──────────────────────────────┐  │
│                          │         Supabase             │  │
│                          │  PostgreSQL + Auth           │  │
│                          └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 8. 테스트 전략

### 8.1 테스트 피라미드

```
        ┌───────────┐
        │   E2E     │  Playwright
        │  (10%)    │  - 게임 플로우
        ├───────────┤
        │ Integration│  Vitest
        │   (30%)    │  - 전투 시스템
        │            │  - 승리 조건
        ├────────────┤
        │    Unit    │  Vitest
        │   (60%)    │  - engine.ts
        │            │  - board-graph.ts
        └────────────┘
```

### 8.2 핵심 테스트 케이스

```typescript
// packages/game-core/src/__tests__/engine.test.ts
describe('Game Engine', () => {
  describe('Action Validation', () => {
    it('같은 기물이 같은 액션을 턴 내 2번 수행하면 에러', () => {
      // ...
    });

    it('액션 2회 소모 후 턴 자동 종료', () => {
      // ...
    });
  });

  describe('Combat System', () => {
    it('해 방향 공격 시 공격자 Sun vs 수비자 Sun으로 데미지 계산', () => {
      // 방어력(Star) 사용 안함, 공격력 vs 공격력 비교
    });

    it('달 방향 공격 시 공격자 Moon vs 수비자 Moon으로 데미지 계산', () => {
      // ...
    });

    it('전선 공격 시 피해 1 + 양측 교착 상태 진입', () => {
      // ...
    });

    it('교착 상태에서 이동 선택 시 이탈 처리 (피해 2)', () => {
      // 별도 이탈 액션 아님, 이동 선택 시 자동 이탈
    });
  });

  describe('Win Condition', () => {
    it('끝 칸 도달 + 행동 1 소비로 노크, 3회 시 승리', () => {
      // 끝 칸 도달만으로는 노크 아님
    });

    it('행동력 소진 상태로 끝 칸 도달 시 노크 불가', () => {
      // 다음 턴에 노크 시도 가능
    });

    it('전멸 승리 - 상대 병력 전부 소멸', () => {
      // ...
    });

    it('와해 승리 - 상대 장수 모두 완전 퇴장', () => {
      // 일시 OUT(보급 복귀 대기) 제외
    });
  });
});
```

---

## 9. 성능 고려사항

### 9.1 렌더링 최적화

| 항목 | 목표 | 전략 |
|------|------|------|
| **FPS** | 60fps 유지 | 34 타일은 충분히 가벼움 |
| **메모리** | < 50MB | Phaser 텍스처 아틀라스 |
| **번들 크기** | < 500KB (gzip) | Tree shaking, 코드 스플리팅 |

### 9.2 모바일 최적화

- **터치 영역**: 타일 크기 최소 44px
- **반응형**: 화면 크기에 따른 보드 스케일링
- **배터리**: 백그라운드 시 렌더링 중지

---

## 10. 에러 처리 전략

### 10.1 에러 타입 정의

```typescript
// packages/game-core/src/errors.ts
export type GameErrorCode =
  | 'INVALID_ACTION'      // 유효하지 않은 액션
  | 'NOT_YOUR_TURN'       // 턴이 아님
  | 'PIECE_NOT_FOUND'     // 기물을 찾을 수 없음
  | 'INVALID_MOVE'        // 유효하지 않은 이동
  | 'PIECE_STALEMATE'     // 교착 상태로 이동 불가
  | 'ACTION_LIMIT'        // 액션 제한 초과
  | 'GAME_FINISHED';      // 게임 이미 종료

export interface GameError {
  code: GameErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

### 10.2 클라이언트 에러 처리

```typescript
// 네트워크 에러 재시도 정책
const RETRY_CONFIG = {
  maxRetries: 3,
  backoff: [1000, 2000, 4000], // ms
  timeout: 10000,
};

// 에러 복구 전략
interface ErrorRecoveryStrategy {
  'NETWORK_ERROR': 'retry';      // 재시도
  'STATE_MISMATCH': 'resync';    // 상태 재동기화
  'SESSION_EXPIRED': 'reauth';   // 재인증
  'GAME_NOT_FOUND': 'redirect';  // 로비로 이동
}
```

### 10.3 게임 상태 복구

| 상황 | 복구 방법 |
|------|----------|
| 브라우저 새로고침 | localStorage에서 gameId 복원 → 서버에 재연결 |
| 네트워크 끊김 | 30초 내 재연결 시 게임 이어하기 |
| 서버 재시작 | 진행 중 게임 상태를 Redis/DB에 주기적 스냅샷 |

---

## 11. 로깅 및 모니터링

### 11.1 로깅 레벨

| 레벨 | 용도 | 예시 |
|------|------|------|
| **DEBUG** | 개발 중 상세 정보 | 상태 변경, 함수 호출 |
| **INFO** | 주요 이벤트 | 게임 시작, 턴 전환, 노크 |
| **WARN** | 잠재적 문제 | 재시도 발생, 느린 응답 |
| **ERROR** | 처리된 에러 | 유효하지 않은 액션 거부 |
| **FATAL** | 치명적 오류 | 서버 크래시, 데이터 손실 |

### 11.2 게임 이벤트 로깅 형식

```typescript
interface GameEventLog {
  timestamp: string;
  gameId: string;
  eventType: 'action' | 'turn' | 'knock' | 'win' | 'error';
  playerId: string;
  payload: Record<string, unknown>;
  duration?: number; // ms
}
```

### 11.3 Phase 2+ 모니터링 (계획)

| 메트릭 | 설명 | 임계값 |
|--------|------|--------|
| 동시 접속자 | CCU | 경고: 800, 위험: 950 |
| 응답 지연 | P95 latency | 경고: 80ms, 위험: 150ms |
| 에러율 | 5xx 응답 비율 | 경고: 1%, 위험: 5% |
| 게임 완료율 | 정상 종료 비율 | 경고: 85% 미만 |

---

## 12. 상태 관리 전환 계획

### 12.1 Phase 1 → Phase 2 전환 전략

Phase 1에서 Phase 2로 전환 시 Zustand → Colyseus 상태 관리 변경에 대비:

```typescript
// 상태 관리 추상화 인터페이스
interface GameStateManager {
  getState(): GameState;
  dispatch(action: Action): Promise<GameState | GameError>;
  subscribe(listener: (state: GameState) => void): () => void;
}

// Phase 1: Zustand 구현
class LocalGameStateManager implements GameStateManager { ... }

// Phase 2: Colyseus 구현
class OnlineGameStateManager implements GameStateManager { ... }
```

### 12.2 게임 상태 직렬화

```typescript
// 저장/로드, 디버깅, 리플레이를 위한 직렬화
interface SerializedGameState {
  version: string;
  timestamp: number;
  state: GameState;
  actionHistory: Action[];
}

function serializeGameState(state: GameState): string;
function deserializeGameState(json: string): GameState;
```

---

## 13. 보안 고려사항

### 13.1 Phase 1 (Local)

- 클라이언트 전용이므로 치팅 방지 불필요
- 민감한 데이터 없음

### 13.2 Phase 2 (Online)

| 영역 | 위협 | 대응 |
|------|------|------|
| **게임 로직** | 클라이언트 조작 | 서버 권위적 검증 |
| **인증** | 세션 탈취 | JWT + HTTPS |
| **API** | 인젝션 | Zod 검증 |
| **매칭** | 조작 | 서버 측 매칭 |

---

## 14. 품질 게이트

### 14.1 PR 머지 전 (CI)

```yaml
품질 게이트:
  - 모든 단위 테스트 통과
  - 코드 커버리지 80% 이상 (game-core)
  - TypeScript 컴파일 에러 0개
  - ESLint 에러 0개
  - 빌드 성공
```

### 14.2 마일스톤 완료 전

```yaml
마일스톤 품질 게이트:
  - 모든 스토리 인수 조건 100% 충족
  - 크리티컬 버그 0개
  - 60fps 성능 체크포인트 통과
```

### 14.3 Phase 릴리즈 전

```yaml
Phase 1 릴리즈:
  - E2E 테스트 전체 통과
  - 전체 게임 플로우 수동 QA
  - 알려진 버그 목록 문서화

Phase 2 릴리즈:
  - 부하 테스트 100 동시접속 통과
  - 재연결 시나리오 테스트 완료
```

---

*이 문서는 Cloud Dragonborn (Game Architect)의 설계를 기반으로 작성되었습니다.*
*리뷰 피드백 반영: 2026-02-02*
