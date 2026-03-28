# landing-and-auth.md

## 1. Plan Metadata
- Plan Name: Landing and Auth
- Status: Draft
- Owner: Chosen-invest
- Last Updated: 2026-03-19
- Related Phase: Phase 1

---

## 2. Task Summary

Build the MVP landing and authentication entry flow for Chosen-invest.

This plan includes:
- the public landing page
- the login page
- the basic transition from landing to login
- the minimum authentication structure needed for Version 1

This plan does not include advanced account flows.

---

## 3. Why This Matters

This is the first user-facing entry into the product.

The goal is to create:
- a clear first impression
- a simple path into the app
- a trustworthy login experience
- a stable public/auth foundation for future growth

If this layer is clear and lightweight, users can reach product value quickly without confusion.

---

## 4. In Scope

### Landing
- public MVP landing page
- clear product headline
- short supporting value message
- primary CTA to login

### Auth
- login page
- basic login form
- post-login transition into the app flow

### Structure
- marketing layout for landing
- auth layout for login
- stable route setup for public and auth zones

---

## 5. Out of Scope

- full sign-up flow
- forgot password flow
- social login
- multi-step onboarding
- profile setup
- billing/subscription
- advanced auth settings
- account recovery
- legal/policy pages beyond placeholders if needed

---

## 6. Required References

Read only these documents for this plan:

- `CLAUDE.md`
- `feature-tree.md`
- `app-architecture.md`
- `rollout-phases.md`
- `mvp-experience.md`
- `reference-patterns.md`

---

## 7. Reference Rule

- Read only the documents listed above
- Do not load unrelated planning documents unless needed
- Use the compressed context below as the main working context
- If a conflict appears, stop and resolve it before implementation

---

## 8. Compressed Context

- Version 1 must stay focused on MVP Must features
- Landing Page and Login are both Phase 1 live features
- Landing should explain the product simply and guide users into login
- Login should be clean, minimal, and trust-focused
- Reuse trusted auth and page structure patterns
- Keep Chosen-invest custom in messaging, tone, and first-impression UX
- Do not introduce advanced auth features in this plan
- This plan should support the shortest meaningful path toward the MVP dashboard flow

---

## 9. Intended Outcome

At the end of this plan, Chosen-invest should have:

- a working public landing page
- a working login page
- a clear CTA path from landing to login
- a stable marketing/auth route foundation
- a simple trustworthy first-entry experience

---

## 10. Route Scope

### Live Routes
- `/`
- `/login`

### Optional Stub Routes
Use only if needed for structural clarity:
- `/signup`

### Not Active in This Plan
- `/forgot-password`
- `/pricing`
- `/about`
- `/demo`
- all protected app routes beyond basic transition handling

---

## 11. Screen Scope

### Landing Page
**Status:** Live  
**Route:** `/`

Purpose:
- explain what Chosen-invest is
- create interest and trust
- direct users toward login

Must include:
- clear headline
- supporting message
- primary login CTA
- simple visual hierarchy

Must avoid:
- too many sections
- advanced product explanations
- clutter
- fake completeness

### Login Page
**Status:** Live  
**Route:** `/login`

Purpose:
- provide basic access into the product
- keep the flow simple and low-friction

Must include:
- login form
- clear submit action
- trust-focused layout

May be reserved for later:
- sign-up link
- forgot password link
- social login options

Must avoid:
- unrelated feature discovery
- heavy onboarding logic
- unnecessary complexity

---

## 12. UX Scope

### Primary Flow
1. User lands on `/`
2. User understands the core value proposition
3. User clicks the main CTA
4. User reaches `/login`
5. User logs in successfully
6. User proceeds into the protected MVP app flow

### UX Goal
The user should feel:
- clarity
- trust
- low friction
- forward momentum toward useful product value

---

## 13. Layout Scope

### Marketing Layout
Used for:
- `/`

Recommended:
- simple top navigation or minimal header
- strong visual focus on message and CTA
- clean spacing
- no unnecessary sections

### Auth Layout
Used for:
- `/login`

Recommended:
- centered or focused form layout
- minimal distractions
- consistent spacing and trust-oriented presentation

---

## 14. Content Direction

### Landing Message Direction
The landing page should communicate:
- AI-assisted financial clarity
- a simple path toward better decisions
- a calm, intelligent, trustworthy product tone

The page should not:
- overpromise returns
- sound like hype-driven trading software
- feel like a generic fintech template

### Login Message Direction
The login page should feel:
- simple
- secure
- minimal
- professional

---

## 15. Technical Approach

### Reuse Strategy
Reuse trusted patterns for:
- page structure
- auth form structure
- layout composition
- route separation

Customize:
- landing copy
- product framing
- CTA hierarchy
- first-impression visual tone

### Implementation Strategy
- build the route structure first
- build the public marketing layout
- build the auth layout
- build landing page content
- build login page form and transition behavior
- keep logic narrow and explicit

---

## 16. Files and Areas to Inspect First

Inspect before coding:

### Routing / Layout
- root route setup
- marketing layout files
- auth layout files

### Pages
- landing page
- login page

### Shared UI
- button components
- form components
- layout shell components
- typography / card / container components if available

### Auth Logic
- current auth entry files
- session handling files if present
- route protection behavior if already defined

---

## 17. Files and Areas Expected to Change

Expected change areas:

- landing page route file
- login page route file
- marketing layout files
- auth layout files
- shared button/form/layout components
- auth-related helper files if needed

---

## 18. Implementation Order

### Step 1 — Confirm Public/Auth Route Structure
- confirm `/`
- confirm `/login`
- confirm layout separation

### Step 2 — Build Marketing Layout
- create a lightweight layout for public entry pages
- keep it simple and reusable

### Step 3 — Build Landing Page
- add headline
- add supporting message
- add primary CTA to login
- keep the page short and focused

### Step 4 — Build Auth Layout
- create a minimal auth-specific shell
- optimize for clarity and low distraction

### Step 5 — Build Login Page
- create login form
- connect to MVP auth flow
- define successful transition into protected app flow

### Step 6 — Add Optional Stub for Sign Up
- only if useful for structure or visual completeness
- keep clearly inactive if not implemented

### Step 7 — Validate First Entry Flow
- test landing → login → protected transition

---

## 19. Risks

- overbuilding marketing pages too early
- adding too much text to the landing page
- making login flow broader than MVP needs
- mixing auth logic with unrelated product logic
- making the first impression feel like a generic fintech clone
- introducing unclear or misleading CTA paths

---

## 20. Validation Plan

Validate the following:

### Landing Validation
- landing page loads correctly
- headline is understandable quickly
- CTA is obvious
- the page does not feel cluttered

### Login Validation
- login page loads correctly
- form is clear and minimal
- login action works for MVP assumptions
- successful login transitions correctly

### Flow Validation
- user can move smoothly from landing to login
- no dead ends or confusing loops
- auth does not block the primary MVP path unnecessarily

### UX Validation
- first-time experience feels focused
- trust is communicated visually and verbally
- the flow feels like entry into a real product, not a placeholder

---

## 21. Definition of Done

This plan is complete when:

- `/` works as the MVP landing page
- `/login` works as the MVP login page
- landing CTA leads clearly to login
- marketing and auth layouts are separated
- first-entry flow feels simple and understandable
- no advanced auth features are accidentally introduced
- the result supports the broader Phase 1 MVP shell cleanly

---

## 22. Non-Negotiable Constraint

Do not expand this plan into:
- full sign-up implementation
- password recovery flows
- social login
- profile setup
- advanced onboarding
- pricing/about/demo build-out
- non-MVP marketing pages

If those are needed, move them into a separate future plan.