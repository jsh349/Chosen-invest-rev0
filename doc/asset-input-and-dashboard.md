# asset-input-and-dashboard.md

## 1. Plan Metadata
- Plan Name: Asset Input and Dashboard
- Status: Draft
- Owner: Chosen-invest
- Last Updated: 2026-03-19
- Related Phase: Phase 1

---

## 2. Task Summary

Build the MVP asset input flow and dashboard value experience for Chosen-invest.

This plan includes:
- the manual asset input page
- the dashboard page
- derived summary generation from asset input
- asset allocation chart
- AI asset summary
- financial health cards

This plan does not include advanced portfolio tooling or long-term tracking features.

---

## 3. Why This Matters

This is the first place where the product delivers real value.

The goal is to let a user:
- enter simple portfolio data
- immediately see a useful dashboard
- understand their asset allocation
- receive a simple AI-generated explanation
- receive quick financial diagnosis signals

If this flow works well, the product already feels useful even before advanced features exist.

---

## 4. In Scope

### Input
- manual asset input page
- simple asset entry form
- asset category selection
- asset value input
- save/continue flow into dashboard

### Dashboard
- dashboard page shell
- overview block
- asset allocation chart
- AI asset summary block
- financial health cards block

### Data Handling
- MVP source-of-truth asset input data
- derived summary generation
- derived chart data generation
- derived diagnosis output generation

### MVP UI Support
- reusable form elements if needed
- reusable card blocks if needed
- simple dashboard section composition

---

## 5. Out of Scope

- linked accounts
- institution sync
- liabilities
- transaction history
- realized/unrealized gain tracking
- historical performance engine
- alerts
- goals
- reports
- advanced analytics
- full AI chat
- personalization memory
- advanced settings
- multi-step onboarding

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

- Read only the documents listed above
- Do not load unrelated planning documents unless needed
- Use the compressed context below as the main execution context
- If data design, UX scope, or route scope conflicts appear, stop and resolve before implementation

---

## 8. Compressed Context

- Version 1 must activate only MVP Must features
- Manual Asset Input and Dashboard are both Phase 1 live features
- The main live routes in this plan are:
  - `/portfolio/input`
  - `/dashboard`
- User and Asset are the MVP source-of-truth entities
- PortfolioSummary, AllocationSlice, AIAnalysisResult, and FinancialHealthCard are derived outputs
- Asset input is manual only in Version 1
- Dashboard is the primary logged-in value page
- Reuse trusted form, layout, and chart patterns
- Keep Chosen-invest custom in dashboard value delivery, AI explanation, and diagnosis presentation
- Keep calculations simple and explicit
- Do not introduce non-MVP portfolio complexity

---

## 9. Intended Outcome

At the end of this plan, Chosen-invest should allow a logged-in user to:

- enter assets manually
- submit or save that data
- reach a dashboard
- view a meaningful allocation chart
- read a simple AI summary
- see financial health cards generated from their portfolio input

---

## 10. Route Scope

### Live Routes
- `/portfolio/input`
- `/dashboard`

### Optional Stub Routes
Use only if needed:
- `/portfolio/list`
- `/analysis`
- `/ai`

### Not Active in This Plan
- `/research`
- `/backtest`
- `/training`
- `/alerts`
- `/goals`
- `/reports`

---

## 11. Screen Scope

### Manual Asset Input Page
**Status:** Live  
**Route:** `/portfolio/input`

Purpose:
- collect the minimum portfolio data needed for MVP insight
- keep the experience simple and understandable

Must include:
- asset name
- asset category
- asset value
- save or continue action

Must avoid:
- advanced accounting feel
- too many required fields
- unnecessary financial complexity

### Dashboard Page
**Status:** Live  
**Route:** `/dashboard`

Purpose:
- serve as the main logged-in value page
- summarize the user’s portfolio clearly
- show first-layer AI and diagnosis output

Must include:
- overview block
- asset allocation chart
- AI asset summary
- financial health cards

Must avoid:
- too many secondary widgets
- future feature clutter
- ambiguous output

---

## 12. Dashboard Block Scope

### Overview Block
**Status:** Live

Purpose:
- provide a quick summary of the current portfolio state

Recommended content:
- total asset value
- asset count
- brief summary heading

### Asset Allocation Chart
**Status:** Live

Purpose:
- visualize category distribution

Minimum requirement:
- show grouped assets by category
- show values and percentages clearly

### AI Asset Summary
**Status:** Live

Purpose:
- explain the portfolio in clear, simple language
- make the dashboard feel intelligent and helpful

Minimum requirement:
- reflect current asset composition
- be understandable without advanced financial knowledge

### Financial Health Cards
**Status:** Live

Purpose:
- provide diagnosis-style signals
- help users quickly identify strengths and weaknesses

Minimum requirement:
- simple rule-based card output
- clear status messaging
- clear titles and short messages

---

## 13. UX Scope

### Primary Input-to-Insight Flow
1. User navigates to Manual Asset Input
2. User enters asset data
3. User saves/submits the data
4. User goes to Dashboard
5. Dashboard renders summary, chart, AI summary, and health cards

### Update Flow
1. User revisits asset input
2. User edits or adds assets
3. User returns to Dashboard
4. Dashboard reflects updated state

