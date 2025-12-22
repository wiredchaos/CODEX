# Portfolio Multiverse CODEX Prompt

Paste the following prompt into CODEX (in the WIRED CHAOS MAIN repo):

```
You are CODEX operating inside the WIRED CHAOS MAIN repository.

OBJECTIVE
Build a WOW-first, immersive Portfolio Multiverse where users enter directly into a live 3D environment on app load. No static landing page. The experience must feel immediate, cinematic, and spatial.

CORE CONCEPTS (NON-NEGOTIABLE)
1. The application boots directly into a 3D scene (WebGL / Three.js / React Three Fiber).
2. The first scene is the MULTIVERSE LOBBY — a spatial hub, not a UI page.
3. Navigation occurs through a TRINITY ELEVATOR (3D object) that allows:
   - Vertical timeline jumps
   - Horizontal patch traversal
   - Locked / unlocked timeline skipping
4. Every PATCH resolves to a 3D ROOM.
5. Every ROOM visually explains the PATCH via spatial layout, motion, light, and interaction.

SYSTEM ARCHITECTURE
Create the following system:

/multiverse
  /lobby
  /rooms/[patchId]
  /elevator
  /registry
  /unlock

REGISTRY-DRIVEN DESIGN
Create `patch_registry.json` as the single source of truth:

Each patch entry must include:
- id
- title
- timeline (era / version)
- roomType (gallery, command, archive, simulation)
- unlockRequirements (NFTs, artifacts, flags, solvedClues)
- visualProfile (color, lighting, motion tempo)
- entryAnimation (camera fly-in rules)

ROOM GENERATION
Rooms are generated dynamically from the registry.
When a user enters `/rooms/[patchId]`:
- Load the 3D room immediately
- Animate camera entry within 500ms
- Populate interactive objects based on patch metadata
- Display NO blocking UI before the 3D scene loads

TRINITY ELEVATOR
Implement a persistent 3D elevator that exists in:
- Lobby
- All rooms

The elevator has 3 modes:
1. TIMELINE MODE – jump eras
2. PATCH MODE – move between systems
3. AKASHIC MODE – skip normally locked paths IF conditions are met

UNLOCK & GAMIFICATION
Create `user_state.json` (mocked for now):
- ownedArtifacts
- ownedNFTs
- solvedClues
- unlockedTimelines

Room access logic:
- If locked → show altered reality version (glitch, fog, partial geometry)
- If unlocked → full fidelity room

WOW REQUIREMENTS
- Motion is mandatory (idle motion, breathing light, parallax)
- Camera NEVER feels static
- Rooms feel “entered”, not “loaded”
- Galaxy / void / depth backgrounds preferred over flat walls
- Ambient sound hooks allowed (no audio files required yet)

ROUTING
- `/` redirects instantly to `/lobby`
- `/lobby` is a 3D space, not a page
- `/rooms/[patchId]` always renders a 3D scene

TECH CONSTRAINTS
- Use existing visual style
- Extend current 3D Room Template
- No placeholders like “TODO UI”
- Fail gracefully if registry entries are missing

DELIVERABLES
1. Registry-driven room system
2. Trinity Elevator component
3. Lobby as 3D multiversal hub
4. One fully implemented WOW-level example room (e.g. akira-codex)
5. Clean, readable architecture comments for future patch expansion

DO NOT:
- Add marketing copy
- Add flat landing pages
- Explain concepts in prose

BUILD THE SYSTEM.
```
