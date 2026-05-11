import type { BatterCard } from "../../domain/cards.ts";
import type { Coord, Column, Row } from "../../domain/field.ts";
import { COLUMNS, pitcherPositionFor } from "../../domain/field.ts";
import type { Player } from "../../domain/players.ts";
import { renderFieldGrid } from "../components/FieldGrid.ts";
import { renderSpinner } from "../components/Spinner.ts";

export type FieldPhaseProps = {
  humanIsDefense: boolean;
  // The engine clears its `pendingHit` as soon as the depth spin resolves the
  // play, so the screen receives the batter / card it needs as explicit props
  // rather than reading them from the snapshot. This keeps the Resolved
  // screen (with the Continue button) renderable after the play has resolved.
  batter: Player;
  batterCard: BatterCard;
  fielders: readonly Coord[]; // 7 fielders (current placement)
  selectedFielderIndex?: number;
  /** Phase: place fielders -> spin direction -> spin depth -> show landing */
  phase: "Placing" | "AwaitingDirectionSpin" | "SpinningDirection" | "AwaitingDepthSpin" | "SpinningDepth" | "Resolved";
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

  // Direction spinner (A–O)
  const dirSegments = COLUMNS as readonly string[];
  const showDirSpinner = phase !== "Placing";
  const dirSpinning = phase === "SpinningDirection";
  // Determine action overlay for direction spinner
  let dirAction = "";
  if (phase === "AwaitingDirectionSpin") {
    dirAction = humanIsDefense
      ? `<span class="spinner-status">Opponent spinning…</span>`
      : `<button id="spin-direction" class="primary spinner-btn">🎯 Spin</button>`;
  } else if (phase === "SpinningDirection") {
    dirAction = `<span class="spinner-status">Spinning…</span>`;
  }
  const dirSpinner = showDirSpinner
    ? renderSpinner({
        id: "dir-spinner",
        segments: dirSegments,
        result: direction,
        spinning: dirSpinning,
        title: "Direction (A–O)",
        actionHtml: dirAction,
      })
    : "";

  // Depth spinner (1–12)
  const depthSegments = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const showDepthSpinner = phase === "AwaitingDepthSpin" || phase === "SpinningDepth" || phase === "Resolved";
  const depthSpinning = phase === "SpinningDepth";
  // Determine action overlay for depth spinner
  let depthAction = "";
  if (phase === "AwaitingDepthSpin") {
    depthAction = humanIsDefense
      ? `<span class="spinner-status">Opponent spinning…</span>`
      : `<button id="spin-depth" class="primary spinner-btn">🎯 Spin</button>`;
  } else if (phase === "SpinningDepth") {
    depthAction = `<span class="spinner-status">Spinning…</span>`;
  }
  const depthSpinner = showDepthSpinner
    ? renderSpinner({
        id: "depth-spinner",
        segments: depthSegments,
        result: depth != null ? String(depth) : undefined,
        spinning: depthSpinning,
        title: "Depth (1–12)",
        actionHtml: depthAction,
      })
    : "";

  let controls = "";
  if (phase === "Placing") {
    controls = humanIsDefense
      ? `
        <p>Click a fielder (F1–F7), then click a grid cell to move them. Pitcher (P) is auto-placed.</p>
        <button id="confirm-fielders" class="primary">Confirm placement</button>
        <button id="reset-fielders">Reset</button>
      `
      : `<p>Computer is placing fielders…</p>`;
  } else if (phase === "Resolved") {
    controls = `<button id="continue-after-hit" class="primary">Continue</button>`;
  }

  return `
    <section class="field-phase">
      <header class="atbat-header">
        <div>Ball in play! <strong>${batter.name}</strong> (${batter.handedness[0]}HB, ${batter.strength}) — ${batterCard}</div>
      </header>
      <div class="field-layout">
        <div class="field-diamond-area">
          ${grid}
        </div>
        <div class="spinners-area">
          ${dirSpinner || `<div class="spinner-placeholder">Direction<br/>(A–O)</div>`}
          ${depthSpinner || `<div class="spinner-placeholder">Depth<br/>(1–12)</div>`}
        </div>
      </div>
      <div class="outcome-row">
        ${message ? `<div class="outcome">${message}</div>` : ""}
        <div class="actions">${controls}</div>
      </div>
    </section>
  `;
}
