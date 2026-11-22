"use client";

import * as React from "react";
import { authClient } from "@/lib/auth/authClient";
import { loadDocument } from "@/components/tiptap/document";
import { TiptapContent } from "@/components/tiptap/tiptap-content";
import { Button } from "@/components/ui/button";
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
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
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
  isLast?: boolean;
}

export function JournalCard({
  journal,
  onEdit,
  onOpenComments,
  isCommentsActive,
  isLast,
}: JournalCardProps) {
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

  const doc = React.useMemo(() => loadDocument(journal.content), [journal.content]);

  const isAdmin = session?.user?.role === "ADMIN";

  const handleDelete = () => {
    deleteMutation.mutate({ id: journal.id });
  };

  const timeLabel = new Date(journal.createdAt).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <>
      <article
        className={cn(
          "group relative pl-[30px] ml-[7px] pb-7",
          !isLast && "border-l border-ink-300"
        )}
      >
        {/* Timeline dot */}
        <span
          className={cn(
            "absolute -left-[4px] top-2 size-[7px] rounded-full transition-colors",
            isCommentsActive ? "bg-seal" : "bg-ink-400 group-hover:bg-seal"
          )}
        />

        {/* Entry inner with hover bg */}
        <div
          className={cn(
            "relative rounded-lg px-4 py-1 pb-4 -mx-4 -my-1 transition-colors",
            "group-hover:bg-ink-100",
            isCommentsActive && "bg-ink-100"
          )}
        >
          {/* Admin actions (top-right, hover reveal) */}
          {isAdmin && (
            <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onEdit?.({ id: journal.id, content: journal.content })}
                aria-label="编辑日志"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 hover:bg-seal/10 hover:text-seal"
                onClick={() => setShowDeleteDialog(true)}
                aria-label="删除日志"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Time */}
          <time
            dateTime={journal.createdAt.toISOString()}
            className="font-cormorant text-[13px] tracking-wider text-ink-500 inline-block mb-2"
          >
            {timeLabel}
          </time>

          {/* Content */}
          {doc ? (
            <TiptapContent doc={doc} className="text-[0.9375rem]" />
          ) : (
            <p className="text-sm text-muted-foreground italic">无法加载内容</p>
          )}

          {/* Comment action */}
          <div className="mt-2.5 flex items-center">
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
