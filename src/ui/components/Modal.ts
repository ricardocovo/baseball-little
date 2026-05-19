import { t } from "../../i18n/i18n.ts";

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type ModalId = "instructions" | "hitting-table";

/**
 * Wraps `content` in a modal overlay/dialog shell.
 * Pass `open: true` to render the modal in its visible state.
 */
export function renderModal(opts: {
  id: ModalId;
  title: string;
  content: string;
  open?: boolean;
}): string {
  const hidden = opts.open ? "" : " hidden";
  return `
<div class="modal-overlay"${hidden} id="modal-${opts.id}" role="dialog" aria-modal="true" aria-labelledby="modal-${opts.id}-title">
  <div class="modal-dialog">
    <div class="modal-header">
      <h2 class="modal-title" id="modal-${opts.id}-title">${escapeText(opts.title)}</h2>
      <button type="button" class="modal-close" data-modal-close="${opts.id}" aria-label="${escapeText(t("modal.close"))}">✕</button>
    </div>
    <div class="modal-body">
      ${opts.content}
    </div>
  </div>
</div>`;
}

/** Wires open/close events for all modals inside `root`. */
export function bindModals(
  root: HTMLElement,
  onToggle: (id: ModalId | null) => void,
): void {
  root.querySelectorAll<HTMLButtonElement>("[data-modal-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.modalOpen as ModalId | undefined;
      if (!id) return;
      const overlay = root.querySelector<HTMLElement>(`#modal-${id}`);
      if (overlay) {
        overlay.removeAttribute("hidden");
        overlay.querySelector<HTMLButtonElement>(".modal-close")?.focus();
      }
      onToggle(id);
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.modalClose as ModalId | undefined;
      if (!id) return;
      root.querySelector<HTMLElement>(`#modal-${id}`)?.setAttribute("hidden", "");
      onToggle(null);
    });
  });

  root.querySelectorAll<HTMLElement>(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.setAttribute("hidden", "");
        onToggle(null);
      }
    });
  });

  // Close on Escape key
  const handleKey = (e: KeyboardEvent): void => {
    if (e.key !== "Escape") return;
    const open = root.querySelector<HTMLElement>(".modal-overlay:not([hidden])");
    if (open) {
      open.setAttribute("hidden", "");
      onToggle(null);
    }
  };
  document.addEventListener("keydown", handleKey, { once: true });
}
