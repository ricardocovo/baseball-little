export const BATTER_CARDS = [
  "HighSwing",
  "LowSwing",
  "FlatSwing",
  "HitAndRun",
  "Walk",
  "StolenBase",
  "Sacrifice",
  "Box",
] as const;

export type BatterCard = (typeof BATTER_CARDS)[number];

export const PITCHER_CARDS = [
  "FastHigh",
  "FastLow",
  "FastInside",
  "CurveHigh",
  "CurveLow",
  "CurveOutside",
  "SliderHigh",
  "SliderLow",
  "SliderInside",
  "NoPitch",
] as const;

export type PitcherCard = (typeof PITCHER_CARDS)[number];

export type DeckFormat = "Classic" | "Reduced";

export type BatterDeck = readonly BatterCard[];
export type PitcherDeck = readonly PitcherCard[];

const repeat = <T>(card: T, n: number): T[] => Array.from({ length: n }, () => card);

const BATTER_COUNTS_CLASSIC: Record<BatterCard, number> = {
  HighSwing: 3,
  LowSwing: 3,
  FlatSwing: 3,
  HitAndRun: 3,
  Walk: 1,
  StolenBase: 1,
  Sacrifice: 1,
  Box: 1,
};

const BATTER_COUNTS_REDUCED: Record<BatterCard, number> = {
  HighSwing: 2,
  LowSwing: 2,
  FlatSwing: 2,
  HitAndRun: 2,
  Walk: 1,
  StolenBase: 1,
  Sacrifice: 1,
  Box: 1,
};

const PITCHER_COUNTS: Record<PitcherCard, number> = {
  FastHigh: 1,
  FastLow: 1,
  FastInside: 1,
  CurveHigh: 1,
  CurveLow: 1,
  CurveOutside: 1,
  SliderHigh: 1,
  SliderLow: 1,
  SliderInside: 1,
  NoPitch: 3,
};

export function createBatterDeck(format: DeckFormat): BatterCard[] {
  const counts = format === "Classic" ? BATTER_COUNTS_CLASSIC : BATTER_COUNTS_REDUCED;
  const deck: BatterCard[] = [];
  for (const card of BATTER_CARDS) deck.push(...repeat(card, counts[card]));
  return deck;
}

export function createPitcherDeck(_format: DeckFormat): PitcherCard[] {
  // Pitcher counts are identical between Classic and Reduced (12 cards).
  const deck: PitcherCard[] = [];
  for (const card of PITCHER_CARDS) deck.push(...repeat(card, PITCHER_COUNTS[card]));
  return deck;
}

export function batterDeckSize(format: DeckFormat): number {
  return format === "Classic" ? 16 : 12;
}

export function pitcherDeckSize(_format: DeckFormat): number {
  return 12;
}

export const BATTER_CARD_LABELS: Record<BatterCard, string> = {
  HighSwing: "High Swing",
  LowSwing: "Low Swing",
  FlatSwing: "Flat Swing",
  HitAndRun: "Hit & Run",
  Walk: "Walk",
  StolenBase: "Stolen Base",
  Sacrifice: "Sacrifice",
  Box: "Box",
};

export const PITCHER_CARD_LABELS: Record<PitcherCard, string> = {
  FastHigh: "High Fastball",
  FastLow: "Low Fastball",
  FastInside: "Inside Fastball",
  CurveHigh: "High Curve",
  CurveLow: "Low Curve",
  CurveOutside: "Outside Curve",
  SliderHigh: "High Slider",
  SliderLow: "Low Slider",
  SliderInside: "Inside Slider",
  NoPitch: "No Pitch",
};

export const BATTER_CARD_IMAGES: Record<BatterCard, string> = {
  HighSwing: "high-swing.png",
  LowSwing: "low-swing.png",
  FlatSwing: "flat-swing.png",
  HitAndRun: "hit-run.png",
  Walk: "walk.png",
  StolenBase: "stolen-base.png",
  Sacrifice: "sacrifice.png",
  Box: "box.png",
};

export const PITCHER_CARD_IMAGES: Record<PitcherCard, string> = {
  FastHigh: "high-fastball.png",
  FastLow: "low-fastball.png",
  FastInside: "inside-fastball.png",
  CurveHigh: "high-curve.png",
  CurveLow: "low-curve.png",
  CurveOutside: "outside-curve.png",
  SliderHigh: "high-slider.png",
  SliderLow: "low-slider.png",
  SliderInside: "inside-slider.png",
  NoPitch: "no-pitch.png",
};
