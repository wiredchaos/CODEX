# RED LEDGER – Relay Dashboard

## Overview

A read-only dashboard for monitoring the RedLedger Relay Core. This client-only application fetches real-time data from your relay instance and displays it in a clean, responsive interface.

## Features

### Real-Time Data Updates

The dashboard uses a dual-connection strategy:
1. **SSE (Server-Sent Events)** - Primary connection method for real-time updates
2. **Polling (4-second intervals)** - Automatic fallback if SSE is unavailable

### Data Sources

The dashboard fetches data from three endpoints:

#### 1. World State
**Endpoint:** `GET {baseUrl}/api/redledger/state?appId={appId}`

Displays:
- World version
- Global signal percentage (0-100%)
- Connection status

#### 2. Events
**Endpoint:** `GET {baseUrl}/api/redledger/events?appId={appId}`

Displays:
- **Active Events** - Currently running events with live countdowns
- **Upcoming Events** - Scheduled events with time-to-start

Each event shows:
- Title and description
- Event type badge
- Countdown timer (days, hours, minutes, seconds)

#### 3. Factions
**Endpoint:** `GET {baseUrl}/api/redledger/factions?appId={appId}`

Displays:
- Faction name and color
- Influence percentage (0-100%)
- Visual progress bar for each faction

### Configuration

The dashboard includes a configuration panel accessible via the settings icon (⚙️).

**Configuration Settings:**
- **Relay Base URL** - Your RedLedger Relay Core instance URL
- **App ID** - Your application identifier

**Storage:** Configuration is persisted in localStorage under the key `redledger_config`

### Connection Status

The header displays real-time connection status:
- **Green checkmark** - Connected (SSE or polling working)
- **Red alert** - Disconnected (check your configuration)
- **Connection type** - Shows "SSE" for server-sent events or "Polling" for interval updates

## Routes

- `/dashboard` - Main dashboard view

## Setup Instructions

1. Navigate to `/dashboard`
2. Click the settings icon (⚙️) in the top-right corner
3. Enter your RedLedger Relay Core details:
   - **Relay Base URL**: e.g., `https://your-relay-domain.com`
   - **App ID**: Your application identifier
4. Click "Connect"
5. The dashboard will automatically start fetching and displaying data

## Component Architecture

### Custom Hooks

#### `useRedLedgerData`
Manages data fetching from the relay:
- Implements SSE with polling fallback
- Handles connection state and errors
- Automatically retries on failure

#### `useRedLedgerConfig`
Manages configuration:
- Reads/writes to localStorage
- Validates configuration completeness
- Provides reset functionality

### UI Components

#### `ConfigPanel`
Settings dialog for entering relay connection details

#### `SignalBar`
Visual progress bar component for percentages

#### `EventsList`
Displays active or upcoming events with countdown timers

## API Expectations

### Response Formats

#### State Response
```json
{
  "worldVersion": "1.0.0",
  "globalSignal": 75.5,
  "timestamp": 1234567890
}
```

#### Events Response
```json
{
  "active": [
    {
      "id": "event-1",
      "title": "Flux Surge",
      "description": "Increased signal fluctuations",
      "factionId": "faction-1",
      "startTime": 1234567890,
      "endTime": 1234567990,
      "type": "SURGE"
    }
  ],
  "upcoming": []
}
```

#### Factions Response
```json
[
  {
    "id": "faction-1",
    "name": "Sovereign",
    "color": "#ff0044",
    "influence": 45.5
  },
  {
    "id": "faction-2",
    "name": "Crimson",
    "color": "#00ffff",
    "influence": 30.2
  }
]
```

## Deployment

This is a client-only application (Vercel deployable):
- No backend required
- No server-side rendering needed
- Direct browser-to-relay communication

## Styling

The dashboard uses:
- Tailwind CSS for styling
- Shadcn/ui components
- Dark theme (black background)
- Red accent color scheme matching RED LEDGER branding
- Responsive design for mobile and desktop

## Error Handling

The dashboard handles various error states:
- **Invalid configuration** - Prompts user to fill required fields
- **Connection failure** - Displays error message with retry option
- **Missing data** - Gracefully handles empty states
- **SSE connection loss** - Automatically falls back to polling

## Performance

- Efficient data fetching (single 4-second polling interval)
- SSE for real-time updates when available
- React memoization for smooth UI updates
- Optimized re-rendering with proper state management
