export type Rng = {
  next: () => number;
  int: (maxExclusive: number) => number;
  pick: <T>(items: readonly T[]) => T;
  weighted: <T>(items: readonly T[], weights: readonly number[]) => T;
};

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (maxExclusive: number): number => {
    if (maxExclusive <= 0) throw new Error("maxExclusive must be > 0");
    return Math.floor(next() * maxExclusive);
  };

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) throw new Error("pick from empty list");
    return items[int(items.length)] as T;
  };

  const weighted = <T>(items: readonly T[], weights: readonly number[]): T => {
    if (items.length === 0 || items.length !== weights.length) {
      throw new Error("weighted: items and weights must be same non-zero length");
    }
    let total = 0;
    for (const w of weights) {
      if (w < 0) throw new Error("weighted: negative weight");
      total += w;
    }
    if (total <= 0) return pick(items);
    let r = next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i] as number;
      if (r <= 0) return items[i] as T;
    }
    return items[items.length - 1] as T;
  };

  return { next, int, pick, weighted };
}