### UX Goal
The user should feel:
- input is easy
- dashboard is immediately useful
- the product explains rather than overwhelms

---

## 14. Data Scope

### Source-of-Truth Entities
- User
- Asset

### Derived Dashboard Outputs
- PortfolioSummary
- AllocationSlice
- AIAnalysisResult
- FinancialHealthCard

### Minimum Asset Fields
- id
- userId
- name
- category
- value
- currency
- createdAt
- updatedAt

### Minimum Derived Outputs
- total asset value
- total asset count
- category grouping
- category percentage
- AI summary text
- health card list

---

## 15. Technical Approach

### General Approach
- keep the input model simple
- derive dashboard output from asset input
- keep dashboard blocks modular
- avoid premature abstraction
- use explicit helper functions for derived values

### Reuse Strategy
Reuse trusted patterns for:
- forms
- validation
- card layout
- chart components
- dashboard shell structure

Customize:
- asset summary wording
- health card presentation
- dashboard information order
- financial explanation tone

### Data Handling Strategy
- treat asset input as source-of-truth
- generate portfolio summary from current assets
- generate allocation slices from categories
- generate AI summary from summary data
- generate diagnosis cards from simple explicit rules

---

## 16. Files and Areas to Inspect First

Inspect before coding:

### Pages
- portfolio input page
- dashboard page

### Layout / Shared UI
- app layout
- form components
- chart components
- card components
- dashboard section wrappers

### Data / Logic
- shared types
- constants
- mock data
- summary helpers
- diagnosis helpers
- AI summary generator or placeholder logic

---

## 17. Files and Areas Expected to Change

Expected change areas:

- `app/(app)/portfolio/input/*`
- `app/(app)/dashboard/*`
- shared dashboard components
- shared portfolio input components
- chart components
- AI summary component
- health card component
- shared types/constants/mock data
- helper logic for summary and diagnosis generation

---

## 18. Implementation Order

### Step 1 — Confirm Input and Dashboard Route Structure
- confirm `/portfolio/input`
- confirm `/dashboard`
- confirm shared logged-in layout compatibility

### Step 2 — Build Manual Asset Input Page
- create simple form
- define categories
- define value input
- define submit/save behavior

### Step 3 — Define MVP Data Types
- define asset type
- define summary type
- define allocation slice type
- define AI summary type
- define health card type

### Step 4 — Create Derived Summary Logic
- calculate total asset value
- count assets
- group assets by category
- calculate percentages

### Step 5 — Build Dashboard Page Shell
- create dashboard structure
- place overview block
- place chart block
- place AI summary block
- place health card block

### Step 6 — Build Asset Allocation Chart
- connect chart to derived allocation slices
- ensure category/value/percentage display is clear

### Step 7 — Build AI Asset Summary
- render simple explanation from portfolio summary
- keep language clear and short

### Step 8 — Build Financial Health Cards
- define simple diagnosis rules
- render cards from derived portfolio conditions

### Step 9 — Validate End-to-End Flow
- input assets
- go to dashboard
- confirm all outputs reflect input state

---

## 19. Diagnosis Logic Boundary

Version 1 diagnosis logic must stay simple.

Allowed:
- diversification signal
- concentration signal
- liquidity/basic balance signal
- simple portfolio composition observations

Not required:
- professional-grade financial planning engine
- tax-aware analysis
- forecast-based scoring
- benchmark-driven scoring
- historical return-based scoring

Keep diagnosis understandable and explicit.

---

## 20. AI Summary Boundary

Version 1 AI summary must stay simple.

Allowed:
- short portfolio explanation
- category emphasis
- simple strength/weakness commentary
- plain-language summary

Not required:
- full AI chat
- personalized memory
- deep recommendation engine
- market-aware live reasoning
- automated trading suggestions

The AI summary should feel helpful, not overpowered.

---

## 21. Risks

- turning the asset input flow into a complex financial setup
- cluttering the dashboard with too much information
- weak separation between source data and derived outputs
- building chart logic too tightly into the page
- making AI summary too generic or too verbose
- making health cards feel arbitrary or unclear

---

## 22. Validation Plan

Validate the following:

### Input Validation
- user can enter assets clearly
- categories are understandable
- values are accepted correctly
- input flow does not feel heavy

### Derived Data Validation
- total asset value is correct
- asset count is correct
- category grouping is correct
- percentages are correct

### Dashboard Validation
- dashboard loads correctly after input
- chart reflects entered assets
- AI summary reflects the portfolio state
- health cards reflect predictable rule-based output

### UX Validation
- the flow feels short and useful
- the dashboard feels worth reaching
- users can understand output without expert knowledge

---

## 23. Definition of Done

This plan is complete when:

- `/portfolio/input` works
- `/dashboard` works
- asset input creates or updates MVP source data
- dashboard renders meaningful derived output
- allocation chart works from current asset data
- AI summary works from current portfolio summary
- financial health cards work from simple explicit rules
- the input-to-dashboard flow works end-to-end
- non-MVP portfolio complexity has not been introduced

---

## 24. Non-Negotiable Constraint

Do not expand this plan into:
- liabilities
- linked accounts
- transaction history
- research tools
- alerts
- goals
- reports
- full AI chat
- advanced diagnosis engine
- backtesting
- training/personalization

If any of these are needed, stop and move them into a future scoped plan.