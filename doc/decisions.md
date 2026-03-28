# decisions.md

기술 결정과 설계 선택을 기록하는 문서.
결정 이유와 맥락을 남긴다. 추후 번복 시 이 문서를 먼저 읽는다.

---

## 기술 스택 결정

### [2026-03-28] Auth.js v5 (next-auth@beta) 채택

**결정:** NextAuth v4 대신 Auth.js v5 사용

**이유:**
- `.env.local`의 `AUTH_*` 환경변수 체계가 v5 표준
- `middleware.ts` 기반 라우트 보호가 더 명확하고 간결
- `auth()` server component에서 직접 호출 가능

**트레이드오프:**
- beta 버전이라 간헐적 타입 에러 가능성 있음
- 공식 문서가 v4 기준 예제가 많아 검색 시 혼동 주의

**관련 파일:** `auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`

---

### [2026-03-28] Turso (libSQL) + Drizzle ORM 채택

**결정:** 로컬 개발은 `file:local.db`, 프로덕션은 Turso 원격 URL 사용

**이유:**
- `.env.local`에 `TURSO_CONNECTION_URL=file:local.db` 이미 정의됨
- SQLite 기반이라 로컬 설정 없이 바로 개발 시작 가능
- Drizzle ORM은 타입 안전하고 마이그레이션 명령 단순

**트레이드오프:**
- Vercel 배포 시 `file:local.db` 작동 불가 → `TURSO_CONNECTION_URL`을 원격 URL로 교체 필요
- 현재 Phase 1에서는 Turso를 실제로 사용하지 않음 (mock data 사용)

**관련 파일:** `lib/db/turso.ts`, `lib/db/schema.ts`, `drizzle.config.ts`

---

### [2026-03-28] Supabase 추가 (보조 backend)

**결정:** 향후 사용자 데이터 및 RLS(Row Level Security)용으로 Supabase 세팅

**이유:**
- `.env.local`에 Supabase URL/Key 이미 포함
- RLS 기반 멀티유저 데이터 분리에 적합
- Storage, Realtime 등 향후 기능 확장 시 활용 가능

**현재 상태:** 클라이언트만 세팅. 실제 테이블/쿼리는 Phase 5 이후 구현.

**관련 파일:** `lib/supabase/client.ts`, `lib/supabase/server.ts`

---

### [2026-03-28] Google Gemini 1.5 (primary AI) + Anthropic Claude (secondary)

**결정:** AI Summary는 Gemini Flash 우선, 복잡한 분석은 Claude 사용

**이유:**
- `GOOGLE_GENERATIVE_AI_API_KEY` 이미 설정됨 → Gemini 즉시 사용 가능
- `ANTHROPIC_API_KEY` 빈 값 → Claude는 추후 채워서 사용
- Gemini Flash는 빠르고 저렴, 대시보드 요약 생성에 적합

**현재 상태:** Phase 1에서는 deterministic summary generator 사용 (AI API 미호출). Phase 3부터 실제 AI 호출 전환 예정.

**관련 파일:** `lib/ai/gemini.ts`, `lib/ai/anthropic.ts`, `features/ai/summary-generator.ts`

---

### [2026-03-28] Finnhub API 채택 (시장 데이터)

**결정:** 주식/ETF 실시간 시세 및 심볼 검색에 Finnhub 사용

**이유:**
- `NEXT_PUBLIC_FINNHUB_API_KEY` 이미 설정됨
- 무료 플랜으로 기본 시세 조회 가능
- Phase 2 자산 입력 시 실시간 가격 제안 기능에 활용 예정

**현재 상태:** 클라이언트만 세팅. 실제 호출은 Phase 2 이후.

**관련 파일:** `lib/market/finnhub.ts`

---

### [2026-03-28] 개발 포트 3001

**결정:** `next dev -p 3001` 사용

**이유:** `AUTH_URL=http://localhost:3001` 환경변수 기준에 맞춤

**주의:** Google Cloud Console OAuth 허용 URI에 `http://localhost:3001` 등록 필요

---

### [2026-03-28] Phase 1 대시보드 — Mock Data 사용

**결정:** Dashboard는 `lib/mock/assets.ts` 기반으로 렌더링, 실제 DB 연결 없음

**이유:**
- UI/UX 검증을 DB 연결보다 먼저 완료하기 위함
- plan.md 원칙: "Mock data before API integration"

**해제 시점:** Phase 5 (Real Data Integration) 단계에서 실제 데이터로 교체

---

## 폴더 구조 결정

### [2026-03-28] `doc/` (단수) 유지

**결정:** 계획서의 `docs/`(복수)가 아닌 `doc/`(단수) 유지

**이유:** 이미 GitHub master 브랜치에 `doc/` 폴더로 push됨. 변경 시 혼란 발생.

**주의:** 코드에서 문서를 참조할 때 `doc/` 사용
