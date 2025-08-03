import BlogLayout from "@/components/layouts/blog-layout";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <BlogLayout>{children}</BlogLayout>;
};

export default Layout;
