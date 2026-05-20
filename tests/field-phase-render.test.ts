import { describe, it, expect } from "vitest";
import { renderFieldPhase } from "../src/ui/screens/FieldPhase.ts";
import { defaultFielderPlacement } from "../src/ai/Ai.ts";
import type { Player } from "../src/domain/players.ts";

const batter: Player = {
  id: "b1",
  name: "Test Batter",
  strength: "Medium",
  handedness: "Right",
};

const fielders = defaultFielderPlacement("Medium", "Right");

describe("FieldPhase render", () => {
  it("shows the Continue button after the play resolves (Resolved phase)", () => {
    // Regression: previously the renderer required snap.pendingHit, but the
    // engine clears pendingHit as soon as the depth spin runs. The Resolved
    // screen must remain renderable without it so the user can advance.
    const html = renderFieldPhase({
      humanIsDefense: true,
      batter,
      batterCard: "HighSwing",
      fielders,
      phase: "Resolved",
      direction: "G",
      depth: 5,
      landing: { col: "G", row: 5 },
      message: "Out (Caught).",
    });
    expect(html).toContain('id="continue-after-hit"');
    expect(html).toContain("Continue");
    expect(html).toContain("Out (Caught).");
  });

  it("shows the Confirm placement button when human is defense and Placing", () => {
    const html = renderFieldPhase({
      humanIsDefense: true,
      batter,
      batterCard: "FlatSwing",
      fielders,
      phase: "Placing",
    });
    expect(html).toContain('id="confirm-fielders"');
    expect(html).toContain('id="reset-fielders"');
  });

  it("shows spin-direction button when human is offense and AwaitingDirectionSpin", () => {
    const html = renderFieldPhase({
      humanIsDefense: false,
      batter,
      batterCard: "FlatSwing",
      fielders,
      phase: "AwaitingDirectionSpin",
    });
    expect(html).toContain('id="spin-direction"');
  });
});
