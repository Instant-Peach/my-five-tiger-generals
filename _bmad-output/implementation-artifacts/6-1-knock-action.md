# Story 6.1: 노크 행동 (Knock Action)

Status: dev-complete

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 내 장수가 상대방의 끝 구역(home)에 도달했을 때 노크 행동을 수행할 수 있다,
so that 노크 승리 조건을 향해 진행할 수 있고 게임의 핵심 승리 메커니즘을 활용할 수 있다.

## Acceptance Criteria

1. **AC1**: 노크 가능 조건 판정 (game-core)
   - 장수가 상대의 home 구역에 위치해야 노크 가능
     - player1 장수: player2_home (row 0, 타일 0-4)에 있을 때
     - player2 장수: player1_home (row 5, 타일 25-29)에 있을 때
   - 장수가 active 상태여야 함
   - 현재 플레이어의 장수여야 함
   - 동일 장수 동일 행동 제한 적용 (같은 장수가 같은 턴에 노크를 2번 수행 불가)
   - 행동력(actionsRemaining)이 1 이상이어야 함
   - 측면 타일(30-33)에서는 노크 불가

2. **AC2**: 노크 행동 실행 (game-core)
   - 노크 실행 시 1 행동 소모 (actionsRemaining 1 감소)
   - performedActions에 { generalId, actionType: 'knock' } 기록
   - 해당 플레이어의 knockCount 1 증가 (게임 전체 누적값, 리셋 없음)
   - 노크 후 해당 장수는 퇴각 처리 (status: 'out', position: null, troops: 0)
   - GameState에 knockCount 추가 (player1KnockCount, player2KnockCount)
   - 순수 함수로 구현 (불변 상태 반환)

3. **AC3**: 노크 카운트 상태 관리 (game-core)
   - GameState에 player1KnockCount, player2KnockCount 필드 추가 (초기값 0)
   - 노크 성공 시 해당 플레이어 카운트 증가
   - 노크 카운트는 게임 전체 누적값 (리셋 없음, "목숨" 개념)

4. **AC4**: 노크 이벤트 발행 (game-core/game-renderer)
   - 'knock:success' 이벤트 발행: { playerId, generalId, knockCount, tileId }
   - 이벤트는 GameScene에서 발행 (기존 이벤트 패턴과 동일)

5. **AC5**: 노크 버튼 UI (apps/web)
   - 장수가 상대 home에 위치할 때 노크 버튼 표시
   - 노크 불가 조건이면 버튼 비활성화 또는 숨김
   - 노크 실행 시 시각적 피드백 (기존 전투 피드백 패턴 재사용)
   - 현재 노크 카운트 표시 (예: "노크 1/3", "노크 2/3")

6. **AC6**: 노크 시각 피드백 (game-renderer + apps/web)
   - 노크 실행 시 해당 타일에 이펙트 표시
   - 노크 카운트 변경 시 UI 업데이트
   - 'knock:success' 이벤트 수신 시 React UI 동기화

7. **AC7**: 테스트 및 검증
   - canKnock() 함수 단위 테스트 (조건별 true/false)
   - executeKnock() 함수 단위 테스트 (상태 변경 검증)
   - 노크 카운트 증가 검증
   - 행동력 소모 검증
   - 동일 장수 동일 행동 제한 검증
   - 빌드 성공 확인 (`pnpm build`)
   - 타입 체크 통과 확인 (`pnpm typecheck`)
   - 기존 테스트 통과 확인 (`pnpm test`)

## Tasks / Subtasks

- [x] Task 1: GameState 확장 - 노크 카운트 필드 추가 (AC: 2, 3)
  - [x] 1.1: GameState 인터페이스에 player1KnockCount, player2KnockCount 추가
    - packages/game-core/src/state/types.ts 수정
    - 타입: number, 초기값: 0
  - [x] 1.2: createInitialGameState()에 knockCount 초기값 추가
    - packages/game-core/src/state/initialState.ts 수정
    - player1KnockCount: 0, player2KnockCount: 0

