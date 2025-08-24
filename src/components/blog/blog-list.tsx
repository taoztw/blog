"use client";

import { motion } from "framer-motion";
import SearchInput from "../ui/search-input";
import { BlogCard } from "../cards/post-card";
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
import type { PostListItem } from "@/server/api/types";

export function BlogListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathname = usePathname();
  const search = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

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

  // 获取数据（带分页和搜索）
  const { data, isLoading } = api.post.getByPage.useQuery({
    page,
    limit: 5,
    search,
  });

  const posts = data?.items ?? [];
  const totalPages = 100;

  // 跳转函数
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
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
                    <BlogCard post={post as PostListItem} />
                  </motion.div>
                ))}
            </div>

            {/* 分页组件 */}
            {!isLoading && totalPages > 1 && (
              <Pagination className="mt-12">
                <PaginationContent>
                  {/* 上一页 */}
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(page - 1);
                      }}
                    />
                  </PaginationItem>

                  {/* 页码渲染逻辑 */}
                  {(() => {
                    const items: JSX.Element[] = [];

                    if (page <= 3) {
                      // 前三页场景：显示 1, 2, 3 ...
                      const endPage = Math.min(3, totalPages);
                      for (let p = 1; p <= endPage; p++) {
                        items.push(
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              isActive={p === page}
                              onClick={(e) => {
                                e.preventDefault();
                                goToPage(p);
                              }}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (totalPages > 3) {
                        items.push(<PaginationEllipsis key="end-ellipsis" />);
                      }
                    } else {
                      // page > 3：显示 ... (p-2) (p-1) p
                      items.push(<PaginationEllipsis key="start-ellipsis" />);

                      for (let p = page - 2; p <= page; p++) {
                        if (p >= 1 && p <= totalPages) {
                          items.push(
                            <PaginationItem key={p}>
                              <PaginationLink
                                href="#"
                                isActive={p === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  goToPage(p);
                                }}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      }
                    }

                    return items;
                  })()}

                  {/* 下一页 */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
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
