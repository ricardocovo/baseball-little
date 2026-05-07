import { describe, it, expect } from "vitest";
import { createRng } from "../src/engine/rng.ts";
import { spinDirection, spinDepth } from "../src/domain/spinners.ts";
import { COLUMNS } from "../src/domain/field.ts";

describe("spinners (statistical, seeded)", () => {
  const N = 2000;

  it("Right-handed batter biases direction toward A-side (left field)", () => {
    const rng = createRng(42);
    const counts = new Map<string, number>();
    for (let i = 0; i < N; i++) {
      const c = spinDirection(rng, "Right");
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    // Sum of A..H should be greater than I..O for right-handed pull.
    const left = COLUMNS.slice(0, 8).reduce((s, c) => s + (counts.get(c) ?? 0), 0);
    const right = COLUMNS.slice(8).reduce((s, c) => s + (counts.get(c) ?? 0), 0);
    expect(left).toBeGreaterThan(right);
  });

  it("Left-handed batter biases direction toward O-side (right field)", () => {
    const rng = createRng(7);
    const counts = new Map<string, number>();
    for (let i = 0; i < N; i++) {
      const c = spinDirection(rng, "Left");
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const left = COLUMNS.slice(0, 8).reduce((s, c) => s + (counts.get(c) ?? 0), 0);
    const right = COLUMNS.slice(8).reduce((s, c) => s + (counts.get(c) ?? 0), 0);
    expect(right).toBeGreaterThan(left);
  });

  it("Heavy hitter biases depth deeper than Light hitter on average", () => {
    const heavyRng = createRng(123);
    const lightRng = createRng(456);
    let heavySum = 0;
    let lightSum = 0;
    for (let i = 0; i < N; i++) {
      heavySum += spinDepth(heavyRng, "Heavy");
      lightSum += spinDepth(lightRng, "Light");
    }
    expect(heavySum / N).toBeGreaterThan(lightSum / N + 1.5);
  });

  it("Returns deterministic results for the same seed", () => {
    const a = createRng(99);
    const b = createRng(99);
    for (let i = 0; i < 20; i++) {
      expect(spinDirection(a, "Right")).toBe(spinDirection(b, "Right"));
      expect(spinDepth(a, "Medium")).toBe(spinDepth(b, "Medium"));
    }
  });
});
