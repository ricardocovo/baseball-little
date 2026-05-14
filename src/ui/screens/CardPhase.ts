import type { GameSnapshot } from "../../engine/GameState.ts";
import type { BatterCard, PitcherCard } from "../../domain/cards.ts";
import {
  BATTER_CARD_LABELS,
  PITCHER_CARD_LABELS,
  BATTER_CARD_IMAGES,
  PITCHER_CARD_IMAGES,
} from "../../domain/cards.ts";
import { getCardImageSrc } from "../assets/cardImages.ts";
import { renderBatterHand, renderPitcherHand, cardBack } from "../components/Hand.ts";

export type CardPhaseProps = {
  snap: GameSnapshot;
  humanRole: "batter" | "pitcher";
  /** The human's selection (locked once both have selected). */
  humanSelection?: BatterCard | PitcherCard;
  /** AI selection (revealed after human selects). */
  aiSelection?: BatterCard | PitcherCard;
  /** When true, both selections are revealed and we wait for "Continue". */
  revealed: boolean;
  /** When true, AI is "thinking". */
  aiThinking: boolean;
  /** Outcome message to show after reveal. */
  outcomeMessage?: string;
};

export function renderCardPhase(props: CardPhaseProps): string {
  const { snap, humanRole, humanSelection, aiSelection, revealed, aiThinking, outcomeMessage } = props;
  const offenseSide = snap.half === "Top"
    ? (snap.firstAtBat === "Away" ? "Away" : "Home")
    : (snap.firstAtBat === "Away" ? "Home" : "Away");
  const offenseTeam = offenseSide === "Home" ? snap.teams.home : snap.teams.away;
  const batter = offenseTeam.lineup[snap.battingIndex[offenseSide === "Home" ? "home" : "away"]];

  const myCardSide = humanRole === "batter" ? "Batter" : "Pitcher";
  const aiCardSide = humanRole === "batter" ? "Pitcher" : "Batter";

  const reveal = (sel: string | undefined, kind: "batter" | "pitcher", label: string) => {
    if (!sel) return cardBack(kind);
    const text = kind === "batter" ? BATTER_CARD_LABELS[sel as BatterCard] : PITCHER_CARD_LABELS[sel as PitcherCard];
    const imgFile = kind === "batter" ? BATTER_CARD_IMAGES[sel as BatterCard] : PITCHER_CARD_IMAGES[sel as PitcherCard];
    const imgSrc = getCardImageSrc(imgFile);
    return `<div class="card ${kind} revealed" aria-label="${label}: ${text}"><img class="card-img" src="${imgSrc}" alt="${text}" /></div>`;
  };

  const showHumanReveal = revealed || humanSelection !== undefined;
  const showAiReveal = revealed;

  const aiKind: "batter" | "pitcher" = humanRole === "batter" ? "pitcher" : "batter";
  const humanKind: "batter" | "pitcher" = humanRole;

  const continueBtn = revealed
    ? `<button id="continue" class="primary">Continue</button>`
    : ``;

  return `
    <section class="card-phase">
      <header class="atbat-header">
        <div>At bat: <strong>${batter?.name}</strong> (${batter?.handedness[0]}HB, ${batter?.strength})</div>
        <div>You are the <strong>${humanRole}</strong>.</div>
      </header>

      <div class="matchup">
        <div class="opponent">
          <div class="label">Computer (${aiCardSide})</div>
          ${showAiReveal ? reveal(aiSelection, aiKind, aiCardSide) : (aiThinking ? `<div class="thinking">Thinking…</div>` : cardBack(aiKind))}
        </div>
        <div class="vs">vs</div>
        <div class="me">
          <div class="label">You (${myCardSide})</div>
          ${showHumanReveal ? reveal(humanSelection, humanKind, myCardSide) : `<div class="prompt">Pick a card</div>`}
        </div>
      </div>

      ${outcomeMessage ? `<div class="outcome">${outcomeMessage}</div>` : ""}

      <div class="actions">${continueBtn}</div>
    </section>
  `;
}

export function renderCardHand(props: CardPhaseProps): string {
  const { snap, humanRole, humanSelection, revealed } = props;
  if (revealed) return "";

  const humanHand = humanRole === "batter"
    ? snap.decks[snap.humanSide === "Home" ? "home" : "away"].batter
    : snap.decks[snap.humanSide === "Home" ? "home" : "away"].pitcher;

  const humanHandHtml = humanRole === "batter"
    ? renderBatterHand(humanHand as BatterCard[], humanSelection as BatterCard | undefined)
    : renderPitcherHand(humanHand as PitcherCard[], humanSelection as PitcherCard | undefined);

  return `<div class="your-hand"><h3>Your hand (${humanRole})</h3>${humanHandHtml}</div>`;
}
