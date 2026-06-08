import { action } from "@elgato/streamdeck";
import { BaseUsageAction, type ProviderFactory } from "./base-usage-action.js";
import { ClaudeProvider } from "../providers/claude.js";
import { resolveClaudeToken } from "../credentials/local.js";
import type { ProviderId } from "../core/types.js";

@action({ UUID: "com.hudsonbrendon.ai-usage.claude" })
export class ClaudeAction extends BaseUsageAction {
  protected readonly providerId: ProviderId = "claude";
  protected makeProvider: ProviderFactory = async (settings) => {
    const token = resolveClaudeToken(settings);
    return token ? new ClaudeProvider(token) : null;
  };
}