- [x] Task 2: 노크 유효성 검증 함수 구현 (AC: 1)
  - [x] 2.1: canKnock() 함수 구현
    - packages/game-core/src/victory/knock.ts 신규 생성
    - 파라미터: (state: GameState, generalId: GeneralId) => boolean
    - 조건: active 상태, 현재 플레이어 소유, 상대 home 구역 위치, 행동력 있음, 동일 행동 미수행
  - [x] 2.2: getKnockTargetZone() 헬퍼 함수
    - player1 → 'player2_home', player2 → 'player1_home' 반환
    - TILE_META를 사용하여 타일의 zone 확인
  - [x] 2.3: validateKnock() Result 타입 반환 함수
    - canKnock의 세부 에러 메시지 포함 Result<void> 반환

- [x] Task 3: 노크 실행 함수 구현 (AC: 2, 3)
  - [x] 3.1: executeKnock() 함수 구현
    - packages/game-core/src/victory/knock.ts에 추가
    - 파라미터: (state: GameState, generalId: GeneralId) => Result<ExecuteKnockData>
    - 검증 → knockCount 증가 → 행동력 소모 → performedActions 기록
  - [x] 3.2: ExecuteKnockData 타입 정의
    - { state: GameState; knockCount: number; playerId: PlayerId }
  - [x] 3.3: GameErrorCode에 노크 관련 에러 코드 추가
    - 'NOT_IN_KNOCK_ZONE', 'KNOCK_NOT_AVAILABLE' 등

- [x] Task 4: victory 모듈 생성 및 export 연결 (AC: 1, 2)
  - [x] 4.1: packages/game-core/src/victory/index.ts 생성
    - knock.ts에서 export
  - [x] 4.2: packages/game-core/src/index.ts에 victory 모듈 추가
    - `export * from './victory';`

- [x] Task 5: GameScene 노크 행동 통합 (AC: 4, 6)
  - [x] 5.1: GameScene에 handleKnock() 메서드 추가
    - 선택된 장수로 executeKnock() 호출
    - 성공 시 gameState 업데이트
    - 'knock:success' 이벤트 발행 (this.events.emit)
    - 장수 렌더링 업데이트
  - [x] 5.2: GameScene에서 노크 가능 여부를 React에 전달
    - 장수 선택 시 canKnock() 결과를 이벤트로 전달
    - 'knock:availability' 별도 이벤트로 knockAvailable 정보 전달

- [x] Task 6: 노크 버튼 UI 구현 (AC: 5, 6)
  - [x] 6.1: KnockButton 컴포넌트 생성
    - apps/web/src/components/game/KnockButton.tsx 신규
    - apps/web/src/components/game/KnockButton.css 신규
    - props: { isVisible, isEnabled, knockCount, maxKnockCount, onKnock }
  - [x] 6.2: 노크 카운트 표시
    - "노크 {count}/3" 텍스트 표시
    - 카운트 증가 시 시각적 강조 (펄스 애니메이션)
  - [x] 6.3: GameCanvas/GameHUD에 KnockButton 통합
    - 'knock:success' 이벤트 리스너 추가
    - knockAvailable 상태 관리
    - 노크 카운트 상태 관리

- [x] Task 7: 노크 이펙트 구현 (AC: 6)
  - [x] 7.1: 노크 시각 이펙트
    - 기존 AttackEffect 패턴 재사용 (sun 방향 = 골드 컬러)
    - 노크한 타일에 임팩트 이펙트 + 타일 플래시 표시
    - 색상: 황금색 (GDD의 승리/중요 정보 컬러)

- [x] Task 8: 단위 테스트 작성 (AC: 7)
  - [x] 8.1: knock.test.ts 생성
    - packages/game-core/tests/victory/knock.test.ts
    - canKnock() 테스트: 상대 home에 있을 때 true, 자기 home에 있을 때 false
    - canKnock() 테스트: 중앙/측면 타일에서 false
    - canKnock() 테스트: 행동력 0일 때 false
    - canKnock() 테스트: 동일 행동 이미 수행 시 false
    - canKnock() 테스트: 상대 장수로는 노크 불가
    - canKnock() 테스트: OUT 상태 장수 노크 불가
    - executeKnock() 테스트: knockCount 증가 확인
    - executeKnock() 테스트: 행동력 소모 확인
    - executeKnock() 테스트: performedActions 기록 확인
    - executeKnock() 테스트: 유효성 검증 실패 시 에러 반환

- [x] Task 9: 빌드 및 검증 (AC: 7)
  - [x] 9.1: 빌드 성공 확인 (`pnpm build`)
  - [x] 9.2: 타입 체크 통과 확인 (`pnpm typecheck`)
  - [x] 9.3: 기존 테스트 통과 확인 (`pnpm test`) - 520 tests all passed
  - [ ] 9.4: 브라우저 수동 테스트
    - 장수를 상대 home으로 이동 후 노크 버튼 표시 확인
    - 노크 실행 시 카운트 증가 확인
    - 행동력 소모 확인
    - 동일 장수 재노크 불가 확인

