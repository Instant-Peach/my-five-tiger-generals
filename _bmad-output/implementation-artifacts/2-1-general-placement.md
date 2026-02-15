# Story 2.1: 장수 배치 (General Placement)

Status: done

---

## Story

As a 플레이어,
I want 게임 시작 시 자신의 장수들을 시작 구역(home)에 배치할 수 있다,
so that 게임을 시작하고 전략적 플레이를 진행할 수 있다.

## Acceptance Criteria

1. **AC1**: 장수 데이터 모델이 정의된다
   - General 타입: id, name, stats (별/해/달/발), troops, position, status
   - GeneralStats 타입: star(별), sun(해), moon(달), speed(발)
   - 5명의 기본 장수 데이터 정의 (관우, 장비, 조운, 황충, 마초)

2. **AC2**: 양측 플레이어의 장수 5명씩 총 10명이 시작 구역에 자동 배치된다
   - Player 1: row 5 (타일 25-29) - player1_home 구역
   - Player 2: row 0 (타일 0-4) - player2_home 구역
   - 각 장수는 고유 타일에 1개씩 배치 (타일당 1장수)

3. **AC3**: 배치된 장수가 보드에 시각적으로 표시된다
   - 장수 스프라이트/토큰이 해당 타일 중앙에 렌더링
   - 플레이어별 색상 구분 (자신=파란색, 상대=빨간색 계열)
   - 장수 이미지 또는 플레이스홀더가 표시됨

4. **AC4**: 장수 위치 정보가 게임 상태에 반영된다
   - GameState에 generals 배열 또는 맵 포함
   - 타일 ID로 장수 조회 가능: `getGeneralAtTile(tileId)`
   - 장수 ID로 위치 조회 가능: `getGeneralPosition(generalId)`

5. **AC5**: 배치 완료 후 게임 진행이 가능한 상태가 된다
   - 초기 배치 완료 플래그 또는 GamePhase 전환
   - 장수 선택 및 이동 준비 (다음 스토리 2-2, Epic 3)

## Tasks / Subtasks

- [x] Task 1: 장수 타입 및 상수 정의 (AC: 1)
  - [x] 1.1: `packages/game-core/src/generals/types.ts` 생성 - General, GeneralStats, GeneralStatus 타입
  - [x] 1.2: `packages/game-core/src/generals/constants.ts` 생성 - 5명 기본 장수 데이터 (INITIAL_GENERALS)
  - [x] 1.3: `packages/game-core/src/generals/index.ts` 생성 - public API export

- [x] Task 2: 장수 관리 로직 구현 (AC: 2, 4)
  - [x] 2.1: `packages/game-core/src/generals/generals.ts` 생성 - 장수 팩토리 및 관리 함수
    - `createGeneral(config)`: General 객체 생성
    - `createInitialGenerals(playerId)`: 플레이어별 5명 장수 생성
  - [x] 2.2: `packages/game-core/src/state/types.ts` 생성 또는 확장 - GameState 타입에 generals 추가
  - [x] 2.3: 장수 조회 함수 구현
    - `getGeneralAtTile(state, tileId)`: 해당 타일의 장수 반환
    - `getGeneralById(state, generalId)`: ID로 장수 조회
    - `getGeneralsByPlayer(state, playerId)`: 플레이어별 장수 목록

- [x] Task 3: 초기 배치 로직 구현 (AC: 2, 5)
  - [x] 3.1: `packages/game-core/src/state/initialState.ts` 생성 - 초기 게임 상태 생성
    - `createInitialGameState()`: 빈 보드 + 양측 장수 배치 완료 상태 반환
  - [x] 3.2: 배치 규칙 구현
    - Player 1 장수 → 타일 25, 26, 27, 28, 29
    - Player 2 장수 → 타일 0, 1, 2, 3, 4
  - [x] 3.3: 배치 완료 후 GamePhase = 'playing' 설정

- [x] Task 4: 장수 렌더링 구현 (AC: 3)
  - [x] 4.1: `packages/game-renderer/src/rendering/GeneralRenderer.ts` 생성
    - 장수 스프라이트/토큰 렌더링 클래스
    - 타일 중앙에 배치하는 좌표 계산
  - [x] 4.2: 플레이어별 색상 구분 적용
    - Player 색상 상수 정의 (PLAYER_COLORS)
    - 장수 토큰에 색상 틴트 또는 테두리 적용
  - [x] 4.3: GameScene에서 장수 렌더링 호출 통합
    - 초기 상태 로드 시 모든 장수 렌더링
    - 장수 위치에 따른 표시 위치 계산

