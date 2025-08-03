import React from "react";
import Header2 from "../mvpblocks/header";

interface BlogLayoutProps {
  children: React.ReactNode;
}

const BlogLayout = ({ children }: BlogLayoutProps) => {
  return (
    <div className="w-full">
      <Header2 />
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">{children}</main>
      </div>
    </div>
  );
};

export default BlogLayout;
