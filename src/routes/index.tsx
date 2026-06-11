import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Briefcase, Mail, FileText, ListChecks, Search, Bot, Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkFlow AI — Workplace Productivity Assistant" },
      { name: "description", content: "WorkFlow AI is a modern productivity suite that helps professionals draft emails, summarize meetings, plan tasks, and research topics with AI." },
      { property: "og:title", content: "WorkFlow AI — Workplace Productivity Assistant" },
      { property: "og:description", content: "Smart Email Generator, Meeting Summarizer, AI Task Planner, Research Assistant, and AI Chatbot in one workspace." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Mail, title: "Smart Email Generator", body: "Draft polished workplace emails in your tone — follow-ups, requests, replies." },
  { icon: FileText, title: "Meeting Notes Summarizer", body: "Turn raw notes or transcripts into clean summaries, decisions, and action items." },
  { icon: ListChecks, title: "AI Task Planner", body: "Convert messy goals into prioritized, time-boxed plans you can act on." },
  { icon: Search, title: "AI Research Assistant", body: "Get concise, structured briefs on any work topic with trade-offs and next steps." },
  { icon: Bot, title: "AI Chatbot Interface", body: "A threaded assistant that remembers context for ongoing work conversations." },
  { icon: Sparkles, title: "All in one workspace", body: "A modern dashboard with sidebar nav, light/dark mode, and mobile-friendly UI." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">WorkFlow AI</span>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> AI workplace productivity
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          Automate the busywork. Focus on real work.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          WorkFlow AI is a modern assistant for professionals. Draft emails, summarize meetings, plan tasks, research topics, and chat with AI — all in one calm dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/tools/$tool" params={{ tool: "email" }}>Open workspace</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth">Create account</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                WorkFlow AI generates content using AI and may be inaccurate. Always review outputs before sending or sharing. Avoid pasting sensitive personal data (government IDs, financial details, secrets). Your work is stored privately on your account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
