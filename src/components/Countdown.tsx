import { useEffect, useState } from "react";
import { getPhase, formatDuration, type Phase } from "@/lib/hackathon-window";

export function Countdown({ onPhaseChange }: { onPhaseChange?: (p: Phase) => void }) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>(() => getPhase());
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    setPhase(getPhase());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const next = getPhase(new Date(now));
    if (next.state !== phase.state) {
      setPhase(next);
      onPhaseChange?.(next);
    }
  }, [now, phase.state, onPhaseChange]);

  const target =
    phase.state === "open" ? phase.closesAt : phase.opensAt;
  const { h, m, s } = formatDuration(target.getTime() - now);

  const label =
    phase.state === "open" ? "Submissions Close In" : "Submissions Open In";

  const dotColor =
    phase.state === "open" ? "bg-emerald-400" : "bg-amber-400";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse-dot`} />
        <span key={label} className="animate-fade-in-up">{label}</span>
      </div>
      <div className="flex items-end gap-3 sm:gap-6 font-display tabular-nums">
        <TimeBlock value={mounted ? h : "--"} label="Hours" />
        <Colon />
        <TimeBlock value={mounted ? m : "--"} label="Minutes" />
        <Colon />
        <TimeBlock value={mounted ? s : "--"} label="Seconds" />
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-lg border border-border bg-card/60 backdrop-blur px-4 py-3 sm:px-6 sm:py-4 min-w-[72px] sm:min-w-[110px] text-center">
        <span className="text-4xl sm:text-6xl font-semibold text-foreground">{value}</span>
        <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
      </div>
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
    </div>
  );
}

function Colon() {
  return <span className="text-3xl sm:text-5xl text-muted-foreground/60 pb-7">:</span>;
}
