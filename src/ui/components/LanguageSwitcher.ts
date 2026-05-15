import { getLocale, SUPPORTED_LOCALES, setLocale, type Locale } from "../../i18n/i18n.ts";

const LOCALE_LABEL: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

/** Renders a small EN / ES segmented control. */
export function renderLanguageSwitcher(): string {
  const current = getLocale();
  const buttons = SUPPORTED_LOCALES.map((l) => {
    const active = l === current ? " active" : "";
    return `<button type="button" class="lang-btn${active}" data-lang="${l}" aria-pressed="${l === current}">${LOCALE_LABEL[l]}</button>`;
  }).join("");
  return `<div class="language-switcher" role="group" aria-label="Language">${buttons}</div>`;
}

/** Wires up click handlers on every `.lang-btn` under `root`. */
export function bindLanguageSwitcher(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang as Locale | undefined;
      if (lang) setLocale(lang);
    });
  });
}
