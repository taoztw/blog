"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { MoreHorizontal, Edit, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { PostWithRelations } from "@/global";
import { ImageService } from "@/lib/image-service";

interface PostColumnsProps {
  onEdit: (post: PostWithRelations) => void;
  onDelete: (post: PostWithRelations) => void;
  onPublish: (post: PostWithRelations) => void;
}

export const createPostColumns = ({ onEdit, onDelete, onPublish }: PostColumnsProps): ColumnDef<PostWithRelations>[] => [
  {
    accessorKey: "imageUrl",
    header: "封面",
    cell: ({ row }) => {
      const url = row.getValue("imageUrl") as string | null;
      return url ? (
        <div className="relative h-10 w-[60px]">
          <Image
            src={ImageService.getImageUrl(url)}
            alt="post cover"
            fill
            className="rounded object-cover"
          />
        </div>
      ) : (
        <div className="w-[60px] h-10 bg-ink-200 rounded" />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    meta: {
      label: "标题",
      placeholder: "搜索标题...",
      variant: "text",
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        label="标题"
      />
    ),
    enableColumnFilter: true,
  },
  {
    accessorKey: "category.name",
    meta: { label: "分类" },
    header: "分类",
    cell: ({ row }) => row.original.category?.name ?? "未分类",
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
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        label="状态"
      />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = {
        published: "default",
        draft: "secondary",
      }[status] as "default" | "secondary" | undefined;

      return (
        <Badge variant={variant ?? "outline"}>
          {status === "published" ? "已发布" : status === "draft" ? "草稿" : status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) ? value.includes(row.getValue(id)) : true;
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "viewCount",
    meta: { label: "浏览" },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        label="浏览"
      />
    ),
    cell: ({ row }) => <span>{row.getValue("viewCount")}</span>,
  },
  {
    accessorKey: "likeCount",
    meta: { label: "点赞" },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        label="点赞"
      />
    ),
    cell: ({ row }) => <span>{row.getValue("likeCount")}</span>,
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
      return <div>{date.toLocaleDateString("zh-CN")}</div>;
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const post = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.id)}>复制文章 ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(post)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPublish(post)}>
              <Send className="mr-2 h-4 w-4" />
              发布
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => onDelete(post)}
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
