import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import type { GlobalSettings } from "../core/types.js";
import type { CodexCreds } from "../providers/codex.js";

/** Reads a file's UTF-8 contents; throws if missing. Injectable for tests. */
export type FileReader = (path: string) => string;
const defaultReader: FileReader = (p) => readFileSync(p, "utf-8");

/** Reads the Claude Code credentials JSON from the macOS Keychain. Injectable for tests. */
export type KeychainReader = () => string;
const defaultKeychainReader: KeychainReader = () => {
  if (platform() !== "darwin") throw new Error("Keychain only available on macOS");
  return execFileSync(
    "security",
    ["find-generic-password", "-s", "Claude Code-credentials", "-w"],
    { encoding: "utf-8" },
  );
};

function tokenFromCredentialsJson(contents: string): string | undefined {
  const json = JSON.parse(contents) as { claudeAiOauth?: { accessToken?: string } };
  return json.claudeAiOauth?.accessToken;
}

export interface CodexFileCreds {
  accessToken: string;
  refreshToken?: string;
  accountId: string;
}

/** Parse the contents of ~/.codex/auth.json. */
export function parseCodexAuthFile(contents: string): CodexFileCreds {
  const json = JSON.parse(contents) as {
    tokens?: { access_token?: string; refresh_token?: string; account_id?: string };
  };
  const t = json.tokens ?? {};
  if (!t.access_token || !t.account_id) {
    throw new Error("Codex auth file missing access_token or account_id");
  }
  return { accessToken: t.access_token, refreshToken: t.refresh_token, accountId: t.account_id };
}

const CLAUDE_CREDENTIAL_PATHS = [
  join(homedir(), ".claude", ".credentials.json"),
  join(homedir(), ".config", "claude", ".credentials.json"),
];

/**
 * Resolve the Claude OAuth token: manual override → local credentials file →
 * macOS Keychain (`Claude Code-credentials`) → null. On macOS the Claude CLI stores its
 * credentials in the Keychain rather than a file, so the Keychain is the usual source there.
 */
export function resolveClaudeToken(
  settings: Partial<GlobalSettings>,
  reader: FileReader = defaultReader,
  keychain: KeychainReader = defaultKeychainReader,
): string | null {
  if (settings.claudeToken) return settings.claudeToken;
  for (const path of CLAUDE_CREDENTIAL_PATHS) {
    try {
      const token = tokenFromCredentialsJson(reader(path));
      if (token) return token;
    } catch {
      // try next path
    }
  }
  try {
    const token = tokenFromCredentialsJson(keychain());
    if (token) return token;
  } catch {
    // keychain unavailable or empty
  }
  return null;
}

const CODEX_AUTH_PATH = join(homedir(), ".codex", "auth.json");

/** Resolve Codex credentials: manual overrides → ~/.codex/auth.json → null. */
export function resolveCodexCreds(
  settings: Partial<GlobalSettings>,
  reader: FileReader = defaultReader,
): (CodexCreds & { refreshToken?: string }) | null {
  if (settings.codexAccessToken && settings.codexAccountId) {
    return {
      accessToken: settings.codexAccessToken,
      accountId: settings.codexAccountId,
      refreshToken: settings.codexRefreshToken,
    };
  }
  try {
    const c = parseCodexAuthFile(reader(CODEX_AUTH_PATH));
    return { accessToken: c.accessToken, accountId: c.accountId, refreshToken: c.refreshToken };
  } catch {
    return null;
  }
}
