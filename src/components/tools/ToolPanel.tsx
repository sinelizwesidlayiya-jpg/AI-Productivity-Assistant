import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { runTool } from "@/lib/tools.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export type ToolKey = "email" | "meeting" | "tasks" | "research";

export interface ToolPanelProps {
  toolKey: ToolKey;
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  examples?: { label: string; prompt: string }[];
  icon: React.ComponentType<{ className?: string }>;
}

export function ToolPanel({
  toolKey,
  title,
  description,
  inputLabel,
  placeholder,
  examples = [],
  icon: Icon,
}: ToolPanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const run = useServerFn(runTool);

  const mut = useMutation({
    mutationFn: (prompt: string) => run({ data: { tool: toolKey, prompt } }),
    onSuccess: (res) => setOutput(res.text),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to generate"),
  });

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = input.trim();
    if (!t || mut.isPending) return;
    setOutput(null);
    mut.mutate(t);
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {inputLabel}
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              rows={12}
              className="mt-2 min-h-[280px] resize-y border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
            {examples.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => setInput(ex.prompt)}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                AI-generated. Review before sending or sharing.
              </p>
              <Button type="submit" disabled={!input.trim() || mut.isPending} className="gap-2">
                {mut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate
              </Button>
            </div>
          </form>

          {/* Output */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Result
              </label>
              {output && (
                <button
                  onClick={copy}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <div className="mt-2 min-h-[280px]">
              {mut.isPending && (
                <div className="flex h-full items-center justify-center py-12 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                </div>
              )}
              {!mut.isPending && !output && (
                <div className="flex h-full items-center justify-center py-12 text-center text-sm text-muted-foreground">
                  Your AI-generated result will appear here.
                </div>
              )}
              {output && (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Responsible AI: Outputs may contain inaccuracies. Verify facts, avoid sharing sensitive PII, and use human judgment for important decisions.
        </p>
      </div>
    </div>
  );
}