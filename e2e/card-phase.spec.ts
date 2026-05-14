import { test, expect } from "@playwright/test";
import { SetupPage } from "./pages/SetupPage.js";
import { CardPhasePage } from "./pages/CardPhasePage.js";

/** Navigate to card-phase, retrying setup if the first phase is field-phase. */
async function reachCardPhase(page: import("@playwright/test").Page) {
  const setup = new SetupPage(page);
  await setup.navigate();
  const coinFlip = await setup.startGame();
  await coinFlip.proceedAfterFlip();

  // If the engine lands on field-phase first, skip through it
  if (await page.locator("section.field-phase").isVisible()) {
    // Computer is defense — wait for placement then direction/depth as offense
    const { FieldPhasePage } = await import("./pages/FieldPhasePage.js");
    const fp = new FieldPhasePage(page);
    const confirmVisible = await page.locator("#confirm-fielders").isVisible();
    if (confirmVisible) await fp.confirmFielders();
    const spinDirVisible = await page.locator("#spin-direction").isVisible();
    if (spinDirVisible) await fp.spinDirection();
    const spinDepthVisible = await page.locator("#spin-depth").isVisible();
    if (spinDepthVisible) await fp.spinDepth();
    await fp.clickContinue();
  }

  return new CardPhasePage(page);
}

test.describe("CardPhase screen", () => {
  test("renders the card hand", async ({ page }) => {
    await reachCardPhase(page);

    await expect(page.locator("section.card-phase")).toBeVisible();
    await expect(page.locator(".your-hand")).toBeVisible();
  });

  test("picking a card shows it as selected", async ({ page }) => {
    const cardPhase = await reachCardPhase(page);

    await cardPhase.pickFirstCard();
    // If the AI had already chosen its card, both cards reveal immediately and
    // the hand collapses — #continue appears instead of .card.selected.
    const selectedOrRevealed = page.locator(".your-hand .card.selected, #continue");
    await expect(selectedOrRevealed.first()).toBeVisible({ timeout: 5_000 });
  });

  test("after selecting a card the Continue button appears", async ({ page }) => {
    const cardPhase = await reachCardPhase(page);

    await cardPhase.pickFirstCard();
    await cardPhase.waitForReveal();

    await expect(page.locator("#continue")).toBeVisible();
  });
});