- [x] Task 5: 단위 테스트 및 통합 테스트 (AC: 전체)
  - [x] 5.1: 장수 타입 및 팩토리 테스트
  - [x] 5.2: 초기 배치 로직 테스트
  - [x] 5.3: 장수 조회 함수 테스트
  - [x] 5.4: 통합 시나리오 테스트 (게임 시작 → 배치 완료)

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 모든 장수 로직은 `packages/game-core/src/generals/`에 위치
- 게임 상태는 `packages/game-core/src/state/`에 위치
- Phaser import 절대 금지 - 순수 로직만

**game-renderer 패키지 (Phaser 사용)**
- 장수 시각화는 `packages/game-renderer/src/rendering/`에 위치
- game-core의 데이터를 받아서 렌더링만 담당

### 장수 데이터 모델 (GDD 기반)

```typescript
// packages/game-core/src/generals/types.ts

/** 플레이어 ID */
export type PlayerId = 'player1' | 'player2';

/** 장수 ID - 고유 식별자 */
export type GeneralId = string;

/** 장수 상태 */
export type GeneralStatus = 'active' | 'out' | 'standby';

/**
 * 장수 스탯 (GDD 기준)
 * - star(별): 최대 병력 수 (최대 HP)
 * - sun(해): 우측 대각선 공격/방어력
 * - moon(달): 좌측 대각선 공격/방어력
 * - speed(발): 한 턴 이동 가능 거리
 */
export interface GeneralStats {
  star: number;    // 별 ⭐ - 최대 병력
  sun: number;     // 해 ☀️ - Sun 공격/방어
  moon: number;    // 달 🌙 - Moon 공격/방어
  speed: number;   // 발 👣 - 이동력
}

/**
 * 장수 엔티티
 */
export interface General {
  id: GeneralId;
  name: string;
  nameKo: string;           // 한글 이름
  owner: PlayerId;          // 소유 플레이어
  stats: GeneralStats;      // 기본 스탯
  troops: number;           // 현재 병력 (= HP)
  position: TileId | null;  // 현재 위치 (null = 배치 전 또는 OUT)
  status: GeneralStatus;    // 상태
}
```

### 5명 기본 장수 데이터 (GDD 기준)

```typescript
// packages/game-core/src/generals/constants.ts

import type { GeneralStats } from './types';

/** 장수 기본 스탯 정의 */
export const GENERAL_BASE_STATS: Record<string, GeneralStats & { name: string; nameKo: string }> = {
  guanyu: {
    name: 'Guan Yu',
    nameKo: '관우',
    star: 5,
    sun: 4,
    moon: 4,
    speed: 2,
  },
  zhangfei: {
    name: 'Zhang Fei',
    nameKo: '장비',
    star: 4,
    sun: 5,
    moon: 3,
    speed: 2,
  },
  zhaoyun: {
    name: 'Zhao Yun',
    nameKo: '조운',
    star: 4,
    sun: 3,
    moon: 4,
    speed: 3,
  },
  huangzhong: {
    name: 'Huang Zhong',
    nameKo: '황충',
    star: 3,
    sun: 5,
    moon: 2,
    speed: 2,
  },
  machao: {
    name: 'Ma Chao',
    nameKo: '마초',
    star: 5,
    sun: 4,
    moon: 3,
    speed: 3,
  },
} as const;

/** 장수 배열 순서 (배치 순서) */
export const GENERAL_ORDER = ['guanyu', 'zhangfei', 'zhaoyun', 'huangzhong', 'machao'] as const;

/** 플레이어별 시작 타일 */
export const PLAYER_START_TILES: Record<PlayerId, TileId[]> = {
  player1: [25, 26, 27, 28, 29], // row 5 - player1_home
  player2: [0, 1, 2, 3, 4],      // row 0 - player2_home
};
```

### 게임 상태 타입 (신규 또는 확장)

