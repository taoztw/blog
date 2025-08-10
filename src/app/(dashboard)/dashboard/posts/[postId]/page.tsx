import CreatePostPage from "@/components/dashboard/posts/post-edit";
import React from "react";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const page = async ({ params }: PageProps) => {
  const { postId } = await params;
  console.log(postId === "new");

  return <div>{postId.toString() === "new" ? <CreatePostPage /> : "编辑现有文章"}</div>;
};

export default page;
