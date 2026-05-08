import hitSrc from "./bathitball.mp3";
import outSrc from "./baseball-out.mp3";
import homerunSrc from "./homerun-baseball.mp3";

export function playHitSound(): void {
  new Audio(hitSrc).play();
}

export function playStrikeOutSound(): void {
  new Audio(outSrc).play();
}

export function playHomeRunSound(): void {
  new Audio(homerunSrc).play();
}
