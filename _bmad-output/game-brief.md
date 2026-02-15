---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - path: "docs/project-plan/01-project-overview.md"
    type: "reference"
    description: "기존 프로젝트 개요 문서 (BMGD 변환용)"
  - path: "docs/project-plan/02-game-rules.md"
    type: "reference"
    description: "기존 게임 규칙 문서 (BMGD 변환용)"
documentCounts:
  brainstorming: 0
  research: 0
  notes: 0
  reference: 2
workflowType: "game-brief"
lastStep: 0
project_name: "five-tiger-generals"
user_name: "CHOI"
date: "2026-02-03"
game_name: "Five Tiger Generals"
---

# Game Brief: Five Tiger Generals

**Date:** 2026-02-03
**Author:** CHOI
**Status:** Complete

---

## Executive Summary

Five Tiger Generals는 삼국지 테마의 1:1 턴제 전략 보드게임입니다. 독특한 삼각형 테셀레이션 보드와 해/달/전선 방향성 전투 시스템으로 기존 전략 게임과 차별화된 경험을 제공합니다. 레트로 픽셀아트 미학과 20-40분 완결형 세션으로, 모바일 웹에서 언제든 깊이 있는 두뇌 싸움을 즐길 수 있습니다. 팬 커뮤니티를 초기 타겟으로 시작하여 전략 게임 시장으로 확장합니다.

---

## Game Vision

### Core Concept

삼각형 보드 위에서 방향성 전투로 싸우는 삼국지 테마 1:1 전략 보드게임

### Elevator Pitch

**Five Tiger Generals**는 삼국지 장수들을 지휘하는 1:1 턴제 전략 보드게임입니다. 독특한 삼각형 보드에서 해/달/전선 세 방향의 공격 시스템으로 깊은 전술적 선택을 제공합니다. 자신만의 장수 5명을 선택해 20-40분 안에 치열한 두뇌 싸움을 즐기세요.

### Vision Statement

Five Tiger Generals는 체스와 장기의 전략적 깊이를 삼국지의 매력적인 세계관과 결합하여, 누구나 쉽게 배우지만 끝없이 마스터할 수 있는 새로운 전략 게임 경험을 창조합니다. 언제 어디서든 짧은 시간 안에 순수한 실력으로 겨루는 공정한 두뇌 싸움을 통해, 플레이어들이 '한 판 더'를 외치게 만드는 것이 우리의 목표입니다.

---

## Target Market

### Primary Audience

**크리에이터 팬 커뮤니티 (초기 핵심 타겟)**

팬게임으로 시작한 프로젝트의 특성상, 해당 크리에이터의 팬 커뮤니티가 초기 핵심 사용자층입니다.

**Demographics:**
- 연령: 20-30대 (크리에이터 주 시청층)
- 팬 카페/디스코드 등 커뮤니티 활동자
- 모바일 게임에 익숙한 세대

**Gaming Preferences:**
- 캐주얼~코어 게이머
- 짧은 세션 선호 (출퇴근, 점심시간)
- 커뮤니티 기반 게임 경험 선호

**Motivations:**
- 좋아하는 크리에이터 관련 콘텐츠 소비
- 커뮤니티 내 화제거리/공유
- 팬게임 개발 과정 참여 (테스터, 피드백)

### Secondary Audience

**전략 게임 매니아 & 삼국지 팬 (확장 타겟)**

상업화 단계에서 확장할 더 넓은 시장입니다.

- 체스, 장기, 바둑 등 추상 전략 게임 경험자
- 삼국지 IP 팬 (한국/중국/일본 시장)
- 모바일에서 깊이 있는 전략 게임을 원하는 유저
- "배우기 쉽고 마스터하기 어려운" 게임을 찾는 유저

### Market Context

**유사 성공 게임:**
- 체스/장기/바둑 앱 - 검증된 추상 전략 게임 시장
- Auto Chess, TFT - 캐릭터 수집 + 전략 조합의 인기
- 하스스톤, Legends of Runeterra - 모바일 전략 카드게임

**시장 기회:**
- 팬 커뮤니티를 통한 초기 사용자 확보 및 바이럴
- 삼국지 테마의 아시아 시장 친화성
- 모바일 전략 게임의 짧은 세션 트렌드

**차별화 포인트:**
- 독특한 삼각형 테셀레이션 보드
- 해/달/전선 방향성 전투 시스템
- 20-40분 완결형 깊이 있는 전략

---

## Game Fundamentals

### Core Gameplay Pillars

1. **전략적 깊이** - 단순한 규칙, 깊은 전술. 모든 결정이 의미 있음
2. **접근성** - 배우기 쉽고 마스터하기 어려움. 짧은 세션으로 완결
3. **공정한 경쟁** - 운이 아닌 실력. Pay-to-Win 없음
4. **레트로 픽셀아트 미학** - 고전 턴제 전략 게임 풍의 비주얼

