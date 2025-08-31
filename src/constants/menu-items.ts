import { BarChart3, FileText, FolderOpen, LayoutDashboard, SquareStack, Tag, Upload, Users } from "lucide-react";
import ROUTES from "./routes";

export const DASHBOARD_MENU_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, href: `${ROUTES.DASHBOARD}` },
  { title: "Analytics", icon: BarChart3, href: `${ROUTES.DASHBOARD}/analytics` },
  { title: "Users", icon: Users, href: `${ROUTES.DASHBOARD}/users` },
  { title: "Posts", icon: FileText, href: `${ROUTES.DASHBOARD}/posts` },
  { title: "Projects", icon: FolderOpen, href: `${ROUTES.DASHBOARD}/projects` },
  { title: "Upload", icon: Upload, href: `${ROUTES.DASHBOARD}/upload` },
  { title: "Categories", icon: SquareStack, href: `${ROUTES.DASHBOARD}/categories` },
  { title: "Tags", icon: Tag, href: `${ROUTES.DASHBOARD}/tags` },
];
