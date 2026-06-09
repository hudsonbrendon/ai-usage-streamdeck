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
  it("prefers the auto-read file over a manual paste (manual is only a fallback)", () => {
    const reader = () => JSON.stringify({ claudeAiOauth: { accessToken: "sk-ant-oat01-file" } });
    const keychain = () => { throw new Error("should not reach keychain"); };
    expect(resolveClaudeToken({ claudeToken: "sk-ant-oat01-manual" }, reader, keychain)).toBe("sk-ant-oat01-file");
  });

  it("reads the credentials file when there is no manual paste", () => {
    const reader = () => JSON.stringify({ claudeAiOauth: { accessToken: "sk-ant-oat01-file" } });
    const keychain = () => { throw new Error("should not reach keychain"); };
    expect(resolveClaudeToken({}, reader, keychain)).toBe("sk-ant-oat01-file");
  });

  it("falls back to the manual paste only when auto-read finds nothing", () => {
    const noFile = () => { throw new Error("no file"); };
    const noKeychain = () => { throw new Error("no keychain"); };
    expect(resolveClaudeToken({ claudeToken: "sk-ant-oat01-manual" }, noFile, noKeychain)).toBe("sk-ant-oat01-manual");
  });

  it("falls back to the macOS Keychain when no file is present", () => {
    const noFile = () => { throw new Error("no file"); };
    const keychain = () => JSON.stringify({ claudeAiOauth: { accessToken: "sk-ant-oat01-keychain" } });
    expect(resolveClaudeToken({}, noFile, keychain)).toBe("sk-ant-oat01-keychain");
  });

  it("returns null when nothing is available", () => {
    const noFile = () => { throw new Error("no file"); };
    const noKeychain = () => { throw new Error("no keychain"); };
    expect(resolveClaudeToken({}, noFile, noKeychain)).toBeNull();
  });
});

describe("resolveCodexCreds", () => {
  it("prefers the auth file over manual overrides (manual is only a fallback)", () => {
    const creds = resolveCodexCreds(
      { codexAccessToken: "m-acc", codexAccountId: "m-org", codexRefreshToken: "m-ref" },
      () => codexAuthJson,
    );
    expect(creds).toEqual({ accessToken: "acc-123", accountId: "org_789", refreshToken: "ref-456" });
  });

  it("reads the auth file when there are no manual overrides", () => {
    const creds = resolveCodexCreds({}, () => codexAuthJson);
    expect(creds).toEqual({ accessToken: "acc-123", accountId: "org_789", refreshToken: "ref-456" });
  });

  it("falls back to manual overrides only when the auth file is unavailable", () => {
    const noFile = () => { throw new Error("no file"); };
    const creds = resolveCodexCreds(
      { codexAccessToken: "m-acc", codexAccountId: "m-org", codexRefreshToken: "m-ref" },
      noFile,
    );
    expect(creds).toEqual({ accessToken: "m-acc", accountId: "m-org", refreshToken: "m-ref" });
  });

  it("returns null when nothing is available", () => {
    expect(resolveCodexCreds({}, () => { throw new Error("no file"); })).toBeNull();
  });
});
