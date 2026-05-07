import { describe, it, expect } from "vitest";
import {
  EMPTY_BASES,
  applyWalk,
  advanceAllBy,
  applySacrifice,
} from "../src/engine/runners.ts";
import type { Player } from "../src/domain/players.ts";

const p = (id: string): Player => ({
  id,
  name: id,
  strength: "Medium",
  handedness: "Right",
});

describe("runners / applyWalk", () => {
  it("places batter on 1B, no runners advance with empty bases", () => {
    const r = applyWalk(EMPTY_BASES, p("B"));
    expect(r.bases.first?.id).toBe("B");
    expect(r.runs).toBe(0);
  });

  it("only forces consecutive runners", () => {
    const r = applyWalk({ first: p("X"), second: null, third: p("Z") }, p("B"));
    expect(r.bases.first?.id).toBe("B");
    expect(r.bases.second?.id).toBe("X");
    expect(r.bases.third?.id).toBe("Z"); // 3B not forced (no runner on 2B)
    expect(r.runs).toBe(0);
  });

  it("scores run when bases loaded", () => {
    const r = applyWalk({ first: p("A"), second: p("B"), third: p("C") }, p("D"));
    expect(r.runs).toBe(1);
    expect(r.scorers[0]?.id).toBe("C");
    expect(r.bases.first?.id).toBe("D");
    expect(r.bases.second?.id).toBe("A");
    expect(r.bases.third?.id).toBe("B");
  });
});

describe("runners / advanceAllBy", () => {
  it("single: batter to 1B, runners advance 1", () => {
    const r = advanceAllBy({ first: p("A"), second: null, third: p("C") }, p("B"), 1, "First");
    expect(r.bases.first?.id).toBe("B");
    expect(r.bases.second?.id).toBe("A");
    expect(r.runs).toBe(1); // C scored
    expect(r.scorers[0]?.id).toBe("C");
  });

  it("home run with bases loaded: 4 runs, bases empty", () => {
    const r = advanceAllBy(
      { first: p("A"), second: p("B"), third: p("C") },
      p("D"),
      4,
      "Home",
    );
    expect(r.runs).toBe(4);
    expect(r.bases.first).toBeNull();
    expect(r.bases.second).toBeNull();
    expect(r.bases.third).toBeNull();
  });
});

describe("runners / applySacrifice", () => {
  it("advances all runners by 1, batter not placed", () => {
    const r = applySacrifice({ first: p("A"), second: p("B"), third: null });
    expect(r.bases.first).toBeNull();
    expect(r.bases.second?.id).toBe("A");
    expect(r.bases.third?.id).toBe("B");
    expect(r.runs).toBe(0);
  });

  it("scores from 3rd", () => {
    const r = applySacrifice({ first: null, second: null, third: p("Z") });
    expect(r.runs).toBe(1);
    expect(r.scorers[0]?.id).toBe("Z");
  });
});
