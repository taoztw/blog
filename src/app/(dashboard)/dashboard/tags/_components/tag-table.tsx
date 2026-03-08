"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import type { CreateTagData, Tag } from "@/global";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { createTagColumns } from "./columns";
import { BatchCreateTagDialog } from "./batch-create-dialog";
import { CreateOrEditTagDialog } from "./create-dialog";

export function TagTable() {
  const [editTag, setEditTag] = React.useState<Tag | null>(null);

  const utils = api.useUtils();

  const { data, isFetching } = api.tag.getMany.useQuery({
    page: 1,
    limit: 100,
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

  const handleCreateTag = async (data: CreateTagData) => {
    createTag.mutate(data);
  };

  const handleEditTag = async (id: string, data: CreateTagData) => {
    await updateTag.mutateAsync({ id, data });
    setEditTag(null);
  };

  const handleBatchCreateTags = async (tags: CreateTagData[]) => {
    await batchCreateTags.mutateAsync(tags);
  };

  const columns = React.useMemo(
    () =>
      createTagColumns({
        onDelete: (tag) => deleteTag.mutate({ id: tag.id }),
        onEdit: (tag) => setEditTag(tag),
      }),
    [deleteTag],
  );

  const { table } = useDataTable({
    data: data?.items ?? [],
    columns,
  });

  if (isFetching && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">标签列表</h1>
        </div>
        <DataTableSkeleton columnCount={5} rowCount={10} filterCount={1} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">标签列表</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => initializeDefaults.mutate()}
            disabled={initializeDefaults.isPending}
          >
            {initializeDefaults.isPending ? "初始化中..." : "初始化默认标签"}
          </Button>
          <BatchCreateTagDialog onBatchCreateTags={handleBatchCreateTags} />
          <CreateOrEditTagDialog onCreateTag={handleCreateTag} />
        </div>
      </div>

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>

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
