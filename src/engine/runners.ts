import type { Player } from "../domain/players.ts";
import type { BaseLabel } from "./events.ts";

export type Bases = {
  first: Player | null;
  second: Player | null;
  third: Player | null;
};

export const EMPTY_BASES: Bases = { first: null, second: null, third: null };

export type AdvanceResult = {
  bases: Bases;
  runs: number;
  scorers: Player[];
  /** Granular per-runner movements for the UI (does not include batter). */
  movements: Array<{ runner: Player; from: BaseLabel; to: BaseLabel | "Home" }>;
};

export function runnersOnBase(bases: Bases): Player[] {
  return [bases.first, bases.second, bases.third].filter((p): p is Player => p !== null);
}

export function leadRunner(bases: Bases): { player: Player; base: BaseLabel } | null {
  if (bases.third) return { player: bases.third, base: "Third" };
  if (bases.second) return { player: bases.second, base: "Second" };
  if (bases.first) return { player: bases.first, base: "First" };
  return null;
}

/**
 * Advance every runner on base by a fixed number of bases. The batter is
 * placed on `batterToBase` (or scores if "Home"). Used for hits and steals.
 */
export function advanceAllBy(
  bases: Bases,
  batter: Player | null,
  basesAdvanced: number,
  batterToBase: BaseLabel | "Home",
): AdvanceResult {
  const next: Bases = { first: null, second: null, third: null };
  const movements: AdvanceResult["movements"] = [];
  let runs = 0;
  const scorers: Player[] = [];

  const place = (runner: Player, from: BaseLabel, target: number) => {
    // target 1=1B, 2=2B, 3=3B, 4+ = Home
    const dest: BaseLabel | "Home" = target >= 4 ? "Home" : ((["First","Second","Third"] as const)[target - 1] as BaseLabel);
    movements.push({ runner, from, to: dest });
    if (dest === "Home") {
      runs++;
      scorers.push(runner);
    } else if (dest === "First") next.first = runner;
    else if (dest === "Second") next.second = runner;
    else next.third = runner;
  };

  if (bases.third) place(bases.third, "Third", 3 + basesAdvanced);
  if (bases.second) place(bases.second, "Second", 2 + basesAdvanced);
  if (bases.first) place(bases.first, "First", 1 + basesAdvanced);

  if (batter) {
    if (batterToBase === "Home") {
      runs++;
      scorers.push(batter);
    } else if (batterToBase === "First") next.first = batter;
    else if (batterToBase === "Second") next.second = batter;
    else next.third = batter;
  }

  return { bases: next, runs, scorers, movements };
}

/**
 * Walk: batter to 1B, runners advance only when forced.
 */
export function applyWalk(bases: Bases, batter: Player): AdvanceResult {
  const next: Bases = { ...bases };
  const movements: AdvanceResult["movements"] = [];
  let runs = 0;
  const scorers: Player[] = [];

  // Walk forces only consecutive runners starting from 1B.
  if (next.first) {
    if (next.second) {
      if (next.third) {
        // bases loaded -> 3B scores
        runs++;
        scorers.push(next.third);
        movements.push({ runner: next.third, from: "Third", to: "Home" });
      }
      // 2B forced to 3B
      movements.push({ runner: next.second, from: "Second", to: "Third" });
      next.third = next.second;
    }
    // 1B forced to 2B
    movements.push({ runner: next.first, from: "First", to: "Second" });
    next.second = next.first;
  }
  next.first = batter;

  return { bases: next, runs, scorers, movements };
}

/**
 * Sacrifice success: batter out, every runner advances 1.
 */
export function applySacrifice(bases: Bases): AdvanceResult {
  return advanceAllBy(bases, null, 1, "First" /* unused; batter is null */);
}
