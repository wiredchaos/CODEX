# 3DT Consumer Contract (Plain Language)

If you create anything named with the `-3DT` suffix, you are building a **consumer** that runs on the Wired Chaos platform. This contract explains what you automatically get and what you must follow.

## What you inherit automatically
- **Platform runtime**: Your project runs on the Wired Chaos runtime. You do not ship your own runtime.
- **Registry**: Discovery, configuration, and artifact references are handled by the Wired Chaos registry.
- **Permissions**: Authentication and authorization are enforced by the platform. You use the platform controls; you do not add your own gatekeepers.
- **Environment**: Deployment, logging, observability, and safety rails come from the platform environment.

## Lifecycle expectations
- `-3DT` projects are onboarded into the platform lifecycle: deployment, monitoring, incident response, and rollback are managed through platform tools.
- Changes to your project must respect platform change windows and rollout rules.
- Platform deprecations and security updates apply to you automatically; you must adapt before deadlines to avoid disruption.

## Versioning and upgrades
- The platform publishes runtime, registry, permissions, and environment versions. Your project must stay compatible with the supported versions.
- When a platform version is marked for upgrade, you are expected to validate your project against the new version and follow the prescribed upgrade path.
- If you need features or fixes, you request them through platform channels; you do not fork the platform to move faster.

## What you may do
- Build and evolve your experience logic, assets, and configurations that plug into the platform.
- Document how operators should run and support your experience within the platform boundaries.
- Use approved platform interfaces to call services or respond to events.

## What you may not do
- Replace or bypass the Wired Chaos runtime, registry, permissions, or environment.
- Define your own governance, ownership, or security rules that conflict with the platform.
- Implement rendering or WebGPU pipelines outside the platform. Consumers do not supply rendering engines.

## Ownership boundaries
- Wired Chaos owns and operates the runtime, registry, permissions, environment, and upgrade cadence.
- Consumer teams own their content, logic, and correctness within the platform. They must remain compatible with platform policies and timelines.

By using the `-3DT` suffix, you agree that your project is a Wired Chaos consumer and that these platform expectations apply.
