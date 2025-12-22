# Dependabot Remediation Runbook

Goal: drive Dependabot alerts to **0 High/Critical** and burn down Moderates in batches while keeping CI green.

## Standard operating procedure (per alert batch)
1. Create a branch: `sec/dependabot-batch-YYYYMMDD`.
2. Update dependency versions to the **minimum patched version** that fixes each alert (avoid "latest everything").
3. Rebuild lockfiles.
4. Run tests + linters.
5. Commit with clear message(s).
6. Open a PR with a checklist + links to alerts addressed.

## Frontend (Node) fixes
If both `package-lock.json` and `yarn.lock` exist in `/frontend`, pick one package manager and remove the other lockfile to avoid duplicate alerts.

### Path A — npm (recommended when `package-lock.json` exists)
```bash
cd frontend
rm -f yarn.lock
npm install
npm audit fix
npm test
```
Commit examples:
- `chore(security): remove yarn.lock and refresh npm lockfile`
- `chore(security): npm audit fixes`

### Path B — yarn
```bash
cd frontend
rm -f package-lock.json
yarn install
yarn npm audit --all || true
yarn test
```
Commit example:
- `chore(security): remove package-lock and refresh yarn.lock`

Target the minimum patched versions that resolve PostCSS, webpack-dev-server, js-yaml, and any other Dependabot Node alerts.

## Backend (Python) fixes
For each service with `requirements.txt` (e.g., `backend/requirements.txt`, `vault33-gatekeeper/requirements.txt`, root `requirements.txt`):

- If versions are pinned: bump vulnerable packages (e.g., `starlette`, `urllib3`, `ecdsa`) to the Dependabot-suggested patched releases in the same major series.
- If versions are unpinned: pin the vulnerable packages to the minimum patched versions while leaving other lines unchanged.

Then validate:
```bash
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
pip check
pytest
```
Commit example:
- `chore(security): bump python deps to patched versions`

## Starlette multipart DoS hardening
After upgrading Starlette, add body size limits to prevent large multipart DoS:

- **Reverse proxy (preferred):**
  - Nginx: `client_max_body_size 10m;`
  - Traefik/Cloudflare: set request body limits.

- **ASGI/FastAPI middleware (when no proxy control):**
```py
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import PlainTextResponse

class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_bytes: int = 10 * 1024 * 1024):
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next):
        cl = request.headers.get("content-length")
        if cl and int(cl) > self.max_bytes:
            return PlainTextResponse("Payload too large", status_code=413)
        return await call_next(request)
```
Register with `app.add_middleware(MaxBodySizeMiddleware, max_bytes=10 * 1024 * 1024)`.

## Dependabot signal tuning
Add or verify `.github/dependabot.yml` to group updates and reduce noise. Example:
```yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    groups:
      dev-deps:
        dependency-type: "development"

  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

## CI guardrail for High/Critical vulns on `main`
Enable a CI gate that fails when High/Critical vulnerabilities exist on the default branch (or when a PR would introduce them).

Minimum viable pattern:
- Add a lightweight SCA step (e.g., `npm audit --production` and `pip-audit`) to the pipeline.
- Fail the job if High/Critical findings are present; allow exceptions only via reviewed allowlists.
- Keep the job fast (seconds) so the signal is always on.

## Copy/paste prompt for Codex
> You are fixing GitHub Dependabot alerts in wiredchaos/wired-chaos. Create a branch `sec/dependabot-batch-YYYYMMDD`. In `/frontend`, choose ONE package manager and remove the other lockfile (prefer npm if package-lock exists). Regenerate the lockfile and bump vulnerable packages to minimum patched versions that resolve PostCSS, webpack-dev-server, and js-yaml alerts. Run frontend tests/build. In Python services (`backend/requirements.txt`, `requirements.txt`, `vault33-gatekeeper/requirements.txt` if present), bump vulnerable deps (e.g., starlette/urllib3/ecdsa) to minimum patched versions that close alerts. Run `pip check` and `pytest`. Add request body upload limits (proxy config or middleware) to mitigate multipart DoS. Commit with clear messages and open a PR describing which alerts are fixed.
