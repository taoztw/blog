"use client";

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
  SidebarRail,
} from "@/components/ui/sidebar";
import ROUTES from "@/constants/routes";
import {
  Activity,
  BarChart3,
  Bell,
  Database,
  FileText,
  LayoutDashboard,
  Moon,
  Settings,
  Shield,
  Sun,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { memo } from "react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: `${ROUTES.DASHBOARD}` },
  { title: "Analytics", icon: BarChart3, href: `${ROUTES.DASHBOARD}/analytics` },
  { title: "Users", icon: Users, href: `${ROUTES.DASHBOARD}/users` },
  { title: "Posts", icon: FileText, href: `${ROUTES.DASHBOARD}/posts` },
  // { title: "Activity", icon: Activity, href: "#activity" },
  // { title: "Database", icon: Database, href: "#database" },
  // { title: "Security", icon: Shield, href: "#security" },
  // { title: "Performance", icon: Zap, href: "#performance" },
  // { title: "Notifications", icon: Bell, href: "#notifications" },
  // { title: "Settings", icon: Settings, href: "#settings" },
];

export const AdminSidebar = memo(() => {
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TechCorp</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#profile">
                <User />
                <span>Admin Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AdminSidebar.displayName = "AdminSidebar";
