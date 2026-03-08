"use client";
import CommentsSection from "@/features/comments/comments-section";
import type { Post } from "@/global";
import { PostSection, PostTableOfContents } from "./blog-post-section";

interface BlogViewProps {
  post: Post;
}

const BlogView = ({ post }: BlogViewProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:flex lg:gap-8">
        <div className="min-w-0 flex-1 space-y-8">
          <PostSection post={post} />
          <CommentsSection postId={post.id} />
        </div>
        <aside className="hidden lg:block w-64 shrink-0">
          <PostTableOfContents post={post} />
        </aside>
      </div>
    </div>
  );
};

export default BlogView;
