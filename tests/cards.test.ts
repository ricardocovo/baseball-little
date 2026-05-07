import { describe, it, expect } from "vitest";
import {
  createBatterDeck,
  createPitcherDeck,
  batterDeckSize,
  pitcherDeckSize,
} from "../src/domain/cards.ts";

describe("cards / deck factories", () => {
  it("produces a 16-card Classic batter deck with correct distribution", () => {
    const deck = createBatterDeck("Classic");
    expect(deck).toHaveLength(batterDeckSize("Classic"));
    expect(deck).toHaveLength(16);
    expect(deck.filter((c) => c === "HighSwing")).toHaveLength(3);
    expect(deck.filter((c) => c === "LowSwing")).toHaveLength(3);
    expect(deck.filter((c) => c === "FlatSwing")).toHaveLength(3);
    expect(deck.filter((c) => c === "HitAndRun")).toHaveLength(3);
    expect(deck.filter((c) => c === "Walk")).toHaveLength(1);
    expect(deck.filter((c) => c === "StolenBase")).toHaveLength(1);
    expect(deck.filter((c) => c === "Sacrifice")).toHaveLength(1);
    expect(deck.filter((c) => c === "Box")).toHaveLength(1);
  });

  it("produces a 12-card Reduced batter deck with correct distribution", () => {
    const deck = createBatterDeck("Reduced");
    expect(deck).toHaveLength(batterDeckSize("Reduced"));
    expect(deck).toHaveLength(12);
    expect(deck.filter((c) => c === "HighSwing")).toHaveLength(2);
    expect(deck.filter((c) => c === "LowSwing")).toHaveLength(2);
    expect(deck.filter((c) => c === "FlatSwing")).toHaveLength(2);
    expect(deck.filter((c) => c === "HitAndRun")).toHaveLength(2);
    expect(deck.filter((c) => c === "Walk")).toHaveLength(1);
    expect(deck.filter((c) => c === "StolenBase")).toHaveLength(1);
    expect(deck.filter((c) => c === "Sacrifice")).toHaveLength(1);
    expect(deck.filter((c) => c === "Box")).toHaveLength(1);
  });

  it("produces a 12-card pitcher deck for both formats with 3 No Pitch", () => {
    for (const format of ["Classic", "Reduced"] as const) {
      const deck = createPitcherDeck(format);
      expect(deck).toHaveLength(pitcherDeckSize(format));
      expect(deck).toHaveLength(12);
      expect(deck.filter((c) => c === "NoPitch")).toHaveLength(3);
      // 9 named pitches with 1 each:
      const named = deck.filter((c) => c !== "NoPitch");
      expect(named).toHaveLength(9);
      expect(new Set(named).size).toBe(9);
    }
  });
});
