import type { BatterCard } from "../../domain/cards.ts";
import type { Coord, Column, Row } from "../../domain/field.ts";
import { pitcherPositionFor } from "../../domain/field.ts";
import type { Player } from "../../domain/players.ts";
import { renderFieldGrid } from "../components/FieldGrid.ts";

export type FieldPhaseProps = {
  humanIsDefense: boolean;
  // The engine clears its `pendingHit` as soon as the depth spin resolves the
  // play, so the screen receives the batter / card it needs as explicit props
  // rather than reading them from the snapshot. This keeps the Resolved
  // screen (with the Continue button) renderable after the play has resolved.
  batter: Player;
  batterCard: BatterCard;
  fielders: readonly Coord[]; // 8 fielders (current placement)
  selectedFielderIndex?: number;
  /** Phase: place fielders -> spin direction -> spin depth -> show landing */
  phase: "Placing" | "AwaitingDirectionSpin" | "AwaitingDepthSpin" | "Resolved";
  direction?: Column;
  depth?: Row;
  landing?: Coord;
  message?: string;
};

export function renderFieldPhase(props: FieldPhaseProps): string {
  const { humanIsDefense, batter, batterCard, fielders, selectedFielderIndex, phase, direction, depth, landing, message } = props;
  const pitcher = pitcherPositionFor(batter.handedness);

  const grid = renderFieldGrid({
    fielders,
    pitcher,
    landing,
    highlightDirection: direction,
    highlightDepth: depth,
    editable: humanIsDefense && phase === "Placing",
    selectedFielderIndex,
  });

  let controls = "";
  if (phase === "Placing") {
    controls = humanIsDefense
      ? `
        <p>Click a fielder (F1–F8), then click a grid cell to move them. Pitcher (P) is auto-placed.</p>
        <button id="confirm-fielders" class="primary">Confirm placement</button>
        <button id="reset-fielders">Reset</button>
      `
      : `<p>Computer is placing fielders…</p>`;
  } else if (phase === "AwaitingDirectionSpin") {
    controls = humanIsDefense
      ? `<p>Computer is spinning direction…</p>`
      : `<button id="spin-direction" class="primary">Spin direction</button>`;
  } else if (phase === "AwaitingDepthSpin") {
    controls = humanIsDefense
      ? `<p>Computer is spinning depth…</p>`
      : `<button id="spin-depth" class="primary">Spin depth</button>`;
  } else if (phase === "Resolved") {
    controls = `<button id="continue-after-hit" class="primary">Continue</button>`;
  }

  return `
    <section class="field-phase">
      <header class="atbat-header">
        <div>Ball in play! <strong>${batter.name}</strong> (${batter.handedness[0]}HB, ${batter.strength}) — ${batterCard}</div>
      </header>
      ${grid}
      ${message ? `<div class="outcome">${message}</div>` : ""}
      <div class="actions">${controls}</div>
    </section>
  `;
}
