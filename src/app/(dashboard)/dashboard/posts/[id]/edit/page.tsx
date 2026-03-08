"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import type { Value } from "platejs";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";

export default function PostEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params.id;

  const { data: postData, isLoading } = api.post.getOneForEdit.useQuery({ id: postId });
  const update = api.post.update.useMutation({
    onSuccess: () => {
      toast.success("内容保存成功");
    },
    onError: (error) => {
      toast.error("保存失败: " + error.message);
    },
  });

  const editorValueRef = React.useRef<Value | null>(null);

  const initialValue = React.useMemo<Value | undefined>(() => {
    if (!postData?.content) return undefined;

    try {
      const parsed = JSON.parse(postData.content);
      if (Array.isArray(parsed)) return parsed as Value;
    } catch {
      // Content is not JSON (e.g. old Markdown), start with empty
    }

    return undefined;
  }, [postData?.content]);

  const handleSave = () => {
    const value = editorValueRef.current;
    if (!value) return;

    update.mutate({
      id: postId,
      data: {
        content: JSON.stringify(value),
      },
    });
  };

  const handleChange = (value: Value) => {
    editorValueRef.current = value;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">文章未找到</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-ink-300 bg-ink-50 px-4 py-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h1 className="text-sm font-medium truncate max-w-[400px]">{postData.title}</h1>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={update.isPending}
        >
          {update.isPending ? <Spinner className="size-4" /> : <SaveIcon className="size-4" />}
          保存
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <PlateEditor
          initialValue={initialValue}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
