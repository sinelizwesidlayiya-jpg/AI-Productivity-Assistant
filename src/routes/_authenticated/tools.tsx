import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/chat/DashboardLayout";

export const Route = createFileRoute("/_authenticated/tools")({
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
});