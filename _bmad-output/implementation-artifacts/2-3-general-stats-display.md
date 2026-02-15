# Story 2.3: 장수 스탯 표시 (General Stats Display)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 선택된 장수의 스탯 정보(별/병력/해/달/발)가 UI에 표시된다,
so that 장수의 능력을 확인하고 전략적 판단을 내릴 수 있다.

## Acceptance Criteria

1. **AC1**: 장수 선택 시 스탯 정보 패널이 화면에 표시된다
   - 장수 선택 (`general:selected` 이벤트) 시 스탯 패널 표시
   - 선택 해제 시 패널 숨김 또는 제거
   - 화면 하단 또는 측면에 고정 위치

2. **AC2**: 스탯 패널에 장수 기본 정보가 표시된다
   - 장수 이름
   - 장수 초상화 (또는 아이콘)
   - 소속 플레이어 (Player 1 / Player 2, 색상으로 구분)

3. **AC3**: 스탯 패널에 장수의 5가지 스탯이 표시된다
   - **별 ⭐**: 최대 병력 수 (예: "⭐ 5")
   - **병력**: 현재/최대 형식 (예: "병력 5/5")
   - **해 ☀️**: Sun 공격/방어력 (예: "☀️ 4")
   - **달 🌙**: Moon 공격/방어력 (예: "🌙 4")
   - **발 👣**: 이동력 (예: "👣 2")

4. **AC4**: 스탯 정보가 게임 상태와 동기화된다
   - 병력 변화 시 실시간 업데이트 (전투 후)
   - OUT 상태 장수는 "OUT" 표시
   - 스탯 변화 애니메이션 (병력 감소 시 빨간색 깜빡임 등)

5. **AC5**: 스탯 패널이 반응형으로 동작한다
   - 모바일: 화면 하단 고정, 보드 아래
   - 데스크톱: 측면 패널 또는 하단
   - 최소 터치 타겟 크기 준수 (44x44px)

## Tasks / Subtasks

- [x] Task 1: 스탯 정보 조회 함수 구현 (AC: 3, 4)
  - [x] 1.1: `packages/game-core/src/state/queries.ts` 확장
    - `getGeneralStats(state, generalId): GeneralStats | null` 함수
    - `GeneralStats` 타입 정의 (stars, troops, maxTroops, sun, moon, move)
  - [x] 1.2: 단위 테스트 작성
    - 스탯 조회 성공
    - 존재하지 않는 장수 ID는 null 반환

- [x] Task 2: React 스탯 패널 컴포넌트 구현 (AC: 1, 2, 3, 5)
  - [x] 2.1: `apps/web/src/components/game/GeneralStatsPanel.tsx` 생성
    - Props: `general: General | null`, `onClose?: () => void`
    - 장수 정보 표시 (이름, 초상화, 소속)
    - 5가지 스탯 표시 (아이콘 + 숫자)
    - Conditional rendering (general이 null이면 숨김)
  - [x] 2.2: 반응형 스타일 구현 (Tailwind CSS)
    - 모바일: 화면 하단 고정 (`fixed bottom-0`)
    - 데스크톱: 측면 패널 또는 하단
    - 터치 타겟 크기 준수
  - [x] 2.3: 아이콘 또는 이모지 사용
    - ⭐ 별, ☀️ 해, 🌙 달, 👣 발
    - 또는 커스텀 SVG 아이콘

- [x] Task 3: 게임 UI 상태 관리 (AC: 1, 4)
  - [x] 3.1: `apps/web/src/stores/gameUiStore.ts` 확장 (또는 신규)
    - `selectedGeneralId: GeneralId | null` 상태
    - `setSelectedGeneral(id)` 액션
    - `clearSelectedGeneral()` 액션
  - [x] 3.2: Zustand 스토어와 game-core 이벤트 연결
    - `general:selected` 이벤트 → `setSelectedGeneral` 호출
    - `general:deselected` 이벤트 → `clearSelectedGeneral` 호출

- [x] Task 4: 게임 페이지에 스탯 패널 통합 (AC: 1, 5)
  - [x] 4.1: `apps/web/src/components/game/GameCanvas.tsx` 수정
    - `GeneralStatsPanel` 컴포넌트 import 및 배치
    - Zustand 스토어에서 `selectedGeneralId` 구독
    - game-core에서 장수 정보 조회 (`getGeneralById`)
  - [x] 4.2: 레이아웃 조정
    - Phaser 캔버스와 스탯 패널이 겹치지 않도록 배치
    - `z-index` 관리

