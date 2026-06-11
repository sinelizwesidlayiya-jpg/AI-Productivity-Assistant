import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ChatWindow } from "@/components/chat/ChatWindow";

const searchSchema = z.object({ prompt: z.string().optional() });

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  validateSearch: searchSchema,
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  const { prompt } = Route.useSearch();
  return <ChatWindow key={threadId} threadId={threadId} initialPrompt={prompt} />;
}