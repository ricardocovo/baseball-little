import type { DeckFormat } from "../../domain/cards.ts";
import type { Handedness, Player, Strength } from "../../domain/players.ts";
import { defaultSetupValues, type SetupValues } from "./Setup.ts";

export const STORAGE_KEY = "baseball-little:setup:v1";

const FORMATS: readonly DeckFormat[] = ["Reduced", "Classic"];
const INNINGS: readonly (3 | 6 | 9)[] = [3, 6, 9];
const STRENGTHS: readonly Strength[] = ["Light", "Medium", "Heavy"];
const HANDEDNESS: readonly Handedness[] = ["Right", "Left"];

type Storage = Pick<typeof globalThis, never> & {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function getStorage(): Storage | undefined {
  try {
    const ls = (globalThis as { localStorage?: Storage }).localStorage;
    return ls ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveSetupValues(values: SetupValues): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

export function loadSetupValues(): SetupValues {
  const defaults = defaultSetupValues();
  const storage = getStorage();
  if (!storage) return defaults;
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return defaults;
  }
  if (!raw) return defaults;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return defaults;
  }
  if (!isRecord(parsed)) return defaults;

  const format = FORMATS.includes(parsed.format as DeckFormat)
    ? (parsed.format as DeckFormat)
    : defaults.format;
  const innings = INNINGS.includes(parsed.innings as 3 | 6 | 9)
    ? (parsed.innings as 3 | 6 | 9)
    : defaults.innings;
  const humanTeamName =
    typeof parsed.humanTeamName === "string" ? parsed.humanTeamName : defaults.humanTeamName;
  const computerTeamName =
    typeof parsed.computerTeamName === "string"
      ? parsed.computerTeamName
      : defaults.computerTeamName;
  const humanLineup = parseLineup(parsed.humanLineup, defaults.humanLineup);
  const computerLineup = parseLineup(parsed.computerLineup, defaults.computerLineup);

  return { format, innings, humanTeamName, computerTeamName, humanLineup, computerLineup };
}

function parseLineup(value: unknown, fallback: Player[]): Player[] {
  if (!Array.isArray(value) || value.length !== fallback.length) return fallback;
  const result: Player[] = [];
  for (let i = 0; i < fallback.length; i++) {
    const fb = fallback[i] as Player;
    const item = value[i];
    if (!isRecord(item)) return fallback;
    const id = typeof item.id === "string" ? item.id : fb.id;
    const name = typeof item.name === "string" ? item.name : fb.name;
    const strength = STRENGTHS.includes(item.strength as Strength)
      ? (item.strength as Strength)
      : null;
    const handedness = HANDEDNESS.includes(item.handedness as Handedness)
      ? (item.handedness as Handedness)
      : null;
    if (strength === null || handedness === null) return fallback;
    result.push({ id, name, strength, handedness });
  }
  return result;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
