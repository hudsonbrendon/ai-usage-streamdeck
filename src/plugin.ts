import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { ClaudeAction } from "./actions/claude-action.js";
import { CodexAction } from "./actions/codex-action.js";

streamDeck.logger.setLevel(LogLevel.INFO);

streamDeck.actions.registerAction(new ClaudeAction());
streamDeck.actions.registerAction(new CodexAction());

streamDeck.connect();
