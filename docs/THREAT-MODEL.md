# Threat Model

| Class | Threat | Affected assets | Likely attack path | Required control | Current status |
| --- | --- | --- | --- | --- | --- |
| confused deputy | Authorized tool is induced to act for the wrong principal. | tools, receipts, identities | untrusted content asks an agent to reuse authority | actor binding, tool scope, receipt | documented |
| replay attack | Old approval is reused. | approvals, wallets | captured receipt or approval evidence resubmitted | nonce, expiry, payload hash | planned |
| stale approval | Expired approval is accepted. | wallets, settlements | delayed execution after approval window | approval expiry enforcement | planned |
| receipt tampering | Receipt fields are modified. | audit trail | edit stored receipt | hashes and signing metadata | planned |
| audit-log deletion | Evidence is removed. | audit integrity | delete or truncate logs | immutable storage | planned |
| indirect prompt injection | Retrieved content issues hidden instructions. | policy gates, tools | poisoned document or webpage | treat content as data | documented |
| tool-result poisoning | Tool output carries malicious instructions. | agents, tools | compromised search or MCP response | output validation | documented |
| model-output injection | Generated text attempts to grant authority. | downstream agents | model output reused as instruction | authority separation | documented |
| cross-agent impersonation | Agent claims another identity. | identities, receipts | forged agent message | identity verification | planned |
| dependency substitution | Package source is swapped. | build chain | typosquat or registry confusion | pinned dependencies and review | planned |
| package compromise | Legitimate package is malicious. | CI, runtime | compromised maintainer release | lockfile review and scanning | planned |
| approval coercion | Approver is pressured or tricked. | approvals | social engineering | independent approvals and review | documented |
| compromised administrator | Admin weakens controls. | policy, secrets | privileged account abuse | policy-change governance | planned |
| race condition | State changes between check and use. | tools, wallets | concurrent approval/execution | TOCTOU controls | planned |
| time-of-check/time-of-use failure | Approved payload differs at execution. | wallets, tools | mutate payload after approval | exact payload binding | planned |
| unauthorized policy change | Policy is altered without approval. | policy contract | direct file change | version governance and receipts | documented |
| malicious configuration change | Config disables gates. | tools, policy | config PR or environment change | config review | planned |
| secret exfiltration through logs | Secrets are recorded in audit text. | secrets, logs | raw payload logging | hash-only receipts | documented |
| data-classification downgrade | Restricted data marked public. | data | malicious classification | fail-closed classification | planned |
| jurisdiction-policy bypass | Wrong jurisdiction rules applied. | policy gates | missing or false jurisdiction | jurisdiction gate | planned |
| denial of service against policy gates | Gate unavailable causes unsafe fallback. | availability, safety | overwhelm validator | fail closed | documented |
| forged approval evidence | Fake approval reference is accepted. | approvals | fabricated evidence URI | evidence verification | planned |
| rollback to weaker policy version | Older weaker policy is restored. | policy | rollback without governance | immutable versions | documented |
