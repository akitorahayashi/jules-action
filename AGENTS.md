# jules-action

`jules-action` is a TypeScript GitHub Action repository.
The public action contract is defined in `action.yml`.
The runtime entrypoint for GitHub Actions is `dist/index.js`.
The authored implementation lives under `src/`.

## Repository Layout

`src/index.ts` bootstraps the action runtime.
`src/action/` owns input reading, output emission, and request normalization.
`src/app/` owns use-case orchestration.
`src/jules-api/` owns API contract, source resolution, and HTTP client behavior.
`src/workflow-context/` owns repository and branch context extraction.
`tests/action/`, `tests/app/`, `tests/jules-api/`, and `tests/workflow-context/` verify boundary behavior.
`docs/` contains usage, configuration, and architecture documentation.
`.github/workflows/` contains CI and release automation.

## Validation

`pnpm run fix` runs Biome checks with safe fixes.
`pnpm run check` runs Biome checks and TypeScript typecheck validation.
`pnpm run test` runs the test suite.

## Constraints

Do not update `dist/` in normal development changes or pull requests.
