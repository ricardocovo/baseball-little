import type { BatterCard, PitcherCard } from "./cards.ts";

export type ConguenceOutcome =
  | { kind: "Hit" }
  | { kind: "StrikeOut" }
  | { kind: "BaseOnBalls" }
  | { kind: "NoPlay" }
  | { kind: "SacrificeAttempt" }
  | { kind: "Special"; reason: SpecialReason };

export type SpecialReason =
  | "HitAndRun_NoPitch"
  | "StolenBase_Safe"
  | "StolenBase_Caught"
  | "StolenBase_NoPitch";

type Cell = "H" | "SO" | "BB" | "NP" | "STEAL_C" | "STEAL_S" | "STEAL_NP" | "HR_NP";

const TABLE: Record<BatterCard, Record<PitcherCard, Cell>> = {
  HighSwing: {
    FastHigh: "H", FastLow: "SO", FastInside: "H",
    CurveHigh: "H", CurveLow: "SO", CurveOutside: "H",
    SliderHigh: "H", SliderLow: "SO", SliderInside: "H",
    NoPitch: "NP",
  },
  LowSwing: {
    FastHigh: "SO", FastLow: "H", FastInside: "H",
    CurveHigh: "SO", CurveLow: "H", CurveOutside: "H",
    SliderHigh: "SO", SliderLow: "H", SliderInside: "H",
    NoPitch: "NP",
  },
  FlatSwing: {
    FastHigh: "H", FastLow: "H", FastInside: "SO",
    CurveHigh: "H", CurveLow: "H", CurveOutside: "SO",
    SliderHigh: "H", SliderLow: "H", SliderInside: "SO",
    NoPitch: "NP",
  },
  HitAndRun: {
    FastHigh: "SO", FastLow: "H", FastInside: "H",
    CurveHigh: "SO", CurveLow: "H", CurveOutside: "H",
    SliderHigh: "SO", SliderLow: "H", SliderInside: "SO",
    NoPitch: "HR_NP",
  },
  Walk: {
    FastHigh: "SO", FastLow: "SO", FastInside: "H",
    CurveHigh: "H", CurveLow: "SO", CurveOutside: "H",
    SliderHigh: "SO", SliderLow: "H", SliderInside: "SO",
    NoPitch: "NP",
  },
  Sacrifice: {
    FastHigh: "SO", FastLow: "H", FastInside: "SO",
    CurveHigh: "SO", CurveLow: "H", CurveOutside: "SO",
    SliderHigh: "SO", SliderLow: "H", SliderInside: "SO",
    NoPitch: "NP",
  },
  StolenBase: {
    FastHigh: "STEAL_C", FastLow: "STEAL_C", FastInside: "STEAL_S",
    CurveHigh: "STEAL_C", CurveLow: "STEAL_C", CurveOutside: "STEAL_S",
    SliderHigh: "STEAL_C", SliderLow: "STEAL_C", SliderInside: "STEAL_S",
    NoPitch: "STEAL_NP",
  },
  Box: {
    FastHigh: "NP", FastLow: "NP", FastInside: "NP",
    CurveHigh: "NP", CurveLow: "NP", CurveOutside: "NP",
    SliderHigh: "NP", SliderLow: "NP", SliderInside: "NP",
    NoPitch: "BB",
  },
};

export function resolveCongruence(
  batter: BatterCard,
  pitcher: PitcherCard,
): ConguenceOutcome {
  const cell = TABLE[batter][pitcher];
  switch (cell) {
    case "H":
      // Walk card never produces a hit per rules — convert to BB.
      if (batter === "Walk") return { kind: "BaseOnBalls" };
      // Sacrifice card "H" cell = the bunt connects -> sacrifice attempt.
      // Engine handles batter-out + runner-advance via SpecialPlays.
      if (batter === "Sacrifice") return { kind: "SacrificeAttempt" };
      return { kind: "Hit" };
    case "SO":
      return { kind: "StrikeOut" };
    case "BB":
      return { kind: "BaseOnBalls" };
    case "NP":
      return { kind: "NoPlay" };
    case "HR_NP":
      return { kind: "Special", reason: "HitAndRun_NoPitch" };
    case "STEAL_S":
      return { kind: "Special", reason: "StolenBase_Safe" };
    case "STEAL_C":
      return { kind: "Special", reason: "StolenBase_Caught" };
    case "STEAL_NP":
      return { kind: "Special", reason: "StolenBase_NoPitch" };
  }
}

export const CONGRUENCE_TABLE: Readonly<Record<BatterCard, Readonly<Record<PitcherCard, Cell>>>> =
  TABLE;
