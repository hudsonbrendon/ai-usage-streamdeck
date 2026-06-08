# Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Key shows `claude\nno creds` or `codex\nno creds` | Credentials not found. Run `claude setup-token` / `codex login`, or paste tokens in the Property Inspector. |
| Key shows `… error` | See `logs/*.log`. `auth failed (401)` ⇒ stale/invalid token. |
| Codex CLI suddenly logged out | Expected: OpenAI rotates refresh tokens; the side that refreshed last wins. Run `codex login` again. |
| Codex request blocked | The `originator: codex_cli_rs` header is required; this is sent automatically. If OpenAI changed the endpoint, check `docs/PROVIDERS.md`. |
| Icons missing in Stream Deck | Run `npm run icons` then `npm run build` and restart the plugin. |
| Bars don't update | Check the refresh interval (min 30s) and tap the key to force a refresh. |
