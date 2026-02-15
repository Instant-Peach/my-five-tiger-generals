# Story 2.5: 병력 시각적 표시 (Troop Visual Display)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,
I want 장수의 현재 병력이 시각적으로 표시된다,
so that 전투 중 각 장수의 전투력 상태를 즉시 파악할 수 있다.

## Acceptance Criteria

1. **AC1**: 보드 위 장수 토큰에 현재 병력 수가 표시된다
   - 장수 토큰 내부 또는 하단에 숫자로 병력 표시
   - 병력 수는 실시간으로 업데이트됨
   - 최대 병력(별 스탯)과 현재 병력 구분 가능

2. **AC2**: 병력 상태에 따른 시각적 피드백이 제공된다
   - 만병력(troops === star): 기본 상태
   - 중간 병력(50% 이상): 노란색 경고 표시
   - 저병력(50% 미만): 빨간색 위험 표시
   - 병력 0 (OUT): 회색 처리 또는 OUT 표시

3. **AC3**: 스탯 패널에서 병력 정보가 상세하게 표시된다
   - 현재 병력 / 최대 병력 (예: "3/5")
   - 병력 바(Progress Bar) 또는 게이지 형태로 시각화
   - Story 2-3에서 구현된 GeneralStatsPanel 활용

4. **AC4**: 병력 변화 시 애니메이션 피드백이 제공된다
   - 병력 증가: 초록색 플래시 또는 숫자 증가 애니메이션
   - 병력 감소: 빨간색 플래시 또는 숫자 감소 애니메이션
   - 부드러운 전환으로 UX 개선

5. **AC5**: 접근성을 위한 대체 표시가 제공된다
   - 숫자와 색상 외에 아이콘 또는 패턴 표시
   - 스크린 리더를 위한 aria-label 제공
   - 색맹 사용자를 위한 추가 구분 요소

## Tasks / Subtasks

- [x] Task 1: 병력 표시 UI 컴포넌트 구현 (AC: 1, 2)
  - [x] 1.1: `TroopIndicator` Phaser 클래스 구현
    - `packages/game-renderer/src/rendering/TroopIndicator.ts` 생성
    - 병력 숫자 텍스트 렌더링
    - 병력 상태별 색상 적용 (기본/경고/위험/OUT)
    - 배경 원형 또는 배지 스타일
  - [x] 1.2: `GeneralRenderer`에 TroopIndicator 통합
    - `renderGeneral()`에서 TroopIndicator 추가
    - 장수 토큰 하단 중앙에 배치
    - 병력 업데이트 메서드 연결

- [x] Task 2: 병력 상태 로직 구현 (AC: 2)
  - [x] 2.1: `packages/game-core/src/generals/troops.ts` 생성
    - `getTroopStatus()` 함수 구현
    - TroopStatus 타입 정의: 'full' | 'warning' | 'danger' | 'out'
    - 임계값 상수 정의 (WARNING_THRESHOLD: 0.5)
  - [x] 2.2: 병력 상태 색상 상수 정의
    - `packages/game-core/src/constants/troops.ts` 생성
    - TROOP_COLORS 정의 (full, warning, danger, out)

- [x] Task 3: 스탯 패널 병력 표시 개선 (AC: 3)
  - [x] 3.1: `GeneralStatsPanel.tsx` 수정
    - TroopBar 컴포넌트 추가 (Progress Bar 형태)
    - 현재/최대 병력 텍스트 표시
    - 병력 상태별 색상 적용
  - [x] 3.2: 병력 바 스타일링
    - TailwindCSS 클래스 활용
    - 반응형 너비 조정
    - 접근성 aria-valuenow, aria-valuemax 속성

- [x] Task 4: 병력 변화 애니메이션 (AC: 4)
  - [x] 4.1: TroopIndicator 애니메이션 구현
    - 병력 증가: scale up + 초록색 플래시
    - 병력 감소: shake + 빨간색 플래시
    - Phaser Tween 사용
  - [x] 4.2: updateTroops() 메서드 개선
    - 이전 값과 비교하여 증감 판단
    - 적절한 애니메이션 트리거
    - 애니메이션 완료 후 최종 값 반영

