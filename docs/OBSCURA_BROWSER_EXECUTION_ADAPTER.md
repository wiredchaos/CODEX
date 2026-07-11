# Obscura Browser Execution Adapter

Status: approved for pilot.

## Scope

The Obscura browser execution adapter is a documentation-only pilot for governed public-web browsing workloads. It does not change application source, deployment targets, dependencies, routes, secrets, or production behavior.

## Routing policy

Obscura-first routing is approved only for low-risk public-web workloads that have been explicitly approved for the pilot. Any workload outside that scope must remain on the existing governed execution path.

Required routing controls:

- Use Obscura first only for approved low-risk public-web tasks.
- Keep Playwright + Chromium available as the fallback path.
- Keep stealth disabled by default.
- Block SSRF and private-network access before dispatch.
- Require human approval for consequential actions, including purchases, account changes, data submission, or irreversible operations.

## Security boundaries

The pilot must preserve reject-first network posture:

- deny localhost, link-local, private RFC1918 ranges, metadata endpoints, and internal hostnames;
- deny credential capture, secret extraction, and session-token exfiltration;
- deny form submission unless the task has explicit human approval;
- emit audit receipts for adapter selection, fallback activation, blocked destinations, and approval checkpoints.

## Promotion gates

Production promotion is blocked until all of the following gates pass:

- benchmark evidence against Playwright + Chromium baseline;
- security review covering SSRF, private-network blocking, credential handling, and auditability;
- licensing review for Obscura and any transitive runtime requirements;
- compatibility validation across the approved workload classes and fallback path.

Until those gates pass, Obscura remains pilot-only documentation and must not be treated as production runtime capability.
