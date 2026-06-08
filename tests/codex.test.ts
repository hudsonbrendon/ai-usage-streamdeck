import { describe, expect, it } from "vitest";
import { parseCodexUsage, parseOAuthToken } from "../src/providers/codex.js";

describe("parseCodexUsage", () => {
  it("reads used_percent and epoch-seconds reset_at into a snapshot", () => {
    const body = {
      rate_limit: {
        primary_window: { used_percent: 41, reset_at: 1_780_000_000 },
        secondary_window: { used_percent: 15, reset_at: 1_780_400_000 },
      },
    };
    const snap = parseCodexUsage(body, new Date("2026-06-08T12:00:00Z"));
    expect(snap.provider).toBe("codex");
    expect(snap.primary.usedPercent).toBe(41);
    expect(snap.primary.resetAt.getTime()).toBe(1_780_000_000 * 1000);
    expect(snap.secondary.usedPercent).toBe(15);
    expect(snap.secondary.resetAt.getTime()).toBe(1_780_400_000 * 1000);
  });

  it("throws when rate_limit is missing", () => {
    expect(() => parseCodexUsage({}, new Date())).toThrow(/rate_limit/i);
  });
});

describe("parseOAuthToken", () => {
  it("extracts the new access + rotated refresh token", () => {
    const res = { access_token: "new-access", refresh_token: "rotated-refresh", expires_in: 3600 };
    const tok = parseOAuthToken(res, new Date("2026-06-08T12:00:00Z"));
    expect(tok.accessToken).toBe("new-access");
    expect(tok.refreshToken).toBe("rotated-refresh");
    expect(tok.expiresAt?.toISOString()).toBe("2026-06-08T13:00:00.000Z");
  });

  it("throws when access_token is absent", () => {
    expect(() => parseOAuthToken({})).toThrow(/access_token/i);
  });
});
