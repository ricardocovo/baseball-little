import type { GameEvent } from "../../engine/events.ts";
import { BATTER_CARD_LABELS, PITCHER_CARD_LABELS } from "../../domain/cards.ts";

export function describeEvent(e: GameEvent): string {
  switch (e.type) {
    case "GameStarted":
      return `Game started — ${e.firstAtBat} bats first.`;
    case "AtBatStarted":
      return `${e.batter.name} (${e.batter.handedness[0]}HB, ${e.batter.strength}) steps up.`;
    case "PitchResolved":
      return `Pitch: ${PITCHER_CARD_LABELS[e.pitcherCard]} vs ${BATTER_CARD_LABELS[e.batterCard]}.`;
    case "StrikeOut":
      return `STRIKE OUT — ${e.batter.name}.`;
    case "WalkIssued":
      return `WALK — ${e.batter.name} takes first.`;
    case "NoPlay":
      return `No play (${e.reason}).`;
    case "BallInPlay":
      return `Ball in play! ${e.batter.name} swings…`;
    case "HitDirection":
      return `Direction: column ${e.col}.`;
    case "HitDepth":
      return `Depth: row ${e.row}.`;
    case "HitClassified":
      switch (e.classification.kind) {
        case "Out": return `Caught — out at ${e.classification.by.col}${e.classification.by.row}.`;
        case "Single": return `SINGLE.`;
        case "Double": return `DOUBLE.`;
        case "Triple": return `TRIPLE.`;
        case "HomeRun": return e.classification.insideThePark ? `HOME RUN (inside the park)!` : `HOME RUN!`;
        case "Error": return `ERROR on the field.`;
      }
      return "";
    case "RunsScored":
      return `Run${e.runs > 1 ? "s" : ""} scored: ${e.scorers.map((s) => s.name).join(", ")}.`;
    case "OutsRecorded":
      return `Out recorded${e.reason ? ` (${e.reason})` : ""}.`;
    case "RunnerOut":
      return `Runner out: ${e.runner.name} from ${e.from}.`;
    case "BatterAdvances":
      return `${e.batter.name} → ${e.to}.`;
    case "RunnerAdvances":
      return `${e.runner.name}: ${e.from} → ${e.to}.`;
    case "ErrorOnField":
      return `Error at ${e.landing.col}${e.landing.row}.`;
    case "HalfInningEnded":
      return `End of ${e.half} ${e.inning}: ${e.runsThisHalf} run${e.runsThisHalf === 1 ? "" : "s"}.`;
    case "HandExhausted":
      return `${e.side} ran out of ${e.role} cards.`;
    case "GameOver":
      return `GAME OVER — ${e.winner === "Tie" ? "tie" : `${e.winner} wins`} ${e.finalScore.away}–${e.finalScore.home}.`;
  }
}

export function renderEventLog(events: readonly GameEvent[], maxItems = 60): string {
  const last = events.slice(-maxItems).reverse();
  const items = last.map((e) => `<li class="evt evt-${e.type}">${escapeHtml(describeEvent(e))}</li>`).join("");
  return `<div class="event-log"><h3>Play-by-play</h3><ul>${items}</ul></div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  } as Record<string, string>)[c] ?? c);
}
