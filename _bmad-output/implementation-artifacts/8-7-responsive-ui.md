# Story 8.7: 반응형 UI (Responsive UI)

Status: ready-for-dev

## Story

As a 플레이어,
I want 모바일(320px~430px), 태블릿(768px~1024px), 데스크톱(1024px+) 등 다양한 화면 크기에서 UI가 자연스럽게 적응하여 최적의 게임 경험을 제공받기를,
so that 어떤 디바이스에서든 텍스트가 잘리거나 버튼이 겹치지 않고, 보드와 HUD가 화면에 맞게 배치되어 쾌적하게 플레이할 수 있다.

## Acceptance Criteria

1. **AC1: 반응형 브레이크포인트 통합** - 모든 UI 컴포넌트가 일관된 3단계 브레이크포인트 체계를 사용한다. 모바일: max-width 430px, 태블릿: 431px~1023px, 데스크톱: min-width 1024px. game-core에 BREAKPOINTS 상수를 정의하고, 모든 CSS 미디어 쿼리가 이 기준을 따른다.
2. **AC2: Phaser 캔버스 반응형 리사이즈** - 브라우저 창 크기 변경 시 Phaser 캔버스가 부모 컨테이너에 맞게 자동 리사이즈된다. 보드 타일과 장수 스프라이트가 새 크기에 맞게 재계산/재렌더링된다. 리사이즈 시 debounce(150ms)를 적용하여 성능 저하를 방지한다. 리사이즈 후에도 게임 상태(선택된 장수, 하이라이트 등)가 유지된다.
3. **AC3: HUD 레이아웃 반응형 적응** - 모바일에서 HUD 하단 버튼들(노크, 책략, 설정, 턴 종료)이 겹치지 않고 적절한 간격으로 배치된다. 모바일에서 하단 버튼 영역의 padding/gap이 축소된다(gap: 4px, bottom: 12px). 데스크톱에서 HUD 요소들이 충분한 여백으로 배치된다(gap: 12px, bottom: 24px). PlayerInfoBar가 모든 화면 크기에서 가로 스크롤 없이 표시된다.
4. **AC4: 모달/패널 반응형 대응** - GeneralStatsPanel이 모바일에서 하단 시트(bottom sheet) 형태로, 데스크톱에서 우측 하단 카드로 표시된다(기존 구현 검증). TacticPanel이 모바일에서 전체 화면, 데스크톱에서 중앙 카드로 표시된다(기존 구현 검증). SettingsModal이 모바일에서 전체 화면, 데스크톱에서 중앙 다이얼로그로 표시된다(기존 구현 검증). ResultScreen이 모바일에서 전체 화면, 데스크톱에서 카드(max-width: 500px)로 표시된다(기존 구현 검증).
5. **AC5: 세로/가로 방향 대응** - 세로 모드(portrait)에서 보드가 화면 상단~중앙에 배치되고 HUD가 하단에 배치된다(기본 레이아웃). 가로 모드(landscape) 감지 시 "세로 모드를 권장합니다" 안내 오버레이가 표시된다. 안내 오버레이는 닫기 가능하며, 닫은 후에도 가로 모드에서 게임이 정상 동작한다. 안내 오버레이에 적절한 접근성 속성(role="alert", aria-label)이 적용된다.
6. **AC6: safe-area 대응 (노치/홈 인디케이터)** - iOS 노치/Dynamic Island 영역을 침범하지 않도록 safe-area-inset을 적용한다. CSS env(safe-area-inset-top/bottom/left/right)을 활용한다. 하단 HUD 버튼이 iOS 홈 인디케이터 영역과 겹치지 않는다.
7. **AC7: 텍스트 및 폰트 크기 반응형** - 모바일에서 기본 폰트 크기가 14px 이상으로 가독성을 유지한다. 모든 텍스트가 화면 너비에서 잘리지 않고 표시된다(text-overflow: ellipsis 또는 줄바꿈). 데스크톱에서 폰트 크기가 적절히 확대되어 넓은 화면에서도 읽기 편하다. CSS clamp() 함수를 활용하여 유연한 폰트 스케일링을 적용한다.
8. **AC8: 접근성** - 반응형 관련 모든 새 UI 요소에 적절한 ARIA 속성이 적용된다. 가로 모드 안내 오버레이: role="alert", aria-label="가로 모드 감지", 닫기 버튼 aria-label="닫기". viewport meta 태그에 user-scalable=yes가 설정되어 핀치 줌이 가능하다. prefers-reduced-motion 미디어 쿼리로 모션 민감 사용자를 위한 애니메이션 비활성화가 적용된다.

