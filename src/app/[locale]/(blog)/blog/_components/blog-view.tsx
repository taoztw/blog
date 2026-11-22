"use client";
import CommentsSection from "@/features/comments/comments-section";
import type { HeadingItem } from "@/components/tiptap/document";
import type { Post } from "@/global";
import type { ReactNode } from "react";
import { PostSection, PostTableOfContents } from "./blog-post-section";

interface BlogViewProps {
  post: Post;
  /** 服务端渲染好的正文；文章没有内容时为空 */
  content?: ReactNode;
  /** 服务端算好的标题列表，用于生成目录 */
  headings: HeadingItem[];
}

const BlogView = ({ post, content, headings }: BlogViewProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:flex lg:gap-8">
        <div className="min-w-0 flex-1 space-y-8">
          <PostSection post={post} content={content} />
          <CommentsSection postId={post.id} />
        </div>
        <aside className="hidden lg:block w-64 shrink-0">
          <PostTableOfContents headings={headings} />
        </aside>
      </div>
    </div>
  );
};

export default BlogView;
