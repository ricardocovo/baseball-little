import type { Coord, Column, Row } from "../../domain/field.ts";
import { COLUMNS, DEFAULT_ERROR_SQUARE, FENCE_ROW } from "../../domain/field.ts";

export type FieldGridProps = {
  fielders: readonly Coord[]; // 7 fielders
  pitcher: Coord;
  landing?: Coord;
  highlightDirection?: Column;
  highlightDepth?: Row;
  /** When true, cells are clickable for placement. */
  editable: boolean;
  /** Index of the fielder currently being moved (for editable mode). */
  selectedFielderIndex?: number;
};

// ── Board geometry ────────────────────────────────────────────────────────────
// The board is a quarter-circle fan: home plate sits at the bottom-right apex,
// the 3rd-base foul line runs straight to the left (column A), the 1st-base
// foul line runs straight up (column O). Columns A..O are 15 equal angular
// slices spanning 90°. Rows 1..12 are 12 concentric annular bands; row 1 is
// nearest home (pitcher-mound depth), row 12 is the outfield fence.
const VIEW = 720;
const HOME_X = 660;
const HOME_Y = 660;
const R_MIN = 36;
const R_MAX = 620;
const NUM_COLS = COLUMNS.length; // 15
const NUM_ROWS = 12;
const ANGLE_START = -Math.PI;     // column A's outer (left) edge
const ANGLE_END = -Math.PI / 2;   // column O's outer (top) edge
const D_ANGLE = (ANGLE_END - ANGLE_START) / NUM_COLS;
const D_RADIUS = (R_MAX - R_MIN) / NUM_ROWS;

const angleAt = (i: number) => ANGLE_START + i * D_ANGLE;
const radiusAt = (j: number) => R_MIN + j * D_RADIUS;
const fmt = (n: number) => n.toFixed(2);
const polar = (r: number, theta: number): [number, number] => [
  HOME_X + r * Math.cos(theta),
  HOME_Y + r * Math.sin(theta),
];

function wedgePath(rIn: number, rOut: number, ciStart: number = 0, ciEnd: number = NUM_COLS): string {
  const thetaL = angleAt(ciStart);
  const thetaR = angleAt(ciEnd);
  const [x1, y1] = polar(rIn, thetaL);
  const [x2, y2] = polar(rIn, thetaR);
  const [x3, y3] = polar(rOut, thetaR);
  const [x4, y4] = polar(rOut, thetaL);
  return (
    `M ${fmt(x1)} ${fmt(y1)} ` +
    `A ${fmt(rIn)} ${fmt(rIn)} 0 0 1 ${fmt(x2)} ${fmt(y2)} ` +
    `L ${fmt(x3)} ${fmt(y3)} ` +
    `A ${fmt(rOut)} ${fmt(rOut)} 0 0 0 ${fmt(x4)} ${fmt(y4)} Z`
  );
}

function cellPath(ci: number, r: number): string {
  return wedgePath(radiusAt(r - 1), radiusAt(r), ci, ci + 1);
}

function cellCenter(ci: number, r: number): [number, number] {
  const theta = (angleAt(ci) + angleAt(ci + 1)) / 2;
  const rad = (radiusAt(r - 1) + radiusAt(r)) / 2;
  return polar(rad, theta);
}

/** Center of a cell in SVG user coordinates (viewBox is 0..720). */
export function getCellCenter(col: Column, row: Row): { x: number; y: number } {
  const ci = COLUMNS.indexOf(col);
  const [x, y] = cellCenter(ci, row);
  return { x, y };
}

/** Home plate position in the same SVG user coordinates. */
export const HOME_PLATE: { readonly x: number; readonly y: number } = {
  x: HOME_X,
  y: HOME_Y,
};

