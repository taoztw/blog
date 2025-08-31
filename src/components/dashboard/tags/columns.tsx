"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { type Tag } from "@/global";

interface TagColumnsProps {
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export const createTagColumns = ({ onEdit, onDelete }: TagColumnsProps): ColumnDef<Tag>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          标签名称
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const color = row.original.color;
      return (
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="font-medium"
            style={{ 
              backgroundColor: color ? `${color}20` : undefined,
              borderColor: color || undefined,
              color: color || undefined
            }}
          >
            {row.getValue("name")}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return <div className="max-w-[300px] truncate text-muted-foreground">{description || "暂无描述"}</div>;
    },
  },
  {
    accessorKey: "color",
    header: "颜色",
    cell: ({ row }) => {
      const color = row.getValue("color") as string | null;
      return (
        <div className="flex items-center gap-2">
          {color && (
            <>
              <div 
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{color}</span>
            </>
          )}
          {!color && <span className="text-xs text-muted-foreground">无</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-center hover:bg-transparent"
        >
          创建时间
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("zh-CN");
      return <div className="flex justify-center font-base">{formatted}</div>;
    },
    enableSorting: true,
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const tag = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tag.id.toString())}>
              复制标签 ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(tag)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500" onClick={() => onDelete(tag)}>
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];