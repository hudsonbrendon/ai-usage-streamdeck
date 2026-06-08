import { action } from "@elgato/streamdeck";
import { BaseUsageAction, type ProviderFactory } from "./base-usage-action.js";
import { CodexProvider, refreshCodexToken } from "../providers/codex.js";
import { resolveCodexCreds } from "../credentials/local.js";
import type { ProviderId } from "../core/types.js";

@action({ UUID: "com.hudsonbrendon.ai-usage.codex" })
export class CodexAction extends BaseUsageAction {
  protected readonly providerId: ProviderId = "codex";

  protected makeProvider: ProviderFactory = async (settings) => {
    const creds = resolveCodexCreds(settings);
    if (!creds) return null;

    // Use the stored access token directly. Only when it is rejected (401) do we rotate the
    // refresh token, persist the new pair, and retry once. Refreshing lazily (rather than on
    // every poll) avoids constantly rotating the token — which would both invalidate the
    // Codex CLI's own login and, via the settings echo, risk a refresh storm.
    return {
      id: "codex" as const,
      fetchUsage: async () => {
        try {
          return await new CodexProvider({
            accessToken: creds.accessToken,
            accountId: creds.accountId,
          }).fetchUsage();
        } catch (err) {
          const isAuthError = err instanceof Error && err.message.includes("401");
          if (!isAuthError || !creds.refreshToken) throw err;

          const tok = await refreshCodexToken(creds.refreshToken);
          // accountId is stable across OpenAI token rotations, so reusing the captured value is safe.
          await this.persistGlobalSettings({
            codexAccessToken: tok.accessToken,
            codexRefreshToken: tok.refreshToken ?? creds.refreshToken,
            codexAccountId: creds.accountId,
          });
          return await new CodexProvider({
            accessToken: tok.accessToken,
            accountId: creds.accountId,
          }).fetchUsage();
        }
      },
    };
  };
}
