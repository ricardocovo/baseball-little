import type { GameSnapshot } from "../../engine/GameState.ts";
import type { TeamSide } from "../../domain/players.ts";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  } as Record<string, string>)[c] ?? c);
}

/** Mirrors Game.currentOffense() using only snapshot data. */
function currentOffenseSide(snap: GameSnapshot): TeamSide {
  if (snap.firstAtBat === "Away") {
    return snap.half === "Top" ? "Away" : "Home";
  }
  return snap.half === "Top" ? "Home" : "Away";
}

export function renderBattingOrder(snap: GameSnapshot): string {
  const side = currentOffenseSide(snap);
  const team = side === "Home" ? snap.teams.home : snap.teams.away;
  const activeIndex = side === "Home" ? snap.battingIndex.home : snap.battingIndex.away;
  // Normalise to 0–8 in case the index has wrapped past 9.
  const activeMod = ((activeIndex % 9) + 9) % 9;

  const rows = team.lineup.map((player, i) => {
    const isActive = i === activeMod && snap.status !== "GameOver";
    const strengthLabel = player.strength[0]; // L, M, H
    const handLabel = player.handedness[0];   // R, L
    return `
      <li class="bo-row${isActive ? " bo-row--active" : ""}">
        <span class="bo-slot">${i + 1}</span>
        <span class="bo-name">${escapeHtml(player.name)}</span>
        <span class="bo-badge">${strengthLabel}HB</span>
        <span class="bo-badge">${handLabel}</span>
      </li>`;
  }).join("");

  return `
    <div class="batting-order">
      <h3>Batting Order</h3>
      <p class="bo-team-name">${escapeHtml(team.name)}</p>
      <ol class="bo-list">${rows}</ol>
    </div>`;
}
