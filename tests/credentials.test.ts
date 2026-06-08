import { describe, expect, it } from "vitest";
import { parseCodexAuthFile, resolveClaudeToken, resolveCodexCreds } from "../src/credentials/local.js";

const codexAuthJson = JSON.stringify({
  tokens: { access_token: "acc-123", refresh_token: "ref-456", account_id: "org_789" },
});

describe("parseCodexAuthFile", () => {
  it("extracts access, refresh, and account id from ~/.codex/auth.json contents", () => {
    const parsed = parseCodexAuthFile(codexAuthJson);
    expect(parsed.accessToken).toBe("acc-123");
    expect(parsed.refreshToken).toBe("ref-456");
    expect(parsed.accountId).toBe("org_789");
  });

  it("throws on malformed JSON", () => {
    expect(() => parseCodexAuthFile("{not json")).toThrow();
  });

  it("throws on valid JSON missing required token fields", () => {
    expect(() => parseCodexAuthFile(JSON.stringify({ tokens: { refresh_token: "ref" } }))).toThrow(/access_token|account_id/i);
  });
});

describe("resolveClaudeToken", () => {
  it("prefers the manual override when present", () => {
    expect(resolveClaudeToken({ claudeToken: "sk-ant-oat01-manual" }, () => "ignored")).toBe("sk-ant-oat01-manual");
  });

  it("falls back to reading the credentials file", () => {
    const reader = () => JSON.stringify({ claudeAiOauth: { accessToken: "sk-ant-oat01-file" } });
    expect(resolveClaudeToken({}, reader)).toBe("sk-ant-oat01-file");
  });

  it("returns null when nothing is available", () => {
    expect(resolveClaudeToken({}, () => { throw new Error("no file"); })).toBeNull();
  });
});

describe("resolveCodexCreds", () => {
  it("prefers manual overrides", () => {
    const creds = resolveCodexCreds(
      { codexAccessToken: "m-acc", codexAccountId: "m-org", codexRefreshToken: "m-ref" },
      () => codexAuthJson,
    );
    expect(creds).toEqual({ accessToken: "m-acc", accountId: "m-org", refreshToken: "m-ref" });
  });

  it("falls back to the auth file", () => {
    const creds = resolveCodexCreds({}, () => codexAuthJson);
    expect(creds).toEqual({ accessToken: "acc-123", accountId: "org_789", refreshToken: "ref-456" });
  });

  it("returns null when nothing is available", () => {
    expect(resolveCodexCreds({}, () => { throw new Error("no file"); })).toBeNull();
  });
});
