import type { TeamSide } from "../../domain/players.ts";
import { t } from "../../i18n/i18n.ts";
import logoSrc from "../../images/baseball-little.png";

function coinHtml(extraClass: string): string {
  return `<div class="coin ${extraClass}"><div class="coin-face coin-front"><img src="${logoSrc}" alt="logo" /></div><div class="coin-face coin-back"></div></div>`;
}

export function renderCoinFlip(result?: TeamSide, humanSide?: TeamSide): string {
  if (!result) {
    return `
      <section class="coinflip">
        <h2>${t("coinFlip.title")}</h2>
        ${coinHtml("spinning")}
        <p>${t("coinFlip.determining")}</p>
      </section>
    `;
  }
  const youOrThem = humanSide === result ? t("coinFlip.youBatFirst") : t("coinFlip.computerBatsFirst");
  const sideLabel = result === "Home" ? t("coinFlip.home") : t("coinFlip.away");
  return `
    <section class="coinflip">
      <h2>${t("coinFlip.title")}</h2>
      ${coinHtml("done")}
      <p>${t("coinFlip.wonToss", { side: `<strong>${sideLabel}</strong>`, who: youOrThem })}</p>
      <button id="play-ball" class="primary">${t("coinFlip.playBall")}</button>
    </section>
  `;
}
