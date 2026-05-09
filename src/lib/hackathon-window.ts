// Returns the current "phase" of the submission window.
// Open: 8:00 PM (20:00) -> 6:00 AM next day (local time).
export type Phase =
  | { state: "before"; opensAt: Date }
  | { state: "open"; closesAt: Date }
  | { state: "after"; opensAt: Date };

export function getPhase(now: Date = new Date()): Phase {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const todayOpen = new Date(y, m, d, 20, 0, 0, 0);
  const todayClose = new Date(y, m, d + 1, 6, 0, 0, 0);
  const yesterdayOpen = new Date(y, m, d - 1, 20, 0, 0, 0);
  const yesterdayClose = new Date(y, m, d, 6, 0, 0, 0);

  if (now >= yesterdayOpen && now < yesterdayClose) {
    return { state: "open", closesAt: yesterdayClose };
  }
  if (now >= todayOpen && now < todayClose) {
    return { state: "open", closesAt: todayClose };
  }
  if (now < todayOpen) {
    return { state: "before", opensAt: todayOpen };
  }
  // after today's close window already passed (shouldn't reach here often)
  const tomorrowOpen = new Date(y, m, d + 1, 20, 0, 0, 0);
  return { state: "after", opensAt: tomorrowOpen };
}

export function formatDuration(ms: number): { h: string; m: string; s: string } {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}
