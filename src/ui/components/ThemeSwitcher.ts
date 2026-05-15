import { t } from "../../i18n/i18n.ts";
import type { Theme } from "../theme.ts";

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderThemeSwitcher(current: Theme): string {
  const buttons = (["light", "dark"] as const)
    .map((theme) => {
      const active = theme === current ? " active" : "";
      const label = theme === "light" ? t("theme.light") : t("theme.dark");
      return `<button type="button" class="theme-btn${active}" data-theme-choice="${theme}" aria-pressed="${theme === current}">${escapeText(label)}</button>`;
    })
    .join("");

  return `<div class="theme-switcher" role="group" aria-label="${escapeText(t("theme.label"))}">${buttons}</div>`;
}

export function bindThemeSwitcher(root: HTMLElement, onSelect: (theme: Theme) => void): void {
  root.querySelectorAll<HTMLButtonElement>(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.themeChoice;
      if (theme === "light" || theme === "dark") onSelect(theme);
    });
  });
}
