# Story 8.1: 메인 메뉴 (Main Menu)

Status: done

## Story

As a 플레이어,
I want 앱 실행 시 메인 메뉴를 볼 수 있고 게임 모드를 선택할 수 있기를,
so that 게임을 시작하기 전에 명확한 진입점과 선택지가 있다.

## Acceptance Criteria

1. **AC1: 메인 메뉴 화면 표시** - 앱 실행 시 게임 타이틀("오호대장군", "五虎大將軍"), 부제("관우, 장비, 조운, 황충, 마초 - 다섯 맹장과 함께 천하를 호령하라"), "게임 시작" 버튼이 포함된 메인 메뉴가 표시된다.
2. **AC2: 게임 시작 동작** - "게임 시작" 버튼 클릭/탭 시 2인 로컬 대전 게임 화면(GameCanvas)으로 전환된다.
3. **AC3: 게임 종료 후 복귀** - 게임 종료(승리/패배) 결과 화면에서 "메인 메뉴로" 버튼 클릭 시 메인 메뉴로 돌아올 수 있다.
4. **AC4: 반응형 레이아웃** - 메인 메뉴가 모바일(320px~430px)과 데스크톱(1024px+) 화면 모두에서 올바르게 표시된다.
5. **AC5: 터치 타겟 접근성** - 모든 버튼의 터치 타겟이 최소 44x44px을 충족한다.
6. **AC6: 비주얼 스타일** - 게임의 삼국지 테마에 어울리는 색상(배경 #1a1a2e, 타이틀 #ffd700 금색, 버튼 #c9302c 붉은색)을 사용한다.

## Tasks / Subtasks

- [x] Task 1: StartScreen 컴포넌트 생성 (AC: #1, #4, #5, #6)
  - [x] 1.1 `apps/web/src/components/menu/StartScreen.tsx` 파일 생성
  - [x] 1.2 게임 타이틀 ("오호대장군" + "五虎大將軍") 표시
  - [x] 1.3 부제 텍스트 표시
  - [x] 1.4 "게임 시작" 버튼 구현 (48px min-height, 44px 이상 터치 타겟)
  - [x] 1.5 반응형 레이아웃 (모바일/데스크톱, 430px breakpoint)
  - [x] 1.6 CSS 파일 생성 (`StartScreen.css`)
- [x] Task 2: App.tsx 리팩터링 - 화면 전환 로직 개선 (AC: #2, #3)
  - [x] 2.1 화면 상태를 `'menu' | 'game'`으로 관리하는 로직 구현
  - [x] 2.2 `showGame` useState를 `screen` 상태로 리팩터링
  - [x] 2.3 StartScreen에 onStart 콜백 연결
- [x] Task 3: 게임 종료 후 메인 메뉴 복귀 기능 (AC: #3)
  - [x] 3.1 VictoryBanner에 "메인 메뉴로" 버튼 추가
  - [x] 3.2 GameCanvas에서 메뉴 복귀 콜백 props 추가 (`onReturnToMenu`)
  - [x] 3.3 App.tsx에서 screen 상태를 'menu'로 전환하는 핸들러 연결
  - [x] 3.4 메뉴 복귀 시 Phaser 게임 인스턴스 정리 (React 언마운트 시 useGameLoader cleanup 활용)
- [x] Task 4: 단위 테스트 작성 (AC: #1~#6)
  - [x] 4.1 StartScreen 렌더링 테스트 (타이틀, 버튼 존재 확인)
  - [x] 4.2 게임 시작 버튼 클릭 콜백 테스트
  - [x] 4.3 접근성 테스트 (터치 타겟 크기)

## Dev Notes

### 핵심 아키텍처 패턴

- **UI 레이어**: React Components (`apps/web/src/components/`) - 게임 외부 UI 담당
- **게임 레이어**: Phaser (`packages/game-renderer/`) - 게임 캔버스 담당
- **분리 원칙**: UI는 React, 게임 렌더링은 Phaser, 로직은 game-core

### 현재 App.tsx 구조 (리팩터링 대상)

현재 `App.tsx`는 `useState(false)`로 `showGame` 상태를 관리하여 간단한 인라인 "게임 시작" 버튼과 `GameCanvas`를 토글합니다. 이것을 별도 StartScreen 컴포넌트로 분리해야 합니다.

```typescript
// 현재 (Before)
const [showGame, setShowGame] = useState(false);

// 변경 후 (After)
type Screen = 'menu' | 'game';
const [screen, setScreen] = useState<Screen>('menu');
```

### 게임 종료 후 복귀 경로

현재 `VictoryBanner` 컴포넌트에는 "메인 메뉴로" 버튼이 없습니다. 추가해야 합니다.

**복귀 시 주의사항:**
- Phaser 게임 인스턴스가 `useGameLoader` 훅에서 관리됨
- `screen`이 `'menu'`로 전환되면 `GameCanvas` 언마운트 → `useGameLoader`의 cleanup이 `game.destroy()` 호출
- 별도의 정리 로직은 필요 없음 (React 라이프사이클이 처리)

### Phase 1 UI 범위 (06-ui-page-flow.md 기준)

Phase 1에서는 **간소화된 플로우만 구현**합니다:
```
[시작 모달/메뉴] → [게임 화면] → [결과 화면] → [재시작/시작 메뉴]
```

Phase 2에서 추가될 항목 (이 스토리에서 제외):
- 홈 화면 (로그인/게스트 선택)
- 로비, 대기실, 채팅
- TanStack Router 라우팅

### 비주얼 디자인 참고

기존 코드에서 사용된 색상 팔레트:
- 배경: `#1a1a2e` (다크 네이비)
- 타이틀: `#ffd700` (금색)
- 부제: `#aaa` (회색)
- 주요 버튼: `#c9302c` (붉은색), border-radius 8px
- 텍스트: `white`

### 기존 컴포넌트 재사용/수정 대상

| 컴포넌트 | 액션 |
|---------|------|
| `App.tsx` | 리팩터링 (screen 상태 관리) |
| `VictoryBanner.tsx` | 수정 ("메인 메뉴로" 버튼 추가) |
| `GameCanvas.tsx` | 수정 (onReturnToMenu props 추가) |
| `StartScreen.tsx` | **새로 생성** |

### Project Structure Notes

- 새 파일: `apps/web/src/components/menu/StartScreen.tsx`, `StartScreen.css`
- 수정 파일: `apps/web/src/App.tsx`, `apps/web/src/components/game/VictoryBanner.tsx`, `apps/web/src/components/game/GameCanvas.tsx`
- 기존 `components/game/` 패턴을 따라 `components/menu/` 디렉토리 생성

### 테스트 표준

- 테스트 프레임워크: Vitest + React Testing Library
- 테스트 위치: 컴포넌트와 같은 디렉토리 또는 `__tests__/` 디렉토리
- E2E: Playwright (`npx playwright test`)

### References

- [Source: _bmad-output/epics.md - Epic 8, Story 1 (UI-001)]
- [Source: docs/project-plan/06-ui-page-flow.md - Section 7 (Phase 1 간소화 플로우)]
- [Source: _bmad-output/game-architecture.md - Project Structure, Naming Conventions]
- [Source: _bmad-output/gdd.md - Art Style, Color Palette]
- [Source: apps/web/src/App.tsx - 현재 메인 메뉴 구조]
- [Source: apps/web/src/components/game/GameCanvas.tsx - 게임 캔버스 구조]
- [Source: apps/web/src/components/game/VictoryBanner.tsx - 승리 배너 구조]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- game-core 테스트 MODULE_NOT_FOUND 이슈: pnpm install 후 해결 (기존 node_modules 문제)

### Completion Notes List
- StartScreen 컴포넌트: BEM CSS 네이밍, data-testid 속성 포함
- App.tsx: `showGame: boolean` → `screen: 'menu' | 'game'` 상태로 리팩터링
- VictoryBanner: `onReturnToMenu` 콜백 prop 추가, "메인 메뉴로" 버튼 조건부 렌더링
- GameCanvas: `GameCanvasProps` 인터페이스 추가, `onReturnToMenu` prop 전달
- 테스트 인프라: apps/web에 vitest + jsdom + @testing-library/react 셋업
- 8개 단위 테스트 작성 및 통과 (AC1, AC2, AC5 커버)
- game-core 회귀 테스트 523개 전부 통과

### File List
- `apps/web/src/components/menu/StartScreen.tsx` (신규)
- `apps/web/src/components/menu/StartScreen.css` (신규)
- `apps/web/src/App.tsx` (수정)
- `apps/web/src/components/game/GameCanvas.tsx` (수정)
- `apps/web/src/components/game/VictoryBanner.tsx` (수정)
- `apps/web/src/components/game/VictoryBanner.css` (수정)
- `apps/web/vitest.config.ts` (신규)
- `apps/web/tests/setup.ts` (신규)
- `apps/web/tests/start-screen.test.tsx` (신규)
- `apps/web/package.json` (수정 - test 스크립트 및 devDependencies 추가)
