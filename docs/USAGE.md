# Usage

Each key shows one provider:

```
┌──────────────┐
│    CLAUDE    │
│ 5H       41% │
│ ▓▓▓▓░░░░░░░  │
│        1h26m │
│ 7D       15% │
│ ▓▓░░░░░░░░░  │
│        4d23h │
└──────────────┘
```

- **5H** — rolling 5-hour window. **7D** — weekly window.
- The bar fills with usage; it turns **red** at/above your alert threshold.
- The small number under each bar is the countdown to that window's reset.
- **Tap** a key to refresh immediately. The plugin also polls automatically.

## Settings (Property Inspector)

- **Alert at (%)** — threshold that turns bars red and flashes the key (default 80).
- **Refresh (sec)** — auto-poll interval (default 120, minimum 30).
- **Manual credentials** — optional overrides for Claude/Codex tokens.
