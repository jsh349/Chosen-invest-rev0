# rollout-phases.md

## Purpose

Define the activation order of Chosen-invest features.

This document covers:
- release phases
- which modules become live in each phase
- what remains stub or later
- how the product expands without breaking the core MVP

Do not repeat feature definitions from `feature-tree.md`.
Do not repeat route/layout structure from `app-architecture.md`.

---

## Rollout Rules

- Version 1 must stay focused on MVP Must features
- New features should be activated in small controlled phases
- Each activation should have its own scoped `Plan.md`
- Do not activate advanced modules before their supporting data/model structure is ready
- Do not overload the product too early

---

## Phase Overview

### Phase 1
Build the first usable MVP.

### Phase 2
Expand the core user experience around portfolio visibility and AI guidance.

### Phase 3
Add supporting product value such as alerts, goals, and research.

### Phase 4
Add advanced tools such as backtesting and AI training.

---

## Phase 1 — MVP Live

Goal:
Deliver the minimum useful version of Chosen-invest.

Live:
- Landing Page
- Login
- Manual Asset Input
- Main Dashboard
- Asset Allocation Chart
- AI Asset Summary
- Financial Health Cards

Allowed Stub:
- Sign Up
- Profile
- Preferences
- Data Management
- Asset List
- Analysis page placeholder
- AI page placeholder
- Settings page placeholder

Not Active:
- Research
- Backtest
- Training
- Alerts
- Goals
- Reports
- Admin/Internal tools

Success condition:
- a user can enter the product
- log in
- manually input assets
- view a dashboard
- see asset allocation
- see AI summary
- see financial diagnosis

---

## Phase 2 — Core Product Expansion

Goal:
Strengthen the main logged-in experience without changing the product foundation.

Activate:
- Asset List
- Asset Categories
- Portfolio Analysis
- Risk Score
- Diversification Check
- Concentration Warning
- Suggested Actions
- Net Worth Trend
- Asset Category Breakdown
- Basic Settings pages
- Basic Profile page

Optional:
- Sign Up
- Social Login

Keep Later:
- Research
- Backtest
- Training
- Alerts
- Goals
- Reports

Success condition:
- users can not only input assets but also review and interpret them more deeply
- dashboard becomes more useful without becoming overloaded
- users gain clearer next-step guidance

---

## Phase 3 — Supporting Intelligence Layer

Goal:
Add supporting decision tools around the core portfolio experience.

Activate:
- Alert Center
- Price Alerts
- Risk Alerts
- Rebalancing Alerts
- Goal Setup
- Progress Tracking
- Freedom Roadmap
- Watchlist
- Stock / ETF Explorer
- News Feed
- Compare Assets
- Snapshot Report
- Monthly Summary
- PDF Export

Keep Later:
- Backtest
- Training
- advanced admin/internal tools

Success condition:
- users can monitor their portfolio more proactively
- users can track goals and receive supporting signals
- users begin using Chosen-invest regularly, not only occasionally

---

## Phase 4 — Advanced Tools

Goal:
Add advanced power-user and intelligence-training features.

Activate:
- Strategy List
- Strategy Builder
- Backtest Results
- Replay View
- Saved Strategies
- AI Preferences
- User Feedback Tuning
- Investment Style Learning
- Prompt Templates
- Personalized Response Memory

Optional:
- Personalized Coaching
- Saved Insights
- Follow-up Questions
- Voice Interaction

Success condition:
- advanced users can test ideas
- AI interaction becomes more personalized
- Chosen-invest grows beyond dashboard intelligence into a broader research platform

---

## Activation Policy

When activating a new phase:

- do not break the working MVP flow
- do not redesign the foundation unless absolutely necessary
- prefer activation over restructuring
- update the related plan and supporting docs first
- keep user-facing functionality honest and clearly scoped

---

## Suggested Sequence of Work

1. Complete Phase 1 MVP
2. Stabilize dashboard and asset input flows
3. Expand portfolio understanding features
4. Add monitoring and goal-oriented support
5. Add advanced research/backtest/training features

---

## Notes

- Not every Later feature must become a Stub before activation
- Stub is optional and should be used only when it helps architectural clarity
- Each phase should remain usable on its own
- Future activation should happen through separate scoped `Plan.md` documents

---

## Summary

Phase 1:
- basic usable product

Phase 2:
- deeper portfolio understanding

Phase 3:
- supporting monitoring and goal features

Phase 4:
- advanced research, backtest, and AI training