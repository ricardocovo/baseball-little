import { test, expect } from "@playwright/test";
import { SetupPage } from "./pages/SetupPage.js";

test.describe("CoinFlip screen", () => {
  test("appears after starting a game", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();
    await setup.startGame();

    await expect(page.locator("section.coinflip")).toBeVisible();
    await expect(page.locator("section.coinflip h2")).toHaveText("Coin flip");
  });

  test("resolves and shows Play ball button", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();
    const coinFlip = await setup.startGame();

    await coinFlip.waitForResult();
    await expect(page.locator("#play-ball")).toBeVisible();
  });

  test("Play ball advances past coin flip", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();
    const coinFlip = await setup.startGame();

    await coinFlip.proceedAfterFlip();

    // Should be on card-phase or field-phase
    const onCard = await page.locator("section.card-phase").isVisible();
    const onField = await page.locator("section.field-phase").isVisible();
    expect(onCard || onField).toBe(true);
  });
});
