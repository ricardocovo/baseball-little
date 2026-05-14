import { describe, it, expect } from "vitest";
import type { Rng } from "../src/engine/rng.ts";
import { createRng } from "../src/engine/rng.ts";
import { spinDirection, spinDepth } from "../src/domain/spinners.ts";

function captureWeighted(choice: "first" | "last" = "first"): {
  rng: Rng;
  lastCall: () => { items: readonly unknown[]; weights: readonly number[] };
} {
  let captured: { items: readonly unknown[]; weights: readonly number[] } | undefined;
  const pick: Rng["pick"] = <T,>(items: readonly T[]) => items[0] as T;
  const weighted: Rng["weighted"] = <T,>(items: readonly T[], weights: readonly number[]) => {
    captured = { items: [...items], weights: [...weights] };
    return (choice === "last" ? items[items.length - 1] : items[0]) as T;
  };
  const rng: Rng = {
    next: () => 0,
    int: () => 0,
    pick,
    weighted,
  };
  return {
    rng,
    lastCall: () => {
      if (!captured) throw new Error("weighted() was not called");
      return captured;
    },
  };
}

describe("spinners", () => {
  it("builds pull-side direction weights for right-handed batters", () => {
    const { rng, lastCall } = captureWeighted();
    expect(spinDirection(rng, "Right")).toBe("A");
    expect(lastCall().weights).toEqual([4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1]);
  });

  it("builds opposite-side direction weights for left-handed batters", () => {
    const { rng, lastCall } = captureWeighted("last");
    expect(spinDirection(rng, "Left")).toBe("O");
    expect(lastCall().weights).toEqual([1, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4]);
  });

  it("builds depth weights from lightest to heaviest hitters", () => {
    const light = captureWeighted();
    const medium = captureWeighted();
    const heavy = captureWeighted();

    spinDepth(light.rng, "Light");
    spinDepth(medium.rng, "Medium");
    spinDepth(heavy.rng, "Heavy");

    expect(light.lastCall().weights).toEqual([4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 1, 1]);
    expect(medium.lastCall().weights).toEqual([2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1]);
    expect(heavy.lastCall().weights).toEqual([1, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5]);
  });

  it("returns deterministic results for the same seed", () => {
    const a = createRng(99);
    const b = createRng(99);
    for (let i = 0; i < 20; i++) {
      expect(spinDirection(a, "Right")).toBe(spinDirection(b, "Right"));
      expect(spinDepth(a, "Medium")).toBe(spinDepth(b, "Medium"));
    }
  });
});
