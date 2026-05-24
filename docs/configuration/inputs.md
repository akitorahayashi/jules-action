# Inputs

`jules-action` defines these inputs in `action.yml`:

| Input | Required | Default | Meaning |
|------|----------|---------|---------|
| `prompt` | yes | none | Prompt used to create the session |
| `source` | no | derived from `GITHUB_REPOSITORY` | Source name in the form `sources/{source}` |
| `starting-branch` | no | derived from workflow context | Branch used for `sourceContext.githubRepoContext.startingBranch` |
| `title` | no | none | Optional session title |
| `require-plan-approval` | no | `true` | Optional boolean string (`true` or `false`) |
| `automation-mode` | no | `AUTO_CREATE_PR` | Optional enum (`AUTOMATION_MODE_UNSPECIFIED` or `AUTO_CREATE_PR`) |

## Outputs

The action emits:

| Output | Meaning |
|--------|---------|
| `session-name` | Session resource name (for example `sessions/123`) |
| `session-id` | Session identifier |
| `resolved-source` | Source used to create the session |
| `session-title` | Session title, when returned by the API |
| `session-state` | Session state enum, when returned by the API |
| `session-url` | Session URL in Jules web app, when returned by the API |

## Environment Variables

| Variable | Required | Meaning |
|----------|----------|---------|
| `JULES_API_KEY` | yes | Jules API key from `jules.google.com/settings` |

## Validation Rules

- Required inputs reject blank strings.
- `source` must match `sources/{source}`.
- `require-plan-approval` must be `true` or `false` when present.
- `automation-mode` must be one of the documented enum values.
- When omitted, `require-plan-approval` is set to `true`.
- When omitted, `automation-mode` is set to `AUTO_CREATE_PR`.
- Invalid values fail the action; no silent fallback is used.