- [x] Task 5: 접근성 구현 (AC: 5)
  - [x] 5.1: 색맹 지원 패턴 추가
    - 병력 상태별 아이콘 또는 패턴
    - 예: warning = ⚠, danger = !, out = ✕
  - [x] 5.2: 스크린 리더 지원
    - GeneralStatsPanel에 aria-label 추가
    - 병력 바에 role="progressbar" 속성
    - 상태 변화 시 aria-live="polite" 알림

- [x] Task 6: 이벤트 시스템 연동 (AC: 1, 4)
  - [x] 6.1: 병력 변화 이벤트 정의
    - `general:troops-changed` 이벤트 타입 추가 (GameEventPayloads)
    - 페이로드: { generalId, previousTroops, currentTroops, maxTroops }
  - [~] 6.2: GameScene에서 이벤트 처리
    - 이벤트 타입 정의 완료
    - 실제 이벤트 발행은 Epic 4 (전투 시스템)에서 구현 예정

- [x] Task 7: 테스트 및 검증 (AC: 전체)
  - [x] 7.1: Vitest 단위 테스트
    - getTroopStatus() 함수 테스트
    - TROOP_COLORS 상수 검증
    - 임계값 경계 케이스 테스트
  - [x] 7.2: 통합 테스트
    - 빌드 성공 확인 (pnpm build)
    - 261 테스트 통과

## Dev Notes

### 아키텍처 준수 사항

**game-core 패키지 (순수 TypeScript - Phaser 의존성 금지)**
- 병력 상태 로직: `packages/game-core/src/generals/troops.ts`
- 병력 색상 상수: `packages/game-core/src/constants/troops.ts`
- TroopStatus 타입, 임계값 상수 정의
- Phaser 특정 코드 사용 금지

**game-renderer 패키지 (Phaser 렌더링)**
- TroopIndicator 클래스: `packages/game-renderer/src/rendering/TroopIndicator.ts`
- GeneralRenderer에서 TroopIndicator 인스턴스 관리
- Phaser Graphics, Text, Tween 사용

**apps/web (React UI)**
- GeneralStatsPanel에 TroopBar 추가
- Zustand 스토어로 병력 상태 동기화
- TailwindCSS + aria 속성 활용

### 핵심 구현 패턴

#### 1. 병력 상태 로직

```typescript
// packages/game-core/src/generals/troops.ts

import type { General } from './types';

/** 병력 상태 */
export type TroopStatus = 'full' | 'warning' | 'danger' | 'out';

/** 병력 상태 임계값 */
export const TROOP_THRESHOLDS = {
  WARNING: 0.5,  // 50% 이하일 때 경고
} as const;

/**
 * 장수의 병력 상태 판정
 * @param troops - 현재 병력
 * @param maxTroops - 최대 병력 (별 스탯)
 */
export function getTroopStatus(troops: number, maxTroops: number): TroopStatus {
  if (troops <= 0) return 'out';
  if (troops >= maxTroops) return 'full';

  const ratio = troops / maxTroops;
  if (ratio < TROOP_THRESHOLDS.WARNING) return 'danger';
  return 'warning';
}

/**
 * 병력 비율 계산
 */
export function getTroopRatio(troops: number, maxTroops: number): number {
  return maxTroops > 0 ? troops / maxTroops : 0;
}
```

#### 2. 병력 색상 상수

```typescript
// packages/game-core/src/constants/troops.ts

import type { TroopStatus } from '../generals/troops';

/** 병력 상태별 색상 */
export interface TroopColorSet {
  primary: string;    // 기본 색상
  text: string;       // 텍스트 색상
  icon: string;       // 접근성 아이콘
}

export const TROOP_COLORS: Record<TroopStatus, TroopColorSet> = {
  full: {
    primary: '#22C55E',  // green-500
    text: '#FFFFFF',
    icon: '✓',
  },
  warning: {
    primary: '#F59E0B',  // amber-500
    text: '#000000',
    icon: '⚠️',
  },
  danger: {
    primary: '#EF4444',  // red-500
    text: '#FFFFFF',
    icon: '❗',
  },
  out: {
    primary: '#6B7280',  // gray-500
    text: '#FFFFFF',
    icon: '❌',
  },
} as const;
```

#### 3. TroopIndicator 클래스

