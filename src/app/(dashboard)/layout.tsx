import { AdminSidebar } from "@/components/mvpblocks/ui/admin-sidebar";
import { DashboardHeader } from "@/components/mvpblocks/ui/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
