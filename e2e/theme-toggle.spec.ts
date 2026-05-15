import { test, expect } from "@playwright/test";

test.describe("Theme switcher", () => {
  test("toggles to dark and persists across reload", async ({ page }) => {
    await page.goto("/");

    // Ensure a clean baseline for this test run.
    await page.evaluate(() => localStorage.removeItem("baseball-little:theme:v1"));
    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.click('.theme-btn[data-theme-choice="dark"]');

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator('.theme-btn[data-theme-choice="dark"]')).toHaveClass(/active/);

    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator('.theme-btn[data-theme-choice="dark"]')).toHaveClass(/active/);
  });
});
