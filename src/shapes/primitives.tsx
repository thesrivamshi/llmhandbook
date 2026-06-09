// THE SHAPE ALPHABET — one shape = one meaning, everywhere. (LIGHT theme.)
// Every glyph is a self-contained <g> that draws inside a box (x,y,w,h) and
// takes an `accent` colour (= the stage colour). Compose them onto a <Canvas>
// to build diagrams, or drop them into <ShapeTile> to show them standalone.
//
// Light visual language:
//   - bodies: white card with a soft accent TINT; structure strokes in the accent
//   - strokes are thick + round so shapes feel friendly
//   - the *meaningful* mark is always the accent
//   - text uses Inter/Jost in ink; tiny labels only in mono
import React from "react";
import { THEME } from "../theme";

export interface GlyphProps {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  accent: string;
}

const SW = 2.8; // shared stroke width — a touch thicker for a friendly feel

// soft accent tint over white (returns rgba string)
function tint(hex: string, a: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const G: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <g transform={`translate(${x},${y})`}>{children}</g>
);

/* 1) MODEL / LLM — a stack of connected nodes (a little neural net) in a rounded box */
export const ModelGlyph: React.FC<GlyphProps> = ({ x = 0, y = 0, w = 120, h = 120, accent }) => {
  const pad = 14;
  const bx = pad, by = pad, bw = w - pad * 2, bh = h - pad * 2;
  const cols = [bx + bw * 0.2, bx + bw * 0.5, bx + bw * 0.8];
  const layers = [3, 2, 3]; // hourglass — unmistakably a network, never a dot grid
  const nodeY = (count: number, i: number) => by + bh * ((i + 1) / (count + 1));
  const r = Math.max(3.6, bw * 0.058);
  const nodes = layers.map((count, li) =>
    Array.from({ length: count }, (_, i) => ({ cx: cols[li], cy: nodeY(count, i) }))
  );
  return (
    <G x={x} y={y}>
      <rect x={bx} y={by} width={bw} height={bh} rx={16} fill={tint(accent, 0.08)} stroke={accent} strokeWidth={SW} />
      {nodes.slice(0, -1).map((layer, li) =>
        layer.flatMap((a, ai) =>
          nodes[li + 1].map((b, bi) => (
            <line key={`e${li}-${ai}-${bi}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke={accent} strokeWidth={1.5} opacity={0.5} />
          ))
        )
      )}
      {nodes.flatMap((layer, li) =>
        layer.map((n, i) => (
          <circle key={`n${li}-${i}`} cx={n.cx} cy={n.cy} r={r} fill={accent} stroke="#FFFFFF" strokeWidth={1.8} />
        ))
      )}
    </G>
  );
};

/* 2) DATA STORE / DB / WAREHOUSE — a cylinder */
export const DataStoreGlyph: React.FC<GlyphProps> = ({ x = 0, y = 0, w = 120, h = 120, accent }) => {
  const pad = 18;
  const cx = pad, cw = w - pad * 2;
  const ry = cw * 0.16;
  const top = y + pad + ry;
  const bot = y + h - pad - ry;
  return (
    <G x={x} y={0}>
      <path
        d={`M ${cx} ${top} L ${cx} ${bot} A ${cw / 2} ${ry} 0 0 0 ${cx + cw} ${bot} L ${cx + cw} ${top}`}
        fill={tint(accent, 0.08)}
        stroke={accent}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <ellipse cx={cx + cw / 2} cy={top} rx={cw / 2} ry={ry} fill={tint(accent, 0.16)} stroke={accent} strokeWidth={SW} />
      <ellipse cx={cx + cw / 2} cy={top + (bot - top) * 0.5} rx={cw / 2} ry={ry} fill="none" stroke={accent} strokeWidth={1.4} opacity={0.45} />
    </G>
  );
};

/* 3) VECTOR DB / EMBEDDINGS — a cylinder overlaid with a dot grid */
export const VectorDBGlyph: React.FC<GlyphProps> = ({ x = 0, y = 0, w = 120, h = 120, accent }) => {
  const pad = 18;
  const cx = pad, cw = w - pad * 2;
  const ry = cw * 0.16;
  const top = y + pad + ry;
  const bot = y + h - pad - ry;
  const clipId = React.useId();
  const dots: React.ReactNode[] = [];
  const step = cw / 5;
  for (let gx = cx + step * 0.6; gx < cx + cw; gx += step) {
    for (let gy = top + step * 0.5; gy < bot; gy += step * 0.8) {
      dots.push(<circle key={`${gx}-${gy}`} cx={gx} cy={gy} r={2} fill={accent} />);
    }
  }
  return (
    <G x={x} y={0}>
      <defs>
        <clipPath id={clipId}>
          <path d={`M ${cx} ${top} L ${cx} ${bot} A ${cw / 2} ${ry} 0 0 0 ${cx + cw} ${bot} L ${cx + cw} ${top} Z`} />
        </clipPath>
      </defs>
      <path
        d={`M ${cx} ${top} L ${cx} ${bot} A ${cw / 2} ${ry} 0 0 0 ${cx + cw} ${bot} L ${cx + cw} ${top}`}
        fill={tint(accent, 0.08)}
        stroke={accent}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <g clipPath={`url(#${clipId})`}>{dots}</g>
      <ellipse cx={cx + cw / 2} cy={top} rx={cw / 2} ry={ry} fill={tint(accent, 0.16)} stroke={accent} strokeWidth={SW} />
    </G>
  );
};

/* 4) PIPELINE / PROCESS / STEP — a rounded rectangle with a small flow chevron */
export const PipelineGlyph: React.FC<GlyphProps> = ({ x = 0, y = 0, w = 120, h = 120, accent }) => {
  const pad = 16;
  const bx = pad, bw = w - pad * 2;
  const bh = Math.min(h - pad * 2, bw * 0.62);
  const by = y + (h - bh) / 2;
  const chev = bx + bw - 26;
  const cy = by + bh / 2;
  return (
    <G x={x} y={0}>
      <rect x={bx} y={by} width={bw} height={bh} rx={16} fill={tint(accent, 0.08)} stroke={accent} strokeWidth={SW} />
      <path d={`M ${chev} ${cy - 9} L ${chev + 11} ${cy} L ${chev} ${cy + 9}`} fill="none" stroke={accent} strokeWidth={SW + 0.4} strokeLinecap="round" strokeLinejoin="round" />
      <line x1={bx + 16} y1={cy - 6} x2={bx + 16 + bw * 0.4} y2={cy - 6} stroke={THEME.ink2} strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
      <line x1={bx + 16} y1={cy + 6} x2={bx + 16 + bw * 0.28} y2={cy + 6} stroke={THEME.ink2} strokeWidth={2.4} strokeLinecap="round" opacity={0.4} />
    </G>
  );
};

/* 5) RAW DATA / DOCUMENT — a page glyph with a folded corner */
export const DocumentGlyph: React.FC<GlyphProps> = ({ x = 0, y = 0, w = 120, h = 120, accent }) => {
  const padX = 28, padY = 16;
  const bx = padX, by = y + padY;
  const bw = w - padX * 2, bh = h - padY * 2;
  const fold = bw * 0.34;
  const right = bx + bw, bottom = by + bh;
  return (
    <G x={x} y={0}>
      <path
        d={`M ${bx} ${by} L ${right - fold} ${by} L ${right} ${by + fold} L ${right} ${bottom} L ${bx} ${bottom} Z`}
        fill={tint(accent, 0.08)}
        stroke={accent}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d={`M ${right - fold} ${by} L ${right - fold} ${by + fold} L ${right} ${by + fold}`} fill={tint(accent, 0.18)} stroke={accent} strokeWidth={SW} strokeLinejoin="round" />
      {[0.42, 0.58, 0.74].map((t, i) => (
        <line key={i} x1={bx + 12} y1={by + bh * t} x2={right - 12 - (i === 2 ? bw * 0.28 : 0)} y2={by + bh * t} stroke={THEME.ink2} strokeWidth={2.2} strokeLinecap="round" opacity={0.5} />
      ))}
    </G>
  );
};

/* 6) YOU / A USER — a simple head-and-shoulders figure */
export const UserGlyph: React.FC<GlyphProps> = ({ x = 0, y = 0, w = 120, h = 120, accent }) => {
  const cx = x + w / 2;
  const headR = w * 0.155;
  const headCy = y + h * 0.36;
  const sw = w * 0.5;
  return (
    <g>
      <path
        d={`M ${cx - sw / 2} ${y + h * 0.82}
            a ${sw / 2} ${sw / 2} 0 0 1 ${sw} 0 Z`}
        fill={tint(accent, 0.1)}
        stroke={accent}
        strokeWidth={SW}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={headCy} r={headR} fill={tint(accent, 0.1)} stroke={accent} strokeWidth={SW} />
    </g>
  );
};

/* 7) FLOW — an arrow; animate a dashed offset so data appears to move. */
export const FlowArrow: React.FC<
  GlyphProps & { x1?: number; y1?: number; x2?: number; y2?: number; animated?: boolean }
> = ({ x = 0, y = 0, w = 120, h = 120, accent, x1, y1, x2, y2, animated = true }) => {
  const ax1 = x1 ?? x + 14;
  const ay1 = y1 ?? y + h / 2;
  const ax2 = x2 ?? x + w - 18;
  const ay2 = y2 ?? y + h / 2;
  const headId = React.useId();
  return (
    <g>
      <defs>
        <marker id={headId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={accent} />
        </marker>
      </defs>
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke={tint(accent, 0.25)} strokeWidth={SW + 1.4} strokeLinecap="round" />
      <line
        x1={ax1}
        y1={ay1}
        x2={ax2}
        y2={ay2}
        stroke={accent}
        strokeWidth={SW + 0.4}
        strokeLinecap="round"
        markerEnd={`url(#${headId})`}
        className={animated ? "flow-dash" : undefined}
      />
    </g>
  );
};

/* 8) DECISION / DISPATCHER / ROUTER — a diamond */
export const DecisionGlyph: React.FC<GlyphProps & { mark?: string }> = ({ x = 0, y = 0, w = 120, h = 120, accent, mark = "?" }) => {
  const cx = x + w / 2, cy = y + h / 2;
  const rw = w * 0.36, rh = h * 0.36;
  return (
    <g>
      <path
        d={`M ${cx} ${cy - rh} L ${cx + rw} ${cy} L ${cx} ${cy + rh} L ${cx - rw} ${cy} Z`}
        fill={tint(accent, 0.1)}
        stroke={accent}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontFamily="'Jost', sans-serif" fontSize={w * 0.2} fill={accent} fontWeight={600}>
        {mark}
      </text>
    </g>
  );
};

/* 9) SNAPSHOT / STORED ARTIFACT — a dashed-border badge with a title + "→ used for…" */
export const SnapshotGlyph: React.FC<GlyphProps & { title?: string; usedFor?: string }> = ({
  x = 0,
  y = 0,
  w = 120,
  h = 120,
  accent,
  title = "snapshot",
  usedFor = "used for…",
}) => {
  const pad = 12;
  const bx = pad, bw = w - pad * 2;
  const bh = Math.min(h - pad * 2, bw * 0.6);
  const by = y + (h - bh) / 2;
  return (
    <G x={x} y={0}>
      <rect x={bx} y={by} width={bw} height={bh} rx={12} fill={tint(accent, 0.06)} stroke={accent} strokeWidth={SW} strokeDasharray="6 5" />
      <text x={bx + 12} y={by + bh * 0.42} fontFamily="'Inter', sans-serif" fontSize={13} fill={THEME.ink} fontWeight={600}>
        {title}
      </text>
      <text x={bx + 12} y={by + bh * 0.74} fontFamily="'Inter', sans-serif" fontSize={11.5} fill={accent} fontWeight={500}>
        {`→ ${usedFor}`}
      </text>
    </G>
  );
};

/* 10) CATEGORY / TAG — a pill chip */
export const TagGlyph: React.FC<GlyphProps & { text?: string }> = ({ x = 0, y = 0, w = 120, h = 120, accent, text = "tag" }) => {
  const ph = 32;
  const pw = Math.min(w - 20, 100);
  const bx = x + (w - pw) / 2;
  const by = y + (h - ph) / 2;
  return (
    <g>
      <rect x={bx} y={by} width={pw} height={ph} rx={ph / 2} fill={tint(accent, 0.12)} stroke={accent} strokeWidth={SW} />
      <text x={bx + pw / 2} y={by + ph / 2} textAnchor="middle" dominantBaseline="central" fontFamily="'Inter', sans-serif" fontSize={13} fill={accent} fontWeight={600}>
        {text}
      </text>
    </g>
  );
};
