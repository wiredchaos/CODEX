# RED LEDGER – Field Engine

## Round 2 Integration: RedLedgerControl

### Overview
The Field Engine is now integrated with RedLedgerControl API for real-time state management. All scene parameters are controlled by the external API.

### Configuration

1. **Set up your Base44 domain:**

   Create a `.env` file in the root directory:

   ```env
   VITE_BASE44_DOMAIN=https://your-base44-domain.com
   ```

   Reference `.env.example` for the template.

### API Integration

#### Automatic Flag Polling
- **Frequency:** Every 3 seconds
- **Endpoint:** `GET {BASE_URL}/api/redledger/flags`
- **Response:**
  ```json
  {
    "skyTint": "#0a0a0f",
    "volatility": 1.0,
    "spawnRateMultiplier": 1.0
  }
  ```

#### Node Capture
- **Trigger:** Click on any Liquidity Node
- **Endpoint:** `POST {BASE_URL}/api/redledger/capture`
- **Request Body:**
  ```json
  {
    "nodeId": "node-0",
    "faction": "SOVEREIGN"
  }
  ```
- **Post-Capture:** Flags are automatically refetched

### Flag Applications

| Flag | Scene Effect |
|------|--------------|
| `skyTint` | Background and fog color |
| `volatility` | Node light intensity and particle effects |
| `spawnRateMultiplier` | Float animation speed multiplier |

### Scene Features

- **5 Liquidity Nodes** with unique IDs (node-0 through node-4)
- **Neon Infinite Grid** with red/cyan sections
- **Particle Stars** background with volatility-controlled intensity
- **Dynamic Lighting** that responds to API parameters
- **HUD Display** showing:
  - Signal percentage (based on captured nodes)
  - Nodes captured count
  - Current volatility value
  - Spawn rate multiplier
  - Connection status (SYNCING / API ERROR)

### Routes

- `/` - Homepage with 3D scene
- `/field-ops` - Dedicated Field Ops route

### State Management

- **No local event logic** - all state comes from RedLedgerControl
- **No backend** - pure client-side
- **No Supabase** - direct API communication
- **Error handling** - displays connection errors in HUD
- **Loading states** - shows "SYNCING..." during API calls

### Node IDs

Each node has a unique identifier:
- node-0
- node-1
- node-2
- node-3
- node-4

These IDs are sent to the capture endpoint and can be used by RedLedgerControl for tracking.

### Development

The implementation uses:
- **React hooks** for state management
- **Three.js** for 3D rendering
- **React Three Fiber** for React integration
- **React Three Drei** for helper components
- **TypeScript** for type safety

### Performance

- Optimized for smooth 60fps
- DPR clamping [1, 2]
- Performance min set to 0.5
- Efficient polling interval (3 seconds)
