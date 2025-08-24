import React from "react";
import { UserAvatar } from "../ui_custom/user-avatar";
import { cn } from "@/lib/utils";
import { ThumbsUpIcon, ThumbsDownIcon } from "lucide-react";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  variant?: "comment" | "reply";
}

const CommentItem = ({ variant }: CommentItemProps) => {
  const [isReplyOpen, setIsReplyOpen] = React.useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = React.useState(false);

  const remove = () => {};
  const like = () => {};
  const dislike = () => {};

  return (
    <div>
      <div className="flex gap-4">
        <UserAvatar size="base" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm pb-0.5">{"tz"}</span>

            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm">
            {
              "React Server Components 为我们提供了一种新的思考 React 应用架构的方式。通过在服务器端渲染组件，我们可以获得更好的性能、更小的客户端包大小，以及更直接的数据访问能力。"
            }
          </p>
          {/* Reactions */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                disabled={false}
                variant="ghost"
                size="icon"
                className="size-8"
                // onClick={() => {
                //   like.mutate({ commentId: comment.id });
                // }}
              >
                <ThumbsUpIcon className={cn("like" === "like") && "fill-black"} />
              </Button>
              <span className="text-muted-foreground text-xs">{21}</span>
              <Button
                disabled={false}
                variant="ghost"
                size="icon"
                className="size-8"
                // onClick={() => {
                //   dislike.mutate({ commentId: comment.id });
                // }}
              >
                <ThumbsDownIcon className={"fill-black"} />
              </Button>
              <span className="text-muted-foreground text-xs">{2}</span>
            </div>
            {variant === "comment" && (
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setIsReplyOpen(true)}>
                Reply
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
