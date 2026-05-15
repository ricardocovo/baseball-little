import type { GameSnapshot } from "../../engine/GameState.ts";
import { t } from "../../i18n/i18n.ts";

export function renderGameOver(snap: GameSnapshot): string {
  const winnerLabel =
    snap.winner === "Tie"
      ? t("gameOver.tie")
      : snap.winner === "Home"
        ? t("gameOver.teamWins", { team: snap.teams.home.name })
        : t("gameOver.teamWins", { team: snap.teams.away.name });
  return `
    <section class="game-over">
      <h2>${t("gameOver.title")}</h2>
      <p class="winner">${winnerLabel}</p>
      <p class="final-score">${t("gameOver.final", {
        away: snap.teams.away.name,
        awayScore: snap.score.away,
        home: snap.teams.home.name,
        homeScore: snap.score.home,
      })}</p>
      <p class="reason">${snap.gameOverReason === "InningsCompleted" ? t("gameOver.reasonInnings") : t("gameOver.reasonHand")}</p>
      <button id="new-game" class="primary">${t("gameOver.newGame")}</button>
    </section>
  `;
}
