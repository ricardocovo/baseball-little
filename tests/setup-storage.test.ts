// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultSetupValues } from "../src/ui/screens/Setup.ts";
import {
  STORAGE_KEY,
  loadSetupValues,
  saveSetupValues,
} from "../src/ui/screens/setupStorage.ts";

describe("setupStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("returns defaults when nothing is stored", () => {
    expect(loadSetupValues()).toEqual(defaultSetupValues());
  });

  it("round-trips a saved value", () => {
    const values = defaultSetupValues();
    values.format = "Classic";
    values.innings = 6;
    values.humanTeamName = "My Sluggers";
    values.computerTeamName = "Foes";
    values.humanLineup[0] = {
      ...values.humanLineup[0]!,
      name: "Custom",
      strength: "Heavy",
      handedness: "Left",
    };
    saveSetupValues(values);
    expect(loadSetupValues()).toEqual(values);
  });

  it("returns defaults when stored JSON is malformed", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadSetupValues()).toEqual(defaultSetupValues());
  });

  it("falls back per-field when individual fields are invalid", () => {
    const defaults = defaultSetupValues();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        format: "Bogus",
        innings: 4,
        humanTeamName: 42,
        computerTeamName: "Keep Me",
        humanLineup: defaults.humanLineup,
        computerLineup: defaults.computerLineup,
      }),
    );
    const loaded = loadSetupValues();
    expect(loaded.format).toBe(defaults.format);
    expect(loaded.innings).toBe(defaults.innings);
    expect(loaded.humanTeamName).toBe(defaults.humanTeamName);
    expect(loaded.computerTeamName).toBe("Keep Me");
    expect(loaded.humanLineup).toEqual(defaults.humanLineup);
  });

  it("falls back to default lineup when length or member is invalid", () => {
    const defaults = defaultSetupValues();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaults,
        humanLineup: defaults.humanLineup.slice(0, 5),
        computerLineup: defaults.computerLineup.map((p, i) =>
          i === 0 ? { ...p, strength: "Ultra" } : p,
        ),
      }),
    );
    const loaded = loadSetupValues();
    expect(loaded.humanLineup).toEqual(defaults.humanLineup);
    expect(loaded.computerLineup).toEqual(defaults.computerLineup);
  });

  it("returns defaults when stored value is not an object", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify("not an object"));
    expect(loadSetupValues()).toEqual(defaultSetupValues());
  });
});