**Pillar Priority:** 충돌 시 우선순위
1. 전략적 깊이 > 2. 공정한 경쟁 > 3. 접근성 > 4. 레트로 미학

### Primary Mechanics

**이동 (Move)**
- 장수를 인접 삼각형 타일로 이동
- 발(Move) 스탯만큼 연속 이동 가능
- 아군과 겹치면 보급 발동

**공격 (Attack)**
- 해/달/전선 3방향 공격 시스템
- 방향에 따라 다른 스탯으로 대결
- 전선 공격 시 교착 상태 진입

**전술적 선택 (Tactics)**
- 턴당 2개 행동력 배분
- 같은 장수로 같은 행동 2번 불가
- 노크 vs 전투 vs 방어 판단

**장수 선택 (Draft)** - 확장 시
- 보유 장수 중 5명 선택
- 팀 구성 전략

**Core Loop:** 장수 선택 → 배치 → [이동/공격 반복] → 노크 or 전멸 → 승패 결정 → 재대결

### Player Experience Goals

**숙달감 (Mastery)**
- 같은 규칙, 다른 결과 - 실력 향상이 느껴짐
- "이번엔 왜 졌는지 알겠어" → "다음엔 이길 수 있어"

**긴장과 해소 (Tension & Relief)**
- 노크 경쟁, 교착 상태의 긴장감
- 결정적 한 수로 판세 뒤집는 쾌감

**"한 판 더" 중독성**
- 20-40분 완결로 부담 없이 재도전
- 아쉬움이 다음 판으로 이어짐

**공정한 승부의 만족감**
- 운이 아닌 순수 실력 대결
- 이기면 내 실력, 지면 내 실수

**Emotional Journey:** 초반 탐색 → 중반 긴장 고조 → 후반 결정적 순간 → 승패 후 "한 판 더"

---

## Scope and Constraints

### Target Platforms

**Primary:** 모바일 웹 (PWA) - 앱 설치 없이 브라우저에서 플레이
**Secondary:** 데스크톱 웹, 향후 네이티브 앱 (모바일 스토어)

### Development Timeline

**Phase 1:** Local Demo - 2인 로컬 플레이
**Phase 2:** Online Demo - 1:1 온라인 매칭
**Phase 3:** Full Game - 계정, 랭킹, 책략 시스템

### Budget Considerations

- **자체 자금** 프로젝트
- **무료 서비스 활용**: Cloudflare Pages, MongoDB Atlas (무료 티어)
- **에셋**: Phase 1에서 직접 픽셀아트 제작, 추후 교체 용이한 구조
- **추가 예산**: 알파 테스트 공개 시 서버 비용 정도

### Team Resources

**팀 구성:**
- 개발자 1명 (본인) - 프로그래밍 전담
- 기획자/일러스트레이터 1명 - 기획 및 픽셀아트 담당

**가용 시간:** 퇴근 후 저녁 시간 (파트타임)

**Skill Gaps:**
- 게임 엔진으로 완결된 게임 제작 경험 없음
- 서버/인프라 작업 미숙 (단, 시니어 개발자 멘토 있음)

**Mitigation:**
- 아키텍처는 시니어 개발자가 설계한 구조 따름
- 로컬 테스트 후 인프라 작업 시 도움 요청 가능

### Technical Constraints

**기술 스택:**
- React 19 + Phaser 3.90+ (웹 기반)
- TypeScript 5.8+, Zustand (상태관리)
- game-core 패키지로 순수 게임 로직 분리 (SSR Safe)

**성능 목표:**
- 60fps 유지
- 번들 크기 < 500KB (gzip)
- 모바일 터치 최적화

**Phase 2+ 추가:**
- Colyseus (멀티플레이어)
- Supabase (DB/Auth)

**Later:**
- 접근성 기능 (색맹 지원 등)
- 오프라인 플레이

### Scope Realities

- 파트타임 개발로 인한 속도 제약 인정
- Phase 1에서 핵심 게임플레이 검증 우선
- 완벽보다 플레이 가능한 데모 먼저
- 에셋은 교체 가능한 구조로 설계

---

## Reference Framework

### Inspiration Games

**삼국지 영걸전**
- Taking: 레트로 픽셀아트 디자인 스타일, 턴제 전투 느낌
- Not Taking: 스토리, 게임 메커니즘

**하스스톤**
- Taking: 디지털로 돌아가는 턴제 보드게임의 UX
- Not Taking: 그래픽 스타일

**체스/장기**
- Taking: 테셀레이션 보드, 말의 움직임에 관한 최소한의 규칙, 순수 전략 경쟁
- Not Taking: 사각형 그리드, 동일한 말 구성

### Competitive Analysis

