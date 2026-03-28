# phase1-mvp-shell.md

## 1. Plan Metadata
- Plan Name: Phase 1 MVP Shell
- Status: Draft
- Owner: Chosen-invest
- Last Updated: 2026-03-19
- Related Phase: Phase 1

---

## 2. Task Summary

Build the Phase 1 MVP shell for Chosen-invest.

This plan creates:
- the initial app skeleton
- the primary MVP live routes
- the shared layout structure
- the first usable end-to-end user flow

This plan does **not** attempt to fully implement future modules.

---

## 3. Why This Matters

This is the first real executable layer of the product.

The goal is to create a stable application foundation that:
- feels like a real product
- supports the MVP Must experience
- leaves clean room for future expansion
- avoids future restructuring

If this shell is built correctly, future features can be activated without redesigning the foundation.

---

## 4. In Scope

### App Shell
- route groups
- shared layout structure
- navigation skeleton
- live vs stub separation

### MVP Live Pages
- Landing Page
- Login Page
- Manual Asset Input Page
- Dashboard Page

### Dashboard Live Sections
- Overview section
- Asset Allocation Chart section
- AI Asset Summary section
- Financial Health Cards section

### Supporting MVP Structure
- shared UI shell
- basic data types
- mock/sample data for MVP rendering
- optional stub pages only if needed for route stability

---

## 5. Out of Scope

- linked account integrations
- liabilities
- transaction history
- portfolio performance engine
- alerts
- goals
- reports
- backtesting
- AI training
- advanced settings
- advanced auth flows
- production-grade personalization
- full chat AI system
- complex persistence strategy
- internal/admin tooling

---

## 6. Required References

Read only these documents for this plan:

- `CLAUDE.md`
- `feature-tree.md`
- `app-architecture.md`
- `rollout-phases.md`
- `mvp-experience.md`
- `mvp-data-model.md`
- `reference-patterns.md`

---

## 7. Reference Rule

- Read only the required references above
- Do not load unrelated planning documents unless needed
- Use the compressed context below as the main execution context
- If a conflict appears between implementation and reference docs, stop and resolve it before continuing

---

## 8. Compressed Context

- Build the full app skeleton early, but activate only MVP Must features in Version 1
- Phase 1 live features are:
  - Landing Page
  - Login
  - Manual Asset Input
  - Main Dashboard
  - Asset Allocation Chart
  - AI Asset Summary
  - Financial Health Cards
- Core live routes are:
  - `/`
  - `/login`
  - `/dashboard`
  - `/portfolio/input`
- Dashboard is the main logged-in value page
- Asset input is manual only in Version 1
- User and Asset are the MVP source-of-truth entities
- PortfolioSummary, AllocationSlice, AIAnalysisResult, and FinancialHealthCard are derived outputs
- Reuse trusted infrastructure patterns
- Keep Chosen-invest custom in landing messaging, dashboard value delivery, AI explanation, and diagnosis presentation
- Stub pages are allowed only if they help preserve route clarity and future expansion

---

## 9. Intended Outcome

At the end of this plan, Chosen-invest should have:

- a stable application skeleton
- working core MVP routes
- a complete primary user flow
- a dashboard that renders meaningful output from asset input
- a structure ready for Phase 2 expansion

---

## 10. Route Scope

### Live Routes
- `/`
- `/login`
- `/dashboard`
- `/portfolio/input`

### Optional Stub Routes
Use only if helpful:
- `/signup`
- `/portfolio/list`
- `/analysis`
- `/ai`
- `/settings`

### Not Active in This Plan
- `/pricing`
- `/about`
- `/demo`
- `/forgot-password`
- `/research`
- `/backtest`
- `/training`
- `/alerts`
- `/goals`
- internal/admin routes

---

## 11. Screen Scope

### Live Screens
- Landing Page
- Login Page
- Manual Asset Input Page
- Dashboard Page

### Dashboard Live Blocks
- Overview block
- Asset Allocation Chart block
- AI Asset Summary block
- Financial Health Cards block

### Optional Stub Screens
- Sign Up
- Portfolio List
- Analysis
- AI
- Settings

---

## 12. UX Scope

### Primary MVP Flow
1. User lands on Landing Page
2. User understands the product
3. User clicks Login
4. User logs in
5. User enters assets manually
6. User submits asset input
7. User reaches Dashboard
8. User sees:
   - overview
   - allocation chart
   - AI summary
   - financial health cards

### Returning User Flow
1. User logs in
2. User reaches Dashboard
3. User reviews current portfolio state
4. User may return to asset input and update information

---

## 13. Data Scope

### Source of Truth
- User
- Asset

### Derived Outputs
- PortfolioSummary
- AllocationSlice
- AIAnalysisResult
- FinancialHealthCard

