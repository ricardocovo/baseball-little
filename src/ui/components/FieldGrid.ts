import type { Coord, Column, Row } from "../../domain/field.ts";
import { COLUMNS, DEFAULT_ERROR_SQUARE, FENCE_ROW } from "../../domain/field.ts";

export type FieldGridProps = {
  fielders: readonly Coord[]; // 8 fielders
  pitcher: Coord;
  landing?: Coord;
  highlightDirection?: Column;
  highlightDepth?: Row;
  /** When true, cells are clickable for placement. */
  editable: boolean;
  /** Index of the fielder currently being moved (for editable mode). */
  selectedFielderIndex?: number;
};

export function renderFieldGrid(props: FieldGridProps): string {
  const cells: string[] = [];
  // Build row 12 (HR/fence) at the top, row 1 (mound) at the bottom.
  for (let r = FENCE_ROW; r >= 1; r--) {
    const rowCells: string[] = [];
    for (const col of COLUMNS) {
      const isError = col === DEFAULT_ERROR_SQUARE.col && r === DEFAULT_ERROR_SQUARE.row;
      const isFence = r === FENCE_ROW;
      const fielderIdx = props.fielders.findIndex((f) => f.col === col && f.row === r);
      const isPitcher = props.pitcher.col === col && props.pitcher.row === r;
      const isLanding = props.landing && props.landing.col === col && props.landing.row === r;
      const isDirHighlight = props.highlightDirection === col;
      const isDepthHighlight = props.highlightDepth === r;
      const classes = [
        "cell",
        isError ? "error" : "",
        isFence ? "fence" : "",
        fielderIdx >= 0 ? "fielder" : "",
        isPitcher ? "pitcher" : "",
        isLanding ? "landing" : "",
        isDirHighlight ? "dir-h" : "",
        isDepthHighlight ? "depth-h" : "",
        props.editable ? "editable" : "",
        props.selectedFielderIndex === fielderIdx && fielderIdx >= 0 ? "sel" : "",
      ].filter(Boolean).join(" ");
      const data = `data-col="${col}" data-row="${r}"`;
      const label = isPitcher ? "P" : fielderIdx >= 0 ? `F${fielderIdx + 1}` : isLanding ? "•" : "";
      const inner = label ? `<span class="cell-label">${label}</span>` : "";
      rowCells.push(`<div class="${classes}" ${data}>${inner}</div>`);
    }
    cells.push(`<div class="grid-row" data-row="${r}">${rowCells.join("")}</div>`);
  }
  return `<div class="field-grid">${cells.join("")}</div>`;
}
