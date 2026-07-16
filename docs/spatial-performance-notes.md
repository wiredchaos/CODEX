# Spatial Performance Notes

Pilot route: `/` only.

Measurements must come from production build output and browser profiling. Do not promote additional routes until the PR records:

- route JavaScript bundle delta
- Three.js lazy chunk size
- first-load JavaScript
- initial render without canvas
- canvas lazy-load timing
- mobile memory observations where available
- CPU/GPU behavior during idle
- hidden-tab pause behavior

Current local note: the canvas is lazy-loaded with SSR disabled and the route content renders independently of WebGL. Exact bundle numbers must be taken from a successful `pnpm --filter @chaos/web build` / root build output in the target repository environment.
