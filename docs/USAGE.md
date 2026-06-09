# Usage

Each key shows the usage of **one provider** (Claude or Codex) for **one window** — the rolling
**5-hour session** or the **7-day week**. By default a key shows a single big number for the
**dominant** window (whichever is more used), but you can pin a key to a fixed window.

## Default layout — Large (one big number)

```
┌──────────────┐
│    CLAUDE    │
│              │
│     41%      │   ← big, turns red at/above your alert threshold
│  5H · 1h26m  │   ← window · countdown to reset
│ ▓▓▓▓░░░░░░░  │
└──────────────┘
```

## Four tiles — Claude & Codex × Session (5h) & Weekly (7d)

Drop **Claude Usage** on two keys and **Codex Usage** on two keys, then set each key's
**Window** in the Property Inspector to build a four-tile dashboard:

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    CLAUDE    │ │    CLAUDE    │ │    CODEX     │ │    CODEX     │
│              │ │              │ │              │ │              │
│     41%      │ │     15%      │ │      1%      │ │      1%      │
│  5H · 1h26m  │ │  7D · 4d23h  │ │  5H · 2h10m  │ │  7D · 5d04h  │
│ ▓▓▓▓░░░░░░░  │ │ ▓▓░░░░░░░░░  │ │ ░░░░░░░░░░░  │ │ ░░░░░░░░░░░  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
  Claude · 5h      Claude · 7d      Codex · 5h       Codex · 7d
```

| Tile | Action | Window |
|------|--------|--------|
| Claude session | Claude Usage | Session (5h) |
| Claude weekly | Claude Usage | Weekly (7d) |
| Codex session | Codex Usage | Session (5h) |
| Codex weekly | Codex Usage | Weekly (7d) |

## Compact layout — both windows on one key

Prefer both windows on a single key? Switch **Display** to **Compact**:

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

## Notes

- **5H** — rolling 5-hour window. **7D** — weekly (7-day) window.
- The bar fills with usage and turns **red** at/above your alert threshold; in Large mode the big
  number turns red too.
- The small text is the countdown to that window's reset (`1h26m`, `4d23h`).
- **Tap** a key to refresh immediately. The plugin also polls automatically.

## Settings (Property Inspector)

- **Window** *(per key)* — which window this key shows: **Dominant** (auto — the busiest of 5h/7d,
  the default), **Session (5h)**, or **Weekly (7d)**. Two keys of the same action can show
  different windows.
- **Display** *(global)* — **Large** (one big number, default) or **Compact** (both windows as bars).
- **Alert at (%)** *(global)* — threshold that turns the bar/number red and flashes the key (default 80).
- **Refresh (sec)** *(global)* — auto-poll interval (default 120, minimum 30).
- **Manual credentials** *(global)* — optional fallback for Claude/Codex tokens; only used when the
  local CLI credentials can't be read (see [Providers](PROVIDERS.md)).