### Minimum Version 1 Data Needs
- asset name
- asset category
- asset value
- user ownership linkage
- summary generation timestamp
- diagnosis output
- chart-ready allocation slices

---

## 14. Technical Approach

### General Approach
- create the shell first
- implement the smallest complete MVP path
- avoid advanced architecture before it is necessary
- prefer explicit simple logic over abstraction

### Reuse Strategy
Reuse trusted patterns for:
- route grouping
- layout structure
- auth structure
- form handling
- chart implementation
- placeholder pages

Customize:
- landing page copy
- dashboard information order
- AI summary style
- financial diagnosis card presentation

### Rendering Strategy
- use source data for asset input
- derive dashboard summary outputs from input data
- keep dashboard sections modular
- avoid hard-coupling AI output directly into page layout logic

---

## 15. Files and Areas to Inspect First

Inspect before coding:

### Routing / Layout
- route groups
- root layout
- marketing layout
- auth layout
- app layout

### Pages
- landing page
- login page
- portfolio input page
- dashboard page

### Shared UI
- layout components
- form components
- chart components
- card components
- stub page component if used

### Data / Logic
- shared types
- constants
- mock data
- utility functions for summary generation

---

## 16. Files and Areas Expected to Change

Expected change areas:

- `app/` route files
- layout files
- dashboard components
- portfolio input components
- chart components
- AI summary component
- financial health card component
- shared types/constants/mock data
- reusable UI shell files

---

## 17. Implementation Order

### Step 1 — Confirm Skeleton
- confirm route groups
- confirm app zones
- confirm layout split between marketing, auth, and app

### Step 2 — Build Shared Layout Shell
- create or confirm header structure
- create or confirm sidebar structure
- create stable main content layout for logged-in pages

### Step 3 — Build Landing Page
- create MVP marketing entry page
- keep message clear and simple
- add primary CTA to login

### Step 4 — Build Login Page
- create clean login flow entry
- keep scope limited to MVP access

### Step 5 — Build Manual Asset Input Page
- create simple asset input form
- allow category/value-based entry
- allow transition to dashboard

### Step 6 — Define MVP Data Layer
- create core types
- create mock/sample asset data if needed
- create derived summary helpers

### Step 7 — Build Dashboard Shell
- create dashboard page structure
- define block layout
- keep scope focused

### Step 8 — Add Allocation Chart
- render category-based allocation from input/derived data

### Step 9 — Add AI Asset Summary
- render simple explanation based on portfolio summary

### Step 10 — Add Financial Health Cards
- render diagnosis-style cards from simple rules

### Step 11 — Add Optional Stub Pages
- add only if needed for route/navigation stability

### Step 12 — Validate End-to-End Flow
- test landing → login → asset input → dashboard

---

## 18. Stub Rules

Stub pages are optional, not mandatory.

Use a stub only when it helps:
- route stability
- navigation clarity
- future expansion planning

A stub page must:
- state clearly that the feature is inactive or coming soon
- avoid fake completeness
- not interrupt the main MVP flow

---

## 19. Risks

- overbuilding non-MVP routes too early
- cluttering dashboard with future concepts
- mixing live and stub behavior
- weak separation between source input data and derived output
- over-customizing low-value infrastructure
- making the app shell too complex for Phase 1

---

## 20. Validation Plan

Validate the following:

### Flow Validation
- user can move from landing to login
- user can move from login to asset input
- user can move from asset input to dashboard

### Data Validation
- dashboard reflects entered or mocked asset data
- allocation chart reflects category distribution correctly
- AI summary matches portfolio input context
- financial health cards render predictable output

### UX Validation
- flow feels short and understandable
- dashboard feels useful immediately
- no inactive feature appears misleadingly active

### Architecture Validation
- future modules have reserved places
- MVP flow is not blocked by future structure
- shell does not require restructuring for Phase 2

---

## 21. Definition of Done

This plan is complete when:

- the app skeleton exists
- marketing/auth/app layout separation exists
- all Phase 1 live routes are working
- Landing Page works
- Login Page works
- Manual Asset Input Page works
- Dashboard works
- Dashboard shows:
  - overview
  - allocation chart
  - AI summary
  - financial health cards
- the primary MVP flow works end-to-end
- optional stub pages, if present, are clearly inactive
- non-MVP modules do not interfere with the MVP experience

---

## 22. Non-Negotiable Phase 1 Constraint

Do not expand beyond the MVP shell in this plan.

If a feature requires:
- alerts
- goals
- linked accounts
- research tools
- backtesting
- AI personalization
- advanced settings
- new data entities outside MVP scope

then stop and move that work into a future scoped plan.