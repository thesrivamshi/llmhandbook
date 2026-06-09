import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  CHAPTERS,
  chapterTocNode,
  diagramsForChapter,
  accentOf,
  sectionForPage,
  type TocNode,
  type ChapterMeta,
} from "../book";
import { STAGES, stageForChapter } from "../theme";

// Recursive section → page list for one chapter. Links open the split-view reader.
const TocList: React.FC<{ nodes: TocNode[]; accent: string; diagramPages: Set<number> }> = ({ nodes, accent, diagramPages }) => (
  <ul className="space-y-0.5">
    {nodes.map((n) => (
      <li key={n.id}>
        <NavLink
          to={n.startPage ? `/read/${n.startPage}` : "#"}
          className={({ isActive }) =>
            `group flex items-baseline gap-2 rounded-lg px-2 py-1 text-[12.5px] leading-snug transition-colors ${
              isActive ? "bg-paper font-semibold" : "hover:bg-paper/70"
            }`
          }
          style={{ paddingLeft: 8 + n.depth * 10 }}
        >
          {n.startPage && (
            <span
              className="font-mono text-[10px] shrink-0 mt-px"
              style={{ color: diagramPages.has(n.startPage) ? accent : "#97A0A8" }}
            >
              {n.startPage}
            </span>
          )}
          <span className={n.depth <= 1 ? "text-ink" : "text-ink2"}>{n.title}</span>
        </NavLink>
        {n.children?.length > 0 && <TocList nodes={n.children} accent={accent} diagramPages={diagramPages} />}
      </li>
    ))}
  </ul>
);

const maxPages = Math.max(...CHAPTERS.map((c) => c.pageCount));

// One chapter / matter group: collapsible, stage-coloured, page-weight bar.
const ChapterGroup: React.FC<{ meta: ChapterMeta; openPage: number }> = ({ meta, openPage }) => {
  const n = meta.chapterNumber;
  const isAppendix = /Appendix/i.test(meta.title);
  const accent = n != null ? accentOf(n) : isAppendix ? STAGES.operations.accent : "#97A0A8";
  const stageLabel =
    n != null ? STAGES[stageForChapter(n)].label : isAppendix ? STAGES.operations.label : "Front / back matter";
  const node = n != null ? chapterTocNode(n) : undefined;
  const diagramPages = n != null ? new Set(diagramsForChapter(n).map((d) => d.page)) : new Set<number>();
  const contains = openPage >= meta.startPage && openPage <= meta.endPage;
  const shortTitle = meta.title.replace(/^Chapter \d+:\s*/, "");

  return (
    <details open={contains} className="group">
      <summary className="list-none cursor-pointer rounded-lg px-2 py-1.5 hover:bg-paper/60">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: accent }} />
          <span className="font-display text-[13.5px] font-semibold leading-tight flex-1 min-w-0">
            {n != null ? `${n} · ${shortTitle}` : meta.title}
          </span>
          <span className="text-ink2 text-[11px] group-open:rotate-90 transition-transform">▸</span>
        </div>
        <div className="mt-1.5 pl-[18px] pr-1">
          <div className="h-1 rounded-full bg-paper overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(meta.pageCount / maxPages) * 100}%`, background: accent, opacity: 0.5 }} />
          </div>
          <div className="text-[10.5px] text-faint mt-1 font-mono">
            pp. {meta.startPage}–{meta.endPage}
            {n != null && diagramPages.size > 0 ? ` · ${diagramPages.size} diagrams` : ""}
            <span className="ml-1 not-italic" style={{ color: accent }}>· {stageLabel}</span>
          </div>
        </div>
      </summary>

      <div className="pl-[10px] mt-1">
        {node ? (
          <TocList nodes={node.children} accent={accent} diagramPages={diagramPages} />
        ) : (
          <NavLink
            to={`/read/${meta.startPage}`}
            className={({ isActive }) =>
              `block rounded-lg px-2 py-1 text-[12.5px] transition-colors ${isActive ? "bg-paper font-semibold" : "text-ink2 hover:bg-paper/70"}`
            }
          >
            Open this section
          </NavLink>
        )}
      </div>
    </details>
  );
};

const SidebarBody: React.FC = () => {
  const loc = useLocation();
  // Current page from /read/:page or /page/:n; default 30. Drives which group is open.
  const m = loc.pathname.match(/\/(?:read|page)\/(\d+)/);
  const openPage = m ? Number(m[1]) : sectionForPage(30)?.startPage ?? 30;

  return (
    <nav aria-label="Book navigation" className="font-body">
      <NavLink to="/read/30" className="block mb-4">
        <div className="font-display text-lg font-semibold tracking-tight">Visual Book</div>
        <div className="text-[12px] text-ink2">The LLM Engineer&rsquo;s Handbook</div>
      </NavLink>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          ["/read/30", "Read"],
          ["/build", "Build"],
          ["/quiz", "Quiz"],
          ["/search", "Search"],
          ["/map", "Map"],
          ["/legend", "Legend"],
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-[13px] px-2.5 py-1 rounded-lg border border-border ${isActive ? "bg-paper font-semibold" : "hover:bg-paper/70"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className="space-y-0.5">
        {CHAPTERS.map((c) => (
          <ChapterGroup key={c.id} meta={c} openPage={openPage} />
        ))}
      </div>
    </nav>
  );
};

// Desktop: sticky left rail. Mobile: a collapsible panel. In `immersive` mode
// the desktop rail becomes a fixed overlay that hides off-screen and slides in
// when `revealed` (driven by the left-edge hot zone in Layout).
export const Sidebar: React.FC<{ immersive?: boolean; revealed?: boolean; onHide?: () => void }> = ({
  immersive = false,
  revealed = false,
  onHide,
}) => (
  <>
    <aside
      onMouseLeave={immersive ? onHide : undefined}
      className={
        immersive
          ? `hidden lg:block w-72 fixed left-0 top-0 h-screen overflow-y-auto px-5 py-6 z-40 border-r border-border bg-surface transition-transform duration-200 ${
              revealed ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            }`
          : "hidden lg:block w-72 shrink-0 border-r border-border bg-surface/70 sticky top-0 h-screen overflow-y-auto px-5 py-6"
      }
    >
      <SidebarBody />
    </aside>
    <details className="lg:hidden border-b border-border bg-surface px-4 py-3">
      <summary className="font-display font-semibold cursor-pointer list-none flex items-center justify-between">
        <span>Visual Book — menu</span>
        <span className="text-ink2 text-sm">▾</span>
      </summary>
      <div className="pt-4">
        <SidebarBody />
      </div>
    </details>
  </>
);

export default Sidebar;
