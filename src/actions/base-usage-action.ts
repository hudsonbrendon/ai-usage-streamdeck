import streamDeck, { SingletonAction } from "@elgato/streamdeck";
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

/** Minimal surface used by these keys; satisfied by the SDK's KeyAction. */
interface ActionLike {
  id: string;
  isKey(): boolean;
  setImage(image?: string): Promise<void>;
  setTitle(title: string): Promise<void>;
  showAlert(): Promise<void>;
}

/**
 * Base for the per-provider keys: polls usage on an interval, renders it as an SVG
 * key image, and alerts when a window crosses the threshold.
 *
 * Settings are kept in a local cache that is updated from the `didReceiveGlobalSettings`
 * event payload. `refresh()` reads the cache and never calls `getGlobalSettings()` — that
 * matters because the SDK fires the persistent `onDidReceiveGlobalSettings` listener on the
 * response to *every* `getGlobalSettings()` request, so refreshing through a settings read
 * would feed back into the listener and spin into a refresh storm.
 */
export abstract class BaseUsageAction extends SingletonAction {
  protected abstract readonly providerId: ProviderId;
  protected abstract makeProvider: ProviderFactory;

  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private settings: GlobalSettings = { ...DEFAULT_GLOBAL_SETTINGS };
  /** Count of our own setGlobalSettings writes whose echo should not trigger a refresh. */
  private pendingSelfWrites = 0;

  constructor() {
    super();
    streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
      this.settings = { ...DEFAULT_GLOBAL_SETTINGS, ...(ev.settings as Partial<GlobalSettings>) };
      if (this.pendingSelfWrites > 0) {
        // Echo of a write we just made (e.g. a rotated Codex token): cache is now updated,
        // but do not re-render — that would re-enter makeProvider and could rotate again.
        this.pendingSelfWrites--;
        return;
      }
      // A genuine external change (property inspector, or our seeding read at appear):
      // restart timers with any new interval and re-render every visible instance.
      for (const action of this.actions) {
        const a = action as unknown as ActionLike;
        this.startTimer(a);
        void this.refresh(a);
      }
    });
  }

  /** Persist a global-settings patch, suppressing the echo it triggers. */
  protected async persistGlobalSettings(patch: Partial<GlobalSettings>): Promise<void> {
    this.pendingSelfWrites++;
    const next = { ...this.settings, ...patch };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await streamDeck.settings.setGlobalSettings(next as any);
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    const action = ev.action as unknown as ActionLike;
    // Prime the settings cache from persisted global settings before the first render, so the
    // initial paint already uses the real threshold/interval. Bracket the read with
    // pendingSelfWrites so its echo is absorbed by the listener instead of driving a second,
    // redundant refresh. (refresh() itself never reads global settings — see class doc.)
    this.pendingSelfWrites++;
    const stored = await streamDeck.settings.getGlobalSettings<Partial<GlobalSettings>>();
    this.settings = { ...DEFAULT_GLOBAL_SETTINGS, ...stored };
    this.startTimer(action);
    await this.refresh(action);
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    this.clearTimer(ev.action.id);
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await this.refresh(ev.action as unknown as ActionLike);
  }

  private startTimer(action: ActionLike): void {
    this.clearTimer(action.id);
    const intervalMs = Math.max(30, this.settings.refreshSeconds) * 1000;
    this.timers.set(action.id, setInterval(() => void this.refresh(action), intervalMs));
  }

  private clearTimer(id: string): void {
    const t = this.timers.get(id);
    if (t) clearInterval(t);
    this.timers.delete(id);
  }

  private async refresh(action: ActionLike): Promise<void> {
    if (!action.isKey()) return; // these actions render via setImage/setTitle (Keypad only)
    const settings = this.settings;
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
