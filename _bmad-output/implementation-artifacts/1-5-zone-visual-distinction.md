# Story 1.5: 진영 시각적 구분 (Zone Visual Distinction)

Status: review

---

## Story

As a 플레이어,
I want 각 타일의 구역(player1_home, player2_home, center, side)이 시각적으로 명확하게 구분된다,
so that 게임 중 자신의 진영, 상대 진영, 중앙 구역을 직관적으로 파악하여 전략적 결정을 내릴 수 있다.

## Acceptance Criteria

1. **AC1**: player1_home(row 5, 타일 25-29)이 파란색 계열로 표시된다
   - 색상이 선택/호버/하이라이트 상태에서도 구역을 인식할 수 있어야 함
   - 색조(hue)로 구분하되 명도는 상태에 따라 변화

2. **AC2**: player2_home(row 0, 타일 0-4)이 빨간색 계열로 표시된다
   - player1과 명확히 대비되는 색상
   - 색맹 사용자를 위해 색상 외 추가 구분 요소 고려 (패턴 또는 아이콘)

3. **AC3**: center(row 1-4, 타일 5-24)가 중립적 녹색 계열로 표시된다
   - 양 진영과 구분되면서도 너무 눈에 띄지 않는 색상
   - 전략적으로 중요한 중앙이라는 느낌 전달

4. **AC4**: side(타일 30-33)가 특수 구역으로 시각적 구분된다
   - 노란색 계열 또는 별도 패턴으로 특수 타일임을 표시
   - 측면 타일의 전략적 중요성 강조

5. **AC5**: 모든 구역 색상이 기존 선택/호버/하이라이트 시스템과 조화롭게 동작한다
   - 선택 시: 구역 색상 + 선택 상태가 혼합되어 표시
   - 호버 시: 구역 색상의 밝은 버전으로 변경
   - 하이라이트 시: 구역 색상 기반의 강조 색상

## Tasks / Subtasks

- [x] Task 1: 구역별 색상 팔레트 정의 (AC: 1, 2, 3, 4)
  - [x] 1.1: game-core에 ZONE_COLORS 상수 정의 (color scheme)
  - [x] 1.2: 각 구역별 기본, 선택, 호버, 하이라이트 색상 정의
  - [x] 1.3: 색맹 친화적 색상 조합 검증 (red-green 색맹 고려)

- [x] Task 2: TileRenderer 구역 색상 적용 개선 (AC: 1, 2, 3, 4, 5)
  - [x] 2.1: ZONE_COLORS를 game-core에서 import하도록 변경
  - [x] 2.2: 상태(selected/hovered/highlighted)와 구역 색상 조합 로직 구현
  - [x] 2.3: 색상 혼합 함수 구현 (구역 색상 + 상태 효과)

- [x] Task 3: 시각적 구분 강화 (AC: 2, 4)
  - [x] 3.1: 측면 타일(side)에 테두리 두께 또는 패턴 차별화 적용
  - [ ] 3.2: player1/player2 home에 미세한 그라데이션 또는 패턴 추가 (선택적) - 스킵

- [x] Task 4: 테스트 및 검증 (AC: 전체)
  - [x] 4.1: 모든 구역이 올바른 색상으로 렌더링되는지 확인
  - [x] 4.2: 선택/호버/하이라이트 상태에서 구역 구분 가능 확인
  - [x] 4.3: 반응형 레이아웃에서도 색상 일관성 확인
  - [x] 4.4: Chrome DevTools 색맹 시뮬레이션으로 접근성 검증

## Dev Notes

### 현재 구현 상태

현재 `TileRenderer.ts`에 이미 `ZONE_COLORS`가 정의되어 있고 기본 구역 색상이 적용되어 있음:

```typescript
// TileRenderer.ts:54-59 (현재)
const ZONE_COLORS: Record<string, number> = {
  player1_home: 0x3d3d6a, // 파란색 계열
  player2_home: 0x6a3d3d, // 빨간색 계열
  center: 0x3d5a3d,       // 녹색 계열
  side: 0x6a6a3d,         // 노란색 계열
};
```