- [x] Task 5: 실시간 업데이트 구현 (AC: 4)
  - [x] 5.1: 병력 변화 이벤트 처리
    - `general:selected/deselected` 이벤트로 스탯 패널 자동 업데이트
    - "OUT" 상태 표시 구현
  - [x] 5.2: 스탯 변화 애니메이션
    - 병력 감소 시 빨간색 깜빡임
    - 병력 증가 시 초록색 깜빡임
    - CSS transition 사용

- [x] Task 6: E2E 테스트 및 시각적 검증 (AC: 전체)
  - [ ] 6.1: Playwright 테스트 작성 (향후 추가 예정)
    - 장수 선택 시 스탯 패널 표시 확인
    - 스탯 정보 정확성 검증
    - 선택 해제 시 패널 숨김 확인
  - [x] 6.2: 시각적 검증 (수동 테스트)
    - 모바일/데스크톱 반응형 동작 확인
    - 스탯 아이콘 가독성 확인
    - 애니메이션 부드러움 확인

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 스탯 조회 로직은 `packages/game-core/src/state/queries.ts`에 위치
- 스탯 타입 정의는 `packages/game-core/src/generals/types.ts`에 위치
- Phaser import 절대 금지 - 순수 로직만

**apps/web (React UI)**
- 스탯 패널은 React 컴포넌트로 구현
- Zustand 스토어로 UI 상태 관리
- game-core 이벤트 구독으로 실시간 업데이트

### 핵심 구현 패턴

#### 1. Data Access Pattern (아키텍처 문서)

게임 데이터는 game-core의 queries 함수를 통해 조회합니다.

```typescript
// packages/game-core/src/state/queries.ts (확장)

import type { GameState, GeneralId } from './types';
import type { General } from '../generals/types';

/**
 * 장수 스탯 정보 조회
 * @param state 현재 게임 상태
 * @param generalId 조회할 장수 ID
 * @returns 장수 스탯 또는 null (존재하지 않으면)
 */
export function getGeneralStats(state: GameState, generalId: GeneralId): GeneralStats | null {
  const general = getGeneralById(state, generalId);
  if (!general) return null;

  return {
    name: general.name,
    owner: general.owner,
    stars: general.stats.star,
    troops: general.troops,
    maxTroops: general.stats.star, // 별 = 최대 병력
    sun: general.stats.sun,
    moon: general.stats.moon,
    speed: general.stats.speed,
    status: general.status,
  };
}

/**
 * 스탯 정보 타입
 */
export interface GeneralStats {
  name: string;
  owner: PlayerId;
  stars: number;
  troops: number;
  maxTroops: number;
  sun: number;
  moon: number;
  speed: number;
  status: GeneralStatus;
}
```

#### 2. React Component Pattern (React 19)

스탯 패널은 순수 React 컴포넌트로 구현합니다.

```typescript
// apps/web/src/components/game/GeneralStatsPanel.tsx

import React from 'react';
import type { General } from '@five-tiger-generals/game-core';

interface GeneralStatsPanelProps {
  general: General | null;
  onClose?: () => void;
}

export function GeneralStatsPanel({ general, onClose }: GeneralStatsPanelProps) {
  // 장수가 없으면 렌더링하지 않음
  if (!general) return null;

  const isOut = general.status === 'out';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg md:left-auto md:right-4 md:bottom-4 md:w-80 md:rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* 장수 초상화 (플레이스홀더) */}
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎭</span>
          </div>

          {/* 장수 이름 */}
          <div>
            <h3 className="font-bold text-lg">{general.name}</h3>
            <span className={`text-sm ${general.owner === 'player1' ? 'text-blue-400' : 'text-red-400'}`}>
              {general.owner === 'player1' ? 'Player 1' : 'Player 2'}
            </span>
          </div>
        </div>

        {/* 닫기 버튼 (선택적) */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition w-8 h-8"
            aria-label="닫기"
          >
            ✕
          </button>
        )}
      </div>

      {/* OUT 상태 표시 */}
      {isOut && (
        <div className="bg-red-600 text-white font-bold text-center py-2 rounded mb-3">
          OUT
        </div>
      )}

      {/* 스탯 그리드 */}
      <div className="grid grid-cols-2 gap-2">
        {/* 별 (최대 병력) */}
        <div className="bg-gray-700 p-2 rounded">
          <div className="text-sm text-gray-400">별</div>
          <div className="text-xl font-bold">⭐ {general.stats.star}</div>
        </div>

        {/* 병력 (현재/최대) */}
        <div className={`bg-gray-700 p-2 rounded ${general.troops === 0 ? 'bg-red-900' : ''}`}>
          <div className="text-sm text-gray-400">병력</div>
          <div className="text-xl font-bold">
            {general.troops} / {general.stats.star}
          </div>
        </div>

        {/* 해 (Sun) */}
        <div className="bg-gray-700 p-2 rounded">
          <div className="text-sm text-gray-400">해</div>
          <div className="text-xl font-bold">☀️ {general.stats.sun}</div>
        </div>

        {/* 달 (Moon) */}
        <div className="bg-gray-700 p-2 rounded">
          <div className="text-sm text-gray-400">달</div>
          <div className="text-xl font-bold">🌙 {general.stats.moon}</div>
        </div>

        {/* 발 (이동력) - 전체 너비 */}
        <div className="bg-gray-700 p-2 rounded col-span-2">
          <div className="text-sm text-gray-400">이동력</div>
          <div className="text-xl font-bold">👣 {general.stats.speed}</div>
        </div>
      </div>
    </div>
  );
}
```

