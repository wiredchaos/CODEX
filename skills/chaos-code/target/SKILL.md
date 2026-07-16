# TARGET

## name
TARGET

## district owner
CHAOS CODE / Construction District

## one-sentence role
Creates or executes targeted positive and negative behavior tests.

## natural-language activation triggers
Use TARGET when the corridor reaches target responsibilities or when validating that phase evidence.

## inputs
- Engineering task mandate
- Repository profile
- Current shift state
- Prior phase evidence

## dependencies
- Draft 2020-12 schemas under schemas/
- AGENTROPOLIS policy inheritance
- Prior chain-in phase: RUNNER

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
RUNNER

## chain-out relationships
RIVAL

## expected output structure
- phase: TARGET
- status: passed | failed | blocked
- evidenceReferences: []
- decisions: []
- risks: []
- nextPhase: RIVAL

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
A medium-risk validator change enters TARGET; the Skill reads the shift, records phase evidence, refuses deployment authority, and chains out to RIVAL.
