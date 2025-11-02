"use client";

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationComponent } from "@/components/ui_custom/pagination";
import type { CreateTagData, Tag } from "@/global";
import { tagSelectSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";
import type { z } from "zod";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { BatchCreateTagDialog } from "./batch-create-dialog";
import { CreateOrEditTagDialog } from "./create-dialog";

export function TagTable() {
  const [editTag, setEditTag] = React.useState<Tag | null>(null);
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const utils = api.useUtils();

  const { data, isFetching } = api.tag.getMany.useQuery({
    page: currentPage,
    limit: 10,
  });
  const deleteTag = api.tag.delete.useMutation({
    onSuccess: () => {
      utils.tag.getMany.invalidate();
      toast.success("标签删除成功");
    },
    onError: (error) => {
      toast.error(`标签删除失败: ${error.message}`);
    },
  });

  const updateTag = api.tag.update.useMutation({
    onSuccess: () => {
      utils.tag.getMany.invalidate();
      toast.success("标签更新成功");
    },
    onError: (error) => {
      toast.error(`标签更新失败: ${error.message}`);
    },
  });

  const createTag = api.tag.create.useMutation({
    onSuccess: () => {
      utils.tag.getMany.invalidate();
      toast.success("标签创建成功");
    },
    onError: (error) => {
      toast.error(`标签创建失败: ${error.message}`);
    },
  });

  const batchCreateTags = api.tag.batchCreate.useMutation({
    onSuccess: (result) => {
      utils.tag.getMany.invalidate();

      // 显示详细的创建结果
      if (result.successCount > 0) {
        toast.success(`成功创建 ${result.successCount} 个标签`);
      }

      if (result.failCount > 0) {
        const failedTagsText = result.failedTags.slice(0, 3).join(", ");
        const moreText = result.failedTags.length > 3 ? ` 等${result.failedTags.length}个` : "";
        toast.warning(`${result.failCount} 个标签创建失败: ${failedTagsText}${moreText}`);
      }

      if (result.successCount === 0 && result.failCount > 0) {
        toast.error("所有标签创建都失败了，请检查标签名是否重复或格式是否正确");
      }
    },
    onError: (error) => {
      toast.error(`批量创建失败: ${error.message}`);
    },
  });

  const handleCreateTag = async (data: CreateTagData) => {
    // 这里可以调用 API 创建标签
    createTag.mutate(data);
  };

  const handleEditTag = async (id: string, data: CreateTagData) => {
    await updateTag.mutateAsync({ id, data });
    setEditTag(null); // 关闭弹窗
  };

  const handleBatchCreateTags = async (tags: CreateTagData[]) => {
    await batchCreateTags.mutateAsync(tags);
  };

  const initializeDefaults = api.tag.initializeDefaults.useMutation({
    onSuccess: (result) => {
      utils.tag.getMany.invalidate();

      if (result.successCount > 0) {
        toast.success(`成功创建 ${result.successCount} 个默认标签`);
      }

      if (result.failCount > 0) {
        const failedText = result.failedTags.slice(0, 3).join(", ");
        const moreText = result.failedTags.length > 3 ? ` 等${result.failedTags.length}个` : "";
        toast.warning(`${result.failCount} 个标签已存在: ${failedText}${moreText}`);
      }
    },
    onError: (error) => {
      toast.error(`初始化失败: ${error.message}`);
    },
  });

  const handleInitializeDefaults = () => {
    initializeDefaults.mutate();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">标签列表</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleInitializeDefaults} disabled={initializeDefaults.isPending}>
            {initializeDefaults.isPending ? "初始化中..." : "初始化默认标签"}
          </Button>
          <BatchCreateTagDialog onBatchCreateTags={handleBatchCreateTags} />
          <CreateOrEditTagDialog onCreateTag={handleCreateTag} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="w-full justify-start px-0 hover:bg-transparent">
                  标签名称
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>描述</TableHead>
              <TableHead>颜色</TableHead>
              <TableHead>
                <Button variant="ghost" className="w-full justify-center hover:bg-transparent">
                  创建时间
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : data?.items?.length ? (
              data.items.map((tag: z.infer<typeof tagSelectSchema>) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="font-medium"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : undefined,
                        borderColor: tag.color || undefined,
                        color: tag.color || undefined,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate text-muted-foreground">{tag.description || "暂无描述"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tag.color && (
                        <>
                          <div
                            className="w-4 h-4 rounded border border-border"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-xs text-muted-foreground">{tag.color}</span>
                        </>
                      )}
                      {!tag.color && <span className="text-xs text-muted-foreground">无</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center font-base">
                      {new Date(tag.createdAt).toLocaleDateString("zh-CN")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">打开操作菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tag.id)}>
                          复制标签 ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditTag(tag)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => deleteTag.mutate({ id: tag.id })}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  暂无标签数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页组件 */}
      <PaginationComponent totalItems={data?.pagination?.total ?? 0} itemsPerPage={10} isLoading={isFetching} />

      {/* 编辑弹窗 */}
      {editTag && (
        <CreateOrEditTagDialog
          tag={editTag}
          open={!!editTag}
          onOpenChange={(o) => {
            if (!o) setEditTag(null);
          }}
          onEditTag={handleEditTag}
        />
      )}
    </div>
  );
}
