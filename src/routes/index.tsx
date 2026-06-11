import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Moon, Plus, Sun, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drift — Calm Task Management" },
      { name: "description", content: "A minimal, calming task manager. Organize by category, focus on what matters." },
      { property: "og:title", content: "Drift — Calm Task Management" },
      { property: "og:description", content: "A minimal, calming task manager. Organize by category, focus on what matters." },
    ],
  }),
  component: Index,
});

type Category = "Personal" | "Work" | "Ideas" | "Errands";
const CATEGORIES: Category[] = ["Personal", "Work", "Ideas", "Errands"];
const CATEGORY_STYLES: Record<Category, string> = {
  Personal: "bg-primary/10 text-primary",
  Work: "bg-accent text-accent-foreground",
  Ideas: "bg-secondary text-secondary-foreground",
  Errands: "bg-muted text-muted-foreground",
};

type Task = {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  createdAt: number;
};

const STORAGE_KEY = "drift.tasks.v1";
const THEME_KEY = "drift.theme";

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [dark, setDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
      const theme = localStorage.getItem(THEME_KEY);
      const prefersDark = theme
        ? theme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(prefersDark);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark, hydrated]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), title: t, category, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setTitle("");
  };

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const clearCompleted = () => setTasks((prev) => prev.filter((t) => !t.completed));

  const visible = useMemo(
    () => (filter === "All" ? tasks : tasks.filter((t) => t.category === filter)),
    [tasks, filter],
  );
  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Drift</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {remaining === 0 ? "All clear. Enjoy the calm." : `${remaining} task${remaining === 1 ? "" : "s"} on your mind`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setDark((d) => !d)}
            className="rounded-full"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        <form
          onSubmit={addTask}
          className="mb-6 rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow focus-within:shadow-md"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            />
            <div className="flex gap-2">
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="rounded-xl">
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </form>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["All", ...CATEGORIES] as const).map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent",
                )}
              >
                {c}
              </button>
            );
          })}
          {tasks.some((t) => t.completed) && (
            <button
              onClick={clearCompleted}
              className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear completed
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {visible.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              Nothing here yet. Add your first task above.
            </li>
          )}
          {visible.map((t) => (
            <li
              key={t.id}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-all",
                "hover:border-primary/30 hover:shadow-sm",
                t.completed && "opacity-60",
              )}
            >
              <Checkbox
                checked={t.completed}
                onCheckedChange={() => toggle(t.id)}
                className="h-5 w-5 rounded-full"
                aria-label={`Mark ${t.title} complete`}
              />
              <span
                className={cn(
                  "flex-1 text-sm transition-all",
                  t.completed && "line-through text-muted-foreground",
                )}
              >
                {t.title}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  CATEGORY_STYLES[t.category],
                )}
              >
                {t.category}
              </span>
              <button
                onClick={() => remove(t.id)}
                aria-label="Delete task"
                className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        {tasks.length > 0 && (
          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3 w-3" />
            {tasks.filter((t) => t.completed).length} of {tasks.length} done
          </p>
        )}
      </div>
    </div>
  );
}
