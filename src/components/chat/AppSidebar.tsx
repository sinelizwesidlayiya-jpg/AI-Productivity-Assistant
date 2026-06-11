import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, MessageSquare, LogOut, Trash2, Mail, FileText, ListChecks, Search, Bot } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createThread, deleteThread, listThreads } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TOOLS = [
  { slug: "email", label: "Email Generator", icon: Mail },
  { slug: "meeting", label: "Meeting Summarizer", icon: FileText },
  { slug: "tasks", label: "Task Planner", icon: ListChecks },
  { slug: "research", label: "Research Assistant", icon: Search },
] as const;

export function AppSidebar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const params = useParams({ strict: false }) as { threadId?: string; tool?: string };
  const activeId = params.threadId;
  const activeTool = params.tool;

  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: () => list(),
  });

  const createMut = useMutation({
    mutationFn: () => create(),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (activeId === id) navigate({ to: "/chat" });
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">WorkFlow AI</p>
            <p className="truncate text-[11px] text-muted-foreground">Workplace Productivity</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TOOLS.map((t) => (
                <SidebarMenuItem key={t.slug}>
                  <SidebarMenuButton asChild isActive={activeTool === t.slug}>
                    <Link to="/tools/$tool" params={{ tool: t.slug }} className="flex items-center gap-2">
                      <t.icon className="h-4 w-4" />
                      <span className="truncate">{t.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /> AI Chatbot</span>
            <button
              onClick={() => createMut.mutate()}
              disabled={createMut.isPending}
              aria-label="New conversation"
              className="rounded p-0.5 text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading && (
                <div className="px-2 py-3 text-xs text-muted-foreground">Loading…</div>
              )}
              {!isLoading && threads.length === 0 && (
                <div className="px-2 py-3 text-xs text-muted-foreground">
                  No conversations yet.
                </div>
              )}
              {threads.map((t) => (
                <SidebarMenuItem key={t.id}>
                  <div
                    className={cn(
                      "group/item flex items-center gap-1 rounded-md",
                      activeId === t.id && "bg-sidebar-accent",
                    )}
                  >
                    <SidebarMenuButton asChild isActive={activeId === t.id} className="flex-1">
                      <Link
                        to="/chat/$threadId"
                        params={{ threadId: t.id }}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <button
                      onClick={() => delMut.mutate(t.id)}
                      aria-label="Delete conversation"
                      className="mr-1 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover/item:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start gap-2">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}