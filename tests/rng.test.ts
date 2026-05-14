import { describe, it, expect } from "vitest";
import { createRng } from "../src/engine/rng.ts";

describe("rng", () => {
  it("uses the golden-ratio fallback when seeded with zero", () => {
    const zero = createRng(0);
    const fallback = createRng(0x9e3779b9);
    expect([zero.next(), zero.next(), zero.next()]).toEqual([
      fallback.next(),
      fallback.next(),
      fallback.next(),
    ]);
  });

  it("produces the same sequence for the same seed", () => {
    const a = createRng(99);
    const b = createRng(99);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(
      Array.from({ length: 5 }, () => b.next()),
    );
  });

  it("rejects non-positive bounds for int()", () => {
    const rng = createRng(1);
    expect(() => rng.int(0)).toThrow("maxExclusive must be > 0");
    expect(() => rng.int(-1)).toThrow("maxExclusive must be > 0");
  });

  it("rejects pick() from an empty list", () => {
    expect(() => createRng(1).pick([])).toThrow("pick from empty list");
  });

  it("rejects invalid weighted() inputs", () => {
    const rng = createRng(1);
    expect(() => rng.weighted(["A"], [])).toThrow(
      "weighted: items and weights must be same non-zero length",
    );
    expect(() => rng.weighted(["A", "B"], [1, -1])).toThrow("weighted: negative weight");
  });

  it("falls back to pick() when total weight is zero", () => {
    const weighted = createRng(123);
    const picked = createRng(123);
    expect(weighted.weighted(["A", "B", "C"], [0, 0, 0])).toBe(
      picked.pick(["A", "B", "C"]),
    );
  });

  it("returns the lone item for a single-item weighted choice", () => {
    expect(createRng(5).weighted(["Only"], [0])).toBe("Only");
  });
});
