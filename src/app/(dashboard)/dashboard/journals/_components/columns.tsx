"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
import type { RouterOutputs } from "@/trpc/react";

type Journal = RouterOutputs["journal"]["getByPage"]["items"][number];

interface JournalColumnsProps {
  onEdit: (journal: Journal) => void;
  onDelete: (journal: Journal) => void;
}

export const createJournalColumns = ({ onEdit, onDelete }: JournalColumnsProps): ColumnDef<Journal>[] => [
  {
    accessorKey: "id",
    meta: { label: "ID" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="ID" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.getValue<string>("id").slice(0, 8)}...
      </div>
    ),
  },
  {
    accessorKey: "content",
    meta: {
      label: "内容",
      placeholder: "搜索内容...",
      variant: "text",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="内容预览" />
    ),
    cell: ({ row }) => {
      const content = row.getValue("content") as string;
      try {
        const parsed = JSON.parse(content);
        const firstNode = Array.isArray(parsed) ? parsed[0] : null;
        const text = firstNode?.children?.[0]?.text || "空内容";
        return (
          <div className="max-w-[400px] truncate text-sm">
            {text}
          </div>
        );
      } catch {
        return <div className="text-xs text-muted-foreground italic">无法解析</div>;
      }
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "author.name",
    meta: { label: "作者" },
    header: "作者",
    cell: ({ row }) => row.original.author?.name ?? "未知",
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    meta: { label: "创建时间" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="创建时间" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    meta: { label: "更新时间" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="更新时间" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const journal = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(journal.id)}>
              复制日志 ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(journal)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => onDelete(journal)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
