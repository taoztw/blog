"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import type { ProjectWithRelations } from "@/global";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { createProjectColumns } from "./columns";
import { CreateOrEditProjectDialog } from "./create";

export function ProjectTable() {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editProject, setEditProject] = React.useState<ProjectWithRelations | null>(null);

  const utils = api.useUtils();
  const { data, isFetching } = api.project.getByPage.useQuery({
    page: 1,
    limit: 100,
  });

  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      utils.project.getByPage.invalidate();
      toast.success("项目创建成功");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProject = api.project.update.useMutation({
    onSuccess: () => {
      utils.project.getByPage.invalidate();
      toast.success("项目更新成功");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      utils.project.getByPage.invalidate();
      toast.success("删除成功");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const columns = React.useMemo(
    () =>
      createProjectColumns({
        onEdit: setEditProject,
        onDelete: (id: string) => deleteProject.mutate({ id }),
      }),
    [deleteProject],
  );

  const { table } = useDataTable({
    data: data?.items ?? [],
    columns,
  });

  if (isFetching && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">项目管理</h1>
        </div>
        <DataTableSkeleton columnCount={9} rowCount={10} filterCount={2} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">项目管理</h1>
        <Button onClick={() => setCreateOpen(true)}>创建项目</Button>
        <CreateOrEditProjectDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={(data) => createProject.mutate(data)}
          isLoading={createProject.isPending}
        />
      </div>

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>

      {editProject && (
        <CreateOrEditProjectDialog
          trigger={null}
          project={editProject}
          open={!!editProject}
          onOpenChange={(open) => !open && setEditProject(null)}
          onSubmit={(data) => {
            updateProject.mutate({ id: editProject.id, data });
            setEditProject(null);
          }}
          isLoading={updateProject.isPending}
        />
      )}
    </div>
  );
}
