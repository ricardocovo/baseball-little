import { test, expect } from "@playwright/test";
import { SetupPage } from "./pages/SetupPage.js";

test.describe("Setup screen", () => {
  test("renders with default values", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();

    await expect(page.locator("section.setup h2")).toHaveText("Game Setup");
    await expect(page.locator("#format")).toHaveValue("Reduced");
    await expect(page.locator("#innings")).toHaveValue("3");
    await expect(page.locator("#humanTeamName")).toHaveValue("Sluggers");
    await expect(page.locator("#computerTeamName")).toHaveValue("Rivals");
  });

  test("allows changing the team name", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();

    await setup.fillHumanTeamName("Panthers");
    await expect(page.locator("#humanTeamName")).toHaveValue("Panthers");
  });

  test("allows selecting innings and format", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();

    await setup.selectInnings(6);
    await setup.selectFormat("Classic");

    await expect(page.locator("#innings")).toHaveValue("6");
    await expect(page.locator("#format")).toHaveValue("Classic");
  });

  test("clicking Play ball navigates to coin flip", async ({ page }) => {
    const setup = new SetupPage(page);
    await setup.navigate();
    await setup.startGame();

    await expect(page.locator("section.coinflip")).toBeVisible();
  });
});