```typescript
// packages/game-renderer/src/rendering/TroopIndicator.ts

import { getTroopStatus, TROOP_COLORS, hexToNumber } from '@five-tiger-generals/game-core';
import type { TroopStatus } from '@five-tiger-generals/game-core';

export class TroopIndicator {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Arc;
  private text: Phaser.GameObjects.Text;
  private currentTroops: number = 0;
  private maxTroops: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);

    // 배경 원형
    this.background = scene.add.circle(0, 0, 12, 0x22C55E);
    this.container.add(this.background);

    // 병력 숫자
    this.text = scene.add.text(0, 0, '0', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    });
    this.text.setOrigin(0.5, 0.5);
    this.container.add(this.text);
  }

  /**
   * 병력 업데이트 (애니메이션 포함)
   */
  update(troops: number, maxTroops: number): void {
    const previousTroops = this.currentTroops;
    this.currentTroops = troops;
    this.maxTroops = maxTroops;

    const status = getTroopStatus(troops, maxTroops);
    const colors = TROOP_COLORS[status];

    // 색상 업데이트
    this.scene.tweens.add({
      targets: this.background,
      fillColor: hexToNumber(colors.primary),
      duration: 200,
      ease: 'Power2',
    });

    // 텍스트 업데이트
    this.text.setText(troops.toString());
    this.text.setColor(colors.text);

    // 변화 애니메이션
    if (previousTroops !== 0 && troops !== previousTroops) {
      this.playChangeAnimation(troops > previousTroops);
    }
  }

  /**
   * 병력 변화 애니메이션
   */
  private playChangeAnimation(isIncrease: boolean): void {
    if (isIncrease) {
      // 증가: scale up + 초록 플래시
      this.scene.tweens.add({
        targets: this.container,
        scale: 1.3,
        duration: 150,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    } else {
      // 감소: shake + 빨간 플래시
      this.scene.tweens.add({
        targets: this.container,
        x: this.container.x + 3,
        duration: 50,
        repeat: 3,
        yoyo: true,
      });
    }
  }

  /**
   * 컨테이너 반환 (부모에 추가용)
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 정리
   */
  destroy(): void {
    this.container.destroy();
  }
}
```

#### 4. GeneralRenderer 통합

```typescript
// packages/game-renderer/src/rendering/GeneralRenderer.ts (수정)

import { TroopIndicator } from './TroopIndicator';

export class GeneralRenderer {
  // ... 기존 코드

  private troopIndicators: Map<string, TroopIndicator> = new Map();

  renderGeneral(general: General, x: number, y: number): void {
    // ... 기존 렌더링 코드

    // 병력 인디케이터 추가 (토큰 하단 중앙)
    const troopIndicator = new TroopIndicator(this.scene, 0, 35);
    troopIndicator.update(general.troops, general.stats.star);
    container.add(troopIndicator.getContainer());
    this.troopIndicators.set(general.id, troopIndicator);
  }

  /**
   * 병력 업데이트
   */
  updateGeneralTroops(generalId: string, troops: number, maxTroops: number): void {
    const indicator = this.troopIndicators.get(generalId);
    if (indicator) {
      indicator.update(troops, maxTroops);
    }
  }

  // ... 기존 코드
}
```

#### 5. GeneralStatsPanel 병력 바

```typescript
// apps/web/src/components/game/GeneralStatsPanel.tsx (수정)

import { getTroopStatus, getTroopRatio, TROOP_COLORS } from '@five-tiger-generals/game-core';

// TroopBar 컴포넌트
function TroopBar({ troops, maxTroops }: { troops: number; maxTroops: number }) {
  const status = getTroopStatus(troops, maxTroops);
  const ratio = getTroopRatio(troops, maxTroops);
  const colors = TROOP_COLORS[status];
  const percentage = Math.round(ratio * 100);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-400">병력</span>
        <span className="text-sm font-medium">
          {troops}/{maxTroops} {colors.icon}
        </span>
      </div>
      <div
        className="h-3 bg-gray-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={troops}
        aria-valuemin={0}
        aria-valuemax={maxTroops}
        aria-label={`병력 ${troops}/${maxTroops}`}
      >
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: colors.primary,
          }}
        />
      </div>
    </div>
  );
}

// GeneralStatsPanel에서 사용
export function GeneralStatsPanel({ general, onClose }: GeneralStatsPanelProps) {
  // ... 기존 코드

  return (
    <div /* ... */>
      {/* ... 기존 헤더, 스탯 그리드 */}

      {/* 병력 바 추가 */}
      <TroopBar troops={general.troops} maxTroops={general.stats.star} />

      {/* OUT 상태 표시 */}
      {general.status === 'out' && (
        <div className="mt-2 text-center text-red-500 font-bold">
          ❌ OUT
        </div>
      )}
    </div>
  );
}
```

