import { describe, expect, it } from "vitest";
import { formatPercent, formatCountdown } from "../src/core/format.js";

describe("formatPercent", () => {
  it("rounds to a whole-number percent string", () => {
    expect(formatPercent(41.4)).toBe("41%");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(99.6)).toBe("100%");
  });
});

describe("formatCountdown", () => {
  const now = new Date("2026-06-08T12:00:00Z");

  it("renders days+hours when over a day away", () => {
    const reset = new Date("2026-06-13T11:00:00Z"); // 4d23h
    expect(formatCountdown(reset, now)).toBe("4d23h");
  });

  it("renders hours+minutes (zero-padded) when under a day", () => {
    const reset = new Date("2026-06-08T13:26:00Z"); // 1h26m
    expect(formatCountdown(reset, now)).toBe("1h26m");
  });

  it("zero-pads minutes under ten", () => {
    const reset = new Date("2026-06-08T14:05:00Z"); // 2h05m
    expect(formatCountdown(reset, now)).toBe("2h05m");
  });

  it("renders minutes+seconds when under an hour", () => {
    const reset = new Date("2026-06-08T12:03:09Z"); // 3m09s
    expect(formatCountdown(reset, now)).toBe("3m09s");
  });

  it("renders 'now' when the reset has passed", () => {
    const reset = new Date("2026-06-08T11:59:59Z");
    expect(formatCountdown(reset, now)).toBe("now");
  });

  it("renders 'now' at the exact reset boundary", () => {
    expect(formatCountdown(new Date("2026-06-08T12:00:00Z"), now)).toBe("now");
  });

  it("renders 'now' for an invalid reset date", () => {
    expect(formatCountdown(new Date("not-a-date"), now)).toBe("now");
  });
});
