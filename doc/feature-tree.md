# feature-tree.md

## Purpose

Define the full Chosen-invest product feature tree.

Rules:
- Build the full product skeleton from the beginning
- Activate only MVP Must features in Version 1
- Keep future features as Stub or Later until activated by future Plan.md documents

## Status

- **Live** = implemented in Version 1
- **Stub** = structure exists, not fully implemented
- **Later** = planned, not active

## MVP Must (Version 1 Live)

- Landing Page
- Login
- Manual Asset Input
- Main Dashboard
- Asset Allocation Chart
- AI Asset Summary
- Financial Health Cards

## Feature Tree

```text
Chosen-invest
├── Home
│   ├── Landing [Live]
│   ├── Pricing [Later]
│   ├── Demo [Later]
│   ├── About [Later]
│   └── Waitlist / Invite [Later]
│
├── Auth
│   ├── Login [Live]
│   ├── Sign Up [Stub]
│   ├── Forgot Password [Later]
│   ├── Social Login [Later]
│   ├── Profile [Stub]
│   └── Security Settings [Later]
│
├── Dashboard
│   ├── Overview [Live]
│   ├── Net Worth Summary [Stub]
│   ├── Asset Allocation Chart [Live]
│   ├── AI Asset Summary [Live]
│   ├── Financial Health Cards [Live]
│   ├── Quick Actions [Stub]
│   ├── Recent Changes [Stub]
│   └── Daily Brief [Later]
│
├── Portfolio
│   ├── Manual Asset Input [Live]
│   ├── Asset List [Stub]
│   ├── Asset Categories [Stub]
│   ├── Liabilities [Later]
│   ├── Cash Holdings [Later]
│   ├── Real Estate [Later]
│   ├── Retirement Accounts [Later]
│   ├── Linked Accounts [Later]
│   └── Holdings Detail [Later]
│
├── Analysis
│   ├── Portfolio Analysis [Stub]
│   ├── Risk Score [Stub]
│   ├── Diversification Check [Stub]
│   ├── Concentration Warning [Stub]
│   ├── Allocation Insights [Stub]
│   ├── Performance Analysis [Later]
│   ├── Benchmark Comparison [Later]
│   ├── Trend Insights [Later]
│   └── Scenario Analysis [Later]
│
├── AI Coach
│   ├── AI Summary [Live]
│   ├── AI Chat [Stub]
│   ├── Suggested Actions [Stub]
│   ├── Follow-up Questions [Later]
│   ├── Saved Insights [Later]
│   ├── Personalized Coaching [Later]
│   └── Voice Interaction [Later]
│
├── Charts
│   ├── Asset Allocation Chart [Live]
│   ├── Net Worth Trend [Stub]
│   ├── Asset Category Breakdown [Stub]
│   ├── Account Comparison [Later]
│   ├── Performance Curve [Later]
│   ├── Drawdown Chart [Later]
│   └── Income / Cash Flow Chart [Later]
│
├── Research
│   ├── Watchlist [Later]
│   ├── Stock / ETF Explorer [Later]
│   ├── News Feed [Later]
│   ├── Compare Assets [Later]
│   ├── Earnings Calendar [Later]
│   └── Macro Events [Later]
│
├── Backtest
│   ├── Strategy List [Later]
│   ├── Strategy Builder [Later]
│   ├── Backtest Results [Later]
│   ├── Replay View [Later]
│   └── Saved Strategies [Later]
│
├── Training
│   ├── AI Preferences [Later]
│   ├── User Feedback Tuning [Later]
│   ├── Investment Style Learning [Later]
│   ├── Prompt Templates [Later]
│   └── Personalized Response Memory [Later]
│
├── Alerts
│   ├── Alert Center [Later]
│   ├── Price Alerts [Later]
│   ├── Risk Alerts [Later]
│   ├── Rebalancing Alerts [Later]
│   ├── Daily / Weekly Briefing [Later]
│   └── Goal Alerts [Later]
│
├── Goals
│   ├── Goal Setup [Later]
│   ├── Progress Tracking [Later]
│   ├── Freedom Roadmap [Later]
│   ├── Retirement Goal [Later]
│   ├── Home Purchase Goal [Later]
│   └── Education Goal [Later]
│
├── Reports
│   ├── Snapshot Report [Later]
│   ├── Monthly Summary [Later]
│   ├── AI Report Export [Later]
│   └── PDF Export [Later]
│
├── Settings
│   ├── Profile [Stub]
│   ├── Preferences [Stub]
│   ├── Data Management [Stub]
│   ├── Notification Settings [Later]
│   ├── Billing [Later]
│   ├── Subscription [Later]
│   └── Connected Accounts [Later]
│
└── Admin / Internal
    ├── Feature Flags [Later]
    ├── Content Management [Later]
    ├── Error Monitoring [Later]
    ├── User Feedback Review [Later]
    └── Analytics Dashboard [Later]