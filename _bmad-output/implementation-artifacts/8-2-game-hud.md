# Story 8.2: 게임 HUD (Game HUD)

Status: dev-complete

## Story

As a 플레이어,
I want 게임 중 HUD에서 턴 정보, 타이머, 행동 카운터, 양 플레이어의 노크 카운트를 한눈에 볼 수 있기를,
so that 현재 게임 상황을 즉시 파악하고 남은 행동과 시간을 고려한 전략적 결정을 내릴 수 있다.

## Acceptance Criteria

1. **AC1: 플레이어 정보 바** - 게임 HUD 상단에 양 플레이어의 정보가 표시된다. 각 플레이어의 이름(Player 1/Player 2), 노크 카운트(별 아이콘 또는 도트), 색상 구분(Player 1: 파란색, Player 2: 빨간색)이 좌우로 배치되며, 현재 턴 플레이어가 시각적으로 강조된다.
2. **AC2: 행동 카운터 표시** - HUD에 현재 턴의 남은 행동 횟수(actionsRemaining)가 시각적으로 표시된다(예: 도트 3개 중 사용한 만큼 비어지는 형태). 행동 소모 시 애니메이션과 함께 업데이트된다.
3. **AC3: 턴/타이머 통합 표시** - 현재 턴 번호와 60초 타이머가 플레이어 정보 바 중앙에 통합되어 표시된다. 기존 TurnIndicator/TurnTimer의 기능을 유지하되, 레이아웃이 상단 바에 자연스럽게 통합된다.
4. **AC4: 게임 상태 이벤트 동기화** - GameScene에서 발행하는 이벤트(turn:start, timer:tick, combat:attack, general:moved, knock:success)를 구독하여 HUD가 실시간으로 업데이트된다. actionsRemaining 값은 gameState에서 동기화된다.
5. **AC5: 반응형 레이아웃** - HUD가 모바일(320px~430px)과 데스크톱(1024px+)에서 모두 올바르게 표시된다. 모바일에서는 간결한 레이아웃, 데스크톱에서는 여유 있는 레이아웃으로 조정된다.
6. **AC6: 터치 타겟 접근성** - HUD 내 모든 인터랙티브 요소(항복 버튼 등)의 터치 타겟이 최소 44x44px을 충족한다. HUD 정보 영역은 표시 전용이므로 게임 보드의 터치 이벤트를 차단하지 않는다(pointerEvents: 'none' 유지).

## Tasks / Subtasks

