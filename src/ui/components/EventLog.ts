import type { GameEvent } from "../../engine/events.ts";
import { t, plural } from "../../i18n/i18n.ts";

export function describeEvent(e: GameEvent): string {
  switch (e.type) {
    case "GameStarted":
      return t("eventLog.gameStarted", { side: t(`sides.${e.firstAtBat}`) });
    case "AtBatStarted":
      return t("eventLog.atBatStarted", {
        name: e.batter.name,
        hand: e.batter.handedness[0] ?? "",
        strength: t(`strength.${e.batter.strength}`),
      });
    case "PitchResolved":
      return t("eventLog.pitchResolved", {
        pitcher: t(`cards.pitcher.${e.pitcherCard}`),
        batter: t(`cards.batter.${e.batterCard}`),
      });
    case "StrikeOut":
      return t("eventLog.strikeOut", { name: e.batter.name });
    case "WalkIssued":
      return t("eventLog.walkIssued", { name: e.batter.name });
    case "NoPlay":
      return t("eventLog.noPlay", { reason: e.reason });
    case "BallInPlay":
      return t("eventLog.ballInPlay", { name: e.batter.name });
    case "HitDirection":
      return t("eventLog.hitDirection", { col: e.col });
    case "HitDepth":
      return t("eventLog.hitDepth", { row: e.row });
    case "HitClassified":
      switch (e.classification.kind) {
        case "Out":
          return t("eventLog.caughtAt", {
            col: e.classification.by.col,
            row: e.classification.by.row,
          });
        case "Single": return t("eventLog.single");
        case "Double": return t("eventLog.double");
        case "Triple": return t("eventLog.triple");
        case "HomeRun":
          return e.classification.insideThePark
            ? t("eventLog.homeRunInsidePark")
            : t("eventLog.homeRun");
        case "Error": return t("eventLog.error");
      }
      return "";
    case "RunsScored": {
      const names = e.scorers.map((s) => s.name).join(", ");
      return plural(e.runs, "eventLog.runScored", "eventLog.runsScored", { names });
    }
    case "OutsRecorded":
      return e.reason
        ? t("eventLog.outRecordedReason", { reason: e.reason })
        : t("eventLog.outRecorded");
    case "RunnerOut":
      return t("eventLog.runnerOut", { name: e.runner.name, from: t(`bases.${e.from}`) });
    case "BatterAdvances":
      return t("eventLog.batterAdvances", { name: e.batter.name, to: t(`bases.${e.to}`) });
    case "RunnerAdvances":
      return t("eventLog.runnerAdvances", {
        name: e.runner.name,
        from: t(`bases.${e.from}`),
        to: t(`bases.${e.to}`),
      });
    case "ErrorOnField":
      return t("eventLog.errorOnField", { col: e.landing.col, row: e.landing.row });
    case "HalfInningEnded":
      return t("eventLog.halfInningEnded", {
        half: t(`halves.${e.half}`),
        inning: e.inning,
        runs: e.runsThisHalf,
        label: e.runsThisHalf === 1 ? t("eventLog.runsLabelOne") : t("eventLog.runsLabelOther"),
      });
    case "HandExhausted":
      return t("eventLog.handExhausted", {
        side: t(`sides.${e.side}`),
        role: t(`cardPhase.role.${e.role}`),
      });
    case "HandsReplenished":
      return t("eventLog.handsReplenished", {
        half: t(`halves.${e.half}`),
        inning: e.inning,
      });
    case "GameOver":
      return e.winner === "Tie"
        ? t("eventLog.gameOverTie", { away: e.finalScore.away, home: e.finalScore.home })
        : t("eventLog.gameOverWin", {
            winner: t(`sides.${e.winner}`),
            away: e.finalScore.away,
            home: e.finalScore.home,
          });
  }
}

export function renderEventLog(events: readonly GameEvent[], maxItems = 60): string {
  const last = events.slice(-maxItems).reverse();
  const items = last.map((e) => `<li class="evt evt-${e.type}">${escapeHtml(describeEvent(e))}</li>`).join("");
  return `<div class="event-log"><h3>${t("eventLog.title")}</h3><ul>${items}</ul></div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  } as Record<string, string>)[c] ?? c);
}
