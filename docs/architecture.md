# Architecture

## Repository Boundary

`jules-action` is a single-action repository. The repository owns a GitHub Action that validates typed inputs, resolves Jules source context, creates a Jules session, and emits session outputs.

The repository surfaces are:

- `action.yml`: public action contract
- `src/`: TypeScript runtime organized by action, app, and workflow-context boundaries
- `dist/`: release-managed package output used by GitHub Actions at tag resolution time
- `tests/`: repository-owned boundary tests under `tests/action`, `tests/app`, and `tests/workflow-context`

## Jules API Client

The Jules API is consumed through the external `jls` library (`github:akitorahayashi/jls-api-ts`), pinned to a commit in `package.json`. `jls` owns the wire models, value validation (prompt, title, branch, resource names), transport, and error taxonomy (`ApiError`, `ValidationError`, `TransportError`). The action composes these primitives; it does not model the API itself.

`jls` is a git-hosted dependency built by its `prepare` script during install, allowed through `allowBuilds` in `pnpm-workspace.yaml`.

## Runtime Boundaries

The runtime boundaries are:

- `src/index.ts`: bootstrap and top-level orchestration only
- `src/action/`: input reading, request normalization into `jls` value types, and output emission
- `src/app/`: use-case orchestration for source resolution and session creation
- `src/workflow-context/`: repository and branch extraction from GitHub workflow environment

## Dependency Direction

Runtime dependencies follow this direction:

```text
index  -> action, app
action -> jls
app    -> action (type only), jls, workflow-context
```

Workflow context does not depend on action modules or `jls`.

## Runtime Execution Flow

The action runtime executes this sequence:

1. Read required and optional action inputs.
2. Validate input values through `jls` value constructors.
3. Resolve `source` from explicit input or repository context.
4. Resolve `starting-branch` from explicit input or workflow context.
5. Verify source existence through `sources.get`.
6. Create a session through `sessions.create`.
7. Emit session outputs and log the created session resource name.

## Reusable Baseline

The repository keeps the reusable TypeScript GitHub Action baseline:

- `action.yml`
- minimal `src/index.ts` bootstrap
- boundary-owned runtime directories (`src/action`, `src/app`, `src/workflow-context`)
- boundary-owned tests (`tests/action`, `tests/app`, `tests/workflow-context`)
- standard validation and release packaging (`pnpm`, `dist/`)

## Failure Invariants

The action fails explicitly when:

- required inputs are missing or blank
- `JULES_API_KEY` is missing or blank
- input values violate enum, boolean, or resource-name contracts
- repository or branch cannot be inferred and no explicit override is provided
- the resolved source does not exist in Jules
- Jules API returns a non-successful response

No silent fallback paths are used.
