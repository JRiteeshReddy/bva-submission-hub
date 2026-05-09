import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Lock, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// NOTE: client-side gate only. Structured so we can swap in a server check later.
const ADMIN_PASSWORD = "LBAerror404";

type Submission = {
  id: string;
  team: string[];
  title: string;
  url: string;
  description: string;
  created_at: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminPanel({ open, onOpenChange }: Props) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setAuthed(false);
      setPassword("");
      setError(null);
      setSelected(null);
    }
  }, [open]);

  // Load submissions once authed
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setSubmissions((data ?? []) as Submission[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  function handleSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError(null);
    } else {
      setError("Incorrect password.");
    }
  }

  // Password modal
  if (!authed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-border bg-card/95 backdrop-blur-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Lock className="h-4 w-4" /> Restricted area
            </DialogTitle>
            <DialogDescription>
              Enter the admin password to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword} className="mt-2 space-y-3">
            <Input
              type="password"
              autoFocus
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Admin dashboard overlay (not a nested Dialog — full-screen panel)
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-fade-in-up">
      <div className="border-b border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {selected ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-foreground" />
                Admin · Control Dashboard
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Close admin panel"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/60 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {selected ? (
            <DetailView submission={selected} />
          ) : (
            <ListView
              submissions={submissions}
              loading={loading}
              error={error}
              onSelect={setSelected}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ListView({
  submissions,
  loading,
  error,
  onSelect,
}: {
  submissions: Submission[];
  loading: boolean;
  error: string | null;
  onSelect: (s: Submission) => void;
}) {
  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight font-display">
            All submissions
          </h2>
          <p className="text-sm text-muted-foreground">
            {submissions.length} total · sorted by latest
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading submissions…</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && submissions.length === 0 && (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {submissions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            className="group rounded-lg border border-border bg-card/50 p-5 text-left transition-all hover:border-foreground/30 hover:bg-card/80 hover:shadow-lg focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {new Date(s.created_at).toLocaleString()}
            </div>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight">
              {s.title}
            </h3>
            <div className="mt-4 space-y-1">
              {s.team.map((member, idx) => (
                <div
                  key={idx}
                  className={
                    idx === 0
                      ? "text-sm font-medium text-foreground"
                      : "text-sm text-muted-foreground"
                  }
                >
                  <span className="text-muted-foreground/60 mr-2">
                    {idx === 0 ? "★" : "·"}
                  </span>
                  {member}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function DetailView({ submission }: { submission: Submission }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Submitted {new Date(submission.created_at).toLocaleString()}
        </div>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight font-display">
          {submission.title}
        </h2>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Team
        </div>
        <ul className="mt-3 space-y-2">
          {submission.team.map((member, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-muted-foreground/60 w-6">
                {idx === 0 ? "★" : `0${idx + 1}`}
              </span>
              <span
                className={
                  idx === 0 ? "font-medium" : "text-muted-foreground"
                }
              >
                {member}
                {idx === 0 && (
                  <span className="ml-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Lead
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Project URL
        </div>
        <a
          href={submission.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-flex items-center gap-2 text-sm text-foreground underline-offset-4 hover:underline break-all"
        >
          {submission.url}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Description
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {submission.description}
        </p>
      </div>
    </div>
  );
}
