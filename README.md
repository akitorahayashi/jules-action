# jules-action

`jules-action` is a TypeScript GitHub Action that creates a Jules API session from workflow inputs.

## Quick Start

```yaml
- uses: akitorahayashi/jules-action@v1
  env:
    JULES_API_KEY: ${{ secrets.JULES_API_KEY }}
  with:
    prompt: Refactor retry logic in the API client
```

## Action Contract

Inputs:

- `prompt` (required)
- `source` (optional)
- `starting-branch` (optional)
- `title` (optional)
- `require-plan-approval` (optional)
- `automation-mode` (optional)

Required environment variables:

- `JULES_API_KEY`

Outputs:

- `session-name`
- `session-id`
- `resolved-source`
- `session-title`
- `session-state`
- `session-url`

## Runtime Flow

1. Read and validate action inputs.
2. Resolve source and branch from explicit input or workflow context.
3. Call `sources.list` to verify the source.
4. Call `sessions.create` with the normalized payload.
5. Emit created session outputs.

## Documentation

- [Usage](docs/usage.md)
- [Architecture](docs/architecture.md)
- [Action Inputs](docs/configuration/inputs.md)
