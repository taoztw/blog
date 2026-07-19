"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { type ColumnDef } from "@tanstack/react-table";
import { Ban, Eye, MoreHorizontal, Shield, ShieldCheck, Trash2, User } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: number | null;
}

interface UserColumnsProps {
  onViewDetails: (user: UserData) => void;
  onUpdateRole: (user: UserData, newRole: string) => void;
  onDelete: (user: UserData) => void;
  onBanUser: (user: UserData) => void;
  onUnbanUser: (user: UserData) => void;
  currentUserId: string;
}

export const createUserColumns = ({
  onViewDetails,
  onUpdateRole,
  onDelete,
  onBanUser,
  onUnbanUser,
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
    enableHiding: false,
  },
  {
    accessorKey: "name",
    meta: {
      label: "姓名",
      placeholder: "搜索用户...",
      variant: "text",
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label="姓名" />,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.name || "未设置"}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      );
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "role",
    meta: {
      label: "角色",
      variant: "select",
      options: [
        { label: "管理员", value: "admin" },
        { label: "用户", value: "user" },
      ],
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label="角色" />,
    cell: ({ row }) => {
      const user = row.original;
      const role = row.getValue("role") as string;
      const variant = role === "admin" ? "default" : "secondary";
      const icon = role === "admin" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />;

      return (
        <div className="flex items-center gap-2">
          <Badge variant={variant} className="capitalize">
            {icon}
            {role === "admin" ? "管理员" : "用户"}
          </Badge>
          {user.banned && (
            <Badge variant="destructive" className="capitalize">
              <Ban className="h-3 w-3 mr-1" />
              已封禁
            </Badge>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) ? value.includes(row.getValue(id)) : true;
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "emailVerified",
    meta: { label: "邮箱验证" },
    header: "邮箱验证",
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean;
      return (
        <Badge variant={verified ? "default" : "secondary"} className="capitalize">
          {verified ? "已验证" : "未验证"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: { label: "注册时间" },
    header: ({ column }) => <DataTableColumnHeader column={column} label="注册时间" />,
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
            <DropdownMenuItem onClick={() => onViewDetails(user)}>
              <Eye className="mr-2 h-4 w-4" />
              查看详情
            </DropdownMenuItem>
            {!isCurrentUser && (
              <>
                <DropdownMenuItem onClick={() => onUpdateRole(user, user.role === "admin" ? "user" : "admin")}>
                  {user.role === "admin" ? (
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
                {user.banned ? (
                  <DropdownMenuItem onClick={() => onUnbanUser(user)}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    解除封禁
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onBanUser(user)}>
                    <Ban className="mr-2 h-4 w-4" />
                    封禁用户
                  </DropdownMenuItem>
                )}
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
