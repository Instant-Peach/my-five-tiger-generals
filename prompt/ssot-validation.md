# SSOT 정합성 점검 프롬프트

다음 레거시 문서들(SSOT)과 현재 프로젝트 계획 문서들의 정합성을 점검하세요.

## SSOT (Single Source of Truth) - 레거시 문서
1. `/Users/whchoi/dev/my-five-tiger-generals-legacy/docs/prd.md` - PRD (제품 요구사항 문서)
2. `/Users/whchoi/dev/my-five-tiger-generals-legacy/docs/rules.md` - 게임 규칙서
3. `/Users/whchoi/dev/my-five-tiger-generals-legacy/docs/tatic.md` - 책략 시스템 상세
4. `/Users/whchoi/dev/my-five-tiger-generals-legacy/docs/temp-0905.md` - 추가 기획 메모

## 점검 대상 - 현재 프로젝트 계획 문서
1. `/Users/whchoi/dev/five-tiger-generals/docs/project-plan/01-project-overview.md`
2. `/Users/whchoi/dev/five-tiger-generals/docs/project-plan/02-game-rules.md`
3. `/Users/whchoi/dev/five-tiger-generals/docs/project-plan/03-technical-architecture.md`
4. `/Users/whchoi/dev/five-tiger-generals/docs/project-plan/04-development-roadmap.md`
5. `/Users/whchoi/dev/five-tiger-generals/docs/project-plan/05-backlog.md`
6. `/Users/whchoi/dev/five-tiger-generals/docs/project-plan/06-ui-page-flow.md`

## 핵심 점검 원칙

**SSOT의 모호한 부분이 과대 해석되거나 임의적 결정으로 메꿔지지 않았는지 확인하는 것이 핵심입니다.**

- SSOT에 명시되지 않은 내용이 현재 문서에서 "확정된 것처럼" 기술되어 있는지 확인
- SSOT에서 "TBD", "미확정", "추후 결정" 등으로 표기된 항목이 현재 문서에서 임의로 결정되어 있는지 확인
- SSOT의 애매한 표현이 특정 방향으로 해석되어 구체화된 경우, 그 해석이 타당한지 또는 원저자 확인이 필요한지 판단

## 점검 항목

### 1. 게임 규칙 정합성 (02-game-rules.md vs rules.md)
- [ ] 보드 구성 (34개 삼각타일, 해/달/전선 라인)
- [ ] 장수 스탯 시스템 (별/발/해/달) - 특히 "별 = 통솔력(병력 상한)"이 맞는지
- [ ] 전투 규칙 (해/달 방향 피해 계산, 전선 교착)
- [ ] 행동력 시스템 (턴당 3액션인지 2액션인지)
- [ ] 이탈 규칙 (피해 2 적용)
- [ ] 승리 조건 (노크 3회, 전멸, 와해, 항복)
- [ ] 보급 시스템 (아군과 포개면 보급)
- [ ] 패전 처리 (전사 시 완전 소멸, 스탯 감소 없음)

### 2. 책략 시스템 (tatic.md 반영 여부)
- [ ] 20종 책략 목록 존재 여부
- [ ] 현장용/사무용 구분
- [ ] 설치형 책략 규칙 (타일 점유, 상호작용)
- [ ] Phase 3에서 구현 예정으로 올바르게 분류되어 있는지

### 3. PRD 정합성 (prd.md)
- [ ] 기술 스택 일치 (React 18, Phaser 3, Zustand 등)
- [ ] 모바일 우선 원칙 반영
- [ ] 디자인 스타일 (흰 배경 + 검은 먹선)

### 4. 추가 기획 메모 (temp-0905.md)
- [ ] 설치물 점유 규칙 반영
- [ ] 보병장력, 충차, 연노, 황충, 화계 등 특수 규칙
- [ ] 기만 책략 표시 규칙
- [ ] 함정 책략 효과

## 점검 결과 형식

각 점검 항목에 대해 다음 중 하나로 분류:

1. **일치** (✅): SSOT와 현재 문서가 일치
2. **불일치** (❌): 명확히 다른 내용 - 구체적인 차이 내용 명시
3. **누락** (⚠️): SSOT에는 있지만 현재 문서에 없음
4. **과대 해석** (🚨): SSOT에서 모호하거나 미확정인 내용이 현재 문서에서 임의로 결정됨 - 원본의 모호한 표현과 현재 문서의 확정된 표현을 함께 제시
5. **확인 필요** (❓): 해석이 다를 수 있어 원저자 확인이 필요한 부분

## 특히 주의해서 점검할 부분

1. **행동력**: rules.md는 "행동력 3"이지만, 02-game-rules.md는 "2 액션"으로 표기 - 어느 쪽이 맞는지, 혹은 임의 변경인지
2. **스탯 의미**: rules.md의 "별(통솔력) = 병력 상한"과 02-game-rules.md의 "성(Star) = 방어력" - 의미가 완전히 다른데 어디서 이렇게 바뀌었는지
3. **[모의] 액션**: rules.md에는 [모의]라는 책략 사용 액션이 있는데 현재 문서에 반영되어 있는지
4. **보급 시스템**: rules.md의 보급 복귀 규칙이 현재 문서에 반영되어 있는지
5. **설치물 규칙**: tatic.md와 temp-0905.md의 설치물 관련 규칙이 반영되어 있는지
6. **노크 규칙**: SSOT에서 "노크는 별도의 행동"이라고 명시되어 있는데, 현재 문서에서 이 규칙이 정확히 반영되어 있는지

## 최종 결과물

1. **정합성 요약표**: 각 항목별 점검 결과
2. **과대 해석 목록**: SSOT의 모호함이 임의로 결정된 항목들 (우선 확인 필요)
3. **불일치 목록**: 명확히 다른 내용들 (수정 필요)
4. **누락 목록**: SSOT에는 있지만 현재 문서에 없는 내용들
5. **권고안**: 각 문제 항목에 대한 처리 방안 (수정/확인/유보)
