import type { BatterCard, PitcherCard } from "../domain/cards.ts";
import { resolveCongruence } from "../domain/congruence.ts";
import type { Coord, Column, Row } from "../domain/field.ts";
import { COLUMNS } from "../domain/field.ts";
import { createTeam } from "../domain/players.ts";
import type { Player, TeamSide } from "../domain/players.ts";
import { Game } from "../engine/GameState.ts";
import type { GameEvent } from "../engine/events.ts";
import type { Ai } from "../ai/Ai.ts";
import { createAi, defaultFielderPlacement } from "../ai/Ai.ts";
import { createRng } from "../engine/rng.ts";
import {
  defaultSetupValues,
  readSetup,
  renderSetup,
  type SetupValues,
} from "./screens/Setup.ts";
import { renderCoinFlip } from "./screens/CoinFlip.ts";
import { renderCardPhase, renderCardHand } from "./screens/CardPhase.ts";
import { renderFieldPhase } from "./screens/FieldPhase.ts";
import { renderGameOver } from "./screens/GameOver.ts";
import { playHitSound, playStrikeOutSound, playHomeRunSound } from "../sounds/sounds.ts";
import {
  renderGameHeader,
  renderScoreboard,
} from "./components/Scoreboard.ts";
import { describeEvent, renderEventLog } from "./components/EventLog.ts";

type AppPhase =
  | { kind: "Setup"; values: SetupValues }
  | { kind: "CoinFlip"; result?: TeamSide; values: SetupValues }
  | { kind: "Playing" }
  | { kind: "GameOver" };

type CardPhaseUiState = {
  humanRole: "batter" | "pitcher";
  humanSelection?: BatterCard | PitcherCard;
  aiSelection?: BatterCard | PitcherCard;
  revealed: boolean;
  aiThinking: boolean;
  outcomeMessage?: string;
};

type FieldPhaseUiState = {
  // Cached at the start of the play; the engine clears `pendingHit` as soon
  // as the depth spin resolves the play, but the UI still needs this info to
  // render the Resolved screen (with the Continue button).
  batter: Player;
  batterCard: BatterCard;
  fielders: Coord[];
  selectedFielderIndex?: number;
  phase: "Placing" | "AwaitingDirectionSpin" | "SpinningDirection" | "AwaitingDepthSpin" | "SpinningDepth" | "Resolved";
  direction?: Column;
  depth?: Row;
  landing?: Coord;
  message?: string;
};

const AI_THINK_MS = 600;

export class App {
  private root: HTMLElement;
  private phase: AppPhase = { kind: "Setup", values: defaultSetupValues() };
  private game = new Game();
  private events: GameEvent[] = [];
  private cardUi?: CardPhaseUiState;
  private fieldUi?: FieldPhaseUiState;
  private humanSide: TeamSide = "Home";
  private ai!: Ai;

  constructor(root: HTMLElement) {
    this.root = root;
    this.render();
  }

  private subscribeToGame(): void {
    this.game.subscribe((e) => this.events.push(e));
  }

  private render(): void {
    let html = "";
    switch (this.phase.kind) {
      case "Setup":
        html = renderSetup(this.phase.values);
        break;
      case "CoinFlip":
        html = renderCoinFlip(this.phase.result, this.humanSide);
        break;
      case "Playing":
        html = this.renderPlaying();
        break;
      case "GameOver": {
        const goSnap = this.game.snapshot();
        html = `<div class="game-frame">${renderGameHeader(goSnap)}<div class="game-content"><div class="content-main"><div class="scoreboard-panel">${renderScoreboard(goSnap)}</div>${renderGameOver(goSnap)}</div><aside class="content-sidebar">${renderEventLog(this.events)}</aside></div></div>`;
        break;
      }
    }
    this.root.innerHTML = html;
    this.bindEvents();
  }

  private renderPlaying(): string {
    const snap = this.game.snapshot();
    let main = "";
    let handHtml = "";
    // Field phase owns the screen whenever fieldUi is set — including after
    // the play has resolved (status will already be AwaitingPitch for the next
    // at-bat, but the user still needs to confirm the result). The fieldUi is
    // cleared by afterHitContinue.
    if (this.fieldUi) {
      const humanIsDefense = this.game.currentDefense() === this.humanSide;
      main = renderFieldPhase({
        humanIsDefense,
        batter: this.fieldUi.batter,
        batterCard: this.fieldUi.batterCard,
        fielders: this.fieldUi.fielders,
        selectedFielderIndex: this.fieldUi.selectedFielderIndex,
        phase: this.fieldUi.phase,
        direction: this.fieldUi.direction,
        depth: this.fieldUi.depth,
        landing: this.fieldUi.landing,
        message: this.fieldUi.message,
      });
    } else if (snap.status === "AwaitingPitch" && this.cardUi) {
      main = renderCardPhase({ snap, ...this.cardUi });
      handHtml = renderCardHand({ snap, ...this.cardUi });
    } else if (snap.status === "GameOver") {
      main = renderGameOver(snap);
    }

    const top = renderGameHeader(snap);
    const sb = `<div class="scoreboard-panel">${renderScoreboard(snap)}</div>`;

    return `
      <div class="game-frame">
        ${top}
        <div class="game-content">
          <div class="content-main">
            ${sb}
            <div class="game-action">${main}</div>
          </div>
          <aside class="content-sidebar">${renderEventLog(this.events)}</aside>
        </div>
        ${handHtml}
      </div>`;
  }

