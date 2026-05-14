const cardImageModules = import.meta.glob("../../images/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export function getCardImageSrc(fileName: string): string {
  const src = cardImageModules[`../../images/${fileName}`];
  if (!src) {
    throw new Error(`Missing card image asset: ${fileName}`);
  }
  return src;
}
