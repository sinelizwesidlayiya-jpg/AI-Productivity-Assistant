import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThreadMessages } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Square, Loader2, Compass, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChatWindow({
  threadId,
  initialPrompt,
}: {
  threadId: string;
  initialPrompt?: string;
}) {
  const fetchMessages = useServerFn(getThreadMessages);
  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      const rows = await fetchMessages({ data: { threadId } });
      return rows.map((r) => ({
        id: r.id,
        role: r.role as UIMessage["role"],
        parts: JSON.parse(r.parts) as UIMessage["parts"],
      })) satisfies UIMessage[];
    },
  });

  if (isLoading || !initialMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ChatInner threadId={threadId} initialMessages={initialMessages} initialPrompt={initialPrompt} />
  );
}

function ChatInner({
  threadId,
  initialMessages,
  initialPrompt,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  initialPrompt?: string;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Something went wrong"),
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const submittedInitial = useRef(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (initialPrompt && !submittedInitial.current && initialMessages.length === 0) {
      submittedInitial.current = true;
      sendMessage({ text: initialPrompt });
    }
  }, [initialPrompt, initialMessages.length, sendMessage]);

  const isLoading = status === "submitted" || status === "streaming";

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Send a message to begin.
            </div>
          )}
          <div className="space-y-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error.message}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <form
          onSubmit={submit}
          className="mx-auto max-w-3xl px-4 py-3 sm:px-6"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/40 focus-within:shadow-md">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask about your career, resume, interview prep…"
              rows={1}
              className="min-h-[52px] resize-none border-0 bg-transparent pr-14 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="absolute bottom-2 right-2">
              {isLoading ? (
                <Button type="button" size="icon" variant="secondary" onClick={() => stop()}>
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI-generated. Verify important details. Not a substitute for professional advice.
          </p>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-foreground",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}