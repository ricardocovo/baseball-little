// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { playCallout, animateBallArc, prefersReducedMotion } from "../src/ui/animations.ts";

beforeEach(() => {
  // Default matchMedia stub: no reduced motion. Individual tests override.
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
});

describe("playCallout", () => {
  it("appends a callout element with the requested variant and text", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    playCallout(host, { text: "HOME RUN!", variant: "homerun", durationMs: 100 });

    const el = host.querySelector(".callout") as HTMLElement | null;
    expect(el).not.toBeNull();
    expect(el?.classList.contains("callout-homerun")).toBe(true);
    expect(el?.textContent).toContain("HOME RUN!");
  });

  it("includes the optional badge when provided", () => {
    const host = document.createElement("div");
    playCallout(host, { text: "HR!", variant: "homerun", durationMs: 100, badge: "+3" });
    expect(host.querySelector(".callout-badge")?.textContent).toBe("+3");
  });

  it("is a no-op when durationMs is 0", () => {
    const host = document.createElement("div");
    playCallout(host, { text: "x", variant: "out", durationMs: 0 });
    expect(host.querySelector(".callout")).toBeNull();
  });

  it("is a no-op when prefers-reduced-motion is set", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }));
    expect(prefersReducedMotion()).toBe(true);

    const host = document.createElement("div");
    playCallout(host, { text: "x", variant: "out", durationMs: 500 });
    expect(host.querySelector(".callout")).toBeNull();
  });
});

describe("animateBallArc", () => {
  it("resolves immediately when durationMs is 0 and inserts no ball", async () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
    document.body.appendChild(svg);
    await animateBallArc(svg, { x: 0, y: 0 }, { x: 100, y: 100 }, 0);
    expect(svg.querySelector(".ball-arc")).toBeNull();
  });

  it("resolves immediately when reduced motion is set", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }));
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
    await animateBallArc(svg, { x: 0, y: 0 }, { x: 100, y: 100 }, 500);
    expect(svg.querySelector(".ball-arc")).toBeNull();
  });
});
