import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { DashboardHeader } from "@/app/(dashboard)/dashboard/_components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ROUTES from "@/constants/routes";
import { getAuth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !session.user.role || session.user.role !== "admin") {
    redirect(ROUTES.HOME);
  }
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
