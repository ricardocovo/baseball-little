import type { BatterCard, PitcherCard } from "../../domain/cards.ts";
import { BATTER_CARD_IMAGES, PITCHER_CARD_IMAGES } from "../../domain/cards.ts";
import { getCardImageSrc } from "../assets/cardImages.ts";
import { t } from "../../i18n/i18n.ts";

export function renderBatterHand(
  hand: readonly BatterCard[],
  selected?: BatterCard,
): string {
  return renderHand(
    hand,
    selected,
    (c) => t(`cards.batter.${c}` as const),
    (c) => BATTER_CARD_IMAGES[c],
    "batter",
  );
}

export function renderPitcherHand(
  hand: readonly PitcherCard[],
  selected?: PitcherCard,
): string {
  return renderHand(
    hand,
    selected,
    (c) => t(`cards.pitcher.${c}` as const),
    (c) => PITCHER_CARD_IMAGES[c],
    "pitcher",
  );
}

function renderHand<T extends string>(
  hand: readonly T[],
  selected: T | undefined,
  label: (c: T) => string,
  image: (c: T) => string,
  kind: "batter" | "pitcher",
): string {
  // Group identical cards into stacks.
  const counts = new Map<T, number>();
  for (const c of hand) counts.set(c, (counts.get(c) ?? 0) + 1);
  const cards: string[] = [];
  for (const [card, count] of counts.entries()) {
    const sel = selected === card ? "selected" : "";
    const imgSrc = getCardImageSrc(image(card));
    cards.push(`
      <button class="card ${kind} ${sel}" data-card="${card}" aria-label="${label(card)}">
        <img class="card-img" src="${imgSrc}" alt="${label(card)}" />
        <span class="card-count">×${count}</span>
      </button>
    `);
  }
  return `<div class="hand ${kind}-hand">${cards.join("")}</div>`;
}

export function cardBack(kind: "batter" | "pitcher"): string {
  return `<div class="card ${kind} back">?</div>`;
}
