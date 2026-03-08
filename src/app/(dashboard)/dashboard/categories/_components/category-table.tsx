"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { api } from "@/trpc/react";
import type { Category, CreateCategoryData } from "@/global";
import { createCategoryColumns } from "./columns";
import { CreateOrEditCategoryDialog } from "./create-dialog";
import { toast } from "sonner";

export function CategoryTable() {
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);

  const utils = api.useUtils();

  const { data, isFetching } = api.category.getMany.useQuery({
    limit: 100,
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

  const createCategory = api.category.create.useMutation({
    onSuccess: () => {
      utils.category.getMany.invalidate();
      toast.success("类别创建成功");
    },
    onError: (error) => {
      toast.error(`类别创建失败: ${error.message}`);
    },
  });

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

  const handleCreateCategory = async (data: CreateCategoryData) => {
    createCategory.mutate(data);
  };

  const handleEditCategory = async (id: string, data: CreateCategoryData) => {
    await updateCategory.mutateAsync({ id, data });
    setEditCategory(null);
  };

  const columns = React.useMemo(
    () =>
      createCategoryColumns({
        onDelete: (category) => deleteCategory.mutate({ id: category.id }),
        onEdit: (category) => setEditCategory(category),
      }),
    [deleteCategory],
  );

  const { table } = useDataTable({
    data: data?.items ?? [],
    columns,
  });

  if (isFetching && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">类别列表</h1>
        </div>
        <DataTableSkeleton columnCount={4} rowCount={10} filterCount={1} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">类别列表</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => initializeDefaults.mutate()}
            disabled={initializeDefaults.isPending}
          >
            {initializeDefaults.isPending ? "初始化中..." : "初始化默认类别"}
          </Button>
          <Button variant="default" asChild className="bg-primary hover:bg-primary/90">
            <CreateOrEditCategoryDialog onCreateCategory={handleCreateCategory} />
          </Button>
        </div>
      </div>

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>

      {editCategory && (
        <CreateOrEditCategoryDialog
          category={editCategory}
          open={!!editCategory}
          onOpenChange={(o) => {
            if (!o) setEditCategory(null);
          }}
          onEditCategory={handleEditCategory}
        />
      )}
    </div>
  );
}
