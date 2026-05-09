import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Toaster } from "sonner";
import { Countdown } from "@/components/Countdown";
import { SubmissionForm } from "@/components/SubmissionForm";
import { AdminPanel } from "@/components/AdminPanel";
import { getPhase } from "@/lib/hackathon-window";
import bvaLogo from "@/assets/bva-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [phaseState, setPhaseState] = useState<"before" | "open" | "after">(
    () => getPhase().state,
  );
  const [adminOpen, setAdminOpen] = useState(false);
  const clicksRef = useRef<number[]>([]);

  function handleLogoClick() {
    const now = Date.now();
    clicksRef.current = [...clicksRef.current, now].filter(
      (t) => now - t < 2000,
    );
    if (clicksRef.current.length >= 5) {
      clicksRef.current = [];
      setAdminOpen(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster theme="dark" position="top-center" richColors />

      <header className="border-b border-border/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-center relative">
          <button
            type="button"
            onClick={handleLogoClick}
            aria-label="BVA"
            className="group select-none focus:outline-none"
          >
            <img
              src={bvaLogo}
              alt="BVA"
              draggable={false}
              className="h-20 sm:h-24 w-auto transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
            />
          </button>
          <span className="hidden sm:inline absolute right-6 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Hackathon · 2026
          </span>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground animate-fade-in-up">
            <span className="h-1 w-1 rounded-full bg-foreground/70" />
            Bangalore Vibecoders Association
          </div>
          <h1 className="mt-6 text-5xl sm:text-7xl font-semibold tracking-tight animate-fade-in-up delay-100">
            BVA Hackathon
            <span className="block bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">
              Submissions
            </span>
          </h1>
          <p className="mt-5 mx-auto max-w-xl text-base sm:text-lg text-muted-foreground animate-fade-in-up delay-200">
            Submit your project and showcase your innovation.
          </p>

          <div className="mt-14 animate-fade-in-up delay-300">
            <Countdown onPhaseChange={(p) => setPhaseState(p.state)} />
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 pb-24">
          <SubmissionForm phaseState={phaseState} />
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          BVA Hackathon
        </div>
      </footer>

      <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  );
}
