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

  describe("compact mode", () => {
    it("includes both percents, the provider label, and countdowns", () => {
      const svg = renderUsageSvg(snapshot, { threshold: 80, now: snapshot.fetchedAt, mode: "compact" });
      expect(svg).toContain("41%");
      expect(svg).toContain("15%");
      expect(svg).toContain("CLAUDE");
      expect(svg).toContain("1h26m");
      expect(svg).toContain("4d23h");
    });

    it("makes a bar width proportional to usage (0–110px track)", () => {
      const svg = renderUsageSvg(snapshot, { threshold: 80, now: snapshot.fetchedAt, mode: "compact" });
      // 41% of the 110px track ≈ 45px
      expect(svg).toContain('width="45"');
    });
  });

  describe("large mode (default)", () => {
    it("shows only the dominant window's percent + label, big", () => {
      // primary 41% > secondary 15% → dominant is the 5H window.
      const svg = renderUsageSvg(snapshot, { threshold: 80, now: snapshot.fetchedAt });
      expect(svg).toContain("41%");
      expect(svg).not.toContain("15%");
      expect(svg).toContain("CLAUDE");
      expect(svg).toContain("5H · 1h26m");
      expect(svg).toContain('font-size="52"'); // the big number
    });

    it("picks the secondary window when it is the more utilized one", () => {
      const weeklyHeavy: UsageSnapshot = {
        ...snapshot,
        primary: { usedPercent: 10, resetAt: snapshot.primary.resetAt },
        secondary: { usedPercent: 96, resetAt: snapshot.secondary.resetAt },
      };
      const svg = renderUsageSvg(weeklyHeavy, { threshold: 80, now: snapshot.fetchedAt });
      expect(svg).toContain("96%");
      expect(svg).toContain("7D · 4d23h");
    });

    it("forces the session (5h) window when window='session', even if weekly is busier", () => {
      // secondary (15) < primary (41) here, but force session explicitly anyway.
      const svg = renderUsageSvg(snapshot, { threshold: 80, now: snapshot.fetchedAt, window: "session" });
      expect(svg).toContain("41%");
      expect(svg).toContain("5H · 1h26m");
      expect(svg).not.toContain("15%");
    });

    it("forces the weekly (7d) window when window='weekly', even if session is busier", () => {
      const svg = renderUsageSvg(snapshot, { threshold: 80, now: snapshot.fetchedAt, window: "weekly" });
      expect(svg).toContain("15%");
      expect(svg).toContain("7D · 4d23h");
      expect(svg).not.toContain("41%");
    });
  });

  it("uses the alert color when the dominant window is at/above threshold", () => {
    const hot: UsageSnapshot = {
      ...snapshot,
      primary: { usedPercent: 92, resetAt: snapshot.primary.resetAt },
    };
    const svg = renderUsageSvg(hot, { threshold: 80, now: snapshot.fetchedAt });
    expect(svg).toContain("#ff4d4f"); // alert red
  });
});
