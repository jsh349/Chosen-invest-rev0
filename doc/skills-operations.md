# skills-operations.md

## Purpose

Define when and how to use the core Claude skills for Chosen-invest.

This document covers operational usage for:

- `plan-audit`
- `doc-compress`
- `implement-from-plan`

The goal is to make skill usage predictable, repeatable, and aligned with the planning system.

---

## Core Principle

Use skills as operational tools on top of the existing md planning system.

Priority order:

1. `CLAUDE.md` = permanent rule file
2. `Plan.md` = current execution hub
3. supporting docs = referenced only when relevant
4. skills = operational helpers for review, compression, and implementation

Skills do not replace planning documents.
Skills help use the planning documents more effectively.

---

## Skill Roles

### 1. `plan-audit`
Role:
- audit the current md planning system
- review overlap, weakness, inconsistency, and implementation readiness
- evaluate whether `Plan.md` is strong enough to act as the execution hub

Use this skill when:
- planning docs have just been created
- the md system feels messy or repetitive
- implementation is about to begin
- `Plan.md` feels weak
- you want a strict document-by-document review

---

### 2. `doc-compress`
Role:
- shorten and simplify md documents
- reduce overlap and token waste
- convert long explanation-heavy docs into smaller, role-specific docs
- strengthen `Plan.md` by making support docs lighter

Use this skill when:
- documents are too long
- multiple docs repeat the same ideas
- `Plan.md` is too dependent on other docs
- implementation is slowed by rereading too many files
- a support doc needs to be rewritten into a shorter execution-friendly version

---

### 3. `implement-from-plan`
Role:
- implement only from `CLAUDE.md`, `Plan.md`, and task-relevant plan docs
- restate scope before coding
- inspect the repo before editing
- keep implementation minimal and within plan boundaries
- finish with a structured implementation report

Use this skill when:
- the planning docs are ready
- a scoped implementation task is clearly defined
- you want minimal and controlled execution
- scope creep must be prevented

---

## Recommended Usage Sequence

### Sequence A — Before Implementation
Use when planning docs are new or uncertain.

1. `/plan-audit`
2. `/doc-compress`
3. update `Plan.md`
4. `/implement-from-plan`

Purpose:
- review the planning system
- reduce overlap
- strengthen execution context
- begin implementation only after the plan system is clean

---

### Sequence B — Existing Plan Needs Review
Use when implementation has not started yet, but the docs feel weak.

1. `/plan-audit`
2. review findings
3. improve `Plan.md` and support docs
4. optionally run `/doc-compress` on specific target docs

Purpose:
- improve planning quality before writing code

---

### Sequence C — Specific Doc Needs Compression
Use when one support doc is too long or repetitive.

1. `/doc-compress`
2. rewrite the target doc
3. confirm that the doc still matches its intended role
4. if needed, update `Plan.md` compressed context

Purpose:
- reduce token waste without changing the product plan itself

---

### Sequence D — Ready to Implement
Use when the planning system is already good enough.

1. confirm `CLAUDE.md` and `Plan.md` are current
2. `/implement-from-plan`
3. execute one scoped task only

Purpose:
- begin safe execution without re-auditing everything unnecessarily

---

## Decision Rules

### Use `plan-audit` if:
- you are unsure whether the planning docs are strong enough
- `Plan.md` feels incomplete
- multiple md files overlap heavily
- you want a system-level review

### Use `doc-compress` if:
- a document is too verbose
- a support doc repeats content from another file
- token cost is rising because too many files must be reread
- you want to turn a long doc into a lighter reference doc

### Use `implement-from-plan` if:
- the scope is already defined
- the plan is ready
- the implementation should begin now
- you want Claude to stay tightly inside the current task

---

## Operational Rules

### Rule 1
Do not use `implement-from-plan` before the plan system is stable enough.

If the planning docs are unclear, use:
- `plan-audit` first
- then `doc-compress` if needed

### Rule 2
Do not use `plan-audit` repeatedly without making changes.

If audit findings are already known:
- update docs first
- then re-run only if necessary

### Rule 3
Do not use `doc-compress` to remove meaningful scope boundaries.

Compression should reduce waste, not reduce safety.

### Rule 4
Run `implement-from-plan` on one scoped task at a time.

Do not use one implementation run to activate multiple future-phase features.

---

## Prompt Patterns

### Pattern 1 — Audit the planning system
```text
/plan-audit
Review the current planning docs for Chosen-invest and tell me whether Plan.md is strong enough to serve as the main execution hub.