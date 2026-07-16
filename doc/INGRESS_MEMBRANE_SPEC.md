# INGRESS MEMBRANE SPEC — WIRED CHAOS META

## Mission
Act as the boundary membrane that receives external inputs, enforces protocol shape, and forwards only normalized, policy-ready requests.

## Responsibilities
- Accept inbound API/event payloads.
- Perform schema validation and basic syntactic checks.
- Attach correlation/context metadata.
- Route normalized payloads to immune layer and DFC entry points.

## Accepted Input Classes
- Authentication requests (nonce, signature verify).
- Credential operations (mint/verify style calls).
- Read-only status checks.
- Side-effect requests requiring policy approval.

## Rejection Conditions
- Schema mismatch or missing required fields.
- Unsupported protocol version.
- Expired timestamp or malformed identity envelope.
- Missing correlation identifier when required by contract.

## Normalization Contract
The membrane must output a canonical envelope with:
- `correlationId`
- `requestClass`
- `principalContext`
- `payloadCanonical`
- `ingressMetadata`

No downstream plane should consume raw external payload shapes directly.

## Security Posture
- Deny malformed traffic before policy evaluation.
- Preserve immutable request snapshots for forensics.
- Ensure replay and abuse signals are forwarded to immune analysis.

## Non-Goals
- Business workflow orchestration.
- Side-effect execution.
- UI state management.
