# Policy Gates

AGENTROPOLIS-54T defines the defense, governance, policy-contract, verification, and receipt layer for AGENTROPOLIS-aligned systems. This document is a gate contract, not a runtime engine.

## Gate sequence

1. Request received.
2. Assign request ID.
3. Normalize input.
4. Classify data.
5. Classify action.
6. Identify actor and agent.
7. Verify freshness and replay protection.
8. Resolve policy version.
9. Verify tool scope.
10. Evaluate jurisdiction.
11. Evaluate risk and autonomy tier.
12. Determine approval requirements.
13. Bind approval to exact payload.
14. Decide: allow, deny, quarantine, or require approval.
15. Execute only if allowed.
16. Validate output.
17. Create receipt.
18. Append receipt-chain reference.

Failure in any required gate produces a fail-closed decision. Untrusted content cannot grant authority or weaken a gate.
