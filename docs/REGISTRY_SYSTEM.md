# World Registry + Patch Registry + Multiverse Timeline System

This system implements a canonical World Registry, Patch Registry, and append-only Multiverse Timeline for managing worlds, patches, and events across the WIRED CHAOS multiverse.

## Architecture

### Database Models

- **World**: Represents a universe/world with associated tokens (e.g., "3DT", "AKIRA_CODEX")
- **Patch**: Defines invariants, scope, enforcement rules, and observable effects for a world
- **TimelineEvent**: Append-only event log tracking all changes and milestones

### API Endpoints

#### GET /api/worlds
Returns all registered worlds with their tokens and metadata.

**Response:**
```json
{
  "worlds": [
    {
      "id": "3DT",
      "name": "3DT World",
      "description": "...",
      "tokens": ["3DT"],
      "metadata": {...}
    }
  ]
}
```

#### GET /api/patches?world=<worldId>
Returns patches for a specific world or all patches.

**Query Parameters:**
- `world` (optional): Filter by world ID

**Response:**
```json
{
  "patches": [
    {
      "id": "PATCH_001",
      "worldId": "3DT",
      "invariant": "...",
      "scope": "...",
      "enforcement": "...",
      "observableEffects": "..."
    }
  ]
}
```

#### POST /api/timeline/event
Creates a new timeline event (append-only).

**Request Body:**
```json
{
  "worldId": "3DT",
  "patchId": "PATCH_001",
  "eventType": "PATCH_APPLIED",
  "description": "...",
  "metadata": {...}
}
```

**Response:**
```json
{
  "event": {
    "id": "...",
    "worldId": "3DT",
    "eventType": "PATCH_APPLIED",
    "timestamp": "2025-12-20T...",
    ...
  }
}
```

#### GET /api/timeline?world=<worldId>
Returns timeline events for a specific world or all events (chronologically ordered).

**Query Parameters:**
- `world` (optional): Filter by world ID

## Core Patches

### 3DT World Patches

1. **PATCH_001** - World Membership: Automatic token-based artifact classification
2. **PATCH_002** - Timeline Ledger: Append-only, immutable event tracking
3. **PATCH_003** - Health Swarm Governance: Multi-signature consensus for decisions
4. **PATCH_004** - Structural Boundaries: Explicit world isolation and communication
5. **PATCH_005** - Emergent Sandbox: Safe experimentation with escape hatches

### AKIRA_CODEX World Patches

1. **PATCH_AKIRA_001** - Canon Integrity: Preserve canon across timeline branches
2. **PATCH_AKIRA_002** - Timeline Ledger: Record events with provenance metadata
3. **PATCH_AKIRA_003** - Source Provenance: Cryptographic content attribution
4. **PATCH_AKIRA_004** - Multiverse Branching: Maintain parent-child relationships
5. **PATCH_AKIRA_005** - Governance Review: Required approval for canonical changes

## World Membership Logic

The system includes helper functions to match artifacts to worlds based on tokens:

```typescript
import { matchArtifactToWorlds, belongsToWorld } from './src/lib/registry/worldMembership.js';

// Match artifact to worlds
const worlds = [
  { id: '3DT', tokens: ['3DT'] },
  { id: 'AKIRA_CODEX', tokens: ['AKIRA_CODEX'] }
];

const artifact = {
  id: 'my-artifact',
  tokens: ['3DT']
};

const matchedWorlds = matchArtifactToWorlds(artifact, worlds);
// Returns: ['3DT']
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Create a `.env` file:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wired_chaos_db?schema=public"
```

### 3. Run Migrations
```bash
npm run prisma:migrate
```

### 4. Seed Data
```bash
npm run prisma:seed
```

This will populate the database with:
- 2 Worlds (3DT, AKIRA_CODEX)
- 10 Core Patches (5 per world)
- Initial timeline events

### 5. Start Server
```bash
npm run dev
```

The server will start on port 3000 (or PORT environment variable).

## Testing

### Test API Endpoints

```bash
# Get all worlds
curl http://localhost:3000/api/worlds

# Get patches for 3DT
curl "http://localhost:3000/api/patches?world=3DT"

# Get timeline for AKIRA_CODEX
curl "http://localhost:3000/api/timeline?world=AKIRA_CODEX"

# Create a new timeline event
curl -X POST http://localhost:3000/api/timeline/event \
  -H "Content-Type: application/json" \
  -d '{
    "worldId": "3DT",
    "eventType": "ARTIFACT_MATCHED",
    "description": "New artifact matched to 3DT world"
  }'
```

## Design Principles

### Append-Only Timeline
The timeline is designed to be append-only. Once a TimelineEvent is created, it cannot be modified or deleted, ensuring a complete and verifiable audit trail.

### Token-Based World Membership
Artifacts are matched to worlds based on token arrays. An artifact with `["3DT"]` token will belong to the 3DT world. Artifacts can belong to multiple worlds if they have multiple tokens.

### Patch Template
Each patch follows a strict template:
- **invariant**: The core rule this patch enforces
- **scope**: What area of the system this applies to
- **enforcement**: How the invariant is enforced
- **observableEffects**: What observable effects this patch has

## TypeScript Types

All types and schemas are defined in `src/types/registry.ts` using Zod for runtime validation.

## Future Enhancements

- Add authentication and authorization
- Implement patch versioning
- Add timeline event pagination
- Create webhooks for timeline events
- Add multiverse branching visualization
