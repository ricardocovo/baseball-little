import { describe, it, expect } from "vitest";
import { resolveCongruence, CONGRUENCE_TABLE } from "../src/domain/congruence.ts";
import { BATTER_CARDS, PITCHER_CARDS } from "../src/domain/cards.ts";

describe("congruence resolver", () => {
  it("covers every (batter x pitcher) pair without throwing", () => {
    for (const b of BATTER_CARDS) {
      for (const p of PITCHER_CARDS) {
        const out = resolveCongruence(b, p);
        expect(out).toBeDefined();
      }
    }
  });

  it("HighSwing vs FastHigh = Hit", () => {
    expect(resolveCongruence("HighSwing", "FastHigh")).toEqual({ kind: "Hit" });
  });
  it("HighSwing vs FastLow = StrikeOut", () => {
    expect(resolveCongruence("HighSwing", "FastLow")).toEqual({ kind: "StrikeOut" });
  });
  it("HighSwing vs NoPitch = NoPlay", () => {
    expect(resolveCongruence("HighSwing", "NoPitch")).toEqual({ kind: "NoPlay" });
  });

  it("Box vs NoPitch = BaseOnBalls", () => {
    expect(resolveCongruence("Box", "NoPitch")).toEqual({ kind: "BaseOnBalls" });
  });
  it("Box vs anything else = NoPlay", () => {
    for (const p of PITCHER_CARDS) {
      if (p === "NoPitch") continue;
      expect(resolveCongruence("Box", p)).toEqual({ kind: "NoPlay" });
    }
  });

  it("Walk card hit-cells convert to BaseOnBalls (no actual hit)", () => {
    // Walk row 'H' cells per table: FastInside, CurveHigh, CurveOutside, SliderLow.
    const hitColumns = ["FastInside", "CurveHigh", "CurveOutside", "SliderLow"] as const;
    for (const p of hitColumns) {
      expect(resolveCongruence("Walk", p)).toEqual({ kind: "BaseOnBalls" });
    }
  });

  it("Sacrifice + connecting pitch = SacrificeAttempt", () => {
    // Sac row 'H' cells: FastLow, CurveLow, SliderLow.
    expect(resolveCongruence("Sacrifice", "FastLow")).toEqual({ kind: "SacrificeAttempt" });
    expect(resolveCongruence("Sacrifice", "CurveLow")).toEqual({ kind: "SacrificeAttempt" });
    expect(resolveCongruence("Sacrifice", "SliderLow")).toEqual({ kind: "SacrificeAttempt" });
  });

  it("Sacrifice + NoPitch = NoPlay (cards burned)", () => {
    expect(resolveCongruence("Sacrifice", "NoPitch")).toEqual({ kind: "NoPlay" });
  });

  it("HitAndRun vs NoPitch = Special (lead runner out)", () => {
    expect(resolveCongruence("HitAndRun", "NoPitch")).toEqual({
      kind: "Special",
      reason: "HitAndRun_NoPitch",
    });
  });

  it("StolenBase vs Inside/Outside pitches = Safe", () => {
    expect(resolveCongruence("StolenBase", "FastInside")).toEqual({
      kind: "Special",
      reason: "StolenBase_Safe",
    });
    expect(resolveCongruence("StolenBase", "CurveOutside")).toEqual({
      kind: "Special",
      reason: "StolenBase_Safe",
    });
    expect(resolveCongruence("StolenBase", "SliderInside")).toEqual({
      kind: "Special",
      reason: "StolenBase_Safe",
    });
  });

  it("StolenBase vs other named pitches = Caught (lead runner out)", () => {
    const caughtColumns = [
      "FastHigh", "FastLow", "CurveHigh", "CurveLow", "SliderHigh", "SliderLow",
    ] as const;
    for (const p of caughtColumns) {
      expect(resolveCongruence("StolenBase", p)).toEqual({
        kind: "Special",
        reason: "StolenBase_Caught",
      });
    }
  });

  it("StolenBase vs NoPitch = caught off base", () => {
    expect(resolveCongruence("StolenBase", "NoPitch")).toEqual({
      kind: "Special",
      reason: "StolenBase_NoPitch",
    });
  });

  it("Sliding spot-check: every cell is a known token", () => {
    const valid = new Set(["H","SO","BB","NP","STEAL_C","STEAL_S","STEAL_NP","HR_NP"]);
    for (const b of BATTER_CARDS) {
      for (const p of PITCHER_CARDS) {
        expect(valid.has(CONGRUENCE_TABLE[b][p])).toBe(true);
      }
    }
  });
});
