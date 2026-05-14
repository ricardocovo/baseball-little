import type { BatterCard, DeckFormat, PitcherCard } from "../domain/cards.ts";
import type { Player, Team, TeamSide } from "../domain/players.ts";
import { batterAt } from "../domain/players.ts";
import type { Column, Coord, Row } from "../domain/field.ts";
import {
  classifyLanding,
  pitcherPositionFor,
} from "../domain/field.ts";
import type { HitClassification } from "../domain/field.ts";
import { spinDepth, spinDirection } from "../domain/spinners.ts";
import type { Rng } from "./rng.ts";
import { createRng } from "./rng.ts";
import type { BaseLabel, GameEvent, GameOverReason, Half } from "./events.ts";
import type { Bases } from "./runners.ts";
import {
  EMPTY_BASES,
  advanceAllBy,
  applySacrifice,
  applyWalk,
  leadRunner,
} from "./runners.ts";
import {
  createBatterDeck,
  createPitcherDeck,
} from "../domain/cards.ts";
import { resolveCongruence } from "../domain/congruence.ts";

export type GameStatus =
  | "Setup"
  | "AwaitingPitch"
  | "AwaitingFielding"
  | "AwaitingDirectionSpin"
  | "AwaitingDepthSpin"
  | "GameOver";

export type StartOptions = {
  format: DeckFormat;
  innings: number; // 3, 6, or 9
  teams: { home: Team; away: Team };
  humanSide: TeamSide;
  seed: number;
  /** Override the coin-flip "first at bat" decision (test hook). */
  firstAtBat?: TeamSide;
};

export type PendingHit = {
  batter: Player;
  batterCard: BatterCard;
  fielders?: readonly Coord[]; // 8 fielders + 1 pitcher
  direction?: Column;
  depth?: Row;
};

export type GameSnapshot = {
  status: GameStatus;
  format: DeckFormat;
  inningsConfigured: number;
  inning: number;
  half: Half;
  outs: number;
  bases: Bases;
  score: { home: number; away: number };
  lineScore: { home: number[]; away: number[] };
  battingIndex: { home: number; away: number };
  decks: {
    home: { batter: readonly BatterCard[]; pitcher: readonly PitcherCard[] };
    away: { batter: readonly BatterCard[]; pitcher: readonly PitcherCard[] };
  };
  teams: { home: Team; away: Team };
  humanSide: TeamSide;
  /** Which side bats top of the 1st (and every odd inning's top). */
  firstAtBat: TeamSide;
  pendingHit?: PendingHit;
  pendingHitAndRunThrow?: { runner: Player; from: BaseLabel };
  gameOverReason?: GameOverReason;
  winner?: TeamSide | "Tie";
};

export class Game {
  private state!: GameSnapshot;
  private rng!: Rng;
  private listeners: Array<(e: GameEvent) => void> = [];

  start(opts: StartOptions): GameEvent[] {
    this.rng = createRng(opts.seed);
    const firstAtBat: TeamSide =
      opts.firstAtBat ?? (this.rng.next() < 0.5 ? "Away" : "Home");

    this.state = {
      status: "AwaitingPitch",
      format: opts.format,
      inningsConfigured: opts.innings,
      inning: 1,
      half: "Top",
      outs: 0,
      bases: { ...EMPTY_BASES },
      score: { home: 0, away: 0 },
      lineScore: { home: [], away: [] },
      battingIndex: { home: 0, away: 0 },
      decks: {
        home: {
          batter: createBatterDeck(opts.format),
          pitcher: createPitcherDeck(opts.format),
        },
        away: {
          batter: createBatterDeck(opts.format),
          pitcher: createPitcherDeck(opts.format),
        },
      },
      teams: opts.teams,
      humanSide: opts.humanSide,
      firstAtBat,
    };

    const events: GameEvent[] = [];
    this.emit({ type: "GameStarted", firstAtBat }, events);
    this.emit(this.startNewAtBatEvent(), events);
    return events;
  }

