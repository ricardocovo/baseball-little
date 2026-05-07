import { describe, it, expect } from "vitest";
import {
  classifyLanding,
  distance,
  coord,
  DEFAULT_ERROR_SQUARE,
} from "../src/domain/field.ts";

describe("field / distance", () => {
  it("Chebyshev distance counts diagonals as 1", () => {
    expect(distance(coord("C", 7), coord("A", 10))).toBe(3); // dx=2, dy=3 -> 3
    expect(distance(coord("C", 7), coord("A", 11))).toBe(4);
    expect(distance(coord("D", 7), coord("A", 11))).toBe(4);
    expect(distance(coord("H", 1), coord("H", 1))).toBe(0);
  });
});

describe("field / classifyLanding", () => {
  const fielder = coord("C", 8);

  it("Out when distance <= 1 from any fielder", () => {
    for (const c of ["B","C","D"] as const) {
      for (const r of [7,8,9] as const) {
        const out = classifyLanding(coord(c, r), [fielder]);
        expect(out.kind).toBe("Out");
      }
    }
  });

  it("Single at distance 2", () => {
    expect(classifyLanding(coord("E", 8), [fielder]).kind).toBe("Single");
  });
  it("Double at distance 3", () => {
    expect(classifyLanding(coord("F", 8), [fielder]).kind).toBe("Double");
  });
  it("Triple at distance 4", () => {
    expect(classifyLanding(coord("G", 8), [fielder]).kind).toBe("Triple");
  });
  it("Inside-the-park HR at distance >= 5", () => {
    const cls = classifyLanding(coord("H", 8), [fielder]);
    expect(cls.kind).toBe("HomeRun");
    if (cls.kind === "HomeRun") expect(cls.insideThePark).toBe(true);
  });

  it("Over the fence (row 12) is always HR even if a fielder is adjacent", () => {
    const fenceFielder = coord("H", 11);
    const cls = classifyLanding(coord("H", 12), [fenceFielder]);
    expect(cls.kind).toBe("HomeRun");
    if (cls.kind === "HomeRun") expect(cls.insideThePark).toBe(false);
  });

  it("Error square returns Error", () => {
    const cls = classifyLanding(DEFAULT_ERROR_SQUARE, [fielder]);
    expect(cls.kind).toBe("Error");
  });
});
