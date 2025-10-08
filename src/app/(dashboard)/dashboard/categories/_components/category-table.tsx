"use client";

import * as React from "react";
import { DataTable } from "./data-table"; // 引入上面的 DataTable
import { api } from "@/trpc/react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CreateOrEditCategoryDialog } from "./create-dialog";
import type { Category, CreateCategoryData } from "@/global";
import { createCategoryColumns } from "./columns";
import { toast } from "sonner";

export function CategoryTable() {
  const [cursor, setCursor] = React.useState<{ id: string; createdAt: Date } | null>(null);
  const [prevCursors, setPrevCursors] = React.useState<(typeof cursor)[]>([]);
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);

  const utils = api.useUtils();

  const { data, isFetching } = api.category.getMany.useQuery({
    limit: 10,
    cursor,
  });
  const deleteCategory = api.category.delete.useMutation({
    onSuccess: () => {
      utils.category.getMany.invalidate();
      toast.success("类别删除成功");
    },
    onError: (error) => {
      toast.error(`类别删除失败: ${error.message}`);
    },
  });
  const updateCategory = api.category.update.useMutation({
    onSuccess: () => {
      utils.category.getMany.invalidate();
      toast.success("类别更新成功");
    },
    onError: (error) => {
      toast.error(`类别更新失败: ${error.message}`);
    },
  });

  const hasNextPage = !!data?.nextCursor;
  const hasPrevPage = prevCursors.length > 0;

  const goNextPage = () => {
    if (data?.nextCursor) {
      setPrevCursors((prev) => [...prev, cursor]); // 保存当前页游标，用于返回
      setCursor(data.nextCursor);
    }
  };

  const goPrevPage = () => {
    const prev = prevCursors[prevCursors.length - 1] ?? null;
    setPrevCursors((prev) => prev.slice(0, -1));
    setCursor(prev);
  };

  const columns = createCategoryColumns({
    onDelete: (category) => {
      deleteCategory.mutate({ id: category.id });
    },
    onEdit: (category) => {
      setEditCategory(category);
    },
  });

  const createCategory = api.category.create.useMutation({
    onSuccess: () => {
      utils.category.getMany.invalidate();
      toast.success("类别创建成功");
    },
    onError: (error) => {
      toast.error(`类别创建失败: ${error.message}`);
    },
  });

  const handleCreateCategory = async (data: CreateCategoryData) => {
    // 这里可以调用 API 创建类别
    createCategory.mutate(data);
  };

  const handleEditCategory = async (id: string, data: CreateCategoryData) => {
    await updateCategory.mutateAsync({ id, data });
    setEditCategory(null); // 关闭弹窗
  };

  const initializeDefaults = api.category.initializeDefaults.useMutation({
    onSuccess: (result) => {
      utils.category.getMany.invalidate();

      if (result.successCount > 0) {
        toast.success(`成功创建 ${result.successCount} 个默认类别`);
      }

      if (result.failCount > 0) {
        const failedText = result.failedCategories.slice(0, 3).join(", ");
        const moreText = result.failedCategories.length > 3 ? ` 等${result.failedCategories.length}个` : "";
        toast.warning(`${result.failCount} 个类别已存在: ${failedText}${moreText}`);
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
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">类别列表</h1>
        {/* <CreatePostDialog /> */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleInitializeDefaults}
            disabled={initializeDefaults.isPending}
          >
            {initializeDefaults.isPending ? "初始化中..." : "初始化默认类别"}
          </Button>
          <Button variant="default" asChild className="bg-primary hover:bg-primary/90">
            <CreateOrEditCategoryDialog onCreateCategory={handleCreateCategory} />
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        onPrevPage={goPrevPage}
        onNextPage={goNextPage}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        loading={isFetching}
      />

      {/* 编辑弹窗 */}
      {editCategory && (
        <CreateOrEditCategoryDialog
          category={editCategory}
          open={!!editCategory} // 控制打开
          onOpenChange={(o) => {
            if (!o) setEditCategory(null); // 关闭时清空
          }}
          onEditCategory={handleEditCategory}
        />
      )}
    </div>
  );
}
