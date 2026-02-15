# UI 개선 작업 전략

> **작성일**: 2026-02-15
> **대상**: HUD Phase 1 완료 후 UI 반복 개선 단계
> **브랜치**: dev/trial-2

---

## 1. 작업 방식: 스크린샷 기반 ping-pong

```
[사용자] pnpm dev → 브라우저 스크린샷 → 붙여넣기
[Claude] 문제 파악 → CSS/TSX 직접 수정
[사용자] 브라우저 확인 → "좀 더 넓혀줘" / "버튼 간격 맞춰줘"
[Claude] 수정
... 반복
```

- Claude Code는 이미지를 직접 볼 수 있음 (스크린샷 파일 Read)
- 가장 빠른 피드백 루프: 스크린샷 + 한 줄 지시

---

## 2. 도구 선택 가이드

| 상황 | 도구 | 이유 |
|------|------|------|
| CSS 미세 조정 | **직접 Edit** | 에이전트 불필요, Claude Code 자체 기능으로 수정 |
| 레이아웃 구조 변경 | **직접 Edit** + `tsc --noEmit` | TSX 수정 후 타입 체크 |
| 여러 파일 동시 스타일 통일 | **executor (sonnet)** | 한 번에 5-6 파일 일괄 수정 |
| 현재 UI 상태 분석 | **vision agent** | 스크린샷 분석 |
| 디자인 방향 논의 | **designer agent** | UI/UX 제안 |

### 사용하지 말 것

- `ralph`, `autopilot`, `ultrawork` — 자동 루프, 시각 확인 불가
- 에이전트 남용 — 대부분 직접 Edit가 더 빠름

### 가볍게 사용

- `executor (sonnet)` — 명확한 CSS 일괄 수정 시
- `designer` — 레이아웃 제안 필요할 때

---

## 3. 핵심 UI 파일 목록

### React 컴포넌트 (apps/web/src/components/game/)

| 파일 | 설명 |
|------|------|
| `GameHUD.tsx` / `.css` | 메인 HUD 컨테이너 (그리드 레이아웃) |
| `SidePanel.tsx` / `.css` | 우측 사이드바 (장수 목록 + 상세) |
| `BottomActionBar.tsx` / `.css` | 하단 액션바 (좌: 상태, 우: 액션) |
| `GeneralPortrait.tsx` / `.css` | 장수 초상화 (사이드패널 내) |
| `GeneralStatsPanel.tsx` / `.css` | 장수 상세 정보 패널 |
| `MobileGeneralDrawer.tsx` / `.css` | 모바일 장수 서랍 |
| `GameCanvas.tsx` | Phaser + React 통합 |
| `KnockButton.tsx` / `.css` | 노크 버튼 (현재 미사용) |
| `TacticButton.tsx` / `.css` | 책략 버튼 |
| `TurnEndButton.tsx` / `.css` | 턴 종료 버튼 |
| `SurrenderButton.tsx` / `.css` | 항복 버튼 |
| `SettingsButton.tsx` / `.css` | 설정 버튼 |
| `TurnTimer.tsx` / `.css` | 턴 타이머 |
| `ActionCounter.tsx` / `.css` | 행동력 카운터 |

### Phaser UI (packages/game-renderer/src/ui/)

| 파일 | 설명 |
|------|------|
| `GeneralActionMenu.ts` | 장수 액션 팝업 [이동][공격][노크] |
| `MoveConfirmButton.ts` | 이동 확정 버튼 |
| `DisengageWarningModal.ts` | 교전 회피 경고 모달 |

---

## 4. 빌드/검증 명령어

```bash
# 개발 서버
pnpm dev

# TypeScript 체크
pnpm --filter @ftg/game-renderer exec tsc --noEmit
pnpm --filter web exec tsc --noEmit

# 테스트 (627개)
pnpm --filter @ftg/game-core test
```

---

## 5. 스타일 컨벤션

- **CSS 네이밍**: BEM (`.component__element--modifier`)
- **폰트**: DungGeunMo (픽셀 아트)
- **색상 팔레트**: `#1e1e3a`(배경), `#2a2a4a`(보조), `#e0d8c0`(텍스트), `#ffd700`(강조)
- **테두리**: 직각 (border-radius 없음), `#3a3a5c` ~ `#4a4a6a`
- **반응형**: 모바일(~430px), 태블릿(431~1023px), 데스크톱(1024px~)