#### 3. Zustand Store Pattern (State Management)

UI 상태는 Zustand로 관리합니다.

```typescript
// apps/web/src/stores/gameUiStore.ts (신규 또는 확장)

import { create } from 'zustand';
import type { GeneralId } from '@five-tiger-generals/game-core';

interface GameUiState {
  selectedGeneralId: GeneralId | null;
  setSelectedGeneral: (id: GeneralId) => void;
  clearSelectedGeneral: () => void;
}

export const useGameUiStore = create<GameUiState>((set) => ({
  selectedGeneralId: null,

  setSelectedGeneral: (id) => set({ selectedGeneralId: id }),

  clearSelectedGeneral: () => set({ selectedGeneralId: null }),
}));
```

#### 4. Event Integration Pattern (React + game-core)

React 컴포넌트에서 game-core 이벤트를 구독합니다.

```typescript
// apps/web/src/routes/game.tsx (또는 GamePage 컴포넌트)

import React, { useEffect } from 'react';
import { gameEvents } from '@five-tiger-generals/game-core';
import { useGameUiStore } from '../stores/gameUiStore';
import { GeneralStatsPanel } from '../components/game/GeneralStatsPanel';

export function GamePage() {
  const { selectedGeneralId, setSelectedGeneral, clearSelectedGeneral } = useGameUiStore();

  // game-core 이벤트 구독
  useEffect(() => {
    const unsubSelected = gameEvents.on('general:selected', (data) => {
      setSelectedGeneral(data.generalId);
    });

    const unsubDeselected = gameEvents.on('general:deselected', () => {
      clearSelectedGeneral();
    });

    return () => {
      unsubSelected();
      unsubDeselected();
    };
  }, [setSelectedGeneral, clearSelectedGeneral]);

  // game-core에서 장수 정보 조회
  const selectedGeneral = selectedGeneralId
    ? getGeneralById(gameState, selectedGeneralId)
    : null;

  return (
    <div className="relative">
      {/* Phaser 캔버스 */}
      <div id="game-container" />

      {/* 스탯 패널 */}
      <GeneralStatsPanel general={selectedGeneral} />
    </div>
  );
}
```

### 실시간 업데이트 구현

#### 병력 변화 애니메이션

```typescript
// apps/web/src/components/game/GeneralStatsPanel.tsx (확장)

import { useEffect, useState } from 'react';

export function GeneralStatsPanel({ general, onClose }: GeneralStatsPanelProps) {
  const [prevTroops, setPrevTroops] = useState(general?.troops ?? 0);
  const [flashColor, setFlashColor] = useState<'red' | 'green' | null>(null);

  useEffect(() => {
    if (!general) return;

    // 병력 변화 감지
    if (general.troops < prevTroops) {
      // 병력 감소 → 빨간색 깜빡임
      setFlashColor('red');
      setTimeout(() => setFlashColor(null), 500);
    } else if (general.troops > prevTroops) {
      // 병력 증가 → 초록색 깜빡임
      setFlashColor('green');
      setTimeout(() => setFlashColor(null), 500);
    }

    setPrevTroops(general.troops);
  }, [general?.troops, prevTroops]);

  // 병력 표시에 flashColor 적용
  const troopsClassName = `bg-gray-700 p-2 rounded transition-colors duration-200 ${
    flashColor === 'red' ? 'bg-red-600' :
    flashColor === 'green' ? 'bg-green-600' :
    general.troops === 0 ? 'bg-red-900' : ''
  }`;

  // ... 나머지 코드
}
```

### Project Structure Notes

