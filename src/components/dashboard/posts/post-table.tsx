"use client";

import * as React from "react";
import { DataTable } from "@/components/dashboard/categories/data-table";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { CreateOrEditPostDialog } from "./create";
import { createPostColumns } from "./columns";
import type { CreatePostData, PostWithRelations } from "@/global";
import { toast } from "sonner";

export function PostTable() {
  const [cursor, setCursor] = React.useState<{ id: string; updateAt: Date } | null>(null);
  const [prevCursors, setPrevCursors] = React.useState<(typeof cursor)[]>([]);
  const [editPost, setEditPost] = React.useState<PostWithRelations | null>(null);

  const utils = api.useUtils();
  const { data, isFetching } = api.post.getMany.useQuery({ limit: 10, cursor });

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      utils.post.getMany.invalidate();
      toast.success("文章创建成功");
    },
  });

  const updatePost = api.post.update.useMutation({
    onSuccess: () => {
      utils.post.getMany.invalidate();
      toast.success("文章更新成功");
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      utils.post.getMany.invalidate();
      toast.success("删除成功");
    },
  });

  const hasNextPage = !!data?.nextCursor;
  const hasPrevPage = prevCursors.length > 0;

  const goNextPage = () => {
    if (data?.nextCursor) {
      setPrevCursors((p) => [...p, cursor]);
      setCursor(data.nextCursor);
    }
  };

  const goPrevPage = () => {
    const prev = prevCursors[prevCursors.length - 1] ?? null;
    setPrevCursors((p) => p.slice(0, -1));
    setCursor(prev);
  };

  const columns = createPostColumns({
    onDelete: (post) => deletePost.mutate({ id: post.id }),
    onEdit: (post) => setEditPost(post),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">文章列表</h1>
        <Button asChild>
          <CreateOrEditPostDialog
            onCreatePost={async (d: CreatePostData) => {
              await createPost.mutateAsync(d);
            }}
          />
        </Button>
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

      {editPost && (
        <CreateOrEditPostDialog
          post={editPost}
          open={!!editPost}
          onOpenChange={(o) => {
            if (!o) setEditPost(null);
          }}
          onEditPost={async (id, data) => {
            await updatePost.mutateAsync({ id, data });
          }}
        />
      )}
    </div>
  );
}
