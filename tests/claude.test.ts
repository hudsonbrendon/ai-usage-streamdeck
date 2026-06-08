import { describe, expect, it } from "vitest";
import { parseClaudeHeaders } from "../src/providers/claude.js";

describe("parseClaudeHeaders", () => {
  it("parses utilization (0–1) into 0–100 percent and ISO resets", () => {
    const headers = new Headers({
      "anthropic-ratelimit-unified-5h-utilization": "0.41",
      "anthropic-ratelimit-unified-5h-reset": "2026-06-08T13:26:00Z",
      "anthropic-ratelimit-unified-7d-utilization": "0.15",
      "anthropic-ratelimit-unified-7d-reset": "2026-06-13T11:00:00Z",
    });
    const snap = parseClaudeHeaders(headers, new Date("2026-06-08T12:00:00Z"));
    expect(snap.provider).toBe("claude");
    expect(snap.primary.usedPercent).toBeCloseTo(41);
    expect(snap.primary.resetAt.toISOString()).toBe("2026-06-08T13:26:00.000Z");
    expect(snap.secondary.usedPercent).toBeCloseTo(15);
    expect(snap.secondary.resetAt.toISOString()).toBe("2026-06-13T11:00:00.000Z");
  });

  it("throws when both utilization headers are absent", () => {
    const headers = new Headers({});
    expect(() => parseClaudeHeaders(headers, new Date())).toThrow(/no usage/i);
  });
});
