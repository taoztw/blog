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
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { type Category } from "@/global";

interface CategoryColumnsProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const createCategoryColumns = ({ onEdit, onDelete }: CategoryColumnsProps): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    meta: {
      label: "类别名称",
      placeholder: "搜索类别...",
      variant: "text",
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        label="类别名称"
      />
    ),
    cell: ({ row }) => {
      return <div className="flex font-medium justify-start ml-3">{row.getValue("name")}</div>;
    },
    enableColumnFilter: true,
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
    accessorKey: "createdAt",
    meta: { label: "创建时间" },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        label="创建时间"
      />
    ),
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
      const category = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">打开操作菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => onDelete(category)}
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
