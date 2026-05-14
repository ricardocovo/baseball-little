import { test, expect } from "@playwright/test";
import { SetupPage } from "./pages/SetupPage.js";
import { CardPhasePage } from "./pages/CardPhasePage.js";
import { FieldPhasePage } from "./pages/FieldPhasePage.js";

/**
 * Drive at-bats (picking the first card each time) until field-phase appears
 * or the game ends. Returns a FieldPhasePage if found, otherwise null.
 */
async function driveToFieldPhase(
  page: import("@playwright/test").Page,
  maxAtBats = 20
): Promise<FieldPhasePage | null> {
  const setup = new SetupPage(page);
  await setup.navigate();
  const coinFlip = await setup.startGame();
  await coinFlip.proceedAfterFlip();

  for (let i = 0; i < maxAtBats; i++) {
    const onField = await page.locator("section.field-phase").isVisible();
    if (onField) return new FieldPhasePage(page);

    const onGameOver = await page.locator("section.game-over").isVisible();
    if (onGameOver) return null;

    const onCard = await page.locator("section.card-phase").isVisible();
    if (!onCard) return null;

    const cp = new CardPhasePage(page);
    await cp.pickFirstCard();
    await cp.waitForReveal();
    const next = await cp.clickContinue();
    if (next instanceof FieldPhasePage) return next;
  }
  return null;
}

test.describe("FieldPhase screen", () => {
  test("field grid renders when a hit occurs", async ({ page }) => {
    const fp = await driveToFieldPhase(page);
    test.skip(fp === null, "No hit reached within max at-bats — skipping");

    await expect(page.locator("section.field-phase")).toBeVisible();
    await expect(page.locator(".field-board")).toBeVisible();
  });

  test("shows confirm-fielders button when human is defense", async ({ page }) => {
    const fp = await driveToFieldPhase(page);
    test.skip(fp === null, "No hit reached within max at-bats — skipping");

    // Wait for the first interactive element — confirm (defense) or spin (offense)
    await page.waitForSelector("#confirm-fielders, #spin-direction", { timeout: 5_000 });
    const confirmVisible = await page.locator("#confirm-fielders").isVisible();
    const spinVisible = await page.locator("#spin-direction").isVisible();
    // Either the human is defense (confirm) or offense (spin direction)
    expect(confirmVisible || spinVisible).toBe(true);
  });

  test("spin direction button triggers spinner and advances phase", async ({ page }) => {
    const fp = await driveToFieldPhase(page);
    test.skip(fp === null, "No hit reached within max at-bats — skipping");

    // Wait for the first interactive element
    await page.waitForSelector("#confirm-fielders, #spin-direction", { timeout: 5_000 });

    // If human is defense, confirm first
    const confirmVisible = await page.locator("#confirm-fielders").isVisible();
    if (confirmVisible) {
      await fp!.confirmFielders();
    }

    // Now either #spin-direction appeared (human offense) or AI is spinning (AI offense)
    const spinDirVisible = await page.locator("#spin-direction").isVisible({ timeout: 5_000 } as never).catch(() => false);
    test.skip(!spinDirVisible, "Human is not offense — skipping spin test");

    await fp!.spinDirection();
    // #spin-depth should now be visible (spinDirection waits for it)
    await expect(page.locator("#spin-depth")).toBeVisible({ timeout: 1_000 });
  });

  test("full field-phase play resolves with Continue button", async ({ page }) => {
    const fp = await driveToFieldPhase(page);
    test.skip(fp === null, "No hit reached within max at-bats — skipping");

    // Wait for the first interactive element
    await page.waitForSelector("#confirm-fielders, #spin-direction", { timeout: 5_000 });

    const confirmVisible = await page.locator("#confirm-fielders").isVisible();
    if (confirmVisible) {
      await fp!.confirmFielders();
      // Human is defense — AI auto-spins both spinners; just wait for Continue
    } else {
      // Human is offense — click through both spin buttons
      await fp!.spinDirection();
      await fp!.spinDepth();
    }

    await expect(page.locator("#continue-after-hit")).toBeVisible({
      timeout: 10_000,
    });
  });
});
