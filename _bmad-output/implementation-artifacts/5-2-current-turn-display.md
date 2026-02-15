# Story 5.2: 현재 턴 표시 (Current Turn Display)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 현재 누구의 턴인지 UI에서 볼 수 있다,
so that 내 행동 차례임을 명확히 알고 전략을 준비할 수 있다.

## Acceptance Criteria

1. **AC1**: 턴 표시 UI 컴포넌트 (apps/web)
   - 게임 HUD 영역에 현재 턴 정보 표시
   - 표시 내용: "Player 1의 턴" 또는 "Player 2의 턴"
   - 위치: 화면 상단 또는 보드 근처 (GameHUD 내부)
   - 텍스트 크기: 읽기 쉬운 적절한 크기 (16px 이상)

2. **AC2**: 플레이어 색상 구분 (apps/web)
   - Player 1: 붉은색 계열 (촉한/유비군 이미지)
   - Player 2: 푸른색 계열 (위/조조군 이미지)
   - 텍스트 색상 또는 배경색으로 현재 플레이어 시각적 구분
   - 색상 외 아이콘/패턴으로 색맹 지원 (접근성)

3. **AC3**: 턴 번호 표시 (선택 사항, apps/web)
   - 현재 턴 번호 표시 (예: "턴 5")
   - 턴 번호는 player2 -> player1 전환 시 증가
   - 게임 진행 상황 파악에 도움

4. **AC4**: 턴 전환 시 UI 업데이트 (apps/web + game-renderer)
   - 'turn:start' 이벤트 수신 시 턴 표시 업데이트
   - 턴 전환 시 시각적 피드백 (색상 변경, 깜빡임 등)
   - 부드러운 전환 애니메이션 (선택 사항)

5. **AC5**: 게임 상태 연동 (apps/web)
   - GameScene에서 턴 정보 React로 전달
   - useGameScene 훅 또는 이벤트 기반 연동 (5-1에서 구현된 패턴 활용)
   - 초기 로드 시 정확한 턴 정보 표시

6. **AC6**: 테스트 및 검증
   - UI 컴포넌트 수동 테스트
   - 턴 전환 시 올바른 업데이트 확인
   - 색상/스타일 변경 확인

## Tasks / Subtasks

