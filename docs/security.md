# Security

- Secrets live in environment-specific secret stores, never in git.
- Roles are PUBLIC, MEMBER, CONTRIBUTOR, MODERATOR, OPERATOR, and ADMIN.
- Signer separation is mandatory: KDAOcore prepares transactions but does not hold keys or broadcast by default.
- Contract-write operations require an explicit authorized signer outside the core service.
- Logs redact authorization headers, passwords, tokens, secrets, and private-key-shaped fields.
- Sensitive actions create append-only audit receipts through application logic.
- Incident response should preserve logs, receipt IDs, request IDs, actor IDs, and state hashes while avoiding secret disclosure.
