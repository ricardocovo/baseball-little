import type { Page } from "@playwright/test";

export class GameOverPage {
  constructor(private readonly page: Page) {}

  async isVisible() {
    return this.page.locator("section.game-over").isVisible();
  }

  async getWinnerText() {
    return this.page.locator(".winner").textContent();
  }

  async getFinalScore() {
    return this.page.locator(".final-score").textContent();
  }

  async getReason() {
    return this.page.locator(".reason").textContent();
  }

  async clickNewGame() {
    await this.page.click("#new-game");
    await this.page.waitForSelector("section.setup");
    const { SetupPage } = await import("./SetupPage.js");
    return new SetupPage(this.page);
  }
}
