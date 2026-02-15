# Story 8.4: 책략 선택 UI (Tactic Selection UI)

Status: done

## Story

As a 플레이어,
I want 게임 중 "책략" 버튼을 탭하여 현재 선택된 장수가 사용할 수 있는 책략 목록을 패널로 확인하고 선택할 수 있기를,
so that 전략적 타이밍에 책략을 사용하여 전투에서 유리한 상황을 만들 수 있다.

## Acceptance Criteria

1. **AC1: 책략 버튼 표시** - 게임 HUD의 하단 영역에 "책략" 버튼이 표시된다. 버튼은 현재 턴 플레이어의 장수가 선택되어 있고, 행동이 남아있을 때(actionsRemaining > 0) 활성화된다. 장수 미선택 또는 행동 없으면 비활성화(disabled)로 표시된다. 터치 타겟은 최소 44x44px을 충족한다.
2. **AC2: 책략 패널 열기/닫기** - 책략 버튼 클릭 시 책략 선택 패널이 열린다. 패널은 게임 보드를 가리지 않는 위치(화면 하단 슬라이드업 또는 우측 패널)에 표시되며, 닫기 버튼(X) 또는 패널 외부 탭으로 닫을 수 있다. 닫기 버튼의 터치 타겟은 최소 44x44px을 충족한다.
3. **AC3: 책략 목록 표시 (Phase 1 플레이스홀더)** - 패널 내부에 현재 선택된 장수에게 장착된 책략 3개가 슬롯 형태로 표시된다. Phase 1에서는 모든 책략이 "준비 중"(coming soon) 플레이스홀더로 표시되며 실제 선택/실행은 불가하다. 각 슬롯에는 책략 이름, 유형(현장용/사무용) 아이콘, "Phase 3에서 사용 가능" 안내 텍스트가 표시된다.
4. **AC4: 책략 슬롯 상태 시각화** - 각 책략 슬롯은 3가지 상태를 시각적으로 구분한다: (a) 사용 가능(밝은 배경, 클릭 가능 - Phase 3), (b) 사용 불가/조건 불일치(흐리게, 비활성 - Phase 3), (c) 소진됨(어둡게, 취소선 - Phase 3). Phase 1에서는 모든 슬롯이 "준비 중" 상태(점선 테두리, 반투명)로 표시된다.
5. **AC5: 책략 정보 미리보기** - 책략 슬롯에 롱프레스(모바일) 또는 호버(데스크톱) 시 책략의 간단한 설명이 툴팁으로 표시된다. Phase 1에서는 "이 책략은 Phase 3에서 활성화됩니다"라는 공통 안내 메시지를 표시한다.
6. **AC6: 반응형 레이아웃** - 모바일(320px~430px)에서 패널이 화면 하단에서 슬라이드업되어 화면 높이의 40%까지 차지한다. 데스크톱(1024px+)에서는 화면 하단 중앙에 고정된 카드 형태로 표시된다. 패널이 화면 밖으로 잘리지 않는다.
7. **AC7: 접근성** - 책략 버튼에 `aria-label="책략 메뉴 열기"`, 패널에 `role="dialog"`, `aria-label="책략 선택"`, `aria-modal="true"`가 적용된다. 각 책략 슬롯에 `role="button"`, `aria-label`(책략 이름 포함), `aria-disabled="true"`(Phase 1)가 적용된다. 닫기 버튼에 `aria-label="책략 패널 닫기"`가 적용된다. 패널 열림 시 포커스가 패널로 이동하고, 닫힘 시 책략 버튼으로 포커스가 복귀한다.
8. **AC8: 게임 상태 연동** - 게임 종료 시(isGameEnded=true) 책략 버튼이 비활성화된다. 턴 전환 시 열려있던 책략 패널이 자동으로 닫힌다. 장수 선택 해제 시(general:deselected) 패널이 자동으로 닫힌다.

## Tasks / Subtasks

