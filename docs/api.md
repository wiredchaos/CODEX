# API

All routes are versioned under `/api/v1` and return `{ "success": true, "data": {}, "error": null, "requestId": "..." }` or `{ "success": false, "data": null, "error": { "code": "FORBIDDEN", "message": "..." }, "requestId": "..." }`.

Routes: `GET /health`, `GET /status`, `POST /auth/session`, `GET /auth/me`, `GET|POST /members`, `GET|PATCH /members/:id`, `GET|POST /proposals`, `GET|PATCH /proposals/:id`, `POST /proposals/:id/votes`, `GET|POST /projects`, `GET|PATCH /projects/:id`, `GET|POST /bounties`, `GET /bounties/:id`, `POST /bounties/:id/submissions`, `GET /treasury/summary`, `GET /treasury/transactions`, `GET /receipts`, and `GET /receipts/:id`.

Example session request: `POST /api/v1/auth/session` with `{ "email": "member@example.com" }`.
Example proposal request: `POST /api/v1/proposals` with bearer token and `{ "title": "Proposal", "body": "Long proposal body", "authorId": "user_id" }`.
