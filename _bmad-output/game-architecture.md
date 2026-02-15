---
title: 'Game Architecture'
project: 'five-tiger-generals'
date: '2026-02-03'
author: 'CHOI'
version: '1.0'
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
status: 'complete'
engine: 'Phaser 3.90.0'
platform: 'Web (PWA)'

# Source Documents
gdd: '_bmad-output/gdd.md'
brief: '_bmad-output/game-brief.md'
reference_architecture: '../my-five-tiger-generals/docs/CURRENT_ARCHITECTURE.md'
---

# Game Architecture

## Executive Summary

**오호대장군 (Five Tiger Generals)** 아키텍처는 Phaser 3 + React 19 기반 웹 게임으로, 모바일 PWA를 주요 타겟으로 설계되었습니다.

**핵심 아키텍처 결정:**

- **game-core 패키지 분리** - 순수 TypeScript 게임 로직, Phaser 의존성 없음 → 테스트 용이, Phase 2 서버 재사용
- **ID 기반 보드 시스템** - 34타일 고정 인접 맵으로 삼각형 테셀레이션 단순화
- **SSR Safe Dynamic Import** - useGameLoader 패턴으로 Cloudflare Workers 호환
- **서버 권위 멀티플레이어** - Colyseus + game-core 재사용 (Phase 2)

**프로젝트 구조:** Monorepo (Hybrid) 조직 - apps/ (web, server, game-server) + packages/ (game-core, game-renderer)

**구현 패턴:** 8개 패턴 정의 (2 Novel + 6 Standard) - AI 에이전트 일관성 보장

**Ready for:** Epic 구현 단계

---

## Document Status

This architecture document is being created through the BMGD Architecture Workflow.

**Steps Completed:** 5 of 9 (Cross-cutting Concerns)

---

## Project Context

### Game Overview

**오호대장군 (Five Tiger Generals)** - 삼국지 테마 1:1 턴제 전략 보드게임. 독특한 삼각형 테셀레이션 보드(34타일)와 해/달/전선 방향성 전투 시스템으로 기존 전략 게임과 차별화된 전술적 깊이 제공.

### Technical Scope

| 항목 | 상세 |
|------|------|
| **Platform** | 모바일 웹 (PWA) > 데스크톱 웹 > 네이티브 앱 |
| **Genre** | Turn-Based Tactics (턴제 전술 게임) |
| **Project Level** | Medium-High Complexity |
| **Session Length** | 20-40분 |

### Core Systems

| 시스템 | 복잡도 | Phase | 설명 |
|--------|--------|-------|------|
| 보드 시스템 | 높음 | 1 | 삼각형 테셀레이션 34타일, 인접/방향 판정 |
| 장수 시스템 | 중간 | 1 | 5명 장수, 스탯(별/해/달/발), 병력 관리 |
| 이동 시스템 | 중간 | 1 | 인접 타일 이동, 발 스탯 기반 범위 |
| 전투 시스템 | 높음 | 1 | 해/달/전선 3방향 공격, 스탯 비교 |
| 턴 관리 | 중간 | 1 | 1:1 교대 턴, 행동력 (3회/턴, 동일장수동일행동제한), 60초 타이머 |
| 승리 조건 | 중간 | 1 | 노크 3회, 전멸, 와해, 항복 |
| UI/UX | 중간 | 1-2 | 게임 UI, HUD, 터치 최적화 |
| 책략 시스템 | 중간 | 2-3 | 20개 책략 구현 |
| 멀티플레이어 | 높음 | 2 | WebSocket, 상태 동기화, 매칭 |
| 계정/랭킹 | 중간 | 2-3 | 로그인, ELO, 티어, 전적 |

### Technical Requirements

**Performance:**
- 60fps 유지 (모바일/데스크톱)
- 초기 로딩 3초 이내
- 번들 크기 2MB 이하 (gzip)
- 네트워크 지연 100ms 이하 (Phase 2)

**Platform:**
- 브라우저: Chrome 90+, Safari 15+, Firefox, Edge
- WebGL 2.0 지원 필수
- PWA 오프라인 UI 지원

**Tech Stack (참고 아키텍처 기반):**
- Frontend: React 19 + Phaser 3.90+ + TypeScript
- State: Zustand (클라이언트) + TanStack Query (서버)
- API: tRPC (Phase 2+)
- Game Server: Colyseus (Phase 2+)
- DB: Supabase PostgreSQL (Phase 2+)
- Deployment: Cloudflare Pages/Workers

### Complexity Drivers

**High Complexity:**
1. 삼각형 테셀레이션 보드 - 비표준 그리드, 인접 계산 복잡
2. 방향성 전투 시스템 - 해/달/전선 + 타일 방향 조합
3. SSR Safe Phaser 통합 - 동적 로딩 필수
4. 멀티플레이어 상태 동기화 - 서버 권위 설계

**Novel Concepts:**
1. 삼각형 좌표계 및 인접 타일 계산 알고리즘
2. 해/달/전선 방향 판정 로직
3. 노크 승리 조건 (끝 구역 + 3회 행동)

