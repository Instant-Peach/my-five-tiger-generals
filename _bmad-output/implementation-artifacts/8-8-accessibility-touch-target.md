# Story 8.8: 접근성 및 터치 타겟 (Accessibility & Touch Target)

Status: ready-for-dev

## Story

As a 플레이어,
I want 모든 인터랙티브 UI 요소가 최소 44x44px 터치 타겟을 보장하고, 키보드 탐색·포커스 표시·색맹 지원·스크린 리더 호환 등 접근성 표준을 충족하여,
so that 어떤 디바이스·입력 방식·시각적 능력을 가진 사용자든 게임을 불편 없이 플레이할 수 있다.

## Acceptance Criteria

1. **AC1: 터치 타겟 44x44px 보장** - 모든 인터랙티브 UI 요소(버튼, 토글, 닫기 버튼, 슬롯)가 최소 44x44px 터치 타겟을 보장한다. game-core에 ACCESSIBILITY 상수를 정의한다 (MIN_TOUCH_TARGET: 44). 현재 min-width/min-height: 44px가 적용된 버튼(KnockButton, TacticButton, TurnEndButton, SettingsButton, SurrenderButton)의 적용 상태를 검증하고, 누락된 요소(StartScreen 게임 시작 버튼, ResultScreen 버튼, SurrenderConfirmModal 버튼, TacticPanel 슬롯)에 보장한다.
2. **AC2: 키보드 포커스 표시 (focus-visible)** - 모든 인터랙티브 요소에 focus-visible 스타일이 적용된다. 포커스 시 2px 이상의 outline(#ffd700, 금색)이 표시되어 현재 포커스 위치를 명확히 식별할 수 있다. 기존에 focus-visible이 적용된 컴포넌트(GeneralStatsPanel, TacticPanel, LandscapeOverlay, ResultScreen)와 일관된 스타일을 사용한다. 누락된 컴포넌트(KnockButton, TacticButton, TurnEndButton, SettingsButton, SurrenderButton, StartScreen, SurrenderConfirmModal)에 추가한다.
3. **AC3: 색맹 지원 (색상 외 구분 수단)** - 플레이어 구분이 색상만으로 이루어지지 않고, 추가적인 시각적 단서(패턴, 아이콘, 텍스트 레이블)로도 구분 가능하다. PlayerInfoBar의 플레이어 1/2 영역에 "P1"/"P2" 레이블이 이미 존재하는지 검증하고, 부족하면 보강한다. 버튼 비활성화 상태가 색상 변경과 함께 opacity 변화 또는 시각적 패턴(빗금 등)으로 구분 가능한지 검증한다. game-core에 ACCESSIBILITY.COLOR_BLIND_PATTERNS 상수를 정의하여 향후 색맹 모드 확장의 기반을 마련한다.
4. **AC4: ARIA 속성 일괄 감사 및 보완** - 모든 UI 컴포넌트에 적절한 ARIA 속성이 적용된다. 누락된 aria-label 추가: StartScreen 게임 시작 버튼(aria-label="게임 시작"), StartScreen 모드 라벨(aria-live="polite"). 모든 모달(SettingsModal, TacticPanel, GeneralStatsPanel, SurrenderConfirmModal, ResultScreen)에 role="dialog", aria-modal="true" 확인. 모든 상태 표시 요소(TurnIndicator, TurnTimer, ActionCounter)에 role="status" 또는 aria-live 확인. GameHUD 컨테이너에 role="region", aria-label="게임 HUD" 추가.
5. **AC5: prefers-reduced-motion 전역 확산** - 모든 애니메이션 포함 컴포넌트에 prefers-reduced-motion 미디어 쿼리가 적용된다. 기존 적용 완료: LandscapeOverlay, TacticPanel, ResultScreen, SettingsModal. 누락 컴포넌트에 추가: KnockButton.css(knock-dot-pulse, knock-glow 애니메이션), TurnTimer.css(타이머 관련 애니메이션), AutoEndToast.css(토스트 등장/퇴장 애니메이션), SurrenderConfirmModal.css(모달 등장 애니메이션). 전역 CSS에 * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } 옵션을 prefers-reduced-motion: reduce 내에 배치하는 것은 개별 컴포넌트 적용 후 검토한다.
6. **AC6: 접근성 상수 및 유틸리티** - game-core에 ACCESSIBILITY 상수를 정의한다. MIN_TOUCH_TARGET: 44 (px), FOCUS_OUTLINE_WIDTH: 2 (px), FOCUS_OUTLINE_COLOR: '#ffd700' (금색), COLOR_BLIND_PATTERNS: { player1: 'diagonal', player2: 'dots' } (향후 확장용). constants/index.ts에 ACCESSIBILITY export를 추가한다. game-core/src/index.ts에 ACCESSIBILITY export를 추가한다.
7. **AC7: 접근성 테스트** - 모든 인터랙티브 요소의 터치 타겟 크기를 검증하는 단위 테스트를 작성한다. ARIA 속성 존재를 검증하는 단위 테스트를 작성한다. focus-visible 스타일 적용을 검증하는 단위 테스트를 작성한다. game-core ACCESSIBILITY 상수 존재를 검증하는 단위 테스트를 작성한다.