**문제점:**
1. 색상 상수가 `game-renderer`에 정의되어 있어 `game-core`의 순수 로직 원칙 위반
2. 선택/호버/하이라이트 시 구역 색상이 완전히 덮어쓰여 구역 인식 불가
3. 색상 간 대비가 충분하지 않아 구분이 어려울 수 있음

### 핵심 구현 방향

1. **색상 상수를 game-core로 이동**
   - `packages/game-core/src/constants/colors.ts` 생성
   - 구역별 기본 색상 + 상태별 색상 변형 정의

2. **색상 혼합 전략**
   - 구역 색상을 "밝기/채도" 조절로 상태 표현
   - 선택: 구역 색상의 밝은 버전 + 외곽선 강조
   - 호버: 구역 색상의 약간 밝은 버전
   - 하이라이트: 구역 색상의 중간 밝은 버전

### 색상 팔레트 제안

```typescript
// packages/game-core/src/constants/colors.ts

/** 구역별 색상 팔레트 */
export const ZONE_COLORS = {
  player1_home: {
    base: 0x2a4a7a,      // 진한 파란색
    hover: 0x3a5a9a,     // 밝은 파란색
    selected: 0x4a6aaa,  // 더 밝은 파란색
    highlight: 0x3a5a8a, // 중간 밝은 파란색
  },
  player2_home: {
    base: 0x7a2a2a,      // 진한 빨간색
    hover: 0x9a3a3a,     // 밝은 빨간색
    selected: 0xaa4a4a,  // 더 밝은 빨간색
    highlight: 0x8a3a3a, // 중간 밝은 빨간색
  },
  center: {
    base: 0x2a5a2a,      // 진한 녹색
    hover: 0x3a6a3a,     // 밝은 녹색
    selected: 0x4a7a4a,  // 더 밝은 녹색
    highlight: 0x3a6a3a, // 중간 밝은 녹색
  },
  side: {
    base: 0x6a5a2a,      // 진한 황색
    hover: 0x8a7a3a,     // 밝은 황색
    selected: 0x9a8a4a,  // 더 밝은 황색
    highlight: 0x7a6a3a, // 중간 밝은 황색
  },
} as const;

export type ZoneColorPalette = typeof ZONE_COLORS;
export type ZoneName = keyof ZoneColorPalette;
export type ZoneState = 'base' | 'hover' | 'selected' | 'highlight';
```

### TileRenderer 수정 방향

```typescript
// TileRenderer.ts 수정안

import { ZONE_COLORS, type TileZone } from '@ftg/game-core';

// 색상 결정 로직 개선
private getZoneColor(
  zone: TileZone,
  options: { selected?: boolean; hovered?: boolean; highlighted?: boolean }
): number {
  const palette = ZONE_COLORS[zone];

  // 우선순위: selected > hovered > highlighted > base
  if (options.selected) return palette.selected;
  if (options.hovered) return palette.hover;
  if (options.highlighted) return palette.highlight;
  return palette.base;
}
```

### 색맹 접근성 고려

- **Red-Green 색맹 (Protanopia/Deuteranopia):**
  - player1(파랑)과 player2(빨강)는 구분 가능
  - 그러나 확실한 구분을 위해 밝기 차이도 적용

- **테두리 두께 차별화:**
  - player1_home: 테두리 두께 3px
  - player2_home: 테두리 두께 3px + 대시 패턴 (점선)
  - center: 테두리 두께 2px (기본)
  - side: 테두리 두께 4px (강조)

### 기존 코드 영향도

**수정 필요 파일:**
- `packages/game-core/src/constants/colors.ts` (신규)
- `packages/game-core/src/constants/index.ts` (export 추가)
- `packages/game-core/src/index.ts` (export 추가)
- `packages/game-renderer/src/rendering/TileRenderer.ts` (색상 로직 개선)

