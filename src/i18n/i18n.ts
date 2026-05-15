import { en, type Dictionary } from "./dictionaries/en.ts";
import { es } from "./dictionaries/es.ts";

export type Locale = "en" | "es";

const STORAGE_KEY = "bbl.locale";

const DICTS: Record<Locale, Dictionary> = { en, es };

let currentLocale: Locale = "en";
const subscribers = new Set<(l: Locale) => void>();

function detectInitialLocale(): Locale {
  const stored = readStoredLocale();
  if (stored) return stored;
  const nav = (globalThis as { navigator?: { language?: string; languages?: readonly string[] } }).navigator;
  const candidates = nav?.languages ?? (nav?.language ? [nav.language] : []);
  for (const c of candidates) {
    if (c && c.toLowerCase().startsWith("es")) return "es";
  }
  return "en";
}

function readStoredLocale(): Locale | undefined {
  try {
    const ls = (globalThis as { localStorage?: Storage }).localStorage;
    const v = ls?.getItem(STORAGE_KEY);
    if (v === "en" || v === "es") return v;
  } catch {
    // ignore
  }
  return undefined;
}

function writeStoredLocale(locale: Locale): void {
  try {
    (globalThis as { localStorage?: Storage }).localStorage?.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

function syncHtmlLang(locale: Locale): void {
  try {
    const doc = (globalThis as { document?: Document }).document;
    if (doc?.documentElement) doc.documentElement.lang = locale;
  } catch {
    // ignore
  }
}

/** Initialize the locale from storage / navigator. Idempotent. */
export function initI18n(): Locale {
  currentLocale = detectInitialLocale();
  syncHtmlLang(currentLocale);
  return currentLocale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (locale !== "en" && locale !== "es") return;
  if (locale === currentLocale) return;
  currentLocale = locale;
  writeStoredLocale(locale);
  syncHtmlLang(locale);
  for (const cb of subscribers) cb(locale);
}

export function onLocaleChange(cb: (l: Locale) => void): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

/** All supported locales (for the language switcher). */
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "es"];

// ───────────────────────── Path types ─────────────────────────
// Build a union of dotted paths whose leaves are strings. This keeps
// `t()` calls type-safe and missing keys a compile error.

type Primitive = string | number | boolean;

type DottedKeysOfStrings<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? DottedKeysOfStrings<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];

export type TKey = DottedKeysOfStrings<Dictionary>;

function lookup(dict: Dictionary, key: string): string | undefined {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Translate a dotted key with optional `{name}` placeholders. */
export function t(key: TKey, params?: Record<string, Primitive>): string {
  const dict = DICTS[currentLocale];
  const raw = lookup(dict, key) ?? lookup(DICTS.en, key) ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}

/** Pick singular vs plural based on count (English-style 1 / other). */
export function plural(
  n: number,
  oneKey: TKey,
  otherKey: TKey,
  params?: Record<string, Primitive>,
): string {
  return n === 1 ? t(oneKey, params) : t(otherKey, params);
}

// Initialize on module load so `t()` works even before App is constructed
// (e.g. during unit tests that import the dictionaries indirectly).
initI18n();
