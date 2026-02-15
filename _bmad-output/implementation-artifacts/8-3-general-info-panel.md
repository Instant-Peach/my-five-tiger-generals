# Story 8.3: 장수 정보 패널 (General Info Panel)

Status: done

## Story

As a 플레이어,
I want 장수를 선택(탭/클릭)하면 해당 장수의 이름, 소속, 스탯(별/해/달/발), 현재 병력, 활성/OUT 상태 등 상세 정보를 패널에서 한눈에 확인할 수 있기를,
so that 전투 전 장수의 능력치를 파악하고 전략적 판단(공격 방향, 이동 거리 계산 등)을 빠르게 내릴 수 있다.

## Acceptance Criteria

1. **AC1: 장수 기본 정보 표시** - 장수 선택 시 정보 패널에 장수의 한글 이름(nameKo), 소속 플레이어(Player 1/Player 2)가 표시된다. 소속 플레이어는 색상(Player 1: 파란색 `#3B82F6`, Player 2: 빨간색 `#EF4444`)과 아이콘(방패/검)으로 구분되며, 색맹 사용자를 위한 텍스트 라벨도 제공된다.
2. **AC2: 스탯 표시** - 별(star/최대 병력), 해(sun/공격력), 달(moon/방어력), 발(speed/이동력) 4개 스탯이 아이콘+숫자 형태로 명확하게 표시된다. 각 스탯 영역에는 aria-label이 포함되어 스크린리더가 "별 5", "해 4" 등으로 읽을 수 있다.
3. **AC3: 현재 병력 표시** - 현재 병력(troops) / 최대 병력(star)이 숫자와 Progress Bar(체력바) 형태로 동시에 표시된다. Progress Bar는 병력 비율에 따라 색상이 변한다(full: 초록, warning: 노랑, danger: 빨강, out: 회색). 병력 변화 시 깜빡임 애니메이션(감소=빨강, 증가=초록)이 500ms간 재생된다.
4. **AC4: 장수 상태 표시** - 장수가 OUT 상태(status === 'out')일 때 패널에 "OUT" 배지가 눈에 띄게 표시된다. OUT 상태의 장수 정보도 조회 가능하되, 시각적으로 비활성 느낌을 준다.
5. **AC5: 패널 위치 및 레이아웃** - 정보 패널은 게임 보드를 가리지 않는 위치(화면 우측 하단 고정)에 표시된다. `createPortal`을 사용하여 `document.body`에 렌더링되며, z-index가 충분히 높아(9999) 다른 HUD 요소 위에 표시된다. 패널 너비는 320px 고정이며 모바일에서도 적절히 보인다.
6. **AC6: 패널 닫기** - 빈 타일 탭(general:deselected 이벤트) 시 패널이 자동으로 닫힌다. 패널 내 닫기 버튼(X)을 탭해도 패널이 닫힌다. 닫기 버튼의 터치 타겟은 최소 44x44px을 충족한다.
7. **AC7: 반응형 대응** - 모바일(320px~430px)에서 패널이 화면 하단 전체 너비로 표시되고, 데스크톱(1024px+)에서는 우측 하단 320px 고정으로 표시된다. 패널이 화면 밖으로 잘리지 않는다.
8. **AC8: 접근성** - 패널의 모든 인터랙티브 요소(닫기 버튼)의 터치 타겟이 최소 44x44px이다. 패널에 `role="complementary"`, `aria-label="장수 정보 패널"`이 적용된다. 스탯 값에 적절한 aria-label이 있다. 병력 바에 `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`가 적용된다.

## Tasks / Subtasks

