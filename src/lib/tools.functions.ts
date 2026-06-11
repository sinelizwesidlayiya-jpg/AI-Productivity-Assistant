import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const TOOL_SYSTEM_PROMPTS: Record<string, string> = {
  email: `You are a professional workplace email writer. Given the user's intent, audience, tone, and key points, draft a clear, concise, and polite email.

Output format (markdown):
- **Subject:** <one-line subject>
- A blank line, then the email body with greeting, 1-3 short paragraphs, and a sign-off.

Rules:
- Match the requested tone (default: professional and friendly).
- Be concrete; avoid filler. Use bullet points only when the content is genuinely a list.
- Do not invent facts. If a detail is unclear, leave a clearly marked placeholder like [your name].`,

  meeting: `You are a meeting notes summarizer for busy professionals. Given raw notes or a transcript, produce a clean structured summary.

Output format (markdown), in this exact order:
## Summary
2-4 sentences capturing the meeting purpose and outcome.

## Key Decisions
Bulleted list. If none, write "None recorded."

## Action Items
Bulleted list as: **Owner** — task (due: date if mentioned, else "TBD").

## Open Questions
Bulleted list. If none, write "None."

Rules:
- Be faithful to the source. Do not fabricate names, dates, or decisions.
- If owners aren't named, write "Unassigned".
- Keep bullets short and scannable.`,

  tasks: `You are an AI task planner. Given a goal or a messy list of work, break it into a clear, prioritized plan.

Output format (markdown):
## Plan Overview
1-2 sentence framing of the goal.

## Prioritized Tasks
A numbered list. For each task:
1. **Task title** — short description.
   - Priority: High | Medium | Low
   - Estimated effort: e.g. 30 min, 2 hr, 1 day
   - Suggested deadline (relative, e.g. "today", "by Friday")

## Suggested Order
A short paragraph explaining what to tackle first and why.

Rules:
- Group related work; avoid duplicates.
- Be realistic about effort. Flag dependencies.
- If the goal is vague, ask one clarifying question at the top before the plan.`,

  research: `You are an AI research assistant for working professionals. Given a topic or question, produce a concise, well-structured brief.

Output format (markdown):
## TL;DR
2-3 sentence answer.

## Key Points
5-8 bullet points covering the most important facts, considerations, or trade-offs.

## Things to Verify
A short bulleted list of claims the user should double-check from primary sources, because you cannot browse the web in real time.

## Suggested Next Steps
1-3 concrete follow-up actions.

Rules:
- Be honest about uncertainty. Do not fabricate statistics, citations, or URLs.
- Use neutral, professional language.
- If the topic requires very recent information, say so explicitly.`,
};

const InputSchema = z.object({
  tool: z.enum(["email", "meeting", "tasks", "research"]),
  prompt: z.string().min(1).max(8000),
});

export const runTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    try {
      const { text } = await generateText({
        model,
        system: TOOL_SYSTEM_PROMPTS[data.tool],
        prompt: data.prompt,
      });
      return { text };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg.includes("429")) throw new Error("Rate limit reached. Please try again shortly.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(msg);
    }
  });