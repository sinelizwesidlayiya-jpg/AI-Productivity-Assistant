import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Compass, Sparkles, FileText, MessageCircle, Target } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createThread } from "@/lib/chat.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatHome,
});

const STARTERS = [
  { icon: FileText, title: "Review my resume", prompt: "Help me improve my resume. I'll share the role I'm targeting and my current bullets, and I want sharper, results-driven phrasing." },
  { icon: MessageCircle, title: "Prepare for an interview", prompt: "Help me prepare for an upcoming interview. Ask me about the role, then walk me through likely questions using the STAR framework." },
  { icon: Target, title: "Plan my next career move", prompt: "I'm thinking about my next career move. Ask me about my current role, what's working, what isn't, and my longer-term goals, then suggest options." },
  { icon: Sparkles, title: "Explore a career change", prompt: "I'm considering changing careers. Help me explore options based on my skills, interests, and constraints." },
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
            <Compass className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">How can I help your career today?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Pathline is your AI career coach. Get help with resumes, interview prep, career changes, and workplace decisions.
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
            Pathline uses AI to generate guidance based on your inputs. Responses may be inaccurate or
            incomplete and should not replace advice from qualified career, legal, or mental-health professionals.
            Avoid sharing sensitive personal information (government IDs, financial details).
          </p>
        </div>
      </div>
    </div>
  );
}