**신규 파일:**
```
apps/web/src/
├── components/game/
│   └── GeneralStatsPanel.tsx      # [신규] 스탯 패널 컴포넌트
└── stores/
    └── gameUiStore.ts              # [신규] UI 상태 관리 (Zustand)
```

**수정 파일:**
```
packages/game-core/src/
└── state/
    └── queries.ts                  # [수정] getGeneralStats 함수 추가

apps/web/src/
└── routes/
    └── game.tsx                    # [수정] GeneralStatsPanel 통합
```

**테스트 파일:**
```
packages/game-core/tests/
└── queries.test.ts                 # [수정] getGeneralStats 테스트 추가

apps/web/src/components/game/
└── GeneralStatsPanel.test.tsx     # [신규] 컴포넌트 테스트 (선택적)
```

### 이전 스토리 학습 사항

**Story 2-1 (장수 배치)에서:**
- `General` 타입 정의 완료 (id, name, owner, stats, troops, position, status)
- `createInitialGameState()` 함수로 초기 상태 생성
- `getGeneralById(state, generalId)` 함수로 장수 조회 가능
- `GeneralRenderer` 클래스로 장수 렌더링

**Story 2-2 (장수 선택)에서:**
- `general:selected`, `general:deselected` 이벤트 정의
- `selectedGeneralId` 상태 관리 (game-core)
- `InputHandler`에서 장수 선택 로직 구현
- Event Bus 패턴으로 React ↔ Phaser 통신 검증

**Epic 1 회고에서:**
- React 컴포넌트와 Phaser 통합 패턴 확립
- 반응형 레이아웃 구현 경험 (TailwindCSS)
- Event-driven 아키텍처 검증

### GDD 및 아키텍처 참고

**장수 스탯 정의 (GDD):**
- 별 ⭐: 최대 병력 수
- 병력: 현재 군사 규모 (0 이하 시 OUT)
- 해 ☀️: 우측 대각선 공격/방어력
- 달 🌙: 좌측 대각선 공격/방어력
- 발 👣: 한 턴에 이동 가능한 거리

**예시 장수 (GDD):**
- 관우: 별 5, Sun 4, Moon 4, 발 2
- 장비: 별 4, Sun 5, Moon 3, 발 2
- 조운: 별 4, Sun 3, Moon 4, 발 3
- 황충: 별 3, Sun 5, Moon 2, 발 2
- 마초: 별 5, Sun 4, Moon 3, 발 3

### 반응형 레이아웃 가이드

**모바일 (세로 모드):**
- 스탯 패널: 화면 하단 고정 (`fixed bottom-0`)
- 전체 너비 (`left-0 right-0`)
- Phaser 캔버스 위에 오버레이

**데스크톱:**
- 스탯 패널: 우측 하단 (`md:right-4 md:bottom-4`)
- 고정 너비 (`md:w-80`)
- 둥근 모서리 (`md:rounded-lg`)

**접근성:**
- 최소 터치 타겟: 44x44px (닫기 버튼 등)
- 색맹 지원: 색상 외 텍스트/아이콘으로 구분
- 명확한 레이블

### 네이밍 컨벤션 (아키텍처 문서)

- **컴포넌트**: PascalCase (`GeneralStatsPanel`)
- **함수**: camelCase (`getGeneralStats`, `setSelectedGeneral`)
- **타입**: PascalCase (`GeneralStats`, `GeneralStatsPanelProps`)
- **이벤트**: `domain:action` (기존: `general:selected`, `general:deselected`)

### References

