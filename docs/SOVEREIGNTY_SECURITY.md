# Sovereignty Security Notes

The Express service binds to `127.0.0.1` by default and supports explicit `SOVEREIGNTY_HOST` override. Administrative endpoints require `Authorization: Bearer <SOVEREIGNTY_ADMIN_TOKEN>` and audit every administrative action without logging the token.

Sensitive endpoints:
- `POST /v1/circuit-breakers/:id/reset`
- `POST /v1/evaluations/run`
- `POST /v1/stress-tests/run`

Provider output is untrusted. The subsystem documents and enforces v1 limits where implemented: JSON body-size limits, request IDs, structured errors, timeouts, graceful shutdown hooks, security headers, error sanitization, no arbitrary code execution, no model-controlled policy changes, no model-controlled registry changes, no model-controlled circuit-breaker resets, and no model-controlled admin token use. Production requires stronger identity, RBAC, rate limiting, durable audit persistence, and deployment-specific network controls.

`toolPlan()` semantics, if added, must return a plan only and must not execute tools directly.
