// Reusable SVG building blocks for composing page diagrams on a <Canvas>.
// Everything here draws in SVG user-space so glyphs, brand logos, arrows and
// labels all live on one canvas and can be connected.
import React from "react";
import { THEME } from "../theme";
import { FlowArrow } from "../shapes";
import { ICON_BY_SLUG, isPale, rgba, readableLabel } from "../brand/icons";
import { getTool } from "../brand/registry";

const tint = (hex: string, a: number) => rgba(hex, a);

/* ---- text ---- */
export const Label: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
  font?: string;
}> = ({ x, y, children, size = 13, color = THEME.ink, weight = 500, anchor = "middle", font = "'Inter', sans-serif" }) => (
  <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontFamily={font} fontSize={size} fill={color} fontWeight={weight}>
    {children}
  </text>
);

/* ---- arrow between two points ---- */
export const Arrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number; accent: string; animated?: boolean;
}> = ({ x1, y1, x2, y2, accent, animated = true }) => (
  <FlowArrow accent={accent} x1={x1} y1={y1} x2={x2} y2={y2} animated={animated} />
);

/* ---- a captioned glyph: places a shape glyph in a box and a label beneath ---- */
export const Stage_: React.FC<{
  x: number; y: number; w: number; h: number;
  glyph: (p: { x: number; y: number; w: number; h: number; accent: string }) => React.ReactNode;
  accent: string; label?: string; sub?: string;
}> = ({ x, y, w, h, glyph, accent, label, sub }) => (
  <g>
    {glyph({ x, y, w, h, accent })}
    {label && <Label x={x + w / 2} y={y + h + 12} size={13} weight={600} color={THEME.ink}>{label}</Label>}
    {sub && <Label x={x + w / 2} y={y + h + 28} size={11} color={THEME.ink2} weight={500}>{sub}</Label>}
  </g>
);

/* ---- BrandNode: a chip showing a real product's logo + name (SVG-native) ----
   Resolves by registry `name` (preferred) or raw `slug`. Falls back to a
   brand-colour name-pill. Brand colour wins over stage colour for this node. */
export const BrandNode: React.FC<{
  x: number; y: number; w?: number; h?: number; name?: string; slug?: string; sub?: string;
}> = ({ x, y, w = 158, h = 50, name, slug, sub }) => {
  const tool = name ? getTool(name) : undefined;
  const useSlug = slug ?? tool?.slug;
  const icon = useSlug ? ICON_BY_SLUG[useSlug] : undefined;
  const display = name ?? icon?.title ?? slug ?? "tool";
  const brand = icon ? `#${icon.hex}` : tool?.brand ?? THEME.ink2;
  const labelColor = readableLabel(brand);
  const pale = isPale(brand);
  const cy = y + h / 2;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={13} fill="#FFFFFF" stroke={icon ? THEME.border : brand} strokeWidth={icon ? 1.5 : 1.6} />
      {!icon && <rect x={x} y={y} width={5} height={h} rx={2.5} fill={brand} />}
      {icon ? (
        <g>
          {pale && <rect x={x + 10} y={cy - 17} width={34} height={34} rx={9} fill={tint(brand, 0.16)} stroke={tint(brand, 0.35)} strokeWidth={1} />}
          <g transform={`translate(${x + 16}, ${cy - 11}) scale(${22 / 24})`}>
            <path d={icon.path} fill={brand} />
          </g>
        </g>
      ) : (
        <circle cx={x + 20} cy={cy} r={5} fill={brand} />
      )}
      <Label x={x + (icon ? 48 : 34)} y={sub ? cy - 7 : cy} anchor="start" size={14} weight={700} color={labelColor}>
        {display}
      </Label>
      {sub && (
        <Label x={x + (icon ? 48 : 34)} y={cy + 10} anchor="start" size={10.5} weight={500} color={THEME.ink2}>
          {sub}
        </Label>
      )}
    </g>
  );
};

/* ---- Pill: a small category/tag chip (stage-coloured) ---- */
export const Pill: React.FC<{ x: number; y: number; text: string; accent: string; w?: number }> = ({ x, y, text, accent, w }) => {
  const pw = w ?? Math.max(54, text.length * 7.6 + 26);
  const h = 30;
  return (
    <g>
      <rect x={x} y={y} width={pw} height={h} rx={15} fill={tint(accent, 0.12)} stroke={accent} strokeWidth={1.8} />
      <Label x={x + pw / 2} y={y + h / 2} size={12.5} weight={600} color={accent}>{text}</Label>
    </g>
  );
};

/* ---- LabelBox: a plain rounded box with a centred label (generic component) ---- */
export const LabelBox: React.FC<{
  x: number; y: number; w: number; h: number; text: string; accent: string; sub?: string; strong?: boolean;
}> = ({ x, y, w, h, text, accent, sub, strong }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={14} fill={strong ? tint(accent, 0.16) : "#FFFFFF"} stroke={accent} strokeWidth={2.2} />
    <Label x={x + w / 2} y={sub ? y + h / 2 - 9 : y + h / 2} size={13.5} weight={700} color={THEME.ink}>{text}</Label>
    {sub && <Label x={x + w / 2} y={y + h / 2 + 11} size={11} weight={500} color={THEME.ink2}>{sub}</Label>}
  </g>
);

/* ---- Boundary: a dashed group frame with a small title (e.g. a pipeline, a monolith) ---- */
export const Boundary: React.FC<{
  x: number; y: number; w: number; h: number; title: string; accent: string; danger?: boolean;
}> = ({ x, y, w, h, title, accent, danger }) => {
  const c = danger ? "#EF5C46" : accent;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={tint(c, 0.05)} stroke={c} strokeWidth={1.8} strokeDasharray="7 6" />
      <g>
        <rect x={x + 14} y={y - 12} width={title.length * 7.4 + 20} height={24} rx={12} fill="#FFFFFF" stroke={c} strokeWidth={1.4} />
        <Label x={x + 14 + (title.length * 7.4 + 20) / 2} y={y} size={11.5} weight={700} color={c}>{title}</Label>
      </g>
    </g>
  );
};

/* ---- Warn: a small failure marker for pitfalls ---- */
export const Warn: React.FC<{ x: number; y: number; text?: string }> = ({ x, y, text }) => {
  const c = "#EF5C46";
  return (
    <g>
      <circle cx={x} cy={y} r={13} fill={tint(c, 0.14)} stroke={c} strokeWidth={2} />
      <Label x={x} y={y} size={15} weight={800} color={c}>!</Label>
      {text && <Label x={x + 20} y={y} anchor="start" size={11.5} weight={600} color={c}>{text}</Label>}
    </g>
  );
};
