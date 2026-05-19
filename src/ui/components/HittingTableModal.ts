import { t } from "../../i18n/i18n.ts";
import { BATTER_CARDS, PITCHER_CARDS } from "../../domain/cards.ts";
import { resolveCongruence } from "../../domain/congruence.ts";
import type { BatterCard, PitcherCard } from "../../domain/cards.ts";
import { renderModal } from "./Modal.ts";

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cellDisplay(batter: BatterCard, pitcher: PitcherCard): { text: string; cls: string } {
  const outcome = resolveCongruence(batter, pitcher);
  switch (outcome.kind) {
    case "Hit":
      return { text: "H", cls: "ct-hit" };
    case "StrikeOut":
      return { text: "SO", cls: "ct-so" };
    case "BaseOnBalls":
      return { text: "BB", cls: "ct-bb" };
    case "NoPlay":
      return { text: "—", cls: "ct-np" };
    case "SacrificeAttempt":
      return { text: "SAC", cls: "ct-sac" };
    case "Special":
      switch (outcome.reason) {
        case "StolenBase_Safe":
          return { text: "✓", cls: "ct-steal-safe" };
        case "StolenBase_Caught":
          return { text: "✗", cls: "ct-steal-caught" };
        case "StolenBase_NoPitch":
          return { text: "★", cls: "ct-special" };
        case "HitAndRun_NoPitch":
          return { text: "†", cls: "ct-special" };
      }
  }
}

function renderTable(): string {
  const pitcherKeys = PITCHER_CARDS as readonly PitcherCard[];
  const batterKeys = BATTER_CARDS as readonly BatterCard[];

  const headerCells = pitcherKeys
    .map((p) => `<th class="ct-pitcher-header" scope="col">${escapeText(t(`cards.pitcher.${p}`))}</th>`)
    .join("");

  const rows = batterKeys
    .map((b) => {
      const cells = pitcherKeys
        .map((p) => {
          const { text, cls } = cellDisplay(b, p);
          return `<td class="ct-cell ${cls}">${escapeText(text)}</td>`;
        })
        .join("");
      return `<tr><th class="ct-batter-header" scope="row">${escapeText(t(`cards.batter.${b}`))}</th>${cells}</tr>`;
    })
    .join("");

  return `<div class="ct-scroll-wrapper">
  <table class="congruence-table" aria-label="${escapeText(t("hittingTable.title"))}">
    <thead>
      <tr>
        <th class="ct-corner" scope="col">${escapeText(t("hittingTable.batter"))} \\ ${escapeText(t("hittingTable.pitcher"))}</th>
        ${headerCells}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>`;
}

function renderLegend(): string {
  const items: Array<Parameters<typeof t>[0]> = [
    "hittingTable.legendH",
    "hittingTable.legendSO",
    "hittingTable.legendBB",
    "hittingTable.legendSAC",
    "hittingTable.legendNoPlay",
    "hittingTable.legendStealSafe",
    "hittingTable.legendStealCaught",
    "hittingTable.legendStealNoPitch",
    "hittingTable.legendHitRunNoPitch",
  ];
  const lis = items.map((k) => `<li>${escapeText(t(k))}</li>`).join("");
  return `<div class="ct-legend">
  <h3 class="ct-legend-title">${escapeText(t("hittingTable.legendTitle"))}</h3>
  <ul>${lis}</ul>
</div>`;
}

export function renderHittingTableModal(open = false): string {
  return renderModal({
    id: "hitting-table",
    title: t("hittingTable.title"),
    content: renderTable() + renderLegend(),
    open,
  });
}
