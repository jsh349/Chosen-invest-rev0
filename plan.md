# Chosen Invest Development Plan

## Goal
Build Chosen Invest step by step so each phase can be implemented, tested, and debugged in isolation.
Avoid large all-at-once coding changes.

---

## Core Product Direction
Chosen Invest should feel like a professional asset operating dashboard:
- simple
- familiar
- institutional
- intuitive
- AI-guided
- household-aware

It should not look overly gamified.
Game design should exist mainly in structure, progress, and motivation logic.

---

## Build Rules for Vibe Coding
1. One task = one screen, one card, or one function.
2. Modify at most 3 files per task when possible.
3. Use mock data before API integration.
4. Do not add new features while errors remain unresolved.
5. Run the app after every small change.
6. Commit only after a stable working state.
7. UI first, logic second, integration third, automation last.
8. Every phase must have a clear done condition.
9. If a task feels too large, split it again.
10. Prefer stable progress over fast progress.

---

# Phase 0 — Foundation Reset

## Objective
Create a stable baseline before adding major features.

## Scope
- confirm app boots cleanly
- confirm routing structure
- confirm design system basics
- confirm no blocking build/runtime errors
- define core folder structure

## Deliverables
- stable local run
- stable production build
- base layout shell
- shared UI primitives
- typed mock data models

## Done When
- app loads without runtime crash
- build succeeds
- basic dashboard shell renders
- no major console errors

## Checkpoint Before Next Phase
- Do not move on if layout/router/auth/build issues remain unresolved.

---

# Phase 1 — Static Dashboard Shell

## Objective
Build the professional home dashboard structure with no real backend dependency.

## Scope
Main sections only:
- top header
- overview card
- allocation card
- risk monitor card
- action items card
- performance snapshot card

## Implementation Order
1. header shell
2. overview card
3. allocation card
4. risk card
5. action items card
6. performance snapshot card
7. spacing and responsive cleanup

## Rules
- use mock data only
- no database
- no auth dependency
- no live APIs

## Done When
- dashboard looks coherent and professional
- each card renders from mock data
- layout works on desktop first
- mobile can be rough but usable

## Checkpoint Before Next Phase
- every card must render correctly
- no broken imports
- no hydration/runtime errors

---

# Phase 2 — Data Contracts and Mock Models

## Objective
Define the data shape before wiring real services.

## Scope
Create typed models for:
- household summary
- asset allocation
- risk summary
- action items
- performance trend
- goals
- transactions
- tax opportunities
- AI chat context

## Deliverables
- shared types/interfaces
- mock JSON fixtures
- data mapping helpers

## Done When
- all UI cards consume typed mock data
- no `any` for core business objects
- sample fixtures exist for every major screen

## Checkpoint Before Next Phase
- if types are unstable, stop here and fix them first

---

# Phase 3 — Chosen AI Chat UI Only

## Objective
Build the chat experience visually before full intelligence.

## Scope
- chat panel layout
- input box
- response cards
- suggested prompts
- action buttons below responses

## Response Structure
Each response should follow:
1. Current view
2. Key judgment
3. Recommended next step
4. Why it matters

## Rules
- use static/mock responses
- do not connect real LLM yet
- focus on UX clarity and tone

## Done When
- chat UI works cleanly
- suggested prompts work
- action buttons are visible
- visual hierarchy feels professional

## Checkpoint Before Next Phase
- confirm chat feels like an asset operating assistant, not a generic chatbot

---

# Phase 4 — Financial Analysis Engine (Local / Mock Logic)

## Objective
Implement local deterministic analysis functions before AI generation.

## Core Functions
- getAllocationStatus()
- getRiskSummary()
- getConcentrationRisk()
- getLiquidityStatus()
- getPriorityActions()
- getGoalProgress()
- getCashFlowSummary()
- getTaxOpportunitySummary()

## Rules
- functions should return structured outputs
- no LLM required here
- keep logic simple and testable first

## Done When
- dashboard and chat can read analysis outputs
- priority actions come from logic, not hardcoded text
- outputs are predictable and explainable

## Checkpoint Before Next Phase
- if outputs are inconsistent, do not connect AI yet

---

# Phase 5 — Real Data Integration: Read Only

## Objective
Connect real account/user data in read-only mode.

## Scope
- fetch household summary
- fetch asset balances
- fetch transaction list
- fetch goal data
- fetch risk inputs

## Rules
- read only first
- no write/update actions yet
- keep fallback mock mode available

## Done When
- dashboard can render real data
- chat context can load real data summary
- app degrades gracefully if one source fails

## Checkpoint Before Next Phase
- real data loading must be stable
- partial failures must not break whole dashboard

---

# Phase 6 — Goal Management

## Objective
Add clear goal planning features.

