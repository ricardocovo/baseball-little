// Animation helpers for game events.
//
// Two primitives are exposed:
//   * playCallout(host, opts)   — appends a transient overlay (arcade-style
//     callout text) to `host`, removed automatically after the animation.
//   * animateBallArc(svg, ...)  — animates a small SVG circle along a
//     quadratic arc from `from` to `to`; returns a Promise that resolves
//     when the arc finishes.
//
// Both helpers are no-ops when `durationMs <= 0` or the user prefers
// reduced motion, so callers can pass the configured `animMs` directly and
// rely on the helpers to opt out.

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  } catch {
    return false;
  }
}

export type CalloutVariant =
  | "out"
  | "hit"
  | "single"
  | "double"
  | "triple"
  | "homerun"
  | "error"
  | "walk"
  | "strikeout"
  | "run"
  | "noplay";

export type CalloutOptions = {
  text: string;
  variant: CalloutVariant;
  durationMs: number;
  /** Optional small badge (e.g. "+2" runs on a home run). */
  badge?: string;
};

export function playCallout(host: HTMLElement | null | undefined, opts: CalloutOptions): void {
  if (!host) return;
  if (opts.durationMs <= 0 || prefersReducedMotion()) return;
  if (typeof document === "undefined") return;

  const el = document.createElement("div");
  el.className = `callout callout-${opts.variant}`;
  el.style.setProperty("--callout-ms", `${opts.durationMs}ms`);
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");

  const main = document.createElement("span");
  main.className = "callout-text";
  main.textContent = opts.text;
  el.appendChild(main);

  if (opts.badge) {
    const badge = document.createElement("span");
    badge.className = "callout-badge";
    badge.textContent = opts.badge;
    el.appendChild(badge);
  }

  host.appendChild(el);

  let cleared = false;
  const cleanup = (): void => {
    if (cleared) return;
    cleared = true;
    el.remove();
  };
  el.addEventListener("animationend", cleanup, { once: true });
  // Safety net in case animationend never fires (e.g. element detached early).
  setTimeout(cleanup, opts.durationMs + 400);
}

export type Point = { readonly x: number; readonly y: number };

/**
 * Animate a small ball SVG element from `from` to `to` along a quadratic
 * arc. Resolves when the animation completes (or immediately when disabled).
 */
export function animateBallArc(
  svg: SVGSVGElement | null | undefined,
  from: Point,
  to: Point,
  durationMs: number,
): Promise<void> {
  if (!svg) return Promise.resolve();
  if (durationMs <= 0 || prefersReducedMotion()) return Promise.resolve();
  if (typeof document === "undefined" || typeof requestAnimationFrame !== "function") {
    return Promise.resolve();
  }

  const svgNs = "http://www.w3.org/2000/svg";
  const ball = document.createElementNS(svgNs, "circle");
  ball.setAttribute("class", "ball-arc");
  ball.setAttribute("r", "8");
  ball.setAttribute("cx", String(from.x));
  ball.setAttribute("cy", String(from.y));
  svg.appendChild(ball);

  // Arc peak: lift higher when the throw is longer.
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const lift = Math.max(60, distance * 0.35);
  const peakY = Math.min(from.y, to.y) - lift;
  const midX = (from.x + to.x) / 2;

  const start = performance.now();
  return new Promise<void>((resolve) => {
    const tick = (now: number): void => {
      const elapsed = now - start;
      const t = Math.min(1, Math.max(0, elapsed / durationMs));
      // Quadratic Bezier (from, [midX, peakY], to).
      const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
      const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * peakY + t * t * to.y;
      ball.setAttribute("cx", String(x));
      ball.setAttribute("cy", String(y));
      const fadeIn = Math.min(1, t / 0.08);
      const fadeOut = t > 0.92 ? Math.max(0, (1 - t) / 0.08) : 1;
      ball.setAttribute("opacity", String(Math.min(fadeIn, fadeOut)));
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        ball.remove();
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}
