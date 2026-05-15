import { test, expect } from "@playwright/test";

test.describe("Preferences persistence", () => {
  test("persists language and theme across reload", async ({ page }) => {
    await page.goto("/");

    // Ensure a clean baseline for this test run.
    await page.evaluate(() => {
      localStorage.removeItem("baseball-little:theme:v1");
      localStorage.removeItem("bbl.locale");
    });
    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("section.setup h2")).toHaveText("Game Setup");

    await page.click('.theme-btn[data-theme-choice="dark"]');
    await page.click('.lang-btn[data-lang="es"]');

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator('.theme-btn[data-theme-choice="dark"]')).toHaveClass(/active/);
    await expect(page.locator('.lang-btn[data-lang="es"]')).toHaveClass(/active/);
    await expect(page.locator("section.setup h2")).toHaveText("Configuración del partido");

    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator('.theme-btn[data-theme-choice="dark"]')).toHaveClass(/active/);
    await expect(page.locator('.lang-btn[data-lang="es"]')).toHaveClass(/active/);
    await expect(page.locator("section.setup h2")).toHaveText("Configuración del partido");
  });
});