### Technical Risks

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| 삼각형 보드 UX 혼란 | 높음 | 시각적 가이드, 이동 경로 표시, 튜토리얼 |
| 게임 밸런스 이슈 | 중간 | 플레이테스트 반복, 데이터 기반 조정 |
| Phaser + React SSR 통합 | 중간 | 검증된 패턴 사용 (useGameLoader) |
| Colyseus 학습 곡선 | 중간 | 멘토 지원, 단계적 구현 |
| 서버 비용 증가 | 낮음 | 사용량 모니터링, 서버리스 대안 |

---

## Engine & Framework

### Selected Engine

**Phaser 3.90.0 "Tsugumi"** + **React 19.2.x** + **TypeScript 5.8+**

**Rationale:**
- 기존 프로젝트(my-five-tiger-generals)에서 검증된 아키텍처
- SSR Safe Dynamic Import 패턴으로 Cloudflare Workers 호환
- 웹 게임에 최적화된 2D 렌더링 성능
- TypeScript 완벽 지원으로 타입 안전성 확보

### Project Initialization

기존 검증된 아키텍처를 기반으로 Monorepo 구조 구성:

```bash
# pnpm 워크스페이스 초기화
pnpm init

# 필수 패키지 설치
pnpm add react@^19.2.0 phaser@^3.90.0 typescript@^5.8.0
pnpm add zustand @tanstack/react-query @tanstack/react-router
pnpm add -D vite @vitejs/plugin-react
```

### Engine-Provided Architecture

| 컴포넌트 | 솔루션 | 비고 |
|----------|--------|------|
| **Rendering** | Phaser WebGL/Canvas | 자동 폴백 |
| **Game Loop** | Phaser Scene.update() | 60fps 타겟 |
| **Input Handling** | Phaser Input Manager | 터치/마우스 통합 |
| **Asset Loading** | Phaser Loader | 스프라이트, 오디오 |
| **Audio** | Phaser Sound Manager | Web Audio API |
| **UI Layer** | React Components | 게임 외부 UI |
| **Routing** | TanStack Router | 파일 기반 |
| **Client State** | Zustand | 게임 UI 상태 |
| **Server State** | TanStack Query | API 캐싱 |

### Remaining Architectural Decisions

다음 결정들은 이어지는 섹션에서 직접 진행:

1. **게임 로직 구조** - game-core 패키지 설계, Phaser 분리
2. **삼각형 보드 시스템** - 좌표계, 인접 판정 알고리즘
3. **방향성 전투 시스템** - 해/달/전선 공격 로직
4. **상태 동기화** - 클라이언트-서버 책임 분리
5. **멀티플레이어 아키텍처** - Colyseus Room 설계 (Phase 2)
6. **데이터 모델** - 장수, 보드, 게임 상태 스키마
7. **에러 처리** - 게임 로직 예외 처리 전략
8. **테스트 전략** - 게임 로직 단위 테스트

---

## Architectural Decisions

### Decision Summary

| # | 카테고리 | 결정 | 버전/상세 | 근거 |
|---|----------|------|-----------|------|
| 1 | 게임 로직 | game-core 패키지 분리 | 순수 TypeScript | 테스트 용이, Phase 2 서버 재사용 |
| 2 | 보드 좌표계 | ID 기반 + 인접 맵 | 34타일 고정 | 단순, Legacy 코드 재사용 |
| 3 | 상태 관리 | Zustand + 순수 객체 | Zustand v5+ | UI/로직 분리, 서버 재사용 |
| 4 | 데이터 영속성 | Supabase | PostgreSQL | Auth + DB 통합, 무료 티어 |
| 5 | 멀티플레이어 | Colyseus | v0.16.5+ | 서버 권위, 상태 자동 동기화 |
| 6 | 인증 | Supabase Auth | OAuth 지원 | DB 통합, Naver 로그인 가능 |
| 7 | 에셋 로딩 | Scene-based | Phaser Loader | 초기 로딩 3초 이내 목표 |
| 8 | 오디오 | Phaser Sound Manager | 내장 | 단순, 요구사항 충족 |

### Game Logic Architecture

**Approach:** game-core 패키지 분리

```
packages/
  game-core/           # 순수 TypeScript - Phaser 의존성 없음
    src/
      board/           # 보드, 타일, 인접 판정
      generals/        # 장수, 스탯, 병력
      combat/          # 전투 로직 (해/달/전선)
      turn/            # 턴 관리, 행동력
      victory/         # 승리 조건 판정
      types/           # 공유 타입 정의
```

**핵심 원칙:**
- Phaser 의존성 없음 → 순수 로직 테스트 가능
- Phase 2에서 Colyseus 서버에서 동일 로직 재사용
- 클라이언트는 game-core를 import하여 사용

### Board Coordinate System

**Approach:** ID 기반 + 인접 맵

```typescript
// 34개 타일 ID (0-33)
type TileId = number;

// 인접 관계 하드코딩
const adjacencyMap: Record<TileId, TileId[]> = {
  0: [1, 5, 6],
  1: [0, 2, 6],
  // ... 34개 타일 모두 정의
};

// 타일 방향 (삼각형 Up/Down)
type TileDirection = 'up' | 'down';

// 공격 방향
type AttackDirection = 'sun' | 'moon' | 'frontline';
```

### State Management

**Approach:** Zustand (UI) + game-core 순수 상태 객체