#### 6. 이벤트 정의

```typescript
// packages/game-core/src/events/types.ts (수정)

export type GameEvents = {
  // ... 기존 이벤트
  'general:troops-changed': {
    generalId: string;
    previousTroops: number;
    currentTroops: number;
    maxTroops: number;
  };
};
```

### GDD 및 아키텍처 참고

**GDD - 장수 스탯 시스템:**
- **별 (Star)**: 최대 병력 수 (최대 HP)
- **병력**: 현재 군사 규모 (현재 HP), 0 이하 시 OUT
- 병력 0 → 장수 일시 OUT
- 모든 장수 OUT → 와해 패배

**아키텍처 - 이벤트 시스템:**
- `gameEvents.emit('general:troops-changed', payload)`
- Event Bus 패턴으로 Phaser ↔ React 통신
- 타입 안전 이벤트 정의

**아키텍처 - 상태 관리:**
- Zustand: UI 상태 (선택된 장수 ID)
- game-core GameState: 게임 로직 상태 (병력 값)
- React는 game-core 상태를 구독/표시

### 이전 스토리 학습 사항

**Story 2-1 (장수 배치)에서:**
- `General` 타입에 `troops: number`, `stats.star: number` 필드 존재
- 초기 배치 시 `troops = stats.star` (만병력)
- `GeneralRenderer` 클래스 구조 확립

**Story 2-3 (스탯 표시)에서:**
- `GeneralStatsPanel` 컴포넌트에 기본 병력 표시 구현
- `StatsGrid`에 병력 필드 포함
- 이 스토리에서 시각적 피드백 강화

**Story 2-4 (플레이어 색상)에서:**
- `hexToNumber()` 헬퍼 함수 이미 구현됨
- PLAYER_COLORS 패턴 참고하여 TROOP_COLORS 정의
- TailwindCSS + inline style 혼합 패턴

**Epic 1 회고에서:**
- 상수는 constants/ 모듈에 정의
- 접근성 (색맹, 스크린 리더) 중요
- 애니메이션은 Phaser Tween 사용

### Project Structure Notes

**신규 파일:**
```
packages/game-core/src/
├── generals/
│   └── troops.ts                    # 병력 상태 로직
│       - TroopStatus 타입
│       - TROOP_THRESHOLDS 상수
│       - getTroopStatus() 함수
│       - getTroopRatio() 함수
│
└── constants/
    └── troops.ts                    # 병력 색상 상수
        - TroopColorSet 인터페이스
        - TROOP_COLORS 정의

packages/game-renderer/src/
└── rendering/
    └── TroopIndicator.ts            # 병력 인디케이터 클래스
        - 숫자 + 배경 원형 렌더링
        - 상태별 색상 적용
        - 변화 애니메이션
```

**수정 파일:**
```
packages/game-core/src/
├── generals/
│   └── index.ts                     # troops 모듈 export 추가
│
├── constants/
│   └── index.ts                     # troops 모듈 export 추가
│
└── events/
    └── types.ts                     # general:troops-changed 이벤트 추가

packages/game-renderer/src/
└── rendering/
    ├── GeneralRenderer.ts           # TroopIndicator 통합
    │   - troopIndicators Map 추가
    │   - renderGeneral()에 인디케이터 추가
    │   - updateGeneralTroops() 메서드 추가
    │
    └── index.ts                     # TroopIndicator export 추가

apps/web/src/components/game/
└── GeneralStatsPanel.tsx            # TroopBar 컴포넌트 추가
    - 병력 Progress Bar
    - aria 속성 (접근성)
    - OUT 상태 표시
```

**테스트 파일:**
```
packages/game-core/tests/
└── generals/
    └── troops.test.ts               # 병력 상태 로직 테스트
        - getTroopStatus() 테스트
        - getTroopRatio() 테스트
        - 경계값 테스트 (0, 50%, 100%)
```

### 병력 상태 시각화 가이드

**상태별 표시:**

