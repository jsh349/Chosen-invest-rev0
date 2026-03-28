# mvp-experience.md

## Purpose

Define the MVP user experience for Chosen-invest.

This document covers:
- the MVP user flow
- the MVP screen list
- the purpose of each screen
- which screens are Live or Stub in Version 1

Do not repeat full feature definitions from `feature-tree.md`.
Do not repeat route/layout rules from `app-architecture.md`.

---

## MVP Goal

Version 1 must deliver a simple but valuable first experience.

A user should be able to:
- understand what Chosen-invest does
- log in
- manually enter assets
- reach a useful dashboard
- see portfolio allocation
- receive AI-generated summary
- see financial health diagnosis

The MVP must feel focused, not overloaded.

---

## MVP Experience Rule

Version 1 should optimize for the shortest meaningful path to value.

That means:
- minimal friction before the dashboard
- no unnecessary screens in the first flow
- clear progression from entry to insight
- only MVP Must features should be fully usable
- Stub pages may exist, but must not interrupt the main flow

---

## Primary MVP User Flow

### Flow 1: First-Time Core Experience

1. User lands on the Landing Page
2. User understands the core value proposition
3. User clicks Login
4. User logs in
5. User enters assets manually
6. User submits asset input
7. User is taken to the Dashboard
8. User sees:
   - main dashboard overview
   - asset allocation chart
   - AI asset summary
   - financial health cards

This is the primary MVP success flow.

---

## Secondary MVP Flows

### Flow 2: Returning User
1. User logs in
2. User goes directly to Dashboard
3. User reviews portfolio summary and diagnosis
4. User may return to asset input to update data

### Flow 3: Asset Update
1. User enters Dashboard
2. User navigates to Manual Asset Input
3. User edits or re-enters asset information
4. User returns to Dashboard
5. Updated summary and chart are shown

These flows support repeat usage without adding major complexity.

---

## MVP Screen List

### 1. Landing Page
**Status:** Live  
**Route:** `/`

**Purpose:**
- explain the product clearly
- communicate the value of AI-assisted financial insight
- guide the user toward login

**Must include:**
- clear headline
- simple supporting message
- primary CTA to login
- clean visual structure

**Must not:**
- overwhelm with too many sections
- expose advanced product complexity too early

---

### 2. Login Page
**Status:** Live  
**Route:** `/login`

**Purpose:**
- provide simple access into the product

**Must include:**
- clean login form
- clear submit action
- trust-focused layout

**May include later:**
- sign up
- social login
- forgot password

**Must not:**
- introduce unrelated product flows

---

### 3. Manual Asset Input Page
**Status:** Live  
**Route:** `/portfolio/input`

**Purpose:**
- let the user manually enter core asset data
- create the minimum data needed for dashboard insight

**Must include:**
- simple input structure
- clear asset categories
- save or continue action
- low-friction form flow

**Must not:**
- feel like a complicated accounting system
- require advanced financial setup in Version 1

---

### 4. Dashboard Page
**Status:** Live  
**Route:** `/dashboard`

**Purpose:**
- serve as the main value page of the MVP
- show the user their financial picture clearly
- provide immediate insight after asset entry

**Must include:**
- overview area
- asset allocation chart
- AI asset summary
- financial health cards

**Must not:**
- become overloaded with future modules
- force the user into too many next steps

---

## Dashboard Internal Sections

These are not separate pages in Version 1.
They are dashboard sections.

### A. Overview Section
**Status:** Live

**Purpose:**
- summarize the current financial picture at a glance

---

### B. Asset Allocation Chart
**Status:** Live

**Purpose:**
- visualize how assets are distributed

---

### C. AI Asset Summary
**Status:** Live

**Purpose:**
- explain the portfolio in simple AI-generated language

---

### D. Financial Health Cards
**Status:** Live

**Purpose:**
- show diagnosis-style summary cards
- help users quickly understand strengths and weaknesses

---

## MVP Stub Screens

These screens may exist as lightweight placeholders if useful for structure, but they are not required to be fully active in Version 1.

### Sign Up
**Status:** Stub  
**Route:** `/signup`

### Portfolio List
**Status:** Stub  
**Route:** `/portfolio/list`

### Analysis
**Status:** Stub  
**Route:** `/analysis`

### AI Page
**Status:** Stub  
**Route:** `/ai`

### Settings
**Status:** Stub  
**Route:** `/settings`

Stub screens must:
- clearly state inactive or coming soon status
- not interrupt the main MVP flow
- reserve space for future activation

---

## Screen Relationship Summary

### Entry
- Landing Page

### Access
- Login Page

### Input
- Manual Asset Input Page

### Value Delivery
- Dashboard Page

### Future Expansion
- Analysis
- AI
- Settings
- Portfolio List

---

## MVP Experience Priorities

Version 1 priorities:

1. Clarity
2. Simplicity
3. Fast path to insight
4. Trustworthy presentation
5. Reusable foundation for future growth

Version 1 should not optimize for:
- advanced strategy tools
- complex account linking
- deep personalization
- social/community features
- heavy research workflows

---

## MVP Experience Success Criteria

The MVP experience is successful if a first-time user can:

- understand the product quickly
- enter the product without confusion
- provide basic financial input
- reach a dashboard with useful output
- understand what the AI summary means
- understand basic financial diagnosis without needing advanced explanation

---

## Summary

Version 1 MVP experience is a short focused flow:

- Landing
- Login
- Manual Asset Input
- Dashboard Insight

The dashboard then delivers the core value through:
- allocation visibility
- AI explanation
- financial health diagnosis

Everything else remains secondary until future rollout phases.