- [x] Task 1: PlayerInfoBar 컴포넌트 생성 (AC: #1, #5, #6)
  - [x] 1.1 `apps/web/src/components/game/PlayerInfoBar.tsx` 파일 생성
  - [x] 1.2 `apps/web/src/components/game/PlayerInfoBar.css` 파일 생성
  - [x] 1.3 좌측 Player 1 정보 영역 (이름, 노크 카운트 도트)
  - [x] 1.4 우측 Player 2 정보 영역 (이름, 노크 카운트 도트)
  - [x] 1.5 현재 턴 플레이어 강조 표시 (테두리/배경 하이라이트)
  - [x] 1.6 반응형 레이아웃 (모바일: 이름 축약, 데스크톱: 전체 표시)
  - [x] 1.7 색맹 지원을 위한 아이콘 구분 (색상 외 추가 시각적 구분)

- [x] Task 2: ActionCounter 컴포넌트 생성 (AC: #2)
  - [x] 2.1 `apps/web/src/components/game/ActionCounter.tsx` 파일 생성
  - [x] 2.2 `apps/web/src/components/game/ActionCounter.css` 파일 생성
  - [x] 2.3 최대 3개 도트로 남은 행동 시각화 (채워진/빈 도트)
  - [x] 2.4 행동 소모 시 도트 페이드아웃 애니메이션
  - [x] 2.5 role="status"와 aria-label로 접근성 지원

- [x] Task 3: GameHUD 리팩터링 - 상단 바 통합 (AC: #3, #5)
  - [x] 3.1 GameHUD의 topContent 영역을 PlayerInfoBar + 턴/타이머 통합 레이아웃으로 변경
  - [x] 3.2 기존 TurnIndicator의 턴 번호와 TurnTimer를 PlayerInfoBar 중앙에 배치
  - [x] 3.3 ActionCounter를 턴/타이머 하단 또는 인접 위치에 배치
  - [x] 3.4 기존 GameHUD의 slot 기반 구조는 유지 (하단 좌/우 영역 그대로)

- [x] Task 4: GameCanvas 이벤트 연동 - actionsRemaining 동기화 (AC: #4)
  - [x] 4.1 GameCanvas에 actionsRemaining 상태 추가 (useState)
  - [x] 4.2 gameState 변경 시 actionsRemaining 동기화 (turn:start, general:moved, combat:attack, knock:success 이벤트 핸들러 내에서)
  - [x] 4.3 양 플레이어의 knockCount를 상시 추적하는 상태 추가 (player1KnockCount, player2KnockCount)
  - [x] 4.4 PlayerInfoBar와 ActionCounter에 상태 props 전달

- [x] Task 5: 단위 테스트 작성 (AC: #1~#6)
  - [x] 5.1 PlayerInfoBar 렌더링 테스트 (양 플레이어 이름, 노크 카운트, 현재 턴 강조)
  - [x] 5.2 ActionCounter 렌더링 테스트 (도트 개수, 남은 행동 표시)
  - [x] 5.3 ActionCounter 행동 소모 시 업데이트 테스트
  - [x] 5.4 접근성 테스트 (aria-label, role 속성 확인)
  - [x] 5.5 반응형 레이아웃 기본 렌더링 테스트

## Dev Notes

### 핵심 아키텍처 패턴

- **UI 레이어**: React Components (`apps/web/src/components/game/`) - 게임 외부 UI 담당
- **게임 레이어**: Phaser (`packages/game-renderer/`) - 게임 캔버스 담당
- **분리 원칙**: HUD는 React 오버레이, 게임 렌더링은 Phaser, 로직은 game-core
- **통신 패턴**: Phaser Scene -> React: 이벤트 기반 (`scene.events.emit`), React -> Phaser: Zustand subscribe

### 현재 HUD 구현 상태 (리팩터링 대상)

현재 GameHUD는 다음과 같이 개별 컴포넌트로 분산되어 있습니다:

| 위치 | 컴포넌트 | 표시 정보 |
|------|----------|-----------|
| 상단 중앙 | `TurnIndicator` | 턴 번호, 현재 플레이어, 타이머 |
| 상단 우측 | `SurrenderButton` | 항복 버튼 |
| 하단 좌측 | `KnockButton` | 노크 버튼 + 카운트 (조건부) |
| 하단 우측 | `TurnEndButton` | 턴 종료 버튼 |

**리팩터링 방향:**
- 상단 영역을 하나의 PlayerInfoBar로 통합 (양 플레이어 정보 + 턴/타이머 중앙 배치)
- ActionCounter를 새로 추가하여 남은 행동 횟수 표시
- 기존 TurnIndicator/TurnTimer의 핵심 로직은 유지하되, 레이아웃만 PlayerInfoBar 안으로 이동
- 하단 영역(TurnEndButton, KnockButton)은 그대로 유지

### actionsRemaining 데이터 흐름

현재 `actionsRemaining`은 game-core의 `GameState`에서만 관리되고 React 측에 직접 동기화되지 않습니다.

```
GameScene (Phaser)
  └─ gameState.actionsRemaining  ← game-core에서 관리
  └─ events: general:moved, combat:attack, knock:success  ← 행동 시 발행
       │
       └─► GameCanvas (React)
             └─ gameState useState ← scene.getGameState() 호출로 동기화
             └─ actionsRemaining useState ← 새로 추가 필요
                   │
                   └─► ActionCounter 컴포넌트 (새로 생성)
```

**동기화 전략:**
- 기존 이벤트 핸들러(handleTurnStart, handleGeneralSelected 등) 내에서 `scene.getGameState()` 호출 시 actionsRemaining도 함께 추출
- 별도 이벤트 추가 없이 기존 gameState 동기화 로직 활용

### knockCount 데이터 흐름

양 플레이어의 knockCount는 현재 KnockButton에서만 표시됩니다. PlayerInfoBar에서 상시 표시하려면:

```
GameState.player1KnockCount / player2KnockCount
  └─► GameCanvas에서 gameState 업데이트 시 추출
       └─► PlayerInfoBar에 props로 전달
```

### 06-ui-page-flow.md 참조 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  P1: Player 1      턴 N | 45초      P2: Player 2       │
│  노크: ●●○       행동: ●●○           노크: ●○○        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                   [게임 보드 영역]                        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  [노크]                               [턴 종료] [항복]  │
└─────────────────────────────────────────────────────────┘
```

### 컴포넌트 의존성

```
GameCanvas
  └─ GameHUD (오버레이 컨테이너)
       ├─ topContent: PlayerInfoBar (새로 생성)
       │    ├─ Player 1 정보 (이름, 노크 카운트)
       │    ├─ 중앙: 턴 번호 + TurnTimer + ActionCounter
       │    └─ Player 2 정보 (이름, 노크 카운트)
       ├─ topRightContent: SurrenderButton (기존 유지)
       ├─ leftContent: KnockButton (기존 유지)
       └─ children: TurnEndButton (기존 유지)
```

### 비주얼 디자인 참고

기존 색상 팔레트 유지:
- Player 1: `#2563EB` (파란색)
- Player 2: `#DC2626` (빨간색)
- 배경: `rgba(0, 0, 0, 0.7)` (반투명 검정)
- 강조: `#ffd700` (금색, 현재 턴 강조)
- 텍스트: `white`
- 행동 도트 (채워짐): `#ffd700` (금색)
- 행동 도트 (비어짐): `rgba(255, 255, 255, 0.3)`

### 기존 TurnIndicator 처리

TurnIndicator 컴포넌트는 **삭제하지 않고** 유지합니다. PlayerInfoBar가 TurnIndicator의 시각적 역할을 대체하지만, 기존 컴포넌트는 다른 용도(단독 사용 등)로 재사용될 수 있으므로 import만 변경합니다.

- GameCanvas에서 GameHUD의 `topContent`에 TurnIndicator 대신 PlayerInfoBar를 전달
- TurnIndicator.tsx 파일은 삭제하지 않음

### 기존 컴포넌트 재사용/수정 대상

| 컴포넌트 | 액션 |
|---------|------|
| `GameHUD.tsx` | 수정 (topContent 영역 레이아웃 조정) |
| `GameCanvas.tsx` | 수정 (actionsRemaining/knockCount 상태 추가, PlayerInfoBar 연결) |
| `TurnIndicator.tsx` | 유지 (직접 수정 없음, import만 GameCanvas에서 변경) |
| `TurnTimer.tsx` | 유지 (PlayerInfoBar 내부에서 재사용) |
| `PlayerInfoBar.tsx` | **새로 생성** |
| `ActionCounter.tsx` | **새로 생성** |

### Project Structure Notes

- 새 파일: `apps/web/src/components/game/PlayerInfoBar.tsx`, `PlayerInfoBar.css`
- 새 파일: `apps/web/src/components/game/ActionCounter.tsx`, `ActionCounter.css`
- 수정 파일: `apps/web/src/components/game/GameCanvas.tsx` (상태 추가, props 변경)
- 수정 파일: `apps/web/src/components/game/GameHUD.tsx` (topContent 레이아웃 미세 조정)
- 기존 `components/game/` 디렉토리 내 파일 생성 (기존 패턴 유지)

### 테스트 표준

- 테스트 프레임워크: Vitest + React Testing Library
- 테스트 위치: `apps/web/tests/` 디렉토리 (8-1 패턴 따름)
- 파일명: `player-info-bar.test.tsx`, `action-counter.test.tsx`
- E2E: Playwright (`npx playwright test`)

### Phase 1 범위 제한

- 로컬 2인 대전 전용 (온라인 동기화 불필요)
- Player 1 / Player 2 고정 이름 (계정 시스템 없음)
- 양쪽 플레이어 모두 같은 기기에서 번갈아 플레이

### References

- [Source: _bmad-output/epics.md - Epic 8, Story 2 (UI-002)]
- [Source: docs/project-plan/06-ui-page-flow.md - Section 2.5 (게임 화면)]
- [Source: _bmad-output/game-architecture.md - Project Structure, UI Layer]
- [Source: _bmad-output/gdd.md - Action Economy, Turn Structure]
- [Source: _bmad-output/project-context.md - Phaser+React 통합 규칙]
- [Source: apps/web/src/components/game/GameCanvas.tsx - 현재 HUD 구조]
- [Source: apps/web/src/components/game/GameHUD.tsx - HUD 컨테이너]
- [Source: apps/web/src/components/game/TurnIndicator.tsx - 턴 표시]
- [Source: apps/web/src/components/game/TurnTimer.tsx - 타이머]
- [Source: packages/game-core/src/state/types.ts - GameState.actionsRemaining]

---

## Dev Agent Record

### Implementation Summary

**Date:** 2026-02-13
**Agent:** Claude Opus 4.6

### Files Created
- `apps/web/src/components/game/PlayerInfoBar.tsx` - 플레이어 정보 통합 바 컴포넌트
- `apps/web/src/components/game/PlayerInfoBar.css` - PlayerInfoBar 스타일 (BEM, 반응형)
- `apps/web/src/components/game/ActionCounter.tsx` - 행동 카운터 컴포넌트 (도트 시각화)
- `apps/web/src/components/game/ActionCounter.css` - ActionCounter 스타일 (애니메이션, 반응형)
- `apps/web/tests/player-info-bar.test.tsx` - PlayerInfoBar 단위 테스트 (14개)
- `apps/web/tests/action-counter.test.tsx` - ActionCounter 단위 테스트 (13개)

### Files Modified
- `apps/web/src/components/game/GameHUD.tsx` - 상단 영역을 전체 너비 바 레이아웃으로 리팩터링
- `apps/web/src/components/game/GameCanvas.tsx` - TurnIndicator -> PlayerInfoBar 교체, actionsRemaining/knockCount 상태 추가 및 이벤트 동기화

### Key Decisions
1. **TurnIndicator 유지**: 기존 TurnIndicator.tsx/css 파일은 삭제하지 않고 유지 (재사용 가능성)
2. **syncHudState 헬퍼**: 이벤트 핸들러마다 gameState에서 actionsRemaining/knockCount를 추출하는 중복 로직을 헬퍼 함수로 추출
3. **색맹 지원**: Player 1은 실선 테두리 + 위 삼각형 아이콘, Player 2는 점선 테두리 + 아래 삼각형 아이콘으로 색상 외 시각적 구분 제공
4. **pointer-events: none**: PlayerInfoBar 전체에 적용하여 게임 보드 터치 이벤트를 차단하지 않음. SurrenderButton만 pointer-events: auto 유지

### Test Results
- 전체 테스트: 35개 통과 (3 파일, 0 실패)
- TypeScript 컴파일: 에러 없음
