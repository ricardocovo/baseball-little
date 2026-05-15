import type { GameSnapshot } from "../../engine/GameState.ts";
import type { BatterCard, PitcherCard } from "../../domain/cards.ts";
import { BATTER_CARD_IMAGES, PITCHER_CARD_IMAGES } from "../../domain/cards.ts";
import { getCardImageSrc } from "../assets/cardImages.ts";
import { renderBatterHand, renderPitcherHand, cardBack } from "../components/Hand.ts";
import { t } from "../../i18n/i18n.ts";

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

  const myCardSide = t(`cardPhase.sideLabel.${humanRole}`);
  const aiRole: "batter" | "pitcher" = humanRole === "batter" ? "pitcher" : "batter";
  const aiCardSide = t(`cardPhase.sideLabel.${aiRole}`);

  const reveal = (sel: string | undefined, kind: "batter" | "pitcher", label: string) => {
    if (!sel) return cardBack(kind);
    const text = kind === "batter"
      ? t(`cards.batter.${sel as BatterCard}`)
      : t(`cards.pitcher.${sel as PitcherCard}`);
    const imgFile = kind === "batter" ? BATTER_CARD_IMAGES[sel as BatterCard] : PITCHER_CARD_IMAGES[sel as PitcherCard];
    const imgSrc = getCardImageSrc(imgFile);
    return `<div class="card ${kind} revealed" aria-label="${label}: ${text}"><img class="card-img" src="${imgSrc}" alt="${text}" /></div>`;
  };

  const showHumanReveal = revealed || humanSelection !== undefined;
  const showAiReveal = revealed;

  const aiKind: "batter" | "pitcher" = humanRole === "batter" ? "pitcher" : "batter";
  const humanKind: "batter" | "pitcher" = humanRole;

  const continueBtn = revealed
    ? `<button id="continue" class="primary">${t("cardPhase.continue")}</button>`
    : ``;

  const batterName = batter?.name ?? "";
  const batterHand = batter ? (batter.handedness[0] ?? "") : "";
  const batterStrength = batter ? t(`strength.${batter.strength}`) : "";

  return `
    <section class="card-phase">
      <header class="atbat-header">
        <div>${t("cardPhase.atBat", { name: `<strong>${batterName}</strong>`, hand: batterHand, strength: batterStrength })}</div>
        <div>${t("cardPhase.youAreThe", { role: `<strong>${t(`cardPhase.role.${humanRole}`)}</strong>` })}</div>
      </header>

      <div class="matchup">
        <div class="me">
          <div class="label">${t("cardPhase.you", { side: myCardSide })}</div>
          ${showHumanReveal ? reveal(humanSelection, humanKind, myCardSide) : `<div class="prompt">${t("cardPhase.pickCard")}</div>`}
        </div>
        <div class="vs">${t("cardPhase.vs")}</div>
        <div class="opponent">
          <div class="label">${t("cardPhase.computer", { side: aiCardSide })}</div>
          ${showAiReveal ? reveal(aiSelection, aiKind, aiCardSide) : (aiThinking ? `<div class="thinking">${t("cardPhase.thinking")}</div>` : cardBack(aiKind))}
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

  return `<div class="your-hand"><h3>${t("cardPhase.yourHand", { role: t(`cardPhase.role.${humanRole}`) })}</h3>${humanHandHtml}</div>`;
}