## Dev Notes

### 아키텍처 준수 사항

**packages/game-core (순수 로직) - 핵심 작업 영역**
- victory/knock.ts: canKnock(), validateKnock(), executeKnock() 구현
- victory/index.ts: 모듈 export
- state/types.ts: GameState에 knockCount 필드 추가, GameErrorCode 확장
- state/initialState.ts: 초기값 추가
- Phaser 의존성 절대 금지 - 순수 TypeScript만

**packages/game-renderer (Phaser)**
- GameScene.ts: handleKnock() 메서드, 이벤트 발행
- 노크 이펙트: 기존 AttackEffect 패턴 재사용/확장

**apps/web (React UI)**
- KnockButton.tsx: 노크 버튼 컴포넌트
- KnockButton.css: 스타일
- GameCanvas.tsx 또는 GameHUD.tsx: 통합

### 핵심 구현 패턴

#### 1. 노크 대상 구역 판정

```typescript
// packages/game-core/src/victory/knock.ts

import { getTileMeta } from '../board/tileMeta';
import type { PlayerId } from '../generals/types';
import type { TileId, TileZone } from '../board/types';

/**
 * 플레이어의 노크 대상 구역 반환
 * player1은 player2_home에서 노크, player2는 player1_home에서 노크
 */
export function getKnockTargetZone(playerId: PlayerId): TileZone {
  return playerId === 'player1' ? 'player2_home' : 'player1_home';
}

/**
 * 타일이 해당 플레이어의 노크 대상 구역인지 확인
 */
export function isInKnockZone(tileId: TileId, playerId: PlayerId): boolean {
  const meta = getTileMeta(tileId);
  if (!meta) return false;
  return meta.zone === getKnockTargetZone(playerId);
}
```

#### 2. 노크 유효성 검증

```typescript
// packages/game-core/src/victory/knock.ts

export function canKnock(state: GameState, generalId: GeneralId): boolean {
  const general = state.generals.find(g => g.id === generalId);
  if (!general) return false;
  if (general.status !== 'active') return false;
  if (general.owner !== state.currentPlayer) return false;
  if (general.position === null) return false;
  if (state.actionsRemaining <= 0) return false;

  // 동일 장수 동일 행동 제한
  const alreadyKnocked = state.performedActions.some(
    a => a.generalId === generalId && a.actionType === 'knock'
  );
  if (alreadyKnocked) return false;

  // 상대 home 구역 확인
  return isInKnockZone(general.position, general.owner);
}
```

#### 3. 노크 실행

```typescript
// packages/game-core/src/victory/knock.ts

export interface ExecuteKnockData {
  state: GameState;
  knockCount: number;
  playerId: PlayerId;
}

export function executeKnock(
  state: GameState,
  generalId: GeneralId
): Result<ExecuteKnockData> {
  // 1. 유효성 검증
  const validation = validateKnock(state, generalId);
  if (!validation.success) return validation;

  const general = state.generals.find(g => g.id === generalId)!;
  const playerId = general.owner;

  // 2. 노크 카운트 증가
  const knockCountKey = playerId === 'player1' ? 'player1KnockCount' : 'player2KnockCount';
  const newKnockCount = state[knockCountKey] + 1;

  // 3. 행동 기록
  const newPerformedAction: PerformedAction = {
    generalId,
    actionType: 'knock',
  };

  return {
    success: true,
    data: {
      state: {
        ...state,
        [knockCountKey]: newKnockCount,
        actionsRemaining: state.actionsRemaining - 1,
        performedActions: [...state.performedActions, newPerformedAction],
      },
      knockCount: newKnockCount,
      playerId,
    },
  };
}
```

#### 4. GameState 확장

```typescript
// packages/game-core/src/state/types.ts (수정)

export interface GameState {
  // ... 기존 필드
  /** Player 1의 노크 카운트 (0-3) */
  player1KnockCount: number;
  /** Player 2의 노크 카운트 (0-3) */
  player2KnockCount: number;
}

// GameErrorCode 확장
export type GameErrorCode =
  | // ... 기존 에러 코드
  | 'NOT_IN_KNOCK_ZONE'
  | 'KNOCK_NOT_AVAILABLE';
```

