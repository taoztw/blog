"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { ArrowUpDown, Eye, MoreHorizontal, ThumbsUp } from "lucide-react";
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

// ✅ 这里直接使用全局的 PostWithRelations 类型
export const columns: ColumnDef<PostWithRelations>[] = [
  {
    accessorKey: "imageUrl",
    header: "封面",
    cell: ({ row }) => {
      const url = row.getValue("imageUrl") as string | null;
      return url ? (
        <div className="relative h-[40px] w-[60px]">
          <Image src={url} alt="post cover" fill className="rounded object-cover " />
        </div>
      ) : (
        <div className="w-[60px] h-[40px] bg-gray-200 rounded" />
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: "标题",
  },
  {
    accessorKey: "category.name", // 从关联 category 获取分类名
    header: "分类",
    cell: ({ row }) => row.original.category?.name ?? "未分类",
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = {
        published: "default",
        draft: "secondary",
        review: "outline",
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          <div className="flex items-center justify-end w-full">
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
            Views
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="text-center flex items-center justify-center">{row.getValue("viewCount")}</span>;
    },
  },
  {
    accessorKey: "likeCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-0 hover:bg-transparent"
        >
          <div className="flex items-center justify-end w-full">
            <ThumbsUp className="mr-2 h-4 w-4 text-muted-foreground" />
            Likes
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="text-center flex items-center justify-center">{row.getValue("likeCount")}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("en-US");
      return <div className="text-right font-base">{formatted}</div>;
    },
    enableSorting: true,
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
            <DropdownMenuItem>编辑</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