## Tasks / Subtasks

- [ ] Task 1: game-core 접근성 상수 정의 (AC: #1, #3, #6)
  - [ ] 1.1 `packages/game-core/src/constants/accessibility.ts` 파일 생성 - ACCESSIBILITY 상수 정의
  - [ ] 1.2 ACCESSIBILITY 상수 내용: MIN_TOUCH_TARGET: 44, FOCUS_OUTLINE_WIDTH: 2, FOCUS_OUTLINE_COLOR: '#ffd700', COLOR_BLIND_PATTERNS: { player1: 'diagonal', player2: 'dots' }
  - [ ] 1.3 `packages/game-core/src/constants/index.ts` 수정 - ACCESSIBILITY export 추가
  - [ ] 1.4 `packages/game-core/src/index.ts` 수정 - ACCESSIBILITY export 추가

- [ ] Task 2: 전역 접근성 CSS 변수 및 focus-visible 기반 스타일 (AC: #2, #5)
  - [ ] 2.1 `apps/web/src/styles/accessibility.css` 파일 생성 - 접근성 관련 전역 CSS 변수 정의
  - [ ] 2.2 CSS 변수: --a11y-focus-outline-width: 2px, --a11y-focus-outline-color: #ffd700, --a11y-focus-outline-offset: 2px, --a11y-min-touch-target: 44px
  - [ ] 2.3 전역 focus-visible 기본 스타일: `*:focus-visible { outline: var(--a11y-focus-outline-width) solid var(--a11y-focus-outline-color); outline-offset: var(--a11y-focus-outline-offset); }`
  - [ ] 2.4 `apps/web/src/main.tsx` 또는 `apps/web/src/index.css`에 accessibility.css import 추가
  - [ ] 2.5 기존 컴포넌트별 focus-visible 스타일과 충돌 방지 확인 (GeneralStatsPanel, TacticPanel, LandscapeOverlay, ResultScreen)

- [ ] Task 3: 버튼 컴포넌트 focus-visible 추가 (AC: #2)
  - [ ] 3.1 KnockButton.css에 .knock-button:focus-visible 스타일 추가
  - [ ] 3.2 TacticButton.css에 .tactic-button:focus-visible 스타일 추가
  - [ ] 3.3 TurnEndButton.css에 .turn-end-button:focus-visible 스타일 추가
  - [ ] 3.4 SettingsButton.css에 .settings-button:focus-visible 스타일 추가
  - [ ] 3.5 SurrenderButton.css에 .surrender-button:focus-visible 스타일 추가
  - [ ] 3.6 SurrenderConfirmModal.css 내 버튼들에 focus-visible 스타일 추가
  - [ ] 3.7 StartScreen.css 내 .start-screen__button에 focus-visible 스타일 추가

- [ ] Task 4: 터치 타겟 검증 및 보완 (AC: #1)
  - [ ] 4.1 StartScreen.css: .start-screen__button에 min-width: 44px, min-height: 44px 보장 확인 (이미 큰 버튼일 가능성 높음 → 검증)
  - [ ] 4.2 SurrenderConfirmModal: 확인/취소 버튼에 min-width: 44px, min-height: 44px 보장 확인
  - [ ] 4.3 ResultScreen: 다시 시작/메인 메뉴 버튼에 min-width: 44px, min-height: 44px 보장 확인
  - [ ] 4.4 TacticPanel: 각 책략 슬롯의 터치 영역 44x44px 이상 보장 확인
  - [ ] 4.5 GeneralStatsPanel: 닫기 버튼 44x44px 보장 확인
  - [ ] 4.6 SettingsModal: 닫기 버튼 및 토글 44x44px 보장 확인
  - [ ] 4.7 발견된 미달 요소에 min-width/min-height 추가

- [ ] Task 5: ARIA 속성 감사 및 보완 (AC: #4)
  - [ ] 5.1 StartScreen: 게임 시작 버튼에 aria-label="게임 시작" 추가
  - [ ] 5.2 GameHUD.tsx: 루트 div에 role="region", aria-label="게임 HUD" 추가
  - [ ] 5.3 TurnIndicator: role="status" 존재 확인 (이미 적용 시 스킵)
  - [ ] 5.4 TurnTimer: role="timer" 또는 aria-live="polite" 존재 확인
  - [ ] 5.5 ActionCounter: role="status" 존재 확인
  - [ ] 5.6 SurrenderConfirmModal: role="alertdialog", aria-modal="true", aria-label 확인/추가
  - [ ] 5.7 모든 아이콘 전용 요소에 aria-hidden="true" 확인 (이모지/아이콘)

- [ ] Task 6: prefers-reduced-motion 전역 확산 (AC: #5)
  - [ ] 6.1 KnockButton.css에 @media (prefers-reduced-motion: reduce) 추가 - knock-dot-pulse, knock-glow 애니메이션 비활성화
  - [ ] 6.2 TurnTimer.css에 @media (prefers-reduced-motion: reduce) 추가 - 타이머 관련 애니메이션 확인 및 비활성화
  - [ ] 6.3 AutoEndToast.css에 @media (prefers-reduced-motion: reduce) 추가 - 토스트 등장/퇴장 애니메이션 비활성화
  - [ ] 6.4 SurrenderConfirmModal.css에 @media (prefers-reduced-motion: reduce) 추가 - 모달 등장 애니메이션 비활성화
  - [ ] 6.5 SurrenderButton.css, TurnEndButton.css, TacticButton.css에 transition 관련 reduced-motion 적용 검토

- [ ] Task 7: 색맹 지원 기반 마련 (AC: #3)
  - [ ] 7.1 PlayerInfoBar 컴포넌트/CSS 검토: 플레이어 구분이 색상 외 텍스트("P1"/"P2" 또는 플레이어 이름)로도 가능한지 확인
  - [ ] 7.2 부족 시 PlayerInfoBar에 플레이어 식별 텍스트 보강
  - [ ] 7.3 비활성화 버튼 상태가 opacity + 색상 변경으로 충분히 구분 가능한지 검증 (이미 opacity: 0.5 + 회색 배경 적용됨)
  - [ ] 7.4 ACCESSIBILITY.COLOR_BLIND_PATTERNS 상수가 향후 색맹 모드 토글 구현 시 사용될 기반으로 정의됨을 Dev Notes에 기록

- [ ] Task 8: 단위 테스트 작성 (AC: #7)
  - [ ] 8.1 game-core ACCESSIBILITY 상수 존재 확인 테스트 (`packages/game-core/tests/constants/accessibility.test.ts`)
  - [ ] 8.2 ACCESSIBILITY.MIN_TOUCH_TARGET === 44 검증
  - [ ] 8.3 ACCESSIBILITY.FOCUS_OUTLINE_COLOR === '#ffd700' 검증
  - [ ] 8.4 GameHUD 접근성 테스트: role="region", aria-label="게임 HUD" 확인 (`apps/web/tests/game-hud-accessibility.test.tsx`)
  - [ ] 8.5 StartScreen 접근성 테스트: 게임 시작 버튼 aria-label="게임 시작" 확인
  - [ ] 8.6 KnockButton ARIA 속성 테스트: aria-label 존재 확인 (기존 테스트 확장)
  - [ ] 8.7 TurnEndButton ARIA 속성 테스트: aria-label="턴 종료" 확인
  - [ ] 8.8 SurrenderButton ARIA 속성 테스트: aria-label="항복" 확인
  - [ ] 8.9 SurrenderConfirmModal ARIA 속성 테스트: role="alertdialog", aria-modal, aria-label 확인
  - [ ] 8.10 focus-visible CSS 존재 검증 (CSS 파일 내 :focus-visible 룰 존재 확인)
  - [ ] 8.11 prefers-reduced-motion CSS 존재 검증 (CSS 파일 내 @media (prefers-reduced-motion) 룰 존재 확인)

## Dev Notes

### 핵심 아키텍처 패턴

- **상수 레이어**: game-core (`packages/game-core/src/constants/accessibility.ts`) - 접근성 관련 상수
- **CSS 레이어**: 전역 접근성 CSS (`apps/web/src/styles/accessibility.css`) + 개별 컴포넌트 CSS 보완
- **컴포넌트 레이어**: React 컴포넌트의 ARIA 속성 보강
- **분리 원칙**: game-core에 Phaser 의존성 절대 금지. 접근성 상수는 순수 TypeScript.

### 현재 접근성 상태 (8-1 ~ 8-7에서 부분 구현됨)

| 컴포넌트 | min 44x44 | aria-label | focus-visible | reduced-motion |
|---------|-----------|------------|---------------|----------------|
| KnockButton | O | O | **X** | **X** |
| TacticButton | O | O | **X** | - (transition만) |
| TurnEndButton | O | O | **X** | - (transition만) |
| SettingsButton | O | O | **X** | - |
| SurrenderButton | O | O | **X** | - (transition만) |
| StartScreen 버튼 | 검증 필요 | **X** | **X** | - |
| SurrenderConfirmModal 버튼 | 검증 필요 | 검증 필요 | **X** | **X** |
| ResultScreen 버튼 | 검증 필요 | O | O | O |
| GeneralStatsPanel 닫기 | 검증 필요 | O | O | - |
| TacticPanel 닫기 | 검증 필요 | O | O | O |
| TacticPanel 슬롯 | 검증 필요 | O | **X** | O |
| LandscapeOverlay 닫기 | O | O | O | O |
| SettingsModal 닫기/토글 | 검증 필요 | O | **X** | O |
| GameHUD | - | **X** | - | - |

### 접근성 CSS 변수 전략

전역 CSS 변수를 정의하여 모든 컴포넌트에서 일관된 접근성 스타일을 적용:

```css
/* apps/web/src/styles/accessibility.css */
:root {
  --a11y-focus-outline-width: 2px;
  --a11y-focus-outline-color: #ffd700;
  --a11y-focus-outline-offset: 2px;
  --a11y-min-touch-target: 44px;
}

/* 전역 focus-visible 기본 스타일 */
*:focus-visible {
  outline: var(--a11y-focus-outline-width) solid var(--a11y-focus-outline-color);
  outline-offset: var(--a11y-focus-outline-offset);
}

/* 기본 포커스 링 제거 (focus-visible로 대체) */
*:focus:not(:focus-visible) {
  outline: none;
}
```

**주의**: 기존 컴포넌트별 focus-visible 스타일(GeneralStatsPanel, TacticPanel 등)이 전역 스타일보다 우선 적용됨 (CSS specificity). 충돌 가능성 낮음.

### prefers-reduced-motion 적용 패턴

기존 패턴 (TacticPanel.css 참고):
```css
@media (prefers-reduced-motion: reduce) {
  .component {
    animation: none !important;
    transition: none !important;
  }
}
```

이 패턴을 KnockButton, TurnTimer, AutoEndToast, SurrenderConfirmModal에 확산.

### ARIA 속성 보강 요약

| 컴포넌트 | 추가할 ARIA | 이유 |
|---------|------------|------|
| GameHUD div | role="region", aria-label="게임 HUD" | 랜드마크 역할 부여 |
| StartScreen 게임 시작 버튼 | aria-label="게임 시작" | 명확한 동작 설명 |
| SurrenderConfirmModal | role="alertdialog" (role="dialog" → alertdialog 변경 검토) | 되돌릴 수 없는 행동 경고 |

### 컴포넌트 의존성

```
game-core/constants/accessibility.ts (NEW)
  ↓ export
game-core/constants/index.ts (MODIFY)
  ↓ export
game-core/index.ts (MODIFY)

apps/web/src/styles/accessibility.css (NEW)
  ↓ import
apps/web/src/main.tsx 또는 index.css (MODIFY)

개별 컴포넌트 CSS 수정:
  - KnockButton.css (focus-visible + reduced-motion)
  - TacticButton.css (focus-visible)
  - TurnEndButton.css (focus-visible)
  - SettingsButton.css (focus-visible)
  - SurrenderButton.css (focus-visible)
  - SurrenderConfirmModal.css (focus-visible + reduced-motion)
  - StartScreen.css (focus-visible + touch-target 확인)
  - TurnTimer.css (reduced-motion)
  - AutoEndToast.css (reduced-motion)

개별 컴포넌트 TSX 수정:
  - GameHUD.tsx (role, aria-label)
  - StartScreen.tsx (aria-label)
```

### 기존 컴포넌트 재사용/수정/삭제 대상

| 컴포넌트 | 액션 |
|---------|------|
| `accessibility.ts` | **새로 생성** (`packages/game-core/src/constants/`) |
| `accessibility.css` | **새로 생성** (`apps/web/src/styles/`) |
| `GameHUD.tsx` | 수정 (role, aria-label 추가) |
| `StartScreen.tsx` | 수정 (aria-label 추가) |
| `KnockButton.css` | 수정 (focus-visible, reduced-motion 추가) |
| `TacticButton.css` | 수정 (focus-visible 추가) |
| `TurnEndButton.css` | 수정 (focus-visible 추가) |
| `SettingsButton.css` | 수정 (focus-visible 추가) |
| `SurrenderButton.css` | 수정 (focus-visible 추가) |
| `SurrenderConfirmModal.css` | 수정 (focus-visible, reduced-motion 추가) |
| `StartScreen.css` | 수정 (focus-visible 추가) |
| `TurnTimer.css` | 수정 (reduced-motion 추가) |
| `AutoEndToast.css` | 수정 (reduced-motion 추가) |

### game-core 파일 변경

| 파일 | 액션 |
|------|------|
| `packages/game-core/src/constants/accessibility.ts` | **새로 생성** (ACCESSIBILITY 상수) |
| `packages/game-core/src/constants/index.ts` | 수정 (ACCESSIBILITY export 추가) |
| `packages/game-core/src/index.ts` | 수정 (ACCESSIBILITY export 추가) |

### 비주얼 확인 필요 항목

이 스토리는 주로 기존 UI의 접근성 속성 보강이므로 **시각적 변경은 focus-visible 스타일 추가에 한정**됩니다:
- [ ] Tab 키로 모든 버튼 탐색 시 금색 포커스 링 표시 확인
- [ ] prefers-reduced-motion 적용 시 KnockButton 글로우 애니메이션 비활성화 확인
- [ ] 비활성화 버튼이 시각적으로 명확히 구분되는지 확인

### 테스트 표준

- 테스트 프레임워크: Vitest + React Testing Library
- 테스트 위치: `apps/web/tests/` 디렉토리 (8-1~8-7 패턴 따름)
- 파일명: `accessibility-touch-target.test.tsx`, `game-hud-accessibility.test.tsx`
- game-core 테스트: `packages/game-core/tests/constants/accessibility.test.ts`
- E2E: Playwright (`npx playwright test`) - Tab 키 탐색, 포커스 표시 테스트

### Phase 2 확장 시 변경 예상 지점

- 색맹 모드 토글 (설정 메뉴에 추가, ACCESSIBILITY.COLOR_BLIND_PATTERNS 활용)
- 고대비 모드 (High Contrast Mode) 토글
- 스크린 리더 전용 가이드 텍스트 추가
- 키보드 단축키 (Space: 턴 종료, Esc: 모달 닫기 등) - 현재 일부 구현됨

### 팀 합의 사항 준수 체크리스트

- [ ] game-core에 Phaser 의존성 절대 금지 (accessibility.ts는 순수 TypeScript)
- [ ] 새 상수/타입은 game-core에 먼저 정의 (ACCESSIBILITY)
- [ ] ARIA 속성 모든 UI 컴포넌트에 적용 (이번 스토리의 핵심 목표)
- [ ] 터치 타겟 44x44px 이상 (이번 스토리의 핵심 목표)
- [ ] 단일 파일 1,000줄 초과 시 분리 검토 필수
- [ ] 스토리 완료 시 Dev Notes에 학습 내용 기록
- [ ] 스토리 완료 커밋 시 sprint-status.yaml 동시 업데이트 필수

### References

- [Source: _bmad-output/epics.md - Epic 8, Story 8 (UI-008)]
- [Source: _bmad-output/gdd.md - Accessibility Controls: 터치 타겟 44x44px, 색맹 지원, 애니메이션 감소]
- [Source: _bmad-output/implementation-artifacts/8-7-responsive-ui.md - 접근성 패턴 참고]
- [Source: _bmad-output/implementation-artifacts/epic-6-retro-2026-02-12.md - 팀 합의 사항]
- [Source: apps/web/src/components/game/KnockButton.css - min-width/min-height: 44px 패턴]
- [Source: apps/web/src/components/game/TacticPanel.css - prefers-reduced-motion 패턴]
- [Source: apps/web/src/components/result/ResultScreen.css - focus-visible 패턴]
- [Source: apps/web/src/components/game/LandscapeOverlay.css - prefers-reduced-motion + focus-visible 패턴]
- [Source: packages/game-core/src/constants/responsive.ts - game-core 상수 정의 패턴]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- game-core 테스트: 576개 통과 (24 파일)
- apps/web 테스트: 221개 통과 (14 파일)

### Completion Notes List

- 전역 `*:focus-visible` 스타일로 모든 인터랙티브 요소에 금색 포커스 링 일괄 적용 (개별 CSS 파일 수정 최소화)
- GeneralStatsPanel 닫기 버튼의 focus-visible 색상을 파란색(#60a5fa)에서 금색(#ffd700)으로 통일
- SurrenderConfirmModal의 role을 "dialog"에서 "alertdialog"로 변경 (되돌릴 수 없는 행동 경고에 적합)
- PlayerInfoBar는 이미 색맹 지원 우수 (실선삼각형/역삼각형 + P1/P2 텍스트 + 색상)
- 모든 터치 타겟이 이미 44x44px 이상으로 확인됨 (추가 CSS 수정 불필요)
- ACCESSIBILITY.COLOR_BLIND_PATTERNS는 향후 색맹 모드 토글 구현 시 활용 기반

### Dev Notes (학습)

- 전역 CSS focus-visible 전략이 개별 컴포넌트별 추가보다 효율적. CSS specificity로 기존 개별 정의와 충돌 없음
- prefers-reduced-motion은 animation과 transition 모두 비활성화해야 완전한 지원
- alertdialog vs dialog: 되돌릴 수 없는 행동(항복 등)에는 alertdialog가 ARIA 표준에 부합

### File List

**새 파일:**
- packages/game-core/src/constants/accessibility.ts
- apps/web/src/styles/accessibility.css
- packages/game-core/tests/constants/accessibility.test.ts
- apps/web/tests/accessibility-touch-target.test.tsx

**수정 파일:**
- packages/game-core/src/constants/index.ts
- apps/web/src/main.tsx
- apps/web/src/components/game/GameHUD.tsx
- apps/web/src/components/menu/StartScreen.tsx
- apps/web/src/components/game/SurrenderConfirmModal.tsx
- apps/web/src/components/game/KnockButton.css
- apps/web/src/components/game/TurnTimer.css
- apps/web/src/components/game/AutoEndToast.css
- apps/web/src/components/game/SurrenderConfirmModal.css
- apps/web/src/components/game/GeneralStatsPanel.css
