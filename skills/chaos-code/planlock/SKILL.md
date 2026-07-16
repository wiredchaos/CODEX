# PLANLOCK

## name
PLANLOCK

## district owner
CHAOS CODE / Construction District

## one-sentence role
Freezes bounded scope, acceptance criteria, risk, permissions, and rollback strategy.

## natural-language activation triggers
Use PLANLOCK when the corridor reaches planlock responsibilities or when validating that phase evidence.

## inputs
- Engineering task mandate
- Repository profile
- Current shift state
- Prior phase evidence

## dependencies
- Draft 2020-12 schemas under schemas/
- AGENTROPOLIS policy inheritance
- Prior chain-in phase: SURVEY

## permissions
- Read repository policy and evidence.
- Write only phase-specific shift, receipt, or documentation artifacts allowed by the mandate.
- No production deployment authority.

## prohibited actions
- Inventing permissions or approvals.
- Expanding locked scope without approved override.
- Touching secrets, private keys, tokens, or .env values.
- Granting itself production deployment authority.

## chain-in relationships
SURVEY

## chain-out relationships
RUNNER

## expected output structure
- phase: PLANLOCK
- status: passed | failed | blocked
- evidenceReferences: []
- decisions: []
- risks: []
- nextPhase: RUNNER

## completion requirements
- Required inputs exist.
- Evidence is referenced directly.
- Scope and permissions remain bounded.

## failure conditions
- Missing required evidence.
- Contradictory policy or schema state.
- Scope violation or forbidden path request.

## evidence requirements
- File paths, commands, observations, or review records proving the phase result.

## escalation rules
Escalate to the operator for missing mandate, critical risk approval, unclear ownership, or blocked rollback evidence.

## concrete usage example
A medium-risk validator change enters PLANLOCK; the Skill reads the shift, records phase evidence, refuses deployment authority, and chains out to RUNNER.
