import { test, expect } from "@playwright/test";
import { SetupPage } from "./pages/SetupPage.js";
import { CardPhasePage } from "./pages/CardPhasePage.js";
import { FieldPhasePage } from "./pages/FieldPhasePage.js";
import { GameOverPage } from "./pages/GameOverPage.js";

/**
 * Drive a full game to completion by always picking the first available card.
 * Works through any mix of CardPhase and FieldPhase screens.
 */
async function driveFullGame(
  page: import("@playwright/test").Page
): Promise<GameOverPage> {
  const setup = new SetupPage(page);
  await setup.navigate();
  const coinFlip = await setup.startGame();
  await coinFlip.proceedAfterFlip();

  const maxIterations = 200;
  for (let i = 0; i < maxIterations; i++) {
    const onGameOver = await page.locator("section.game-over").isVisible();
    if (onGameOver) return new GameOverPage(page);

    if (await page.locator("section.card-phase").isVisible()) {
      const cp = new CardPhasePage(page);
      await cp.pickFirstCard();
      await cp.waitForReveal();
      await cp.clickContinue();
      continue;
    }

    if (await page.locator("section.field-phase").isVisible()) {
      const fp = new FieldPhasePage(page);
      // Wait for the first interactive element to appear.
      // Human defense → #confirm-fielders; human offense → #spin-direction (after AI think delay)
      await page.waitForSelector("#confirm-fielders, #spin-direction", { timeout: 5_000 });

      const confirmVisible = await page.locator("#confirm-fielders").isVisible();
      if (confirmVisible) {
        await fp.confirmFielders();
        // AI is offense — it auto-spins both spinners; just wait for Continue.
      } else {
        // Human is offense — click through both spin buttons.
        await fp.spinDirection();
        await fp.spinDepth();
      }

      await fp.clickContinue();
      continue;
    }

    // Unknown state — wait briefly and retry
    await page.waitForTimeout(300);
  }

  throw new Error("Game did not reach GameOver within the iteration limit");
}

test.describe("Full game E2E", () => {
  test("completes a 3-inning game and reaches GameOver", async ({ page }) => {
    const gameOver = await driveFullGame(page);

    await expect(page.locator("section.game-over")).toBeVisible();
    await expect(page.locator(".winner")).toBeVisible();
    await expect(page.locator(".final-score")).toBeVisible();

    const score = await gameOver.getFinalScore();
    // Format: "Final: {away} {awayScore} — {home} {homeScore}"
    expect(score).toMatch(/Final:.*\d+.*—.*\d+/);
  });

  test("GameOver shows a reason (innings completed or hand exhausted)", async ({
    page,
  }) => {
    await driveFullGame(page);

    const reason = await page.locator(".reason").textContent();
    expect(["All innings completed.", "Hand exhausted."]).toContain(
      reason?.trim()
    );
  });

  test("clicking New game returns to Setup screen", async ({ page }) => {
    const gameOver = await driveFullGame(page);

    await gameOver.clickNewGame();
    await expect(page.locator("section.setup")).toBeVisible();
  });
});
