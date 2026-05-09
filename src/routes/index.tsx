import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Menu } from "lucide-react";
import { Toaster } from "sonner";
import { Countdown } from "@/components/Countdown";
import { SubmissionForm } from "@/components/SubmissionForm";
import { AdminPanel } from "@/components/AdminPanel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getPhase } from "@/lib/hackathon-window";
import bvaLogo from "@/assets/bva-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [phaseState, setPhaseState] = useState<"before" | "open" | "after">(
    () => getPhase().state,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const clicksRef = useRef<{ count: number; timer: ReturnType<typeof setTimeout> | null }>({
    count: 0,
    timer: null,
  });

  function handleLogoClick() {
    const c = clicksRef.current;
    c.count += 1;
    if (c.timer) clearTimeout(c.timer);
    if (c.count >= 5) {
      c.count = 0;
      setAdminOpen(true);
      return;
    }
    c.timer = setTimeout(() => {
      c.count = 0;
    }, 800);
  }

  function handleJump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster theme="dark" position="top-center" richColors />

      <header className="border-b border-border/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
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

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Hackathon · 2026
            </span>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card/60 text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        <section id="hero" className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
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

          <div id="countdown" className="mt-14 animate-fade-in-up delay-300">
            <Countdown onPhaseChange={(p) => setPhaseState(p.state)} />
          </div>
        </section>

        <section id="submit" className="mx-auto max-w-2xl px-6 pb-24">
          <SubmissionForm phaseState={phaseState} />
        </section>
      </main>

      <footer id="about" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          BVA Hackathon
        </div>
      </footer>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="border-border bg-card/95 backdrop-blur-xl">
          <SheetHeader>
            <SheetTitle className="font-display">Menu</SheetTitle>
            <SheetDescription>
              Quick navigation for the submission page.
            </SheetDescription>
          </SheetHeader>

          <nav className="mt-8 flex flex-col gap-3">
            {[
              { id: "hero", label: "Overview" },
              { id: "countdown", label: "Countdown" },
              { id: "submit", label: "Submit project" },
              { id: "about", label: "About" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleJump(item.id)}
                className="flex items-center justify-between rounded-md border border-border bg-background/40 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-accent"
              >
                <span>{item.label}</span>
                <span className="text-muted-foreground">→</span>
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  );
}
