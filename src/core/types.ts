export type ProviderId = "claude" | "codex";

/** One rate-limit window. usedPercent is 0–100. */
export interface UsageWindow {
  usedPercent: number;
  resetAt: Date;
}

export interface UsageSnapshot {
  provider: ProviderId;
  primary: UsageWindow;   // rolling 5-hour window
  secondary: UsageWindow; // weekly (7-day) window
  fetchedAt: Date;
}

/** Plugin-wide config, persisted via Stream Deck global settings. */
export interface GlobalSettings {
  /** Manual fallback token for Claude (sk-ant-oat01-…). */
  claudeToken?: string;
  /** Manual fallback Codex credentials. */
  codexAccessToken?: string;
  codexRefreshToken?: string;
  codexAccountId?: string;
  /** Alert when a window crosses this percent (0–100). */
  alertThreshold: number;
  /** Poll interval in seconds. */
  refreshSeconds: number;
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  alertThreshold: 80,
  refreshSeconds: 120,
};

export interface Provider {
  readonly id: ProviderId;
  fetchUsage(): Promise<UsageSnapshot>;
}
