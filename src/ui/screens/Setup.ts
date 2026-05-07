import type { DeckFormat } from "../../domain/cards.ts";
import type { Handedness, Player, Strength } from "../../domain/players.ts";
import {
  defaultComputerLineup,
  defaultHumanLineup,
} from "../../domain/players.ts";

export type SetupValues = {
  format: DeckFormat;
  innings: 3 | 6 | 9;
  humanTeamName: string;
  computerTeamName: string;
  humanLineup: Player[];
  computerLineup: Player[];
};

export function defaultSetupValues(): SetupValues {
  return {
    format: "Reduced",
    innings: 3,
    humanTeamName: "Sluggers",
    computerTeamName: "Rivals",
    humanLineup: defaultHumanLineup("h"),
    computerLineup: defaultComputerLineup("c"),
  };
}

export function renderSetup(values: SetupValues): string {
  const strengthOpts = ["Light", "Medium", "Heavy"] as const;
  const handedOpts = ["Right", "Left"] as const;
  const lineupRows = (lineup: Player[], side: "human" | "computer") =>
    lineup
      .map((p, i) => `
        <tr>
          <td>${i + 1}.</td>
          <td><input class="name" data-side="${side}" data-i="${i}" value="${escapeAttr(p.name)}" /></td>
          <td>
            <select class="strength" data-side="${side}" data-i="${i}">
              ${strengthOpts.map((s) => `<option value="${s}" ${s === p.strength ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </td>
          <td>
            <select class="handed" data-side="${side}" data-i="${i}">
              ${handedOpts.map((h) => `<option value="${h}" ${h === p.handedness ? "selected" : ""}>${h}</option>`).join("")}
            </select>
          </td>
        </tr>
      `)
      .join("");

  return `
    <section class="setup">
      <h2>Game Setup</h2>
      <div class="form-row">
        <label>Format
          <select id="format">
            <option value="Reduced" ${values.format === "Reduced" ? "selected" : ""}>Reduced (12 / 12)</option>
            <option value="Classic" ${values.format === "Classic" ? "selected" : ""}>Classic (16 / 12)</option>
          </select>
        </label>
        <label>Innings
          <select id="innings">
            <option value="3" ${values.innings === 3 ? "selected" : ""}>3</option>
            <option value="6" ${values.innings === 6 ? "selected" : ""}>6</option>
            <option value="9" ${values.innings === 9 ? "selected" : ""}>9</option>
          </select>
        </label>
      </div>

      <div class="lineups">
        <div class="lineup">
          <h3>Your team
            <input id="humanTeamName" value="${escapeAttr(values.humanTeamName)}" />
          </h3>
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Strength</th><th>Handed</th></tr></thead>
            <tbody>${lineupRows(values.humanLineup, "human")}</tbody>
          </table>
        </div>
        <div class="lineup">
          <h3>Computer team
            <input id="computerTeamName" value="${escapeAttr(values.computerTeamName)}" />
          </h3>
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Strength</th><th>Handed</th></tr></thead>
            <tbody>${lineupRows(values.computerLineup, "computer")}</tbody>
          </table>
        </div>
      </div>

      <div class="actions">
        <button id="start" class="primary">Play ball ⚾</button>
      </div>
    </section>
  `;
}

export function readSetup(root: HTMLElement, current: SetupValues): SetupValues {
  const format = (root.querySelector<HTMLSelectElement>("#format")?.value ?? current.format) as DeckFormat;
  const innings = Number(root.querySelector<HTMLSelectElement>("#innings")?.value ?? current.innings) as 3 | 6 | 9;
  const humanTeamName = root.querySelector<HTMLInputElement>("#humanTeamName")?.value ?? current.humanTeamName;
  const computerTeamName = root.querySelector<HTMLInputElement>("#computerTeamName")?.value ?? current.computerTeamName;
  const readSide = (side: "human" | "computer", base: Player[]): Player[] => {
    return base.map((p, i) => {
      const name = root.querySelector<HTMLInputElement>(`.name[data-side="${side}"][data-i="${i}"]`)?.value ?? p.name;
      const strength = (root.querySelector<HTMLSelectElement>(`.strength[data-side="${side}"][data-i="${i}"]`)?.value ?? p.strength) as Strength;
      const handedness = (root.querySelector<HTMLSelectElement>(`.handed[data-side="${side}"][data-i="${i}"]`)?.value ?? p.handedness) as Handedness;
      return { ...p, name, strength, handedness };
    });
  };
  return {
    format,
    innings,
    humanTeamName,
    computerTeamName,
    humanLineup: readSide("human", current.humanLineup),
    computerLineup: readSide("computer", current.computerLineup),
  };
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}