  private bindEvents(): void {
    if (this.phase.kind === "Setup") {
      this.root.querySelector<HTMLButtonElement>("#start")?.addEventListener("click", () => {
        if (this.phase.kind !== "Setup") return;
        const values = readSetup(this.root, this.phase.values);
        this.phase.values = values;
        this.startCoinFlip();
      });
    } else if (this.phase.kind === "CoinFlip") {
      this.root.querySelector<HTMLButtonElement>("#play-ball")?.addEventListener("click", () => {
        if (this.phase.kind !== "CoinFlip" || !this.phase.result) return;
        this.startGame(this.phase.result, this.phase.values);
      });
    } else if (this.phase.kind === "Playing") {
      this.bindPlayingEvents();
    } else if (this.phase.kind === "GameOver") {
      this.root.querySelector<HTMLButtonElement>("#new-game")?.addEventListener("click", () => {
        this.phase = { kind: "Setup", values: defaultSetupValues() };
        this.events = [];
        this.cardUi = undefined as CardPhaseUiState | undefined;
        this.fieldUi = undefined as FieldPhaseUiState | undefined;
        this.render();
      });
    }
  }

  private bindPlayingEvents(): void {
    // Mirror the priority used in renderPlaying: when fieldUi is set, the
    // FieldPhase screen owns the DOM, so bind only its handlers.
    if (this.fieldUi) {
      this.bindFieldPhaseEvents();
      return;
    }
    if (this.cardUi) {
      this.bindCardPhaseEvents();
    }
  }

