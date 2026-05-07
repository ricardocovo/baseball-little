import type { Rng } from "../engine/rng.ts";
import type { Strength, Handedness } from "./players.ts";
import type { Column, Row } from "./field.ts";
import { COLUMNS } from "./field.ts";

/**
 * Direction spinner: returns a column A..O. Right-handed batters pull
 * toward the A side; left-handed batters pull toward the O side.
 * Triangular weighting around a "pull" centroid.
 */
export function spinDirection(rng: Rng, handedness: Handedness): Column {
  const centroid = handedness === "Right" ? 4 : 10;
  const weights: number[] = COLUMNS.map((_, i) => {
    const dist = Math.abs(i - centroid);
    return Math.max(1, 8 - dist);
  });
  return rng.weighted(COLUMNS, weights);
}

/** Depth spinner: returns a row 1..12 biased by Strength. */
export function spinDepth(rng: Rng, strength: Strength): Row {
  const rows: Row[] = [1,2,3,4,5,6,7,8,9,10,11,12];
  const centroid = strength === "Light" ? 4 : strength === "Medium" ? 6 : 9;
  const spread = strength === "Heavy" ? 4 : 3;
  const weights = rows.map((r) => {
    const dist = Math.abs(r - centroid);
    return Math.max(1, spread + 4 - dist);
  });
  return rng.weighted(rows, weights);
}

/** Field stolen-base attempt; true = safe. */
export function spinFieldSteal(rng: Rng): boolean {
  return rng.next() < 0.45;
}

/** Sacrifice-fly tag-up minimum depth thresholds per target base. */
export const TAG_UP_DEPTH: Record<"Second" | "Third" | "Home", Row> = {
  Second: 6,
  Third: 7,
  Home: 9,
};
