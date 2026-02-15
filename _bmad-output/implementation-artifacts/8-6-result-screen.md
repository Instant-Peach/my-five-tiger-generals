# Story 8.6: 결과 화면 (Result Screen)

Status: ready-for-dev

## Story

As a 플레이어,
I want 게임 종료 시 승리/패배 결과와 게임 통계를 한눈에 볼 수 있는 결과 화면이 표시되기를,
so that 게임 결과를 명확히 확인하고, 재대결 또는 메인 메뉴로 이동하는 다음 행동을 선택할 수 있다.

## Acceptance Criteria

1. **AC1: 결과 화면 표시 (게임 종료 시)** - 게임이 종료되면(노크/전멸/와해/항복) 기존 VictoryBanner 대신 풀 스크린 결과 화면이 표시된다. 결과 화면은 게임 보드 위에 오버레이로 렌더링되며 전체 화면을 채운다. 페이드인 애니메이션(0.5s ease-out)으로 등장한다.
2. **AC2: 승리/패배 정보 표시** - 결과 화면 상단에 승리 플레이어와 승리 사유가 표시된다. 승리 사유별 텍스트: "노크 승리 (3회 달성)", "전멸 승리", "와해 승리", "항복 승리". 승리 플레이어 텍스트: "Player 1 (촉) 승리" 또는 "Player 2 (위) 승리". 승리 아이콘/이모지와 함께 강조 표시된다.
3. **AC3: 게임 통계 표시** - 결과 화면 중앙에 양 플레이어의 게임 통계가 테이블 형태로 표시된다. 표시 항목: 총 턴 수, 노크 횟수(각 플레이어별), 남은 장수 수(각 플레이어별). game-core의 GameState에서 통계 데이터를 추출한다. Phase 2에서 "처치한 장수", "총 데미지" 등 확장 가능한 구조로 설계한다.
4. **AC4: 다시 시작 버튼** - 결과 화면 하단에 "다시 시작" 버튼이 표시된다. 클릭 시 새 게임을 시작한다(GameScene 리셋). 터치 타겟은 최소 44x44px을 충족한다. Phase 1에서는 같은 기기에서 즉시 새 게임 시작(로컬 2인 대전).
5. **AC5: 메인 메뉴로 버튼** - 결과 화면 하단에 "메인 메뉴로" 버튼이 표시된다. 클릭 시 StartScreen으로 돌아간다(기존 onReturnToMenu 콜백 활용). 터치 타겟은 최소 44x44px을 충족한다.
6. **AC6: 반응형 레이아웃** - 모바일(320px~430px)에서 결과 화면이 화면 전체를 채우고 통계 테이블이 가로 스크롤 없이 표시된다. 데스크톱(1024px+)에서는 카드 형태(max-width: 500px)로 화면 중앙에 표시된다. 모든 텍스트가 잘리지 않고 읽을 수 있다.
7. **AC7: 접근성** - 결과 화면 컨테이너에 `role="dialog"`, `aria-label="게임 결과"`, `aria-modal="true"`가 적용된다. 다시 시작 버튼에 `aria-label="다시 시작"`이 적용된다. 메인 메뉴 버튼에 `aria-label="메인 메뉴로 돌아가기"`가 적용된다. 결과 화면 표시 시 첫 번째 버튼(다시 시작)으로 포커스가 이동한다. 통계 테이블에 적절한 테이블 마크업(`table`, `th`, `td`)이 사용된다.
8. **AC8: VictoryBanner 교체** - 기존 VictoryBanner 컴포넌트를 ResultScreen으로 완전히 교체한다. GameCanvas에서 VictoryBanner 참조를 제거하고 ResultScreen으로 대체한다. game:end 이벤트 핸들러에서 ResultScreen에 필요한 데이터(winner, reason, gameState)를 전달한다.

## Tasks / Subtasks

