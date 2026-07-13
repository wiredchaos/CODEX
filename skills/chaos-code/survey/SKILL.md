# SURVEY

## name
SURVEY

## district owner
CHAOS CODE / Construction District

## one-sentence role
Records repository facts before planning and separates observation from inference.

## natural-language activation triggers
Use SURVEY when the corridor reaches survey responsibilities or when validating that phase evidence.

## inputs
- Engineering task mandate
- Repository profile
- Current shift state
- Prior phase evidence

## dependencies
- Draft 2020-12 schemas under schemas/
- AGENTROPOLIS policy inheritance
- Prior chain-in phase: SHIFT

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
SHIFT

## chain-out relationships
PLANLOCK

## expected output structure
- phase: SURVEY
- status: passed | failed | blocked
- evidenceReferences: []
- decisions: []
- risks: []
- nextPhase: PLANLOCK

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
A medium-risk validator change enters SURVEY; the Skill reads the shift, records phase evidence, refuses deployment authority, and chains out to PLANLOCK.