**하위 호환:**
- 기존 `renderTile()` 인터페이스 변경 없음
- 기존 선택/호버/하이라이트 로직 동작 유지
- 단, 색상이 더 명확하게 구분되도록 개선

### 성능 고려사항

- 색상 팔레트는 상수로 정의하여 런타임 계산 최소화
- `getZoneColor()` 함수는 조건문만 사용하여 O(1) 복잡도

### 제약사항

1. **색상 값 범위**: Phaser가 사용하는 hex 색상 값 (0xRRGGBB)
2. **fillAlpha**: 기존 0.5 유지하여 배경과의 조화
3. **strokeColor**: 검정색(0x000000) 유지하여 타일 경계 명확히

### Project Structure Notes

**아키텍처 경계 준수:**
- 색상 상수는 `game-core/constants/`에 정의 (순수 데이터)
- 렌더링 로직만 `game-renderer`에서 담당
- 색상 팔레트 타입은 `game-core`에서 export

**패턴 준수:**
- 상수는 `as const`로 타입 좁히기 적용
- 함수는 순수 함수로 구현 (부수 효과 없음)

### References

- [Source: _bmad-output/gdd.md#Art and Audio Direction] - 색상 팔레트 방향
- [Source: _bmad-output/gdd.md#Accessibility Controls] - 색맹 지원 요구사항
- [Source: _bmad-output/game-architecture.md#Implementation Patterns] - game-core 순수 로직 원칙
- [Source: _bmad-output/epics.md#Epic 1: 보드 시스템] - Story [BOARD-005]
- [Source: packages/game-renderer/src/rendering/TileRenderer.ts:54-59] - 현재 ZONE_COLORS 정의
- [Source: packages/game-core/src/board/types.ts:21-27] - TileZone 타입 정의
- [Source: _bmad-output/implementation-artifacts/1-4-responsive-layout.md] - 이전 스토리 참고

### 이전 스토리(1-4) 학습 사항

- `recalculateAndRender()`로 전체 보드 재렌더링 시 색상도 함께 적용됨
- resize 이벤트 후에도 구역 색상 일관성 유지 필요
- `renderWithStates()` 메서드가 다중 상태 통합 렌더링 담당 → 여기서 구역 색상 로직 통합 필요

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 테스트 파일 위치 오류: `src/constants/colors.test.ts`를 `tests/colors.test.ts`로 이동 필요
- Import 경로 수정: `./colors` → `../src/constants/colors`

### Completion Notes List

1. **Task 1 완료**: `packages/game-core/src/constants/colors.ts` 생성
   - ZONE_COLORS 상수: 4개 구역 × 4개 상태 = 16개 색상 정의
   - ZONE_STROKE_WIDTH 상수: 구역별 테두리 두께 (색맹 접근성)
   - getZoneColor() 헬퍼 함수: 구역과 상태에 따른 색상 반환
   - ZoneState, ZoneColorPalette 타입 정의

2. **Task 2 완료**: TileRenderer 색상 로직 개선
   - game-core에서 ZONE_COLORS import로 아키텍처 경계 준수
   - getZoneState() 함수: 상태 우선순위 처리 (selected > hover > highlight > base)
   - getStrokeWidthForZone() 함수: 구역별 테두리 두께 적용

3. **Task 3 완료**: 시각적 구분 강화
   - ZONE_STROKE_WIDTH로 측면 타일(side) 강조 (4px, 가장 두꺼움)
   - player1/player2 home은 3px, center는 2px로 차별화
   - 그라데이션/패턴은 선택적이므로 스킵

4. **Task 4 완료**: 테스트 및 검증
   - 단위 테스트 13개 작성 및 통과 (colors.test.ts)
   - 빌드 성공, 개발 서버 실행 확인

### File List

**신규 파일:**
- `packages/game-core/src/constants/colors.ts`
- `packages/game-core/tests/colors.test.ts`

**수정 파일:**
- `packages/game-core/src/constants/index.ts` (export 추가)
- `packages/game-renderer/src/rendering/TileRenderer.ts` (색상 로직 개선)
