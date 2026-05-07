import { describe, it, expect } from "vitest";
import { batterAt, createTeam, defaultHumanLineup } from "../src/domain/players.ts";

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
