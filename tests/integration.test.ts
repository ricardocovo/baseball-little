import { describe, it, expect } from "vitest";
import { Game } from "../src/engine/GameState.ts";
import { createAi, defaultFielderPlacement } from "../src/ai/Ai.ts";
import { createRng } from "../src/engine/rng.ts";
import {
  createTeam,
  defaultComputerLineup,
  defaultHumanLineup,
} from "../src/domain/players.ts";

describe("integration / full AI-vs-AI game terminates", () => {
  it("plays a complete game without throwing or hanging", () => {
    const home = createTeam("h", "Home", defaultHumanLineup("h"));
    const away = createTeam("a", "Away", defaultComputerLineup("a"));
    const g = new Game();
    g.start({
      format: "Reduced",
      innings: 3,
      teams: { home, away },
      humanSide: "Home",
      seed: 12345,
      firstAtBat: "Away",
    });

    const aiRng = createRng(99);
    const homeAi = createAi(aiRng, "Home");
    const awayAi = createAi(aiRng, "Away");

    let safety = 500;
    while (g.snapshot().status !== "GameOver" && safety-- > 0) {
      const snap = g.snapshot();
      const offSide = g.currentOffense();
      const defSide = g.currentDefense();

      switch (snap.status) {
        case "AwaitingPitch": {
          const offAi = offSide === "Home" ? homeAi : awayAi;
          const defAi = defSide === "Home" ? homeAi : awayAi;
          const aiState = {
            inning: snap.inning,
            inningsConfigured: snap.inningsConfigured,
            half: snap.half,
            outs: snap.outs,
            bases: snap.bases,
            myScore: snap.score[offSide === "Home" ? "home" : "away"],
            opponentScore: snap.score[defSide === "Home" ? "home" : "away"],
          };
          const batterCard = offAi.chooseBatterCard(g.batterHand(), aiState, g.currentBatter());
          const pitcherCard = defAi.choosePitcherCard(g.pitcherHand(), {
            ...aiState,
            myScore: snap.score[defSide === "Home" ? "home" : "away"],
            opponentScore: snap.score[offSide === "Home" ? "home" : "away"],
          }, g.currentBatter());
          g.playCards(batterCard, pitcherCard);
          break;
        }
        case "AwaitingFielding": {
          const defAi = defSide === "Home" ? homeAi : awayAi;
          const placement = defAi.placeFielders(g.currentBatter());
          // If AI returns fewer than 7 (safety in tests), pad with default.
          const all = placement.length === 7
            ? placement
            : defaultFielderPlacement(g.currentBatter().strength, g.currentBatter().handedness);
          g.submitFielders(all);
          break;
        }
        case "AwaitingDirectionSpin":
          g.spinHitDirection();
          break;
        case "AwaitingDepthSpin":
          g.spinHitDepth();
          break;
        default:
          break;
      }
    }

    const final = g.snapshot();
    expect(final.status).toBe("GameOver");
    expect(["InningsCompleted", "HandExhausted"]).toContain(final.gameOverReason);
    // Score should be non-negative integers.
    expect(final.score.home).toBeGreaterThanOrEqual(0);
    expect(final.score.away).toBeGreaterThanOrEqual(0);
  });
});