## Scope
- create goal
- edit goal
- goal progress card
- funding gap estimate
- projected target date
- monthly contribution suggestion

## Goal Types
- retirement
- emergency fund
- education
- home
- travel
- business capital
- financial freedom

## Done When
- users can track at least 3 goals
- dashboard shows top goals clearly
- Chosen AI can reference goals in responses

## Checkpoint Before Next Phase
- goals must affect recommendations meaningfully

---

# Phase 7 — Transaction Classification and Cash Flow

## Objective
Turn raw transactions into useful operating signals.

## Scope
- transaction feed
- category assignment
- category rules
- recurring detection
- monthly cash flow summary
- unusual spending flags

## Core Categories
- income
- housing
- groceries
- utilities
- subscriptions
- transport
- travel
- family
- taxes
- investments

## Done When
- monthly inflow/outflow is visible
- AI can answer “what changed this month?”
- users can correct categories

## Checkpoint Before Next Phase
- if category quality is poor, improve rules before scaling features

---

# Phase 8 — Household / Family Collaboration

## Objective
Support shared financial operations.

## Scope
- household dashboard
- invite partner
- role permissions
- shared goals
- shared action items
- note / review / approve flow

## Roles
- admin
- partner
- viewer

## Done When
- two users can view a shared household state
- shared goals are visible
- approval/review flow works for basic actions

## Checkpoint Before Next Phase
- permissions must be correct
- privacy boundaries must be clear

---

# Phase 9 — Chosen AI Orchestrated Assistant

## Objective
Turn the chat into a real contextual operating assistant.

## Inputs
- user profile
- household summary
- allocation
- risk state
- goals
- transaction summary
- tax opportunities
- recent actions

## AI Output Style
- calm
- precise
- non-hype
- action-oriented
- context-aware

## Required Behavior
- always reference user context
- focus on top 1–3 actions
- explain why
- suggest next step
- adapt to beginner vs advanced mode

## Done When
- responses differ by actual user state
- same question gets different answer depending on portfolio context
- answer format is consistent

## Checkpoint Before Next Phase
- if AI answers are generic, improve orchestration before more features

---

# Phase 10 — Tax Optimization / TLH Monitor

## Objective
Add tax-aware intelligence without overcomplicating execution.

## Scope
- harvestable loss detection
- taxable lot summary
- wash sale warning flags
- replacement idea suggestions
- estimated tax impact summary

## Important Constraint
Start as advisory mode only.
Do not begin with fully automated trade execution.

## Done When
- users can see candidate tax-loss opportunities
- AI can explain opportunity and warning flags
- replacement guidance is visible

## Checkpoint Before Next Phase
- tax guidance must be clearly framed as informational/supportive

---

# Phase 11 — Write Actions and Guided Execution

## Objective
Allow controlled user actions after analysis is stable.

## Scope
- mark action items complete
- update goal settings
- save category rules
- save household notes
- optionally prepare rebalance suggestions

## Rules
- no destructive actions without confirmation
- audit trail for important financial changes

## Done When
- users can take meaningful guided actions
- dashboard updates after action completion
- no hidden automatic changes

---

# Phase 12 — Reliability, QA, and Launch Readiness

## Objective
Stabilize before wider rollout.

## Scope
- runtime checks
- empty state handling
- loading/error states
- permission tests
- responsiveness
- content tone review
- analytics
- logging

## Done When
- major flows tested
- errors are visible and understandable
- onboarding is simple
- core flows feel trustworthy

---

# Suggested Work Unit Template

For every coding task, use this template:

## Task
Short name

## Objective
What exactly is being built

## Inputs
What data it uses

## Output
What should appear or happen

## Files Allowed
List target files

## Not Included
What must not be touched yet

## Done When
Exact visible completion criteria

---

# Example Small Tasks

## Task 1
Build dashboard header with mock metrics

## Task 2
Build overview card with household assets summary

## Task 3
Build allocation card with mock asset groups

## Task 4
Build risk monitor card with simple status bars

## Task 5
Build action items card with 3 static priority items

## Task 6
Build performance snapshot with simple line chart

## Task 7
Build chat panel shell with empty state

## Task 8
Add static AI response card

## Task 9
Add typed household summary model

## Task 10
Implement getPriorityActions() with mock logic

---

# Development Priority Order

1. stable shell
2. typed mock models
3. dashboard cards
4. chat UI
5. local analysis logic
6. real read-only data
7. goals
8. transaction classification
9. household collaboration
10. AI orchestration
11. tax optimization
12. guided write actions
13. polish and launch prep

---

# Final Principle

Chosen Invest should be built like a controlled operating system:
- first visible structure
- then typed data
- then deterministic analysis
- then real integrations
- then AI orchestration
- then advanced optimization

Never build too much at once.
