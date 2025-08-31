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
import type { ProjectWithRelations } from "@/global";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import Image from "next/image";

interface ColumnProps {
  onEdit: (project: ProjectWithRelations) => void;
  onDelete: (id: string) => void;
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    frontend: "前端",
    backend: "后端",
    mobile: "移动端",
    tool: "工具",
    ai: "AI",
    other: "其他",
  };
  return typeMap[type] || type;
};

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
            <Image
              src={imageUrl}
              alt="项目图片"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
            无图片
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "项目名称",
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return <div className="font-medium">{title}</div>;
      },
    },
    {
      accessorKey: "description",
      header: "描述",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[200px] truncate text-sm text-gray-600">
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "类型",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="outline">
            {getTypeLabel(type)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusVariant(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "technologies",
      header: "技术栈",
      cell: ({ row }) => {
        const technologies = row.getValue("technologies") as string;
        if (!technologies) return <span className="text-gray-400">-</span>;
        
        try {
          const techs = JSON.parse(technologies) as string[];
          return (
            <div className="flex flex-wrap gap-1 max-w-[150px]">
              {techs.slice(0, 2).map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {techs.length > 2 && (
                <span className="text-xs text-gray-500">+{techs.length - 2}</span>
              )}
            </div>
          );
        } catch {
          return <span className="text-gray-400">-</span>;
        }
      },
    },
    {
      accessorKey: "sortOrder",
      header: "排序",
      cell: ({ row }) => {
        const sortOrder = row.getValue("sortOrder") as number;
        return <div className="text-center">{sortOrder}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        return (
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: zhCN })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const project = row.original;

        return (
          <div className="flex items-center gap-2">
            {/* 快速链接按钮 */}
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
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="text-red-600"
                >
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