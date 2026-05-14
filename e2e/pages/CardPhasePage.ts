import type { Page } from "@playwright/test";

export class CardPhasePage {
  constructor(private readonly page: Page) {}

  /** True when the card-phase section is currently visible. */
  async isVisible() {
    return this.page.locator("section.card-phase").isVisible();
  }

  /** Pick the first available card in the human hand. */
  async pickFirstCard() {
    const card = this.page.locator(".your-hand .card").first();
    await card.waitFor({ state: "visible" });
    await card.click();
  }

  /** Wait until both cards are revealed (the Continue button appears). */
  async waitForReveal() {
    await this.page.waitForSelector("#continue", { timeout: 5_000 });
  }

  async getOutcomeMessage() {
    const el = this.page.locator(".outcome");
    if (await el.isVisible()) return el.textContent();
    return null;
  }

  /**
   * Click Continue and wait for the next phase.
   * Returns either a new CardPhasePage (next at-bat) or a FieldPhasePage (hit).
   */
  async clickContinue() {
    await this.page.click("#continue");
    // After continue the engine moves to next at-bat (card-phase), field-phase,
    // or game-over — wait for whichever arrives.
    await this.page.waitForSelector(
      "section.card-phase, section.field-phase, section.game-over"
    );
    const visible = await this.page
      .locator("section.field-phase")
      .isVisible();
    if (visible) {
      const { FieldPhasePage } = await import("./FieldPhasePage.js");
      return new FieldPhasePage(this.page);
    }
    const gameOver = await this.page
      .locator("section.game-over")
      .isVisible();
    if (gameOver) {
      const { GameOverPage } = await import("./GameOverPage.js");
      return new GameOverPage(this.page);
    }
    return new CardPhasePage(this.page);
  }
}
