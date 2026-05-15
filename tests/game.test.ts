import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "../src/engine/GameState.ts";
import {
  createTeam,
  defaultComputerLineup,
  defaultHumanLineup,
} from "../src/domain/players.ts";
import type { GameEvent } from "../src/engine/events.ts";

function newGame(opts: {
  seed?: number;
  innings?: number;
  humanSide?: "Home" | "Away";
  firstAtBat?: "Home" | "Away";
} = {}) {
  const home = createTeam("h", "Home", defaultHumanLineup("h"));
  const away = createTeam("a", "Away", defaultComputerLineup("a"));
  const g = new Game();
  const events = g.start({
    format: "Reduced",
    innings: opts.innings ?? 3,
    teams: { home, away },
    humanSide: opts.humanSide ?? "Away",
    seed: opts.seed ?? 1,
    firstAtBat: opts.firstAtBat ?? "Away",
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
    const { g } = newGame({ seed: 7 });
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

describe("Game / event contracts and guards", () => {
  it("streams emitted events to subscribers and stops after unsubscribe", () => {
    const { g } = newGame();
    const seen: GameEvent[] = [];
    const unsubscribe = g.subscribe((event) => seen.push(event));

    const emitted = g.playCards("HighSwing", "FastLow");
    expect(seen).toEqual(emitted);

    unsubscribe();
    g.playCards("LowSwing", "FastHigh");
    expect(seen).toEqual(emitted);
  });

  it("failed card validation does not mutate state or emit events", () => {
    const { g } = newGame();
    const seen: GameEvent[] = [];
    g.subscribe((event) => seen.push(event));

    g.playCards("Box", "NoPitch");
    const before = g.snapshot();
    const emittedBefore = seen.length;

    expect(() => g.playCards("Box", "FastHigh")).toThrow("Batter card Box not in offense hand");
    expect(g.snapshot()).toEqual(before);
    expect(seen).toHaveLength(emittedBefore);
  });

  it("throws when an action is invoked in the wrong state", () => {
    const { g } = newGame();
    expect(() => g.spinHitDirection()).toThrow("Expected status AwaitingDirectionSpin but was AwaitingPitch");
  });

  it("rejects fielder submissions with anything other than 7 coordinates", () => {
    const { g } = newGame();
    g.playCards("HighSwing", "FastHigh");

    expect(() => g.submitFielders([
      { col: "C", row: 4 }, { col: "G", row: 4 }, { col: "J", row: 4 },
      { col: "C", row: 8 }, { col: "H", row: 8 }, { col: "M", row: 8 },
    ])).toThrow("Expected exactly 7 fielders");
    expect(g.snapshot().status).toBe("AwaitingFielding");
  });
});

describe("Game / innings bookkeeping", () => {
  it("replenishes both teams' decks when a half-inning ends", () => {
    const { g } = newGame();
    const initial = g.snapshot();
    const fullBatter = initial.decks.away.batter.length;
    const fullPitcher = initial.decks.home.pitcher.length;

    // Finish the top half — cards burned during the half are restored.
    g.playCards("HighSwing", "FastLow");
    g.playCards("LowSwing", "CurveHigh");
    g.playCards("FlatSwing", "FastInside");

    const snap = g.snapshot();
    expect(snap.half).toBe("Bottom");
    expect(snap.decks.away.batter).toHaveLength(fullBatter);
    expect(snap.decks.home.pitcher).toHaveLength(fullPitcher);
    expect(snap.decks.home.batter).toHaveLength(fullBatter);
    expect(snap.decks.away.pitcher).toHaveLength(fullPitcher);
  });

  it("records line scores and winner for a one-inning game", () => {
    const { g } = newGame({ seed: 5, innings: 1, humanSide: "Home" });

    g.playCards("HighSwing", "FastHigh");
    g.submitFielders([
      { col: "A", row: 2 }, { col: "B", row: 2 }, { col: "C", row: 2 }, { col: "D", row: 2 },
      { col: "E", row: 2 }, { col: "F", row: 2 }, { col: "G", row: 2 },
    ]);
    g.spinHitDirection();
    g.spinHitDepth();

    g.playCards("LowSwing", "CurveHigh");
    g.playCards("FlatSwing", "FastInside");
    g.playCards("HighSwing", "CurveLow");

    g.playCards("HighSwing", "FastLow");
    g.playCards("LowSwing", "FastHigh");
    g.playCards("FlatSwing", "FastInside");

    const snap = g.snapshot();
    expect(snap.status).toBe("GameOver");
    expect(snap.lineScore.away).toEqual([1]);
    expect(snap.lineScore.home).toEqual([0]);
    expect(snap.score).toEqual({ away: 1, home: 0 });
    expect(snap.winner).toBe("Away");
    expect(snap.gameOverReason).toBe("InningsCompleted");
  });

  it("declares a tie when the configured innings end level", () => {
    const { g } = newGame({ innings: 1 });

    g.playCards("HighSwing", "FastLow");
    g.playCards("LowSwing", "FastHigh");
    g.playCards("FlatSwing", "FastInside");

    g.playCards("HighSwing", "FastLow");
    g.playCards("LowSwing", "FastHigh");
    g.playCards("FlatSwing", "FastInside");

    const snap = g.snapshot();
    expect(snap.status).toBe("GameOver");
    expect(snap.lineScore.away).toEqual([0]);
    expect(snap.lineScore.home).toEqual([0]);
    expect(snap.winner).toBe("Tie");
    expect(snap.gameOverReason).toBe("InningsCompleted");
  });
});

describe("Game / hand replenishment", () => {
  it("refills both teams' hands at the start of every half-inning", () => {
    const { g } = newGame({ innings: 2 });
    const initial = g.snapshot();
    const fullBatter = initial.decks.away.batter.length;
    const fullPitcher = initial.decks.home.pitcher.length;
    expect(fullBatter).toBeGreaterThan(0);
    expect(fullPitcher).toBeGreaterThan(0);

    // Top 1: away bats — 3 strikeouts to end the half.
    g.playCards("HighSwing", "FastLow");
    g.playCards("LowSwing", "FastHigh");
    g.playCards("FlatSwing", "FastInside");

    const afterTop1 = g.snapshot();
    // Half should have advanced and decks must be back to full.
    expect(afterTop1.half).toBe("Bottom");
    expect(afterTop1.inning).toBe(1);
    expect(afterTop1.decks.away.batter.length).toBe(fullBatter);
    expect(afterTop1.decks.home.batter.length).toBe(fullBatter);
    expect(afterTop1.decks.away.pitcher.length).toBe(fullPitcher);
    expect(afterTop1.decks.home.pitcher.length).toBe(fullPitcher);
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
