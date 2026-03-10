"use client";

import * as React from "react";
import { authClient } from "@/lib/auth/authClient";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { EditorStatic } from "@/components/ui/editor-static";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { createSlateEditor } from "platejs";
import type { Value } from "platejs";
import { Calendar, MessageSquare, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface JournalCardProps {
  journal: {
    id: string;
    content: string;
    createdAt: Date;
    commentCount?: number;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
  };
  onEdit?: (journal: { id: string; content: string }) => void;
  onOpenComments?: (journal: { id: string; createdAt: Date }) => void;
  isCommentsActive?: boolean;
}

export function JournalCard({ journal, onEdit, onOpenComments, isCommentsActive }: JournalCardProps) {
  const { data: session } = authClient.useSession();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const utils = api.useUtils();

  const deleteMutation = api.journal.delete.useMutation({
    onSuccess: () => {
      toast.success("日志已删除");
      void utils.journal.getByPage.invalidate();
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  const parsedContent = React.useMemo<Value | null>(() => {
    try {
      const parsed = JSON.parse(journal.content);
      if (Array.isArray(parsed)) return parsed as Value;
    } catch {
      // Not JSON
    }
    return null;
  }, [journal.content]);

  const editor = React.useMemo(() => {
    if (!parsedContent) return null;
    return createSlateEditor({
      plugins: BaseEditorKit,
      value: parsedContent,
    });
  }, [parsedContent]);

  const isAdmin = session?.user?.role === "ADMIN";

  const handleDelete = () => {
    deleteMutation.mutate({ id: journal.id });
  };

  return (
    <>
      <article className={cn(
        "group relative bg-card border rounded-lg p-6 transition-all duration-300 shadow-sm hover:shadow-md",
        isCommentsActive
          ? "border-seal/50 shadow-seal/10"
          : "border-border hover:border-seal/30"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            <time dateTime={journal.createdAt.toISOString()}>
              {new Date(journal.createdAt).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">更多操作</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit?.({ id: journal.id, content: journal.content })}
                  className="cursor-pointer"
                >
                  <Pencil className="size-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {editor ? (
            <EditorStatic editor={editor} variant="none" />
          ) : (
            <p className="text-muted-foreground italic">无法加载内容</p>
          )}
        </div>

        {/* Footer: author + comment button */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          {journal.author ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {journal.author.image && (
                <img
                  src={journal.author.image}
                  alt={journal.author.name || "作者"}
                  className="size-6 rounded-full"
                />
              )}
              <span>{journal.author.name || "匿名用户"}</span>
            </div>
          ) : (
            <span />
          )}

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 gap-1.5 text-xs",
              isCommentsActive
                ? "text-seal hover:text-seal"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onOpenComments?.({ id: journal.id, createdAt: journal.createdAt })}
          >
            <MessageSquare className="size-3.5" />
            {journal.commentCount ? `${journal.commentCount} 条评论` : "评论"}
          </Button>
        </div>
      </article>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要删除这条日志吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  删除中...
                </>
              ) : (
                "删除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
