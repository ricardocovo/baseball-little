import type { GameSnapshot } from "../../engine/GameState.ts";

export function renderGameOver(snap: GameSnapshot): string {
  const winnerLabel =
    snap.winner === "Tie"
      ? "Tie game"
      : snap.winner === "Home"
      ? `${snap.teams.home.name} win`
      : `${snap.teams.away.name} win`;
  return `
    <section class="game-over">
      <h2>Game Over</h2>
      <p class="winner">${winnerLabel}</p>
      <p class="final-score">Final: ${snap.teams.away.name} ${snap.score.away} — ${snap.teams.home.name} ${snap.score.home}</p>
      <p class="reason">${snap.gameOverReason === "InningsCompleted" ? "All innings completed." : "Hand exhausted."}</p>
      <button id="new-game" class="primary">New game</button>
    </section>
  `;
}
