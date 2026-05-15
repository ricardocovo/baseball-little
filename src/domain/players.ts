export type Strength = "Light" | "Medium" | "Heavy";
export type Handedness = "Right" | "Left";

export type Player = {
  id: string;
  name: string;
  strength: Strength;
  handedness: Handedness;
};

export type TeamSide = "Home" | "Away";

export type Team = {
  id: string;
  name: string;
  /** Exactly 9 players, in batting order. */
  lineup: readonly Player[];
};

export function createTeam(id: string, name: string, lineup: readonly Player[]): Team {
  if (lineup.length !== 9) {
    throw new Error(`Team ${name} requires exactly 9 players (got ${lineup.length})`);
  }
  return { id, name, lineup };
}

export type StrengthCounts = Readonly<Record<Strength, number>>;

export type LineupCompositionResult = {
  valid: boolean;
  counts: StrengthCounts;
};

/** Required count for each Strength in a valid 9-player lineup. */
export const REQUIRED_STRENGTH_COUNT = 3;

export function countByStrength(lineup: readonly Player[]): StrengthCounts {
  const counts: Record<Strength, number> = { Light: 0, Medium: 0, Heavy: 0 };
  for (const p of lineup) counts[p.strength]++;
  return counts;
}

export function validateStrengthComposition(
  lineup: readonly Player[],
): LineupCompositionResult {
  const counts = countByStrength(lineup);
  const valid =
    counts.Light === REQUIRED_STRENGTH_COUNT &&
    counts.Medium === REQUIRED_STRENGTH_COUNT &&
    counts.Heavy === REQUIRED_STRENGTH_COUNT;
  return { valid, counts };
}

export function batterAt(team: Team, index: number): Player {
  const i = ((index % 9) + 9) % 9;
  return team.lineup[i] as Player;
}

export function defaultComputerLineup(idPrefix: string): Player[] {
  const profiles: Array<{ name: string; strength: Strength; handedness: Handedness }> = [
    { name: "Ortega", strength: "Light", handedness: "Right" },
    { name: "Marsh", strength: "Medium", handedness: "Left" },
    { name: "Diaz", strength: "Heavy", handedness: "Right" },
    { name: "Kane", strength: "Heavy", handedness: "Left" },
    { name: "Vega", strength: "Medium", handedness: "Right" },
    { name: "Suzuki", strength: "Light", handedness: "Left" },
    { name: "Brooks", strength: "Medium", handedness: "Right" },
    { name: "Park", strength: "Heavy", handedness: "Right" },
    { name: "Reyes", strength: "Light", handedness: "Left" },
  ];
  return profiles.map((p, i) => ({
    id: `${idPrefix}-${i}`,
    name: p.name,
    strength: p.strength,
    handedness: p.handedness,
  }));
}

export function defaultHumanLineup(idPrefix: string): Player[] {
  const profiles: Array<{ name: string; strength: Strength; handedness: Handedness }> = [
    { name: "Player 1", strength: "Medium", handedness: "Right" },
    { name: "Player 2", strength: "Light", handedness: "Left" },
    { name: "Player 3", strength: "Heavy", handedness: "Right" },
    { name: "Player 4", strength: "Heavy", handedness: "Left" },
    { name: "Player 5", strength: "Medium", handedness: "Right" },
    { name: "Player 6", strength: "Light", handedness: "Right" },
    { name: "Player 7", strength: "Medium", handedness: "Left" },
    { name: "Player 8", strength: "Heavy", handedness: "Right" },
    { name: "Player 9", strength: "Light", handedness: "Left" },
  ];
  return profiles.map((p, i) => ({
    id: `${idPrefix}-${i}`,
    name: p.name,
    strength: p.strength,
    handedness: p.handedness,
  }));
}