- [x] Task 1: 턴 표시 UI 컴포넌트 구현 (AC: 1, 2, 3)
  - [x] 1.1: `TurnIndicator.tsx` 컴포넌트 생성
    - apps/web/src/components/game/TurnIndicator.tsx
    - props: currentPlayer, turn, isMyTurn (로컬 모드)
    - 플레이어별 색상 스타일링
  - [x] 1.2: 색상 및 스타일 정의
    - Player 1: 붉은색 배경/테두리 (#DC2626 계열)
    - Player 2: 푸른색 배경/테두리 (#2563EB 계열)
    - 색맹 지원: 아이콘 또는 패턴 추가
  - [x] 1.3: 턴 번호 표시 추가
    - "턴 {number}" 형식
    - 플레이어 정보와 함께 표시

- [x] Task 2: GameHUD 통합 (AC: 1)
  - [x] 2.1: TurnIndicator를 GameHUD에 배치
    - 화면 상단 중앙 또는 좌측
    - 턴 종료 버튼과 시각적 조화
  - [x] 2.2: 레이아웃 조정
    - 반응형 배치 (모바일/데스크톱)
    - 보드와 겹치지 않는 위치

- [x] Task 3: 턴 상태 연동 (AC: 4, 5)
  - [x] 3.1: useGameScene 훅 확장
    - currentPlayer, turn 상태 관리 (5-1에서 부분 구현됨)
    - 'turn:start' 이벤트 리스너 활용
  - [x] 3.2: 초기 상태 설정
    - 게임 시작 시 player1, turn 1로 초기화
    - GameScene 상태와 동기화
  - [x] 3.3: 턴 전환 피드백
    - 색상 전환 애니메이션 (CSS transition)
    - 선택: 깜빡임 또는 펄스 효과

- [x] Task 4: 빌드 및 검증 (AC: 6)
  - [x] 4.1: 빌드 성공 확인 (`pnpm build`)
  - [x] 4.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [x] 4.3: 기존 테스트 통과 확인 (`pnpm test`)
  - [x] 4.4: 브라우저 수동 테스트
    - 초기 로드 시 "Player 1의 턴" 표시 확인
    - 턴 종료 버튼 클릭 후 "Player 2의 턴" 변경 확인
    - 색상 변경 확인
    - 턴 번호 증가 확인 (player2 -> player1)

## Dev Notes

### 아키텍처 준수 사항

**apps/web (React UI)**
- `components/game/TurnIndicator.tsx`: 신규 턴 표시 컴포넌트
- `components/game/GameHUD.tsx`: TurnIndicator 통합 (5-1에서 생성됨)
- Phaser 이벤트와 React 상태 동기화

**game-renderer 패키지**
- 5-1에서 구현된 'turn:start' 이벤트 활용
- 추가 수정 불필요 (이벤트 이미 발행됨)

**game-core 패키지**
- 수정 불필요 - 순수 로직은 이미 구현됨
- GameState에서 currentPlayer, turn 필드 사용

### 핵심 구현 패턴

#### 1. TurnIndicator 컴포넌트

```typescript
// apps/web/src/components/game/TurnIndicator.tsx

interface TurnIndicatorProps {
  currentPlayer: 'player1' | 'player2';
  turn: number;
}

export function TurnIndicator({ currentPlayer, turn }: TurnIndicatorProps) {
  const isPlayer1 = currentPlayer === 'player1';

  // 플레이어별 색상
  const playerColor = isPlayer1
    ? 'bg-red-600 border-red-700 text-white'    // Player 1: 붉은색
    : 'bg-blue-600 border-blue-700 text-white'; // Player 2: 푸른색

  // 플레이어 이름
  const playerName = isPlayer1 ? 'Player 1' : 'Player 2';

  return (
    <div className={`
      px-4 py-2 rounded-lg border-2
      font-bold text-center
      transition-all duration-300
      ${playerColor}
    `}>
      <div className="text-sm opacity-80">턴 {turn}</div>
      <div className="text-lg">{playerName}의 턴</div>
    </div>
  );
}
```

#### 2. 색맹 지원 패턴

```typescript
// 색상 외 시각적 구분 추가
const playerIcon = isPlayer1 ? '🔴' : '🔵'; // 아이콘
const playerPattern = isPlayer1 ? 'border-dashed' : 'border-solid'; // 패턴

// 또는 SVG 아이콘 사용
<div className="flex items-center gap-2">
  {isPlayer1 ? <RedSquareIcon /> : <BlueCircleIcon />}
  <span>{playerName}의 턴</span>
</div>
```

#### 3. GameHUD 통합

```typescript
// apps/web/src/components/game/GameHUD.tsx (수정)

import { TurnIndicator } from './TurnIndicator';
import { TurnEndButton } from './TurnEndButton';

interface GameHUDProps {
  currentPlayer: 'player1' | 'player2';
  turn: number;
  onEndTurn: () => void;
  isMyTurn: boolean;
  isGameEnded: boolean;
}

export function GameHUD({
  currentPlayer,
  turn,
  onEndTurn,
  isMyTurn,
  isGameEnded,
}: GameHUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 상단: 턴 표시 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <TurnIndicator currentPlayer={currentPlayer} turn={turn} />
      </div>

      {/* 하단 우측: 턴 종료 버튼 */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <TurnEndButton
          onEndTurn={onEndTurn}
          isMyTurn={isMyTurn}
          isGameEnded={isGameEnded}
        />
      </div>
    </div>
  );
}
```

#### 4. 턴 전환 애니메이션

```css
/* 턴 전환 시 펄스 효과 */
@keyframes turn-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.turn-transition {
  animation: turn-pulse 0.3s ease-in-out;
}
```

```typescript
// React에서 애니메이션 트리거
const [isTransitioning, setIsTransitioning] = useState(false);

useEffect(() => {
  setIsTransitioning(true);
  const timer = setTimeout(() => setIsTransitioning(false), 300);
  return () => clearTimeout(timer);
}, [currentPlayer]);

return (
  <div className={isTransitioning ? 'turn-transition' : ''}>
    {/* ... */}
  </div>
);
```

### 이전 스토리 학습 사항

**Story 5-1 (턴 종료 버튼):**
- GameHUD.tsx 컴포넌트 생성됨 - 여기에 TurnIndicator 추가
- useGameScene 훅 구현됨 - currentPlayer, turn 상태 관리
- 'turn:start' 이벤트 리스너 패턴 - 동일 패턴 활용
- TurnEndButton 스타일링 참고 - 일관된 UI 스타일

**Epic 4 (전투 시스템):**
- 시각적 피드백 패턴 (색상, 애니메이션)
- React-Phaser 이벤트 연동

### Project Structure Notes

**신규 파일:**

```
apps/web/src/components/game/
└── TurnIndicator.tsx          # 신규: 턴 표시 컴포넌트
```

**수정 파일:**

```
apps/web/src/components/game/
└── GameHUD.tsx                # 수정: TurnIndicator 통합

apps/web/src/components/game/
└── GameCanvas.tsx             # 수정: TurnIndicator props 전달 (필요시)
```

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  ✅ UI 영역                              │
│  - TurnIndicator: 턴 정보 렌더링         │
│  - GameHUD: 레이아웃 관리                │
│  - useGameScene: 상태 동기화 (5-1)       │
└─────────────────────────────────────────┘
                    ▲
                    │ 'turn:start' 이벤트
                    │
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  ✅ 이미 구현됨 (5-1)                    │
│  - GameScene: turn:start 이벤트 발행     │
│  - 추가 수정 불필요                      │
└─────────────────────────────────────────┘
                    │
                    │ gameState.currentPlayer, gameState.turn
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  ✅ 이미 구현됨                          │
│  - GameState.currentPlayer              │
│  - GameState.turn                       │
│  - endTurn() 함수                       │
└─────────────────────────────────────────┘
```

### UI/UX 가이드라인

**턴 표시 스타일:**
- Player 1: 붉은색 (#DC2626) - 촉한/유비군
- Player 2: 푸른색 (#2563EB) - 위/조조군
- 배경: 반투명 또는 진한 색상
- 텍스트: 흰색, 볼드
- 모서리: 둥근 모서리 (8px)

**위치:**
- 화면 상단 중앙
- 보드와 겹치지 않음
- 모바일/데스크톱 동일 위치

**반응형:**
- 모바일: 약간 작은 폰트
- 데스크톱: 기본 크기

**접근성:**
- 색상 외 구분 요소 (아이콘, 패턴)
- 충분한 대비 비율
- 텍스트로 명확한 정보 전달

### 주의사항

1. **5-1 패턴 재사용**
   - useGameScene 훅에서 currentPlayer, turn 이미 관리됨
   - 새로운 상태 관리 로직 추가 불필요

2. **색상 일관성**
   - GDD에 정의된 색상 사용 (플레이어 1: 붉은색, 플레이어 2: 푸른색)
   - TailwindCSS 색상 클래스 활용

3. **턴 번호 증가 규칙**
   - game-core의 endTurn() 함수에서 처리됨
   - player2 -> player1 전환 시 turn 증가
   - UI는 단순히 표시만

4. **Phase 1 로컬 모드**
   - 두 플레이어가 같은 화면 사용
   - 턴 표시로 현재 차례 명확히 전달

### GDD 관련 요구사항

**턴 관리 시스템 (GDD 기반):**
- 1:1 교대 턴 방식 (Player A -> Player B)
- 턴당 60초 제한 (5-3에서 구현)
- 현재 턴 표시 UI 필수

**색상 팔레트 (GDD 기반):**
- 플레이어 1: 붉은색 계열 (촉한/유비군 이미지)
- 플레이어 2: 푸른색 계열 (위/조조군 이미지)

### 다음 스토리 연결

**Epic 5: 턴 관리**
- Story 5-3: 60초 타이머 (Turn Timer)
- Story 5-4: 타이머 자동 종료 (Auto End Turn)

**연결 고려:**
- 5-3에서 타이머 표시 추가 시 TurnIndicator 또는 GameHUD 확장
- 턴 전환 시 타이머 리셋 로직

### References

- [Source: _bmad-output/epics.md#Epic 5: 턴 관리] - Story [TURN-002] 정의
- [Source: _bmad-output/gdd.md#Turn Structure] - 1:1 교대 턴 방식
- [Source: _bmad-output/gdd.md#Color Palette] - 플레이어별 색상 정의
- [Source: _bmad-output/game-architecture.md#턴 관리] - 턴 관리 시스템 위치
- [Source: _bmad-output/game-architecture.md#Event System] - 이벤트 명명 규칙
- [Source: _bmad-output/implementation-artifacts/5-1-turn-end-button.md] - 이전 스토리 패턴
- [Source: _bmad-output/project-context.md#Code Organization Rules] - 파일 명명 규칙
- [Source: packages/game-core/src/state/types.ts] - GameState 타입 정의

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- pnpm typecheck: 모든 패키지 타입 체크 통과
- pnpm test: game-core 409 tests, game-renderer 38 tests 통과
- pnpm build: 빌드 성공

### Completion Notes List

1. **TurnIndicator 컴포넌트 구현 완료**
   - TurnIndicator.tsx: 현재 턴 정보 표시 컴포넌트
   - TurnIndicator.css: 플레이어별 색상 스타일링 (Player 1: 붉은색, Player 2: 푸른색)
   - 색맹 지원: 이모지 아이콘(🔴/🔵) 및 테두리 패턴(solid/dashed)으로 구분
   - 턴 전환 시 펄스 애니메이션 (turn-pulse keyframes)
   - 반응형 스타일링 (모바일/데스크톱)

2. **GameHUD 확장 완료**
   - topContent prop 추가하여 상단 중앙에 TurnIndicator 배치
   - children prop은 하단 우측에 TurnEndButton 배치 (기존 유지)
   - 전체 영역 오버레이로 레이아웃 변경

3. **GameCanvas 통합 완료**
   - TurnIndicator 컴포넌트 import 및 GameHUD에 연결
   - 5-1에서 구현된 turnState (currentPlayer, turn) 활용
   - 'turn:start' 이벤트 리스너로 턴 전환 시 UI 업데이트

4. **검증 완료**
   - TypeScript 타입 체크 통과
   - 모든 기존 테스트 통과 (447 tests)
   - 프로덕션 빌드 성공

### File List

**신규 파일:**
- apps/web/src/components/game/TurnIndicator.tsx
- apps/web/src/components/game/TurnIndicator.css

**수정 파일:**
- apps/web/src/components/game/GameHUD.tsx
- apps/web/src/components/game/GameCanvas.tsx

### Change Log

- 2026-02-06: Story 5-2 현재 턴 표시 (Current Turn Display) 구현 완료
