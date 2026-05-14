import type { Page } from "@playwright/test";

export class FieldPhasePage {
  constructor(private readonly page: Page) {}

  async isVisible() {
    return this.page.locator("section.field-phase").isVisible();
  }

  /** Wait for the fielder-placement phase (human is defense). */
  async waitForPlacingPhase() {
    await this.page.waitForSelector("#confirm-fielders", { timeout: 5_000 });
  }

  /** Confirm fielder placement without moving anyone. */
  async confirmFielders() {
    await this.waitForPlacingPhase();
    await this.page.click("#confirm-fielders");
  }

  /** Click the direction spin button (human is offense). */
  async spinDirection() {
    await this.page.waitForSelector("#spin-direction", { timeout: 5_000 });
    await this.page.click("#spin-direction");
    // The 2400ms CSS animation must complete before #spin-depth appears.
    await this.page.waitForSelector("#spin-depth", { timeout: 6_000 });
  }

  /** Click the depth spin button (human is offense). */
  async spinDepth() {
    await this.page.waitForSelector("#spin-depth", { timeout: 6_000 });
    await this.page.click("#spin-depth");
    // The 2400ms animation must complete before #continue-after-hit appears.
    await this.page.waitForSelector("#continue-after-hit", { timeout: 6_000 });
  }

  async getOutcomeMessage() {
    const el = this.page.locator(".field-phase .outcome");
    if (await el.isVisible()) return el.textContent();
    return null;
  }

  /** Click Continue after the play is resolved. */
  async clickContinue() {
    // When AI is offense it auto-spins two animations of 2400ms each plus
    // two AI-think delays of 600ms each — allow up to 10s total.
    await this.page.waitForSelector("#continue-after-hit", { timeout: 10_000 });
    await this.page.click("#continue-after-hit");
    await this.page.waitForSelector(
      "section.card-phase, section.game-over"
    );
    const gameOver = await this.page
      .locator("section.game-over")
      .isVisible();
    if (gameOver) {
      const { GameOverPage } = await import("./GameOverPage.js");
      return new GameOverPage(this.page);
    }
    const { CardPhasePage } = await import("./CardPhasePage.js");
    return new CardPhasePage(this.page);
  }
}
