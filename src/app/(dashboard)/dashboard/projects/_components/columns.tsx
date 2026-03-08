"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { ProjectWithRelations } from "@/global";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import Image from "next/image";

interface ColumnProps {
  onEdit: (project: ProjectWithRelations) => void;
  onDelete: (id: string) => void;
}

const getStatusVariant = (status: string) => {
  return status === "published" ? "default" : "secondary";
};

const getStatusLabel = (status: string) => {
  return status === "published" ? "已发布" : "草稿";
};

export function createProjectColumns({ onEdit, onDelete }: ColumnProps): ColumnDef<ProjectWithRelations>[] {
  return [
    {
      accessorKey: "imageUrl",
      header: "图片",
      cell: ({ row }) => {
        const imageUrl = row.getValue("imageUrl") as string;
        return imageUrl ? (
          <div className="relative w-16 h-12 rounded overflow-hidden">
            <Image src={imageUrl} alt="项目图片" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-12 bg-ink-200 rounded flex items-center justify-center text-muted-foreground text-xs">
            无图片
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      meta: {
        label: "项目名称",
        placeholder: "搜索项目...",
        variant: "text",
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label="项目名称" />,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return <div className="font-medium">{title}</div>;
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "description",
      meta: { label: "描述" },
      header: "描述",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return <div className="max-w-[200px] truncate text-sm text-muted-foreground">{description}</div>;
      },
    },
    {
      accessorKey: "category",
      meta: { label: "分类" },
      header: "分类",
      cell: ({ row }) => {
        const project = row.original;
        return <Badge variant="outline">{project.category?.name || "未分类"}</Badge>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "status",
      meta: {
        label: "状态",
        variant: "select",
        options: [
          { label: "已发布", value: "published" },
          { label: "草稿", value: "draft" },
        ],
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label="状态" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>;
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) ? value.includes(row.getValue(id)) : true;
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "tags",
      meta: { label: "标签" },
      header: "标签",
      cell: ({ row }) => {
        const project = row.original;
        const tags = project.tags || [];

        if (tags.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {tags.slice(0, 2).map((projectTag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {projectTag.tag.name}
              </Badge>
            ))}
            {tags.length > 2 && <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "sortOrder",
      meta: { label: "排序" },
      header: ({ column }) => <DataTableColumnHeader column={column} label="排序" />,
      cell: ({ row }) => {
        const sortOrder = row.getValue("sortOrder") as number;
        return <div className="text-center">{sortOrder}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      meta: { label: "创建时间" },
      header: ({ column }) => <DataTableColumnHeader column={column} label="创建时间" />,
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        return (
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: zhCN })}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original;

        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {project.githubUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(project.githubUrl!, "_blank")}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              {project.demoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(project.demoUrl!, "_blank")}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
