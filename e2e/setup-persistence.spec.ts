import { test, expect } from "@playwright/test";
import { SetupPage } from "./pages/SetupPage.js";

test.describe("Setup persistence", () => {
  test("restores values after Play ball + reload", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();

    await setup.selectFormat("Classic");
    await setup.selectInnings(6);
    await setup.fillHumanTeamName("Panthers");
    await setup.fillComputerTeamName("Wolves");
    // Edit the first batter on the human lineup.
    await page.locator('input.name[data-side="human"][data-i="0"]').fill("Slugger McGee");
    await page.selectOption('select.strength[data-side="human"][data-i="0"]', "Heavy");
    await page.selectOption('select.handed[data-side="human"][data-i="0"]', "Left");

    await setup.startGame();

    await page.reload();
    await page.waitForSelector("section.setup");

    await expect(page.locator("#format")).toHaveValue("Classic");
    await expect(page.locator("#innings")).toHaveValue("6");
    await expect(page.locator("#humanTeamName")).toHaveValue("Panthers");
    await expect(page.locator("#computerTeamName")).toHaveValue("Wolves");
    await expect(page.locator('input.name[data-side="human"][data-i="0"]')).toHaveValue(
      "Slugger McGee",
    );
    await expect(page.locator('select.strength[data-side="human"][data-i="0"]')).toHaveValue(
      "Heavy",
    );
    await expect(page.locator('select.handed[data-side="human"][data-i="0"]')).toHaveValue(
      "Left",
    );
  });

  test("does not persist edits made after Play ball was not clicked", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();

    await setup.fillHumanTeamName("Ephemeral");
    // No startGame() call — so nothing should be saved.
    await page.reload();
    await page.waitForSelector("section.setup");

    await expect(page.locator("#humanTeamName")).toHaveValue("Sluggers");
  });

  test("ignores corrupt stored value and falls back to defaults", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("baseball-little:setup:v1", "{not valid json");
    });
    await page.reload();
    await page.waitForSelector("section.setup");

    await expect(page.locator("#format")).toHaveValue("Reduced");
    await expect(page.locator("#innings")).toHaveValue("3");
    await expect(page.locator("#humanTeamName")).toHaveValue("Sluggers");
    await expect(page.locator("#computerTeamName")).toHaveValue("Rivals");
  });
});
