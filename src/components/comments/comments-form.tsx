import { commentInsertSchema } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Form, FormField, FormItem } from "../ui/form";
import { UserAvatar } from "../ui_custom/user-avatar";
import { Textarea } from "../ui/textarea";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import { Button } from "../ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface CommentsFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "reply" | "comment";
}

const CommentsForm = ({ postId, parentId, onSuccess, onCancel, variant = "comment" }: CommentsFormProps) => {
  const utils = api.useUtils();
  const create = api.comment.create.useMutation({
    onSuccess: () => {
      utils.comment.getMany.invalidate({ postId });
      form.reset();
      toast.success("Comment submitted successfully!");
      onSuccess?.();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Please sign in to comment.");
      } else {
        toast.error("Failed to submit comment. Please try again.");
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
  return (
    <Form {...form}>
      <form className="flex gap-4 group" onSubmit={form.handleSubmit(onSubmit)}>
        <UserAvatar imgUrl="" name="" size="base" />

        <div className="flex-1">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <Textarea
                  {...field}
                  placeholder={variant === "comment" ? "添加评论..." : "添加回复..."}
                  className="resize-none bg-transparent overflow-hidden min-h-0"
                  rows={2}
                ></Textarea>
              </FormItem>
            )}
          />
          <div className="justify-end gap-2 mt-2 flex">
            {onCancel && (
              <Button variant="ghost" type="button" onClick={handleCancel}>
                Cancle
              </Button>
            )}
            <Button type="submit" size="sm" variant="outline">
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CommentsForm;