- [ ] Task 1: game-core 결과 화면 관련 타입 및 상수 정의 (AC: #3)
  - [ ] 1.1 `packages/game-core/src/constants/result.ts` 파일 생성 - RESULT_STATS_LABELS (총 턴 수, 노크 횟수, 남은 장수) 상수 정의
  - [ ] 1.2 `packages/game-core/src/state/types.ts`에 GameStats 인터페이스 추가 (totalTurns, player1KnockCount, player2KnockCount, player1RemainingGenerals, player2RemainingGenerals)
  - [ ] 1.3 `packages/game-core/src/state/stats.ts` 파일 생성 - extractGameStats(state: GameState): GameStats 순수 함수 구현
  - [ ] 1.4 `packages/game-core/src/constants/index.ts` 수정 - result 모듈 re-export 추가
  - [ ] 1.5 `packages/game-core/src/state/index.ts` 수정 - stats 모듈 re-export 추가
  - [ ] 1.6 `packages/game-core/src/index.ts` 수정 - GameStats 타입과 extractGameStats 함수 export 추가

- [ ] Task 2: ResultScreen 컴포넌트 생성 (AC: #1, #2, #3, #6, #7)
  - [ ] 2.1 `apps/web/src/components/result/ResultScreen.tsx` 파일 생성
  - [ ] 2.2 `apps/web/src/components/result/ResultScreen.css` 파일 생성 (BEM 네이밍)
  - [ ] 2.3 Props 정의: isVisible, winner (string), reason (string), gameState (GameState), onRestart (() => void), onReturnToMenu (() => void)
  - [ ] 2.4 승리 정보 섹션: 승리 사유 텍스트(getReasonText 함수 이전) + 승리 플레이어 텍스트(getWinnerText 함수 이전)
  - [ ] 2.5 게임 통계 섹션: extractGameStats(gameState)로 통계 추출 → HTML table 마크업으로 렌더링
  - [ ] 2.6 버튼 영역: "다시 시작" 버튼 + "메인 메뉴로" 버튼 (44x44px 이상)
  - [ ] 2.7 `role="dialog"`, `aria-label="게임 결과"`, `aria-modal="true"` 접근성 속성 적용
  - [ ] 2.8 결과 화면 표시 시 "다시 시작" 버튼에 autoFocus 또는 useEffect로 포커스 이동
  - [ ] 2.9 페이드인 애니메이션 (CSS animation: 0.5s ease-out)
  - [ ] 2.10 `createPortal`로 `document.body`에 렌더링 (z-index: 1000, 기존 VictoryBanner와 동일)
  - [ ] 2.11 반응형: 모바일 전체 화면 / 데스크톱 max-width: 500px 카드형

- [ ] Task 3: GameCanvas 연동 - VictoryBanner → ResultScreen 교체 (AC: #4, #5, #8)
  - [ ] 3.1 GameCanvas.tsx에서 VictoryBanner import 제거, ResultScreen import 추가
  - [ ] 3.2 게임 종료 시 gameState 스냅샷 저장을 위한 endGameState (useState) 추가
  - [ ] 3.3 handleGameEnd 이벤트 핸들러에서 endGameState에 현재 게임 상태 저장
  - [ ] 3.4 handleRestart 콜백 생성: gameSceneRef.current를 통한 게임 리셋 호출 (scene.restartGame() 또는 scene.scene.restart()), victoryState/endGameState 초기화
  - [ ] 3.5 VictoryBanner JSX를 ResultScreen으로 교체 - isVisible, winner, reason, gameState(endGameState), onRestart, onReturnToMenu props 전달
  - [ ] 3.6 VictoryBanner.tsx, VictoryBanner.css 파일 삭제 (완전 교체)

- [ ] Task 4: 다시 시작 기능 구현 (AC: #4)
  - [ ] 4.1 GameScene에 restartGame() 메서드 존재 여부 확인 (없으면 추가 필요)
  - [ ] 4.2 restartGame() 구현: game-core의 createInitialGameState() 호출 → 새 GameState로 교체 → 보드/장수 리렌더링 → 타이머 리셋
  - [ ] 4.3 GameCanvas의 handleRestart에서 scene.restartGame() 호출 후 로컬 상태(turnState, knockState, actionsRemaining 등) 초기화
  - [ ] 4.4 다시 시작 후 게임이 정상적으로 처음 상태로 돌아가는지 검증

- [ ] Task 5: 단위 테스트 작성 (AC: #1~#8)
  - [ ] 5.1 game-core extractGameStats 테스트: 정상 게임 상태에서 통계 추출 확인
  - [ ] 5.2 game-core extractGameStats 테스트: 게임 종료 상태(노크/전멸/와해/항복)에서 통계 정확성 확인
  - [ ] 5.3 game-core result 상수 테스트: RESULT_STATS_LABELS 존재 확인
  - [ ] 5.4 ResultScreen 기본 렌더링 테스트: isVisible=true 시 승리 정보, 통계, 버튼 표시 확인
  - [ ] 5.5 ResultScreen isVisible=false 시 미렌더링 테스트
  - [ ] 5.6 ResultScreen 승리 사유별 텍스트 테스트 (knock, annihilation, collapse, surrender)
  - [ ] 5.7 ResultScreen 통계 테이블 렌더링 테스트 (총 턴 수, 노크 횟수, 남은 장수)
  - [ ] 5.8 ResultScreen "다시 시작" 버튼 클릭 테스트 (onRestart 콜백 호출 확인)
  - [ ] 5.9 ResultScreen "메인 메뉴로" 버튼 클릭 테스트 (onReturnToMenu 콜백 호출 확인)
  - [ ] 5.10 ResultScreen 접근성 테스트 (role="dialog", aria-label, aria-modal, table 마크업)
  - [ ] 5.11 ResultScreen 터치 타겟 크기 테스트 (44x44px 이상)
  - [ ] 5.12 ResultScreen 포커스 이동 테스트 (표시 시 "다시 시작" 버튼으로 포커스)

## Dev Notes

### 핵심 아키텍처 패턴

- **UI 레이어**: React Components (`apps/web/src/components/result/`) - 결과 화면 UI 담당
- **데이터 레이어**: game-core (`packages/game-core/src/state/stats.ts`) - 게임 통계 추출 순수 함수
- **상수 레이어**: game-core (`packages/game-core/src/constants/result.ts`) - 통계 라벨 상수
- **분리 원칙**: game-core에 Phaser 의존성 절대 금지. 통계 추출은 순수 함수, UI는 React.

### 기존 VictoryBanner 교체 주의사항

현재 VictoryBanner는 Story 6-2에서 생성된 간단한 MVP 컴포넌트입니다. 코드 주석에 "Phase 1 MVP: 간단한 디자인, Story 8-6에서 풀 디자인 적용 예정"이라고 명시되어 있습니다.

**교체 전략:**
- VictoryBanner의 `getReasonText()`, `getWinnerText()` 유틸 함수를 ResultScreen으로 이전 (코드 재사용)
- VictoryBanner.tsx, VictoryBanner.css 파일을 완전 삭제
- GameCanvas.tsx에서 VictoryBanner 관련 import/JSX를 ResultScreen으로 교체
- VictoryBanner를 참조하는 테스트 파일이 있다면 ResultScreen으로 마이그레이션

### 기존 VictoryBanner 코드 참조

```typescript
// apps/web/src/components/game/VictoryBanner.tsx (삭제 예정)
// - getReasonText(reason): knock→'노크 승리!', annihilation→'전멸 승리!', collapse→'와해 승리!', surrender→'항복 승리!'
// - getWinnerText(winner): player1→'Player 1 (촉)', player2→'Player 2 (위)'
// - Props: isVisible, winner, reason, onReturnToMenu
// - z-index: 1000
```

### GameCanvas 현재 game:end 이벤트 핸들러 참조

```typescript
// apps/web/src/components/game/GameCanvas.tsx 내 handleGameEnd
const handleGameEnd = (data: { winner: string; reason?: string }) => {
  setTurnState((prev) => ({ ...prev, isGameEnded: true }));
  setVictoryState({
    isVisible: true,
    winner: data.winner,
    reason: data.reason ?? 'knock',
  });
  const currentState = scene.getGameState();
  if (currentState) {
    setGameState({ ...currentState });
    syncHudState(currentState);
  }
};
```

**수정 필요:** handleGameEnd에서 endGameState도 함께 저장해야 함 (통계용 스냅샷).

### 게임 상태에서 통계 추출 로직

game-core의 GameState 구조에서 추출 가능한 통계:

| 통계 항목 | GameState 필드 | 계산 방법 |
|----------|---------------|----------|
| 총 턴 수 | `state.turn` | 직접 참조 |
| P1 노크 횟수 | `state.player1KnockCount` | 직접 참조 |
| P2 노크 횟수 | `state.player2KnockCount` | 직접 참조 |
| P1 남은 장수 | `state.generals` | filter(g => g.owner === 'player1' && g.status === 'active').length |
| P2 남은 장수 | `state.generals` | filter(g => g.owner === 'player2' && g.status === 'active').length |

### 비주얼 디자인

기존 색상 팔레트 유지 (SurrenderConfirmModal, SettingsModal 패턴 참조):
- 오버레이 배경: `rgba(0, 0, 0, 0.85)` (기존보다 약간 어둡게 - 결과 화면 강조)
- 카드 배경: `#2d2d3d` (기존 모달 패턴)
- 카드 테두리: `#ffd700` (금색 - 승리 강조)
- 승리 텍스트: `#ffd700` (금색)
- 일반 텍스트: `#ffffff`
- 통계 테이블 헤더: `rgba(255, 255, 255, 0.6)`
- 통계 테이블 구분선: `rgba(255, 255, 255, 0.1)`
- 다시 시작 버튼: `#ffd700` 배경, `#1a1a2e` 텍스트 (주요 CTA)
- 메인 메뉴 버튼: 투명 배경, `#ffd700` 테두리/텍스트 (보조 CTA)

### 결과 화면 레이아웃

```
┌─────────────────────────────────────────────┐
│                                              │
│               ⚔️ 게임 종료 ⚔️                │
│                                              │
│            🏆 Player 1 (촉) 승리 🏆          │
│                                              │
│              노크 승리 (3회 달성)             │
│                                              │
│   ─────────────────────────────────────     │
│                                              │
│   📊 게임 통계                               │
│   ┌────────────────────────────────────┐    │
│   │             Player 1    Player 2    │    │
│   │  총 턴 수       12         11       │    │
│   │  노크 횟수      3          1        │    │
│   │  남은 장수      3          2        │    │
│   └────────────────────────────────────┘    │
│                                              │
│   ┌────────────────────────────────────┐    │
│   │          🔄 다시 시작               │    │
│   └────────────────────────────────────┘    │
│   ┌────────────────────────────────────┐    │
│   │          🏠 메인 메뉴로             │    │
│   └────────────────────────────────────┘    │
│                                              │
└─────────────────────────────────────────────┘
```

### 컴포넌트 의존성

```
App
  ├── StartScreen (기존)
  └── GameCanvas
       ├── GameHUD (기존)
       ├── SurrenderConfirmModal (기존)
       ├── TacticPanel (기존)
       ├── SettingsModal (기존)
       ├── GeneralStatsPanel (기존)
       └── ResultScreen (새로 생성 - VictoryBanner 대체)
            ├── 승리 정보 섹션
            ├── 통계 테이블 섹션
            └── 버튼 영역 (다시 시작, 메인 메뉴)
```

### z-index 정리

| 레이어 | z-index | 컴포넌트 |
|--------|---------|----------|
| 게임 캔버스 | 1 | Phaser canvas |
| 게임 HUD | 100 | GameHUD |
| 항복 확인 모달 | 150 | SurrenderConfirmModal |
| **결과 화면** | **1000** | **ResultScreen (VictoryBanner 대체)** |
| 설정 모달 | 9997 | SettingsModal |
| 책략 패널 | 9998 | TacticPanel |
| 장수 정보 패널 | 9999 | GeneralStatsPanel |

ResultScreen은 기존 VictoryBanner의 z-index(1000)를 그대로 사용합니다.

### 기존 컴포넌트 재사용/수정/삭제 대상

| 컴포넌트 | 액션 |
|---------|------|
| `ResultScreen.tsx` | **새로 생성** (`apps/web/src/components/result/`) |
| `ResultScreen.css` | **새로 생성** |
| `GameCanvas.tsx` | 수정 (VictoryBanner → ResultScreen 교체, endGameState 추가, handleRestart 추가) |
| `VictoryBanner.tsx` | **삭제** (ResultScreen으로 완전 대체) |
| `VictoryBanner.css` | **삭제** |

### game-core 파일 변경

| 파일 | 액션 |
|------|------|
| `packages/game-core/src/constants/result.ts` | **새로 생성** (RESULT_STATS_LABELS) |
| `packages/game-core/src/state/stats.ts` | **새로 생성** (extractGameStats 함수) |
| `packages/game-core/src/state/types.ts` | 수정 (GameStats 인터페이스 추가) |
| `packages/game-core/src/constants/index.ts` | 수정 (result export 추가) |
| `packages/game-core/src/state/index.ts` | 수정 (stats export 추가) |
| `packages/game-core/src/index.ts` | 수정 (GameStats, extractGameStats export 추가) |

### GameScene restartGame() 메서드 확인

GameScene에 restartGame() 메서드가 있는지 확인 필요. 없으면 다음 방식으로 구현:

```typescript
// packages/game-renderer/src/scenes/GameScene.ts
public restartGame(): void {
  // 1. 새 초기 상태 생성
  this.gameState = createInitialGameState();
  // 2. 보드/장수 리렌더링
  this.renderBoard();
  this.renderGenerals();
  // 3. 타이머 리셋
  this.resetTimer();
  // 4. 턴 시작 이벤트 발행
  this.events.emit('turn:start', { turn: 1, playerId: 'player1' });
}
```

만약 `this.scene.restart()` (Phaser 내장)를 사용해도 됩니다. 다만 기존 이벤트 리스너가 재등록되도록 GameCanvas 쪽에서도 리셋 로직이 필요합니다.

### Project Structure Notes

- 신규 파일 (game-core): `packages/game-core/src/constants/result.ts`, `packages/game-core/src/state/stats.ts`
- 신규 파일 (web): `apps/web/src/components/result/ResultScreen.tsx`, `ResultScreen.css`
- 수정 파일: `apps/web/src/components/game/GameCanvas.tsx` (VictoryBanner → ResultScreen 교체)
- 수정 파일: `packages/game-core/src/state/types.ts` (GameStats 추가)
- 수정 파일: `packages/game-core/src/constants/index.ts`, `packages/game-core/src/state/index.ts`, `packages/game-core/src/index.ts` (export 추가)
- 삭제 파일: `apps/web/src/components/game/VictoryBanner.tsx`, `VictoryBanner.css`

### 테스트 표준

- 테스트 프레임워크: Vitest + React Testing Library
- 테스트 위치: `apps/web/tests/` 디렉토리 (8-1~8-5 패턴 따름)
- 파일명: `result-screen.test.tsx`
- game-core 테스트: `packages/game-core/tests/state/stats.test.ts`, `packages/game-core/tests/constants/result.test.ts`
- E2E: Playwright (`npx playwright test`)

### Phase 2 확장 시 변경 예상 지점

- GameStats에 totalDamageDealt, generalKills 등 추가 필드
- ResultScreen에 "재대결" 버튼 추가 (상대 동의 필요 - Colyseus 연동)
- 리플레이 버튼 추가 (Phase 3)
- 결과 화면에서 매치 히스토리 저장 (Supabase 연동)
- 온라인 매치 시 "로비로" 버튼이 "메인 메뉴로" 대신 표시

### 팀 합의 사항 준수 체크리스트

- [ ] game-core에 Phaser 의존성 절대 금지 (stats, result 상수는 순수 TypeScript)
- [ ] 새 상수/타입은 game-core에 먼저 정의 (RESULT_STATS_LABELS, GameStats)
- [ ] ARIA 속성 모든 UI 컴포넌트에 적용 (ResultScreen: role="dialog", aria-label, 테이블 마크업)
- [ ] 터치 타겟 44x44px 이상 (다시 시작 버튼, 메인 메뉴 버튼)
- [ ] 단일 파일 1,000줄 초과 시 분리 검토 필수
- [ ] 스토리 완료 시 Dev Notes에 학습 내용 기록
- [ ] 스토리 완료 커밋 시 sprint-status.yaml 동시 업데이트 필수

### References

- [Source: _bmad-output/epics.md - Epic 8, Story 6 (UI-006)]
- [Source: docs/project-plan/06-ui-page-flow.md - Section 2.6 (결과 화면)]
- [Source: docs/project-plan/06-ui-page-flow.md - Section 7.2 (Phase 1 결과 모달)]
- [Source: _bmad-output/game-architecture.md - Project Structure, Cross-cutting Concerns]
- [Source: _bmad-output/gdd.md - Win/Loss Conditions, Failure Recovery (즉시 재대결)]
- [Source: apps/web/src/components/game/VictoryBanner.tsx - 기존 승리 배너 (교체 대상)]
- [Source: apps/web/src/components/game/VictoryBanner.css - 기존 승리 배너 CSS (삭제 대상)]
- [Source: apps/web/src/components/game/GameCanvas.tsx - 게임 캔버스 구조, game:end 이벤트 핸들러]
- [Source: packages/game-core/src/state/types.ts - GameState, VictoryResult, VictoryReason 타입]
- [Source: apps/web/src/components/game/SurrenderConfirmModal.tsx - 모달 접근성 패턴 참고]
- [Source: apps/web/src/components/settings/SettingsModal.tsx - createPortal 패턴 참고]
- [Source: _bmad-output/implementation-artifacts/8-5-settings-menu.md - 이전 스토리 패턴 참고]
- [Source: _bmad-output/implementation-artifacts/epic-6-retro-2026-02-12.md - 팀 합의 사항]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
