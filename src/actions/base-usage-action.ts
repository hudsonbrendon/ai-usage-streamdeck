import streamDeck, { LogLevel } from "@elgato/streamdeck";
import type {
  WillAppearEvent,
  WillDisappearEvent,
  KeyDownEvent,
} from "@elgato/streamdeck";
import { renderUsageSvg } from "../core/render.js";
import {
  DEFAULT_GLOBAL_SETTINGS,
  type GlobalSettings,
  type Provider,
  type ProviderId,
  type UsageSnapshot,
} from "../core/types.js";

/** Builds a live Provider from current global settings, or null if creds are missing. */
export type ProviderFactory = (settings: GlobalSettings) => Promise<Provider | null>;

/** Minimal interface satisfied by both KeyAction and DialAction. */
interface ActionLike {
  id: string;
  setImage(image?: string): Promise<void>;
  setTitle(title: string): Promise<void>;
  showAlert(): Promise<void>;
}

import { SingletonAction } from "@elgato/streamdeck";

/**
 * Base for the per-provider keys: polls usage on an interval, renders it as an SVG
 * key image, and alerts when a window crosses the threshold.
 */
export abstract class BaseUsageAction extends SingletonAction {
  protected abstract readonly providerId: ProviderId;
  protected abstract makeProvider: ProviderFactory;

  private timers = new Map<string, ReturnType<typeof setInterval>>();

  constructor() {
    super();
    // Re-render all visible instances when the global settings change (e.g. from property inspector).
    streamDeck.settings.onDidReceiveGlobalSettings(() => {
      for (const action of this.actions) {
        void this.refresh(action as ActionLike);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    await this.refresh(ev.action as ActionLike);
    const settings = await this.getSettings();
    const intervalMs = Math.max(30, settings.refreshSeconds) * 1000;
    const timer = setInterval(() => void this.refresh(ev.action as ActionLike), intervalMs);
    this.timers.set(ev.action.id, timer);
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    const t = this.timers.get(ev.action.id);
    if (t) clearInterval(t);
    this.timers.delete(ev.action.id);
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await this.refresh(ev.action as ActionLike);
  }

  private async getSettings(): Promise<GlobalSettings> {
    const stored = await streamDeck.settings.getGlobalSettings<Partial<GlobalSettings>>();
    return { ...DEFAULT_GLOBAL_SETTINGS, ...stored };
  }

  private async refresh(action: ActionLike): Promise<void> {
    const settings = await this.getSettings();
    try {
      const provider = await this.makeProvider(settings);
      if (!provider) {
        await action.setTitle(`${this.providerId}\nno creds`);
        return;
      }
      const snapshot: UsageSnapshot = await provider.fetchUsage();
      await action.setTitle("");
      await action.setImage(renderUsageSvg(snapshot, { threshold: settings.alertThreshold }));
      const crossed =
        snapshot.primary.usedPercent >= settings.alertThreshold ||
        snapshot.secondary.usedPercent >= settings.alertThreshold;
      if (crossed) await action.showAlert();
    } catch (err) {
      streamDeck.logger.error(`${this.providerId} refresh failed`, err);
      await action.setTitle(`${this.providerId}\nerror`);
    }
  }
}