- [x] Task 1: GeneralStatsPanel 리팩터링 - 닫기 버튼 통합 (AC: #1, #6, #8)
  - [x] 1.1 `GeneralStatsPanel`에 `onClose` prop이 항상 전달되도록 `GameCanvas.tsx` 수정
  - [x] 1.2 닫기 버튼 클릭 시 `clearSelectedGeneral()` 호출하여 패널 닫기
  - [x] 1.3 닫기 버튼 터치 타겟 44x44px 확인 (CSS: min-width/min-height: 44px)
  - [x] 1.4 패널 외부 빈 타일 탭 시 `general:deselected` 이벤트로 패널 닫힘 확인

- [x] Task 2: GeneralStatsPanel 반응형 레이아웃 개선 (AC: #5, #7)
  - [x] 2.1 `GeneralStatsPanel.css` 파일 생성 (BEM 네이밍)
  - [x] 2.2 데스크톱(1024px+): 우측 하단 고정 320px 너비 (현재 동작 유지)
  - [x] 2.3 모바일(320px~430px): 하단 전체 너비(100%) 레이아웃으로 전환
  - [x] 2.4 CSS 미디어 쿼리 `@media (max-width: 768px)` 적용
  - [x] 2.5 인라인 스타일을 CSS 클래스로 마이그레이션 (유지보수성 향상)

- [x] Task 3: GeneralStatsPanel 접근성 강화 (AC: #2, #3, #4, #8)
  - [x] 3.1 각 스탯 영역의 aria-label 검증 (별, 해, 달, 이동력)
  - [x] 3.2 병력 바(TroopBar)의 `role="progressbar"`, `aria-valuenow/min/max` 검증
  - [x] 3.3 OUT 배지에 `role="status"`, `aria-label="장수 퇴장 상태"` 추가
  - [x] 3.4 패널 `role="complementary"`, `aria-label="장수 정보 패널"` 검증 (기존 유지)

- [x] Task 4: GameCanvas 연동 - 닫기 핸들러 통합 (AC: #6)
  - [x] 4.1 `GameCanvas.tsx`에서 `GeneralStatsPanel`에 `onClose={clearSelectedGeneral}` 전달
  - [x] 4.2 닫기 버튼 클릭 시 Zustand 스토어(`gameUiStore`)의 `selectedGeneralId`가 null로 설정됨 확인
  - [x] 4.3 Phaser Scene에서 빈 타일 탭 시 `general:deselected` 이벤트 발행 → React 패널 닫힘 확인

- [x] Task 5: 단위 테스트 작성 (AC: #1~#8)
  - [x] 5.1 GeneralStatsPanel 기본 렌더링 테스트 (장수 이름, 플레이어 표시)
  - [x] 5.2 스탯 표시 테스트 (별/해/달/발 숫자 정확성)
  - [x] 5.3 병력 바 표시 테스트 (현재/최대 병력, Progress Bar 비율)
  - [x] 5.4 병력 변화 애니메이션 테스트 (감소=빨강 플래시, 증가=초록 플래시)
  - [x] 5.5 OUT 상태 배지 표시 테스트
  - [x] 5.6 닫기 버튼 클릭 테스트 (onClose 콜백 호출 확인)
  - [x] 5.7 접근성 테스트 (aria-label, role 속성 확인)
  - [x] 5.8 장수 미선택 시 패널 미렌더링 테스트 (general=null)
  - [x] 5.9 반응형 CSS 클래스 적용 테스트 (기본 렌더링)

## Dev Notes

### 핵심 아키텍처 패턴

- **UI 레이어**: React Components (`apps/web/src/components/game/`) - 게임 외부 UI 담당
- **게임 레이어**: Phaser (`packages/game-renderer/`) - 게임 캔버스 담당
- **분리 원칙**: 정보 패널은 React 오버레이, 장수 선택은 Phaser, 장수 데이터는 game-core
- **통신 패턴**: Phaser Scene -> React: 이벤트 기반 (`scene.events.emit`), React -> Phaser: Zustand subscribe

### 기존 구현 상태 (리팩터링 대상)

`GeneralStatsPanel.tsx`는 이미 Epic 2 (Story 2-3, 2-4, 2-5)에서 구현되어 있으며 다음 기능을 포함합니다:

| 기능 | 현재 상태 | 이번 스토리 작업 |
|------|----------|-----------------|
| 장수 이름 + 소속 플레이어 표시 | 구현 완료 | 검증/유지 |
| 스탯 그리드 (별/해/달/발) | 구현 완료 | 접근성 검증 |
| 병력 바 (TroopBar) | 구현 완료 | 접근성 검증 |
| 병력 변화 애니메이션 (깜빡임) | 구현 완료 | 검증/유지 |
| OUT 상태 표시 | 구현 완료 | 접근성 강화 (role 추가) |
| 플레이어 색상/아이콘 구분 | 구현 완료 | 검증/유지 |
| 닫기 버튼 | 구현 (선택적 onClose) | **필수 통합** |
| 반응형 레이아웃 | 미구현 (고정 320px) | **신규 구현** |
| CSS 파일 분리 | 미구현 (인라인 스타일) | **신규 구현** |

**이번 스토리의 핵심 작업:**
1. `GameCanvas`에서 `onClose` prop 필수 전달 (닫기 기능 활성화)
2. 반응형 CSS 분리 (인라인 → CSS 파일)
3. 접근성 최종 검증 및 보강

### 장수 선택 → 정보 패널 데이터 흐름

```
사용자: 보드에서 장수 타일 탭
  │
  ▼
GameScene (Phaser) → scene.events.emit('general:selected', { generalId })
  │
  ▼
GameCanvas (React) → handleGeneralSelected()
  ├─ setSelectedGeneral(generalId)  ← Zustand gameUiStore
  └─ setGameState(scene.getGameState())
       │
       ▼
selectedGeneral = getGeneralById(gameState, selectedGeneralId)
  │
  ▼
GeneralStatsPanel (React) ← general prop으로 전달
  └─ createPortal → document.body에 렌더링
```

### 패널 닫기 데이터 흐름

```
방법 1: 빈 타일 탭
  GameScene → scene.events.emit('general:deselected')
    → GameCanvas.handleGeneralDeselected()
      → clearSelectedGeneral()  ← Zustand
        → selectedGeneral = null → 패널 미렌더링

방법 2: 닫기 버튼 클릭
  GeneralStatsPanel → onClose()
    → clearSelectedGeneral()  ← Zustand (GameCanvas에서 전달)
      → selectedGeneral = null → 패널 미렌더링
```

### game-core 타입 참조

```typescript
// General 엔티티 (packages/game-core/src/generals/types.ts)
interface General {
  id: GeneralId;         // "player1_guanyu"
  baseId: GeneralBaseId; // "guanyu"
  name: string;          // "Guan Yu"
  nameKo: string;        // "관우"
  owner: PlayerId;       // "player1" | "player2"
  stats: GeneralStats;   // { star, sun, moon, speed }
  troops: number;        // 현재 병력
  position: TileId | null;
  status: GeneralStatus; // "active" | "out" | "standby"
}

// GeneralStats (packages/game-core/src/generals/types.ts)
interface GeneralStats {
  star: number;   // 별 - 최대 병력
  sun: number;    // 해 - Sun 방향 공격/방어력
  moon: number;   // 달 - Moon 방향 공격/방어력
  speed: number;  // 발 - 이동력
}
```

### game-core 유틸리티 함수 (재사용)

| 함수 | 위치 | 용도 |
|------|------|------|
| `getPlayerColor(playerId)` | `constants/player.ts` | 플레이어 색상 정보 조회 |
| `getTroopStatus(troops, max)` | `generals/troops.ts` | 병력 상태 판정 (full/warning/danger/out) |
| `getTroopRatio(troops, max)` | `generals/troops.ts` | 병력 비율 0~1 |
| `TROOP_COLORS[status]` | `constants/troops.ts` | 병력 상태별 색상 정보 |
| `getGeneralById(state, id)` | `generals/generals.ts` | GameState에서 장수 조회 |

### 비주얼 디자인 참고

기존 색상 팔레트 유지:
- Player 1: `#3B82F6` (파란색, blue-500)
- Player 2: `#EF4444` (빨간색, red-500)
- 패널 배경: `#1f2937` (gray-800)
- 스탯 영역 배경: `bg-gray-700`
- 텍스트: `white`
- 강조(금색): `#ffd700`

### 컴포넌트 의존성

```
GameCanvas
  └─ createPortal(document.body)
       └─ GeneralStatsPanel (기존 컴포넌트 리팩터링)
            ├─ 헤더: 장수 초상화 + 이름 + 소속 플레이어
            ├─ OUT 배지 (조건부)
            ├─ 스탯 그리드: 별/해/달/발
            ├─ TroopBar: 병력 Progress Bar
            └─ 닫기 버튼 (X)
```

### 기존 컴포넌트 재사용/수정 대상

| 컴포넌트 | 액션 |
|---------|------|
| `GeneralStatsPanel.tsx` | 수정 (반응형 CSS 분리, 접근성 강화) |
| `GameCanvas.tsx` | 수정 (`onClose` prop 전달 추가) |
| `GeneralStatsPanel.css` | **새로 생성** (반응형 레이아웃) |

### Project Structure Notes

- 신규 파일: `apps/web/src/components/game/GeneralStatsPanel.css`
- 수정 파일: `apps/web/src/components/game/GeneralStatsPanel.tsx` (CSS import, 클래스명 적용)
- 수정 파일: `apps/web/src/components/game/GameCanvas.tsx` (onClose prop 전달)
- 기존 `components/game/` 디렉토리 내 파일 수정 (기존 패턴 유지)

### 테스트 표준

- 테스트 프레임워크: Vitest + React Testing Library
- 테스트 위치: `apps/web/tests/` 디렉토리 (8-1, 8-2 패턴 따름)
- 파일명: `general-stats-panel.test.tsx`
- E2E: Playwright (`npx playwright test`)

### Phase 1 범위 제한

- 로컬 2인 대전 전용 (온라인 동기화 불필요)
- Player 1 / Player 2 고정 이름 (계정 시스템 없음)
- 양쪽 플레이어 모두 같은 기기에서 번갈아 플레이
- 장수 초상화는 플레이스홀더 이모지 사용 (에셋 미확정)

### References

- [Source: _bmad-output/epics.md - Epic 8, Story 3 (UI-003)]
- [Source: _bmad-output/game-architecture.md - Project Structure, UI Layer]
- [Source: _bmad-output/gdd.md - Unit Types and Classes, GeneralStats]
- [Source: _bmad-output/project-context.md - Phaser+React 통합 규칙]
- [Source: apps/web/src/components/game/GeneralStatsPanel.tsx - 기존 패널 구현]
- [Source: apps/web/src/components/game/GameCanvas.tsx - 패널 통합 및 이벤트 연동]
- [Source: packages/game-core/src/generals/types.ts - General, GeneralStats 타입]
- [Source: packages/game-core/src/constants/player.ts - PlayerColor, getPlayerColor]
- [Source: packages/game-core/src/generals/troops.ts - getTroopStatus, getTroopRatio]
- [Source: apps/web/src/stores/gameUiStore.ts - selectedGeneralId 상태 관리]

---

## Dev Agent Record

### Implementation Summary

**Date:** 2026-02-13
**Agent:** Claude Opus 4.6

### Files Created
- `apps/web/src/components/game/GeneralStatsPanel.css` - 장수 정보 패널 스타일 (BEM 네이밍, 반응형 미디어 쿼리)
- `apps/web/tests/general-stats-panel.test.tsx` - GeneralStatsPanel 단위 테스트 (29개)

### Files Modified
- `apps/web/src/components/game/GeneralStatsPanel.tsx` - 인라인 스타일을 CSS 클래스로 마이그레이션, OUT 배지에 `role="status"` + `aria-label` 추가, `aria-label="장수 정보 패널"` 갱신, CSS import 추가, data-testid 속성 추가
- `apps/web/src/components/game/GameCanvas.tsx` - `GeneralStatsPanel`에 `onClose={clearSelectedGeneral}` prop 전달 추가
- `apps/web/vitest.config.ts` - `@ftg/game-core` 및 `@ftg/game-renderer` alias 경로 수정 (`../../../` -> `../../`)

### Key Decisions
1. **인라인 스타일 최소 유지**: `borderTop` (동적 플레이어 색상)과 `backgroundColor` (동적 TroopBar 색상)만 인라인으로 유지, 나머지는 모두 CSS 클래스로 마이그레이션
2. **BEM 네이밍**: `.general-stats-panel`, `.general-stats-panel__header`, `.general-stats-panel__stat--troops-flash-red` 등 기존 프로젝트 패턴(PlayerInfoBar.css, ActionCounter.css) 따름
3. **반응형 브레이크포인트**: 모바일 `@media (max-width: 768px)` - 하단 전체 너비, 데스크톱 `@media (min-width: 1024px)` - 우측 하단 320px 고정
4. **vitest alias 수정**: 기존 `../../../packages` 경로가 잘못된 디렉토리를 가리키고 있어 `../../packages`로 수정 (기존 테스트는 `@ftg/game-core`를 직접 임포트하지 않아 발견되지 않았던 버그)
5. **onClose prop 유형 유지**: `onClose?: () => void` (선택적)으로 유지하여 하위 호환성 보장. GameCanvas에서는 항상 전달

### Test Results
- 전체 테스트: 64개 통과 (4 파일, 0 실패)
- 신규 테스트: 29개 통과 (general-stats-panel.test.tsx)
- TypeScript 컴파일: 에러 없음
