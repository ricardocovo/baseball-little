/**
 * SVG spinner wheel component.
 * Renders a circular wheel with labeled wedges (like a board-game spinner).
 * Supports animated spin via CSS class toggling.
 */

export type SpinnerProps = {
  /** Unique id for the spinner element (used for CSS animation targeting). */
  id: string;
  /** Labels for each wedge (e.g. ["A","B",…,"O"] or ["1","2",…,"12"]). */
  segments: readonly string[];
  /** Which segment the spinner has landed on (undefined = not yet spun). */
  result?: string;
  /** True while the spin animation is playing. */
  spinning: boolean;
  /** Title shown above the spinner. */
  title: string;
  /** Optional HTML for an action button overlaid on the spinner centre. */
  actionHtml?: string;
};

/**
 * Calculate the SVG rotation angle so the pointer (at 12-o'clock) ends up
 * pointing at the centre of the target segment after the animation.
 * Segment 0 starts at 12-o'clock and goes clockwise.
 */
function resultAngle(segments: readonly string[], result: string): number {
  const idx = segments.indexOf(result);
  if (idx < 0) return 0;
  const sliceAngle = 360 / segments.length;
  // Centre of the target wedge, measured clockwise from 12-o'clock.
  // We want to rotate the wheel so that wedge ends up under the pointer,
  // so we spin multiple full turns + the target offset.
  return 360 * 5 + idx * sliceAngle + sliceAngle / 2;
}

export function renderSpinner(props: SpinnerProps): string {
  const { id, segments, result, spinning, title, actionHtml } = props;
  const n = segments.length;
  const cx = 120;
  const cy = 120;
  const r = 105;
  const sliceAngle = 360 / n;

  // Build wedge paths
  const wedges: string[] = [];
  for (let i = 0; i < n; i++) {
    const startDeg = i * sliceAngle - 90; // -90 so segment 0 starts at top
    const endDeg = startDeg + sliceAngle;
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const fill = i % 2 === 0 ? "#cc2233" : "#e84455";
    const isResult = result === segments[i];
    const wedgeFill = isResult && !spinning ? "#ffcc00" : fill;

    // Label position at ~65% of radius, at mid-angle
    const midRad = ((startDeg + sliceAngle / 2) * Math.PI) / 180;
    const lx = cx + r * 0.65 * Math.cos(midRad);
    const ly = cy + r * 0.65 * Math.sin(midRad);
    const labelRotation = startDeg + sliceAngle / 2 + 90;

    wedges.push(`
      <path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z"
            fill="${wedgeFill}" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <text x="${lx}" y="${ly}"
            transform="rotate(${labelRotation},${lx},${ly})"
            text-anchor="middle" dominant-baseline="central"
            fill="white" font-size="${n > 13 ? 10 : 13}" font-weight="700"
            style="text-shadow: 0 1px 2px rgba(0,0,0,0.6)">${segments[i]}</text>
    `);
  }

  // Calculate rotation for result
  const finalAngle = result ? resultAngle(segments, result) : 0;
  const spinStyle = spinning
    ? `style="animation: spinWheel 2.2s cubic-bezier(0.15, 0.7, 0.2, 1) forwards; --spin-target: ${finalAngle}deg"`
    : result
      ? `style="transform: rotate(${finalAngle}deg)"`
      : "";

  return `
    <div class="spinner-container">
      <div class="spinner-title">${title}</div>
      <div class="spinner-wrapper">
        <svg class="spinner-svg" id="${id}" viewBox="0 0 240 240" width="220" height="220">
          <!-- Outer ring -->
          <circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
          <!-- Wheel group (rotated for animation) -->
          <g class="spinner-wheel" ${spinStyle}>
            ${wedges.join("")}
            <!-- Centre hub -->
            <circle cx="${cx}" cy="${cy}" r="14" fill="#1a1a1a" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            <circle cx="${cx}" cy="${cy}" r="5" fill="#cc0000"/>
          </g>
        </svg>
        <!-- Fixed pointer at top -->
        <div class="spinner-pointer">▼</div>
        ${actionHtml ? `<div class="spinner-action-overlay">${actionHtml}</div>` : ""}
      </div>
    </div>
  `;
}
