# app-architecture.md

## Purpose

Define the application structure for Chosen-invest.

This document covers:
- app zones
- route structure
- layout structure
- project structure
- stub page rules

Do not repeat feature definitions already covered in `feature-tree.md`.

---

## Architecture Rules

- Build the full app skeleton early
- Keep Version 1 implementation limited to MVP live routes
- Reserve stable places for future modules
- Grow by activation, not restructuring
- Keep route and layout decisions stable

---

## App Zones

### Marketing
Public-facing pages before login.

### Auth
Authentication and account access pages.

### App
Protected logged-in product experience.

### Internal
Internal/admin-only tools.

---

## Route Skeleton

```text
/
├── (marketing)
│   ├── /
│   ├── /pricing
│   ├── /about
│   └── /demo
│
├── (auth)
│   ├── /login
│   ├── /signup
│   └── /forgot-password
│
├── (app)
│   ├── /dashboard
│   ├── /portfolio
│   │   ├── /input
│   │   └── /list
│   ├── /analysis
│   ├── /ai
│   ├── /research
│   ├── /backtest
│   ├── /training
│   ├── /alerts
│   ├── /goals
│   └── /settings
│
└── (internal)
    ├── /admin
    ├── /feature-flags
    └── /monitoring