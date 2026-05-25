"use client";

import * as React from "react";
import { authClient } from "@/lib/auth/authClient";
import { api } from "@/trpc/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/user-avatar";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  MoreVertical,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JournalInfo {
  id: string;
  createdAt: Date;
}

interface JournalCommentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journal: JournalInfo | null;
}

// ─── Reply Item ───────────────────────────────────────────────────────────────

interface ReplyData {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user: { id: string; name: string | null; image: string | null } | null;
}

function ReplyItem({ reply, currentUserId, onDelete }: {
  reply: ReplyData;
  currentUserId: string | null;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 group">
      <Avatar className="size-7 shrink-0">
        <AvatarImage src={reply.user?.image ?? ""} />
        <AvatarFallback className="bg-ink-200 text-ink-600 text-xs">
          {reply.user?.name?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-xs text-ink-800">
            {reply.user?.name ?? "匿名用户"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: zhCN })}
          </span>
        </div>
        <p className="text-sm text-ink-700 leading-relaxed">{reply.content}</p>
      </div>
      {reply.userId === currentUserId && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreVertical className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onDelete(reply.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2Icon className="size-3.5" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ─── Reply List ───────────────────────────────────────────────────────────────

function ReplyList({ parentId, currentUserId, journalId }: {
  parentId: string;
  currentUserId: string | null;
  journalId: string;
}) {
  const utils = api.useUtils();
  const { data: replies, isLoading } = api.journalComment.getReplies.useQuery({ parentId });

  const remove = api.journalComment.remove.useMutation({
    onSuccess: () => {
      toast.success("回复已删除");
      void utils.journalComment.getMany.invalidate({ journalId });
      void utils.journalComment.getReplies.invalidate({ parentId });
    },
  });

  if (isLoading) {
    return <Spinner className="size-4 mx-auto my-2" />;
  }

  return (
    <div className="space-y-3 mt-3 pl-10 border-l border-border">
      {replies?.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          currentUserId={currentUserId}
          onDelete={(id) => remove.mutate({ id })}
        />
      ))}
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

interface CommentData {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  journalId: string;
  replyCount: number;
  user: { id: string; name: string | null; image: string | null } | null;
}

function CommentItem({ comment, currentUserId }: {
  comment: CommentData;
  currentUserId: string | null;
}) {
  const utils = api.useUtils();
  const [showReplies, setShowReplies] = React.useState(false);
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");

  const remove = api.journalComment.remove.useMutation({
    onSuccess: () => {
      toast.success("评论已删除");
      void utils.journalComment.getMany.invalidate({ journalId: comment.journalId });
    },
  });

  const createReply = api.journalComment.create.useMutation({
    onSuccess: () => {
      toast.success("回复提交成功");
      setReplyText("");
      setShowReplyForm(false);
      setShowReplies(true);
      void utils.journalComment.getMany.invalidate({ journalId: comment.journalId });
      void utils.journalComment.getReplies.invalidate({ parentId: comment.id });
    },
    onError: () => toast.error("回复失败，请重试"),
  });

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={comment.user?.image ?? ""} />
          <AvatarFallback className="bg-ink-200 text-ink-600 text-xs">
            {comment.user?.name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-ink-800">
              {comment.user?.name ?? "匿名用户"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhCN })}
            </span>
          </div>
          <p className="text-sm text-ink-700 leading-relaxed">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-1.5">
            {currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowReplyForm((v) => !v)}
              >
                <MessageSquareIcon className="size-3 mr-1" />
                回复
              </Button>
            )}
            {comment.replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowReplies((v) => !v)}
              >
                {showReplies ? <ChevronUpIcon className="size-3 mr-1" /> : <ChevronDownIcon className="size-3 mr-1" />}
                {comment.replyCount} 条回复
              </Button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="添加回复..."
                className="resize-none min-h-0 text-sm"
                rows={2}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowReplyForm(false); setReplyText(""); }}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!replyText.trim() || createReply.isPending}
                  onClick={() =>
                    createReply.mutate({
                      journalId: comment.journalId,
                      parentId: comment.id,
                      content: replyText.trim(),
                    })
                  }
                >
                  {createReply.isPending ? <Spinner className="size-3 mr-1" /> : null}
                  回复
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies && (
            <ReplyList
              parentId={comment.id}
              currentUserId={currentUserId}
              journalId={comment.journalId}
            />
          )}
        </div>

        {/* Delete */}
        {comment.userId === currentUserId && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <MoreVertical className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => remove.mutate({ id: comment.id })}
                className="text-destructive focus:text-destructive"
              >
                <Trash2Icon className="size-3.5" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// ─── Comments Body ────────────────────────────────────────────────────────────

function CommentsBody({ journalId, currentUserId }: {
  journalId: string;
  currentUserId: string | null;
}) {
  const { data: session } = authClient.useSession();
  const utils = api.useUtils();
  const { data, isLoading } = api.journalComment.getMany.useQuery({ journalId });
  const [text, setText] = React.useState("");

  const create = api.journalComment.create.useMutation({
    onSuccess: () => {
      toast.success("评论提交成功！");
      setText("");
      void utils.journalComment.getMany.invalidate({ journalId });
    },
    onError: () => toast.error("评论失败，请重试"),
  });

  return (
    <div className="flex flex-col h-full">
      {/* Comment input */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        {session?.user ? (
          <div className="flex gap-3">
            <UserAvatar
              imgUrl={session.user.image ?? ""}
              name={session.user.name ?? ""}
              size="sm"
            />
            <div className="flex-1 space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="添加评论..."
                className="resize-none min-h-0 max-h-28 overflow-y-auto text-sm max-w-sm"
                rows={2}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!text.trim() || create.isPending}
                  onClick={() => create.mutate({ journalId, content: text.trim() })}
                >
                  {create.isPending ? <Spinner className="size-3 mr-1" /> : null}
                  评论
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-ink-200 text-ink-400">
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Textarea
                placeholder="添加评论..."
                className="resize-none min-h-0 text-sm cursor-not-allowed opacity-60"
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
        )}
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : !data?.items.length ? (
          <div className="text-center py-8">
            <MessageSquareIcon className="size-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">还没有评论，来说第一句话吧</p>
          </div>
        ) : (
          data.items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function JournalCommentPanel({ open, onOpenChange, journal }: JournalCommentPanelProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? null;

  const dateLabel = journal
    ? new Date(journal.createdAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[380px] sm:w-[420px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-4 py-4 border-b border-border shrink-0">
          <SheetTitle className="text-base font-medium text-ink-800">
            评论
          </SheetTitle>
          {dateLabel && (
            <p className="text-xs text-muted-foreground">{dateLabel} 的日志</p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {journal ? (
            <CommentsBody
              key={journal.id}
              journalId={journal.id}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Spinner className="size-6" />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
