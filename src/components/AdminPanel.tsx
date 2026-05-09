import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Lock, ExternalLink, Users, X } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "LBAerror404";

type Submission = {
  id: string;
  team: string[];
  title: string;
  url: string;
  description: string;
  created_at: string;
};

export function AdminPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setAuthed(false);
      setPassword("");
      setError("");
    }
  }, [open]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          authed
            ? "max-w-5xl bg-card/95 backdrop-blur-xl border-border"
            : "max-w-sm bg-card/95 backdrop-blur-xl border-border"
        }
      >
        {!authed ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Restricted Access
              </DialogTitle>
              <DialogDescription>
                Enter the admin password to continue.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4 mt-2">
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full rounded-md border border-border bg-input/60 px-3 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Unlock
              </button>
            </form>
          </>
        ) : (
          <AdminDashboard />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AdminDashboard() {
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        toast.error("Failed to load submissions");
        setSubs([]);
        return;
      }
      setSubs((data ?? []) as Submission[]);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-display">
              Admin Control · Submissions
            </DialogTitle>
            <DialogDescription>
              {subs ? `${subs.length} total · sorted by latest` : "Loading…"}
            </DialogDescription>
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/80 font-mono">
            ● Live
          </span>
        </div>
      </DialogHeader>

      <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
        {!subs ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : subs.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No submissions yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subs.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s)}
                className="group text-left rounded-lg border border-border bg-background/40 hover:bg-background/70 hover:border-foreground/30 transition-all p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                    {s.title}
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {new Date(s.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {s.team[0]}
                  </span>
                  {s.team.slice(1).map((m) => (
                    <span
                      key={m}
                      className="text-muted-foreground before:content-['·'] before:mr-1"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-display pr-6">
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="font-mono text-[11px] uppercase tracking-widest">
                  Submitted{" "}
                  {new Date(selected.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <section>
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    Team
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.team.map((m, i) => (
                      <span
                        key={m}
                        className={
                          i === 0
                            ? "rounded-md border border-foreground/30 bg-foreground/10 px-2.5 py-1 text-xs font-medium"
                            : "rounded-md border border-border bg-background/40 px-2.5 py-1 text-xs text-muted-foreground"
                        }
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </section>
                <section>
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    Project URL
                  </h4>
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-foreground/70 break-all"
                  >
                    {selected.url}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </section>
                <section>
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {selected.description}
                  </p>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}