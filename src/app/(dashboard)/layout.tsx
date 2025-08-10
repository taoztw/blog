import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { DashboardHeader } from "@/components/dashboard/home/dashboard-header";
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
