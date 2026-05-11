import { describe, it, expect } from "vitest";
import { createAi, defaultFielderPlacement } from "../src/ai/Ai.ts";
import { createRng } from "../src/engine/rng.ts";
import type { BatterCard, PitcherCard } from "../src/domain/cards.ts";
import type { Player } from "../src/domain/players.ts";

const player = (s: "Light" | "Medium" | "Heavy" = "Medium", h: "Right" | "Left" = "Right"): Player => ({
  id: "p", name: "Test", strength: s, handedness: h,
});

const fullBatterHand: BatterCard[] = [
  "HighSwing","HighSwing","LowSwing","LowSwing","FlatSwing","FlatSwing",
  "HitAndRun","HitAndRun","Walk","StolenBase","Sacrifice","Box",
];
const fullPitcherHand: PitcherCard[] = [
  "FastHigh","FastLow","FastInside","CurveHigh","CurveLow","CurveOutside",
  "SliderHigh","SliderLow","SliderInside","NoPitch","NoPitch","NoPitch",
];

describe("AI / chooseBatterCard", () => {
  it("only ever picks cards in its own hand", () => {
    const rng = createRng(11);
    const ai = createAi(rng, "Away");
    for (let i = 0; i < 200; i++) {
      const card = ai.chooseBatterCard(fullBatterHand, {
        inning: 1, inningsConfigured: 3, half: "Top", outs: 0,
        bases: { first: null, second: null, third: null },
        myScore: 0, opponentScore: 0,
      }, player());
      expect(fullBatterHand).toContain(card);
    }
  });

  it("does not pick StolenBase with no runners", () => {
    const rng = createRng(7);
    const ai = createAi(rng, "Away");
    for (let i = 0; i < 200; i++) {
      const card = ai.chooseBatterCard(fullBatterHand, {
        inning: 1, inningsConfigured: 3, half: "Top", outs: 0,
        bases: { first: null, second: null, third: null },
        myScore: 0, opponentScore: 0,
      }, player());
      expect(card).not.toBe("StolenBase");
    }
  });
});

describe("AI / choosePitcherCard", () => {
  it("only ever picks cards in its own hand", () => {
    const rng = createRng(13);
    const ai = createAi(rng, "Home");
    for (let i = 0; i < 200; i++) {
      const card = ai.choosePitcherCard(fullPitcherHand, {
        inning: 1, inningsConfigured: 3, half: "Top", outs: 0,
        bases: { first: null, second: null, third: null },
        myScore: 0, opponentScore: 0,
      }, player());
      expect(fullPitcherHand).toContain(card);
    }
  });
});

describe("AI / placeFielders", () => {
  it("returns 7 unique coordinates for any batter profile", () => {
    const rng = createRng(99);
    const ai = createAi(rng, "Home");
    for (const s of ["Light","Medium","Heavy"] as const) {
      for (const h of ["Right","Left"] as const) {
        const placed = ai.placeFielders(player(s, h));
        expect(placed).toHaveLength(7);
        const keys = new Set(placed.map((c) => `${c.col}${c.row}`));
        expect(keys.size).toBe(7);
      }
    }
  });

  it("places outfielders deeper for Heavy than Light", () => {
    const heavy = defaultFielderPlacement("Heavy", "Right");
    const light = defaultFielderPlacement("Light", "Right");
    const heavyMaxRow = Math.max(...heavy.map((c) => c.row));
    const lightMaxRow = Math.max(...light.map((c) => c.row));
    expect(heavyMaxRow).toBeGreaterThan(lightMaxRow);
  });
});