- [x] Task 1: game-core 책략 타입 및 상수 정의 (AC: #3, #4)
  - [x] 1.1 `packages/game-core/src/tactics/types.ts` 파일 생성 - TacticId, TacticType('field'|'office'), TacticSlotStatus('available'|'unavailable'|'exhausted'|'coming_soon'), TacticSlot 인터페이스 정의
  - [x] 1.2 `packages/game-core/src/tactics/constants.ts` 파일 생성 - TACTIC_SLOTS_PER_GENERAL(3), Phase 1 플레이스홀더 책략 데이터 (이름, 유형, 설명) 정의
  - [x] 1.3 `packages/game-core/src/tactics/index.ts` 파일 생성 - 모듈 export
  - [x] 1.4 `packages/game-core/src/index.ts` 수정 - tactics 모듈 export 추가

- [x] Task 2: TacticButton 컴포넌트 생성 (AC: #1, #7, #8)
  - [x] 2.1 `apps/web/src/components/game/TacticButton.tsx` 파일 생성
  - [x] 2.2 `apps/web/src/components/game/TacticButton.css` 파일 생성 (BEM 네이밍)
  - [x] 2.3 책략 아이콘(두루마리/스크롤 이모지 "&#x1F4DC;") + "책략" 텍스트 표시
  - [x] 2.4 `isEnabled` prop으로 활성/비활성 상태 제어
  - [x] 2.5 `onClick` prop으로 패널 열기 콜백 연결
  - [x] 2.6 `aria-label="책략 메뉴 열기"` 접근성 속성 적용
  - [x] 2.7 최소 44x44px 터치 타겟 보장 (CSS: min-width/min-height: 44px)
  - [x] 2.8 게임 종료 시(isGameEnded) disabled 처리

- [x] Task 3: TacticPanel 컴포넌트 생성 (AC: #2, #3, #4, #5, #6, #7)
  - [x] 3.1 `apps/web/src/components/game/TacticPanel.tsx` 파일 생성
  - [x] 3.2 `apps/web/src/components/game/TacticPanel.css` 파일 생성 (BEM 네이밍)
  - [x] 3.3 패널 헤더: 선택된 장수 이름 + "책략" 타이틀 + 닫기 버튼(X)
  - [x] 3.4 책략 슬롯 3개 렌더링 (TacticSlotCard 서브컴포넌트)
  - [x] 3.5 각 슬롯: 책략 이름, 유형 아이콘(현장용: 검 "&#x2694;&#xFE0F;", 사무용: 책 "&#x1F4D6;"), "Phase 3에서 사용 가능" 안내 텍스트
  - [x] 3.6 Phase 1 슬롯 스타일: 점선 테두리, 반투명 배경, `aria-disabled="true"`
  - [x] 3.7 롱프레스/호버 시 툴팁 표시 ("이 책략은 Phase 3에서 활성화됩니다")
  - [x] 3.8 닫기 버튼: 최소 44x44px, `aria-label="책략 패널 닫기"`
  - [x] 3.9 `role="dialog"`, `aria-label="책략 선택"`, `aria-modal="true"` 적용
  - [x] 3.10 패널 열림 시 포커스 트랩(닫기 버튼으로 이동), 닫힘 시 포커스 복귀
  - [x] 3.11 반응형: 모바일 하단 슬라이드업(max-height: 40vh), 데스크톱 하단 중앙 카드(max-width: 400px)
  - [x] 3.12 `createPortal`로 `document.body`에 렌더링 (z-index: 9998, GeneralStatsPanel보다 아래)

- [x] Task 4: GameCanvas 연동 - 책략 버튼/패널 통합 (AC: #1, #2, #8)
  - [x] 4.1 GameCanvas에 `isTacticPanelOpen` 상태(useState) 추가
  - [x] 4.2 `handleTacticButtonClick`: 패널 열기 (isTacticPanelOpen = true)
  - [x] 4.3 `handleTacticPanelClose`: 패널 닫기 (isTacticPanelOpen = false)
  - [x] 4.4 TacticButton을 GameHUD 하단 좌측 영역에 배치 (KnockButton 옆 또는 대체 위치)
  - [x] 4.5 TacticPanel을 createPortal로 조건부 렌더링
  - [x] 4.6 장수 선택 상태 + actionsRemaining > 0 조건으로 TacticButton 활성화 제어
  - [x] 4.7 턴 전환(turn:start) 이벤트 시 패널 자동 닫기
  - [x] 4.8 장수 선택 해제(general:deselected) 시 패널 자동 닫기
  - [x] 4.9 게임 종료(isGameEnded) 시 TacticButton 비활성화

- [x] Task 5: 단위 테스트 작성 (AC: #1~#8)
  - [x] 5.1 TacticButton 기본 렌더링 테스트 (아이콘, 텍스트 존재 확인)
  - [x] 5.2 TacticButton 활성/비활성 상태 테스트 (disabled 속성)
  - [x] 5.3 TacticButton 클릭 콜백 테스트 (onClick 호출 확인)
  - [x] 5.4 TacticButton 접근성 테스트 (aria-label 확인)
  - [x] 5.5 TacticPanel 기본 렌더링 테스트 (헤더, 슬롯 3개, 닫기 버튼)
  - [x] 5.6 TacticPanel 책략 슬롯 정보 표시 테스트 (이름, 유형, 안내 텍스트)
  - [x] 5.7 TacticPanel 닫기 버튼 클릭 테스트 (onClose 콜백 호출 확인)
  - [x] 5.8 TacticPanel Phase 1 비활성 스타일 테스트 (aria-disabled="true")
  - [x] 5.9 TacticPanel 접근성 테스트 (role="dialog", aria-label, aria-modal)
  - [x] 5.10 TacticPanel 장수 미선택 시 미렌더링 테스트 (general=null)

## Dev Notes

### 핵심 아키텍처 패턴

- **UI 레이어**: React Components (`apps/web/src/components/game/`) - 게임 외부 UI 담당
- **게임 레이어**: Phaser (`packages/game-renderer/`) - 게임 캔버스 담당
- **분리 원칙**: 책략 패널은 React 오버레이, 장수 선택은 Phaser, 책략 데이터는 game-core
- **통신 패턴**: Phaser Scene -> React: 이벤트 기반 (`scene.events.emit`), React -> Phaser: Zustand subscribe

### Phase 1 범위 제한 (중요)

**이 스토리는 Epic 8 (UI/UX)에 속하며, 책략 UI 쉘만 구현합니다.**

- 실제 책략 효과 구현은 Epic 7 (책략 시스템) 범위
- Phase 1에서는 모든 책략 슬롯이 "준비 중" 플레이스홀더로 표시
- 책략 선택/실행 로직은 구현하지 않음 (UI 껍데기만)
- 게임 규칙 문서 Section 9.2: "Phase 1/2 (MVP): [모의]의 예비 슬롯만 UI와 규칙에 표시"

**Phase 3 확장 시 변경 예상 지점:**
- TacticSlotStatus에 'available'/'unavailable'/'exhausted' 상태 활성화
- TacticPanel에서 책략 선택 시 `scene.executeTactic(tacticId)` 호출 추가
- 책략 사용 후 actionsRemaining 감소 이벤트 연동
- 슬롯별 조건 판정 로직 (현장용: 인접 적 필요, 사무용: 조건별)

### 게임 규칙 참조 (02-game-rules.md Section 9)

```
책략 시스템 규칙:
- 책략은 현장용(10개)과 사무용(10개)으로 구분
- 장수별로 책략 3개를 장착 (덱 빌딩)
- 각 책략은 해당 장수 기준 일회용
- [모의] 버튼을 누르면 장착된 책략 3개 표시
- 책략을 선택/시전하는 순간 행동력 1 소모
- 이미 사용한 책략: 어둡게(소진 표시)
- 조건 불일치: 비활성(흐리게) 처리
```

### Phase 1 플레이스홀더 책략 데이터

Phase 1에서 UI 표시용으로 사용할 플레이스홀더 데이터:

```typescript
// packages/game-core/src/tactics/constants.ts
const PLACEHOLDER_TACTICS = [
  { id: 'placeholder_field_1', name: '현장 책략', nameKo: '현장 책략', type: 'field', description: 'Phase 3에서 활성화' },
  { id: 'placeholder_office_1', name: '사무 책략', nameKo: '사무 책략', type: 'office', description: 'Phase 3에서 활성화' },
  { id: 'placeholder_field_2', name: '현장 책략', nameKo: '현장 책략', type: 'field', description: 'Phase 3에서 활성화' },
];
```

### 책략 버튼 → 패널 열기 데이터 흐름

```
사용자: 장수 선택 후 "책략" 버튼 탭
  |
  v
GameCanvas (React) -> handleTacticButtonClick()
  |- setIsTacticPanelOpen(true)
  |
  v
TacticPanel (React) <- createPortal -> document.body에 렌더링
  |- generalName: selectedGeneral.nameKo
  |- tacticSlots: PLACEHOLDER_TACTICS (Phase 1)
  |- onClose: handleTacticPanelClose
```

### 패널 닫기 트리거 목록

```
1. 닫기 버튼(X) 클릭
   TacticPanel -> onClose() -> setIsTacticPanelOpen(false)

2. 패널 외부 오버레이 클릭
   TacticPanel backdrop -> onClose()

3. 턴 전환 시 자동 닫기
   turn:start 이벤트 -> handleTurnStart() 내에서 setIsTacticPanelOpen(false)

4. 장수 선택 해제 시 자동 닫기
   general:deselected 이벤트 -> handleGeneralDeselected() 내에서 setIsTacticPanelOpen(false)

5. ESC 키 (데스크톱)
   TacticPanel 내 keydown 리스너 -> onClose()
```

### GameHUD 레이아웃 변경

```
┌─────────────────────────────────────────────────────────┐
│  P1: Player 1      턴 N | 45초      P2: Player 2       │
│  노크: ●●○       행동: ●●○           노크: ●○○        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                   [게임 보드 영역]                        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  [노크] [책략]                        [턴 종료] [항복]  │
└─────────────────────────────────────────────────────────┘
```

- 책략 버튼은 노크 버튼 옆(우측)에 배치
- GameHUD의 기존 leftContent 영역 활용
- 노크 버튼과 책략 버튼을 flex row로 배치

### 컴포넌트 의존성

```
GameCanvas
  ├── GameHUD
  │    ├── topContent: PlayerInfoBar (기존)
  │    ├── topRightContent: SurrenderButton (기존)
  │    ├── leftContent:
  │    │    ├── KnockButton (기존)
  │    │    └── TacticButton (새로 생성)
  │    └── children: TurnEndButton (기존)
  │
  ├── TacticPanel (createPortal, 조건부 렌더링)
  │    ├── 헤더: 장수 이름 + "책략" + 닫기 버튼
  │    └── 슬롯 목록: TacticSlotCard × 3
  │         ├── 책략 이름
  │         ├── 유형 아이콘 (현장/사무)
  │         └── Phase 1 안내 텍스트
  │
  └── GeneralStatsPanel (기존, createPortal)
```

### game-core 타입 참조

```typescript
// packages/game-core/src/tactics/types.ts (신규)

/** 책략 ID */
type TacticId = string;

/** 책략 유형 */
type TacticType = 'field' | 'office';

/** 책략 슬롯 상태 */
type TacticSlotStatus = 'available' | 'unavailable' | 'exhausted' | 'coming_soon';

/** 책략 정보 */
interface TacticInfo {
  id: TacticId;
  name: string;
  nameKo: string;
  type: TacticType;
  description: string;
}

/** 책략 슬롯 (장수에게 장착된 책략) */
interface TacticSlot {
  tactic: TacticInfo;
  status: TacticSlotStatus;
  usesRemaining: number;  // Phase 3: 남은 사용 횟수 (1=미사용, 0=소진)
}
```

### 기존 ActionType 활용

game-core의 `state/types.ts`에 이미 `ActionType = 'move' | 'attack' | 'tactic' | 'knock' | 'deploy'`가 정의되어 있어, 'tactic' 타입은 Phase 3에서 바로 활용할 수 있습니다.

### 비주얼 디자인 참고

기존 색상 팔레트 유지:
- 책략 버튼 배경: `#4a3f6b` (보라색 계열, 책략/마법 느낌)
- 책략 버튼 텍스트: `#ffd700` (금색)
- 패널 배경: `#1f2937` (gray-800, 기존 패턴)
- 패널 오버레이: `rgba(0, 0, 0, 0.5)`
- 슬롯 배경 (Phase 1): `rgba(255, 255, 255, 0.05)` (거의 투명)
- 슬롯 테두리 (Phase 1): `rgba(255, 255, 255, 0.2)` 점선
- 현장용 아이콘 색상: `#ef4444` (빨간색, 전투/현장)
- 사무용 아이콘 색상: `#3b82f6` (파란색, 전략/사무)
- "준비 중" 텍스트: `rgba(255, 255, 255, 0.4)` (흐린 회색)

### 기존 컴포넌트 재사용/수정 대상

| 컴포넌트 | 액션 |
|---------|------|
| `GameCanvas.tsx` | 수정 (isTacticPanelOpen 상태 추가, TacticButton/TacticPanel 연결, 이벤트 핸들러에 패널 닫기 추가) |
| `GameHUD.tsx` | 수정 가능 (leftContent 영역에 복수 버튼 배치) |
| `TacticButton.tsx` | **새로 생성** |
| `TacticButton.css` | **새로 생성** |
| `TacticPanel.tsx` | **새로 생성** |
| `TacticPanel.css` | **새로 생성** |

### game-core 파일 변경

| 파일 | 액션 |
|------|------|
| `packages/game-core/src/tactics/types.ts` | **새로 생성** (TacticId, TacticType, TacticSlotStatus, TacticInfo, TacticSlot) |
| `packages/game-core/src/tactics/constants.ts` | **새로 생성** (TACTIC_SLOTS_PER_GENERAL, PLACEHOLDER_TACTICS) |
| `packages/game-core/src/tactics/index.ts` | **새로 생성** (모듈 export) |
| `packages/game-core/src/index.ts` | 수정 (tactics 모듈 re-export) |

### Project Structure Notes

- 신규 파일 (game-core): `packages/game-core/src/tactics/types.ts`, `constants.ts`, `index.ts`
- 신규 파일 (web): `apps/web/src/components/game/TacticButton.tsx`, `TacticButton.css`, `TacticPanel.tsx`, `TacticPanel.css`
- 수정 파일: `apps/web/src/components/game/GameCanvas.tsx` (상태 + 이벤트 핸들러 확장)
- 수정 파일: `packages/game-core/src/index.ts` (tactics export 추가)
- 기존 `components/game/` 디렉토리 내 파일 생성 (기존 패턴 유지)

### 테스트 표준

- 테스트 프레임워크: Vitest + React Testing Library
- 테스트 위치: `apps/web/tests/` 디렉토리 (8-1, 8-2, 8-3 패턴 따름)
- 파일명: `tactic-button.test.tsx`, `tactic-panel.test.tsx`
- game-core 테스트: `packages/game-core/tests/tactics.test.ts`
- E2E: Playwright (`npx playwright test`)

### Phase 1 범위 제한

- 로컬 2인 대전 전용 (온라인 동기화 불필요)
- 책략은 플레이스홀더만 표시 (실제 효과 미구현)
- 장수별 고유 책략 장착은 Phase 3 범위
- 책략 실행 시 actionsRemaining 감소는 Phase 3 범위
- 덱 빌딩(장수별 책략 3개 선택) UI는 Phase 3 범위

### 팀 합의 사항 준수 체크리스트

- [ ] game-core에 Phaser 의존성 절대 금지 (tactics 모듈은 순수 TypeScript)
- [ ] 새 상수/타입은 game-core에 먼저 정의 (TacticId, TacticType 등)
- [ ] ARIA 속성 모든 UI 컴포넌트에 적용 (TacticButton, TacticPanel)
- [ ] 터치 타겟 44x44px 이상 (TacticButton, 닫기 버튼)
- [ ] 단일 파일 1,000줄 초과 시 분리 검토 필수
- [ ] 스토리 완료 시 Dev Notes에 학습 내용 기록
- [ ] 스토리 완료 커밋 시 sprint-status.yaml 동시 업데이트 필수
- [ ] 되돌릴 수 없는 사용자 행동에는 확인 모달 필수 (해당 없음 - Phase 1은 읽기 전용)
- [ ] 도메인 용어는 게임 규칙 문서 정의를 정확히 따름 (책략=모의, 현장용=field, 사무용=office)
- [ ] 게임 루프 내 new 사용 금지 (객체 재사용)

### References

- [Source: _bmad-output/epics.md - Epic 8, Story 4 (UI-004)]
- [Source: _bmad-output/gdd.md - Tactics System, Action Economy]
- [Source: docs/project-plan/02-game-rules.md - Section 9 (책략 시스템)]
- [Source: _bmad-output/game-architecture.md - Project Structure, UI Layer]
- [Source: _bmad-output/project-context.md - Phaser+React 통합 규칙]
- [Source: apps/web/src/components/game/GameCanvas.tsx - 게임 캔버스 구조]
- [Source: apps/web/src/components/game/GameHUD.tsx - HUD 컨테이너]
- [Source: apps/web/src/components/game/KnockButton.tsx - 유사 버튼 패턴 참고]
- [Source: packages/game-core/src/state/types.ts - ActionType('tactic' 이미 정의)]
- [Source: packages/game-core/src/constants/game.ts - 게임 상수]
- [Source: _bmad-output/implementation-artifacts/8-3-general-info-panel.md - createPortal 패턴 참고]
- [Source: _bmad-output/implementation-artifacts/epic-6-retro-2026-02-12.md - 팀 합의 사항]

### Implementation Dev Notes (학습 내용)

**구현 완료 일자**: 2026-02-13

**학습 내용:**

1. **game-core tactics 모듈 분리**: tactics/types.ts, constants.ts, index.ts로 모듈을 분리하여 Phase 3 확장 시 해당 디렉토리만 수정하면 되도록 설계. game-core에 Phaser 의존성 없이 순수 TypeScript로 구현 완료.

2. **createPortal 패턴 재사용**: TacticPanel은 GeneralStatsPanel과 동일하게 createPortal로 document.body에 렌더링. z-index 9998로 GeneralStatsPanel(9999)보다 아래에 위치시켜 장수 정보가 항상 최상단에 표시됨.

3. **leftContent 영역 복수 버튼 배치**: GameHUD의 leftContent에 KnockButton과 TacticButton을 flex row로 배치. 기존 GameHUD 컴포넌트 수정 없이 GameCanvas에서 wrapper div로 해결.

4. **이벤트 기반 패널 자동 닫기**: turn:start, general:deselected 이벤트 핸들러에 setIsTacticPanelOpen(false) 추가로 AC8 요구사항 충족. 기존 이벤트 핸들러에 한 줄만 추가하는 최소 변경으로 구현.

5. **Phase 1 플레이스홀더 상수화**: PLACEHOLDER_TACTICS와 PLACEHOLDER_TACTIC_SLOTS를 game-core에 상수로 정의. Phase 3에서 실제 데이터로 교체 시 이 상수만 수정하면 됨.

6. **접근성 패턴 일관성**: role="dialog", aria-modal="true", 포커스 트랩, ESC 닫기 등 SurrenderConfirmModal과 유사한 모달 접근성 패턴 적용. 슬롯에 role="button" + aria-disabled="true"로 Phase 1 비활성 상태 명시.

7. **테스트 구조**: game-core 타입/상수 테스트(17개) + TacticButton 테스트(11개) + TacticPanel 테스트(22개) = 총 50개 테스트 작성. 기존 540+97개 테스트와 함께 전체 회귀 없음 확인.

**팀 합의 사항 준수 확인:**
- [x] game-core에 Phaser 의존성 절대 금지
- [x] 새 상수/타입은 game-core에 먼저 정의
- [x] ARIA 속성 모든 UI 컴포넌트에 적용
- [x] 터치 타겟 44x44px 이상
- [x] 단일 파일 1,000줄 미초과
- [x] 스토리 완료 시 Dev Notes에 학습 내용 기록
- [x] sprint-status.yaml 동시 업데이트
- [x] 게임 루프 내 new 사용 금지 (객체 재사용)
- [x] 도메인 용어는 게임 규칙 문서 정의를 정확히 따름
