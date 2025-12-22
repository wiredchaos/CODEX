# Trinity 3DT Consumers

This document clarifies that any project with a name ending in `-3DT` is a **consumer** of the Wired Chaos platform. These projects are not standalone runtimes; they rely on the shared platform services to operate in production.

## What is a 3DT consumer?
A 3DT consumer is an application, experience, or asset bundle that plugs into the Wired Chaos platform. It expects the platform to provide runtime execution, registry lookups, permission controls, and the environment needed to run safely. The consumer supplies its own content and behavior within those boundaries but does not replace or fork the platform.

## Platform dependencies for all `*-3DT` projects
Every project ending in `-3DT`:
- **Uses the Wired Chaos runtime** for execution, orchestration, and lifecycle management.
- **Relies on the Wired Chaos registry** for discovery, configuration, and artifact resolution.
- **Depends on Wired Chaos permissions** for authentication, authorization, and policy enforcement.
- **Runs inside the Wired Chaos environment** for deployment, observability, logging, and safety rails.

These dependencies are mandatory and non-optional; a `-3DT` project cannot run without the platform.

## What 3DT consumers may define
- Domain logic specific to the experience or asset (scenes, interactions, data mappings).
- Integration contracts that call into approved platform interfaces.
- Configuration values that the platform reads to wire the experience (e.g., feature flags, asset references).
- Documentation for operators and users of the experience.

## What 3DT consumers may not define
- Replacement runtimes, registries, or permission systems.
- Alternative environment or deployment stacks that bypass the Wired Chaos platform.
- Platform governance, ownership, or security rules.
- Rendering or WebGPU pipelines; those are provided by the platform and must not be reimplemented here.

## Ownership and responsibility
- **Platform**: owns runtime stability, registry integrity, permission enforcement, environment safety, and upgrade cadence.
- **Consumer teams**: own their experience logic, assets, and adherence to platform contracts. They must keep their integrations compatible with platform versioning and follow platform deprecation notices.

By declaring `-3DT` status, a project opts into the consumer role and accepts these dependencies and boundaries.
