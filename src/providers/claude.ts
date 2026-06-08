import type { Provider, UsageSnapshot } from "../core/types.js";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const BODY = JSON.stringify({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 1,
  messages: [{ role: "user", content: "." }],
});

const H = {
  p5u: "anthropic-ratelimit-unified-5h-utilization",
  p5r: "anthropic-ratelimit-unified-5h-reset",
  s7u: "anthropic-ratelimit-unified-7d-utilization",
  s7r: "anthropic-ratelimit-unified-7d-reset",
};

/** Convert Anthropic rate-limit response headers into a UsageSnapshot. */
export function parseClaudeHeaders(headers: Headers, fetchedAt: Date = new Date()): UsageSnapshot {
  const u5 = headers.get(H.p5u);
  const u7 = headers.get(H.s7u);
  if (u5 === null && u7 === null) {
    throw new Error("Claude: no usage headers in response");
  }
  return {
    provider: "claude",
    primary: { usedPercent: Number(u5 ?? 0) * 100, resetAt: new Date(headers.get(H.p5r) ?? fetchedAt) },
    secondary: { usedPercent: Number(u7 ?? 0) * 100, resetAt: new Date(headers.get(H.s7r) ?? fetchedAt) },
    fetchedAt,
  };
}

/** Live Claude provider: pings /v1/messages and reads usage from response headers. */
export class ClaudeProvider implements Provider {
  readonly id = "claude" as const;
  constructor(private readonly token: string) {}

  async fetchUsage(): Promise<UsageSnapshot> {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "oauth-2025-04-20",
        "content-type": "application/json",
        "User-Agent": "ai-usage-streamdeck/1.0",
      },
      body: BODY,
    });
    if (res.status === 401) throw new Error("Claude: auth failed (401)");
    return parseClaudeHeaders(res.headers);
  }
}
