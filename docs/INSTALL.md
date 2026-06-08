# Install

## Prerequisites

- [Stream Deck app](https://www.elgato.com/stream-deck) 6.5+
- Node.js 20+
- A Stream Deck device (or use the software key preview)

## From source

```bash
git clone https://github.com/hudsonbrendon/ai-usage-streamdeck
cd ai-usage-streamdeck
npm install
npm run icons     # generate key/plugin icons
npm run build     # compile the plugin
npx streamdeck link com.hudsonbrendon.ai-usage.sdPlugin
npx streamdeck restart com.hudsonbrendon.ai-usage
```

The "AI Usage Monitor" category now appears in the Stream Deck app. Drag **Claude Usage**
and **Codex Usage** onto keys.

## Credentials

By default the plugin reads:

- **Claude:** the local Claude CLI credentials (run `claude setup-token` once if needed).
- **Codex:** `~/.codex/auth.json` (run `codex login` once if needed).

To override, open a key's settings (Property Inspector) and paste tokens under
"Manual credentials".