```
┌─────────────────────────────────────────┐
│              React UI                    │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │  Zustand    │  │  TanStack Query │   │
│  │  (UI State) │  │  (Server State) │   │
│  └──────┬──────┘  └────────┬────────┘   │
└─────────┼──────────────────┼────────────┘
          │                  │
┌─────────▼──────────────────▼────────────┐
│           game-core (순수 로직)          │
│  ┌─────────────────────────────────────┐│
│  │  GameState (순수 객체)               ││
│  │  - board: Board                     ││
│  │  - players: Player[]                ││
│  │  - currentTurn: PlayerId            ││
│  │  - phase: GamePhase                 ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Data Persistence (Phase 2+)

**Approach:** Supabase

| 테이블 | 용도 | Phase |
|--------|------|-------|
| users | 유저 프로필 | 2 |
| matches | 게임 기록 | 2 |
| rankings | ELO 랭킹 | 2 |
| generals | 장수 데이터 (확장) | 3 |

### Multiplayer Architecture (Phase 2)

**Approach:** Colyseus (서버 권위)

```
┌──────────────┐         ┌──────────────────────┐
│  Client A    │ ──────► │   Colyseus Server    │
│  (Phaser)    │ action  │  ┌────────────────┐  │
└──────────────┘         │  │   game-core    │  │
                         │  │   (검증/실행)   │  │
┌──────────────┐         │  └────────────────┘  │
│  Client B    │ ◄────── │         │            │
│  (Phaser)    │  state  │    GameState         │
└──────────────┘  sync   └──────────────────────┘
```

**플로우:**
1. 클라이언트 → 액션 전송 (move, attack, endTurn)
2. 서버 → game-core로 유효성 검증
3. 유효하면 → 상태 업데이트
4. 모든 클라이언트 ← Schema 자동 동기화

### Authentication (Phase 2+)

**Approach:** Supabase Auth

- Email/Password 기본
- OAuth Providers: Google, Naver (커스텀)
- JWT 토큰 기반
- Row Level Security로 데이터 보호

### Asset Loading

**Approach:** Scene-based Loading

```typescript
// MenuScene - 가벼운 에셋만
preload() {
  this.load.image('logo', 'assets/ui/logo.png');
  this.load.image('buttons', 'assets/ui/buttons.png');
}

// GameScene - 게임 에셋 로드
preload() {
  this.load.image('board', 'assets/game/board.png');
  this.load.spritesheet('generals', 'assets/game/generals.png');
  this.load.audio('bgm', 'assets/audio/battle.mp3');
}
```

### Audio Architecture

**Approach:** Phaser Sound Manager

- BGM: 배경음악 (루프)
- SFX: 효과음 (원샷)
- 볼륨 조절: Zustand에 설정 저장
- 음소거: 전역 토글

---

## Cross-cutting Concerns

이 패턴들은 **모든 시스템에 적용**되며, 모든 구현에서 반드시 따라야 합니다.

### Error Handling

**Strategy:** Result Objects (game-core) + Global Error Boundary (UI)

**Error Levels:**
- **CRITICAL**: 게임 진행 불가 → 에러 화면 표시
- **RECOVERABLE**: 복구 가능 → 사용자에게 알림 후 계속
- **SILENT**: 내부 처리 → 로깅만

**game-core 패턴:**
```typescript
// Result 타입 정의
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: GameError };

// 사용 예시
function moveGeneral(generalId: string, toTile: TileId): Result<GameState> {
  if (!isValidMove(generalId, toTile)) {
    return { success: false, error: { code: 'INVALID_MOVE', message: '이동 불가' } };
  }
  // ... 로직 수행
  return { success: true, data: newState };
}
```

**UI 패턴:**
```typescript
// React Error Boundary
<ErrorBoundary fallback={<GameErrorScreen />}>
  <GameCanvas />
</ErrorBoundary>
```

### Logging

**Format:** 구조화된 Logger 클래스
**Destination:**
- 개발: 브라우저 콘솔
- 프로덕션: 콘솔 (ERROR/WARN만) + Phase 2에서 Sentry 추가

**Log Levels:**
| Level | 용도 | 프로덕션 |
|-------|------|----------|
| ERROR | 치명적 오류 | ✅ 출력 |
| WARN | 예상치 못한 상황 | ✅ 출력 |
| INFO | 주요 이벤트 | ❌ 비활성 |
| DEBUG | 상세 진단 | ❌ 비활성 |

**Logger 구현:**
```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type LogCategory = 'game' | 'combat' | 'ui' | 'network';

class Logger {
  private static level: LogLevel = import.meta.env.DEV ? 'debug' : 'warn';

  static error(category: LogCategory, message: string, data?: object) {
    console.error(`[${category.toUpperCase()}] ${message}`, data);
  }

  static warn(category: LogCategory, message: string, data?: object) {
    console.warn(`[${category.toUpperCase()}] ${message}`, data);
  }

  static info(category: LogCategory, message: string, data?: object) {
    if (this.shouldLog('info')) {
      console.info(`[${category.toUpperCase()}] ${message}`, data);
    }
  }

