"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye, ThumbsUp } from "lucide-react";
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
import type { PostWithRelations } from "@/global";
import { ImageService } from "../upload/image-service";

interface PostColumnsProps {
  onEdit: (post: PostWithRelations) => void;
  onDelete: (post: PostWithRelations) => void;
}

export const createPostColumns = ({ onEdit, onDelete }: PostColumnsProps): ColumnDef<PostWithRelations>[] => [
  {
    accessorKey: "imageUrl",
    header: "封面",
    cell: ({ row }) => {
      const url = row.getValue("imageUrl") as string | null;
      return url ? (
        <div className="relative h-[40px] w-[60px]">
          <Image src={ImageService.getImageUrl(url)} alt="post cover" fill className="rounded object-cover" />
        </div>
      ) : (
        <div className="w-[60px] h-[40px] bg-gray-200 rounded" />
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          标题
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "category.name",
    header: "分类",
    cell: ({ row }) => row.original.category?.name ?? "未分类",
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = {
        PUBLISHED: "default",
        DRAFT: "secondary",
        REVIEW: "outline",
      }[status] as "default" | "secondary" | "outline";

      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "viewCount",
    header: "浏览",
    cell: ({ row }) => <span>{row.getValue("viewCount")}</span>,
  },
  {
    accessorKey: "likeCount",
    header: "点赞",
    cell: ({ row }) => <span>{row.getValue("likeCount")}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
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
            <Button variant="ghost" className="h-8 w-8 p-0">
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
            <DropdownMenuItem className="text-red-500" onClick={() => onDelete(post)}>
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