**Direct Competitors:**
- 체스/장기 앱 (Chess.com, 한게임 장기 등)
- Auto Chess류 (TFT, Dota Auto Chess)
- 모바일 전략 보드게임

**Competitor Strengths:**
- 검증된 게임플레이, 거대한 사용자 기반
- 체계적인 랭킹/매칭 시스템

**Competitor Weaknesses:**
- 레트로 픽셀아트 미학 부재
- 삼국지 IP의 캐릭터성/테마 없음
- 새로운 전략적 경험 제공 부족

**Note:** 팬 커뮤니티 기반 초기 전략이 있어 전통적 경쟁 분석보다 커뮤니티 접근이 더 중요

### Key Differentiators

1. **삼각형 테셀레이션 보드** - 체스/장기와 완전히 다른 공간 전략
2. **해/달/전선 방향성 전투** - 기존 게임에 없는 독특한 전투 메커니즘
3. **레트로 픽셀아트 + 삼국지 미학** - 삼국지 영걸전 감성의 현대적 재해석
4. **팬 커뮤니티 기반 시작** - 크리에이터 팬덤을 통한 초기 사용자 확보 및 바이럴

**Unique Value Proposition:**
삼국지 영걸전의 레트로 미학과 체스의 전략적 깊이를 결합한, 독특한 삼각형 보드 위의 새로운 전략 게임 경험

---

## Content Framework

### World and Setting

**Setting:** 삼국지 시대 (184-280 AD) - 구체적 전투/장소보다는 테마적 배경

**World-building Depth:** 최소 (Minimal) - 캐릭터 이름과 시각적 테마만 차용

**Approach:**
- 삼국지는 **테마적 껍데기**로 활용 (캐릭터성, 비주얼, 용어)
- 실제 역사나 스토리는 게임플레이에 영향 없음
- 체스/장기처럼 **추상 전략**에 집중
- 초상화 교체 시에도 게임 본질은 변하지 않는 구조

**Atmosphere:** 고전 삼국지 전략 게임의 향수 + 레트로 픽셀아트 미학

### Narrative Approach

**Story Structure:** 없음 - 캠페인/스토리 모드 없음

**Character Development:** 없음 - 장수는 고정된 스탯과 능력만 보유

**Dialogue/Text:** 최소 - UI 텍스트, 장수 이름/칭호 정도

**Cutscenes:** 없음

**Lore Delivery:** 간접적
- 장수 이름, 비주얼, 스탯 밸런스로 캐릭터성 암시
- 예: 관우 "의리의 무신" + 균형 스탯, 장비 "맹장" + 높은 공격력
- 별도 스토리 설명 없이 플레이 경험으로 캐릭터 인지

### Content Volume

**Phase 1:**
- 장수 5명 (오호대장군)
- 보드 1종 (34타일 삼각형)
- 전술 0개 (기본 이동/공격만)

**Phase 3 확장:**
- 장수 20+ (플레이어가 5명 선택)
- 전술 20개
- 추가 게임 모드 검토

---

## Art and Audio Direction

### Visual Style

**스타일:** 레트로 픽셀아트 (삼국지 영걸전 감성)

**해상도:** 저해상도 픽셀 스프라이트 (16x16 ~ 32x32 타일 기반)

**색감:** 제한된 팔레트, 레트로 감성

**UI:** 픽셀아트 기반, 명확한 가독성 우선

**애니메이션:** 최소한 - 이동, 공격, 피격 정도

### Audio Style

**BGM:** 칩튠/레트로 스타일 또는 고전 동양풍 (Phase 1에서는 미포함 가능)

**SFX:** 8-bit 스타일 효과음 - 이동, 공격, 승리/패배

**우선순위:** Phase 1은 무음 또는 최소 SFX, 이후 확장

### Production Approach

**Phase 1 에셋:** 팀 내 직접 제작 (기획자/일러스트레이터)

**에셋 구조:** 교체 용이한 모듈식 설계 (초상화 등 독립적 교체 가능)

**외주/구매:** Phase 2 이후 필요시 검토

---

## Risk Assessment

### Key Risks

| 리스크 | 영향도 | 가능성 | 설명 |
|--------|--------|--------|------|
| 삼각형 보드 UX 혼란 | 높음 | 중간 | 익숙하지 않은 보드 형태로 진입장벽 |
| 게임 밸런스 이슈 | 중간 | 높음 | 장수/전술 간 밸런스 조정 필요 |
| 개발 일정 지연 | 중간 | 중간 | 파트타임 개발, 경험 부족 |
| 팬 커뮤니티 관심 저하 | 중간 | 낮음 | 초기 타겟 이탈 시 바이럴 약화 |

### Technical Challenges