  private bindCardPhaseEvents(): void {
    if (!this.cardUi) return;
    if (!this.cardUi.revealed) {
      this.root.querySelectorAll<HTMLButtonElement>(".your-hand .card").forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.dataset.card;
          if (!card || !this.cardUi) return;
          this.cardUi.humanSelection = card as BatterCard | PitcherCard;
          this.tryRevealCards();
        });
      });
      return;
    }
    this.root.querySelector<HTMLButtonElement>("#continue")?.addEventListener("click", () => {
      this.applyCardPlay();
    });
  }

  private bindFieldPhaseEvents(): void {
    if (!this.fieldUi) return;
    const phase = this.fieldUi.phase;
    if (phase === "Placing") {
      const humanIsDefense = this.game.currentDefense() === this.humanSide;
      if (!humanIsDefense) return;
      this.root.querySelectorAll<SVGPathElement>("path.cell.editable").forEach((cell) => {
        cell.addEventListener("click", () => this.handleGridClick(cell));
      });
      this.root.querySelector<HTMLButtonElement>("#confirm-fielders")?.addEventListener("click", () => {
        this.confirmFielders();
      });
      this.root.querySelector<HTMLButtonElement>("#reset-fielders")?.addEventListener("click", () => {
        if (!this.fieldUi) return;
        this.fieldUi.fielders = defaultFielderPlacement(
          this.fieldUi.batter.strength,
          this.fieldUi.batter.handedness,
        );
        this.fieldUi.selectedFielderIndex = undefined as number | undefined;
        this.render();
      });
      return;
    }
    if (phase === "AwaitingDirectionSpin") {
      this.root.querySelector<HTMLButtonElement>("#spin-direction")?.addEventListener("click", () => {
        this.spinDirection();
      });
      return;
    }
    if (phase === "AwaitingDepthSpin") {
      this.root.querySelector<HTMLButtonElement>("#spin-depth")?.addEventListener("click", () => {
        this.spinDepth();
      });
      return;
    }
    if (phase === "Resolved") {
      this.root.querySelector<HTMLButtonElement>("#continue-after-hit")?.addEventListener("click", () => {
        this.afterHitContinue();
      });
    }
  }

  // ---------- coin flip ----------
  private startCoinFlip(): void {
    if (this.phase.kind !== "Setup") return;
    const values = this.phase.values;
    this.phase = { kind: "CoinFlip", values };
    this.render();
    // Random coin flip via a one-off RNG so the game RNG stays clean.
    const flipRng = createRng(Date.now() & 0xffffffff);
    setTimeout(() => {
      const result: TeamSide = flipRng.next() < 0.5 ? "Home" : "Away";
      if (this.phase.kind !== "CoinFlip") return;
      this.phase.result = result;
      this.render();
    }, 1200);
  }

  // ---------- start game ----------
  private startGame(firstAtBat: TeamSide, values: SetupValues): void {
    this.humanSide = "Home";
    const homeTeam = createTeam("h", values.humanTeamName, values.humanLineup);
    const awayTeam = createTeam("a", values.computerTeamName, values.computerLineup);
    this.game = new Game();
    this.events = [];
    this.subscribeToGame();
    const seed = (Math.floor(Math.random() * 0xffffffff) || 1);
    this.game.start({
      format: values.format,
      innings: values.innings,
      teams: { home: homeTeam, away: awayTeam },
      humanSide: this.humanSide,
      seed,
      firstAtBat,
    });
    this.ai = createAi(createRng(seed ^ 0xdeadbeef), this.humanSide === "Home" ? "Away" : "Home");
    this.phase = { kind: "Playing" };
    this.startNextAtBat();
  }

  // ---------- card phase ----------
  private startNextAtBat(): void {
    const snap = this.game.snapshot();
    if (snap.status === "GameOver") {
      this.phase = { kind: "GameOver" };
      this.render();
      return;
    }
    if (snap.status === "AwaitingPitch") {
      const offSide = this.game.currentOffense();
      const humanRole: "batter" | "pitcher" = offSide === this.humanSide ? "batter" : "pitcher";
      this.cardUi = {
        humanRole,
        revealed: false,
        aiThinking: true,
      };
      this.render();
      // AI picks its card after a short delay.
      setTimeout(() => {
        if (!this.cardUi) return;
        const aiState = this.buildAiState(false);
        const batter = this.game.currentBatter();
        if (humanRole === "batter") {
          // AI is pitcher.
          this.cardUi.aiSelection = this.ai.choosePitcherCard(this.game.pitcherHand(), aiState, batter);
        } else {
          this.cardUi.aiSelection = this.ai.chooseBatterCard(this.game.batterHand(), aiState, batter);
        }
        this.cardUi.aiThinking = false;
        this.tryRevealCards();
      }, AI_THINK_MS);
    }
  }

  private buildAiState(_aiAsOffense: boolean) {
    const snap = this.game.snapshot();
    const offSide = this.game.currentOffense();
    const aiSide: TeamSide = this.humanSide === "Home" ? "Away" : "Home";
    const myScore = offSide === aiSide ? snap.score[sideKey(aiSide)] : snap.score[sideKey(this.humanSide)];
    const oppScore = offSide === aiSide ? snap.score[sideKey(this.humanSide)] : snap.score[sideKey(aiSide)];
    return {
      inning: snap.inning,
      inningsConfigured: snap.inningsConfigured,
      half: snap.half,
      outs: snap.outs,
      bases: snap.bases,
      myScore,
      opponentScore: oppScore,
    };
  }

  private tryRevealCards(): void {
    if (!this.cardUi) return;
    if (this.cardUi.humanSelection !== undefined && this.cardUi.aiSelection !== undefined) {
      this.cardUi.revealed = true;
      // Play sound based on card outcome.
      const offSide = this.game.currentOffense();
      const humanIsOffense = offSide === this.humanSide;
      const batterCard = (humanIsOffense ? this.cardUi.humanSelection : this.cardUi.aiSelection) as BatterCard;
      const pitcherCard = (humanIsOffense ? this.cardUi.aiSelection : this.cardUi.humanSelection) as PitcherCard;
      const outcome = resolveCongruence(batterCard, pitcherCard);
      if (outcome.kind === "Hit") {
        playHitSound();
      } else if (outcome.kind === "StrikeOut") {
        playStrikeOutSound();
      }
      this.render();
    } else {
      this.render();
    }
  }

  private applyCardPlay(): void {
    if (!this.cardUi || !this.cardUi.revealed) return;
    const snap = this.game.snapshot();
    const offSide = this.game.currentOffense();
    const humanIsOffense = offSide === this.humanSide;
    const batterCard = (humanIsOffense ? this.cardUi.humanSelection : this.cardUi.aiSelection) as BatterCard;
    const pitcherCard = (humanIsOffense ? this.cardUi.aiSelection : this.cardUi.humanSelection) as PitcherCard;
    void snap;
    this.game.playCards(batterCard, pitcherCard);
    const after = this.game.snapshot();
    if (after.status === "GameOver") {
      this.cardUi = undefined as CardPhaseUiState | undefined;
      this.phase = { kind: "GameOver" };
      this.render();
      return;
    }
    if (after.status === "AwaitingFielding") {
      this.startFieldPhase();
      return;
    }
    // Otherwise AwaitingPitch (next at-bat).
    this.startNextAtBat();
  }

  // ---------- field phase ----------
  private startFieldPhase(): void {
    const snap = this.game.snapshot();
    const ph = snap.pendingHit!;
    const humanIsDefense = this.game.currentDefense() === this.humanSide;
    const fielders = defaultFielderPlacement(ph.batter.strength, ph.batter.handedness);
    // Discard the just-revealed card matchup so a stale CardPhase can never
    // be rendered while the field phase is in progress (or in its Resolved
    // state, when the engine status has already advanced to AwaitingPitch).
    this.cardUi = undefined as CardPhaseUiState | undefined;
    this.fieldUi = {
      batter: ph.batter,
      batterCard: ph.batterCard,
      fielders,
      phase: "Placing",
    };
    this.render();
    if (!humanIsDefense) {
      // AI places fielders after a brief delay, then the human spins.
      setTimeout(() => {
        if (!this.fieldUi) return;
        this.fieldUi.fielders = this.ai.placeFielders(ph.batter);
        this.confirmFielders();
      }, AI_THINK_MS);
    }
  }

  private confirmFielders(): void {
    if (!this.fieldUi) return;
    if (this.fieldUi.fielders.length !== 7) return;
    this.game.submitFielders(this.fieldUi.fielders);
    this.fieldUi.phase = "AwaitingDirectionSpin";
    this.render();
    // If AI is offense, auto-spin.
    const humanIsOffense = this.game.currentOffense() === this.humanSide;
    if (!humanIsOffense) {
      setTimeout(() => this.spinDirection(), AI_THINK_MS);
    }
  }

  private spinDirection(): void {
    if (!this.fieldUi) return;
    // Call engine immediately to get the result
    const ev = this.game.spinHitDirection();
    const dir = ev.find((e) => e.type === "HitDirection");
    if (dir && dir.type === "HitDirection") this.fieldUi.direction = dir.col as Column;
    // Start spin animation
    this.fieldUi.phase = "SpinningDirection";
    this.render();
    // After animation completes, advance to next phase
    setTimeout(() => {
      if (!this.fieldUi) return;
      this.fieldUi.phase = "AwaitingDepthSpin";
      this.render();
      const humanIsOffense = this.game.currentOffense() === this.humanSide;
      if (!humanIsOffense) {
        setTimeout(() => this.spinDepth(), AI_THINK_MS);
      }
    }, 2400);
  }

  private spinDepth(): void {
    if (!this.fieldUi) return;
    // Call engine immediately to get the result
    const ev = this.game.spinHitDepth();
    const depth = ev.find((e) => e.type === "HitDepth");
    if (depth && depth.type === "HitDepth") this.fieldUi.depth = depth.row as Row;
    if (this.fieldUi.direction && this.fieldUi.depth) {
      this.fieldUi.landing = { col: this.fieldUi.direction, row: this.fieldUi.depth };
    }
    const cls = ev.find((e) => e.type === "HitClassified");
    if (cls && cls.type === "HitClassified") {
      this.fieldUi.message = describeEvent(cls);
    }
    // Play home run sound if depth is 12
    if (this.fieldUi.depth === 12) {
      playHomeRunSound();
    }
    // Start spin animation
    this.fieldUi.phase = "SpinningDepth";
    this.render();
    // After animation completes, show resolved
    setTimeout(() => {
      if (!this.fieldUi) return;
      this.fieldUi.phase = "Resolved";
      this.render();
    }, 2400);
  }

  private afterHitContinue(): void {
    this.fieldUi = undefined as FieldPhaseUiState | undefined;
    const snap = this.game.snapshot();
    if (snap.status === "GameOver") {
      this.phase = { kind: "GameOver" };
      this.render();
      return;
    }
    this.startNextAtBat();
  }

  private handleGridClick(cell: SVGPathElement): void {
    if (!this.fieldUi) return;
    const col = cell.dataset.col as Column | undefined;
    const row = cell.dataset.row ? (Number(cell.dataset.row) as Row) : undefined;
    if (!col || !row) return;
    const fielderIdx = this.fieldUi.fielders.findIndex((f) => f.col === col && f.row === row);
    if (fielderIdx >= 0) {
      // Toggle selection.
      this.fieldUi.selectedFielderIndex =
        this.fieldUi.selectedFielderIndex === fielderIdx ? undefined : fielderIdx;
      this.render();
      return;
    }
    if (this.fieldUi.selectedFielderIndex !== undefined) {
      this.fieldUi.fielders[this.fieldUi.selectedFielderIndex] = { col, row };
      this.fieldUi.selectedFielderIndex = undefined as number | undefined;
      this.render();
    }
  }
}

function sideKey(side: TeamSide): "home" | "away" {
  return side === "Home" ? "home" : "away";
}

// Suppress unused import referenced only by types/strings:
void COLUMNS;
