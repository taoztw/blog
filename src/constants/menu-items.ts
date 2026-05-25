import {
  BookText,
  FileText,
  FolderOpen,
  LayoutDashboard,
  SquareStack,
  Tag,
  Users,
} from "lucide-react";
import ROUTES from "./routes";

export const DASHBOARD_MENU_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, href: `${ROUTES.DASHBOARD}` },
  { title: "Users", icon: Users, href: `${ROUTES.DASHBOARD}/users` },
  { title: "Posts", icon: FileText, href: `${ROUTES.DASHBOARD}/posts` },
  { title: "Journals", icon: BookText, href: `${ROUTES.DASHBOARD}/journals` },
  { title: "Projects", icon: FolderOpen, href: `${ROUTES.DASHBOARD}/projects` },
  { title: "Categories", icon: SquareStack, href: `${ROUTES.DASHBOARD}/categories` },
  { title: "Tags", icon: Tag, href: `${ROUTES.DASHBOARD}/tags` },
];
