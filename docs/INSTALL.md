# Install

## Prerequisites

- [Stream Deck app](https://www.elgato.com/stream-deck) 6.5+
- A Stream Deck device (or use the software key preview)
- Node.js 20+ — **only** if you build from source (not needed for the release install)

## Option A — Install from a release (recommended)

Every tagged release ships a ready-to-install `.streamDeckPlugin` bundle.

1. Go to the [**Releases**](https://github.com/hudsonbrendon/ai-usage-streamdeck/releases) page.
2. Download the latest **`com.hudsonbrendon.ai-usage.streamDeckPlugin`** asset.
3. **Double-click** the downloaded file. The Stream Deck app opens and prompts to install it.
4. Confirm — the "AI Usage Monitor" category now appears in the app.

Or from the terminal:

```bash
# download the latest release asset (requires the GitHub CLI)
gh release download --repo hudsonbrendon/ai-usage-streamdeck --pattern "*.streamDeckPlugin"
open com.hudsonbrendon.ai-usage.streamDeckPlugin   # macOS — hands it to the Stream Deck app
```

To **update**, download the newer release and double-click it; the app replaces the existing
version. To **uninstall**, right-click the action in the Stream Deck app and choose *Uninstall*.

## Option B — From source (for development)

```bash
git clone https://github.com/hudsonbrendon/ai-usage-streamdeck
cd ai-usage-streamdeck
npm install
npm run icons     # generate key/plugin icons
npm run build     # compile the plugin
npx streamdeck link com.hudsonbrendon.ai-usage.sdPlugin
npx streamdeck restart com.hudsonbrendon.ai-usage
```

`streamdeck link` symlinks your working copy into the Stream Deck app, so rebuilds are picked up
after `npx streamdeck restart com.hudsonbrendon.ai-usage`. See [Development](DEVELOPMENT.md) for the
watch loop.

## Add the keys

Once installed, the **AI Usage Monitor** category appears in the Stream Deck app. Drag **Claude
Usage** and **Codex Usage** onto keys. To build the four-tile dashboard (Claude/Codex × 5h/7d), set
each key's **Window** in the Property Inspector — see [Usage](USAGE.md).

## Credentials

By default the plugin auto-reads your local CLI credentials — nothing to paste:

- **Claude:** the Claude CLI credential (macOS Keychain, or `~/.claude/.credentials.json`). Run
  `claude setup-token` once if needed.
- **Codex:** `~/.codex/auth.json`. Run `codex login` once if needed.

A manual paste under **Manual credentials** in the Property Inspector is only used as a fallback
when the local credentials can't be read. See [Providers](PROVIDERS.md) for details.
