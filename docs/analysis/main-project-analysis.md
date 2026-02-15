# Main Project Analysis: my-five-tiger-generals

> 분석일: 2026-02-02
> 경로: `/Users/whchoi/dev/my-five-tiger-generals/`

---

## 1. 프로젝트 개요

**유형**: 모노레포 기반 실시간 멀티플레이어 보드게임
**목적**: 프로덕션 수준의 인프라 구축 + 게임 서비스
**상태**: 웹 프론트엔드 배포 완료, 백엔드 로컬 개발 단계

---

## 2. 기술 스택

### 2.1 프론트엔드

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| **프레임워크** | React | 19.1.1 |
| **언어** | TypeScript | 5.8.3 |
| **게임 엔진** | Phaser | 3.90.0 |
| **라우팅** | TanStack Router | 1.131.41 |
| **상태관리 (클라이언트)** | Zustand | 5.0.8 |
| **상태관리 (서버)** | TanStack Query | 5.87.4 |
| **스타일링** | TailwindCSS | 4.1.13 |
| **UI 컴포넌트** | Radix UI + shadcn/ui | Latest |
| **빌드 도구** | Vite | 7.1.2 |
| **트랜스파일러** | SWC | 5.0.1 |

### 2.2 백엔드

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| **API 프레임워크** | NestJS | 10.3.0+ |
| **API 타입 레이어** | tRPC | 10.45.0 |
| **검증** | Zod | 3.22.4 |
| **데이터베이스** | Supabase (PostgreSQL) | - |
| **인증** | Supabase Auth + JWT | - |
| **게임 서버** | Colyseus | 0.15.0 |
| **프로토콜** | WebSocket | - |
| **런타임** | Node.js | 22.19.0+ |

### 2.3 인프라 & DevOps

| 카테고리 | 기술 |
|---------|------|
| **패키지 매니저** | pnpm |
| **모노레포 관리** | pnpm workspaces |
| **테스팅** | Playwright, Vitest |
| **CI/CD** | GitHub Actions |
| **웹 호스팅** | Cloudflare Pages |
| **SSR 호스팅** | Cloudflare Workers |
| **백엔드 호스팅** | Docker-ready (미배포) |

---

## 3. 프로젝트 구조

```
my-five-tiger-generals/
├── apps/                          # 3개 독립 애플리케이션
│   ├── web/                       # React SPA + SSR (Vite 7)
│   │   ├── src/
│   │   │   ├── components/        # React UI
│   │   │   ├── routes/            # TanStack Router (파일 기반)
│   │   │   ├── hooks/             # useGameLoader (핵심!)
│   │   │   ├── lib/               # tRPC 클라이언트
│   │   │   └── stores/            # Zustand 스토어
│   │   ├── wrangler.toml          # Cloudflare 설정
│   │   └── vite.config.ts
│   ├── server/                    # NestJS API + tRPC
│   │   └── src/
│   │       ├── auth/              # JWT 인증 모듈
│   │       ├── users/             # 사용자 관리
│   │       ├── trpc/              # tRPC 라우터
│   │       └── supabase/          # Supabase 통합
│   └── game-server/               # Colyseus 게임 서버
│       └── src/
│           ├── rooms/             # GameRoom
│           ├── game/              # GameLogic
│           ├── handlers/          # PlayerActionHandler
│           └── schemas/           # GameState
├── packages/                      # 공유 라이브러리
│   ├── game/                      # 게임 로직 (Phaser-free)
│   ├── api-types/                 # tRPC 타입 정의
│   └── ui/                        # 공유 UI 컴포넌트
├── docs/                          # 문서화
├── .github/workflows/             # CI/CD 파이프라인
└── pnpm-workspace.yaml            # 워크스페이스 설정
```

---

## 4. 인프라 구성 상세

### 4.1 Cloudflare 배포 (✅ 운영 중)

**wrangler.toml 설정**:
```toml
name = "my-five-tiger-generals"
main = "./dist/worker/entry-worker.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = "./dist/client"

[env.staging]
name = "my-five-tiger-generals-staging"
```

**특징**:
- Edge 배포 (글로벌 CDN)
- SSR 지원 (Workers)
- Staging/Production 환경 분리
- 무료 티어로 무제한 요청

### 4.2 CI/CD 파이프라인

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
트리거: main 브랜치 push + manual workflow_dispatch
환경: ubuntu-latest, Node 22

