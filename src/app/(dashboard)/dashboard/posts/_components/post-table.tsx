"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDataTable } from "@/hooks/use-data-table";
import type { PostWithRelations } from "@/global";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PenLineIcon } from "lucide-react";
import { createPostColumns } from "./columns";
import { PublishDialog } from "../[id]/publish-dialog";

export function PostTable() {
  const [publishPost, setPublishPost] = React.useState<PostWithRelations | null>(null);

  const router = useRouter();
  const utils = api.useUtils();
  const { data, isFetching } = api.post.getMany.useQuery({ limit: 100 });

  const createDraft = api.post.createDraft.useMutation({
    onSuccess: (result) => {
      router.push(`/dashboard/posts/${result.post.id}`);
    },
    onError: (error) => {
      toast.error("创建失败: " + error.message);
    },
  });

  const updateWithTags = api.post.updateWithTags.useMutation({
    onSuccess: () => {
      utils.post.getMany.invalidate();
    },
  });

  const updatePost = api.post.update.useMutation({
    onSuccess: () => {
      utils.post.getMany.invalidate();
      toast.success("文章已设为草稿");
    },
    onError: (error) => {
      toast.error("操作失败: " + error.message);
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      utils.post.getMany.invalidate();
      toast.success("删除成功");
    },
  });

  const columns = React.useMemo(
    () =>
      createPostColumns({
        onDelete: (post) => deletePost.mutate({ id: post.id }),
        onEdit: (post) => router.push(`/dashboard/posts/${post.id}`),
        onPublish: (post) => setPublishPost(post),
        onUnpublish: (post) => updatePost.mutate({ id: post.id, data: { status: "draft" } }),
      }),
    [deletePost, updatePost],
  );

  const { table } = useDataTable({
    data: data?.items ?? [],
    columns,
  });

  if (isFetching && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">文章列表</h1>
        </div>
        <DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">文章列表</h1>
        <Button onClick={() => createDraft.mutate()} disabled={createDraft.isPending}>
          {createDraft.isPending ? (
            <Spinner className="size-4 mr-1" />
          ) : (
            <PenLineIcon className="size-4 mr-1" />
          )}
          新建文章
        </Button>
      </div>

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>

      {publishPost && (
        <PublishDialog
          open={!!publishPost}
          onOpenChange={(o) => { if (!o) setPublishPost(null); }}
          postId={publishPost.id}
          title={publishPost.title}
          currentData={{
            slug: publishPost.slug,
            excerpt: publishPost.excerpt ?? "",
            categoryId: publishPost.category?.id ?? null,
            imageUrl: publishPost.imageUrl ?? null,
            tagIds: [],
          }}
          onPublish={async (formData) => {
            await updateWithTags.mutateAsync({
              id: publishPost.id,
              data: {
                slug: formData.slug,
                excerpt: formData.excerpt,
                categoryId: formData.categoryId,
                tagIds: formData.tagIds,
                imageUrl: formData.imageUrl ?? undefined,
                status: formData.status,
              },
            });
            toast.success(formData.status === "published" ? "文章已发布" : "草稿已保存");
            setPublishPost(null);
          }}
        />
      )}
    </div>
  );
}
