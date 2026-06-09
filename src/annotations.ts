import { useSyncExternalStore } from "react";

// Personal state — bookmarks, per-page notes, text highlights, project-task
// checkmarks, and quiz self-ratings — persisted to the browser's localStorage.
// No backend: instant, private, offline, but device/browser-local. Use
// exportJSON / importJSON to back up or move between devices.

export type HiStyle = "hl" | "ul"; // highlight (marker) or underline
export interface Highlight {
  t: string;
  s: HiStyle;
}
export interface AnnotationData {
  bookmarks: number[];
  notes: Record<number, string>;
  highlights: Record<number, Highlight[]>;
  tasksDone: string[];
  quiz: Record<string, "known" | "revisit">;
}

const KEY = "vb-annotations";
const EMPTY: AnnotationData = { bookmarks: [], notes: {}, highlights: {}, tasksDone: [], quiz: {} };

function load(): AnnotationData {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    const d: AnnotationData = { ...EMPTY, ...raw };
    // Migrate old string[] highlights → {t,s}.
    const hi: Record<number, Highlight[]> = {};
    for (const [k, v] of Object.entries(d.highlights || {})) {
      hi[Number(k)] = (v as unknown as (string | Highlight)[]).map((x) => (typeof x === "string" ? { t: x, s: "hl" } : x));
    }
    d.highlights = hi;
    return d;
  } catch {
    return { ...EMPTY };
  }
}

let data: AnnotationData = load();
const subs = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode — keep working in memory */
  }
  subs.forEach((f) => f());
}
function subscribe(f: () => void) {
  subs.add(f);
  return () => subs.delete(f);
}
const snapshot = () => data;

export function useAnnotations(): AnnotationData {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/* ---- bookmarks ---- */
export function toggleBookmark(page: number) {
  const has = data.bookmarks.includes(page);
  data = { ...data, bookmarks: has ? data.bookmarks.filter((p) => p !== page) : [...data.bookmarks, page].sort((a, b) => a - b) };
  persist();
}

/* ---- notes ---- */
export function setNote(page: number, text: string) {
  const notes = { ...data.notes };
  if (text.trim()) notes[page] = text;
  else delete notes[page];
  data = { ...data, notes };
  persist();
}

/* ---- highlights / underlines ---- */
export function addHighlight(page: number, phrase: string, style: HiStyle = "hl") {
  const t = phrase.trim();
  if (t.length < 2) return;
  const cur = data.highlights[page] || [];
  const next = cur.filter((h) => h.t !== t); // replace style if same phrase
  data = { ...data, highlights: { ...data.highlights, [page]: [...next, { t, s: style }] } };
  persist();
}
export function removeHighlight(page: number, phrase: string) {
  const cur = data.highlights[page] || [];
  const next = cur.filter((h) => h.t !== phrase);
  const highlights = { ...data.highlights };
  if (next.length) highlights[page] = next;
  else delete highlights[page];
  data = { ...data, highlights };
  persist();
}

/* ---- project tasks ---- */
export function toggleTask(id: string) {
  const has = data.tasksDone.includes(id);
  data = { ...data, tasksDone: has ? data.tasksDone.filter((x) => x !== id) : [...data.tasksDone, id] };
  persist();
}

/* ---- quiz self-rating ---- */
export function setQuiz(id: string, val: "known" | "revisit") {
  data = { ...data, quiz: { ...data.quiz, [id]: val } };
  persist();
}
export function resetQuiz(ids?: string[]) {
  if (!ids) {
    data = { ...data, quiz: {} };
  } else {
    const q = { ...data.quiz };
    for (const id of ids) delete q[id];
    data = { ...data, quiz: q };
  }
  persist();
}

/* ---- backup ---- */
export function exportJSON() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "visual-book-notes.json";
  a.click();
  URL.revokeObjectURL(url);
}
export function importJSON(file: File): Promise<void> {
  return file.text().then((txt) => {
    const inc = JSON.parse(txt) as Partial<AnnotationData>;
    data = {
      bookmarks: Array.from(new Set([...data.bookmarks, ...(inc.bookmarks || [])])).sort((a, b) => a - b),
      notes: { ...data.notes, ...(inc.notes || {}) },
      highlights: { ...data.highlights, ...(inc.highlights || {}) },
      tasksDone: Array.from(new Set([...data.tasksDone, ...(inc.tasksDone || [])])),
      quiz: { ...data.quiz, ...(inc.quiz || {}) },
    };
    persist();
  });
}