단계:
1. 코드 체크아웃
2. Node.js 22 설정
3. pnpm v8 설정
4. pnpm store 캐싱
5. 의존성 설치 (--frozen-lockfile)
6. 애플리케이션 빌드
7. Cloudflare Workers 배포
8. Cloudflare Pages 배포

필요 시크릿:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
```

### 4.3 개발 환경 포트

```
Web App (Vite)     → 5173
Web App (SSR)      → 3000
API Server (tRPC)  → 4000
Game Server (WS)   → 2567
```

### 4.4 모노레포 구성

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**주요 스크립트**:
```bash
pnpm dev:all     # 웹 + 서버 동시 실행
pnpm build       # 전체 패키지 빌드
pnpm typecheck   # 모노레포 전체 타입 체크
pnpm lint        # 전체 린트
```

---

## 5. 핵심 아키텍처 패턴

### 5.1 SSR Safe Dynamic Import (가장 중요!)

**문제**: Phaser는 브라우저 전용 (`window` 필요)
**해결**: `useGameLoader` 훅으로 동적 임포트

```typescript
// apps/web/src/hooks/useGameLoader.ts
const useGameLoader = () => {
  return useQuery({
    queryKey: ['phaser'],
    queryFn: async () => {
      if (typeof window === 'undefined') return null;
      return import('phaser');
    }
  });
};
```

### 5.2 Factory Pattern (의존성 주입)

```typescript
// packages/game/src/index.ts
export const createGame = (Phaser: typeof PhaserType) => {
  // Phaser를 매개변수로 받아 서버 사이드 안전
};
```

### 5.3 tRPC End-to-End Type Safety

```
Client (React) ←→ Server (NestJS)
    ↓                   ↓
  tRPC Client      tRPC Router
    ↓                   ↓
  Zod Validation   Zod Validation
    ↓                   ↓
  @my-five-tiger-generals/api-types (공유 타입)
```

### 5.4 Colyseus 실시간 멀티플레이어

```
GameRoom (조정자)
    ├── onJoin()       # 플레이어 입장
    ├── onMessage()    # 메시지 라우팅
    └── onLeave()      # 플레이어 퇴장

GameLogic (규칙 엔진)
    ├── applyAction()  # 액션 적용
    └── validateMove() # 이동 검증

GameState (Schema)
    ├── players        # 플레이어 상태
    ├── board          # 보드 상태
    └── turn           # 턴 정보
```

---

## 6. 개발 현황

### 6.1 최근 커밋 히스토리

```
최신:    Update sprint status for Story 2.1
         feat: Enhance Game component with debugging tools
         feat: Add chat UI with Drawer component
         feat: Add Naver login UI and implementation plan
         feat: Upgrade to TailwindCSS 4.x
         feat: Add NestJS API server with tRPC integration
         feat: Implement core game server architecture (Colyseus)
