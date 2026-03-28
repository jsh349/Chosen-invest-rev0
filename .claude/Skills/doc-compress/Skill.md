---
name: doc-compress
description: Compress planning documents into smaller, clearer, execution-oriented versions with less overlap and lower token cost.
---

# Document Compress

## Purpose

Use this skill when planning documents are becoming too long, repetitive, or expensive to reload during implementation.

This skill compresses planning documents so they become:
- smaller
- clearer
- less repetitive
- more execution-oriented
- more useful as working context

This skill is especially useful when:
- multiple md files repeat the same ideas
- `Plan.md` is not strong enough to act as the execution hub
- supporting docs feel too long for their role
- token usage is rising because too many documents must be reread
- implementation is becoming slower due to document bloat

---

## Core Goals

1. Reduce overlap across planning documents
2. Strengthen role separation between documents
3. Convert long explanation-heavy docs into shorter decision-heavy docs
4. Preserve important meaning while lowering token cost
5. Make `Plan.md` more effective as the main execution context

---

## Main Principle

Do not compress blindly.

Compression must preserve:
- scope boundaries
- architecture meaning
- implementation usefulness
- safety-critical constraints
- source-of-truth hierarchy

The goal is not shorter writing by itself.
The goal is stronger execution context with less waste.

---

## Compression Rules

When compressing a document:

- remove repeated philosophy if it already exists elsewhere
- remove repeated feature lists if another doc already owns that role
- remove long explanatory paragraphs when short decisions are enough
- prefer bullet rules over essay-style repetition
- keep only what the document truly needs for its specific role
- preserve important constraints, boundaries, and decisions

Do not remove:
- critical scope boundaries
- rules that prevent implementation mistakes
- status definitions if they are needed
- plan-specific execution detail if the document is a working plan

---

## Document Role Discipline

Each document should do one main job.

Examples:
- `CLAUDE.md` = permanent operating constraints
- `Plan.md` = current execution hub
- `feature-tree.md` = feature map
- `app-architecture.md` = route/layout/project structure
- `rollout-phases.md` = activation order
- `mvp-experience.md` = MVP flow and screen purpose
- `mvp-data-model.md` = MVP data structure
- `reference-patterns.md` = reuse vs custom strategy

When compressing, remove anything that belongs to another document.

---

## Compression Priority

When reviewing a document for compression, prioritize removing:

1. repeated philosophy already stated elsewhere
2. duplicated feature lists
3. repeated route descriptions
4. repeated MVP explanations
5. repeated “future-ready” language
6. paragraphs that can become short rules
7. low-value narrative text that does not change execution

Keep:
- role-defining content
- scope-defining content
- execution-relevant decisions
- key constraints
- key definitions

---

## Plan.md Priority Rule

When `Plan.md` exists, compress other docs so that `Plan.md` can carry the main execution load.

Supporting docs should become:
- lighter
- narrower
- role-specific
- easier to reference only when needed

Do not turn every support doc into another `Plan.md`.

---

## Required Review Questions

For each document, ask:

1. What is this document’s exact role?
2. What content is truly required for that role?
3. What content belongs in another doc?
4. What content is repeated from elsewhere?
5. What can be rewritten as shorter decision text?
6. Would this document still be useful if cut by 30–60%?

If yes, compress it.

---

## Compression Style

Prefer this style:
- short sections
- decision-oriented writing
- direct rules
- concise summaries
- clear boundaries

Avoid this style:
- repeated motivation paragraphs
- long prose explaining obvious structure
- philosophical repetition across multiple files
- broad background text that does not help execution

---

## Output Modes

This skill can be used in two modes:

### Mode 1 — Audit Only
Review documents and recommend what should be compressed, shortened, merged, or restructured.

### Mode 2 — Rewrite
Actually rewrite a document into a compressed execution-oriented version.

When rewriting:
- keep the original role
- remove overlap
- keep critical decisions
- shorten aggressively but safely

---

## Required Output Structure

When using this skill, respond in this order:

### 1. Compression Assessment
- which docs are too long
- which docs overlap
- which docs are already appropriately sized

### 2. Compression Targets
For each target doc:
- why it should be compressed
- what should be removed
- what should be preserved
- whether it should be shortened, merged, split, or archived

### 3. Recommended Compression Strategy
- which doc should own which information
- which doc should become the execution hub
- which docs should become lighter support docs

### 4. Rewritten Version (if rewrite mode is requested)
- provide the compressed replacement doc
- preserve structure only as needed
- prefer concise usable output

---

## Rewrite Rules

When rewriting a document:

- preserve the file’s core role
- reduce repeated framing language
- shorten section intros
- keep important lists
- keep necessary status/scope definitions
- remove duplicated examples unless essential
- rewrite long paragraphs into compact rules where possible

Do not:
- flatten everything into useless minimalism
- remove meaningful distinctions
- remove implementation guidance from execution plans
- remove constraints that prevent scope creep

---

## Constraints

- Do NOT start coding
- Do NOT modify implementation files
- Do NOT recommend more documents unless necessary
- Do NOT optimize for beauty over usefulness
- Do NOT compress away critical safety or scope information

---

## Success Condition

This skill succeeds when:
- the md system becomes smaller and clearer
- document roles are easier to understand
- `Plan.md` becomes easier to use as the central execution context
- supporting docs are lighter and more specialized
- token waste and rereading burden are reduced without losing important decisions