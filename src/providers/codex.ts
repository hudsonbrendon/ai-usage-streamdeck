import type { Provider, UsageSnapshot } from "../core/types.js";

const USAGE_ENDPOINT = "https://chatgpt.com/backend-api/codex/usage";
const TOKEN_ENDPOINT = "https://auth.openai.com/oauth/token";
const CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";

interface CodexWindow {
  used_percent?: number;
  reset_at?: number;
}

/** Parse the Codex usage JSON body into a UsageSnapshot. reset_at is epoch seconds. */
export function parseCodexUsage(body: unknown, fetchedAt: Date = new Date()): UsageSnapshot {
  const rl = (body as { rate_limit?: { primary_window?: CodexWindow; secondary_window?: CodexWindow } })?.rate_limit;
  if (!rl) throw new Error("Codex: missing rate_limit in response");
  const win = (w: CodexWindow | undefined) => ({
    usedPercent: w?.used_percent ?? 0,
    resetAt: new Date((w?.reset_at ?? Math.floor(fetchedAt.getTime() / 1000)) * 1000),
  });
  return {
    provider: "codex",
    primary: win(rl.primary_window),
    secondary: win(rl.secondary_window),
    fetchedAt,
  };
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/** Parse the OAuth refresh response. OpenAI rotates the refresh token each call. */
export function parseOAuthToken(res: unknown, now: Date = new Date()): OAuthToken {
  const r = res as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!r?.access_token) throw new Error("Codex: refresh response missing access_token");
  return {
    accessToken: r.access_token,
    refreshToken: r.refresh_token,
    expiresAt: r.expires_in ? new Date(now.getTime() + r.expires_in * 1000) : undefined,
  };
}

/** Exchange a refresh token for a fresh (rotated) access + refresh token. */
export async function refreshCodexToken(refreshToken: string): Promise<OAuthToken> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: CLIENT_ID }),
  });
  if (!res.ok) throw new Error(`Codex: token refresh failed (${res.status})`);
  return parseOAuthToken(await res.json());
}

export interface CodexCreds {
  accessToken: string;
  accountId: string;
}

/** Live Codex provider: GETs the usage endpoint with the required headers. */
export class CodexProvider implements Provider {
  readonly id = "codex" as const;
  constructor(private readonly creds: CodexCreds) {}

  async fetchUsage(): Promise<UsageSnapshot> {
    const res = await fetch(USAGE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${this.creds.accessToken}`,
        "chatgpt-account-id": this.creds.accountId,
        originator: "codex_cli_rs",
        "OpenAI-Beta": "responses=experimental",
        "User-Agent": "codex_cli_rs/0.137.0 (ai-usage-streamdeck)",
      },
    });
    if (res.status === 401) throw new Error("Codex: auth failed (401)");
    if (!res.ok) throw new Error(`Codex: usage request failed (${res.status})`);
    return parseCodexUsage(await res.json());
  }
}
