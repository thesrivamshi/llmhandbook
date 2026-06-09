import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { DIAGRAMS_BY_CHAPTER, chapterMeta, accentOf } from "../book";
import { STAGES, stageForChapter } from "../theme";

// A zoomable, pannable whole-book map: the book hub at the centre, each chapter
// a stage-coloured hub on an inner ring, and every authored diagram a leaf
// radiating outward. Hover a leaf for its title; click to jump to /read/:page.
const CX = 700;
const CY = 520;
const R_HUB = 230;
const R_LEAF_MIN = 320;
const R_LEAF_MAX = 470;

interface Leaf {
  page: number;
  title: string;
  x: number;
  y: number;
  accent: string;
  chapter: number;
}
interface Hub {
  chapter: number;
  label: string;
  x: number;
  y: number;
  accent: string;
}

const CHAPTER_NUMS = Object.keys(DIAGRAMS_BY_CHAPTER).map(Number).sort((a, b) => a - b);

const { hubs, leaves } = (() => {
  const hubs: Hub[] = [];
  const leaves: Leaf[] = [];
  const n = CHAPTER_NUMS.length;
  CHAPTER_NUMS.forEach((ch, ci) => {
    const a0 = (ci / n) * Math.PI * 2 - Math.PI / 2;
    const hubX = CX + Math.cos(a0) * R_HUB;
    const hubY = CY + Math.sin(a0) * R_HUB;
    const accent = ch <= 11 ? accentOf(ch) : STAGES.operations.accent;
    const meta = chapterMeta(ch);
    const label = ch === 12 ? "Appendix" : `Ch ${ch}`;
    hubs.push({ chapter: ch, label, x: hubX, y: hubY, accent });
    const ds = DIAGRAMS_BY_CHAPTER[ch];
    const span = (Math.PI * 2) / n;
    ds.forEach((d, di) => {
      // spread leaves within this chapter's angular slice, alternating radius
      const t = ds.length === 1 ? 0.5 : di / (ds.length - 1);
      const a = a0 + (t - 0.5) * span * 0.86;
      const r = R_LEAF_MIN + (di % 3) * ((R_LEAF_MAX - R_LEAF_MIN) / 2);
      leaves.push({
        page: d.page,
        title: d.title,
        x: CX + Math.cos(a) * r,
        y: CY + Math.sin(a) * r,
        accent,
        chapter: ch,
      });
    });
    void meta;
  });
  return { hubs, leaves };
})();

export default function MapView() {
  const navigate = useNavigate();
  const [view, setView] = React.useState({ x: 0, y: 0, w: 1400, h: 1040 });
  const [hover, setHover] = React.useState<Leaf | null>(null);
  const [activeCh, setActiveCh] = React.useState<number | null>(null);
  const drag = React.useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    setView((v) => {
      const nw = Math.min(2800, Math.max(500, v.w * factor));
      const nh = nw * (1040 / 1400);
      // zoom toward centre of current view
      return { x: v.x + (v.w - nw) / 2, y: v.y + (v.h - nh) / 2, w: nw, h: nh };
    });
  };
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const scale = view.w / (e.currentTarget as HTMLElement).clientWidth;
    setView((v) => ({ ...v, x: drag.current!.vx - (e.clientX - drag.current!.x) * scale, y: drag.current!.vy - (e.clientY - drag.current!.y) * scale }));
  };
  const onUp = () => (drag.current = null);

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen">
        <div className="px-4 sm:px-6 py-3 border-b border-border bg-paper/90 backdrop-blur flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-lg font-semibold">Whole-book map</h1>
          <span className="text-[12px] text-ink2 font-body">{leaves.length} diagrams · drag to pan · scroll to zoom · click a node to open</span>
          <div className="ml-auto flex gap-1.5 flex-wrap">
            {Object.values(STAGES).map((s) => (
              <span key={s.stage} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${s.accent}1A`, color: s.accent }}>
                {s.label}
              </span>
            ))}
            <button onClick={() => setView({ x: 0, y: 0, w: 1400, h: 1040 })} className="text-[11px] px-2 py-0.5 rounded-full border border-border hover:bg-surface">
              reset
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-paper relative">
          <svg
            viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
            className="w-full h-full touch-none select-none"
            style={{ cursor: drag.current ? "grabbing" : "grab" }}
            onWheel={onWheel}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          >
            {/* hub spokes */}
            {hubs.map((h) => (
              <line key={`s${h.chapter}`} x1={CX} y1={CY} x2={h.x} y2={h.y} stroke="#ECE8DF" strokeWidth={2} />
            ))}
            {/* leaf links */}
            {leaves.map((l, i) => {
              const h = hubs.find((hh) => hh.chapter === l.chapter)!;
              const dim = activeCh != null && activeCh !== l.chapter;
              return <line key={`l${i}`} x1={h.x} y1={h.y} x2={l.x} y2={l.y} stroke={l.accent} strokeWidth={1.1} opacity={dim ? 0.06 : 0.28} />;
            })}
            {/* centre */}
            <circle cx={CX} cy={CY} r={56} fill="#FFFFFF" stroke="#CBD3D8" strokeWidth={2} />
            <text x={CX} y={CY - 4} textAnchor="middle" fontFamily="'Jost', sans-serif" fontSize={17} fontWeight={700} fill="#25313C">Visual</text>
            <text x={CX} y={CY + 16} textAnchor="middle" fontFamily="'Jost', sans-serif" fontSize={17} fontWeight={700} fill="#25313C">Book</text>
            {/* leaves */}
            {leaves.map((l, i) => {
              const dim = activeCh != null && activeCh !== l.chapter;
              return (
                <circle
                  key={`p${i}`}
                  cx={l.x}
                  cy={l.y}
                  r={hover?.page === l.page ? 8 : 5}
                  fill={l.accent}
                  opacity={dim ? 0.12 : 0.92}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHover(l)}
                  onMouseLeave={() => setHover((h) => (h?.page === l.page ? null : h))}
                  onClick={() => navigate(`/read/${l.page}`)}
                />
              );
            })}
            {/* hubs */}
            {hubs.map((h) => (
              <g key={`h${h.chapter}`} style={{ cursor: "pointer" }} onMouseEnter={() => setActiveCh(h.chapter)} onMouseLeave={() => setActiveCh(null)} onClick={() => navigate(`/read/${chapterMeta(h.chapter)?.startPage ?? DIAGRAMS_BY_CHAPTER[h.chapter][0].page}`)}>
                <circle cx={h.x} cy={h.y} r={26} fill="#FFFFFF" stroke={h.accent} strokeWidth={2.5} />
                <text x={h.x} y={h.y} textAnchor="middle" dominantBaseline="middle" fontFamily="'Jost', sans-serif" fontSize={13} fontWeight={700} fill={h.accent}>
                  {h.label}
                </text>
              </g>
            ))}
            {/* hover tooltip */}
            {hover && (
              <g pointerEvents="none">
                <rect x={hover.x + 10} y={hover.y - 16} width={Math.max(90, hover.title.length * 7.2 + 24)} height={32} rx={8} fill="#25313C" opacity={0.95} />
                <text x={hover.x + 22} y={hover.y} dominantBaseline="middle" fontFamily="'Inter', sans-serif" fontSize={12.5} fill="#fff">
                  p.{hover.page} · {hover.title}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </Layout>
  );
}
