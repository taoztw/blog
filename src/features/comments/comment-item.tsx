import { authClient } from "@/lib/auth/authClient";
import { cn } from "@/lib/utils";
import type { CommentGetManyOutput } from "@/server/api/types";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  MoreVertical,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { UserAvatar } from "../../components/user-avatar";
import { CommentContent } from "./comment-content";
import CommentReply from "./comment-reply";
import CommentsForm from "./comments-form";

interface CommentItemProps {
  comment: CommentGetManyOutput["items"][number];
  variant?: "comment" | "reply";
}

const CommentItem = ({ comment, variant = "comment" }: CommentItemProps) => {
  const [isReplyOpen, setIsReplyOpen] = React.useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = React.useState(false);

  const utils = api.useUtils();
  const remove = api.comment.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted successfully!");
      utils.comment.getMany.invalidate({
        postId: comment.postId,
      });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Please sign in to delete the comment.");
      } else {
        toast.error("Failed to delete comment. Please try again.");
      }
    },
  });
  const like = api.commentReactions.like.useMutation({
    onSuccess: () => {
      toast.success("Comment liked successfully!");
      utils.comment.getMany.invalidate({
        postId: comment.postId,
      });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Please sign in to like the comment.");
      } else {
        toast.error("Failed to like comment. Please try again.");
      }
    },
  });
  const dislike = api.commentReactions.dislike.useMutation({
    onSuccess: () => {
      toast.success("Comment disliked successfully!");
      utils.comment.getMany.invalidate({
        postId: comment.postId,
      });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Please sign in to dislike the comment.");
      } else {
        toast.error("Failed to dislike comment. Please try again.");
      }
    },
  });

  const userId = authClient.useSession().data?.user?.id || null;
  return (
    <div>
      <div className="flex gap-4">
        <UserAvatar
          size="base"
          imgUrl={comment.user.image || ""}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm pb-0.5">{comment.user.name}</span>

            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(), { addSuffix: true })}
            </span>
          </div>

          <CommentContent content={comment.content} />
          {/* Reactions */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                disabled={false}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  like.mutate({ commentId: comment.id });
                }}
              >
                <ThumbsUpIcon className={cn(comment.userReaction === "like") && "fill-black"} />
              </Button>
              <span className="text-muted-foreground text-xs">{comment.likeCount}</span>
              <Button
                disabled={false}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  dislike.mutate({ commentId: comment.id });
                }}
              >
                <ThumbsDownIcon className={cn(comment.userReaction === "dislike") && "fill-black"} />
              </Button>
              <span className="text-muted-foreground text-xs">{comment.dislikeCount}</span>
            </div>
            {variant === "comment" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setIsReplyOpen(true)}
              >
                Reply
              </Button>
            )}
          </div>
        </div>

        <div>
          {(variant === "comment" || comment.user.id === userId) && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                >
                  <MoreVertical className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                  <MessageSquareIcon className="size-4" />
                  Reply
                </DropdownMenuItem>

                {comment.user.id === userId && (
                  <DropdownMenuItem
                    onClick={() => {
                      remove.mutate({ id: comment.id });
                    }}
                  >
                    <Trash2Icon className="size-4" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentsForm
            postId={comment.postId}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
            variant="reply"
            parentId={comment.id}
            onCancel={() => setIsReplyOpen(false)}
          />
        </div>
      )}

      {comment.replyCount > 0 && variant === "comment" && (
        <div>
          <Button
            size="sm"
            variant="tertiary"
            onClick={() => setIsRepliesOpen((current) => !current)}
          >
            {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {comment.replyCount} replies
          </Button>
        </div>
      )}
      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReply
          parentId={comment.id}
          postId={comment.postId}
        />
      )}
    </div>
  );
};

export default CommentItem;
