---
name: implement-from-plan
description: Implement only from CLAUDE.md and the current plan documents, with strict scope control, minimal changes, and end-of-task reporting.
---

# Implement From Plan

## Purpose

Use this skill when implementation should follow an existing planning document structure.

This skill is for execution work that must stay tightly aligned with:
- `CLAUDE.md`
- `Plan.md`
- one or more scoped plan documents

This skill is especially useful when:
- the project already has a planning system
- implementation must stay inside a defined phase
- scope creep is dangerous
- the user wants minimal, controlled, reversible changes
- the assistant must not invent features outside the plan

---

## Core Goals

1. Read the rule file first
2. Read only the plan documents relevant to the current task
3. Restate the exact implementation scope before coding
4. Inspect the repository before making changes
5. Implement only the smallest safe version of the planned work
6. Report clearly what changed, what remains, and any risks

---

## Main Principle

Do not implement from conversation alone.

Implement from:
- `CLAUDE.md`
- the current `Plan.md`
- the smallest set of additional plan documents needed for the task

If the plan is weak, incomplete, conflicting, or stale:
- stop
- explain the issue
- request or propose a plan correction before proceeding

---

## Required Execution Sequence

Always follow this order:

1. Read `CLAUDE.md`
2. Read `Plan.md`
3. Read only the task-relevant plan docs
4. Inspect the current repository structure
5. Inspect the relevant files before editing
6. Restate:
   - what is in scope
   - what is out of scope
   - which files are likely to change
   - what the smallest safe implementation order is
7. Only then begin implementation
8. Finish with a structured report

Do not skip the scope restatement step.

---

## Scope Control Rules

- Do NOT expand beyond the plan
- Do NOT implement nearby future features just because they are related
- Do NOT refactor unrelated files
- Do NOT “clean up” unrelated code while implementing
- Do NOT silently add architecture not required by the plan
- Prefer the smallest meaningful implementation that satisfies the plan

If a requested change would require:
- new scope
- new data entities
- unrelated route changes
- future-phase features
- major structural redesign

then stop and split that into a future plan.

---

## Repository Inspection Rules

Before making changes:
- inspect the repo structure
- confirm the relevant files exist
- inspect the files that will likely be edited
- verify that the repo matches the plan assumptions

If the repo does not match the plan:
- stop
- explain the mismatch
- recommend the smallest correction path

Do not invent files, routes, schemas, or architecture without checking.

---

## Planning Context Rules

Use the plan documents as the source of truth.

If multiple docs are loaded:
- treat `CLAUDE.md` as the rule layer
- treat `Plan.md` as the current execution hub
- treat supporting plan docs as scoped references only

Do not reload unrelated planning documents unless needed.

If the current task can be executed from compressed context, use that instead of reloading everything.

---

## Implementation Bias

Prefer:
- minimal changes
- reversible changes
- explicit logic
- reusable structure
- stable patterns
- boring, understandable solutions

Avoid:
- over-engineering
- speculative abstraction
- premature optimization
- future-proofing beyond the current phase
- flashy but fragile implementation

---

## Reuse Rules

When implementing:
- prefer trusted existing patterns in the repo
- prefer approved reference strategies from planning docs
- do not build complex infrastructure from scratch unless the plan requires it
- do not copy reference code blindly
- keep Chosen-invest custom only where the plan says it should be custom

---

## Risk Review Before Coding

Before implementation, explicitly identify:
- scope risk
- architecture mismatch risk
- data integrity risk
- UX clarity risk
- future-feature bleed risk

If any risk is high, say so before editing.

---

## End-of-Task Report Format

Always end with a structured implementation report containing:

### 1. What Was Implemented
- exact scope completed

### 2. Files Changed
- exact files created or modified

### 3. Assumptions Made
- only assumptions that mattered

### 4. Risks or Follow-Up Items
- anything incomplete, deferred, or sensitive

### 5. Validation Performed
- checks, tests, or manual verification steps

---

## Output Style Rules

- Be concise
- Be execution-oriented
- Be honest about uncertainty
- Show scope discipline
- Do not pad the response with unnecessary explanation
- Prefer exactness over enthusiasm

---

## Constraints

- Do NOT start coding before scope restatement
- Do NOT treat conversation alone as source of truth
- Do NOT modify implementation files outside the planned scope
- Do NOT broaden the task to feel helpful
- Do NOT skip end-of-task reporting

---

## Success Condition

This skill succeeds when:
- implementation stays inside the plan
- changes are small and controlled
- repo reality is checked before edits
- future phases are not accidentally pulled into the current work
- the final report is clear enough for the user to evaluate the result quickly