import type { GameSnapshot } from "../../engine/GameState.ts";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c] ?? c,
  );
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + "th";
  switch (v % 10) {
    case 1: return n + "st";
    case 2: return n + "nd";
    case 3: return n + "rd";
    default: return n + "th";
  }
}

/* ─── Scoreboard row: line score + inning/outs/bases status (merged header) ─── */

export function renderScoreboard(snap: GameSnapshot): string {
  const cur = snap.inning - 1;
  const isTop = snap.half === "Top";
  const gameOver = snap.status === "GameOver";
  const fieldingSide: "away" | "home" | null = gameOver ? null : (isTop ? "home" : "away");

  const lineRow = (label: string, runs: number[], total: number, side: "away" | "home") => {
    const cells = Array.from({ length: snap.inningsConfigured }, (_, i) => {
      const v = runs[i];
      const active =
        !gameOver && i === cur && ((side === "away" && isTop) || (side === "home" && !isTop));
      return `<td class="${active ? "current" : ""}">${v === undefined ? "-" : v}</td>`;
    }).join("");
    const badge = fieldingSide === side ? '<span class="sb-badge">⚾</span> ' : "";
    return `<tr><td class="team-cell">${badge}${escapeHtml(label)}</td>${cells}<td class="total">${total}</td></tr>`;
  };

  const header = Array.from({ length: snap.inningsConfigured }, (_, i) => {
    const active = !gameOver && i === cur;
    return `<th class="${active ? "current" : ""}">${i + 1}</th>`;
  }).join("");

  const arrow = snap.half === "Top" ? "▲" : "▼";
  const inningOrd = ordinal(snap.inning);
  const occ = (b: { id?: string } | null | undefined) => (b ? "occupied" : "");

  const status = `
    <div class="header-status" aria-label="game status">
      <div class="inning-text">${arrow} ${inningOrd.toUpperCase()}, ${snap.outs} OUT${snap.outs !== 1 ? "S" : ""}</div>
      <div class="diamond-mini" aria-label="bases">
        <div class="mini-base second ${occ(snap.bases.second)}"></div>
        <div class="mini-base third ${occ(snap.bases.third)}"></div>
        <div class="mini-base first ${occ(snap.bases.first)}"></div>
      </div>
      <div class="header-outs" aria-label="outs">
        <span class="out-dot ${snap.outs >= 1 ? "on" : ""}"></span>
        <span class="out-dot ${snap.outs >= 2 ? "on" : ""}"></span>
      </div>
    </div>`;

  return `
    <div class="scoreboard-row">
      <table class="scoreboard">
        <thead><tr><th class="team-cell"></th>${header}<th class="total">R</th></tr></thead>
        <tbody>
          ${lineRow(snap.teams.away.name, snap.lineScore.away, snap.score.away, "away")}
          ${lineRow(snap.teams.home.name, snap.lineScore.home, snap.score.home, "home")}
        </tbody>
      </table>
      ${status}
    </div>`;
}

/* ─── Legacy helpers (kept for compatibility) ─── */

export function renderBaseDiamond(snap: GameSnapshot): string {
  const occ = (b: string | null | undefined) => (b ? "occupied" : "");
  return `
    <div class="diamond" aria-label="bases">
      <div class="base second ${occ(snap.bases.second?.id)}" title="${snap.bases.second?.name ?? ""}"></div>
      <div class="base third ${occ(snap.bases.third?.id)}" title="${snap.bases.third?.name ?? ""}"></div>
      <div class="base first ${occ(snap.bases.first?.id)}" title="${snap.bases.first?.name ?? ""}"></div>
      <div class="base home"></div>
    </div>
  `;
}

export function renderOuts(outs: number): string {
  return `
    <div class="outs" aria-label="outs">
      <span class="dot ${outs >= 1 ? "on" : ""}"></span>
      <span class="dot ${outs >= 2 ? "on" : ""}"></span>
      <span class="dot ${outs >= 3 ? "on" : ""}"></span>
      <span class="label">OUTS</span>
    </div>
  `;
}

export function renderInningHeader(snap: GameSnapshot): string {
  const arrow = snap.half === "Top" ? "▲" : "▼";
  return `<div class="inning-header"><span class="arrow">${arrow}</span> ${snap.half} ${snap.inning}</div>`;
}
