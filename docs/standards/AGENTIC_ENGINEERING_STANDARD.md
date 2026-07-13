# AGENTIC ENGINEERING STANDARD

The CHAOS CODE Agentic Engineering Guild is an AGENTROPOLIS institution inside the Construction District. It fits under the canonical architecture: Infrastructure → Districts / Institutions → Applications.

## Canonical corridor
TASK → ROUTER → SHIFT → SURVEY → PLANLOCK → BUILD → RUNNER → TARGET → RIVAL → SEAL → RECEIPT.

BUILD is bounded implementation, not an all-purpose Skill.

## Policy inheritance
Repository policy inherits Grid and district policy. Local policy may extend the district standard but may not silently weaken it.

## Completion states
SEAL emits `sealed`, `failed`, or `blocked`. Missing mandatory evidence fails closed.

## Proof-of-Behavior
A passing test alone is insufficient. Proof requires intended behavior, observation, environment, proving test, negative case, failure signal, unresolved uncertainty, and evidence references.

## Risk-based review
Low risk receives deterministic checks. Medium risk receives independent implementation review. High risk receives architecture, security, and domain review. Critical risk requires human approval, reproducible evidence, and rollback plan; implementer self-approval is prohibited.

## Test taxonomy
Receipts classify tests as unit, integration, e2e, governance, security, or manual observation.

## Deterministic-first remediation
Prefer deterministic validators, schemas, and repeatable tests before subjective review.

## Documentation ownership
Documents are classified as observed operational reference, generated reference, proposed interpretation, architectural decision, or security/policy record. Agents must not rewrite architectural decisions merely to make documentation agree with implementation.

## Finding disposition
Findings resolve only as fixed, accepted_risk, deferred_with_issue, rejected_with_reason, or requires_human_decision.

## Shift budgets and stop conditions
Every shift records budget, consumption, rollback checkpoint, non-goals, stop conditions, and scope violations. Missing budget, permissions, owner, mandate, rollback, or stop conditions blocks SHIFT.

## Scope control and handoff
PLANLOCK freezes scope, acceptance criteria, risk tier, review requirements, permissions, non-goals, and rollback strategy. Scope expansion requires a new mandate or explicit approved override. Handoff must preserve owner, branch, current phase, remaining work, risks, and receipt status.

## SEAL rules
SEAL validates mandatory gates, Proof-of-Behavior, review requirements, finding dispositions, unresolved risks, rollback, approvals, and scope compliance. It never converts missing evidence into success.
