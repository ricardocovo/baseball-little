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
  const { humanRole, humanSelection, aiSelection, revealed, aiThinking, outcomeMessage } = props;

  const myCardSide = t(`cardPhase.sideLabel.${humanRole}`);
  const aiRole: "batter" | "pitcher" = humanRole === "batter" ? "pitcher" : "batter";
  const aiCardSide = t(`cardPhase.sideLabel.${aiRole}`);

  const reveal = (sel: string | undefined, kind: "batter" | "pitcher", label: string, sideLabelHtml: string) => {
    if (!sel) return cardBack(kind, sideLabelHtml);
    const text = kind === "batter"
      ? t(`cards.batter.${sel as BatterCard}`)
      : t(`cards.pitcher.${sel as PitcherCard}`);
    const imgFile = kind === "batter" ? BATTER_CARD_IMAGES[sel as BatterCard] : PITCHER_CARD_IMAGES[sel as PitcherCard];
    const imgSrc = getCardImageSrc(imgFile);
    return `<div class="card ${kind} revealed" aria-label="${label}: ${text}">${sideLabelHtml}<img class="card-img" src="${imgSrc}" alt="${text}" /></div>`;
  };

  const showHumanReveal = revealed || humanSelection !== undefined;
  const showAiReveal = revealed;

  const aiKind: "batter" | "pitcher" = humanRole === "batter" ? "pitcher" : "batter";
  const humanKind: "batter" | "pitcher" = humanRole;

  const continueBtn = revealed
    ? `<button id="continue" class="primary">${t("cardPhase.continue")}</button>`
    : ``;

  const humanLabelHtml = `<div class="card-side-label"><span class="who">${t("cardPhase.you", { side: myCardSide })}</span></div>`;
  const aiLabelHtml = `<div class="card-side-label"><span class="who">${t("cardPhase.computer", { side: aiCardSide })}</span></div>`;

  return `
    <section class="card-phase">
      <div class="matchup">
        <div class="me">
          ${showHumanReveal ? reveal(humanSelection, humanKind, myCardSide, humanLabelHtml) : `<div class="card ${humanKind} prompt-card">${humanLabelHtml}<div class="prompt-text">${t("cardPhase.pickCard")}</div></div>`}
        </div>
        <div class="vs">${t("cardPhase.vs")}</div>
        <div class="opponent">
          ${showAiReveal ? reveal(aiSelection, aiKind, aiCardSide, aiLabelHtml) : (aiThinking ? `<div class="card ${aiKind} prompt-card thinking-card">${aiLabelHtml}<div class="prompt-text">${t("cardPhase.thinking")}</div></div>` : cardBack(aiKind, aiLabelHtml))}
        </div>
      </div>

      ${outcomeMessage ? `<div class="outcome">${outcomeMessage}</div>` : ""}

      <div class="actions">${continueBtn}</div>
    </section>
  `;
}

export function renderCardHand(props: CardPhaseProps): string {
  const { snap, humanRole, humanSelection, revealed } = props;

  const humanHand = humanRole === "batter"
    ? snap.decks[snap.humanSide === "Home" ? "home" : "away"].batter
    : snap.decks[snap.humanSide === "Home" ? "home" : "away"].pitcher;

  const humanHandHtml = humanRole === "batter"
    ? renderBatterHand(humanHand as BatterCard[], humanSelection as BatterCard | undefined)
    : renderPitcherHand(humanHand as PitcherCard[], humanSelection as PitcherCard | undefined);

  const lockedClass = revealed ? " your-hand--locked" : "";
  return `<div class="your-hand${lockedClass}"><h3>${t("cardPhase.yourHand", { role: t(`cardPhase.role.${humanRole}`) })}</h3>${humanHandHtml}</div>`;
}
