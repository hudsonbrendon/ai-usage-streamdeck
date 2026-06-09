<p align="center">
  <img src="assets/banner.png" alt="AI Usage Monitor — Stream Deck Plugin" width="640">
</p>

<h1 align="center">AI Usage Monitor — Stream Deck Plugin</h1>

<p align="center">Live Claude and Codex subscription usage on your Stream Deck keys — rolling 5-hour and weekly windows, at a glance.</p>

<p align="center">
  <a href="https://github.com/hudsonbrendon/ai-usage-streamdeck/actions/workflows/tests.yml"><img src="https://github.com/hudsonbrendon/ai-usage-streamdeck/actions/workflows/tests.yml/badge.svg" alt="Tests"></a>
  <a href="https://hudsonbrendon.github.io/ai-usage-streamdeck/"><img src="https://img.shields.io/badge/docs-mkdocs--material-blue" alt="Docs"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Stream%20Deck-SDK%20v2-101010" alt="Stream Deck SDK v2">
  <img src="https://img.shields.io/badge/providers-Claude%20%2B%20Codex-8957e5" alt="Providers">
</p>

If you code with **Claude Code** or **Codex**, you live inside rolling usage windows — a
5-hour session limit and a weekly one. This plugin puts them on dedicated Stream Deck keys: a
big percentage, a usage bar, and a countdown to when the window refills. Tap a key to refresh;
the key flashes when you cross your threshold.

It auto-reads your local CLI credentials (`~/.codex/auth.json` and the Claude CLI credentials —
macOS Keychain included), so there's nothing to paste for the common case.

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

## ✨ Features

- 📊 **Session + weekly windows** — rolling 5-hour and 7-day utilization with exact percentages.
- 🔢 **Big, readable key** — one large number for the busiest window (the **Large** layout, default).
- 🧩 **Per-key window** — pin a key to **Session (5h)**, **Weekly (7d)**, or **Dominant** (auto). Build a four-tile dashboard (Claude/Codex × 5h/7d).
- 🔁 **Compact layout** — or show both windows as bars on one key.
- ⏳ **Reset countdowns** — `1h26m`, `4d23h` until a window refills.
- 🚨 **Threshold alerts** — the key flashes and turns red when a window crosses your configured % (default 80).
- 🔑 **Zero-setup credentials** — auto-reads local CLI files & Keychain; Codex token auto-refresh on 401; manual paste as fallback.
- ✅ **Tested core** — parsing, formatting, and rendering are unit-tested; CI green.

## 🚀 Install

**Recommended — download the release:** grab the latest
**`com.hudsonbrendon.ai-usage.streamDeckPlugin`** from the
[Releases](https://github.com/hudsonbrendon/ai-usage-streamdeck/releases) page and **double-click**
it — the Stream Deck app installs it. No Node.js required.

**From source (development):**

```bash
git clone https://github.com/hudsonbrendon/ai-usage-streamdeck
cd ai-usage-streamdeck
npm install && npm run icons && npm run build
npx streamdeck link com.hudsonbrendon.ai-usage.sdPlugin
```

Then add the **Claude Usage** and **Codex Usage** actions from the "AI Usage Monitor" category, and
set each key's **Window** in the Property Inspector. Full guide: [docs/INSTALL.md](docs/INSTALL.md).

## 📚 Docs

Full documentation at <https://hudsonbrendon.github.io/ai-usage-streamdeck/>, including
[providers & credentials](docs/PROVIDERS.md), [usage](docs/USAGE.md), and
[troubleshooting](docs/TROUBLESHOOTING.md).

## License

MIT — see [LICENSE](LICENSE).
