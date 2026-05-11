import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "../src/engine/GameState.ts";
import {
  createTeam,
  defaultComputerLineup,
  defaultHumanLineup,
} from "../src/domain/players.ts";
import type { GameEvent } from "../src/engine/events.ts";

function newGame(seed = 1) {
  const home = createTeam("h", "Home", defaultHumanLineup("h"));
  const away = createTeam("a", "Away", defaultComputerLineup("a"));
  const g = new Game();
  const events = g.start({
    format: "Reduced",
    innings: 3,
    teams: { home, away },
    humanSide: "Away",
    seed,
    firstAtBat: "Away",
  });
  return { g, startEvents: events };
}

describe("Game / start", () => {
  it("emits GameStarted and AtBatStarted with Away batting first", () => {
    const { startEvents } = newGame();
    const types = startEvents.map((e) => e.type);
    expect(types).toContain("GameStarted");
    expect(types).toContain("AtBatStarted");
    const snap = new Game();
    snap.start({
      format: "Reduced",
      innings: 3,
      teams: {
        home: createTeam("h", "Home", defaultHumanLineup("h")),
        away: createTeam("a", "Away", defaultComputerLineup("a")),
      },
      humanSide: "Away",
      seed: 1,
      firstAtBat: "Away",
    });
    expect(snap.snapshot().status).toBe("AwaitingPitch");
  });
});

describe("Game / strikeouts and outs", () => {
  it("3 strikeouts end the half-inning", () => {
    const { g } = newGame();
    let allEvents: GameEvent[] = [];
    // Each pitcher card has only 1 copy (except NoPitch). Use 3 distinct SO combos.
    allEvents = allEvents.concat(g.playCards("HighSwing", "FastLow"));   // SO
    allEvents = allEvents.concat(g.playCards("LowSwing", "FastHigh"));   // SO
    allEvents = allEvents.concat(g.playCards("FlatSwing", "FastInside")); // SO
    const halfEnded = allEvents.filter((e) => e.type === "HalfInningEnded");
    expect(halfEnded).toHaveLength(1);
    expect(g.snapshot().outs).toBe(0);
    expect(g.snapshot().half).toBe("Bottom");
  });
});

describe("Game / walk", () => {
  it("Box vs NoPitch issues a walk and bats next batter", () => {
    const { g } = newGame();
    const ev = g.playCards("Box", "NoPitch");
    const types = ev.map((e) => e.type);
    expect(types).toContain("WalkIssued");
    const snap = g.snapshot();
    expect(snap.bases.first).not.toBeNull();
    expect(snap.battingIndex.away).toBe(1);
  });
});

describe("Game / hit -> field flow", () => {
  it("Hit transitions to AwaitingFielding -> direction -> depth -> resolved", () => {
    const { g } = newGame(7);
    // HighSwing vs FastHigh = Hit
    g.playCards("HighSwing", "FastHigh");
    expect(g.snapshot().status).toBe("AwaitingFielding");

    // place 7 reasonable fielders (catcher is not on the field)
    g.submitFielders([
      { col: "C", row: 4 }, { col: "G", row: 4 }, { col: "J", row: 4 }, { col: "M", row: 4 },
      { col: "C", row: 8 }, { col: "H", row: 8 }, { col: "M", row: 8 },
    ]);
    expect(g.snapshot().status).toBe("AwaitingDirectionSpin");

    const dirEv = g.spinHitDirection();
    expect(dirEv.find((e) => e.type === "HitDirection")).toBeDefined();
    expect(g.snapshot().status).toBe("AwaitingDepthSpin");

    const depthEv = g.spinHitDepth();
    const types = depthEv.map((e) => e.type);
    expect(types).toContain("HitDepth");
    expect(types).toContain("HitClassified");
    // Either advanced to next at-bat or game continues normally.
    expect(["AwaitingPitch", "GameOver"]).toContain(g.snapshot().status);
  });
});

