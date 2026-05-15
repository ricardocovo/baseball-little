// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  loadTheme,
  saveTheme,
  type Theme,
} from "../src/ui/theme.ts";

describe("theme storage", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  it("defaults to light when storage is empty", () => {
    expect(loadTheme()).toBe("light");
  });

  it("round-trips stored theme", () => {
    saveTheme("dark");
    expect(loadTheme()).toBe("dark");
  });

  it("falls back to light on invalid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "retro");
    expect(loadTheme()).toBe("light");
  });

  it("applies theme attribute and color scheme", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");

    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("writes only supported themes", () => {
    const themes: Theme[] = ["light", "dark"];
    themes.forEach((theme) => {
      saveTheme(theme);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme);
    });
  });
});
