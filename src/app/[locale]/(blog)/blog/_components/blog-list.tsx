"use client";

import { motion } from "framer-motion";
import SearchInput from "@/components/ui/search-input";
import { BlogCard } from "@/components/cards/post-card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import type { Post, PostWithRelations } from "@/global";
import { BlogSidebar } from "./blog-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState, type JSX } from "react";
import { PaginationComponent } from "@/components/ui_custom/pagination";

export function BlogListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathname = usePathname();
  const search = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const tagId = searchParams.get("tagId") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const tagName = searchParams.get("tag") ?? "";
  const categoryName = searchParams.get("category") ?? "";

  // 内部状态（用于受控输入框）
  const [searchValue, setSearchValue] = useState(search);

  // 搜索值改动时，延迟更新 URL
  useEffect(() => {
    const handler = setTimeout(() => {
      // 只有内容真的改变时才更新
      if (searchValue !== search) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", searchValue);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 300); // 300ms 防抖

    return () => clearTimeout(handler);
  }, [searchValue]);

  // 获取数据（带分页、搜索和筛选）
  const { data, isLoading } = api.post.getByPageWithFilters.useQuery({
    page,
    limit: 5,
    search,
    tagId,
    categoryId,
  });

  const posts = data?.items ?? [];
  const totalItems = data?.total ?? 0;

  console.log("posts", posts);

  // 清除筛选
  const clearFilter = (type: "tag" | "category") => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "tag") {
      params.delete("tagId");
      params.delete("tag");
    } else {
      params.delete("categoryId");
      params.delete("category");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tagId");
    params.delete("tag");
    params.delete("categoryId");
    params.delete("category");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* 主内容区域 */}
          <div className="w-full min-w-0">
            <div className="mb-8 space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">Posts</h1>

              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <SearchInput
                  value={searchValue}
                  onChange={(v) => setSearchValue(v)} // 只更新本地 state，不直接改 URL
                />
              )}
            </div>
            {/* 筛选条件显示 */}
            {(tagName || categoryName) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">当前筛选：</span>
                {tagName && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-md border">
                    <span className="text-sm">标签: {tagName}</span>
                    <button onClick={() => clearFilter("tag")} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                      ×
                    </button>
                  </div>
                )}
                {categoryName && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-sm rounded-md border">
                    <span className="text-sm">分类: {categoryName}</span>
                    <button
                      onClick={() => clearFilter("category")}
                      className="ml-1 hover:bg-green-100 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </div>
                )}
                {(tagName || categoryName) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    清除所有筛选
                  </button>
                )}
              </div>
            )}
            {/* 文章列表 */}
            <div className="space-y-4">
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}

              {!isLoading && posts.length === 0 && <p>没有找到文章</p>}

              {!isLoading &&
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))}
            </div>
            {/* 分页组件 */}
            <PaginationComponent totalItems={totalItems} itemsPerPage={5} />
          </div>

          {/* 侧边栏 */}
          <aside className="w-full lg:sticky lg:top-20 ml-10 lg:h-fit">
            <BlogSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
