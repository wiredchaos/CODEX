# MCP RANGER

**Tagline:** Open Signal OSINT

MCP RANGER is the AGENTROPOLIS scout unit for discovering public MCP servers, public APIs, OpenAPI specs, SDKs, datasets, and free data endpoints.

## Repository Role

```text
AGENTROPOLIS = System Authority
CODEX        = Memory Authority
wired-chaos  = Operations Authority
```

CODEX preserves the MCP RANGER knowledge layer: source records, registry schemas, evidence receipts, scoring history, and vendor-replacement notes.

## Doctrine

```text
Discover does not equal trust.
Index does not equal execute.
Popularity does not equal safety.
Free does not equal approved.
Open-source does not equal production-ready.
```

## Operating Loop

```text
Request
↓
Source Crawl
↓
Candidate Extraction
↓
Schema Normalization
↓
License and Auth Classification
↓
Risk Scan
↓
Quality Score
↓
Registry Entry
↓
Sandbox Recommendation
↓
Human Review Gate
```

## Discovery Targets

- GitHub repositories
- npm packages
- PyPI packages
- Docker images
- public OpenAPI and Swagger documents
- MCP server lists and registries
- official open-data portals
- API directories
- public documentation pages with machine-readable API references

## Agent Surface

```text
RANGER-SCOUT     = finds public MCPs and APIs
RANGER-SCRIBE    = normalizes metadata
RANGER-RISK      = scores threat and trust posture
RANGER-ARCHIVIST = stores registry objects and receipts
RANGER-WATCH     = monitors new MCP and API releases
RANGER-MARKET    = hunts market intelligence sources
RANGER-CIVIC     = hunts public civic datasets
```

## Tool Surface

```text
search_public_mcps(query, category, free_only)
search_public_apis(query, auth_required, openapi_only)
inspect_resource(url)
score_resource(url)
watch_new_mcps(keyword)
export_openapi_pack(category)
```

## Security Gate

Before any candidate can be used by production agents:

1. Source must be recorded.
2. License must be classified.
3. Auth model must be classified.
4. Pricing model must be classified.
5. Risk score must be assigned.
6. Quality score must be assigned.
7. Candidate must be quarantined or sandboxed.
8. Human approval must be recorded for execution.

## Sync Rule

This file should remain synchronized across:

- wiredchaos/agentropolis
- wiredchaos/CODEX
- wiredchaos/wired-chaos
