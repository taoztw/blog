"use client";

import * as React from "react";
import { NodeApi } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { toast } from "sonner";

import { CommentEditorKit } from "@/components/editor/plugins/comment-editor-kit";
import { CommentToolbarKit } from "@/components/editor/plugins/comment-toolbar-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth/authClient";
import { api } from "@/trpc/react";

interface CommentsFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "reply" | "comment";
}

const emptyValue = [{ type: "p" as const, children: [{ text: "" }] }];

const CommentsForm = ({
  postId,
  parentId,
  onSuccess,
  onCancel,
  variant = "comment",
}: CommentsFormProps) => {
  const utils = api.useUtils();
  const { data: session } = authClient.useSession();

  const editor = usePlateEditor({
    plugins: [...CommentEditorKit, ...CommentToolbarKit],
    value: emptyValue,
  });

  const create = api.comment.create.useMutation({
    onSuccess: () => {
      utils.comment.getMany.invalidate({ postId });
      editor.tf.setValue(emptyValue);
      toast.success("评论提交成功！");
      onSuccess?.();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("请先登录。");
      } else {
        toast.error("评论提交失败，请重试。");
      }
    },
  });

  const onSubmit = () => {
    const value = editor.children;
    const plainText = value
      .map((node) => NodeApi.string(node))
      .join("\n")
      .trim();

    if (!plainText) {
      toast.error("评论不能为空。");
      return;
    }

    create.mutate({
      postId,
      parentId: parentId || null,
      content: JSON.stringify(value),
    });
  };

  function handleCancel() {
    editor.tf.setValue(emptyValue);
    onCancel?.();
  }

  return (
    <div className="flex gap-4 group">
      <UserAvatar
        imgUrl={session?.user.image || ""}
        name={session?.user.name}
        size="base"
      />

      <div className="flex-1">
        <Plate editor={editor}>
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              placeholder={
                variant === "comment" ? "添加评论..." : "添加回复..."
              }
            />
          </EditorContainer>
        </Plate>
        <div className="justify-end gap-2 mt-2 flex">
          {onCancel && (
            <Button variant="ghost" type="button" onClick={handleCancel}>
              取消
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onSubmit}
            disabled={create.isPending}
          >
            {variant === "reply" ? "回复" : "评论"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentsForm;
