---
name: plan-audit
description: Audit project planning documents, strengthen Plan.md as the main execution hub, and reduce overlap/token waste across md files.
---

# Plan Audit

## Purpose

Use this skill when reviewing a project's planning documents before implementation.

This skill audits the planning system as a whole, with special emphasis on whether `Plan.md` is strong enough to act as the main execution hub without repeatedly loading all other md files.

This skill is especially useful when:
- planning docs are growing in number
- documents feel repetitive
- implementation is about to begin
- `Plan.md` feels weak, vague, or too dependent on other docs
- token usage is becoming inefficient

---

## Core Goals

1. Evaluate the md planning system as a whole
2. Strengthen `Plan.md` as the main execution context
3. Reduce overlap across supporting planning documents
4. Clarify document roles and boundaries
5. Make implementation easier, smaller, and less token-expensive

---

## Main Principle

`CLAUDE.md` should remain the permanent rule file.

`Plan.md` should become the main execution hub.

All other planning documents should remain lighter support documents and should only be loaded when truly relevant.

Do not optimize for more documents.
Optimize for a smaller, stronger, clearer planning system.

---

## When Using This Skill

Assume the desired review order is:

1. Read `CLAUDE.md`
2. Read `Plan.md`
3. Read only the planning docs needed to understand the full planning system
4. Evaluate the documents as a connected system, not as isolated files
5. Recommend improvements with a bias toward:
   - less repetition
   - clearer roles
   - stronger execution context
   - easier implementation use

---

## Review Priorities

Always prioritize these questions:

### 1. Is `Plan.md` strong enough?
Check whether `Plan.md`:
- clearly defines scope
- clearly defines out-of-scope
- contains compressed context
- limits reference loading
- defines execution order
- defines risks
- defines validation
- defines definition of done

If not, identify exactly what is missing.

### 2. Are supporting docs too repetitive?
Check whether other md files:
- restate the same philosophy too many times
- duplicate route, feature, or UX information
- are longer than their role requires
- could be simplified into reference-only documents

### 3. Are document roles clear?
Each doc should have one role only.

Examples:
- `feature-tree.md` = feature map
- `app-architecture.md` = route/layout/project structure
- `rollout-phases.md` = activation order
- `mvp-experience.md` = user flow + screen purpose
- `mvp-data-model.md` = MVP data structure
- `reference-patterns.md` = reuse vs custom strategy

If a document does multiple jobs, recommend narrowing it.

### 4. Will this planning system help implementation?
Check whether the current md system:
- helps Claude execute safely
- reduces ambiguity
- avoids token waste
- avoids repeated reading of low-value context
- supports smaller implementation plans later

---

## What to Look For

### Strengths
Identify:
- documents that are already strong
- clear role separation
- useful compressed context
- good scope boundaries
- strong phase or implementation structure

### Weaknesses
Identify:
- overlap
- vague language
- duplicated rules
- missing scope boundaries
- weak execution guidance
- missing risks
- missing validation criteria
- unnecessary verbosity

### Risk Areas
Pay extra attention to:
- `Plan.md` being too broad or too generic
- supporting docs behaving like second Plan.md files
- detailed philosophy repeated across multiple docs
- document bloat causing unnecessary token usage

---

## Required Output Structure

When using this skill, respond in this order:

### 1. System Assessment
- overall quality of the current md planning system
- major strengths
- major weaknesses

### 2. Document-by-Document Review
For each document reviewed:
- intended role
- whether it is effective
- whether it overlaps too much
- whether it should be kept, shortened, merged, split, or archived

### 3. Plan.md Audit
Must include:
- what is good
- what is weak
- what is missing
- whether it can realistically serve as the main execution hub
- exact improvements needed

### 4. Recommended Document Architecture
- what should remain core
- what should become lighter support docs
- what should be merged, split, shortened, or archived

### 5. Upgrade Proposal
- exact recommendations for improving `Plan.md`
- exact recommendations for simplifying the rest of the md system

---

## Style Rules

- Be strict and honest
- Prefer a smaller, stronger system over a larger, repetitive one
- Avoid vague praise
- Give concrete recommendations
- Focus on implementation usefulness, not document beauty
- Optimize for execution quality and token efficiency

---

## Constraints

- Do NOT start coding
- Do NOT modify implementation files
- Do NOT redesign the product itself unless the planning structure requires it
- Do NOT recommend adding more docs unless clearly necessary
- Prefer compression, simplification, and clarification over expansion

---

## Success Condition

This skill succeeds when the user can clearly see:
- whether the current md system is usable
- whether `Plan.md` is strong enough
- what should change before implementation begins
- how to reduce token waste and document confusion