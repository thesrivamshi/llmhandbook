import React from "react";
import { useAnnotations, setNote, exportJSON, importJSON } from "../annotations";

// Per-page notes that live in the empty space below the diagram. Autosaves to
// localStorage on every keystroke. Export/Import back up all notes+highlights.
export const NotesPanel: React.FC<{ page: number; accent: string }> = ({ page, accent }) => {
  const ann = useAnnotations();
  const value = ann.notes[page] ?? "";
  const fileRef = React.useRef<HTMLInputElement>(null);
  const noteCount = Object.keys(ann.notes).length;

  return (
    <div className="mt-4 flex-1 min-h-[160px] flex flex-col rounded-card bg-surface border border-border shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
        <span className="font-display text-sm font-semibold">Notes</span>
        <span className="font-mono text-[11px] text-faint">p.{page}</span>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-ink2">
          <button onClick={exportJSON} className="hover:text-ink" title="Download all notes + highlights as a backup file">
            Export ⤓
          </button>
          <button onClick={() => fileRef.current?.click()} className="hover:text-ink" title="Restore notes + highlights from a backup file">
            Import ⤒
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJSON(f).catch(() => alert("Could not read that backup file."));
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setNote(page, e.target.value)}
        placeholder={`Jot anything about page ${page} here — it saves automatically in this browser.`}
        className="flex-1 w-full resize-none bg-transparent px-4 py-3 font-body text-[14px] leading-relaxed text-ink placeholder:text-faint focus:outline-none"
        spellCheck
      />
      <div className="px-4 py-1.5 border-t border-border text-[10.5px] text-faint font-mono">
        {value.trim() ? `${value.trim().length} chars · saved locally` : `${noteCount} page${noteCount === 1 ? "" : "s"} noted`}
      </div>
    </div>
  );
};

export default NotesPanel;
