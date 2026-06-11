import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Mail, FileText, ListChecks, Search } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createThread } from "@/lib/chat.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatHome,
});

const STARTERS = [
  { icon: Mail, title: "Help me write an email", prompt: "Help me write a professional email. Ask me who it's for, the goal, and tone, then draft it." },
  { icon: FileText, title: "Summarize meeting notes", prompt: "I'll paste raw meeting notes. Summarize them with key decisions, action items, and open questions." },
  { icon: ListChecks, title: "Plan my week", prompt: "Help me plan my work week. Ask about my goals and current commitments, then suggest a prioritized plan." },
  { icon: Search, title: "Research a work topic", prompt: "Research a topic for me at a professional level. Ask what I want to learn and the depth I need." },
];

function ChatHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createThread);
  const createMut = useMutation({
    mutationFn: (starter?: string) =>
      create().then((t) => ({ ...t, starter })),
    onSuccess: ({ id, starter }) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({
        to: "/chat/$threadId",
        params: { threadId: id },
        search: starter ? { prompt: starter } : undefined,
      });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">How can I help you work smarter today?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Chat with your AI workplace assistant. For one-off generation, use the tools in the sidebar.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {STARTERS.map((s) => (
            <button
              key={s.title}
              onClick={() => createMut.mutate(s.prompt)}
              disabled={createMut.isPending}
              className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-sm disabled:opacity-60"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary group-hover:bg-primary/10">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">{s.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{s.prompt}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => createMut.mutate(undefined)} disabled={createMut.isPending}>
            Start a blank conversation
          </Button>
        </div>

        <div className="mt-12 rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Responsible AI notice</p>
          <p className="mt-1">
            WorkFlow AI generates responses using AI. Outputs may be inaccurate or incomplete and should not
            replace expert advice (legal, financial, medical, HR). Avoid sharing sensitive personal data
            (government IDs, banking, secrets) — always verify before acting on AI suggestions.
          </p>
        </div>
      </div>
    </div>
  );
}