import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getPhase } from "@/lib/hackathon-window";
import { Loader2, CheckCircle2, Lock } from "lucide-react";

const schema = z.object({
  teammate1: z.string().trim().min(1, "Teammate 1 is required").max(80),
  teammate2: z.string().trim().max(80).optional().or(z.literal("")),
  teammate3: z.string().trim().max(80).optional().or(z.literal("")),
  title: z.string().trim().min(1, "Project title is required").max(120),
  url: z.string().trim().url("Must be a valid URL").max(500),
  description: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

type State = "idle" | "submitting" | "success";

export function SubmissionForm({ phaseState }: { phaseState: "before" | "open" | "after" }) {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isOpen = phaseState === "open";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (getPhase().state !== "open") {
      toast.error("Submissions window is not active.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const raw = {
      teammate1: String(fd.get("teammate1") ?? ""),
      teammate2: String(fd.get("teammate2") ?? ""),
      teammate3: String(fd.get("teammate3") ?? ""),
      title: String(fd.get("title") ?? ""),
      url: String(fd.get("url") ?? ""),
      description: String(fd.get("description") ?? ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fe[issue.path.join(".")] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setState("submitting");
    const team = [parsed.data.teammate1, parsed.data.teammate2, parsed.data.teammate3]
      .map((t) => t?.trim())
      .filter((t): t is string => !!t);

    const { error } = await supabase.from("submissions").insert({
      team,
      title: parsed.data.title,
      url: parsed.data.url,
      description: parsed.data.description,
    });

    if (error) {
      console.error(error);
      toast.error("Submission failed. Please try again.");
      setState("idle");
      return;
    }

    setState("success");
    toast.success("Submission received");
    (e.target as HTMLFormElement).reset();
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-10 text-center animate-fade-in-up">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-400" />
        <h3 className="text-2xl font-semibold">Submission received</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your project is in. Good luck.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 inline-flex items-center justify-center rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Submit another project
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card/60 backdrop-blur p-6 sm:p-8 space-y-5">
      {!isOpen && (
        <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {phaseState === "before"
              ? "Submissions are not open yet. The form will unlock at 8:00 PM."
              : "Submissions are now closed."}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field name="teammate1" label="Teammate 1" placeholder="Required" required error={errors.teammate1} disabled={!isOpen} />
        <Field name="teammate2" label="Teammate 2" placeholder="Optional" disabled={!isOpen} />
        <Field name="teammate3" label="Teammate 3" placeholder="Optional" disabled={!isOpen} />
      </div>

      <Field name="title" label="Project title" placeholder="e.g. Neural Notebook" required error={errors.title} disabled={!isOpen} />
      <Field name="url" label="Project URL" placeholder="https://..." required type="url" error={errors.url} disabled={!isOpen} />

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
          About the project
        </label>
        <textarea
          name="description"
          rows={4}
          disabled={!isOpen}
          placeholder="What does it do? What problem does it solve?"
          className="w-full rounded-md border border-border bg-input/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
      </div>

      <button
        type="submit"
        disabled={!isOpen || state === "submitting"}
        className="group relative w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {state === "submitting" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
        ) : isOpen ? (
          <>Submit project →</>
        ) : (
          <><Lock className="h-4 w-4" /> Submissions locked</>
        )}
      </button>
    </form>
  );
}

function Field({
  name, label, placeholder, required, type = "text", error, disabled,
}: {
  name: string; label: string; placeholder?: string; required?: boolean;
  type?: string; error?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label} {required && <span className="text-foreground/60">*</span>}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-md border border-border bg-input/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
