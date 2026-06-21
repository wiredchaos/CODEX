# MCP RANGER: Open Signal OSINT Registry

## Role

MCP RANGER is the AGENTROPOLIS scout unit for discovering public MCP servers, public APIs, OpenAPI specs, SDKs, datasets, and free data endpoints.

This repo stores the MCP RANGER knowledge layer: discovery receipts, normalized source records, scoring logic, risk notes, and replacement maps for paid vendor dependencies.

## Doctrine

```text
Discover does not equal trust.
Index does not equal execute.
Popularity does not equal safety.
Free does not equal lawful.
```

Every candidate must be classified before use:

1. Source
2. License
3. Auth model
4. Pricing model
5. Freshness
6. Schema availability
7. Risk score
8. Quality score
9. Sandbox recommendation
10. Human review status

## Registry Object

```json
{
  "id": "stable-resource-id",
  "name": "Resource Name",
  "type": "mcp_server | openapi | rest_api | graphql | sdk | dataset | docs",
  "source": "github | npm | pypi | docker | docs | registry | other",
  "url": "https://example.com",
  "repo_url": "https://github.com/owner/repo",
  "license": "MIT | Apache-2.0 | GPL | unknown | proprietary",
  "auth_required": true,
  "auth_model": "none | free_key | oauth | paid_key | unknown",
  "free_tier": true,
  "paid_only": false,
  "openapi_url": "https://example.com/openapi.json",
  "mcp_config": {},
  "tags": ["market", "public-records", "research"],
  "risk_score": 0,
  "quality_score": 0,
  "last_checked": "YYYY-MM-DD",
  "review_status": "candidate | quarantined | sandboxed | approved | rejected"
}
```

## Discovery Categories

- Market intelligence APIs
- Public records APIs
- Government open data
- Research datasets
- Developer infrastructure APIs
- Web3 indexing APIs
- Media and social signal APIs
- Standards-body data
- Public transportation and city data
- Weather, climate, and geospatial data
- MCP servers and agent tool registries

## Scoring Rules

```text
+25 open-source license
+20 working OpenAPI spec or MCP config
+15 active repo within 90 days
+15 no required payment
+10 clear documentation
+10 stable maintainer or official source
+10 machine-readable schema
-30 paid-only access
-25 requires secret key before basic inspection
-20 abandoned repo
-20 unclear legal terms
-25 unverifiable maintainer
-40 suspicious install script
-50 asks agents for broad host permissions without justification
```

## Operating Loop

```text
Keyword / Domain Request
↓
Source Crawl
↓
Candidate Extraction
↓
Schema Normalization
↓
License + Auth Classification
↓
Risk Scan
↓
Quality Score
↓
Registry Entry
↓
Sandbox Test Recommendation
↓
Human Review Gate
```

## Agent Tool Surface

```text
search_public_mcps(query, category, free_only)
search_public_apis(query, auth_required, openapi_only)
inspect_resource(url)
score_resource(url)
watch_new_mcps(keyword)
export_openapi_pack(category)
```

## Repository Sync Rule

This file should remain synchronized with:

- wiredchaos/agentropolis: mcp-skills/skills/mcp-ranger.md
- wiredchaos/wired-chaos: docs/mcp-ranger-open-signal-osint.md

AGENTROPOLIS is the system authority. CODEX is the memory/evidence layer. wired-chaos is the operational intelligence layer.
