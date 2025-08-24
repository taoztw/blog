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

interface CommentsFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "reply" | "comment";
}

const CommentsForm = ({ postId, parentId, onSuccess, onCancel, variant = "comment" }: CommentsFormProps) => {
  const form = useForm<z.infer<typeof commentInsertSchema>>({
    resolver: zodResolver(commentInsertSchema),
    defaultValues: {
      postId,
      content: "",
      parentId: parentId || null,
    },
  });
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const addEmoji = (emojiData: any) => {
    setContent((prev) => prev + emojiData.emoji);
  };
  // 监听点击外部
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = (values: z.infer<typeof commentInsertSchema>) => {
    console.log(values);
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
