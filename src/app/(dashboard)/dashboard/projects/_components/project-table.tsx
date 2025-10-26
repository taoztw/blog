"use client";

import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { PaginationComponent } from "@/components/ui_custom/pagination";
import type { ProjectWithRelations } from "@/global";
import { api } from "@/trpc/react";
import * as React from "react";
import { toast } from "sonner";
import { createProjectColumns } from "./columns";
import { CreateOrEditProjectDialog } from "./create";

export function ProjectTable() {
  const [editProject, setEditProject] = React.useState<ProjectWithRelations | null>(null);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const utils = api.useUtils();
  const { data, isFetching } = api.project.getByPage.useQuery({
    page: 1,
    limit: 10,
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
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

  const columns = createProjectColumns({
    onEdit: setEditProject,
    onDelete: (id: string) => deleteProject.mutate({ id }),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">项目管理</h1>
        <CreateOrEditProjectDialog
          trigger={<Button>创建项目</Button>}
          onSubmit={(data) => createProject.mutate(data)}
          isLoading={createProject.isPending}
        />
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索项目..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md w-full max-w-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">所有类型</option>
          <option value="frontend">前端</option>
          <option value="backend">后端</option>
          <option value="mobile">移动端</option>
          <option value="tool">工具</option>
          <option value="ai">AI</option>
          <option value="other">其他</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.items ?? []} loading={isFetching} />

      {data && <PaginationComponent totalItems={data.total} itemsPerPage={10} isLoading={isFetching} />}

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
