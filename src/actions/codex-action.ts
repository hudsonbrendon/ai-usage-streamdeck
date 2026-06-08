import streamDeck, { action } from "@elgato/streamdeck";
import { BaseUsageAction, type ProviderFactory } from "./base-usage-action.js";
import { CodexProvider, refreshCodexToken } from "../providers/codex.js";
import { resolveCodexCreds } from "../credentials/local.js";
import type { GlobalSettings, ProviderId } from "../core/types.js";

@action({ UUID: "com.hudsonbrendon.ai-usage.codex" })
export class CodexAction extends BaseUsageAction {
  protected readonly providerId: ProviderId = "codex";
  protected makeProvider: ProviderFactory = async (settings) => {
    const creds = resolveCodexCreds(settings);
    if (!creds) return null;

    // If we hold a refresh token, rotate proactively and persist the new one,
    // since OpenAI invalidates the previous refresh token on every renewal.
    if (creds.refreshToken) {
      try {
        const tok = await refreshCodexToken(creds.refreshToken);
        const next: Partial<GlobalSettings> = {
          codexAccessToken: tok.accessToken,
          codexRefreshToken: tok.refreshToken ?? creds.refreshToken,
          codexAccountId: creds.accountId,
        };
        const current = await streamDeck.settings.getGlobalSettings<Partial<GlobalSettings>>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await streamDeck.settings.setGlobalSettings({ ...current, ...next } as any);
        return new CodexProvider({ accessToken: tok.accessToken, accountId: creds.accountId });
      } catch (err) {
        streamDeck.logger.warn("Codex token refresh failed, using existing access token", err);
      }
    }
    return new CodexProvider({ accessToken: creds.accessToken, accountId: creds.accountId });
  };
}