#### 5. KnockButton 컴포넌트

```typescript
// apps/web/src/components/game/KnockButton.tsx

interface KnockButtonProps {
  isVisible: boolean;
  isEnabled: boolean;
  knockCount: number;
  maxKnockCount: number;
  onKnock: () => void;
}

export function KnockButton({
  isVisible, isEnabled, knockCount, maxKnockCount, onKnock
}: KnockButtonProps) {
  if (!isVisible) return null;

  return (
    <button
      className={`knock-button ${isEnabled ? '' : 'disabled'}`}
      onClick={isEnabled ? onKnock : undefined}
      disabled={!isEnabled}
      aria-label={`노크 ${knockCount}/${maxKnockCount}`}
    >
      <span className="knock-icon">&#x1F6AA;</span>
      <span className="knock-text">노크</span>
      <span className="knock-count">{knockCount}/{maxKnockCount}</span>
    </button>
  );
}
```

### 이전 스토리 학습 사항

**Story 5-4 (타이머 자동 종료) - 직전 스토리:**
- isEndingTurn 플래그로 동시 처리 방지 패턴
- React-Phaser 이벤트 브릿지 패턴 (gameEvents.on/off)
- AutoEndToast 토스트 패턴 (fade in/out, 자동 숨김)
- GameCanvas에서 이벤트 리스너 등록/해제 생명주기

**Story 4-1 (인접 공격) - 공격 실행 패턴:**
- executeAttack() 패턴: 검증 → 실행 → 상태 반환
- canAttack() + validateAttack() + executeAttack() 3단계 패턴
- Result<ExecuteAttackData> 반환 패턴
- performedActions 기록 패턴

**Story 4-5 (장수 OUT 처리):**
- OUT 상태 장수의 position = null 처리
- general.status === 'out' 체크 패턴

**Story 5-1 (턴 종료 버튼):**
- TurnEndButton UI 컴포넌트 패턴
- executeEndTurn() 호출 패턴
- GameHUD 레이아웃에 버튼 배치

**Story 3-2 (장수 이동):**
- moveGeneral() 패턴: 검증 → 위치 업데이트 → 행동 기록
- 이동 후 상태 업데이트 패턴

### Git 최근 커밋 분석

**5-4 커밋 (949cd52):**
- GameScene에 handleTimerExpired(), isEndingTurn 추가
- AutoEndToast.tsx/css 생성
- GameCanvas.tsx에 이벤트 리스너 추가

**5-1 커밋 (8ed701d):**
- TurnEndButton.tsx/css 생성
- GameHUD.tsx에 버튼 배치
- executeEndTurn() 패턴 정립

**4-6 커밋 (aa92245):**
- DamageFloater, AttackEffect 생성
- 전투 시각 피드백 시스템
- 사운드 재생 패턴

### Project Structure Notes

**신규 파일:**

```
packages/game-core/src/victory/
├── knock.ts                        # 신규: 노크 로직 (canKnock, executeKnock)
└── index.ts                        # 신규: victory 모듈 export

packages/game-core/tests/victory/
└── knock.test.ts                   # 신규: 노크 단위 테스트

apps/web/src/components/game/
├── KnockButton.tsx                 # 신규: 노크 버튼 컴포넌트
└── KnockButton.css                 # 신규: 노크 버튼 스타일
```

**수정 파일:**

```
packages/game-core/src/state/
├── types.ts                        # 수정: GameState knockCount 추가, GameErrorCode 확장
└── initialState.ts                 # 수정: knockCount 초기값 추가

packages/game-core/src/index.ts     # 수정: victory 모듈 export 추가

packages/game-renderer/src/scenes/
└── GameScene.ts                    # 수정: handleKnock(), 이벤트 발행

apps/web/src/components/game/
├── GameCanvas.tsx                  # 수정: 노크 이벤트 리스너, 상태 관리
└── GameHUD.tsx                     # 수정: KnockButton 통합
```

### 아키텍처 경계