| 도전과제 | 대응 방안 |
|----------|----------|
| Phaser + React 통합 | 기존 아키텍처 패턴 따름, 멘토 지원 |
| 삼각형 좌표계 구현 | Legacy 코드에서 검증된 로직 이식 |
| 모바일 터치 최적화 | 터치 영역 충분히 확보, 제스처 단순화 |
| Phase 2 멀티플레이어 | Colyseus 학습 필요, 멘토 설계 지원 |

### Market Risks

- 팬 커뮤니티 의존도 높음 - 커뮤니티 관심 저하 시 초기 견인력 상실
- 삼국지 테마의 저작권 리스크 낮음 (공유 IP)
- 경쟁작 대비 인지도 부족 - 마케팅 예산 없음

### Mitigation Strategies

| 리스크 | 완화 전략 |
|--------|----------|
| UX 혼란 | 튜토리얼 강화, 시각적 가이드(이동 경로 표시 등) |
| 밸런스 | 플레이테스트 반복, 데이터 기반 조정 |
| 일정 지연 | MVP 범위 엄격 관리, Phase 1 핵심 기능만 |
| 관심 저하 | 개발 과정 공유, 커뮤니티 참여 유도 |

---

## Success Criteria

### MVP Definition

**Phase 1 (Local Demo) 완료 기준:**
- [ ] 삼각형 보드(34타일)에서 2인 번갈아 플레이
- [ ] 5명 장수 이동 시스템 (발 스탯 기반)
- [ ] 해/달/전선 공격 정상 동작
- [ ] 노크 3회 시 승리 판정
- [ ] 전멸/와해 승리 조건 동작
- [ ] 모바일 브라우저에서 터치 플레이 가능

### Success Metrics

**Phase 1 (데모):**
- 플레이 테스트 참여자 10명 확보
- 평균 세션 시간 15분 이상
- "재밌다" 응답률 70% 이상

**Phase 2 (온라인):**
- 동시 접속 50명 처리
- 매칭 대기 시간 30초 이내
- 게임 완료율 80% 이상

**Phase 3 (정식):**
- MAU 1,000명
- 리텐션 D7 30% 이상
- 평균 일일 게임 수 3판/유저

### Launch Goals

**Phase 1 출시 목표:**
- 팬 커뮤니티 내 비공개 테스트 진행
- 핵심 게임플레이 재미 검증
- 밸런스 및 UX 피드백 수집
- Phase 2 진행 여부 결정

---

## Next Steps

### Immediate Actions

1. **GDD 워크플로우 실행** - Game Brief 기반 상세 게임 디자인 문서 작성
2. **Game Architecture 워크플로우 실행** - 기술 아키텍처 문서 BMGD 형식 변환
3. **Sprint Planning 워크플로우 실행** - Phase 1 구현을 위한 스프린트 계획

### Research Needs

- Legacy 코드베이스의 재사용 가능한 게임 로직 파악
- Phaser 3.90+ 삼각형 타일맵 구현 방법 조사
- 모바일 터치 UX 베스트 프랙티스 조사

### Open Questions

- 장수별 스탯 밸런스 최종 확정 (플레이테스트 후 조정)
- Phase 1 에셋 스타일 가이드 확정 (픽셀 해상도 등)
- 튜토리얼 방식 결정 (인터랙티브 vs 정적 가이드)

---

## Appendices

### A. Research Summary

기존 프로젝트 분석 결과:
- **Legacy 프로젝트**: 게임 로직 80% 완성, 보드 시스템 검증됨
- **Main 프로젝트**: 인프라 패턴, SSR, CI/CD 70% 완성
- 두 프로젝트의 장점을 결합하여 새 프로젝트 구축

### B. Stakeholder Input

- **크리에이터 팬 커뮤니티**: 초기 테스터 및 피드백 제공자
- **시니어 개발자 멘토**: 아키텍처 설계 및 기술 지원
- **기획자/일러스트레이터**: 기획 및 픽셀아트 에셋 제작

### C. References

**기존 기획 문서:**
- `docs/project-plan/01-project-overview.md` - 프로젝트 개요
- `docs/project-plan/02-game-rules.md` - 게임 규칙 (SSOT)
- `docs/project-plan/03-technical-architecture.md` - 기술 아키텍처
- `docs/project-plan/04-development-roadmap.md` - 개발 로드맵
- `docs/project-plan/05-backlog.md` - 백로그 (참고용)
- `docs/project-plan/06-ui-page-flow.md` - UI 페이지 플로우

**영감 게임:**
- 삼국지 영걸전 (KOEI) - 레트로 픽셀아트 스타일
- 하스스톤 (Blizzard) - 디지털 턴제 보드게임 UX
- 체스/장기 - 추상 전략 게임 메커니즘

---

_This Game Brief serves as the foundational input for Game Design Document (GDD) creation._

_Next Steps: Use the `workflow gdd` command to create detailed game design documentation._