| 상태 | 조건 | 색상 | 아이콘 | 설명 |
|------|------|------|--------|------|
| full | troops === maxTroops | 초록색 (#22C55E) | ✓ | 만병력, 최적 상태 |
| warning | 50% ≤ ratio < 100% | 노란색 (#F59E0B) | ⚠️ | 주의 필요 |
| danger | 0 < ratio < 50% | 빨간색 (#EF4444) | ❗ | 위험, 즉시 조치 필요 |
| out | troops ≤ 0 | 회색 (#6B7280) | ❌ | OUT, 전투 불가 |

**애니메이션 명세:**

| 변화 | 애니메이션 | Duration | Easing |
|------|-----------|----------|--------|
| 병력 증가 | Scale 1.0 → 1.3 → 1.0 | 150ms | Back.easeOut |
| 병력 감소 | Shake (x +3px) x 4 | 200ms (50ms x 4) | Linear |
| 색상 변경 | Tween fillColor | 200ms | Power2 |

### 네이밍 컨벤션 (아키텍처 문서)

- **타입**: PascalCase (`TroopStatus`, `TroopColorSet`)
- **상수**: UPPER_SNAKE (`TROOP_COLORS`, `TROOP_THRESHOLDS`)
- **함수**: camelCase (`getTroopStatus`, `getTroopRatio`)
- **클래스**: PascalCase (`TroopIndicator`)
- **이벤트**: domain:action (`general:troops-changed`)

### References

- [Source: _bmad-output/epics.md#Epic 2: 장수 시스템] - Story [GENERAL-005] 정의
- [Source: _bmad-output/gdd.md#Unit Types and Classes] - 병력 시스템 정의 (별=최대병력, 병력=현재HP)
- [Source: _bmad-output/gdd.md#Accessibility Controls] - 색맹 지원, 스크린 리더 접근성
- [Source: _bmad-output/game-architecture.md#Data Access Pattern] - Constants Module 패턴
- [Source: _bmad-output/game-architecture.md#Cross-cutting Concerns] - Event System, Error Handling
- [Source: 2-1-general-placement.md#Dev Notes] - General 타입, troops 필드
- [Source: 2-3-general-stats-display.md#Dev Notes] - GeneralStatsPanel 컴포넌트
- [Source: 2-4-player-color-distinction.md#Dev Notes] - hexToNumber(), PLAYER_COLORS 패턴
- [Source: packages/game-core/src/generals/types.ts] - General.troops, General.stats.star
- [Source: packages/game-renderer/src/rendering/GeneralRenderer.ts] - renderGeneral, updateTroops 메서드

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 모든 빌드 및 테스트 통과 (pnpm build, pnpm --filter @ftg/game-core test)
- 261개 테스트 통과

### Completion Notes List

- 병력 상태 로직 (`getTroopStatus`, `getTroopRatio`) 구현 완료
- TroopIndicator Phaser 클래스 구현 완료 (병력 표시, 색상 변경, 애니메이션)
- GeneralRenderer에 TroopIndicator 통합 완료
- GeneralStatsPanel에 TroopBar 컴포넌트 추가 완료
- 접근성 (색맹 아이콘, aria 속성) 구현 완료
- GameEventPayloads에 'general:troops-changed' 이벤트 타입 정의 완료
- 단위 테스트 (troops.test.ts) 21개 케이스 추가

### File List

**신규 파일:**
- `packages/game-core/src/generals/troops.ts` - 병력 상태 로직
- `packages/game-core/src/constants/troops.ts` - 병력 색상 상수
- `packages/game-renderer/src/rendering/TroopIndicator.ts` - 병력 인디케이터 클래스
- `packages/game-core/tests/troops.test.ts` - 병력 시스템 테스트

**수정 파일:**
- `packages/game-core/src/generals/index.ts` - troops 모듈 export 추가
- `packages/game-core/src/constants/index.ts` - troops 상수 export 추가
- `packages/game-core/src/state/types.ts` - GameEventPayloads 타입 추가
- `packages/game-core/src/state/index.ts` - GameEventPayloads export 추가
- `packages/game-renderer/src/index.ts` - TroopIndicator export 추가
- `packages/game-renderer/src/rendering/GeneralRenderer.ts` - TroopIndicator 통합
- `apps/web/src/components/game/GeneralStatsPanel.tsx` - TroopBar 컴포넌트 추가
