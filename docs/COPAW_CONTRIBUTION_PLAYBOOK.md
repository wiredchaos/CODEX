# CoPaw Contribution Playbook (NEURO / WIRED CHAOS META)

This playbook captures a practical, repeatable workflow for contributing to the Apache-2.0 `agentscope-ai/CoPaw` repository from a WIRED CHAOS META context.

## 1) Fork the upstream repository

- Navigate to `https://github.com/agentscope-ai/CoPaw`.
- Select **Fork** (top-right) to create your own copy.

## 2) Clone your fork

```bash
git clone https://github.com/<your-username>/CoPaw.git
cd CoPaw
```

## 3) Create a focused branch

Use an isolated branch for each contribution:

```bash
git checkout -b feature/neuro-meta-x
```

Suggested branch naming patterns:

- `feature/<capability-name>`
- `doc/<topic-name>`
- `fix/<issue-name>`

## 4) Implement your change

Target directories by change type:

- `src/copaw` for core Python behavior
- `website` for front-end/UI updates
- `scripts/*` for CLI and automation
- `tests` for test coverage
- `website/public/docs` for project documentation

Examples of meaningful WIRED CHAOS-aligned contributions:

- Modular integration points for NEURO META X orchestration patterns
- Adapter modules for agent interoperability
- Integration documentation and end-to-end workflow guides
- Unit tests that validate extension contracts

## 5) Install dependencies and run checks

```bash
pip install -e .
pip install -e ".[dev]"
```

Then execute the checks documented by CoPaw's `CONTRIBUTING.md` and verify your update is stable.

## 6) Commit and push

```bash
git add .
git commit -m "feat: add NEURO META X integration blueprint"
git push origin feature/neuro-meta-x
```

Use clear commit messages that describe both **what** changed and **why** it matters.

## 7) Open a pull request

From your fork on GitHub, select **Compare & pull request**.

A strong PR description should include:

- A concise summary of the change
- The user or system impact
- References to linked issues/specs
- Evidence of tests and docs updates

## High-signal PR checklist

- Follow upstream `CONTRIBUTING.md` conventions.
- Add tests when behavior changes.
- Add or update docs for discoverability.
- Keep formatting/lint/style consistent with the codebase.

## Strategic WIRED CHAOS contribution ideas

When contributing from WIRED CHAOS META, prioritize modular increments:

- `copaw_ext/neuro_meta_x` plugin scaffold
- Skill interface exposing WIRED CHAOS agent patterns
- Integration docs mapping orchestrator boundaries and flows
- Unit tests for extension correctness and regression safety

Contributing in these increments keeps reviews tractable while increasing ecosystem interoperability.
