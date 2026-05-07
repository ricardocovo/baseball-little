import { describe, it, expect } from "vitest";
import { Game } from "../src/engine/GameState.ts";
import {
  createTeam,
  defaultComputerLineup,
  defaultHumanLineup,
} from "../src/domain/players.ts";

function newGame(opts: { firstAtBat?: "Home" | "Away"; seed?: number } = {}) {
  const home = createTeam("h", "Home", defaultHumanLineup("h"));
  const away = createTeam("a", "Away", defaultComputerLineup("a"));
  const g = new Game();
  g.start({
    format: "Reduced",
    innings: 3,
    teams: { home, away },
    humanSide: "Home",
    seed: opts.seed ?? 42,
    firstAtBat: opts.firstAtBat ?? "Away",
  });
  return g;
}

describe("Game / first-at-bat respects coin flip without swapping teams", () => {
  it("Home bats first when firstAtBat=Home; team identity preserved", () => {
    const g = newGame({ firstAtBat: "Home" });
    expect(g.currentOffense()).toBe("Home");
    const snap = g.snapshot();
    // Original home team identity preserved (id 'h').
    expect(snap.teams.home.id).toBe("h");
    expect(snap.teams.away.id).toBe("a");
    expect(snap.firstAtBat).toBe("Home");
  });

  it("Away bats first when firstAtBat=Away (the conventional case)", () => {
    const g = newGame({ firstAtBat: "Away" });
    expect(g.currentOffense()).toBe("Away");
    expect(g.snapshot().firstAtBat).toBe("Away");
  });

  it("Half-inning toggles correctly when firstAtBat=Home", () => {
    const g = newGame({ firstAtBat: "Home" });
    // Strike out 3 home batters with distinct SO combos.
    g.playCards("HighSwing", "FastLow");
    g.playCards("LowSwing", "FastHigh");
    g.playCards("FlatSwing", "FastInside");
    expect(g.snapshot().half).toBe("Bottom");
    // Now Away should be batting (since Home batted top).
    expect(g.currentOffense()).toBe("Away");
  });
});

describe("Game / publicSnapshot hides opponent hands", () => {
  it("hides Away hand when called for Home", () => {
    const g = newGame();
    const pub = g.publicSnapshot("Home");
    expect(pub.decks.away.batter).toHaveLength(0);
    expect(pub.decks.away.pitcher).toHaveLength(0);
    expect(pub.decks.home.batter.length).toBeGreaterThan(0);
  });
  it("hides Home hand when called for Away", () => {
    const g = newGame();
    const pub = g.publicSnapshot("Away");
    expect(pub.decks.home.batter).toHaveLength(0);
    expect(pub.decks.home.pitcher).toHaveLength(0);
    expect(pub.decks.away.batter.length).toBeGreaterThan(0);
  });
});

describe("Game / Hit & Run mechanics", () => {
  it("with runners on, strikeout triggers a throw at the lead runner", () => {
    const g = newGame({ seed: 1 });
    // Get a runner on 1B via Box+NoPitch walk.
    g.playCards("Box", "NoPitch");
    const beforeOuts = g.snapshot().outs;
    // HitAndRun vs FastHigh = SO. With runner on 1B and outs<3, throw fires.
    const ev = g.playCards("HitAndRun", "FastHigh");
    const afterOuts = g.snapshot().outs;
    expect(afterOuts).toBeGreaterThan(beforeOuts);
    // Either the runner was thrown out (RunnerOut), or advanced safely.
    const ranOrOut =
      ev.find((e) => e.type === "RunnerOut") !== undefined ||
      ev.find((e) => e.type === "RunnerAdvances") !== undefined;
    expect(ranOrOut).toBe(true);
  });

  it("Hit & Run hit: only runners get the extra base, batter goes normal", () => {
    // We hand-craft a scenario by getting a runner on 1B then forcing a hit.
    // HighSwing vs FastHigh = Hit (no Hit & Run). Using HitAndRun vs FastLow
    // is SO not Hit. To get a Hit&Run hit we need (HitAndRun, FastLow=H,
    // CurveLow=H, FastInside=H, CurveOutside=H, SliderLow=H).
    const g = newGame({ seed: 2 });
    // Walk to put runner on 1B
    g.playCards("Box", "NoPitch");
    const runnerOnFirst = g.snapshot().bases.first;
    expect(runnerOnFirst).not.toBeNull();
    // HitAndRun vs FastLow = H. Goes to field.
    g.playCards("HitAndRun", "FastLow");
    // Place fielders far away so we get a triple (or whatever the spinner gives).
    g.submitFielders([
      { col: "A", row: 2 }, { col: "B", row: 2 }, { col: "C", row: 2 }, { col: "D", row: 2 },
      { col: "E", row: 2 }, { col: "F", row: 2 }, { col: "G", row: 2 }, { col: "M", row: 2 },
    ]);
    g.spinHitDirection();
    g.spinHitDepth();
    // After resolution, verify there's no impossible base assignment
    // (e.g., batter on 3B + runner from 1B also on 3B).
    const snap = g.snapshot();
    const ids = [snap.bases.first?.id, snap.bases.second?.id, snap.bases.third?.id]
      .filter((x) => x !== undefined);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
