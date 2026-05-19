import { t } from "../../i18n/i18n.ts";
import { renderModal } from "./Modal.ts";

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function section(title: string, body: string): string {
  return `<section class="instructions-section">
    <h3 class="instructions-section-title">${escapeText(title)}</h3>
    <div class="instructions-section-body">${body}</div>
  </section>`;
}

function para(key: Parameters<typeof t>[0]): string {
  return `<p>${escapeText(t(key))}</p>`;
}

function bulletList(items: string[]): string {
  return `<ul>${items.map((i) => `<li>${escapeText(i)}</li>`).join("")}</ul>`;
}

function renderInstructionsContent(): string {
  return [
    section(t("instructions.s1Title"), para("instructions.s1Body")),
    section(t("instructions.s2Title"), para("instructions.s2Body")),
    section(
      t("instructions.s3Title"),
      bulletList([
        t("instructions.s3Walk"),
        t("instructions.s3Sacrifice"),
        t("instructions.s3StolenBase"),
        t("instructions.s3HitAndRun"),
        t("instructions.s3Box"),
        t("instructions.s3NoPitch"),
      ]),
    ),
    section(t("instructions.s4Title"), para("instructions.s4Body")),
    section(t("instructions.s5Title"), para("instructions.s5Body")),
    section(t("instructions.s6Title"), para("instructions.s6Body")),
    section(
      t("instructions.s7Title"),
      bulletList([
        t("instructions.s7Single"),
        t("instructions.s7Double"),
        t("instructions.s7Triple"),
        t("instructions.s7HomeRun"),
      ]),
    ),
    section(t("instructions.s8Title"), para("instructions.s8Body")),
  ].join("");
}

export function renderInstructionsModal(open = false): string {
  return renderModal({
    id: "instructions",
    title: t("instructions.title"),
    content: renderInstructionsContent(),
    open,
  });
}
