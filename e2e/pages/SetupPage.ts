import type { Page } from "@playwright/test";

export class SetupPage {
  constructor(private readonly page: Page) {}

  async navigate(path = "/") {
    await this.page.goto(path);
    await this.page.waitForSelector("section.setup");
  }

  async selectFormat(format: "Reduced" | "Classic") {
    await this.page.selectOption("#format", format);
  }

  async selectInnings(innings: 3 | 6 | 9) {
    await this.page.selectOption("#innings", String(innings));
  }

  async fillHumanTeamName(name: string) {
    await this.page.fill("#humanTeamName", name);
  }

  async fillComputerTeamName(name: string) {
    await this.page.fill("#computerTeamName", name);
  }

  async startGame() {
    await this.page.click("#start");
    await this.page.waitForSelector("section.coinflip");
    const { CoinFlipPage } = await import("./CoinFlipPage.js");
    return new CoinFlipPage(this.page);
  }
}
