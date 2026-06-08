# Development

## Layout

- `src/core` — types, formatting, SVG rendering (pure, unit-tested).
- `src/providers` — Claude/Codex fetch + parse (parsing is unit-tested).
- `src/credentials` — local CLI credential resolution (unit-tested).
- `src/actions` — Stream Deck SDK glue (thin; not unit-tested).
- `assets` + `scripts/render-icons.mjs` — icon design and PNG generation.

## Commands

```bash
npm test          # vitest run
npm run test:watch
npm run build     # rollup → com.hudsonbrendon.ai-usage.sdPlugin/bin/plugin.js
npm run watch     # rebuild on change
npm run icons     # regenerate icons from assets/*.svg
npm run pack      # produce a .streamDeckPlugin in dist/
```

## Debugging

`npx streamdeck restart com.hudsonbrendon.ai-usage` after a build. Logs at
`com.hudsonbrendon.ai-usage.sdPlugin/logs/*.log`.
