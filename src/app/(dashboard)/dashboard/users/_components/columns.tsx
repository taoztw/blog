"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES_ENUM } from "@/server/db/schema";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserColumnsProps {
  onViewDetails: (user: UserData) => void;
  onUpdateRole: (user: UserData, newRole: string) => void;
  onDelete: (user: UserData) => void;
  currentUserId: string;
}

export const createUserColumns = ({
  onViewDetails,
  onUpdateRole,
  onDelete,
  currentUserId,
}: UserColumnsProps): ColumnDef<UserData>[] => [
  {
    accessorKey: "image",
    header: "头像",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image || ""} alt={user.name || ""} />
          <AvatarFallback>
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          姓名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.name || "未设置"}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "角色",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const variant = role === ROLES_ENUM.ADMIN ? "default" : "secondary";
      const icon = role === ROLES_ENUM.ADMIN ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />;

      return (
        <Badge variant={variant} className="capitalize">
          {icon}
          {role === ROLES_ENUM.ADMIN ? "管理员" : "用户"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "location",
    header: "位置",
    cell: ({ row }) => {
      const location = row.getValue("location") as string | null;
      return <span className="text-sm text-muted-foreground">{location || "未设置"}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          注册时间
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString("zh-CN")}</div>;
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      const isCurrentUser = user.id === currentUserId;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开操作菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>复制用户 ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(user)}>
              <Eye className="mr-2 h-4 w-4" />
              查看详情
            </DropdownMenuItem>
            {!isCurrentUser && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    onUpdateRole(user, user.role === ROLES_ENUM.ADMIN ? ROLES_ENUM.USER : ROLES_ENUM.ADMIN)
                  }
                >
                  {user.role === ROLES_ENUM.ADMIN ? (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      设为用户
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      设为管理员
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => onDelete(user)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除用户
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