export function renderFieldGrid(props: FieldGridProps): string {
  // 1. Cell wedges (transparent fills; classes drive overlays/strokes).
  const cells: string[] = [];
  for (let r = 1; r <= NUM_ROWS; r++) {
    for (let ci = 0; ci < NUM_COLS; ci++) {
      const col = COLUMNS[ci] as Column;
      const isError = col === DEFAULT_ERROR_SQUARE.col && r === DEFAULT_ERROR_SQUARE.row;
      const isFence = r === FENCE_ROW;
      const isDirH = props.highlightDirection === col;
      const isDepthH = props.highlightDepth === r;
      const fielderIdx = props.fielders.findIndex((f) => f.col === col && f.row === r);
      const isPitcher = props.pitcher.col === col && props.pitcher.row === r;
      const isLanding =
        !!props.landing && props.landing.col === col && props.landing.row === r;
      const classes = [
        "cell",
        isFence ? "fence" : "",
        isError ? "error" : "",
        isDirH ? "dir-h" : "",
        isDepthH ? "depth-h" : "",
        isDirH && isDepthH ? "dir-depth-h" : "",
        fielderIdx >= 0 ? "has-fielder" : "",
        isPitcher ? "has-pitcher" : "",
        isLanding ? "landing" : "",
        props.editable ? "editable" : "",
      ].filter(Boolean).join(" ");
      cells.push(
        `<path class="${classes}" d="${cellPath(ci, r)}" data-col="${col}" data-row="${r}"></path>`,
      );
    }
  }

  // 2. Infield dirt arc (apex out to row 3 outer edge).
  const dirtPath = wedgePath(R_MIN, radiusAt(3));

  // 3. Base-path diamond: home → 1B → 2B → 3B → home (visual flavor only).
  const baseR = radiusAt(2);
  const midTheta = (ANGLE_START + ANGLE_END) / 2;
  const [b1x, b1y] = polar(baseR, ANGLE_END);
  const [b3x, b3y] = polar(baseR, ANGLE_START);
  const [b2x, b2y] = polar(baseR * Math.SQRT2, midTheta);
  const diamondPath =
    `M ${fmt(HOME_X)} ${fmt(HOME_Y)} ` +
    `L ${fmt(b1x)} ${fmt(b1y)} L ${fmt(b2x)} ${fmt(b2y)} L ${fmt(b3x)} ${fmt(b3y)} Z`;

  // 4. Foul lines.
  const [flAx, flAy] = polar(R_MAX, ANGLE_START);
  const [flOx, flOy] = polar(R_MAX, ANGLE_END);
  const foulLines =
    `<line class="foul-line" x1="${fmt(HOME_X)}" y1="${fmt(HOME_Y)}" x2="${fmt(flAx)}" y2="${fmt(flAy)}"/>` +
    `<line class="foul-line" x1="${fmt(HOME_X)}" y1="${fmt(HOME_Y)}" x2="${fmt(flOx)}" y2="${fmt(flOy)}"/>`;

  // 5. Player markers (drawn on top of cells).
  const markers: string[] = [];
  const PR = 10;
  for (let i = 0; i < props.fielders.length; i++) {
    const f = props.fielders[i] as Coord;
    const ci = COLUMNS.indexOf(f.col);
    const [x, y] = cellCenter(ci, f.row);
    const selected = props.selectedFielderIndex === i;
    markers.push(
      `<g class="marker fielder${selected ? " sel" : ""}" transform="translate(${fmt(x)} ${fmt(y)})">` +
        `<circle r="${PR}"/><text dy="0.35em">F${i + 1}</text>` +
      `</g>`,
    );
  }
  {
    const ci = COLUMNS.indexOf(props.pitcher.col);
    const [x, y] = cellCenter(ci, props.pitcher.row);
    markers.push(
      `<g class="marker pitcher" transform="translate(${fmt(x)} ${fmt(y)})">` +
        `<circle r="${PR}"/><text dy="0.35em">P</text>` +
      `</g>`,
    );
  }
  if (props.landing) {
    const ci = COLUMNS.indexOf(props.landing.col);
    const [x, y] = cellCenter(ci, props.landing.row);
    markers.push(
      `<g class="marker landing-marker" transform="translate(${fmt(x)} ${fmt(y)})">` +
        `<circle r="${PR - 1}"/>` +
      `</g>`,
    );
  }

  // 6. Axis labels: columns along the outer arc, rows along the 1B foul line.
  const labels: string[] = [];
  for (let ci = 0; ci < NUM_COLS; ci++) {
    const theta = (angleAt(ci) + angleAt(ci + 1)) / 2;
    const [lx, ly] = polar(R_MAX + 18, theta);
    const rot = (theta * 180) / Math.PI + 90;
    labels.push(
      `<text class="axis col" x="${fmt(lx)}" y="${fmt(ly)}" transform="rotate(${fmt(rot)} ${fmt(lx)} ${fmt(ly)})">${COLUMNS[ci]}</text>`,
    );
  }
  for (let r = 1; r <= NUM_ROWS; r++) {
    const rad = (radiusAt(r - 1) + radiusAt(r)) / 2;
    const [lx, ly] = polar(rad, ANGLE_END - 0.04); // just inside 1B line
    labels.push(`<text class="axis row" x="${fmt(lx)}" y="${fmt(ly)}">${r}</text>`);
  }

  return (
    `<div class="field-board">` +
      `<svg class="field-svg" viewBox="0 0 ${VIEW} ${VIEW}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">` +
        `<rect class="board-bg" x="0" y="0" width="${VIEW}" height="${VIEW}"/>` +
        `<path class="grass" d="${wedgePath(R_MIN, R_MAX)}"/>` +
        `<path class="warning-track" d="${wedgePath(radiusAt(NUM_ROWS - 1), R_MAX)}"/>` +
        `<path class="infield-dirt" d="${dirtPath}"/>` +
        `<path class="diamond" d="${diamondPath}"/>` +
        foulLines +
        `<g class="cells">${cells.join("")}</g>` +
        `<g class="markers">${markers.join("")}</g>` +
        `<g class="axis-labels">${labels.join("")}</g>` +
        `<circle class="home-plate" cx="${fmt(HOME_X)}" cy="${fmt(HOME_Y)}" r="9"/>` +
      `</svg>` +
    `</div>`
  );
}
