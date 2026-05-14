import type { Page } from "@playwright/test";

export class CoinFlipPage {
  constructor(private readonly page: Page) {}

  /** Wait until the coin has settled and the "Play ball" button appears. */
  async waitForResult() {
    // The coin flip has a 1200ms animation; allow extra headroom for slow
    // server starts when multiple workers launch browsers simultaneously.
    await this.page.waitForSelector("#play-ball", { timeout: 15_000 });
  }

  async getResultText() {
    return this.page.locator("section.coinflip p").first().textContent();
  }

  async proceedAfterFlip() {
    await this.waitForResult();
    await this.page.click("#play-ball");
    // Navigate into the game — either card-phase or field-phase appears first
    await this.page.waitForSelector("section.card-phase, section.field-phase");
    const { CardPhasePage } = await import("./CardPhasePage.js");
    return new CardPhasePage(this.page);
  }
}
