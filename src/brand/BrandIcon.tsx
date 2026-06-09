// <BrandIcon> — renders a SPECIFIC named tool with its REAL logo + official brand
// colour. When the tool isn't in simple-icons, falls back to a name-pill in the
// tool's brand colour with a coloured left border. A tool is never a plain grey box.
//
// Priority rule: a tool's brand colour wins over the stage colour for that node.
// (Generic concepts use the abstract shape alphabet instead — see ../shapes.)
import React from "react";
import { ICON_BY_SLUG, isPale, readableLabel, rgba } from "./icons";
import { getTool, type ToolEntry } from "./registry";

interface BrandIconProps {
  slug?: string; // direct simple-icons slug
  name?: string; // or a registry tool name (resolves slug + fallback colour)
  size?: number; // logo box size in px (default 22)
  showLabel?: boolean; // render the tool name beside the logo (default true)
}

// The bare logo mark (official path in official hex), with a pale-colour guard.
export const BrandMark: React.FC<{ slug: string; size?: number }> = ({ slug, size = 22 }) => {
  const icon = ICON_BY_SLUG[slug];
  if (!icon) return null;
  const hex = `#${icon.hex}`;
  const pale = isPale(hex);
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 rounded-lg"
      style={{
        width: size + 14,
        height: size + 14,
        // legibility guard: pale logos (e.g. Hugging Face yellow) get a tinted chip
        background: pale ? rgba(hex, 0.16) : "transparent",
        border: pale ? `1px solid ${rgba(hex, 0.35)}` : "1px solid transparent",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={icon.title}>
        <title>{icon.title}</title>
        <path d={icon.path} fill={hex} />
      </svg>
    </span>
  );
};

export const BrandIcon: React.FC<BrandIconProps> = ({ slug, name, size = 22, showLabel = true }) => {
  // Resolve either a registry tool (by name) or a raw slug.
  let tool: ToolEntry | undefined = name ? getTool(name) : undefined;
  const resolvedSlug = slug ?? tool?.slug;
  const icon = resolvedSlug ? ICON_BY_SLUG[resolvedSlug] : undefined;
  const display = name ?? icon?.title ?? slug ?? "tool";
  const brand = icon ? `#${icon.hex}` : tool?.brand ?? "#5E6B76";

  // --- Fallback pill: tool not in simple-icons ---
  if (!icon) {
    const label = readableLabel(brand);
    return (
      <span
        className="inline-flex items-center gap-2 rounded-xl bg-white pl-2.5 pr-3 py-2 shadow-card"
        style={{ borderLeft: `4px solid ${brand}`, border: `1px solid ${rgba(brand, 0.2)}`, borderLeftWidth: 4 }}
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
          style={{ background: brand }}
          aria-hidden
        />
        <span className="font-body text-sm font-semibold" style={{ color: label }}>
          {display}
        </span>
      </span>
    );
  }

  // --- Real logo chip ---
  if (!showLabel) return <BrandMark slug={resolvedSlug!} size={size} />;
  return (
    <span className="inline-flex items-center gap-2.5 rounded-xl bg-white pl-2 pr-3.5 py-2 shadow-card border border-border">
      <BrandMark slug={resolvedSlug!} size={size} />
      <span className="font-body text-sm font-semibold" style={{ color: readableLabel(brand) }}>
        {display}
      </span>
    </span>
  );
};

export default BrandIcon;
