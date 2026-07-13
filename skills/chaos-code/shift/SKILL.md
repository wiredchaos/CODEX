# SHIFT

## name
SHIFT

## district owner
CHAOS CODE / Construction District

## one-sentence role
Opens a traceable execution shift and fails closed on missing mandate evidence.

## natural-language activation triggers
Use SHIFT when the corridor reaches shift responsibilities or when validating that phase evidence.

## inputs
- Engineering task mandate
- Repository profile
- Current shift state
- Prior phase evidence

## dependencies
- Draft 2020-12 schemas under schemas/
- AGENTROPOLIS policy inheritance
- Prior chain-in phase: ROUTER

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
ROUTER

## chain-out relationships
SURVEY

## expected output structure
- phase: SHIFT
- status: passed | failed | blocked
- evidenceReferences: []
- decisions: []
- risks: []
- nextPhase: SURVEY

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
A medium-risk validator change enters SHIFT; the Skill reads the shift, records phase evidence, refuses deployment authority, and chains out to SURVEY.