```
┌─────────────────────────────────────────┐
│           apps/web (React)              │
│  - KnockButton: 노크 UI 컴포넌트       │
│  - GameCanvas: 노크 이벤트 리스너       │
│  - GameHUD: KnockButton 배치           │
│  - 'knock:success' 이벤트 수신          │
└─────────────────────────────────────────┘
                    ▲
                    │ 'knock:success' 이벤트
                    │
┌─────────────────────────────────────────┐
│      packages/game-renderer             │
│  - GameScene: handleKnock()             │
│  - executeKnock() 호출 및 상태 업데이트 │
│  - 'knock:success' 이벤트 발행          │
│  - 노크 이펙트 표시                     │
└─────────────────────────────────────────┘
                    │
                    │ import
                    ▼
┌─────────────────────────────────────────┐
│        packages/game-core               │
│  - victory/knock.ts: 순수 노크 로직    │
│  - canKnock(), executeKnock()           │
│  - state/types.ts: knockCount 타입     │
│  - Phaser 의존성 없음                   │
└─────────────────────────────────────────┘
```

### UI/UX 가이드라인

**노크 버튼:**
- 위치: GameHUD 하단 (TurnEndButton 근처, 또는 장수 선택 시 동적 표시)
- 색상: 황금색 배경 (#D4A017 또는 유사) - GDD의 중요 정보/승리 컬러
- 아이콘: 문 두드리기 아이콘 또는 주먹 아이콘
- 텍스트: "노크" + 카운트 (예: "노크 1/3")
- 크기: 44x44px 이상 (모바일 접근성)
- 비활성화: 회색 처리 + opacity 감소

**노크 카운트 표시:**
- 큰 숫자로 현재 카운트 표시
- 3단계 시각화: 빈 원 → 채워진 원 (0/3 → 1/3 → 2/3 → 3/3)
- 카운트 증가 시 펄스 애니메이션

**노크 이펙트:**
- 황금색 임팩트 이펙트 (AttackEffect 패턴 재사용)
- 0.5초 정도 표시 후 fade out

**접근성:**
- `role="button"`, `aria-label` 적용
- 노크 불가 상태 시 `aria-disabled="true"`

### 주의사항

1. **GameState 변경의 파급 효과**
   - knockCount 필드 추가 시 기존 테스트의 createInitialGameState() 반환값이 변경됨
   - 기존 테스트에서 스프레드 연산자로 GameState를 생성하는 곳이 있다면 수정 필요
   - 기존 480개+ 테스트가 모두 통과하는지 반드시 확인

2. **노크 카운트 리셋 로직은 Story 6-2에서 구현**
   - 이 스토리에서는 카운트 증가만 구현
   - 장수가 상대 home에서 밀려나도 카운트가 유지됨 (6-2에서 리셋 로직 추가)
   - 단, 데이터 모델은 6-2에서의 리셋을 고려하여 설계

3. **승리 판정은 Story 6-2에서 구현**
   - knockCount가 KNOCK_COUNT_TO_WIN(3)에 도달해도 이 스토리에서는 게임 종료 처리하지 않음
   - 6-2에서 3회 노크 승리 판정 + 카운트 리셋 로직을 함께 구현

4. **GameScene 비대화 주의 (1,555줄)**
   - Epic 5 회고에서 GameScene 분리 필요성 언급됨
   - handleKnock() 추가 시 최소한의 코드만 추가
   - 가능하면 별도 핸들러 함수로 분리하여 GameScene 내 메서드 수 최소화

5. **이벤트 이름 규칙**
   - `{domain}:{action}` 형식 유지: 'knock:success'
   - 아키텍처 문서의 이벤트 패턴 준수

### GDD 관련 요구사항

**노크 메커니즘 (GDD 기반):**
- 상대 끝 구역(End Zone) 도달 필요
- 도달 후 별도의 노크 행동 3회 성공 시 승리
- 노크 중 밀려나면 카운트 리셋
- 노크 = 1 행동 소모

**승리 조건 (GDD 기반):**
- 노크 승리: 상대 끝 구역 도달 후 노크 행동 3회 성공
- KNOCK_COUNT_TO_WIN: 3 (이미 constants/game.ts에 정의됨)

**Zone 정의 (서버/데이터 관점):**
- player1_home: row 5 (타일 25-29) = player2의 노크 목표
- player2_home: row 0 (타일 0-4) = player1의 노크 목표

**Epic 6 Story 1 (epics.md):**
- [WIN-001] 플레이어는 끝 구역에서 노크 행동을 할 수 있다

### 다음 스토리 연결

**Story 6-2: 3회 노크 승리 (Triple Knock Victory)**
- knockCount가 3에 도달하면 승리 처리
- 노크 카운트 리셋 조건 구현 (장수가 상대 home에서 밀려나면 리셋)
- 승리 판정 로직 및 게임 종료 처리

**Story 6-3: 전멸 승리 (Annihilation Victory)**
- 상대 병력 전부 소멸 시 승리

**Story 6-4: 와해 승리 (Collapse Victory)**
- 상대 장수 모두 OUT 시 와해 승리

**Story 6-5: 항복 (Surrender)**
- 플레이어의 항복 선언

### References

- [Source: _bmad-output/epics.md#Epic 6: 승리 조건] - Story [WIN-001] 정의
- [Source: _bmad-output/gdd.md#Win/Loss Conditions] - 노크 승리 조건 상세
- [Source: _bmad-output/gdd.md#Action Economy] - 노크 = 1 행동 소모
- [Source: _bmad-output/gdd.md#Primary Mechanics > 노크] - 노크 메커니즘 상세
- [Source: _bmad-output/game-architecture.md#Board Coordinate System] - 타일 구역 정의
- [Source: _bmad-output/game-architecture.md#Event System] - 이벤트 명명 규칙
- [Source: _bmad-output/game-architecture.md#Error Handling] - Result 패턴
- [Source: _bmad-output/game-architecture.md#Constants] - KNOCK_COUNT_TO_WIN
- [Source: packages/game-core/src/state/types.ts] - GameState, ActionType (knock 이미 정의됨)
- [Source: packages/game-core/src/constants/game.ts] - GAME.KNOCK_COUNT_TO_WIN = 3
- [Source: packages/game-core/src/board/tileMeta.ts] - TILE_META, getTileMeta()
- [Source: packages/game-core/src/board/types.ts] - TileZone 타입
- [Source: packages/game-core/src/combat/attack.ts] - executeAttack() 패턴 참고
- [Source: packages/game-renderer/src/scenes/GameScene.ts] - Scene 구조
- [Source: _bmad-output/implementation-artifacts/epic-5-retro-2026-02-08.md] - Epic 5 회고, 기술 부채

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

### Completion Notes List

- Task 1-4: game-core 순수 로직 구현 완료 (GameState 확장, knock.ts, victory 모듈)
- Task 5: GameScene에 handleKnock(), knock:availability, knock:success 이벤트 통합
- Task 6: KnockButton.tsx/css 생성, GameHUD에 leftContent 지원 추가, GameCanvas에 노크 상태 관리
- Task 7: 기존 AttackEffect의 sun 방향(골드) 재사용하여 노크 이펙트 구현
- Task 8: 40개 단위 테스트 작성 (canKnock, validateKnock, executeKnock, 헬퍼 함수)
- Task 9: pnpm build, pnpm typecheck, pnpm test 모두 통과 (520 tests)
- 기존 테스트 파일 4개에 knockCount 필드 추가 (GameState 인터페이스 변경 반영)

### File List

**신규 파일:**
- packages/game-core/src/victory/knock.ts
- packages/game-core/src/victory/index.ts
- packages/game-core/tests/victory/knock.test.ts
- apps/web/src/components/game/KnockButton.tsx
- apps/web/src/components/game/KnockButton.css

**수정 파일:**
- packages/game-core/src/state/types.ts (GameState에 knockCount 추가, GameErrorCode 확장)
- packages/game-core/src/state/initialState.ts (knockCount 초기값 추가)
- packages/game-core/src/index.ts (victory 모듈 export 추가)
- packages/game-renderer/src/scenes/GameScene.ts (handleKnock, knock 이벤트 발행)
- apps/web/src/components/game/GameCanvas.tsx (노크 상태 관리, 이벤트 리스너)
- apps/web/src/components/game/GameHUD.tsx (leftContent prop 추가)
- packages/game-core/tests/combat.test.ts (knockCount 필드 추가)
- packages/game-core/tests/movement-actions.test.ts (knockCount 필드 추가)
- packages/game-core/tests/movement.test.ts (knockCount 필드 추가)
- packages/game-core/tests/turn-actions.test.ts (knockCount 필드 추가)
- packages/game-core/tests/state.test.ts (knockCount 필드 추가)

## Change Log

- 2026-02-08: Story 6-1 생성 - 노크 행동 (Knock Action) 스토리 컨텍스트 작성 완료
- 2026-02-08: Story 6-1 구현 완료 - 모든 Task(1-9) 구현, 520 tests 통과