```typescript
// packages/game-core/src/state/types.ts

import type { TileId } from '../board/types';
import type { General, GeneralId, PlayerId } from '../generals/types';

/** 게임 단계 */
export type GamePhase = 'setup' | 'playing' | 'ended';

/** 턴 내 단계 */
export type TurnPhase = 'select' | 'action' | 'confirm';

/**
 * 게임 상태
 */
export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentPlayer: PlayerId;
  turn: number;
  generals: General[];
  // 추후 확장: knockCount, winner 등
}
```

### 장수 팩토리 함수 패턴 (아키텍처 준수)

```typescript
// packages/game-core/src/generals/generals.ts

import { GENERAL_BASE_STATS, GENERAL_ORDER, PLAYER_START_TILES } from './constants';
import type { General, GeneralId, PlayerId } from './types';

/**
 * 장수 생성 팩토리 함수
 */
export function createGeneral(
  baseId: string,
  owner: PlayerId,
  position: TileId | null = null
): General {
  const base = GENERAL_BASE_STATS[baseId];
  if (!base) {
    throw new Error(`Unknown general: ${baseId}`);
  }

  return {
    id: `${owner}_${baseId}`,
    name: base.name,
    nameKo: base.nameKo,
    owner,
    stats: {
      star: base.star,
      sun: base.sun,
      moon: base.moon,
      speed: base.speed,
    },
    troops: base.star, // 초기 병력 = 최대 병력 (star)
    position,
    status: 'active',
  };
}

/**
 * 플레이어별 초기 장수 5명 생성 및 배치
 */
export function createInitialGenerals(playerId: PlayerId): General[] {
  const startTiles = PLAYER_START_TILES[playerId];

  return GENERAL_ORDER.map((baseId, index) =>
    createGeneral(baseId, playerId, startTiles[index])
  );
}
```

### 장수 조회 함수

```typescript
// packages/game-core/src/state/queries.ts

import type { GameState } from './types';
import type { General, GeneralId, PlayerId } from '../generals/types';
import type { TileId } from '../board/types';

/** 특정 타일의 장수 조회 */
export function getGeneralAtTile(state: GameState, tileId: TileId): General | undefined {
  return state.generals.find(g => g.position === tileId && g.status === 'active');
}

/** ID로 장수 조회 */
export function getGeneralById(state: GameState, generalId: GeneralId): General | undefined {
  return state.generals.find(g => g.id === generalId);
}

/** 플레이어별 활성 장수 목록 */
export function getGeneralsByPlayer(state: GameState, playerId: PlayerId): General[] {
  return state.generals.filter(g => g.owner === playerId && g.status === 'active');
}

/** 특정 타일이 점유되었는지 확인 */
export function isTileOccupied(state: GameState, tileId: TileId): boolean {
  return state.generals.some(g => g.position === tileId && g.status === 'active');
}
```

### 초기 게임 상태 생성

```typescript
// packages/game-core/src/state/initialState.ts

import type { GameState } from './types';
import { createInitialGenerals } from '../generals/generals';

/**
 * 초기 게임 상태 생성
 * - 양측 장수 5명씩 시작 구역에 배치
 * - Player 1이 선공
 */
export function createInitialGameState(): GameState {
  const player1Generals = createInitialGenerals('player1');
  const player2Generals = createInitialGenerals('player2');

  return {
    phase: 'playing',
    turnPhase: 'select',
    currentPlayer: 'player1',
    turn: 1,
    generals: [...player1Generals, ...player2Generals],
  };
}
```

### 렌더링 구현 가이드

