import React from "react";

// A single compact pill: a countdown Pomodoro (editable: 15/25/40/50 or custom)
// or a count-up stopwatch. Click the time to start/pause; ▾ opens a tiny menu.
// When a countdown ends it chimes and shows "Break ☕". Remembers your last mode
// + duration. Deliberately one control — no toolbar clutter.

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const PRESETS = [15, 25, 40, 50];

export const TimerPill: React.FC<{ accent: string }> = ({ accent }) => {
  const [mode, setMode] = React.useState<"timer" | "stopwatch">(() => {
    try {
      return (localStorage.getItem("vb-timer-mode") as "timer" | "stopwatch") || "timer";
    } catch {
      return "timer";
    }
  });
  const [durationMin, setDurationMin] = React.useState<number>(() => {
    try {
      return Number(localStorage.getItem("vb-timer-min")) || 25;
    } catch {
      return 25;
    }
  });
  const [secs, setSecs] = React.useState<number>(() => durationMin * 60);
  const [running, setRunning] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const audioRef = React.useRef<AudioContext | null>(null);

  // Reset whenever the mode or duration changes.
  React.useEffect(() => {
    setRunning(false);
    setFinished(false);
    setSecs(mode === "timer" ? durationMin * 60 : 0);
    try {
      localStorage.setItem("vb-timer-mode", mode);
      localStorage.setItem("vb-timer-min", String(durationMin));
    } catch {
      /* ignore */
    }
  }, [mode, durationMin]);

  // Tick.
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecs((s) => (mode === "stopwatch" ? s + 1 : Math.max(0, s - 1)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, mode]);

  // Countdown completion.
  React.useEffect(() => {
    if (mode === "timer" && running && secs === 0) {
      setRunning(false);
      setFinished(true);
      chime();
    }
  }, [secs, running, mode]);

  const ensureAudio = () => {
    try {
      if (!audioRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new Ctx();
      }
      return audioRef.current;
    } catch {
      return null;
    }
  };

  const chime = () => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    [0, 0.28, 0.56].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, t0 + t);
      g.gain.exponentialRampToValueAtTime(0.22, t0 + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + 0.24);
      o.start(t0 + t);
      o.stop(t0 + t + 0.26);
    });
  };

  const toggle = () => {
    if (finished) {
      setFinished(false);
      setSecs(mode === "timer" ? durationMin * 60 : 0);
      return; // reset; user taps again to start
    }
    ensureAudio(); // unlock audio on this user gesture
    setRunning((r) => !r);
  };

  const icon = finished ? "↺" : running ? "⏸" : "▶";

  return (
    <div className="relative">
      <div
        className="flex items-center rounded-lg border transition-colors"
        style={
          finished
            ? { borderColor: accent, background: `${accent}1A` }
            : running
              ? { borderColor: accent }
              : { borderColor: "#ECE8DF" }
        }
      >
        <button
          onClick={toggle}
          className="px-2 py-1 text-[12px]"
          style={{ color: running || finished ? accent : "#5E6B76" }}
          title={finished ? "Reset" : running ? "Pause" : "Start"}
          aria-label={finished ? "Reset timer" : running ? "Pause timer" : "Start timer"}
        >
          {icon}
        </button>
        <button
          onClick={toggle}
          className="font-mono text-[12.5px] pr-1 tabular-nums min-w-[3.4rem] text-center"
          style={{ color: finished ? accent : "#25313C" }}
          title="Start / pause"
        >
          {finished ? "Break ☕" : fmt(secs)}
        </button>
        <button
          onClick={() => setMenu((m) => !m)}
          className="px-1.5 py-1 text-[11px] text-faint border-l border-border hover:text-ink"
          title="Timer settings"
          aria-haspopup="menu"
          aria-expanded={menu}
        >
          ▾
        </button>
      </div>

      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} aria-hidden />
          <div className="absolute right-0 mt-1.5 z-50 w-52 rounded-xl border border-border bg-surface shadow-card p-3 font-body">
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 mb-2.5">
              {(["timer", "stopwatch"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 px-2 py-1 text-[12px] rounded-md capitalize transition-colors ${
                    mode === m ? "font-semibold text-ink bg-paper" : "text-ink2 hover:bg-paper/70"
                  }`}
                >
                  {m === "timer" ? "Pomodoro" : "Stopwatch"}
                </button>
              ))}
            </div>

            {mode === "timer" && (
              <>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setDurationMin(m);
                        setMenu(false);
                      }}
                      className="px-1 py-1.5 text-[12px] rounded-md border transition-colors"
                      style={
                        durationMin === m
                          ? { borderColor: accent, color: accent, background: `${accent}12`, fontWeight: 600 }
                          : { borderColor: "#ECE8DF", color: "#5E6B76" }
                      }
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 mt-2.5 text-[12px] text-ink2">
                  <span>Custom</span>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    defaultValue={durationMin}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(180, Number(e.target.value) || 0));
                      if (v) setDurationMin(v);
                    }}
                    className="w-16 rounded-md border border-border px-2 py-1 font-mono text-[12px] focus:outline-none"
                  />
                  <span className="text-faint">min</span>
                </label>
              </>
            )}
            {mode === "stopwatch" && <p className="text-[12px] text-ink2 leading-snug">Counts up from 00:00. Tap the time to start, pause, and resume.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default TimerPill;
