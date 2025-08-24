import { CornerDownRightIcon, Loader2Icon } from "lucide-react";
import React from "react";
import CommentItem from "./comment-item";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

interface CommentReplyProps {
  parentId: string;
  postId: string;
}

const CommentReply = ({ parentId, postId }: CommentReplyProps) => {
  console.log("parentId", parentId);
  console.log("videoId", postId);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = api.comment.getMany.useInfiniteQuery(
    {
      limit: 10,
      postId,
      parentId,
    },
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.nextCursor) {
          return {
            ...lastPage.nextCursor,
            updatedAt: lastPage.nextCursor.updateAt, // Map updateAt to updatedAt
          };
        }
        return null;
      },
    }
  );

  return (
    <div className="pl-14">
      <div className="flex flex-col gap-4 mt-2">
        {isLoading && <Loader2Icon className="text-muted-foreground size-6 animate-spin" />}
        {!isLoading &&
          data?.pages
            .flatMap((page) => page.items)
            .map((comment) => <CommentItem key={comment.id} comment={comment} variant="reply" />)}
      </div>
      {hasNextPage && (
        <Button variant="tertiary" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          <CornerDownRightIcon />
          Show more replies
        </Button>
      )}
      {/* {JSON.stringify(data)} */}
    </div>
  );
};

export default CommentReply;