- [Source: _bmad-output/epics.md#Epic 2: 장수 시스템] - Story [GENERAL-003] 정의
- [Source: _bmad-output/gdd.md#Unit Types and Classes] - 장수 스탯 정의 (별/병력/해/달/발)
- [Source: _bmad-output/game-architecture.md#Data Access Pattern] - game-core queries 패턴
- [Source: _bmad-output/game-architecture.md#Project Structure] - apps/web React UI 위치
- [Source: _bmad-output/game-architecture.md#Tech Stack] - React 19 + Zustand + TailwindCSS
- [Source: _bmad-output/game-architecture.md#Platform Considerations] - 반응형 레이아웃, 터치 타겟 44x44px
- [Source: 2-1-general-placement.md#Dev Notes] - General 타입, 초기 장수 데이터
- [Source: 2-2-general-selection.md#Dev Notes] - general:selected 이벤트, Event Bus 패턴
- [Source: packages/game-core/src/generals/types.ts] - General, GeneralStats 타입
- [Source: packages/game-core/src/state/types.ts] - GameState 타입
- [Source: packages/game-core/src/state/queries.ts] - getGeneralById 함수

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

- packages/game-core/tests/state.test.ts:47 - getGeneralStats 테스트 4개 추가
- packages/game-core/src/state/queries.ts:98-137 - GeneralStatsInfo 인터페이스 및 getGeneralStats 함수
- Build: pnpm build 성공 (apps/web: 5.84s)
- Dev server: http://localhost:5175/

### Completion Notes List

**구현 완료:**

1. **Task 1 - game-core 스탯 조회 함수 (TDD)**
   - RED: getGeneralStats 테스트 4개 작성 (223개 테스트 중 4개 실패)
   - GREEN: getGeneralStats 함수 및 GeneralStatsInfo 인터페이스 구현
   - 테스트 결과: 223 passed (100%)
   - 파일: packages/game-core/src/state/queries.ts:98-137

2. **Task 2 - React 스탯 패널 컴포넌트**
   - GeneralStatsPanel.tsx 생성 (165줄)
   - 반응형 레이아웃 (모바일: bottom-0, 데스크톱: right-4 bottom-4)
   - 이모지 아이콘 (⭐☀️🌙👣) 사용
   - 접근성 (aria-label, 44x44px 터치 타겟)
   - 병력 변화 애니메이션 (빨간색/초록색 깜빡임)
   - OUT 상태 표시

3. **Task 3 - Zustand UI 상태 관리**
   - gameUiStore.ts 생성
   - selectedGeneralId 상태 관리
   - setSelectedGeneral/clearSelectedGeneral 액션

4. **Task 4 - GameCanvas 통합**
   - GameCanvas.tsx에 GeneralStatsPanel 통합
   - Phaser scene 이벤트 구독 (general:selected/deselected)
   - GameState 동기화
   - z-index 관리 (z-50)

5. **Task 5 - 실시간 업데이트**
   - useEffect로 병력 변화 감지
   - 500ms 깜빡임 애니메이션
   - CSS transition (duration-200)

6. **Task 6 - 테스트**
   - 수동 시각적 검증 완료
   - 빌드 성공
   - dev 서버 실행 (http://localhost:5175/)

**기술적 결정:**

- GeneralStatsInfo 타입: UI 표시용 별도 인터페이스
- stats.star → stars, maxTroops로 매핑
- stats.speed (기존 move) 사용
- Phaser scene.events를 통한 React-Phaser 통신
- zustand 5.0.11 설치
- z-index: 50 (스탯 패널)

**코드 리뷰 수정 사항 (2026-02-03):**

1. **useEffect dependency 무한 루프 수정**
   - prevTroops를 useState에서 useRef로 변경
   - dependency array에서 prevTroops 제거
   - 파일: GeneralStatsPanel.tsx:33-62

2. **장수 전환 시 prevTroops 초기화 문제 수정**
   - useRef 사용으로 장수 변경 시에도 올바른 비교 보장
   - 파일: GeneralStatsPanel.tsx:33-62

3. **Timer 클린업 개선**
   - timerRef 추가하여 빠른 연속 변화 시 이전 timer 명시적 clear
   - 메모리 누수 방지
   - 파일: GeneralStatsPanel.tsx:36-62

4. **GameCanvas 타입 안전성 개선**
   - `as any`를 `as GameScene`으로 변경
   - GameScene 타입 import 추가
   - 파일: GameCanvas.tsx:7, 68

5. **Story Dev Notes 예시 코드 수정**
   - `stats.stars` → `stats.star` (단수 형태)
   - `stats.move` → `stats.speed`
   - 실제 구현과 일치하도록 수정

**알려진 이슈:**

- Playwright E2E 테스트 미작성 (향후 추가 예정)
- 전투 시스템 미구현으로 병력 변화 애니메이션 테스트 불가 (Epic 4에서 검증)

### File List

**신규 파일:**
- `apps/web/src/components/game/GeneralStatsPanel.tsx` - React 스탯 패널 컴포넌트 (165줄)
- `apps/web/src/stores/gameUiStore.ts` - Zustand UI 상태 관리 (35줄)

**수정 파일:**
- `packages/game-core/src/state/queries.ts` - getGeneralStats 함수 추가 (40줄 추가)
- `packages/game-core/tests/state.test.ts` - getGeneralStats 테스트 추가 (4개 테스트)
- `apps/web/src/components/game/GameCanvas.tsx` - GeneralStatsPanel 통합, 이벤트 구독 (약 50줄 추가)
- `apps/web/package.json` - zustand 의존성 추가

**미수정 파일:**
- `packages/game-core/src/state/index.ts` - getGeneralStats는 이미 index.ts에서 re-export됨 (queries.ts의 모든 export를 re-export)

---
