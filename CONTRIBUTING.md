# Contributing

Thanks for your interest! This plugin keeps all non-I/O logic in pure, unit-tested
modules under `src/core`, `src/providers`, and `src/credentials`.

## Setup

```bash
npm install
npm test          # run the suite
npm run build     # compile the plugin
npm run icons     # regenerate PNG icons from assets/*.svg
```

## Rules

- **TDD.** Add a failing test under `tests/` before implementing logic. Keep the SDK/network
  glue (`src/actions`) thin — push logic into testable pure functions.
- **Adding a provider.** Implement the `Provider` interface in `src/providers/`, add a
  `*.test.ts` for its parsing, create a `SingletonAction` subclass of `BaseUsageAction`,
  register it in `src/plugin.ts`, and add an action entry + icons to the manifest.
- **Commits.** Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`). Keep them small.
