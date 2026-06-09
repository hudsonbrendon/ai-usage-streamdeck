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
5-hour limit and a weekly one. This plugin puts both on dedicated Stream Deck keys: two
live bars per provider, the exact percentage used, and a countdown to when each window
refills. Tap a key to refresh; the key flashes when you cross your threshold.

It auto-reads your local CLI credentials (`~/.codex/auth.json` and the Claude CLI
credentials), so there's nothing to paste for the common case.

## ✨ Features

- 📊 **Two windows per provider** — rolling 5-hour and weekly utilization as bars with exact percentages.
- ⏳ **Reset countdowns** — `1h26m`, `4d23h` until each window refills.
- 🚨 **Threshold alerts** — the key flashes when a window crosses your configured % (default 80).
- 🔀 **Two keys** — a Claude key and a Codex key, side by side.
- 🔑 **Zero-setup credentials** — auto-reads local CLI files; Codex refresh-token auto-rotation; manual paste as fallback.
- ✅ **Tested core** — parsing, formatting, and rendering are unit-tested; CI green.

## 🚀 Install

See [docs/INSTALL.md](docs/INSTALL.md). Quick version:

```bash
git clone https://github.com/hudsonbrendon/ai-usage-streamdeck
cd ai-usage-streamdeck
npm install
npm run icons
npm run build
npx streamdeck link com.hudsonbrendon.ai-usage.sdPlugin
```

Then add the **Claude Usage** and **Codex Usage** actions from the "AI Usage Monitor" category.

## 📚 Docs

Full documentation at <https://hudsonbrendon.github.io/ai-usage-streamdeck/>, including
[providers & credentials](docs/PROVIDERS.md), [usage](docs/USAGE.md), and
[troubleshooting](docs/TROUBLESHOOTING.md).

## License

MIT — see [LICENSE](LICENSE).
