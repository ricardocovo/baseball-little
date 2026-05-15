export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "baseball-little:theme:v1";

const DEFAULT_THEME: Theme = "light";

function getStorage(): Storage | undefined {
  try {
    const ls = (globalThis as { localStorage?: Storage }).localStorage;
    return ls ?? undefined;
  } catch {
    return undefined;
  }
}

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function loadTheme(): Theme {
  const storage = getStorage();
  if (!storage) return DEFAULT_THEME;
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    if (isTheme(raw)) return raw;
  } catch {
    // Ignore storage errors and fall back to default.
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme: Theme): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors.
  }
}

export function applyTheme(theme: Theme): void {
  try {
    const doc = (globalThis as { document?: Document }).document;
    const root = doc?.documentElement;
    if (!root) return;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  } catch {
    // Ignore document access errors.
  }
}

export function bootstrapTheme(): Theme {
  const theme = loadTheme();
  applyTheme(theme);
  return theme;
}
