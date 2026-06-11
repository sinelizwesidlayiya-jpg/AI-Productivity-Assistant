import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Compass, FileText, MessageCircle, Target, Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pathline — AI Career Coach" },
      { name: "description", content: "Pathline is an AI career coach that helps with resumes, interviews, and career decisions. Built with responsible-AI guardrails." },
      { property: "og:title", content: "Pathline — AI Career Coach" },
      { property: "og:description", content: "Resume reviews, interview prep, and career planning — guided by AI." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: FileText, title: "Resume coaching", body: "Sharpen bullets with measurable impact and stronger verbs." },
  { icon: MessageCircle, title: "Interview prep", body: "Practice STAR-format answers tailored to the role." },
  { icon: Target, title: "Career planning", body: "Map next steps based on your skills, goals, and constraints." },
  { icon: Sparkles, title: "Always available", body: "Get unbiased, on-demand guidance whenever you need it." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">Pathline</span>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> AI career coach
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          Career guidance that listens first, then helps.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Pathline asks the right questions about your goals and gives specific, actionable advice on resumes, interviews, and your next move — privately and on your schedule.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/chat">Start coaching</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth">Create account</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Responsible AI</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Pathline generates guidance using AI and may be inaccurate. It is not a substitute for licensed career counselors, recruiters, lawyers, or mental-health professionals. Avoid sharing sensitive personal data (government IDs, financial details). Your conversations are stored privately on your account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
