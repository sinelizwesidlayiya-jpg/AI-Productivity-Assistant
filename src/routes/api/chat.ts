import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  COACH_SYSTEM_PROMPT,
  createLovableAiGatewayProvider,
} from "@/lib/ai-gateway.server";

type ChatBody = { messages?: UIMessage[]; threadId?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !LOVABLE_API_KEY) {
            return new Response("Server not configured", { status: 500 });
          }

          const authHeader = request.headers.get("authorization") ?? "";
          if (!authHeader.startsWith("Bearer ")) {
            return new Response("Unauthorized", { status: 401 });
          }
          const token = authHeader.slice("Bearer ".length);

          const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
          if (claimsErr || !claims?.claims?.sub) {
            return new Response("Unauthorized", { status: 401 });
          }
          const userId = claims.claims.sub;

          const body = (await request.json()) as ChatBody;
          const messages = Array.isArray(body.messages) ? body.messages : [];
          const threadId = body.threadId;
          if (!threadId) return new Response("threadId required", { status: 400 });

          // Verify thread belongs to user
          const { data: thread, error: threadErr } = await supabase
            .from("threads")
            .select("id, title")
            .eq("id", threadId)
            .maybeSingle();
          if (threadErr || !thread) {
            return new Response("Thread not found", { status: 404 });
          }

          // Persist the latest user message (last message in array)
          const last = messages[messages.length - 1];
          if (last && last.role === "user") {
            await supabase.from("messages").insert({
              thread_id: threadId,
              user_id: userId,
              role: "user",
              parts: last.parts as unknown as object,
            });

            // Auto-title from first user message
            if (thread.title === "New conversation") {
              const text = last.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join(" ")
                .trim()
                .slice(0, 60);
              if (text) {
                await supabase.from("threads").update({ title: text }).eq("id", threadId);
              }
            }
          }

          const gateway = createLovableAiGatewayProvider(LOVABLE_API_KEY);
          const model = gateway("google/gemini-3-flash-preview");

          const result = streamText({
            model,
            system: COACH_SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages,
            onFinish: async ({ messages: finalMessages }) => {
              const assistant = finalMessages[finalMessages.length - 1];
              if (assistant && assistant.role === "assistant") {
                await supabase.from("messages").insert({
                  thread_id: threadId,
                  user_id: userId,
                  role: "assistant",
                  parts: assistant.parts as unknown as object,
                });
              }
            },
          });
        } catch (e) {
          console.error("/api/chat error", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});