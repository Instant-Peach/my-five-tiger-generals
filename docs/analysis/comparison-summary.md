# 프로젝트 비교 요약: Legacy vs Main

> 분석일: 2026-02-02

---

## 핵심 비교표

| 항목 | Legacy | Main | 새 프로젝트 권장 |
|------|--------|------|-----------------|
| **아키텍처** | Monolith SPA | Monorepo (3 apps) | Monorepo 채택 |
| **게임 로직 완성도** | ✅ 80% | 🔄 60% (포팅됨) | Legacy에서 이식 |
| **기획 문서** | ✅ 완성 | 🔄 참조 수준 | Legacy 문서 사용 |
| **인프라** | ❌ 없음 | ✅ 완성 | Main 패턴 사용 |
| **SSR 지원** | ❌ | ✅ | Main 패턴 사용 |
| **멀티플레이어** | ❌ | ✅ Colyseus | Main 구조 사용 |
| **CI/CD** | ❌ | ✅ GitHub Actions | Main 설정 사용 |
| **배포** | GitHub Pages | Cloudflare | Main 설정 사용 |

---

## 각 프로젝트에서 가져올 것

### From Legacy (`my-five-tiger-generals-legacy/`)

#### 1. 기획 문서 (docs/)
```
✅ prd.md          - 제품 요구사항 문서
✅ rules.md        - 게임 규칙 상세
✅ tatic.md        - 20개 전술 시스템
✅ todo.md         - 개발 로드맵 참조
```

#### 2. 핵심 게임 로직 (src/game-core/)
```
✅ engine.ts       - 핵심 게임 엔진 (~410 lines)
   - 턴/액션 시스템
   - 이동 시스템
   - 전투 시스템 (해/달/전선)
   - 교착/이탈 메커니즘
   - 노크 승리 조건

✅ types.ts        - 게임 상태 타입 정의 (~180 lines)
   - GameState
   - Piece
   - Action
   - TurnState
```

#### 3. 보드 시스템 (src/game/systems/)
```
✅ BoardGraph.ts   - 삼각형 그리드 시스템 (~375 lines)
   - 34 타일 테셀레이션
   - 인접성 계산
   - 특수 엣지 타일 처리
```

---

### From Main (`my-five-tiger-generals/`)

#### 1. 인프라 설정
```
✅ pnpm-workspace.yaml      - 모노레포 설정
✅ .github/workflows/       - CI/CD 파이프라인
✅ apps/web/wrangler.toml   - Cloudflare 배포
✅ .nvmrc                   - Node 버전 (22.19.0)
```

#### 2. SSR Safe 패턴
```
✅ useGameLoader.ts         - Phaser 동적 로딩 훅
✅ entry-worker.tsx         - Cloudflare Workers SSR
✅ entry-server.tsx         - 서버 사이드 렌더링
```

#### 3. 백엔드 구조
```
✅ apps/server/             - NestJS + tRPC 설정
   - Auth 모듈 (JWT)
   - Users 모듈
   - Supabase 연동

✅ apps/game-server/        - Colyseus 구조
   - GameRoom 패턴
   - GameLogic 분리
   - GameState 스키마
```

#### 4. 타입 공유 패턴
```
✅ packages/api-types/      - tRPC 타입 공유
✅ packages/game/           - 게임 로직 공유 패키지
```

---

## 새 프로젝트 시작 체크리스트

### Phase 1: 기반 설정
- [ ] 모노레포 구조 생성 (pnpm workspaces)
- [ ] Main에서 인프라 설정 복사
- [ ] CI/CD 파이프라인 설정
- [ ] Cloudflare 배포 설정

### Phase 2: 게임 로직 이식
- [ ] Legacy의 engine.ts 정제 후 이식
- [ ] Legacy의 types.ts 확장 및 이식
- [ ] BoardGraph.ts 최적화 후 이식
- [ ] 기획 문서 통합 (rules.md, tatic.md)

### Phase 3: 프론트엔드 구축
- [ ] SSR Safe Phaser 로딩 패턴 적용
- [ ] TanStack Router 설정
- [ ] Zustand + TanStack Query 상태 관리
- [ ] UI 컴포넌트 (shadcn/ui)

### Phase 4: 백엔드 구축
- [ ] NestJS API 서버 설정
- [ ] tRPC 라우터 구성
- [ ] Colyseus 게임 서버 설정
- [ ] Supabase 연동

### Phase 5: 배포
- [ ] Cloudflare Pages/Workers 배포
- [ ] 백엔드 Docker 컨테이너화
- [ ] 프로덕션 환경 구성

---

## 권장 기술 스택 (새 프로젝트)

```
Frontend:
  - React 19 + TypeScript 5.8
  - Vite 7 + SWC
  - Phaser 3.90 (동적 임포트)
  - TanStack Router + Query
  - Zustand
  - TailwindCSS 4 + shadcn/ui

Backend:
  - NestJS 10
  - tRPC 10 + Zod
  - Colyseus 0.15
  - Supabase (PostgreSQL + Auth)

Infrastructure:
  - pnpm workspaces (모노레포)
  - GitHub Actions (CI/CD)
  - Cloudflare Pages + Workers (웹)
  - Docker + 클라우드 (백엔드)
```

---

## 결론

**Legacy 프로젝트**는 게임 로직과 기획의 보고(寶庫)이고,
**Main 프로젝트**는 인프라와 아키텍처의 청사진입니다.

새 프로젝트는 두 프로젝트의 장점을 결합하여:
1. Legacy의 검증된 게임 메커니즘
2. Main의 현대적 인프라 패턴

을 기반으로 처음부터 깔끔하게 구축하는 것을 권장합니다.