```typescript
// packages/game-renderer/src/rendering/GeneralRenderer.ts

// 주의: 이 파일은 game-renderer 패키지에 위치 (Phaser 사용 가능)

import type { General, PlayerId } from '@five-tiger-generals/game-core';
import type { Scene } from 'phaser';

/** 플레이어별 장수 색상 */
export const PLAYER_COLORS = {
  player1: 0x3b82f6, // 파란색 (자신)
  player2: 0xef4444, // 빨간색 (상대)
} as const;

export class GeneralRenderer {
  private scene: Scene;
  private sprites: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * 장수 렌더링
   * @param general 장수 데이터
   * @param x 타일 중심 x 좌표
   * @param y 타일 중심 y 좌표
   */
  renderGeneral(general: General, x: number, y: number): void {
    // 기존 스프라이트 제거
    this.removeGeneral(general.id);

    // 컨테이너 생성 (장수 토큰 + 병력 표시)
    const container = this.scene.add.container(x, y);

    // 장수 토큰 (원형 또는 사각형 플레이스홀더)
    const token = this.scene.add.circle(0, 0, 20, PLAYER_COLORS[general.owner]);
    token.setStrokeStyle(2, 0xffffff);

    // 장수 이니셜 또는 아이콘 (임시)
    const initial = this.scene.add.text(0, 0, general.nameKo.charAt(0), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 병력 표시 (하단)
    const troopText = this.scene.add.text(0, 25, `${general.troops}`, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    container.add([token, initial, troopText]);
    this.sprites.set(general.id, container);
  }

  /** 장수 제거 */
  removeGeneral(generalId: string): void {
    const existing = this.sprites.get(generalId);
    if (existing) {
      existing.destroy();
      this.sprites.delete(generalId);
    }
  }

  /** 모든 장수 렌더링 */
  renderAllGenerals(generals: General[], getTileCenter: (tileId: number) => { x: number; y: number }): void {
    generals.forEach(general => {
      if (general.position !== null && general.status === 'active') {
        const { x, y } = getTileCenter(general.position);
        this.renderGeneral(general, x, y);
      }
    });
  }
}
```

### Project Structure Notes

**신규 파일 구조:**
```
packages/game-core/src/
├── generals/                    # [신규] 장수 시스템
│   ├── types.ts                 # General, GeneralStats 타입
│   ├── constants.ts             # 5명 장수 데이터, 시작 타일
│   ├── generals.ts              # 팩토리 함수, 관리 로직
│   └── index.ts                 # public API
├── state/                       # [신규] 게임 상태
│   ├── types.ts                 # GameState, GamePhase 타입
│   ├── initialState.ts          # 초기 상태 생성
│   ├── queries.ts               # 상태 조회 함수
│   └── index.ts                 # public API
└── index.ts                     # 루트 export (generals, state 추가)

packages/game-renderer/src/
├── rendering/
│   ├── GeneralRenderer.ts       # [신규] 장수 렌더링
│   └── ...
└── scenes/
    └── GameScene.ts             # [수정] 장수 렌더링 통합
```

**네이밍 컨벤션:**
- 타입: PascalCase (General, GameState)
- 함수: camelCase (createGeneral, getGeneralAtTile)
- 상수: UPPER_SNAKE_CASE (GENERAL_BASE_STATS, PLAYER_START_TILES)

### 이전 스토리 학습 사항 (Epic 1)

**1-6 타일 좌표 시스템에서:**
- `getTileMeta(tileId)` 함수로 타일 정보 조회 가능
- zone 정보로 player1_home, player2_home 구분
- 장수 배치 시 zone 검증에 활용

**1-1~1-5 스토리에서:**
- 보드 렌더링, 타일 선택, 하이라이트 기능 완성
- TileRenderer 패턴 참고하여 GeneralRenderer 구현
- BoardRenderer의 getTileCenter() 활용

### 테스트 시나리오

```typescript
// packages/game-core/tests/generals.test.ts

describe('장수 시스템', () => {
  describe('장수 생성', () => {
    it('관우 장수가 올바른 스탯으로 생성된다', () => {
      const guanyu = createGeneral('guanyu', 'player1');
      expect(guanyu.stats.star).toBe(5);
      expect(guanyu.stats.sun).toBe(4);
      expect(guanyu.stats.moon).toBe(4);
      expect(guanyu.stats.speed).toBe(2);
      expect(guanyu.troops).toBe(5); // 초기 병력 = star
    });

    it('플레이어별 5명 장수가 생성된다', () => {
      const generals = createInitialGenerals('player1');
      expect(generals).toHaveLength(5);
      expect(generals.every(g => g.owner === 'player1')).toBe(true);
    });
  });

  describe('초기 배치', () => {
    it('Player 1 장수가 row 5 (타일 25-29)에 배치된다', () => {
      const generals = createInitialGenerals('player1');
      const positions = generals.map(g => g.position);
      expect(positions).toEqual([25, 26, 27, 28, 29]);
    });

    it('Player 2 장수가 row 0 (타일 0-4)에 배치된다', () => {
      const generals = createInitialGenerals('player2');
      const positions = generals.map(g => g.position);
      expect(positions).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('장수 조회', () => {
    it('타일 ID로 장수를 조회할 수 있다', () => {
      const state = createInitialGameState();
      const general = getGeneralAtTile(state, 25);
      expect(general).toBeDefined();
      expect(general?.owner).toBe('player1');
    });

    it('빈 타일은 undefined를 반환한다', () => {
      const state = createInitialGameState();
      const general = getGeneralAtTile(state, 10); // center 타일
      expect(general).toBeUndefined();
    });
  });
});
```

