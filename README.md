# Pathline — AI Career Coach

Pathline is a professional, conversational AI career coach. It helps users explore career paths, prepare for interviews, refine résumés, set SMART goals, and navigate workplace challenges — through threaded, persistent chat sessions in a clean dashboard UI.

> Built for the "AI App" project brief: dashboard layout, sidebar navigation, responsive design, input/output sections, AI-generated responses, professional UI/UX, and a responsible-AI disclaimer.

---

## ✨ Features

- **Conversational career coaching** powered by Google Gemini via the Lovable AI Gateway.
- **Threaded chat history** — every conversation is saved per user and resumable from the sidebar.
- **Dashboard layout** with collapsible sidebar navigation (desktop + mobile responsive).
- **Authentication** — email/password and Google OAuth, with protected routes.
- **Streaming responses** rendered as Markdown (headings, lists, bold, code).
- **Auto-titled conversations** generated from the first user message.
- **Calming blue theme** with light/dark support and semantic design tokens.
- **Responsible AI disclaimer** shown under every input and enforced in the system prompt.

---

## 🧠 Problem Relevance

Career decisions are high-stakes and most people don't have on-demand access to a coach. Pathline gives users a private, structured space to:

- Pressure-test career moves
- Draft and rehearse interview answers using the **STAR** framework
- Turn vague ambitions into **SMART** goals
- Get résumé and LinkedIn feedback
- Work through tough workplace situations

---

## 🎯 Prompt Engineering

The system prompt (`src/lib/ai-gateway.server.ts → COACH_SYSTEM_PROMPT`) defines:

1. **Persona & tone** — warm, honest, encouraging; no generic platitudes.
2. **Workflow** — clarify the user's industry/experience/goal *before* advising.
3. **Frameworks** — STAR for interviews, SMART for goals, step-by-step plans.
4. **Output format** — markdown with short paragraphs, bullets, bold emphasis, headings.
5. **Hard boundaries** — not a therapist, recruiter, or legal advisor; no salary or job guarantees; refuse to store sensitive PII; flag uncertainty.

---

## 🛡 Responsible AI Practices

- **Disclaimer** under every chat input: *"AI-generated. Verify important details. Not a substitute for professional advice."*
- **Scope limits** baked into the system prompt (no medical, legal, or financial guarantees).
- **Privacy** — conversations are scoped per user via row-level security; no cross-user leakage.
- **PII protection** — the model refuses and warns if users paste SSNs, IDs, or banking details.
- **Bias mitigation** — the model is instructed not to infer from name, gender, race, or age.
- **Transparency** — acknowledges uncertainty instead of fabricating confidence.

---

## 🏗 Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | TanStack Start (React 19 + Vite 7) |
| Styling | Tailwind CSS v4, shadcn/ui, semantic design tokens |
| Auth & DB | Lovable Cloud (Postgres + Auth + RLS) |
| AI | Lovable AI Gateway → `google/gemini-3-flash-preview` |
| Streaming | Vercel AI SDK (`ai`, `@ai-sdk/react`) |
| State | TanStack Query |

---

## 📁 Project Structure

```
src/
├─ routes/
│  ├─ __root.tsx                 App shell
│  ├─ index.tsx                  Landing page
│  ├─ auth.tsx                   Sign in / sign up
│  ├─ _authenticated/            Protected dashboard
│  │  ├─ route.tsx               Auth gate + sidebar layout
│  │  ├─ chat.tsx                Chat layout
│  │  ├─ chat.index.tsx          Empty / new-chat state
│  │  └─ chat.$threadId.tsx      Active conversation
│  └─ api/chat.ts                Streaming chat endpoint
├─ components/chat/
│  ├─ AppSidebar.tsx             Conversation list + actions
│  └─ ChatWindow.tsx             Streaming chat UI
├─ lib/
│  ├─ ai-gateway.server.ts       Provider + system prompt
│  └─ chat.functions.ts          Server functions (CRUD)
└─ integrations/supabase/        Auto-generated clients
```

---

## 🚀 Getting Started

This project runs on Lovable — backend, auth, and AI keys are provisioned automatically.

1. Open the project in Lovable and press **Run**.
2. Sign up with email or Google on the `/auth` page.
3. Click **New conversation** in the sidebar and start chatting.

To run locally:

```bash
bun install
bun run dev
```

---

## ⚠️ Disclaimer

Pathline is an AI assistant, not a licensed career counselor, therapist, recruiter, or legal advisor. Responses are AI-generated and may be inaccurate. Always verify important information and consult qualified professionals for material decisions.