## Tasks / Subtasks

- [ ] Task 1: game-core 반응형 관련 상수 정의 (AC: #1)
  - [ ] 1.1 `packages/game-core/src/constants/responsive.ts` 파일 생성 - BREAKPOINTS 상수 정의 (MOBILE: 430, TABLET: 1023, DESKTOP: 1024)
  - [ ] 1.2 RESPONSIVE 상수 정의 - DEBOUNCE_MS: 150 (리사이즈 디바운스), MIN_FONT_SIZE: 14 (최소 폰트 크기)
  - [ ] 1.3 `packages/game-core/src/constants/index.ts` 수정 - responsive 모듈 re-export 추가
  - [ ] 1.4 `packages/game-core/src/index.ts` 수정 - BREAKPOINTS, RESPONSIVE 상수 export 추가

- [ ] Task 2: useResponsive 커스텀 훅 생성 (AC: #1, #5)
  - [ ] 2.1 `apps/web/src/hooks/useResponsive.ts` 파일 생성
  - [ ] 2.2 현재 뷰포트 너비/높이 추적 (window.innerWidth/innerHeight)
  - [ ] 2.3 breakpoint 상태 계산 ('mobile' | 'tablet' | 'desktop')
  - [ ] 2.4 orientation 상태 계산 ('portrait' | 'landscape')
  - [ ] 2.5 ResizeObserver 또는 window resize 이벤트로 변경 감지 (debounce 150ms)
  - [ ] 2.6 반환값: { width, height, breakpoint, isPortrait, isLandscape, isMobile, isTablet, isDesktop }

- [ ] Task 3: 가로 모드 안내 오버레이 컴포넌트 (AC: #5, #8)
  - [ ] 3.1 `apps/web/src/components/game/LandscapeOverlay.tsx` 파일 생성
  - [ ] 3.2 `apps/web/src/components/game/LandscapeOverlay.css` 파일 생성
  - [ ] 3.3 Props: isVisible (boolean), onDismiss (() => void)
  - [ ] 3.4 오버레이 내용: 회전 아이콘 + "세로 모드를 권장합니다" 텍스트 + 닫기 버튼
  - [ ] 3.5 접근성: role="alert", aria-label="가로 모드 감지", 닫기 버튼 aria-label="닫기" (44x44px)
  - [ ] 3.6 오버레이 스타일: z-index 2000 (모든 UI 위), 반투명 배경
  - [ ] 3.7 prefers-reduced-motion 지원: 애니메이션 비활성화
  - [ ] 3.8 createPortal로 document.body에 렌더링

- [ ] Task 4: Phaser 캔버스 리사이즈 개선 (AC: #2)
  - [ ] 4.1 GameCanvas.tsx의 ResizeObserver 콜백에 debounce(150ms) 적용
  - [ ] 4.2 debounce 유틸 함수 생성 (`apps/web/src/utils/debounce.ts`) 또는 기존 유틸 활용
  - [ ] 4.3 리사이즈 시 게임 상태(선택된 장수, 하이라이트 등) 유지 검증
  - [ ] 4.4 GameScene의 handleResize()가 보드+장수를 올바르게 재렌더링하는지 검증

- [ ] Task 5: HUD 레이아웃 반응형 개선 (AC: #3)
  - [ ] 5.1 GameHUD 컴포넌트의 하단 영역 padding/gap을 브레이크포인트별로 조정
  - [ ] 5.2 모바일: 하단 버튼 gap 4px, bottom 12px / 데스크톱: gap 12px, bottom 24px
  - [ ] 5.3 하단 좌측(노크+책략+설정) 버튼 그룹이 모바일에서 겹치지 않도록 flexWrap 또는 크기 조정
  - [ ] 5.4 PlayerInfoBar가 320px 너비에서도 가로 스크롤 없이 표시되는지 검증
  - [ ] 5.5 태블릿(768px)에서 HUD 요소 배치 자연스러운지 검증

- [ ] Task 6: safe-area 대응 (AC: #6)
  - [ ] 6.1 `apps/web/index.html`의 viewport meta 태그에 viewport-fit=cover 추가
  - [ ] 6.2 GameHUD 하단 영역에 padding-bottom: env(safe-area-inset-bottom) 적용
  - [ ] 6.3 GameHUD 상단 영역에 padding-top: env(safe-area-inset-top) 적용
  - [ ] 6.4 StartScreen에도 safe-area padding 적용
  - [ ] 6.5 ResultScreen 하단 버튼에 safe-area 여백 적용

- [ ] Task 7: 텍스트/폰트 반응형 개선 (AC: #7)
  - [ ] 7.1 루트(html/body) 폰트 크기에 clamp() 적용: clamp(14px, 2vw + 10px, 18px)
  - [ ] 7.2 긴 텍스트 요소에 text-overflow: ellipsis 또는 word-break 적용 검증
  - [ ] 7.3 모바일에서 모든 텍스트가 14px 이상인지 검증 (CSS audit)
  - [ ] 7.4 데스크톱에서 폰트가 적절히 확대되는지 검증

- [ ] Task 8: 모달/패널 반응형 검증 및 보완 (AC: #4)
  - [ ] 8.1 GeneralStatsPanel: 모바일 하단 시트/데스크톱 우측 카드 동작 검증
  - [ ] 8.2 TacticPanel: 모바일 전체 화면/데스크톱 카드 동작 검증
  - [ ] 8.3 SettingsModal: 모바일 전체 화면/데스크톱 다이얼로그 동작 검증
  - [ ] 8.4 ResultScreen: 모바일 전체 화면/데스크톱 카드(500px) 동작 검증
  - [ ] 8.5 SurrenderConfirmModal: 모바일/데스크톱 레이아웃 검증
  - [ ] 8.6 발견된 문제 수정 (겹침, 잘림, 스크롤 등)

- [ ] Task 9: viewport 및 전역 접근성 설정 (AC: #8)
  - [ ] 9.1 `apps/web/index.html` viewport meta 확인 및 수정: user-scalable=yes 보장
  - [ ] 9.2 prefers-reduced-motion 전역 적용 확인: 기존 컴포넌트(TacticPanel 등)에서 이미 적용된 패턴을 다른 애니메이션 컴포넌트에도 확산
  - [ ] 9.3 LandscapeOverlay 접근성 속성 최종 검증

- [ ] Task 10: GameCanvas에 LandscapeOverlay 연동 (AC: #5)
  - [ ] 10.1 GameCanvas에서 useResponsive 훅 사용하여 orientation 감지
  - [ ] 10.2 landscapeDismissed 상태(useState) 추가
  - [ ] 10.3 LandscapeOverlay 렌더링: isLandscape && !landscapeDismissed 시 표시
  - [ ] 10.4 닫기 시 landscapeDismissed = true 설정
  - [ ] 10.5 세로 모드로 돌아오면 landscapeDismissed 리셋 (다음 가로 전환 시 다시 표시)

- [ ] Task 11: 단위 테스트 작성 (AC: #1~#8)
  - [ ] 11.1 game-core BREAKPOINTS/RESPONSIVE 상수 존재 확인 테스트
  - [ ] 11.2 useResponsive 훅 테스트: 기본 상태(portrait, 뷰포트 크기) 확인
  - [ ] 11.3 useResponsive 훅 테스트: 뷰포트 리사이즈 시 breakpoint 변경 확인
  - [ ] 11.4 useResponsive 훅 테스트: landscape/portrait 전환 확인
  - [ ] 11.5 LandscapeOverlay 렌더링 테스트: isVisible=true 시 오버레이 표시
  - [ ] 11.6 LandscapeOverlay 렌더링 테스트: isVisible=false 시 미렌더링
  - [ ] 11.7 LandscapeOverlay 닫기 버튼 클릭 테스트: onDismiss 콜백 호출 확인
  - [ ] 11.8 LandscapeOverlay 접근성 테스트: role="alert", aria-label 확인
  - [ ] 11.9 HUD 반응형 레이아웃 테스트: 모바일/데스크톱 스타일 차이 검증
  - [ ] 11.10 safe-area CSS 적용 확인 테스트 (CSS 존재 검증)
  - [ ] 11.11 debounce 유틸 함수 테스트 (호출 횟수 제한 확인)

## Dev Notes

### 핵심 아키텍처 패턴

- **상수 레이어**: game-core (`packages/game-core/src/constants/responsive.ts`) - 브레이크포인트/반응형 상수
- **UI 레이어**: React Components - LandscapeOverlay, HUD 반응형 조정
- **훅 레이어**: useResponsive 커스텀 훅 - 뷰포트/방향/브레이크포인트 감지
- **렌더러 레이어**: game-renderer (GameScene.handleResize) - Phaser 캔버스 리사이즈 (기존 구현 활용)
- **분리 원칙**: game-core에 Phaser 의존성 절대 금지. 브레이크포인트 상수는 순수 TypeScript.

### 현재 반응형 구현 상태 (8-1 ~ 8-6에서 부분 구현됨)

| 컴포넌트 | 모바일 미디어 쿼리 | 데스크톱 미디어 쿼리 | 브레이크포인트 |
|---------|-------------------|---------------------|-------------|
| StartScreen | max-width: 430px | - | 비일관 |
| PlayerInfoBar | max-width: 430px | min-width: 1024px | 일관 |
| ActionCounter | max-width: 430px | min-width: 1024px | 일관 |
| TurnTimer | max-width: 640px | - | 비일관 |
| TurnIndicator | max-width: 640px | - | 비일관 |
| AutoEndToast | max-width: 480px | - | 비일관 |
| GeneralStatsPanel | max-width: 768px | - | 비일관 |
| TacticPanel | min-width: 1024px | - | 일관 |
| SettingsModal | max-width: 430px | min-width: 1024px | 일관 |
| ResultScreen | max-width: 430px | min-width: 1024px | 일관 |
| GameHUD | (inline styles) | (inline styles) | 미적용 |

**핵심 문제**: 브레이크포인트가 컴포넌트별로 430px, 480px, 640px, 768px 등 제각각. 통합 기준 필요.

### 브레이크포인트 통합 전략

기존 컴포넌트의 미디어 쿼리를 일괄 수정하지 않고, **새로운 상수 정의 + 점진적 마이그레이션** 전략:

1. game-core에 BREAKPOINTS 상수 정의
2. 이번 스토리에서 새로 만드는 CSS/컴포넌트는 통합 브레이크포인트 사용
3. 기존 컴포넌트는 **명백한 문제**(겹침, 잘림)만 수정
4. 전체 마이그레이션은 기술 부채로 관리

```typescript
// packages/game-core/src/constants/responsive.ts
export const BREAKPOINTS = {
  MOBILE: 430,    // 모바일 최대 너비 (모바일: ≤430px)
  TABLET: 1023,   // 태블릿 최대 너비 (태블릿: 431px~1023px)
  DESKTOP: 1024,  // 데스크톱 최소 너비 (데스크톱: ≥1024px)
} as const;

export const RESPONSIVE = {
  DEBOUNCE_MS: 150,       // 리사이즈 디바운스 (밀리초)
  MIN_FONT_SIZE: 14,      // 최소 폰트 크기 (px)
  SAFE_AREA_FALLBACK: 0,  // safe-area 미지원 시 폴백 (px)
} as const;
```

### Phaser 캔버스 리사이즈 현재 구현

이미 상당 부분 구현됨:
- GameCanvas: ResizeObserver로 부모 크기 감지 → game.scale.resize() 호출
- GameScene: scale.on('resize', handleResize) → 보드 재계산 + 장수 재렌더링
- BoardRenderer: calculateDynamicTileSize() → 화면 크기 기반 타일 크기 동적 계산

**개선 포인트**: debounce 미적용 → 빈번한 리사이즈 이벤트로 성능 저하 가능

### HUD 레이아웃 현재 문제점

GameHUD의 하단 영역이 inline 스타일 `bottom: '20px'`, `left: '20px'`, `right: '20px'`로 고정됨.
모바일에서 하단 좌측(노크+책략+설정) 3개 버튼 + 하단 우측(턴 종료) 1개가 동시에 표시될 때 간격이 좁음.

**해결 방향**: GameHUD를 CSS 파일로 분리하고 브레이크포인트별 패딩/갭 조정.

### safe-area 대응

```css
/* safe-area 적용 예시 */
.game-hud__bottom-left {
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: calc(12px + env(safe-area-inset-left, 0px));
}

.game-hud__bottom-right {
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  right: calc(12px + env(safe-area-inset-right, 0px));
}
```

### LandscapeOverlay 디자인

```
┌─────────────────────────────────────────────┐
│                                             │
│              📱↻                            │
│                                             │
│     세로 모드를 권장합니다                    │
│     더 나은 게임 경험을 위해                  │
│     기기를 세로로 회전해주세요                 │
│                                             │
│           ┌────────────────┐                │
│           │     닫기        │                │
│           └────────────────┘                │
│                                             │
└─────────────────────────────────────────────┘
```

- 배경: rgba(0, 0, 0, 0.9)
- 텍스트: #ffffff
- 닫기 버튼: 투명 배경, #ffd700 테두리/텍스트 (44x44px 이상)
- z-index: 2000 (모든 UI 위)

### z-index 정리 (전체)

| 레이어 | z-index | 컴포넌트 |
|--------|---------|----------|
| 게임 캔버스 | 1 | Phaser canvas |
| 게임 HUD | 100 | GameHUD |
| 항복 확인 모달 | 150 | SurrenderConfirmModal |
| 결과 화면 | 1000 | ResultScreen |
| **가로 모드 안내** | **2000** | **LandscapeOverlay (신규)** |
| 설정 모달 | 9997 | SettingsModal |
| 책략 패널 | 9998 | TacticPanel |
| 장수 정보 패널 | 9999 | GeneralStatsPanel |

### 컴포넌트 의존성

```
App
  ├── StartScreen (safe-area 적용)
  └── GameCanvas
       ├── useResponsive (훅: 뷰포트/방향 감지)
       ├── GameHUD (반응형 패딩/갭 개선)
       │    ├── PlayerInfoBar (기존 - 검증)
       │    ├── KnockButton (기존)
       │    ├── TacticButton (기존)
       │    ├── SettingsButton (기존)
       │    └── TurnEndButton (기존)
       ├── LandscapeOverlay (신규 - 가로 모드 안내)
       ├── GeneralStatsPanel (기존 - 검증)
       ├── TacticPanel (기존 - 검증)
       ├── SettingsModal (기존 - 검증)
       ├── ResultScreen (기존 - 검증)
       └── SurrenderConfirmModal (기존 - 검증)
```

### 기존 컴포넌트 재사용/수정/삭제 대상

| 컴포넌트 | 액션 |
|---------|------|
| `LandscapeOverlay.tsx` | **새로 생성** (`apps/web/src/components/game/`) |
| `LandscapeOverlay.css` | **새로 생성** |
| `useResponsive.ts` | **새로 생성** (`apps/web/src/hooks/`) |
| `debounce.ts` | **새로 생성** (`apps/web/src/utils/`) |
| `GameCanvas.tsx` | 수정 (useResponsive 연동, LandscapeOverlay 추가, debounce 적용) |
| `GameHUD.tsx` | 수정 (CSS 분리 또는 브레이크포인트별 스타일 적용) |
| `index.html` | 수정 (viewport-fit=cover, user-scalable=yes) |

### game-core 파일 변경

| 파일 | 액션 |
|------|------|
| `packages/game-core/src/constants/responsive.ts` | **새로 생성** (BREAKPOINTS, RESPONSIVE) |
| `packages/game-core/src/constants/index.ts` | 수정 (responsive export 추가) |
| `packages/game-core/src/index.ts` | 수정 (BREAKPOINTS, RESPONSIVE export 추가) |

### 비주얼 확인 필요 항목

이 스토리는 반응형 레이아웃을 다루므로 **시각적 검증이 필수적**입니다:
- [ ] 모바일(320px, 375px, 430px) 시뮬레이션에서 보드+HUD 레이아웃 확인
- [ ] 데스크톱(1024px, 1440px) 시뮬레이션에서 보드+HUD 레이아웃 확인
- [ ] 가로 모드에서 LandscapeOverlay 표시 확인
- [ ] iOS Safari에서 safe-area 적용 확인 (시뮬레이터 또는 실기기)

### 테스트 표준

- 테스트 프레임워크: Vitest + React Testing Library
- 테스트 위치: `apps/web/tests/` 디렉토리 (8-1~8-6 패턴 따름)
- 파일명: `responsive-ui.test.tsx`, `use-responsive.test.ts`, `landscape-overlay.test.tsx`
- game-core 테스트: `packages/game-core/tests/constants/responsive.test.ts`
- E2E: Playwright (`npx playwright test`) - 다양한 뷰포트 크기에서 레이아웃 테스트

### Phase 2 확장 시 변경 예상 지점

- 멀티플레이어 매칭 대기 화면의 반응형 레이아웃
- 태블릿 가로 모드에서 보드 좌측 + 채팅 우측 레이아웃 (Phase 2 옵션)
- 리더보드/전적 화면의 반응형 테이블
- PWA 설치 프롬프트의 반응형 배치

### 팀 합의 사항 준수 체크리스트

- [ ] game-core에 Phaser 의존성 절대 금지 (responsive.ts는 순수 TypeScript)
- [ ] 새 상수/타입은 game-core에 먼저 정의 (BREAKPOINTS, RESPONSIVE)
- [ ] ARIA 속성 모든 UI 컴포넌트에 적용 (LandscapeOverlay: role="alert", aria-label)
- [ ] 터치 타겟 44x44px 이상 (LandscapeOverlay 닫기 버튼)
- [ ] 단일 파일 1,000줄 초과 시 분리 검토 필수
- [ ] 스토리 완료 시 Dev Notes에 학습 내용 기록
- [ ] 스토리 완료 커밋 시 sprint-status.yaml 동시 업데이트 필수

### References

- [Source: _bmad-output/epics.md - Epic 8, Story 7 (UI-007)]
- [Source: _bmad-output/gdd.md - Target Platform(s), Resolution Support, Accessibility Controls]
- [Source: _bmad-output/game-architecture.md - Project Structure, Cross-cutting Concerns, Performance Rules]
- [Source: _bmad-output/project-context.md - Platform & Build Rules, Performance Rules]
- [Source: apps/web/src/components/game/GameCanvas.tsx - ResizeObserver 패턴, HUD 연동]
- [Source: packages/game-renderer/src/scenes/GameScene.ts - handleResize(), scale.on('resize')]
- [Source: packages/game-renderer/src/rendering/BoardRenderer.ts - calculateDynamicTileSize(), recalculateAndRender()]
- [Source: apps/web/src/components/game/GameHUD.tsx - HUD 레이아웃 구조]
- [Source: apps/web/src/components/game/PlayerInfoBar.css - 반응형 미디어 쿼리 패턴]
- [Source: apps/web/src/components/settings/SettingsModal.css - 반응형 미디어 쿼리 패턴]
- [Source: apps/web/src/components/result/ResultScreen.css - 반응형 미디어 쿼리 패턴]
- [Source: _bmad-output/implementation-artifacts/epic-6-retro-2026-02-12.md - 팀 합의 사항]
- [Source: _bmad-output/implementation-artifacts/8-6-result-screen.md - 이전 스토리 패턴 참고]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
