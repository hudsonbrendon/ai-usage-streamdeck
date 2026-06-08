import { describe, expect, it } from "vitest";
import { renderUsageSvg } from "../src/core/render.js";
import type { UsageSnapshot } from "../src/core/types.js";

const snapshot: UsageSnapshot = {
  provider: "claude",
  primary: { usedPercent: 41, resetAt: new Date("2026-06-08T13:26:00Z") },
  secondary: { usedPercent: 15, resetAt: new Date("2026-06-13T11:00:00Z") },
  fetchedAt: new Date("2026-06-08T12:00:00Z"),
};

describe("renderUsageSvg", () => {
  it("returns a 144x144 svg string", () => {
    const svg = renderUsageSvg(snapshot, { threshold: 80, now: snapshot.fetchedAt });
    expect(svg).toContain("<svg");
    expect(svg).toContain('width="144"');
    expect(svg).toContain('height="144"');
  });

  it("includes both percents, the provider label, and countdowns", () => {
    const svg = renderUsageSvg(snapshot, { threshold: 80, now: snapshot.fetchedAt });
    expect(svg).toContain("41%");
    expect(svg).toContain("15%");
    expect(svg).toContain("CLAUDE");
    expect(svg).toContain("1h26m");
    expect(svg).toContain("4d23h");
  });

  it("makes a bar width proportional to usage (0–110px track)", () => {
    const svg = renderUsageSvg(snapshot, { threshold: 80, now: snapshot.fetchedAt });
    // 41% of the 110px track ≈ 45px
    expect(svg).toContain('width="45"');
  });

  it("uses the alert color when a window is at/above threshold", () => {
    const hot: UsageSnapshot = {
      ...snapshot,
      primary: { usedPercent: 92, resetAt: snapshot.primary.resetAt },
    };
    const svg = renderUsageSvg(hot, { threshold: 80, now: snapshot.fetchedAt });
    expect(svg).toContain("#ff4d4f"); // alert red
  });
});
