"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import z from "zod";

import { commentInsertSchema } from "@/server/db/schemas/comments";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { UserAvatar } from "@/components/user-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/authClient";
import { UserIcon } from "lucide-react";
import { api } from "@/trpc/react";

interface CommentsFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "reply" | "comment";
}

const CommentsForm = ({ postId, parentId, onSuccess, onCancel, variant = "comment" }: CommentsFormProps) => {
  const utils = api.useUtils();
  const { data: session } = authClient.useSession();

  const create = api.comment.create.useMutation({
    onSuccess: () => {
      utils.comment.getMany.invalidate({ postId });
      form.reset();
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

  const form = useForm<z.infer<typeof commentInsertSchema>>({
    resolver: zodResolver(commentInsertSchema),
    defaultValues: {
      postId,
      content: "",
      parentId: parentId || null,
    },
  });

  const onSubmit = (values: z.infer<typeof commentInsertSchema>) => {
    create.mutate(values);
  };

  function handleCancel() {
    form.reset();
    onCancel?.();
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-ink-200 text-ink-400">
            <UserIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Textarea
            placeholder={variant === "comment" ? "添加评论..." : "添加回复..."}
            className="resize-none bg-transparent overflow-hidden min-h-0 cursor-not-allowed opacity-60"
            rows={2}
            disabled
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              请先
              <Link href="/sign-in" className="text-seal hover:underline mx-1">
                登录
              </Link>
              后发表评论
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="flex gap-4 group" onSubmit={form.handleSubmit(onSubmit)}>
        <UserAvatar
          imgUrl={session.user.image || ""}
          name={session.user.name}
          size="base"
        />

        <div className="flex-1">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <Textarea
                  {...field}
                  placeholder={variant === "comment" ? "添加评论..." : "添加回复..."}
                  className="resize-none bg-transparent min-h-0 max-h-40 overflow-y-auto"
                  rows={2}
                />
              </FormItem>
            )}
          />
          <div className="justify-end gap-2 mt-2 flex">
            {onCancel && (
              <Button variant="ghost" type="button" onClick={handleCancel}>
                取消
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={create.isPending}
            >
              {variant === "reply" ? "回复" : "评论"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CommentsForm;
