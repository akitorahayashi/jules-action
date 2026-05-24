# Usage

`act-tmpl` renders a final message string from action inputs.

## Standard Workflow Usage

```yaml
- uses: akitorahayashi/act-tmpl@v1
  with:
    message: hello world
```

This default form emits `hello world` as `rendered-message`.

## Input Behavior

The action reads:

- required `message`
- optional `prefix`
- optional `suffix`
- optional `uppercase`

The output surface is:

- `rendered-message`

## Rendering Example

```yaml
- uses: akitorahayashi/act-tmpl@v1
  with:
    message: world
    prefix: hello
    suffix: again
    uppercase: true
```

The emitted output in this example is `HELLO WORLD AGAIN`.

## Local Verification

Repository-local verification commands are:

- `pnpm run fix`
- `pnpm run check`
- `pnpm run test`

`pnpm run fix` applies Biome formatter and safe lint updates.
`pnpm run check` covers Biome checks and typecheck validation on source changes.

Other pnpm scripts remain available:

- `pnpm run test:coverage`
- `pnpm run typecheck`
- `pnpm run package`
- `pnpm run clean`
