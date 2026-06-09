// Brand logos sourced from the `simple-icons` package (official SVG path + official
// brand hex). We import only the tools this book uses, so the bundle stays small.
// Logos are trademarks of their owners, used purely to identify the real product.
import {
  siPython,
  siPoetry,
  siHuggingface,
  siMongodb,
  siQdrant,
  siDocker,
  siGithub,
  siGithubactions,
  siSelenium,
  siFastapi,
  siPydantic,
  siLangchain,
  siMistralai,
  siMeta,
} from "simple-icons";

export interface SimpleIconLike {
  title: string;
  slug: string;
  hex: string; // official brand hex, WITHOUT leading '#'
  path: string; // 24x24 SVG path
}

// Map of slug → icon, built from the imported set. <BrandIcon slug> looks up here.
export const ICON_BY_SLUG: Record<string, SimpleIconLike> = Object.fromEntries(
  [
    siPython,
    siPoetry,
    siHuggingface,
    siMongodb,
    siQdrant,
    siDocker,
    siGithub,
    siGithubactions,
    siSelenium,
    siFastapi,
    siPydantic,
    siLangchain,
    siMistralai,
    siMeta,
  ].map((i) => [i.slug, i as SimpleIconLike])
);

/* ---------- colour utilities (for the legibility guard) ---------- */

export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}

// WCAG relative luminance, 0 (black) … 1 (white)
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// A brand colour is "pale" (hard to read on white) above this luminance.
// Tuned to catch pale yellows (Hugging Face) and pale blues (LangChain),
// while leaving readable mid-tones (Poetry, Docker blue) untouched.
export function isPale(hex: string): boolean {
  return luminance(hex) > 0.45;
}

export function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// Mix a colour toward ink so a pale brand colour becomes a readable label colour.
export function readableLabel(hex: string): string {
  if (!isPale(hex)) return hex;
  const [r, g, b] = hexToRgb(hex);
  const [ir, ig, ib] = [37, 49, 60]; // ink #25313C
  const t = 0.62; // pull strongly toward ink
  const mix = (a: number, b2: number) => Math.round(a * (1 - t) + b2 * t);
  return `rgb(${mix(r, ir)},${mix(g, ig)},${mix(b, ib)})`;
}
