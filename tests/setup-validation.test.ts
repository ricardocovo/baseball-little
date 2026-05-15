import { describe, it, expect } from "vitest";
import { validateStrengthComposition, type Player } from "../src/domain/players.ts";
import {
  compositionErrorsFor,
  defaultSetupValues,
  formatCompositionError,
  isSetupValid,
  renderSetup,
} from "../src/ui/screens/Setup.ts";

function withInvalidHuman() {
  const values = defaultSetupValues();
  values.humanLineup = values.humanLineup.map((p, i): Player =>
    i === 2 ? { ...p, strength: "Light" } : p,
  );
  return values;
}

describe("setup composition validation", () => {
  it("default setup is valid", () => {
    const values = defaultSetupValues();
    expect(isSetupValid(values)).toBe(true);
    expect(compositionErrorsFor(values)).toEqual([]);
  });

  it("formats a clear error string with current counts", () => {
    const values = withInvalidHuman();
    const result = validateStrengthComposition(values.humanLineup);
    const msg = formatCompositionError(values.humanTeamName, result);
    expect(msg).toContain(values.humanTeamName);
    expect(msg).toContain("3 Light");
    expect(msg).toContain("4 Light");
    expect(msg).toContain("2 Heavy");
  });

  it("renderSetup disables Play ball and shows error when invalid", () => {
    const values = withInvalidHuman();
    const html = renderSetup(values);
    expect(html).toMatch(/<button id="start"[^>]*\sdisabled/);
    expect(html).toContain('id="composition-errors"');
    expect(html).toContain(values.humanTeamName);
  });

  it("renderSetup leaves Play ball enabled when valid", () => {
    const html = renderSetup(defaultSetupValues());
    expect(html).toMatch(/<button id="start" class="primary">Play ball/);
    expect(html).not.toContain('id="composition-errors"');
  });
});
