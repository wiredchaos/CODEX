# Agentropolis Spatial Design System

STATUS: PILOT

CURRENT SCOPE:
Landing page only

PRODUCTION RULE:
Spatial rendering is progressive enhancement.
All content and actions must remain usable without WebGL.

PROMOTION:
Additional routes may adopt the system only after build, accessibility,
performance, and fallback gates pass.

## Server/client boundary

Routes remain server-rendered semantic HTML. `SpatialShell` is server-compatible and renders content immediately. The cinematic canvas is dynamically imported with SSR disabled, and every hook, browser API, React Three Fiber call, WebGL call, or animation-frame concern lives in explicit `.client.tsx` files.

## Fallback model

If WebGL is unavailable, canvas creation fails, JavaScript fails, browser extensions interfere, low-power profile is active, or the user disables spatial rendering, the CSS spatial shell and semantic content remain. Ordinary users do not see error panels. Development logging is sanitized to an error name only.

## Reduced motion and low power

`prefers-reduced-motion: reduce` disables the canvas, floating movement, parallax, pulse, rotation, and transform-heavy transitions. The conservative render profile caps DPR at `1..1.5`, reduces object counts on small/low-power devices, avoids post-processing, avoids expensive shadows, uses demand rendering, and documents hidden-tab pause behavior.

## Accessibility rule

The canvas is decorative, `aria-hidden`, non-interactive, and not focusable. Do not duplicate semantic text in WebGL. Keep one clear `h1`, logical headings, visible focus indicators, usable contrast, understandable links, DOM reading order matching the visual order, and no hover-only or motion-triggered interactions.

## Operational 2D doctrine

Forms remain 2D. Tables remain 2D. Logs remain 2D. Transaction controls remain 2D. Wallet actions remain 2D. Review queues remain 2D. Incident controls remain 2D. Cinematic layers must never obstruct operator actions.

## Route adoption checklist

- Route content renders without JavaScript and without WebGL.
- Canvas is lazy, client-only, decorative, and pointer-events disabled.
- No route-level client conversion unless the route already requires it.
- Reduced-motion, no-WebGL, low-power, mobile, hidden-tab, and offscreen behavior are validated.
- Typecheck, production build, and route tests pass.
- Bundle impact and first-load JavaScript are recorded.

## Performance budget

Pilot routes should keep Three.js isolated in a lazy chunk, cap DPR at 1.5, use no large textures, no post-processing, no expensive shadows, and no continuous full-speed loop unless a reviewed interaction requires it.

## Current measurement notes

This environment does not include the original pull-request branch or GitHub mergeability metadata. Local build output should be used for first-load JavaScript and lazy chunk inspection after install/build validation.

## Follow-up roadmap

1. Land the landing-page pilot only.
2. Validate accessibility and performance with production telemetry that records only initialized, failed, fallback-used, reduced-motion-active, and low-power-active events.
3. Promote one low-risk marketing route after all gates pass.
4. Keep hub, review, ops, portfolio, forms, tables, logs, and transaction paths planar until separately reviewed.
