import { ChevronDown, Filter, Loader2Icon } from "lucide-react";
import React, { Suspense } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import CommentsForm from "./comments-form";

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  return (
    <Suspense fallback={<CommentsSectionSkeleton />}>
      <CommentsSectionSuspense />
    </Suspense>
  );
};
const CommentsSectionSkeleton = () => {
  return (
    <div className="mt-6 flex justify-center items-center">
      <Loader2Icon className="text-muted-foreground size-7 animate-spin" />
    </div>
  );
};

const CommentsSectionSuspense = () => {
  const [sortBy, setSortBy] = React.useState<"top" | "newest" | "oldest">("top");
  const sortLabels = {
    top: "热门评论",
    newest: "最新评论",
    oldest: "最早评论",
  };
  return (
    <div className="space-y-6 mt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold">12 comments</h1>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="size-4" />
              {sortLabels[sortBy]}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy("top")}>热门评论</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("newest")}>最新评论</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>最早评论</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommentsForm postId="" />
    </div>
  );
};

export default CommentsSection;
