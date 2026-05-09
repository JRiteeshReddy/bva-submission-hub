import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { Countdown } from "@/components/Countdown";
import { SubmissionForm } from "@/components/SubmissionForm";
import { getPhase } from "@/lib/hackathon-window";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [phaseState, setPhaseState] = useState<"before" | "open" | "after">(
    () => getPhase().state,
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster theme="dark" position="top-center" richColors />

      <header className="border-b border-border/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm border border-border bg-foreground/90 grid place-items-center">
              <span className="text-[10px] font-bold text-background font-display">B</span>
            </div>
            <span className="text-sm font-medium tracking-wider">BVA</span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Hackathon · 2026
          </span>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground animate-fade-in-up">
            <span className="h-1 w-1 rounded-full bg-foreground/70" />
            BVA Club
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
    </div>
  );
}
