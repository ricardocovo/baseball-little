import type { TeamSide } from "../../domain/players.ts";
import { t } from "../../i18n/i18n.ts";

export function renderCoinFlip(result?: TeamSide, humanSide?: TeamSide): string {
  if (!result) {
    return `
      <section class="coinflip">
        <h2>${t("coinFlip.title")}</h2>
        <div class="coin spinning"></div>
        <p>${t("coinFlip.determining")}</p>
      </section>
    `;
  }
  const youOrThem = humanSide === result ? t("coinFlip.youBatFirst") : t("coinFlip.computerBatsFirst");
  const sideLabel = result === "Home" ? t("coinFlip.home") : t("coinFlip.away");
  return `
    <section class="coinflip">
      <h2>${t("coinFlip.title")}</h2>
      <div class="coin done"></div>
      <p>${t("coinFlip.wonToss", { side: `<strong>${sideLabel}</strong>`, who: youOrThem })}</p>
      <button id="play-ball" class="primary">${t("coinFlip.playBall")}</button>
    </section>
  `;
}
