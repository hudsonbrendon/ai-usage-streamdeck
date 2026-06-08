# Providers

Each provider exposes two utilization windows: a rolling **5-hour** primary window and a
**7-day** secondary window. Every window yields a percentage (0–100) and a reset time.

## Claude (Anthropic)

**Credential:** the OAuth token from `claude setup-token` (begins `sk-ant-oat01-`, valid ~1 year).
The plugin auto-reads it from the local Claude CLI credentials; paste it manually in the
Property Inspector to override.

**How it works:** sends a minimal `POST https://api.anthropic.com/v1/messages` and reads usage
from the response headers:

| Header | Meaning |
|--------|---------|
| `anthropic-ratelimit-unified-5h-utilization` | 5-hour utilization (0.0–1.0) |
| `anthropic-ratelimit-unified-5h-reset` | ISO 8601 reset time |
| `anthropic-ratelimit-unified-7d-utilization` | weekly utilization (0.0–1.0) |
| `anthropic-ratelimit-unified-7d-reset` | ISO 8601 reset time |

The plugin multiplies utilization by 100 for display.

## Codex (OpenAI)

**Credentials:** from `~/.codex/auth.json` (`.tokens.access_token`, `.tokens.refresh_token`,
`.tokens.account_id`) — the plugin auto-reads these. Manual override available in the PI.

**How it works:** `GET https://chatgpt.com/backend-api/codex/usage` with headers
`Authorization: Bearer <access_token>`, `chatgpt-account-id`, `originator: codex_cli_rs`
(required — Cloudflare blocks without it), `OpenAI-Beta: responses=experimental`. The JSON
body's `rate_limit.primary_window` and `rate_limit.secondary_window` give `used_percent`
(0–100) and `reset_at` (Unix epoch seconds).

**Auto-refresh:** if a refresh token is available, the plugin renews the access token via
`POST https://auth.openai.com/oauth/token` (`grant_type=refresh_token`, `client_id=app_EMoamEEZ73f0CkXaXp7hrann`)
and persists the rotated refresh token to global settings.

> ⚠️ **Token rotation.** OpenAI rotates the refresh token on every renewal — the side that
> refreshes last invalidates the other. If your Codex CLI later reports an auth error, run
> `codex login` again.

> ⚠️ **Unofficial endpoint.** `backend-api/codex/usage` is undocumented and may change without notice.

## Security

Credentials live in the plugin's Stream Deck global settings on this machine. Treat the
machine with the same care as the credentials. If compromised, revoke the Anthropic token in
the Anthropic console and re-run `codex login` to invalidate the OpenAI access token.