```

### 6.2 컴포넌트별 완성도

| 컴포넌트 | 완성도 | 상태 |
|---------|--------|------|
| **Web Frontend** | 80% | ✅ 배포됨 |
| **API Server** | 70% | 🔄 로컬 개발 |
| **Game Server** | 60% | 🔄 로컬 개발 |
| **Database** | 40% | ⏳ 스키마 준비됨 |

### 6.3 배포 현황

| 서비스 | 상태 | 플랫폼 |
|--------|------|--------|
| Web (Static + SSR) | ✅ 운영 | Cloudflare Pages + Workers |
| API Server | 📋 준비됨 | Docker-ready |
| Game Server | 📋 준비됨 | Docker-ready |
| Database | 📋 준비됨 | Supabase |

---

## 7. Legacy 프로젝트와 비교

| 항목 | Legacy | Main |
|------|--------|------|
| **아키텍처** | Monolith | Monorepo (3 apps + 3 packages) |
| **백엔드** | 없음 | NestJS + Colyseus |
| **API 타입** | 없음 | tRPC + Zod |
| **데이터베이스** | 없음 | Supabase |
| **멀티플레이어** | 없음 | Colyseus WebSocket |
| **배포** | GitHub Pages | Cloudflare + Docker |
| **테스팅** | 없음 | Playwright E2E |
| **SSR** | 없음 | Cloudflare Workers |
| **CI/CD** | 없음 | GitHub Actions |

---

## 8. 핵심 파일 목록

### 루트 설정 파일

| 파일 | 역할 |
|------|------|
| `package.json` | 루트 워크스페이스 스크립트 |
| `pnpm-workspace.yaml` | 모노레포 정의 |
| `CLAUDE.md` | AI 어시스턴트 컨텍스트 |
| `GITHUB_SECRETS_SETUP.md` | 배포 시크릿 가이드 |

### Web App 핵심 파일

| 파일 | 라인 | 역할 |
|------|------|------|
| `useGameLoader.ts` | ~30 | **핵심**: SSR-safe Phaser 로딩 |
| `Game.tsx` | ~80 | 메인 게임 컴포넌트 |
| `wrangler.toml` | ~27 | Cloudflare 배포 설정 |
| `entry-worker.tsx` | ~50 | SSR 엔트리 포인트 |

### Server App 핵심 파일

| 파일 | 역할 |
|------|------|
| `main.ts` | NestJS 부트스트랩 |
| `trpc.router.ts` | tRPC 라우터 정의 |
| `auth.service.ts` | JWT 인증 로직 |
| `supabase.service.ts` | Supabase 클라이언트 |

### Game Server 핵심 파일

| 파일 | 역할 |
|------|------|
| `index.ts` | Express + Colyseus 설정 |
| `GameRoom.ts` | 메인 게임 룸 |
| `GameLogic.ts` | 게임 규칙 엔진 |
| `GameState.ts` | Colyseus 상태 스키마 |

---

## 9. 재사용 가치 평가

### 높은 재사용 가치 (✅)

- **인프라 패턴**: Cloudflare 배포, CI/CD, 모노레포 구조
- **SSR Safe Pattern**: useGameLoader 훅
- **tRPC 설정**: 엔드투엔드 타입 안전성
- **Colyseus 구조**: 게임 룸/로직/상태 분리

### 중간 재사용 가치 (🔄)

- **NestJS 모듈**: 인증/사용자 모듈 (비즈니스 로직 추가 필요)
- **UI 컴포넌트**: shadcn/ui 기반 (커스터마이징 필요)
- **게임 로직**: packages/game (legacy에서 포팅됨)

### 낮은 재사용 가치 (❌)

- **현재 게임 UI**: 디버깅 도구 위주
- **테스트 코드**: 최소 커버리지

---

## 10. 배포 토폴로지

### 현재 상태

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                       │
├─────────────────────────────────────────────────────────┤
│  Pages (Static)    │    Workers (SSR)                    │
│  dist/client/      │    dist/worker/                     │
└────────────┬───────┴────────────┬──────────────────────┘
             │                    │
             ▼                    ▼
        ┌────────────────────────────────┐
        │  Localhost (Development)       │
        │  - API: 4000 (NestJS)          │
        │  - Game: 2567 (Colyseus)       │
        └────────────────────────────────┘
```

### 목표 상태 (계획)

```
┌─────────────────────────────────────────────────────────┐
│         Cloudflare (Web)                                │
│  Pages + Workers (Static + SSR)                         │
└────────────┬────────────────────────────────────────────┘
             │ HTTPS
             ▼
┌──────────────────────────────────────────────────────────┐
│  Kubernetes or Docker Compose (Backend Services)        │
├──────────────────────────────────────────────────────────┤
│  Pod 1: NestJS API         │   Pod 2: Colyseus Game    │
│  ├─ Port 4000             │   ├─ Port 2567           │
│  └─ Supabase Client        │   └─ Stateful (rooms)    │
│                                                         │
│  Database: Supabase PostgreSQL                         │
└──────────────────────────────────────────────────────────┘
```

---

## 11. 결론

### 강점
1. 현대적이고 잘 설계된 모노레포
2. 엔드투엔드 타입 안전성 (tRPC + TypeScript)
3. 엔터프라이즈급 프레임워크 선택 (NestJS, Colyseus)
4. 클라우드 네이티브 배포 준비 완료
5. 포괄적인 문서화
6. SSR 지원

### 개선 필요 영역
1. **백엔드 미배포**: API, Game 서버 로컬 전용
2. **네이버 로그인**: 계획됨, 미구현
3. **데이터베이스**: 스키마 준비됨, 미연동
4. **테스트**: E2E 커버리지 부족
5. **Docker/K8s**: 준비됐으나 실제 구성 없음

### 권장 활용 방안
- 인프라 패턴 (CI/CD, 모노레포, 배포 설정)을 새 프로젝트의 템플릿으로 사용
- tRPC + NestJS + Colyseus 통합 구조 참조
- SSR Safe Phaser 로딩 패턴 재사용