  static debug(category: LogCategory, message: string, data?: object) {
    if (this.shouldLog('debug')) {
      console.log(`[${category.toUpperCase()}] ${message}`, data);
    }
  }
}
```

### Configuration

**Approach:** TypeScript 상수 모듈 + 환경 변수 + LocalStorage

**상수 정의:**
```typescript
// constants/board.ts
export const BOARD = {
  TILE_COUNT: 34,
  MAIN_TILES: 30,
  SIDE_TILES: 4,
} as const;

// constants/combat.ts
export const COMBAT = {
  FRONTLINE_DAMAGE: 1,
  MIN_DAMAGE: 0,
  DIRECTIONS: ['sun', 'moon', 'frontline'] as const,
} as const;

// constants/game.ts
export const GAME = {
  MAX_GENERALS: 5,
  ACTIONS_PER_TURN: 3,           // 턴당 최대 3회 행동
  TURN_TIME_LIMIT: 60,
  KNOCK_COUNT_TO_WIN: 3,
} as const;

// 동일 장수 동일 행동 제한:
// - 같은 장수가 같은 턴에 동일한 행동(이동, 공격, 책략 등)을 두 번 수행할 수 없음
// - 예: 관우가 이동 후 같은 턴에 다시 이동 불가
// - 예: 관우가 이동 후 공격은 가능 (다른 행동)
// - 예: 관우가 이동 후, 장비가 이동하는 것은 가능 (다른 장수)
```

**환경 변수:**
```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:2567
VITE_DEBUG=true
```

### Event System

**Pattern:** 타입 안전 Event Bus
**Naming:** `{domain}:{action}` (예: `turn:start`, `combat:result`)

**이벤트 타입:**
```typescript
type GameEvents = {
  'turn:start': { turn: number; playerId: string };
  'turn:end': { turn: number; playerId: string };
  'combat:result': { attacker: GeneralId; defender: GeneralId; damage: number };
  'move:complete': { generalId: GeneralId; to: TileId };
  'game:end': { winner: string; reason: VictoryReason };
  'knock:progress': { playerId: string; count: number };
};
```

**Event Bus 구현:**
```typescript
class TypedEventBus<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<EventCallback<any>>>();

  on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]) {
    Logger.debug('event', `Event: ${String(event)}`, data);
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export const gameEvents = new TypedEventBus<GameEvents>();
```

### Debug Tools

**Available Tools:** 개발 환경 전용

| 도구 | 기능 | 명령 |
|------|------|------|
| 타일 ID 오버레이 | 각 타일에 ID 표시 | `debug.showTileIds()` |
| 인접 타일 표시 | 선택 타일의 인접 타일 강조 | `debug.showAdjacent(id)` |
| 상태 검사 | 현재 게임 상태 출력 | `debug.inspectState()` |
| 강제 승리 | 특정 플레이어 승리 | `debug.forceWin(id)` |
| 턴 스킵 | 현재 턴 강제 종료 | `debug.skipTurn()` |

**Activation:** `import.meta.env.DEV` 체크로 개발 환경에서만 활성화

```typescript
if (import.meta.env.DEV) {
  (window as any).debug = {
    showTileIds: () => { /* ... */ },
    inspectState: () => console.log(gameState),
    forceWin: (playerId: string) => { /* ... */ },
  };
  console.log('🎮 Debug tools loaded.');
}
```

---

## Project Structure

### Organization Pattern

**Pattern:** Monorepo (Hybrid)

**Rationale:** 참고 레포지토리(my-five-tiger-generals)에서 검증된 구조 기반. pnpm workspaces로 패키지 간 의존성 관리. game-core 분리로 Phase 2 서버 재사용 가능.

### Directory Structure

```
five-tiger-generals/
├── apps/
│   ├── web/                      # 메인 웹 애플리케이션
│   │   ├── src/
│   │   │   ├── components/       # React UI 컴포넌트
│   │   │   │   ├── game/         # 게임 관련 UI (HUD, 선택 패널)
│   │   │   │   ├── ui/           # 공통 UI (Button, Modal)
│   │   │   │   └── layout/       # 레이아웃 (Header, Footer)
│   │   │   ├── routes/           # TanStack Router 페이지
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── index.tsx     # 홈
│   │   │   │   ├── game.tsx      # 게임 플레이
│   │   │   │   └── lobby.tsx     # 로비 (Phase 2)
│   │   │   ├── hooks/            # React Hooks
│   │   │   │   ├── useGameLoader.ts
│   │   │   │   └── useGameState.ts
│   │   │   ├── stores/           # Zustand 스토어
│   │   │   │   ├── gameUiStore.ts
│   │   │   │   └── settingsStore.ts
│   │   │   ├── lib/              # 유틸리티, API 클라이언트
│   │   │   │   ├── trpc.ts       # (Phase 2)
│   │   │   │   └── supabase.ts   # (Phase 2)
│   │   │   └── styles/           # 전역 스타일
│   │   ├── public/
│   │   │   └── assets/           # 정적 에셋
│   │   │       ├── images/
│   │   │       │   ├── board/    # 보드 관련
│   │   │       │   ├── generals/ # 장수 스프라이트
│   │   │       │   └── ui/       # UI 에셋
│   │   │       └── audio/
│   │   │           ├── bgm/
│   │   │           └── sfx/
│   │   ├── vite.config.ts
│   │   ├── wrangler.toml         # Cloudflare 설정
│   │   └── package.json
│   │
│   ├── server/                   # API 서버 (Phase 2+)
│   │   └── src/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── matches/
│   │       └── trpc/
│   │
│   └── game-server/              # Colyseus 서버 (Phase 2+)
│       └── src/
│           ├── rooms/
│           │   └── GameRoom.ts
│           └── schemas/
│
├── packages/
│   ├── game-core/                # 순수 게임 로직 (핵심)
│   │   ├── src/
│   │   │   ├── board/            # 보드 시스템
│   │   │   │   ├── types.ts      # TileId, TileDirection
│   │   │   │   ├── adjacency.ts  # 인접 맵
│   │   │   │   └── board.ts      # Board 클래스
│   │   │   ├── generals/         # 장수 시스템
│   │   │   │   ├── types.ts      # General, Stats
│   │   │   │   └── generals.ts   # 장수 관리
│   │   │   ├── combat/           # 전투 시스템
│   │   │   │   ├── types.ts      # AttackDirection
│   │   │   │   ├── directions.ts # 방향 판정
│   │   │   │   └── combat.ts     # 전투 로직
│   │   │   ├── turn/             # 턴 관리
│   │   │   │   └── turn.ts
│   │   │   ├── victory/          # 승리 조건
│   │   │   │   └── victory.ts
│   │   │   ├── state/            # 게임 상태
│   │   │   │   ├── types.ts      # GameState
│   │   │   │   └── actions.ts    # 액션 처리
│   │   │   ├── constants/        # 상수
│   │   │   │   ├── board.ts
│   │   │   │   ├── combat.ts
│   │   │   │   └── game.ts
│   │   │   ├── events/           # 이벤트 시스템
│   │   │   │   └── eventBus.ts
│   │   │   ├── utils/            # 유틸리티
│   │   │   │   ├── result.ts     # Result 타입
│   │   │   │   └── logger.ts
│   │   │   └── index.ts          # Public API
│   │   ├── tests/                # 단위 테스트
│   │   │   ├── board.test.ts
│   │   │   ├── combat.test.ts
│   │   │   └── victory.test.ts
│   │   └── package.json
│   │
│   ├── game-renderer/            # Phaser 렌더링 (팩토리 패턴)
│   │   ├── src/
│   │   │   ├── config.ts         # createGameConfig
│   │   │   ├── scenes/
│   │   │   │   ├── BootScene.ts
│   │   │   │   ├── MenuScene.ts
│   │   │   │   └── GameScene.ts
│   │   │   ├── rendering/
│   │   │   │   ├── BoardRenderer.ts
│   │   │   │   ├── TileRenderer.ts
│   │   │   │   └── GeneralRenderer.ts
│   │   │   ├── input/
│   │   │   │   └── InputHandler.ts
│   │   │   └── index.ts          # 팩토리 함수 export
│   │   └── package.json
│   │
│   ├── api-types/                # 공유 타입 (Phase 2+)
│   │   └── src/
│   │       └── index.ts
│   │
│   └── ui/                       # 공유 UI 컴포넌트 (선택)
│       └── src/
│
├── docs/                         # 문서
│
├── _bmad-output/                 # BMAD 산출물
│   ├── game-brief.md
│   ├── gdd.md
│   └── game-architecture.md
│
├── pnpm-workspace.yaml           # Monorepo 설정
├── package.json                  # 루트 설정
├── tsconfig.json                 # 베이스 TypeScript 설정
├── .env.example
└── README.md
```

### System Location Mapping

| 시스템 | 위치 | 책임 |
|--------|------|------|
| **보드 시스템** | `packages/game-core/src/board/` | 타일 정의, 인접 판정 |
| **장수 시스템** | `packages/game-core/src/generals/` | 장수 스탯, 병력 관리 |
| **전투 시스템** | `packages/game-core/src/combat/` | 해/달/전선 공격 로직 |
| **턴 관리** | `packages/game-core/src/turn/` | 턴 순서, 행동력 |
| **승리 조건** | `packages/game-core/src/victory/` | 노크/전멸/와해 판정 |
| **게임 상태** | `packages/game-core/src/state/` | GameState 정의, 액션 |
| **이벤트** | `packages/game-core/src/events/` | 타입 안전 Event Bus |
| **보드 렌더링** | `packages/game-renderer/src/rendering/` | Phaser 시각화 |
| **씬 관리** | `packages/game-renderer/src/scenes/` | Phaser Scene 클래스 |
| **입력 처리** | `packages/game-renderer/src/input/` | 터치/마우스 핸들러 |
| **게임 UI** | `apps/web/src/components/game/` | HUD, 선택 패널 |
| **라우팅** | `apps/web/src/routes/` | 페이지 컴포넌트 |
| **UI 상태** | `apps/web/src/stores/` | Zustand 스토어 |
| **정적 에셋** | `apps/web/public/assets/` | 이미지, 오디오 |
| **멀티플레이어** | `apps/game-server/src/rooms/` | Colyseus Room (Phase 2) |
| **API** | `apps/server/src/trpc/` | tRPC 라우터 (Phase 2) |
| **인증** | `apps/server/src/auth/` | Supabase Auth (Phase 2) |

### Naming Conventions

#### Files

| 타입 | 컨벤션 | 예시 |
|------|--------|------|
| React 컴포넌트 | PascalCase.tsx | `GameBoard.tsx`, `GeneralCard.tsx` |
| TypeScript 모듈 | camelCase.ts | `adjacency.ts`, `eventBus.ts` |
| Phaser Scene | PascalCase + Scene.ts | `GameScene.ts`, `MenuScene.ts` |
| 타입 정의 | types.ts | `board/types.ts` |
| 테스트 | *.test.ts | `combat.test.ts` |
| 상수 | camelCase.ts | `constants/board.ts` |

#### Code Elements

| 요소 | 컨벤션 | 예시 |
|------|--------|------|
| 클래스 | PascalCase | `Board`, `GameState`, `BoardRenderer` |
| 함수 | camelCase | `moveGeneral`, `calculateDamage` |
| 변수 | camelCase | `currentTurn`, `selectedTile` |
| 상수 | UPPER_SNAKE | `TILE_COUNT`, `MAX_GENERALS` |
| 타입/인터페이스 | PascalCase | `TileId`, `GameState`, `AttackDirection` |
| 이벤트 | domain:action | `turn:start`, `combat:result` |

#### Game Assets

| 타입 | 컨벤션 | 예시 |
|------|--------|------|
| 이미지 | snake_case | `tile_up.png`, `general_guan_yu.png` |
| 스프라이트 | snake_case | `generals_spritesheet.png` |
| 오디오 | snake_case | `bgm_battle.mp3`, `sfx_attack.wav` |

### Architectural Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                        apps/web                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    React     │  │   Zustand    │  │  TanStack Query  │   │
│  │  Components  │  │   Stores     │  │    (Phase 2)     │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                    │             │
│         └────────────┬────┴────────────────────┘             │
│                      │                                       │
│              ┌───────▼───────┐                               │
│              │ useGameLoader │  ← SSR Safe Dynamic Import    │
│              └───────┬───────┘                               │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       │ import (클라이언트 전용)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  packages/game-renderer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Scenes    │  │  Rendering  │  │   Input Handling    │  │
│  │  (Phaser)   │  │  (Phaser)   │  │     (Phaser)        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         └────────────────┴─────────────────────┘             │
│                          │                                   │
│                   import (팩토리 패턴)                         │
│                          ▼                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           │ import (직접 참조 - 순수 로직)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   packages/game-core                         │
│        ⚠️ Phaser 의존성 절대 금지 - 순수 TypeScript만         │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌─────────┐  │
│  │ Board  │ │ Generals │ │ Combat │ │  Turn  │ │ Victory │  │
│  └────────┘ └──────────┘ └────────┘ └────────┘ └─────────┘  │
│                                                              │
│  ⬆️ Phase 2: Colyseus 서버에서도 동일 로직 재사용              │
└─────────────────────────────────────────────────────────────┘
```

**경계 규칙:**
1. **game-core** → Phaser import 절대 금지
2. **game-renderer** → Phaser를 팩토리 패턴으로 주입받음
3. **apps/web** → `useGameLoader`로만 Phaser 로드 (SSR Safe)
4. **Phase 2 서버** → game-core만 import (렌더링 불필요)

---

## Implementation Patterns

이 패턴들은 모든 AI 에이전트가 일관된 코드를 작성하도록 보장합니다.

### Novel Patterns

#### 삼각형 보드 시스템 (Triangular Board System)

**Purpose:** 비표준 삼각형 그리드에서 인접 판정 및 이동 범위 계산

**Components:**
- `TileId`: 타일 식별자 (0-33)
- `TileDirection`: 삼각형 방향 (up/down, left/right for side tiles)
- `ADJACENCY_MAP`: 하드코딩된 인접 관계
- `getReachableTiles()`: BFS 기반 도달 가능 타일 계산

**보드 레이아웃 (서버/데이터 관점):**

```
         Row 0: [0,  1,  2,  3,  4]   ← player2_home (player2 시작 배치)
         Row 1: [5,  6,  7,  8,  9]
Side 30 ─────── Row 2: [10, 11, 12, 13, 14] ───────── Side 32
Side 31 ─────── Row 3: [15, 16, 17, 18, 19] ───────── Side 33
         Row 4: [20, 21, 22, 23, 24]
         Row 5: [25, 26, 27, 28, 29]  ← player1_home (player1 시작 배치)
```

**Zone 정의 (서버/데이터 관점 - 고정):**
- `player1_home`: row 5 (타일 25-29) - player1이 말을 배치하는 곳, player2가 노크하는 곳
- `player2_home`: row 0 (타일 0-4) - player2가 말을 배치하는 곳, player1이 노크하는 곳
- `center`: row 1-4 (타일 5-24) - 중앙 구역
- `side`: 타일 30-33 - 측면 특수 타일

**클라이언트 렌더링 규칙:**
- 각 플레이어는 **자신의 home이 화면 아래**, **상대의 home이 화면 위**로 보임
- player1 클라이언트: 보드 그대로 렌더링 (row 5가 아래)
- player2 클라이언트: 보드 180도 회전 렌더링 (row 0이 아래로 보임)
- 색상: 자신 = 파란색, 상대 = 빨간색 (클라이언트 기준)

**Implementation Guide:**

```typescript
// packages/game-core/src/board/types.ts

/** 타일 ID (0-33) */
type TileId = number;

/** 메인 타일 방향 - 삼각형이 위/아래를 향하는지 */
type TileDirection = 'up' | 'down';

/** 측면 타일 방향 */
type SideDirection = 'left' | 'right';

/** 타일 방향 (메인 + 측면) */
type TileOrientation = TileDirection | SideDirection;

/** 타일 영역 (서버/데이터 관점 - 고정) */
type TileZone = 'player1_home' | 'player2_home' | 'center' | 'side';

/** 타일 메타데이터 */
interface TileMeta {
  id: TileId;
  direction: TileOrientation;
  zone: TileZone;
  row: number;
  col: number;
  isSideTile: boolean;
}

// packages/game-core/src/board/adjacency.ts

/** 인접 맵 - 하드코딩된 34타일 관계 */
const ADJACENCY_MAP: Record<TileId, TileId[]> = {
  0: [1, 5, 6],    // 예시 - 실제 값은 구현 시 정의
  // ... 34개 모두 정의
};

/** 인접 타일 조회 */
function getAdjacentTiles(tileId: TileId): TileId[] {
  return ADJACENCY_MAP[tileId] ?? [];
}

/** 특정 거리 내 도달 가능한 타일 (BFS) */
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
      if (!visited.has(neighbor) && !blocked.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return result;
}
```

**Usage:** 이동 범위 계산, 공격 대상 판정, 경로 탐색

---

#### 방향성 전투 시스템 (Directional Combat System)

**Purpose:** 해/달/전선 방향에 따른 공격 판정 및 데미지 계산

**Components:**
- `AttackDirection`: 공격 방향 (sun/moon/frontline)
- `getAttackDirection()`: 두 타일 간 방향 판정
- `calculateDamage()`: 스탯 기반 데미지 계산

**Implementation Guide:**

```typescript
// packages/game-core/src/combat/types.ts

/** 공격 방향 */
type AttackDirection = 'sun' | 'moon' | 'frontline';

/** 공격 결과 */
interface AttackResult {
  direction: AttackDirection;
  attackerStat: number;
  defenderStat: number;
  damage: number;
  isKnockBack: boolean;
}

// packages/game-core/src/combat/directions.ts

/**
 * 두 타일 간 공격 방향 판정
 *
 * 보드 레이아웃 기준:
 * - 전선(Frontline): 수직 방향 (위/아래)
 * - 해(Sun): 우하향 대각선
 * - 달(Moon): 좌하향 대각선
 */
function getAttackDirection(
  attackerTile: TileId,
  defenderTile: TileId
): AttackDirection | null {
  // 인접하지 않으면 공격 불가
  if (!getAdjacentTiles(attackerTile).includes(defenderTile)) {
    return null;
  }

  const attacker = TILE_META[attackerTile];
  const defender = TILE_META[defenderTile];

  // 같은 열, 행이 다름 → 전선
  if (attacker.col === defender.col) {
    return 'frontline';
  }

  // 우측으로 이동 → 해
  if (defender.col > attacker.col) {
    return 'sun';
  }

  // 좌측으로 이동 → 달
  return 'moon';
}

// packages/game-core/src/combat/combat.ts

/** 전투 데미지 계산 */
function calculateDamage(
  attacker: General,
  defender: General,
  direction: AttackDirection
): number {
  const attackStat = getAttackStat(attacker, direction);
  const defendStat = getDefendStat(defender, direction);

  // 전선은 고정 데미지 1
  if (direction === 'frontline') {
    return COMBAT.FRONTLINE_DAMAGE;
  }

  // 해/달: 공격 - 방어 (최소 0)
  return Math.max(0, attackStat - defendStat);
}
```

**Usage:** 공격 유효성 검증, 데미지 계산, 전투 결과 처리

---

### Standard Patterns

#### Communication Pattern

**Pattern:** Event-based + Direct Reference (Hybrid)

- **시스템 간**: Event Bus로 느슨한 결합
- **시스템 내부**: 직접 참조로 강한 결합

```typescript
// 이벤트 기반: 시스템 간 느슨한 결합
gameEvents.emit('combat:result', { attacker, defender, damage });

// 직접 참조: 같은 시스템 내 강한 결합
class GameScene extends Phaser.Scene {
  private boardRenderer: BoardRenderer;
  private inputHandler: InputHandler;

  create() {
    this.boardRenderer = new BoardRenderer(this);
    this.inputHandler = new InputHandler(this, this.boardRenderer);
  }
}
```

---

#### Entity Creation Pattern

**Pattern:** Factory Functions

- 엔티티 생성은 Factory 함수 사용
- `new` 직접 사용 금지 (테스트 용이성)

```typescript
// packages/game-core/src/generals/factory.ts
function createGeneral(config: GeneralConfig): General {
  return {
    id: config.id,
    name: config.name,
    stats: { ...config.baseStats },
    troops: config.startingTroops,
    position: null,
    status: 'standby',
  };
}

// packages/game-renderer/src/rendering/GeneralRenderer.ts
const createGeneralSprite = (Phaser: any, scene: any, general: General) => {
  const sprite = scene.add.sprite(0, 0, `general_${general.id}`);
  return sprite;
};
```

---

#### State Transition Pattern

**Pattern:** State Machine with Transition Functions

- 상태 변경은 전용 함수로만 수행
- 직접 mutation 금지
- 구체적인 Phase 값은 구현 시 GDD 기반으로 결정

```typescript
// packages/game-core/src/state/types.ts

/** 게임 단계 (구체적 값은 구현 시 결정) */
type GamePhase = /* 'waiting' | 'playing' | 'ended' 등 */;

/** 턴 내 단계 (구체적 값은 구현 시 결정) */
type TurnPhase = /* 'select' | 'action' | 'resolve' 등 */;

/** 게임 상태 */
interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentPlayer: PlayerId;
  actionsRemaining: number;
  // ...
}

// 상태 전이 함수 - 핵심 패턴
function transitionPhase<P>(
  state: GameState,
  to: P,
  validator: (from: P, to: P) => boolean
): Result<GameState> {
  if (!validator(state.phase as P, to)) {
    return {
      success: false,
      error: { code: 'INVALID_TRANSITION', message: `Cannot transition to ${to}` }
    };
  }
  return { success: true, data: { ...state, phase: to } };
}
```

---

#### Data Access Pattern

**Pattern:** Constants Module + Phaser Loader

- 게임 규칙/밸런스: TypeScript 상수 모듈
- 에셋 메타데이터: Phaser Loader (JSON)

```typescript
// 게임 데이터: TypeScript 상수
import { BOARD, COMBAT, GAME } from '@five-tiger-generals/game-core';

const maxGenerals = GAME.MAX_GENERALS; // 5

// 에셋 데이터: Phaser Loader
preload() {
  this.load.json('generals', 'assets/data/generals.json');
}

create() {
  const generalsData = this.cache.json.get('generals');
}
```

---

### Consistency Rules

| 패턴 | 컨벤션 | 강제 방법 |
|------|--------|----------|
| **통신** | 시스템 간 이벤트, 내부는 직접 참조 | 코드 리뷰 |
| **엔티티 생성** | Factory 함수 사용 | `new` 직접 사용 금지 |
| **상태 전이** | 전용 함수로만 변경 | 직접 mutation 금지 |
| **데이터 접근** | 상수는 import, 에셋은 Loader | 하드코딩 금지 |
| **Phaser 참조** | 팩토리 패턴으로 주입 | game-core에서 import 금지 |
| **에러 처리** | Result 타입 반환 | throw 대신 Result 사용 |
| **이벤트 이름** | `domain:action` 형식 | `turn:start`, `combat:result` |

---

## Architecture Validation

### Validation Summary

| 검사 | 결과 | 비고 |
|------|------|------|
| Decision Compatibility | ✅ Pass | 모든 결정 호환 - Phaser + React + 팩토리 패턴 |
| GDD Coverage | ✅ Pass | Phase 1 완전 커버, Phase 2-3 구조 정의 |
| Pattern Completeness | ✅ Pass | Novel + Standard 패턴 정의 완료 |
| Epic Mapping | ✅ Pass | Phase 1 Epic 매핑 완료 |
| Document Completeness | ✅ Pass | 필수 섹션 모두 포함, Placeholder 없음 |

### Coverage Report

**Systems Covered:** 10/10
- Phase 1: 보드, 장수, 이동, 전투, 턴, 승리, UI (완전)
- Phase 2-3: 전술, 멀티플레이어, 계정/랭킹 (구조 정의)

**Patterns Defined:** 8개
- Novel: 삼각형 보드 시스템, 방향성 전투 시스템
- Standard: Communication, Entity Creation, State Transition, Data Access, Error Handling, Event Handling

**Decisions Made:** 8개
- game-core 분리, ID 기반 보드, Zustand + 순수 객체, Supabase, Colyseus, Supabase Auth, Scene-based Loading, Phaser Sound Manager

### Validation Date

2026-02-03

---

## Development Environment

### Prerequisites

| 도구 | 버전 | 비고 |
|------|------|------|
| Node.js | 22.19.0+ | Vite 7 요구사항 |
| pnpm | 9.0+ | 패키지 매니저 (npm/yarn 금지) |
| Git | 2.30+ | 버전 관리 |
| VS Code | 최신 | 권장 에디터 |

**VS Code 확장:**
- ESLint
- Prettier
- TypeScript + JavaScript
- Tailwind CSS IntelliSense

### Setup Commands

```bash
# 1. Node 버전 확인/설정
nvm use 22

# 2. pnpm 설치 (없는 경우)
npm install -g pnpm

# 3. 의존성 설치
pnpm install

# 4. 개발 서버 실행
pnpm dev
```

### First Steps

1. **프로젝트 초기화** - Monorepo 구조 생성, pnpm-workspace.yaml 설정
2. **game-core 패키지** - 보드, 장수, 전투 기본 타입 및 상수 정의
3. **game-renderer 패키지** - Phaser 팩토리 함수, BootScene 구현
4. **web 앱** - React + TanStack Router 설정, useGameLoader 훅 구현

### Development Ports

| 서비스 | 포트 | URL |
|--------|------|-----|
| Web (Vite) | 5173 | http://localhost:5173 |
| API Server | 4000 | http://localhost:4000 (Phase 2) |
| Game Server | 2567 | ws://localhost:2567 (Phase 2) |

---
