# Plan.md — Chosen Invest Execution Hub

## Metadata
- Last Updated: 2026-03-28
- Current Phase: Phase 1 Stabilization
- Phase 1 Build: ✅ Complete
- Next Milestone: localhost 검증 → Vercel 배포 확인 → Phase 2 시작

---

## Current Status

Phase 1 MVP Shell은 구현 완료됐다.

완료된 것:
- Landing Page (`/`)
- Login Page (`/login`, Google OAuth via Auth.js v5)
- Manual Asset Input (`/portfolio/input`)
- Dashboard (`/dashboard`) — Overview, Allocation Chart, AI Summary, Health Cards
- Stub pages: Analysis, AI, Settings, Portfolio List
- App shell: Sidebar, Header, route protection via middleware.ts
- Supabase, Turso, Gemini, Anthropic, Finnhub 클라이언트 세팅 완료

현재 작업:
- localhost:3001 실행 검증
- Vercel Production 배포 확인
- Phase 2 진입 준비

---

## Current Task

**Task:** Phase 1 Stabilization

**Goal:**
1. `npm run dev` → localhost:3001 에서 오류 없이 실행
2. Vercel Production 배포 정상 작동 확인
3. End-to-end 흐름 검증: Landing → Login → Asset Input → Dashboard

**Non-goals:**
- 새 기능 추가 금지
- Phase 2 기능 미리 구현 금지
- 데이터 영속성 구현 금지 (Phase 5에서 처리)

---

## Required References

이 작업에서 읽어야 할 문서:
- `CLAUDE.md` — 항상
- `doc/decisions.md` — 기술 결정 확인 시
- `doc/app-architecture.md` — 구조 확인 필요 시

읽지 않아도 되는 문서:
- `doc/phase1-mvp-shell.md` (완료됨, 아카이브 상태)
- `doc/landing-and-auth.md` (완료됨)
- `doc/asset-input-and-dashboard.md` (완료됨)

---

## Compressed Context

```
Tech Stack:
  Framework:   Next.js 15 (App Router), TypeScript
  Styling:     Tailwind CSS, dark theme
  Auth:        Auth.js v5, Google OAuth (AUTH_* env vars)
  DB:          Turso (libSQL) + Drizzle ORM (local: file:local.db)
  Backend DB:  Supabase
  AI:          Google Gemini 1.5 (primary), Anthropic Claude (secondary)
  Market:      Finnhub API
  Charts:      Recharts
  Port:        3001

Live Routes:
  /                   → Landing
  /login              → Google 로그인
  /portfolio/input    → 자산 수동 입력
  /dashboard          → 메인 대시보드

Stub Routes (Coming Soon 표시):
  /analysis / /ai / /settings / /portfolio/list

Auth Flow:
  auth.ts → NextAuth v5 Google provider
  middleware.ts → 보호된 라우트 자동 redirect
  app/(app)/layout.tsx → session 확인 후 진입

Data Flow (Phase 1):
  Dashboard는 MOCK_ASSETS (lib/mock/assets.ts) 기반으로 렌더링
  실제 데이터 영속성은 Phase 5에서 구현 예정

Key Files:
  auth.ts, middleware.ts
  app/(app)/dashboard/page.tsx
  app/(app)/portfolio/input/page.tsx
  features/dashboard/helpers.ts (buildPortfolioSummary)
  features/dashboard/diagnosis.ts (generateHealthCards)
  features/ai/summary-generator.ts (generateAISummary)
  lib/mock/assets.ts
```

---

## Risks

- Vercel 환경변수 미설정 시 auth 작동 불가
- `AUTH_URL` 이 production URL로 업데이트 안 되면 OAuth redirect 실패
- Turso `file:local.db` 는 로컬 전용 — Vercel 환경에서 별도 연결 필요
- Next.js 15 + Auth.js v5 beta 조합 — 간헐적 타입 오류 가능성

---

## Validation Steps

```
[ ] npm run dev → http://localhost:3001 오류 없이 실행
[ ] / → Landing 페이지 정상 렌더링
[ ] /login → Google 로그인 버튼 표시
[ ] Google 로그인 → /portfolio/input 이동
[ ] 자산 입력 → View Dashboard 클릭 → /dashboard 이동
[ ] Dashboard → Overview, Chart, AI Summary, Health Cards 4개 섹션 모두 표시
[ ] Vercel Production → 동일 흐름 정상 작동
```

---

## Definition of Done

- localhost:3001 에서 위 검증 체크리스트 전부 통과
- Vercel Production에서 위 검증 체크리스트 전부 통과
- 콘솔 에러 없음 (hydration error, type error 포함)
- Phase 2 진입 승인

---

## Phase 2 Preview (다음 Plan.md에서 다룰 내용)

Phase 2 작업은 이 Plan.md를 Phase 2용으로 교체한 뒤 시작한다.
지금 여기에 Phase 2 내용을 추가하지 않는다.

Phase 2 대상:
- 자산 데이터 Turso DB 영속 저장
- Portfolio List 페이지 활성화
- Analysis 페이지 기본 활성화
- Suggested Actions 추가
- Net Worth Trend 차트 추가
