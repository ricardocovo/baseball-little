/**
 * Field coordinate system: columns A..O (15 letters) and rows 1..12.
 * Row 1 is the pitcher mound area; row 12 is the fence.
 */

export const COLUMNS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"] as const;
export type Column = (typeof COLUMNS)[number];

export type Row = 1|2|3|4|5|6|7|8|9|10|11|12;

export type Coord = { col: Column; row: Row };

export const COL_INDEX: Record<Column, number> =
  Object.fromEntries(COLUMNS.map((c, i) => [c, i])) as Record<Column, number>;

export function coord(col: Column, row: Row): Coord {
  return { col, row };
}

export function colIndex(c: Column): number {
  return COL_INDEX[c];
}

export function colFromIndex(i: number): Column {
  if (i < 0 || i >= COLUMNS.length) throw new Error(`column index out of range: ${i}`);
  return COLUMNS[i] as Column;
}

/** Chebyshev (king-move) distance between two coordinates. */
export function distance(a: Coord, b: Coord): number {
  const dx = Math.abs(colIndex(a.col) - colIndex(b.col));
  const dy = Math.abs(a.row - b.row);
  return Math.max(dx, dy);
}

export const DEFAULT_ERROR_SQUARE: Coord = { col: "B", row: 3 };

export const OUTFIELD_MIN_ROW: Row = 6;

export const FENCE_ROW: Row = 12;

export function pitcherPositionFor(handedness: "Right" | "Left"): Coord {
  if (handedness === "Right") return { col: "G", row: 1 };
  return { col: "I", row: 1 };
}

export const DEFAULT_PITCHER_POSITION: Coord = { col: "H", row: 1 };

export type HitClassification =
  | { kind: "Out"; by: Coord }
  | { kind: "Single" }
  | { kind: "Double" }
  | { kind: "Triple" }
  | { kind: "HomeRun"; insideThePark: boolean }
  | { kind: "Error" };

/**
 * Classify where a batted ball lands given the defenders' positions
 * (typically 8 fielders + 1 pitcher = 9 entries).
 *
 * Mapping (per .github/prompts/create-game.prompt.md):
 *  - Land on the error square -> Error.
 *  - Land on row 12 (over the fence) -> HomeRun.
 *  - Distance to nearest fielder <= 1 -> Out (3x3 coverage area).
 *  - Distance == 2 -> Single (1 step beyond coverage).
 *  - Distance == 3 -> Double.
 *  - Distance == 4 -> Triple.
 *  - Distance >= 5 -> inside-the-park HR.
 *
 * Note: docs/rules.md contains worked examples that are internally
 * inconsistent with each other (and the rulebook also calls coverage
 * "4 squares around" while listing 9 squares). We follow the prompt's
 * explicit and self-consistent mapping above.
 */
export function classifyLanding(
  landing: Coord,
  fielders: readonly Coord[],
  errorSquare: Coord = DEFAULT_ERROR_SQUARE,
): HitClassification {
  if (landing.col === errorSquare.col && landing.row === errorSquare.row) {
    return { kind: "Error" };
  }
  if (landing.row === FENCE_ROW) {
    return { kind: "HomeRun", insideThePark: false };
  }
  if (fielders.length === 0) {
    return { kind: "HomeRun", insideThePark: true };
  }

  let minDist = Infinity;
  let nearest: Coord = fielders[0] as Coord;
  for (const f of fielders) {
    const d = distance(f, landing);
    if (d < minDist) {
      minDist = d;
      nearest = f;
    }
  }

  if (minDist <= 1) return { kind: "Out", by: nearest };
  if (minDist === 2) return { kind: "Single" };
  if (minDist === 3) return { kind: "Double" };
  if (minDist === 4) return { kind: "Triple" };
  return { kind: "HomeRun", insideThePark: true };
}