  /** Subscribe to a stream of events. Returns an unsubscribe fn. */
  subscribe(listener: (e: GameEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  snapshot(): GameSnapshot {
    return structuredClone(this.state);
  }

  /**
   * Public-only snapshot suitable for AI input — strips the opponent's hands
   * so the AI cannot inspect hidden information. The AI sees only its own
   * deck for the role it currently plays.
   */
  publicSnapshot(forSide: TeamSide): GameSnapshot {
    const snap = this.snapshot();
    const hidden: BatterCard[] = [];
    const hiddenP: PitcherCard[] = [];
    if (forSide === "Home") {
      snap.decks.away = { batter: hidden, pitcher: hiddenP };
    } else {
      snap.decks.home = { batter: hidden, pitcher: hiddenP };
    }
    return snap;
  }

  // Read helpers for the UI/AI.
  currentOffense(): TeamSide {
    // First-at-bat side bats on the "Top" of every inning; opposite side
    // bats on the "Bottom". This keeps team identity (home/away) fixed.
    if (this.state.firstAtBat === "Away") {
      return this.state.half === "Top" ? "Away" : "Home";
    }
    return this.state.half === "Top" ? "Home" : "Away";
  }
  currentDefense(): TeamSide {
    return this.currentOffense() === "Home" ? "Away" : "Home";
  }
  currentBatter(): Player {
    const side = this.currentOffense();
    return batterAt(this.state.teams[sideKey(side)], this.state.battingIndex[sideKey(side)]);
  }
  batterHand(): readonly BatterCard[] {
    return this.state.decks[sideKey(this.currentOffense())].batter;
  }
  pitcherHand(): readonly PitcherCard[] {
    return this.state.decks[sideKey(this.currentDefense())].pitcher;
  }

  /**
   * Submit a pitcher card and a batter card. Resolves congruence and either
   * progresses to fielding (if Hit) or applies the outcome and advances to
   * the next at-bat (or game over).
   */
  playCards(batterCard: BatterCard, pitcherCard: PitcherCard): GameEvent[] {
    this.requireStatus("AwaitingPitch");
    const events: GameEvent[] = [];

    // Validate that both cards are in the respective hands.
    const offSide = this.currentOffense();
    const defSide = this.currentDefense();
    if (!this.handHas(this.state.decks[sideKey(offSide)].batter, batterCard)) {
      throw new Error(`Batter card ${batterCard} not in offense hand`);
    }
    if (!this.handHas(this.state.decks[sideKey(defSide)].pitcher, pitcherCard)) {
      throw new Error(`Pitcher card ${pitcherCard} not in defense hand`);
    }

    // Discard both cards (cards are not replenished — see rules).
    this.discardBatter(offSide, batterCard);
    this.discardPitcher(defSide, pitcherCard);

    this.emit({ type: "PitchResolved", batterCard, pitcherCard }, events);

    const outcome = resolveCongruence(batterCard, pitcherCard);
    const batter = this.currentBatter();

    switch (outcome.kind) {
      case "StrikeOut":
        this.emit({ type: "StrikeOut", batter }, events);
        this.recordOuts(1, "Strike out", events);
        // Hit & Run special: if there are runners on base AND it isn't the
        // third out, the defense gets a throw attempt at the lead runner.
        if (
          batterCard === "HitAndRun" &&
          this.state.outs < 3 &&
          leadRunner(this.state.bases) !== null
        ) {
          this.applyHitAndRunThrow(events);
        }
        this.advanceBatter();
        this.transitionAfterPlay(events);
        break;
      case "BaseOnBalls": {
        this.emit({ type: "WalkIssued", batter }, events);
        const r = applyWalk(this.state.bases, batter);
        this.applyAdvanceResult(r, events);
        this.advanceBatter();
        this.transitionAfterPlay(events);
        break;
      }
      case "NoPlay":
        this.emit({ type: "NoPlay", reason: "Cards burned" }, events);
        this.transitionAfterPlay(events);
        break;
      case "SacrificeAttempt": {
        // Batter is always out; runners advance one base.
        const r = applySacrifice(this.state.bases);
        this.state.bases = r.bases;
        for (const m of r.movements) this.emit({ type: "RunnerAdvances", runner: m.runner, from: m.from, to: m.to }, events);
        if (r.runs > 0) this.emit({ type: "RunsScored", runs: r.runs, scorers: r.scorers }, events);
        this.addRuns(r.runs);
        this.recordOuts(1, "Sacrifice", events);
        this.advanceBatter();
        this.transitionAfterPlay(events);
        break;
      }
      case "Special":
        this.applySpecial(outcome.reason, batter, events);
        this.transitionAfterPlay(events);
        break;
      case "Hit":
        this.emit({ type: "BallInPlay", batter }, events);
        this.state.pendingHit = { batter, batterCard };
        this.state.status = "AwaitingFielding";
        break;
    }

    return events;
  }

  /**
   * Submit fielder positions (7 fielders: 4 infielders + 3 outfielders).
   * The catcher is not represented on the field; the pitcher is auto-placed,
   * for a total of 8 defenders.
   */
  submitFielders(sevenFielders: readonly Coord[]): GameEvent[] {
    this.requireStatus("AwaitingFielding");
    if (sevenFielders.length !== 7) {
      throw new Error("Expected exactly 7 fielders");
    }
    const ph = this.state.pendingHit;
    if (!ph) throw new Error("No pending hit");
    const pitcherCoord = pitcherPositionFor(ph.batter.handedness);
    ph.fielders = [...sevenFielders, pitcherCoord];
    this.state.status = "AwaitingDirectionSpin";
    return [];
  }

  /** Spin hit direction. Auto-advances to depth-spin step. */
  spinHitDirection(): GameEvent[] {
    this.requireStatus("AwaitingDirectionSpin");
    const ph = this.state.pendingHit!;
    const col = spinDirection(this.rng, ph.batter.handedness);
    ph.direction = col;
    this.state.status = "AwaitingDepthSpin";
    return [{ type: "HitDirection", col }];
  }

  /** Spin hit depth, then classify and resolve the hit. */
  spinHitDepth(): GameEvent[] {
    this.requireStatus("AwaitingDepthSpin");
    const ph = this.state.pendingHit!;
    const row = spinDepth(this.rng, ph.batter.strength);
    ph.depth = row;

    const events: GameEvent[] = [{ type: "HitDepth", row }];
    const landing: Coord = { col: ph.direction!, row };
    const cls = classifyLanding(landing, ph.fielders!);
    events.push({ type: "HitClassified", classification: cls });

    this.applyHitClassification(cls, ph, events);
    this.state.pendingHit = undefined as PendingHit | undefined;
    this.advanceBatter();
    this.transitionAfterPlay(events);
    return events;
  }

  // ---------- internal helpers ----------

  private startNewAtBatEvent(): GameEvent {
    const offense = this.currentOffense();
    const batter = this.currentBatter();
    return { type: "AtBatStarted", offense, batter };
  }

  private emit(e: GameEvent, sink: GameEvent[]): void {
    sink.push(e);
    for (const l of this.listeners) l(e);
  }

  private requireStatus(s: GameStatus): void {
    if (this.state.status !== s) {
      throw new Error(`Expected status ${s} but was ${this.state.status}`);
    }
  }

  private handHas<T>(hand: readonly T[], card: T): boolean {
    return hand.includes(card);
  }

  private discardBatter(side: TeamSide, card: BatterCard): void {
    const hand = this.state.decks[sideKey(side)].batter as BatterCard[];
    const idx = hand.indexOf(card);
    if (idx === -1) throw new Error("Card not in batter hand");
    hand.splice(idx, 1);
  }

  private discardPitcher(side: TeamSide, card: PitcherCard): void {
    const hand = this.state.decks[sideKey(side)].pitcher as PitcherCard[];
    const idx = hand.indexOf(card);
    if (idx === -1) throw new Error("Card not in pitcher hand");
    hand.splice(idx, 1);
  }

  private recordOuts(n: number, reason: string, events: GameEvent[]): void {
    this.state.outs += n;
    this.emit({ type: "OutsRecorded", outs: n, reason }, events);
  }

  private addRuns(n: number): void {
    if (n <= 0) return;
    const offense = this.currentOffense();
    this.state.score[sideKey(offense)] += n;
  }

  private applyAdvanceResult(r: ReturnType<typeof applyWalk>, events: GameEvent[]): void {
    this.state.bases = r.bases;
    for (const m of r.movements) {
      events.push({ type: "RunnerAdvances", runner: m.runner, from: m.from, to: m.to });
    }
    if (r.runs > 0) {
      events.push({ type: "RunsScored", runs: r.runs, scorers: r.scorers });
      this.addRuns(r.runs);
    }
  }

  private applySpecial(reason: string, batter: Player, events: GameEvent[]): void {
    switch (reason) {
      case "HitAndRun_NoPitch": {
        // If runners on base: lead runner out, batter continues.
        // If no runners: NoPlay.
        const lead = leadRunner(this.state.bases);
        if (!lead) {
          this.emit({ type: "NoPlay", reason: "Hit & Run with empty bases vs No Pitch" }, events);
          return;
        }
        this.removeRunner(lead.base);
        this.emit({ type: "RunnerOut", runner: lead.player, from: lead.base }, events);
        this.recordOuts(1, "Hit & Run vs No Pitch", events);
        // Batter does NOT advance; stays at bat. Skip advanceBatter.
        // Mark batter-stays via a sentinel.
        this.batterStaysFlag = true;
        return;
      }
      case "StolenBase_Safe": {
        // Guard: if no runners are on base, treat as NoPlay (cards burned).
        if (leadRunner(this.state.bases) === null) {
          this.emit({ type: "NoPlay", reason: "Steal attempt with no runners" }, events);
          return;
        }
        // All runners advance one base.
        const r = advanceAllBy(this.state.bases, null, 1, "First");
        this.state.bases = r.bases;
        for (const m of r.movements) this.emit({ type: "RunnerAdvances", runner: m.runner, from: m.from, to: m.to }, events);
        if (r.runs > 0) {
          this.emit({ type: "RunsScored", runs: r.runs, scorers: r.scorers }, events);
          this.addRuns(r.runs);
        }
        // Batter stays at bat (steal happens during pitch).
        this.batterStaysFlag = true;
        return;
      }
      case "StolenBase_Caught":
      case "StolenBase_NoPitch": {
        const lead = leadRunner(this.state.bases);
        if (!lead) {
          this.emit({ type: "NoPlay", reason: "Steal attempt with no runners" }, events);
          return;
        }
        this.removeRunner(lead.base);
        this.emit({ type: "RunnerOut", runner: lead.player, from: lead.base }, events);
        this.recordOuts(1, reason === "StolenBase_NoPitch" ? "Steal vs No Pitch" : "Caught stealing", events);
        this.batterStaysFlag = true;
        return;
      }
      default:
        throw new Error(`Unhandled special: ${reason} for batter ${batter.name}`);
    }
  }

  private applyHitAndRunThrow(events: GameEvent[]): void {
    // Lead runner has already started running on the swing. The defense
    // attempts to throw them out. We resolve via seeded RNG (60% out).
    const lead = leadRunner(this.state.bases);
    if (!lead) return;
    const isOut = this.rng.next() < 0.6;
    if (isOut) {
      this.removeRunner(lead.base);
      this.emit({ type: "RunnerOut", runner: lead.player, from: lead.base }, events);
      this.recordOuts(1, "Hit & Run throw", events);
    } else {
      // Runner is safe at the next base. Advance just the lead runner one base.
      // (Other runners stay; only the lead was running with the swing.)
      const target: BaseLabel | "Home" =
        lead.base === "First" ? "Second" : lead.base === "Second" ? "Third" : "Home";
      this.removeRunner(lead.base);
      if (target === "Home") {
        this.addRuns(1);
        this.emit({ type: "RunsScored", runs: 1, scorers: [lead.player] }, events);
      } else if (target === "Second") {
        this.state.bases.second = lead.player;
      } else if (target === "Third") {
        this.state.bases.third = lead.player;
      }
      this.emit({ type: "RunnerAdvances", runner: lead.player, from: lead.base, to: target }, events);
    }
  }

  private removeRunner(base: BaseLabel): void {
    if (base === "First") this.state.bases.first = null;
    else if (base === "Second") this.state.bases.second = null;
    else this.state.bases.third = null;
  }

  private applyHitClassification(
    cls: HitClassification,
    ph: PendingHit,
    events: GameEvent[],
  ): void {
    const isHitAndRun = ph.batterCard === "HitAndRun";
    switch (cls.kind) {
      case "Out":
        this.recordOuts(1, "Caught", events);
        return;
      case "Error": {
        // Treat like a single; HitAndRun adds extra base FOR RUNNERS only.
        const runnerAdvance = isHitAndRun ? 2 : 1;
        const r = advanceAllBy(this.state.bases, ph.batter, runnerAdvance, "First");
        this.applyAdvanceResult(r, events);
        events.push({ type: "ErrorOnField", landing: { col: ph.direction!, row: ph.depth! } });
        return;
      }
      case "Single":
      case "Double":
      case "Triple": {
        const baseAdvance =
          cls.kind === "Single" ? 1 : cls.kind === "Double" ? 2 : 3;
        // Hit & Run: only RUNNERS get the extra base, batter gets normal hit.
        const runnerAdvance = isHitAndRun ? baseAdvance + 1 : baseAdvance;
        const batterTo = baseFromCount(baseAdvance);
        const r = advanceAllBy(this.state.bases, ph.batter, runnerAdvance, batterTo);
        this.applyAdvanceResult(r, events);
        events.push({ type: "BatterAdvances", batter: ph.batter, to: batterTo });
        return;
      }
      case "HomeRun": {
        const r = advanceAllBy(this.state.bases, ph.batter, 4, "Home");
        this.applyAdvanceResult(r, events);
        events.push({ type: "BatterAdvances", batter: ph.batter, to: "Home" });
        return;
      }
    }
  }

  private batterStaysFlag = false;

  private advanceBatter(): void {
    if (this.batterStaysFlag) {
      this.batterStaysFlag = false;
      return;
    }
    const offense = this.currentOffense();
    this.state.battingIndex[sideKey(offense)] =
      (this.state.battingIndex[sideKey(offense)] + 1) % 9;
  }

  private transitionAfterPlay(events: GameEvent[]): void {
    // 3 outs -> end half-inning.
    if (this.state.outs >= 3) {
      this.endHalfInning(events);
      if (this.state.status === "GameOver") return;
    }
    // Check hand exhaustion for whichever player must act next.
    if (this.checkHandExhaustion(events)) return;

    // Otherwise, ready for next pitch.
    this.state.status = "AwaitingPitch";
    this.emit(this.startNewAtBatEvent(), events);
  }

  private endHalfInning(events: GameEvent[]): void {
    const offense = this.currentOffense();
    const runs =
      this.state.score[sideKey(offense)] -
      (this.state.lineScore[sideKey(offense)].reduce((s, n) => s + n, 0));
    this.state.lineScore[sideKey(offense)].push(runs);
    this.emit({ type: "HalfInningEnded", inning: this.state.inning, half: this.state.half, runsThisHalf: runs }, events);

    this.state.bases = { ...EMPTY_BASES };
    this.state.outs = 0;

    if (this.state.half === "Top") {
      this.state.half = "Bottom";
    } else {
      this.state.half = "Top";
      this.state.inning += 1;
    }

    if (this.state.inning > this.state.inningsConfigured) {
      this.gameOver("InningsCompleted", events);
    }
  }

  private checkHandExhaustion(events: GameEvent[]): boolean {
    const offSide = this.currentOffense();
    const defSide = this.currentDefense();
    if (this.state.decks[sideKey(offSide)].batter.length === 0) {
      this.emit({ type: "HandExhausted", side: offSide, role: "batter" }, events);
      this.gameOver("HandExhausted", events);
      return true;
    }
    if (this.state.decks[sideKey(defSide)].pitcher.length === 0) {
      this.emit({ type: "HandExhausted", side: defSide, role: "pitcher" }, events);
      this.gameOver("HandExhausted", events);
      return true;
    }
    return false;
  }

  private gameOver(reason: GameOverReason, events: GameEvent[]): void {
    this.state.status = "GameOver";
    this.state.gameOverReason = reason;
    const home = this.state.score.home;
    const away = this.state.score.away;
    const winner: TeamSide | "Tie" = home > away ? "Home" : away > home ? "Away" : "Tie";
    this.state.winner = winner;
    this.emit({
      type: "GameOver",
      reason,
      winner,
      finalScore: { home, away },
    }, events);
  }
}

function sideKey(side: TeamSide): "home" | "away" {
  return side === "Home" ? "home" : "away";
}

function baseFromCount(n: number): BaseLabel | "Home" {
  if (n >= 4) return "Home";
  if (n === 3) return "Third";
  if (n === 2) return "Second";
  return "First";
}
