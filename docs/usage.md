# Usage

`jules-action` creates a Jules session by calling `sources.get` and `sessions.create` through the `jls` client library.

## Standard Workflow Usage

```yaml
- uses: akitorahayashi/jules-action@v1
  env:
    JULES_API_KEY: ${{ secrets.JULES_API_KEY }}
  with:
    prompt: Create integration tests for the webhook module
```

This form resolves source and branch from workflow context and emits the created session metadata.

## Explicit Source and Branch

```yaml
- uses: akitorahayashi/jules-action@v1
  env:
    JULES_API_KEY: ${{ secrets.JULES_API_KEY }}
  with:
    prompt: Improve release workflow error handling
    source: sources/github/acme/service-api
    starting-branch: main
    title: Improve release workflow
    require-plan-approval: true
    automation-mode: AUTO_CREATE_PR
```

## Source Resolution

- When `source` is set, the action verifies its existence through `sources.get`.
- When `source` is omitted, the action derives `sources/github/{owner}/{repo}` from `GITHUB_REPOSITORY`, verifies it through `sources.get`, and fails when the source does not exist.

## Branch Resolution

- When `starting-branch` is set, the action uses it directly.
- When `starting-branch` is omitted, the action resolves branch in this order:
  - `GITHUB_HEAD_REF`
  - `GITHUB_REF_NAME` when `GITHUB_REF_TYPE=branch`

If branch cannot be resolved, the action fails explicitly.

## Session Defaults

- `require-plan-approval` defaults to `true` when omitted.
- `automation-mode` defaults to `AUTO_CREATE_PR` when omitted.

## Authentication

- The action reads the API key from `JULES_API_KEY`.
- `JULES_API_KEY` is required and must not be blank.

## Local Verification

Repository-local verification commands are:

- `pnpm run fix`
- `pnpm run check`
- `pnpm run test`
