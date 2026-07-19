"use client";

import type { ColumnDef } from "@tanstack/react-table";
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
import { TagBadge } from "@/components/tag-badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { type Tag } from "@/global";

interface TagColumnsProps {
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export const createTagColumns = ({ onEdit, onDelete }: TagColumnsProps): ColumnDef<Tag>[] => [
  {
    accessorKey: "name",
    meta: {
      label: "标签名称",
      placeholder: "搜索标签...",
      variant: "text",
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label="标签名称" />,
    cell: ({ row }) => {
      const { color, icon } = row.original;
      return (
        <TagBadge name={row.getValue("name")} color={color} icon={icon} />
      );
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "icon",
    meta: { label: "图标" },
    header: "图标",
    cell: ({ row }) => {
      const icon = row.getValue("icon") as string | null;
      return icon ? (
        <span
          className="inline-block size-5 [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      ) : (
        <span className="text-xs text-muted-foreground">无</span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "description",
    meta: { label: "描述" },
    header: "描述",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return <div className="max-w-[300px] truncate text-muted-foreground">{description || "暂无描述"}</div>;
    },
  },
  {
    accessorKey: "color",
    meta: { label: "颜色" },
    header: "颜色",
    cell: ({ row }) => {
      const color = row.getValue("color") as string | null;
      return (
        <div className="flex items-center gap-2">
          {color && (
            <>
              <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: color }} />
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
    meta: { label: "创建时间" },
    header: ({ column }) => <DataTableColumnHeader column={column} label="创建时间" />,
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
