import { describe, it, expect } from "vitest";
import {
  batterAt,
  countByStrength,
  createTeam,
  defaultComputerLineup,
  defaultHumanLineup,
  validateStrengthComposition,
  type Player,
} from "../src/domain/players.ts";

describe("players / team", () => {
  it("requires exactly 9 players", () => {
    expect(() => createTeam("t1", "Tigers", [])).toThrow();
  });

  it("rotates batting order via batterAt index", () => {
    const team = createTeam("t1", "Tigers", defaultHumanLineup("h"));
    expect(batterAt(team, 0).id).toBe("h-0");
    expect(batterAt(team, 8).id).toBe("h-8");
    expect(batterAt(team, 9).id).toBe("h-0");
    expect(batterAt(team, 17).id).toBe("h-8");
    expect(batterAt(team, -1).id).toBe("h-8");
  });
});

describe("strength composition validation", () => {
  it("default human lineup has 3/3/3 and is valid", () => {
    const lineup = defaultHumanLineup("h");
    expect(countByStrength(lineup)).toEqual({ Light: 3, Medium: 3, Heavy: 3 });
    expect(validateStrengthComposition(lineup).valid).toBe(true);
  });

  it("default computer lineup has 3/3/3 and is valid", () => {
    const lineup = defaultComputerLineup("c");
    expect(countByStrength(lineup)).toEqual({ Light: 3, Medium: 3, Heavy: 3 });
    expect(validateStrengthComposition(lineup).valid).toBe(true);
  });

  it("rejects lineups with the wrong distribution and reports counts", () => {
    // Default human lineup is 3/3/3. Flip one Heavy (index 2) to Light to
    // make a 4 Light / 3 Medium / 2 Heavy distribution.
    const swapped = defaultHumanLineup("h").map((p, i): Player =>
      i === 2 ? { ...p, strength: "Light" } : p,
    );
    const result = validateStrengthComposition(swapped);
    expect(result.valid).toBe(false);
    expect(result.counts).toEqual({ Light: 4, Medium: 3, Heavy: 2 });
  });
});