describe("Game / hand exhaustion", () => {
  it("ends the game when the pitcher's deck is fully burned", () => {
    const { g } = newGame();
    // Use HighSwing vs NoPitch (NoPlay) to burn cards safely. We only have
    // 2 HighSwings (Reduced) and 3 NoPitches; cycle through swings + NoPitch.
    // After 3 NoPlay turns the NoPitch supply is gone; switch to predictable
    // SO combos to drain the rest while making outs.
    const offSwingChoices = ["HighSwing", "LowSwing", "FlatSwing"] as const;
    let safety = 200;
    while (g.snapshot().status !== "GameOver" && safety-- > 0) {
      const status = g.snapshot().status;
      if (status === "AwaitingFielding") {
        g.submitFielders([
          { col: "C", row: 4 }, { col: "G", row: 4 }, { col: "J", row: 4 }, { col: "M", row: 4 },
          { col: "C", row: 8 }, { col: "H", row: 8 }, { col: "M", row: 8 },
        ]);
        continue;
      }
      if (status === "AwaitingDirectionSpin") { g.spinHitDirection(); continue; }
      if (status === "AwaitingDepthSpin") { g.spinHitDepth(); continue; }
      if (status !== "AwaitingPitch") break;

      const snap = g.snapshot();
      const offSide = snap.half === "Top" ? "away" : "home";
      const defSide = snap.half === "Top" ? "home" : "away";
      const off = snap.decks[offSide].batter;
      const def = snap.decks[defSide].pitcher;

      // Prefer NoPlay (NoPitch + a swing) to burn without outs; fall back to
      // any SO combo we can find; otherwise just play first available pair.
      const swing = offSwingChoices.find((s) => off.includes(s));
      if (def.includes("NoPitch") && swing) {
        g.playCards(swing, "NoPitch");
        continue;
      }
      // Try an SO combo to advance outs.
      const soPairs: Array<[typeof off[number], typeof def[number]]> = [
        ["HighSwing", "FastLow"], ["HighSwing", "CurveLow"], ["HighSwing", "SliderLow"],
        ["LowSwing", "FastHigh"], ["LowSwing", "CurveHigh"], ["LowSwing", "SliderHigh"],
        ["FlatSwing", "FastInside"], ["FlatSwing", "CurveOutside"], ["FlatSwing", "SliderInside"],
      ];
      const pair = soPairs.find(([b, p]) => off.includes(b) && def.includes(p));
      if (pair) {
        g.playCards(pair[0], pair[1]);
        continue;
      }
      // Fall back to first available pair (may go to field; abort then).
      const b = off[0];
      const p = def[0];
      if (!b || !p) break;
      g.playCards(b, p);
    }
    expect(g.snapshot().status).toBe("GameOver");
    expect(["InningsCompleted", "HandExhausted"]).toContain(g.snapshot().gameOverReason);
  });
});

describe("Game / NoPlay", () => {
  it("HighSwing vs NoPitch burns cards, no out, batter stays at bat", () => {
    const { g } = newGame();
    const before = g.snapshot();
    const ev = g.playCards("HighSwing", "NoPitch");
    expect(ev.find((e) => e.type === "NoPlay")).toBeDefined();
    const after = g.snapshot();
    expect(after.outs).toBe(0);
    // Batter stays per rules: "cards are burned" but the at-bat continues.
    expect(after.battingIndex.away).toBe(before.battingIndex.away);
    expect(after.decks.away.batter.length).toBe(before.decks.away.batter.length - 1);
    expect(after.decks.home.pitcher.length).toBe(before.decks.home.pitcher.length - 1);
  });
});

describe("Game / Hit & Run vs No Pitch special", () => {
  it("with no runners on base => NoPlay", () => {
    const { g } = newGame();
    const ev = g.playCards("HitAndRun", "NoPitch");
    expect(ev.find((e) => e.type === "NoPlay")).toBeDefined();
  });
});

describe("Game / Stolen Base", () => {
  it("StolenBase vs Inside pitch with runner on 1B advances to 2B", () => {
    const { g } = newGame();
    // Get a runner on 1B via walk first.
    g.playCards("Box", "NoPitch");
    expect(g.snapshot().bases.first).not.toBeNull();
    // Now steal: StolenBase vs FastInside = Safe
    const ev = g.playCards("StolenBase", "FastInside");
    expect(ev.find((e) => e.type === "RunnerAdvances" && e.from === "First" && e.to === "Second")).toBeDefined();
    const snap = g.snapshot();
    expect(snap.bases.first).toBeNull();
    expect(snap.bases.second).not.toBeNull();
  });

  it("StolenBase vs FastHigh with runner on 1B = caught, 1 out, batter stays", () => {
    const { g } = newGame();
    g.playCards("Box", "NoPitch");
    const beforeIdx = g.snapshot().battingIndex.away;
    const ev = g.playCards("StolenBase", "FastHigh");
    expect(ev.find((e) => e.type === "RunnerOut")).toBeDefined();
    expect(g.snapshot().outs).toBe(1);
    expect(g.snapshot().battingIndex.away).toBe(beforeIdx); // batter stays
    expect(g.snapshot().bases.first).toBeNull();
  });
});

describe("Game / hand discard", () => {
  let g: Game;
  beforeEach(() => {
    g = newGame().g;
  });

  it("removes one batter and one pitcher card per pitch", () => {
    const before = g.snapshot();
    const beforeBat = before.decks.away.batter.length;
    const beforePitch = before.decks.home.pitcher.length;
    g.playCards("HighSwing", "FastLow");
    const after = g.snapshot();
    expect(after.decks.away.batter.length).toBe(beforeBat - 1);
    expect(after.decks.home.pitcher.length).toBe(beforePitch - 1);
  });
});
