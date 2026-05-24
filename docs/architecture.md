# Architecture

## Repository Boundary

`jules-action` is a single-action repository. The repository owns a GitHub Action that validates typed inputs, resolves Jules source context, creates a Jules session, and emits session outputs.

The repository surfaces are:

- `action.yml`: public action contract
- `src/`: TypeScript runtime organized by action, app, API, and workflow-context boundaries
- `dist/`: release-managed package output used by GitHub Actions at tag resolution time
- `tests/`: repository-owned boundary tests under `tests/action`, `tests/app`, `tests/jules-api`, and `tests/workflow-context`

## Runtime Boundaries

The runtime boundaries are:

- `src/index.ts`: bootstrap and top-level orchestration only
- `src/action/`: input reading, request normalization, and output emission
- `src/app/`: use-case orchestration for source resolution and session creation
- `src/jules-api/`: API contract, payload assembly, HTTP client, and source matching
- `src/workflow-context/`: repository and branch extraction from GitHub workflow environment

## Dependency Direction

Runtime dependencies follow this direction:

```text
index            -> action, app
app              -> action (type only), jules-api, workflow-context
jules-api/client -> jules-api/contract, jules-api/errors
```

Workflow context does not depend on action or API modules.

## Runtime Execution Flow

The action runtime executes this sequence:

1. Read required and optional action inputs.
2. Validate all input values.
3. Resolve `source` from explicit input or repository context.
4. Resolve `starting-branch` from explicit input or workflow context.
5. Verify source existence through `sources.list`.
6. Create a session through `sessions.create`.
7. Emit session outputs and log the created session resource name.

## Reusable Baseline

The repository keeps the reusable TypeScript GitHub Action baseline:

- `action.yml`
- minimal `src/index.ts` bootstrap
- boundary-owned runtime directories (`src/action`, `src/app`, `src/jules-api`, `src/workflow-context`)
- boundary-owned tests (`tests/action`, `tests/app`, `tests/jules-api`, `tests/workflow-context`)
- standard validation and release packaging (`pnpm`, `dist/`)

## Failure Invariants

The action fails explicitly when:

- required inputs are missing or blank
- `JULES_API_KEY` is missing or blank
- input values violate enum, boolean, or resource-name contracts
- repository or branch cannot be inferred and no explicit override is provided
- source cannot be matched to exactly one result in Jules
- Jules API returns a non-successful response

No silent fallback paths are used.
