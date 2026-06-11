import { createFileRoute, notFound } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Search } from "lucide-react";
import { ToolPanel, type ToolKey } from "@/components/tools/ToolPanel";

export const Route = createFileRoute("/_authenticated/tools/$tool")({
  component: ToolPage,
  notFoundComponent: () => (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      Tool not found.
    </div>
  ),
});

const CONFIG: Record<ToolKey, Parameters<typeof ToolPanel>[0]> = {
  email: {
    toolKey: "email",
    title: "Smart Email Generator",
    description: "Draft professional workplace emails in seconds. Describe the situation, audience, and tone.",
    inputLabel: "What email do you need?",
    placeholder:
      "Write a polite follow-up to my manager Sarah about the Q4 roadmap meeting. Friendly but professional. Mention I'll share notes by Friday.",
    icon: Mail,
    examples: [
      { label: "Follow-up", prompt: "Polite follow-up to a client who hasn't replied to my proposal sent last Tuesday. Friendly, no pressure, offer to jump on a quick call." },
      { label: "PTO request", prompt: "Request PTO from my manager for August 12–16. Mention coverage plan and that I'll wrap open tickets before leaving." },
      { label: "Decline meeting", prompt: "Politely decline a recurring meeting that no longer fits my priorities. Offer async updates instead." },
    ],
  },
  meeting: {
    toolKey: "meeting",
    title: "Meeting Notes Summarizer",
    description: "Paste raw meeting notes or a transcript. Get a clean summary, decisions, and action items.",
    inputLabel: "Paste your notes or transcript",
    placeholder:
      "Standup 10:00 — Alex: shipped login fix, blocked on design for onboarding. Priya: API contract done, will pair with Sam on integration. Decided to push v2 to next sprint…",
    icon: FileText,
    examples: [
      { label: "Standup notes", prompt: "Standup notes — Alex shipped login fix, blocked on onboarding design. Priya finished API contract, will pair with Sam tomorrow. Decision: push v2 launch to next sprint. Open: who owns onboarding copy?" },
    ],
  },
  tasks: {
    toolKey: "tasks",
    title: "AI Task Planner",
    description: "Turn a messy goal or to-do list into a prioritized, time-boxed plan.",
    inputLabel: "What do you need to plan?",
    placeholder:
      "I need to launch a marketing landing page by end of next week. Includes copy, design, dev, analytics setup, and a launch email.",
    icon: ListChecks,
    examples: [
      { label: "Launch plan", prompt: "Launch a marketing landing page by end of next week — copy, design, dev, analytics, launch email." },
      { label: "Onboarding", prompt: "Plan first-week onboarding for a new product designer joining the team Monday." },
    ],
  },
  research: {
    toolKey: "research",
    title: "AI Research Assistant",
    description: "Get a concise, structured brief on any work topic. Trade-offs, key points, and follow-ups.",
    inputLabel: "What do you want to learn about?",
    placeholder:
      "Compare async vs sync standups for a 12-person distributed engineering team. Focus on productivity and team cohesion.",
    icon: Search,
    examples: [
      { label: "Tool comparison", prompt: "Compare Notion vs Confluence for a 50-person product team. Focus on adoption, search, and integrations." },
      { label: "Best practices", prompt: "What are best practices for running effective 1:1s as a new engineering manager?" },
    ],
  },
};

function ToolPage() {
  const { tool } = Route.useParams();
  const cfg = CONFIG[tool as ToolKey];
  if (!cfg) throw notFound();
  return <ToolPanel {...cfg} />;
}