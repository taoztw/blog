"use client";
import React from "react";
import CommentsSection from "../comments/comments-section";
import { PostSection } from "./blog-post-section";
import type { Post } from "@/global";

interface BlogViewProps {
  post: Post;
}

const BlogView = ({ post }: BlogViewProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <PostSection post={post} />
        <div className="lg:col-span-3">
          <CommentsSection postId={post.id} />
        </div>
      </div>
    </div>
  );
};

export default BlogView;
