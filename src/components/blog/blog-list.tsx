"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SearchInput from "../ui/search-input";
import { BlogCard } from "../cards/post-card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import type { PostWithRelations } from "@/global";
import { BlogSidebar } from "./blog-sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BlogListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();
  const search = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const { data, isLoading } = api.post.getByPage.useQuery({
    page,
    limit: 5, // 每页数量
    search,
  });
  const posts = data?.items;
  const totalPages = data?.totalPages;
  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* 调整栅格比例：主内容区更宽，侧边栏更窄 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* 主内容区域 */}
          <div className="w-full min-w-0">
            {" "}
            {/* 添加 min-w-0 防止内容溢出 */}
            {/* 页面标题和搜索栏 */}
            <div className="mb-8 space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
              <SearchInput
                defaultValue={search}
                onChange={(q) => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("q", q);
                  params.set("page", "1"); // 重置到第一页
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
            </div>
            {/* 文章列表 */}
            <div className="space-y-4">
              {isLoading && <p>加载中...</p>}
              {data?.items?.length === 0 && <p>没有找到文章</p>}

              {posts?.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlogCard post={post as PostWithRelations} />
                </motion.div>
              ))}
            </div>
            {/* 加载更多按钮 */}
            <div className="mt-12 text-center">
              <div>
                {/* 上一页 */}
                <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                  Prev
                </button>
                {/* 下一页 */}
                <button onClick={() => goToPage(page + 1)}>Next</button>
              </div>
            </div>
          </div>

          {/* 侧边栏 - 缩小宽度 */}
          <aside className="w-full lg:sticky lg:top-20 ml-10 lg:h-fit">
            <BlogSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
