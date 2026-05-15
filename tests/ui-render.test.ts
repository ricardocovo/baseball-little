// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createTeam, defaultComputerLineup, defaultHumanLineup } from "../src/domain/players.ts";
import type { GameSnapshot } from "../src/engine/GameState.ts";
import { renderEventLog } from "../src/ui/components/EventLog.ts";
import { renderScoreboard } from "../src/ui/components/Scoreboard.ts";
import { renderCardHand, renderCardPhase } from "../src/ui/screens/CardPhase.ts";
import { getCardImageSrc } from "../src/ui/assets/cardImages.ts";
import { defaultSetupValues, readSetup, renderSetup } from "../src/ui/screens/Setup.ts";

function makeSnapshot(): GameSnapshot {
  const [runner] = defaultHumanLineup("r");
  if (!runner) throw new Error("Expected lineup runner");
  return {
    status: "AwaitingPitch",
    format: "Reduced",
    inningsConfigured: 3,
    inning: 2,
    half: "Top",
    outs: 1,
    bases: { first: runner, second: null, third: null },
    score: { home: 2, away: 3 },
    lineScore: { home: [1], away: [2] },
    battingIndex: { home: 0, away: 1 },
    decks: {
      home: { batter: ["HighSwing", "HighSwing", "Box"], pitcher: ["FastHigh", "NoPitch"] },
      away: { batter: ["LowSwing", "HitAndRun"], pitcher: ["FastLow", "FastInside"] },
    },
    teams: {
      home: createTeam("h", "Home <Heroes>", defaultHumanLineup("h")),
      away: createTeam("a", "Away & Co", defaultComputerLineup("a")),
    },
    humanSide: "Home",
    firstAtBat: "Away",
  };
}

describe("UI render helpers", () => {
  it("escapes team names and highlights the current inning in the scoreboard", () => {
    const snap = makeSnapshot();

    const scoreboard = renderScoreboard(snap);
    expect(scoreboard).toContain("Away &amp; Co");
    expect(scoreboard).toContain("Home &lt;Heroes&gt;");
    expect(scoreboard).toContain('<th class="current">2</th>');
    expect(scoreboard).toContain('<td class="current">-</td>');
    expect((scoreboard.match(/⚾/g) ?? []).length).toBe(1);

    const topHalfAwayRow = scoreboard.match(/<tr><td class="team-cell">([^<]|<(?!\/td>))*Away &amp; Co<\/td>/);
    const topHalfHomeRow = scoreboard.match(/<tr><td class="team-cell">([^<]|<(?!\/td>))*Home &lt;Heroes&gt;<\/td>/);

    expect(topHalfAwayRow?.[0] ?? "").not.toContain("⚾");
    expect(topHalfHomeRow?.[0] ?? "").toContain("⚾");
  });

  it("escapes rendered event log text", () => {
    const html = renderEventLog([
      {
        type: "AtBatStarted",
        offense: "Away",
        batter: {
          id: "b1",
          name: "<Slugger>",
          strength: "Heavy",
          handedness: "Left",
        },
      },
    ]);

    expect(html).toContain("&lt;Slugger&gt;");
    expect(html).not.toContain("<Slugger>");
  });

  it("reads setup values back out of the DOM", () => {
    const values = defaultSetupValues();
    const root = document.createElement("div");
    root.innerHTML = renderSetup(values);

    const format = root.querySelector("#format");
    const innings = root.querySelector("#innings");
    const humanTeamName = root.querySelector("#humanTeamName");
    const firstHuman = root.querySelector('.name[data-side="human"][data-i="0"]');
    const firstComputerHand = root.querySelector('.handed[data-side="computer"][data-i="0"]');

    if (
      !(format instanceof HTMLSelectElement) ||
      !(innings instanceof HTMLSelectElement) ||
      !(humanTeamName instanceof HTMLInputElement) ||
      !(firstHuman instanceof HTMLInputElement) ||
      !(firstComputerHand instanceof HTMLSelectElement)
    ) {
      throw new Error("Expected setup form controls");
    }

    format.value = "Classic";
    innings.value = "9";
    humanTeamName.value = "Updated Sluggers";
    firstHuman.value = "Lead Off";
    firstComputerHand.value = "Left";

    const read = readSetup(root, values);
    expect(read.format).toBe("Classic");
    expect(read.innings).toBe(9);
    expect(read.humanTeamName).toBe("Updated Sluggers");
    expect(read.humanLineup[0]?.name).toBe("Lead Off");
    expect(read.computerLineup[0]?.handedness).toBe("Left");
  });

  it("renders revealed card phases with outcome text and a continue button", () => {
    const html = renderCardPhase({
      snap: makeSnapshot(),
      humanRole: "batter",
      humanSelection: "HighSwing",
      aiSelection: "FastHigh",
      revealed: true,
      aiThinking: false,
      outcomeMessage: "Ball in play!",
    });

    expect(html).toContain('id="continue"');
    expect(html).toContain("Ball in play!");
    expect(html).toContain("High Swing");
    expect(html).toContain("High Fastball");
    expect(html).toContain(getCardImageSrc("high-swing.png"));
    expect(html).toContain(getCardImageSrc("high-fastball.png"));
  });

  it("groups duplicate cards in the hand and hides the hand once revealed", () => {
    const snap = makeSnapshot();
    const hidden = renderCardHand({
      snap,
      humanRole: "batter",
      humanSelection: "HighSwing",
      aiSelection: "FastHigh",
      revealed: false,
      aiThinking: false,
    });

    expect(hidden).toContain("Your hand (batter)");
    expect(hidden).toContain("×2");
    expect(hidden).toContain(getCardImageSrc("high-swing.png"));
    expect(hidden).toContain(getCardImageSrc("box.png"));
    expect(renderCardHand({
      snap,
      humanRole: "batter",
      humanSelection: "HighSwing",
      aiSelection: "FastHigh",
      revealed: true,
      aiThinking: false,
    })).toBe("");
  });
});
