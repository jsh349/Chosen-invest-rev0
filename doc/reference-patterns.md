# reference-patterns.md

## Purpose

Define how Chosen-invest should use trusted reference patterns, open-source building blocks, and official examples.

This document covers:
- what should be reused
- what should not be built from scratch
- what must remain custom to Chosen-invest
- how reference code should be evaluated before adoption

Do not use this document as a list of random libraries.
This is a decision document for reference strategy.

---

## Core Reference Strategy

Chosen-invest should maximize the use of trusted patterns for common product infrastructure.

Chosen-invest should remain custom in:
- product identity
- information architecture
- dashboard experience
- AI explanation layer
- financial diagnosis presentation
- overall user feeling

Rule:
- reuse the foundation
- customize the value layer

---

## Reference Usage Rules

- Prefer official documentation and widely used open-source patterns
- Do not build complex infrastructure from scratch if a proven pattern exists
- Do not copy reference code blindly
- Always understand what problem the reference solves
- Adapt patterns to fit Chosen-invest architecture instead of forcing architecture around a borrowed example
- Prefer boring, stable solutions over clever but fragile ones

---

## What Should Be Reused

### 1. App Structure Patterns
Reuse:
- modern full-stack web app structure
- route grouping patterns
- shared layout patterns
- modular feature separation

Reason:
- low product differentiation here
- high stability value

---

### 2. Authentication Patterns
Reuse:
- standard login/session/auth flow
- protected route patterns
- profile/session handling patterns

Reason:
- auth should be trusted and boring
- not a place for invention in MVP

Do not customize heavily unless required by product flow.

---

### 3. Form Patterns
Reuse:
- proven form structure
- validation patterns
- controlled input handling
- error and success feedback patterns

Reason:
- manual asset input must feel simple and reliable
- form behavior should not be experimental

---

### 4. Dashboard Layout Patterns
Reuse:
- standard dashboard shell
- sidebar + header + content layouts
- card/grid arrangement patterns

Customize:
- card content
- financial emphasis
- Chosen-invest messaging
- dashboard hierarchy

Reason:
- layout can be standard
- insight experience must feel custom

---

### 5. Chart Patterns
Reuse:
- standard chart component patterns
- pie/donut allocation chart patterns
- responsive chart containers
- tooltip/legend conventions

Customize:
- labels
- explanatory context
- how chart insight connects to diagnosis and AI summary

Reason:
- chart rendering is generic
- chart meaning is product-specific

---

### 6. Settings/Profile Patterns
Reuse:
- standard settings layout
- standard preferences structure
- standard profile editing pattern

Reason:
- low differentiation value
- high maintenance cost if custom-built badly

---

### 7. Stub / Coming Soon Patterns
Reuse:
- simple placeholder page patterns
- structured “coming soon” messaging
- reserved page layout blocks

Reason:
- useful for stable app expansion
- should not require custom engineering effort

---

## What Should Remain Custom

### 1. Landing Page Messaging
Must remain custom.

Chosen-invest differentiation begins with:
- the headline
- the framing of financial freedom
- the explanation of AI-assisted financial clarity
- the emotional tone of the first screen

The structure can follow good landing page patterns.
The message must be original.

---

### 2. Dashboard Experience
Must remain custom.

Even if the dashboard shell uses a standard pattern, the following must feel uniquely Chosen-invest:
- what is shown first
- how the user’s financial situation is summarized
- how diagnosis is framed
- how AI explanation feels
- how clarity is prioritized over clutter

---

### 3. AI Summary Experience
Must remain custom.

The AI layer should not feel like a generic chatbot pasted into a dashboard.

Chosen-invest should define:
- what kind of summary is produced
- what tone is used
- how explanation is made simple
- how financial uncertainty is communicated honestly
- how the AI helps users understand rather than just react

---

### 4. Financial Health Cards
Must remain custom.

These cards are one of the clearest opportunities for product differentiation.

Chosen-invest should define:
- what diagnoses matter most
- how scores or statuses are shown
- how warnings are phrased
- how advice is simplified

The card layout can use standard UI patterns.
The diagnosis logic and presentation should be custom.

---

### 5. Product Information Hierarchy
Must remain custom.

Chosen-invest should define:
- what comes first
- what is secondary
- what is hidden until later
- how much complexity is shown at once

This is a product decision, not a library decision.

---

## Recommended Reference Categories

When selecting references, prioritize these categories:

### Category A — Official Documentation
Best for:
- auth
- routing
- framework structure
- state handling guidance
- deployment conventions

Trust level: highest

---

### Category B — Mature Open-Source App Patterns
Best for:
- dashboard layout
- reusable UI structure
- forms
- settings pages
- app shell ideas

Trust level: high if widely used and understandable

---

### Category C — Design Inspiration
Best for:
- spacing
- card composition
- navigation feel
- visual hierarchy
- onboarding clarity

Trust level: useful for design direction only

Do not treat visual inspiration as architecture guidance.

---

## Reference Evaluation Checklist

Before adopting any reference pattern, ask:

- What exact problem does this solve?
- Is this pattern stable and widely understood?
- Is it compatible with our architecture?
- Does it reduce time and risk?
- Are we reusing a foundation or importing unnecessary complexity?
- Does it preserve Chosen-invest’s ability to feel distinct?

If the answer is unclear, do not adopt it yet.

---

## Anti-Patterns

Do not:
- copy entire templates without understanding them
- adopt large boilerplates just because they look complete
- add tools or dependencies before there is a clear need
- mix multiple unrelated reference architectures together
- let a template decide the product structure
- sacrifice clarity for trendiness

---

## Suggested Reuse Areas for Version 1

Version 1 should strongly prefer trusted patterns for:

- app shell
- auth flow
- form handling
- validation
- dashboard layout
- chart components
- settings page skeleton
- placeholder page skeleton

Version 1 should strongly prefer custom design thinking for:

- landing page wording
- dashboard information order
- AI summary wording
- financial diagnosis cards
- product tone
- trust presentation

---

## Design Adaptation Rule

Do not make the product look like a copy of the reference.

Use references for:
- structure
- behavior
- implementation speed
- reliability

Use Chosen-invest custom design for:
- tone
- copy
- priorities
- insight presentation
- user guidance

---

## Version 1 Practical Rule

For MVP:
- reuse as much infrastructure as possible
- customize only where users actually feel the product value
- avoid polishing low-value areas too early
- do not over-design hidden or inactive modules

---

## Summary

Reuse heavily:
- auth
- app shell
- forms
- charts
- settings
- placeholder pages

Customize heavily:
- landing message
- dashboard value delivery
- AI summary experience
- financial diagnosis cards
- product information hierarchy

Chosen-invest should not win by reinventing standard infrastructure.
Chosen-invest should win by making financial clarity feel simple, intelligent, and worth returning to.