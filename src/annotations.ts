import { useSyncExternalStore } from "react";

// Personal annotations — bookmarks, per-page notes, and text highlights —
// persisted to the browser's localStorage. No backend: instant, private, and
// offline, but device/browser-local. Use exportJSON / importJSON to back up
// or move between devices. (Cross-device sync would need a backend e.g. Supabase.)

export interface AnnotationData {
  bookmarks: number[];
  notes: Record<number, string>;
  highlights: Record<number, string[]>;
}

const KEY = "vb-annotations";

function load(): AnnotationData {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { bookmarks: [], notes: {}, highlights: {}, ...raw };
  } catch {
    return { bookmarks: [], notes: {}, highlights: {} };
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

/** Reactive read of the whole annotation store. */
export function useAnnotations(): AnnotationData {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export const isBookmarked = (page: number) => data.bookmarks.includes(page);

export function toggleBookmark(page: number) {
  const has = data.bookmarks.includes(page);
  data = {
    ...data,
    bookmarks: has ? data.bookmarks.filter((p) => p !== page) : [...data.bookmarks, page].sort((a, b) => a - b),
  };
  persist();
}

export function setNote(page: number, text: string) {
  const notes = { ...data.notes };
  if (text.trim()) notes[page] = text;
  else delete notes[page];
  data = { ...data, notes };
  persist();
}

export function addHighlight(page: number, phrase: string) {
  const p = phrase.trim();
  if (p.length < 2) return;
  const cur = data.highlights[page] || [];
  if (cur.includes(p)) return;
  data = { ...data, highlights: { ...data.highlights, [page]: [...cur, p] } };
  persist();
}

export function removeHighlight(page: number, phrase: string) {
  const cur = data.highlights[page] || [];
  const next = cur.filter((p) => p !== phrase);
  const highlights = { ...data.highlights };
  if (next.length) highlights[page] = next;
  else delete highlights[page];
  data = { ...data, highlights };
  persist();
}

/** Download all annotations as a JSON backup. */
export function exportJSON() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "visual-book-notes.json";
  a.click();
  URL.revokeObjectURL(url);
}

/** Merge an exported JSON backup into the current store. */
export function importJSON(file: File): Promise<void> {
  return file.text().then((txt) => {
    const incoming = JSON.parse(txt) as Partial<AnnotationData>;
    data = {
      bookmarks: Array.from(new Set([...data.bookmarks, ...(incoming.bookmarks || [])])).sort((a, b) => a - b),
      notes: { ...data.notes, ...(incoming.notes || {}) },
      highlights: { ...data.highlights, ...(incoming.highlights || {}) },
    };
    persist();
  });
}
