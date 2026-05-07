import type { TeamSide } from "../../domain/players.ts";

export function renderCoinFlip(result?: TeamSide, humanSide?: TeamSide): string {
  if (!result) {
    return `
      <section class="coinflip">
        <h2>Coin flip</h2>
        <div class="coin spinning"></div>
        <p>Determining who bats first…</p>
      </section>
    `;
  }
  const youOrThem = humanSide === result ? "You bat first." : "Computer bats first.";
  return `
    <section class="coinflip">
      <h2>Coin flip</h2>
      <div class="coin done"></div>
      <p><strong>${result}</strong> won the toss. ${youOrThem}</p>
      <button id="play-ball" class="primary">Play ball ⚾</button>
    </section>
  `;
}