### 성능 고려사항

- `generals` 배열은 최대 10개 (양측 5명씩) → 선형 탐색 O(n) 충분
- 장수 스프라이트는 Phaser Container로 그룹화 → 일괄 이동/제거 용이
- 위치 조회 빈번 시 Map<TileId, GeneralId> 인덱스 추가 고려

### References

- [Source: _bmad-output/gdd.md#Unit Types and Classes] - 장수 스탯 구조, 예시 장수 데이터
- [Source: _bmad-output/gdd.md#Grid System and Movement] - 타일 구역 정의 (player1_home, player2_home)
- [Source: _bmad-output/game-architecture.md#Game Logic Architecture] - game-core 패키지 구조
- [Source: _bmad-output/game-architecture.md#Entity Creation Pattern] - Factory Functions 패턴
- [Source: _bmad-output/game-architecture.md#State Management] - Zustand + 순수 객체 패턴
- [Source: _bmad-output/game-architecture.md#Project Structure] - 파일 위치 가이드
- [Source: _bmad-output/epics.md#Epic 2: 장수 시스템] - Story [GENERAL-001]
- [Source: packages/game-core/src/board/types.ts] - TileId, TileZone 타입
- [Source: 1-6-tile-coordinate-system.md] - 좌표 시스템 구현 상태

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 모든 테스트 통과: 191개 (game-core)
- 빌드 성공

### Completion Notes List

- AC1: 장수 데이터 모델 정의 완료 (types.ts, constants.ts)
- AC2: 양측 장수 10명 시작 구역 자동 배치 구현 (createInitialGenerals, createInitialGameState)
- AC3: 장수 시각적 렌더링 구현 (GeneralRenderer.ts) - 플레이어별 색상 구분
- AC4: 장수 위치 정보 게임 상태 반영 (GameState, 조회 함수들)
- AC5: GamePhase='playing'으로 게임 진행 가능 상태 설정

### 향후 고려사항 (사용자 피드백 반영)

1. **턴당 행동 제한 (Epic 5에서 구현)**
   - 턴당 최대 3회 행동
   - 동일 장수 동일 행동 제한: 같은 장수가 한 턴에 같은 행동을 두 번 수행 불가
   - 예: 관우가 이동 후 같은 턴에 다시 이동 불가 (공격은 가능)
   - → 이 로직은 **플레이어/턴 상태**에서 관리 (Epic 5)

2. **장수 보유 vs 출전(배치) 분리 (Phase 3+)**
   - **계정 보유 장수**: 플레이어가 해금/수집한 장수 목록 (5명 이상 가능)
   - **게임 슬롯**: 한 게임에서 사용할 수 있는 장수 수 (최대 5명)
   - **출전 행동**: 보유 장수를 게임 중 보드에 배치 (1 행동 소모, 병력 지정)
   - MVP: 게임 시작 시 5명 자동 배치 (출전 시스템 생략)
   - Phase 3+: 수동 출전 시스템 구현 (배치 타이밍, 병력 조절 전략)

### File List

**신규 생성:**
- `packages/game-core/src/generals/types.ts` - 장수 타입 정의
- `packages/game-core/src/generals/constants.ts` - 5명 장수 기본 데이터
- `packages/game-core/src/generals/generals.ts` - 장수 팩토리 함수
- `packages/game-core/src/generals/index.ts` - public API
- `packages/game-core/src/state/types.ts` - GameState, GamePhase 타입
- `packages/game-core/src/state/queries.ts` - 장수 조회 함수
- `packages/game-core/src/state/initialState.ts` - 초기 상태 생성
- `packages/game-core/src/state/index.ts` - state 모듈 public API
- `packages/game-core/tests/generals.test.ts` - 장수 시스템 테스트
- `packages/game-core/tests/state.test.ts` - 게임 상태 테스트
- `packages/game-renderer/src/rendering/GeneralRenderer.ts` - 장수 렌더링

**수정:**
- `packages/game-core/src/index.ts` - generals, state 모듈 export 추가
- `packages/game-renderer/src/scenes/GameScene.ts` - GeneralRenderer 통합

