# CLAUDE.md

## Purpose
This file defines operating constraints for Claude in this repository.
(추가: 철학/브랜드 문구를 빼고, 이 파일의 역할을 한 줄로 명확히 정의함)

## Core Rule
- Do NOT write or modify code before Plan.md exists and is specific enough to execute.
(강화: 기존 "Plan.md 먼저"를 최상위 단일 규칙으로 승격)

## Plan-First Rules
- Plan.md must exist before implementation.
- Plan.md must define:
  - task summary
  - goal
  - non-goals
  - constraints
  - affected files
  - risks
  - validation steps
- If Plan.md is vague, incomplete, stale, or conflicting, STOP and fix it first.
- If the task meaningfully changes, update Plan.md before continuing.
(정리: 중복 문장을 줄이고 Plan.md 필수 요소만 압축)

## Repository Boundaries
- Do NOT mix this repository with any other project or repository.
- Do NOT copy code, naming, folder structure, assumptions, or business logic from Prototype, Radar, or any other repository unless explicitly instructed.
- If something appears reusable from another project, STOP and explain before reusing it.
- Do NOT assume shared architecture across repositories.
(유지 + 다듬음: multi-repo 안전 규칙은 중요해서 유지하되 더 짧게 정리)

## Scope Control
- Do NOT expand scope on your own.
- Do NOT refactor unrelated files.
- Do NOT rewrite large sections unless the plan explicitly requires it.
- Do NOT combine multiple features into one pass unless the plan explicitly requires it.
- Prefer the smallest meaningful change.
(정리: “minimal diff” 원칙을 더 직접적으로 압축)

## Inspect Before Edit
- Always inspect relevant files before editing.
- Do NOT edit files that have not been inspected.
- Do NOT assume APIs, routes, environment variables, database schema, component contracts, or existing utilities without verification in code.
- If repository reality does not match the plan, STOP and update the plan.
(유지 + 강화: “실제 코드 확인” 규칙을 더 명확히 묶음)

## Implementation Safety
- Do NOT replace working logic with speculative improvements.
- Do NOT introduce clever abstractions without clear need.
- Do NOT silently change existing behavior.
- Do NOT introduce breaking changes without explicitly stating them.
- Prefer reversible changes when possible.
(정리: implementation 관련 중복을 하나의 블록으로 압축)

## Financial Product Safety
- Do NOT fabricate financial data, balances, returns, portfolio values, or performance.
- Do NOT present mock, estimated, or simulated data as real data.
- Do NOT imply guaranteed returns, guaranteed success, or certain financial outcomes.
- Do NOT produce misleading investment language.
- Any user-facing financial calculation must be explainable and traceable.
(유지: Chosen-invest 특성상 핵심이라 유지)

## Security / Sensitive Logic Safety
- Do NOT modify authentication flow unless the task explicitly requires it.
- Do NOT touch billing, subscription, payment, or account-linking logic without first stating the risk.
- Do NOT expose secrets, tokens, or sensitive configuration.
- Do NOT log sensitive user financial data unless strictly necessary.
- Do NOT weaken validation, permissions, or access control for convenience.
(정리: auth/billing/security를 한 섹션으로 통합)

## UI / MVP Discipline
- Do NOT redesign unrelated UI while implementing a feature.
- Do NOT add extra screens, flows, or components not defined in Plan.md.
- Do NOT present incomplete functionality as production-ready.
- Do NOT overload the MVP with advanced features too early.
(유지: MVP 단계 통제에 적합)

## Data / State Discipline
- Do NOT create duplicate sources of truth.
- Do NOT add new global state without strong justification.
- Do NOT change data models casually.
- Do NOT create hidden coupling between modules.
(정리: dashboard/AI/backtest를 콕 집기보다 일반 원칙으로 압축해 미래 확장성 확보)

## Reference Code Rules
- Do NOT build complex patterns from scratch when a trusted reference pattern already exists.
- Do NOT copy reference code blindly.
- Explain why a reference pattern fits this project before adopting it.
- Prefer official documentation and proven open-source patterns over improvised architecture.
(유지 + 다듬음: 네가 중요하게 본 “인증된 오픈 코드 활용”을 반영)

## Context Discipline
- Context is perishable.
- Do NOT continue from a long messy conversation when key decisions can be compressed into documents.
- Summarize durable decisions into Plan.md or decisions.md before continuing long tasks.
- Do NOT rely on stale conversational context when a document should be updated.
(강화: “컨텍스트는 우유다” 원칙을 짧고 강하게 반영)

## Model / Agent Discipline
- Use stronger reasoning for planning, architecture, financial logic, and risky changes.
- Do NOT use a fast shortcut for correctness-critical work.
- Keep planning, implementation, and review conceptually separate.
- Use subagents or separate passes when that reduces context pollution or conflict.
(추가: 네 10원칙 중 모델 선택/서브에이전트 철학을 아주 짧게 반영)

## Windows Environment
- Assume Windows development environment unless explicitly stated otherwise.
- Do NOT suggest Unix-only commands without Windows equivalents.
- Be careful with file paths, ports, process handling, file watchers, and local server stability.
(유지: 사용자 환경에 맞춤)

## Stop Conditions
- If requirements conflict, STOP and explain the conflict.
- If relevant files have not been inspected, STOP.
- If success criteria are unclear, STOP and fix the plan.
- If the change risks auth, billing, data integrity, or financial trust, STOP and explain before editing.
(정리: 중복 STOP 규칙들을 하나로 압축)

## Required Working Sequence
1. Read CLAUDE.md
2. Read Plan.md
3. Inspect relevant files
4. Restate the implementation plan briefly
5. Identify risks and validation steps
6. Implement only within approved scope
7. Summarize changes, touched files, risks, and test steps
(유지: 아주 좋은 부분이라 구조만 깔끔하게 유지)

## Required Output After Each Task
- Summary of changes
- Exact files touched
- Risks / side effects
- Validation or test steps
- Unresolved issues
(유지: 출력 형식은 명확해서 그대로 유지)

## What Does NOT Belong Here
- Do NOT put long architectural explanations here.
- Do NOT put full product philosophy here.
- Do NOT put large command reference lists here.
- Put detailed decisions in Plan.md, decisions.md, or topic-specific docs instead.
(추가: 웹 사례 비교 후 가장 필요한 보완점. CLAUDE.md 비대화를 막는 메타 규칙)