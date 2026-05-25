"use client";

import { BlogCard } from "@/app/[locale]/(blog)/blog/_components/post-card";
import { PaginationComponent } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api, type RouterOutputs } from "@/trpc/react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CategoryWithCount = RouterOutputs["category"]["getWithPostCounts"][number];
type TagWithCount = RouterOutputs["tag"]["getWithPostCounts"][number];
type PostWithFilters = RouterOutputs["post"]["getByPageWithFilters"]["items"][number];

export function BlogListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathname = usePathname();
  const search = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const tagName = searchParams.get("tag") ?? undefined;
  const categoryName = searchParams.get("category") ?? undefined;

  const { data, isLoading } = api.post.getByPageWithFilters.useQuery({
    page,
    limit: 10,
    search,
    tagName,
    categoryName,
  });

  const { data: categoriesWithCount } = api.category.getWithPostCounts.useQuery();
  const { data: tagsWithCount } = api.tag.getWithPostCounts.useQuery();

  const posts = data?.items ?? [];
  const totalItems = data?.total ?? 0;

  const setFilter = (type: "tag" | "category", value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    params.delete("category");
    if (value) params.set(type, value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleCategory = (name: string) => {
    setFilter("category", categoryName === name ? null : name);
  };

  const toggleTag = (name: string) => {
    setFilter("tag", tagName === name ? null : name);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    params.delete("category");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-6 py-8 sm:py-10">
        {/* 快速筛选栏 — 单行横滚 */}
        <section className="mb-8 -mx-6 px-6">
          <div className="scrollbar-hide flex items-baseline gap-x-4 overflow-x-auto whitespace-nowrap pb-1">
            <button
              onClick={clearAll}
              className={cn(
                "shrink-0 cursor-pointer text-sm transition-colors",
                !categoryName && !tagName ? "font-medium text-seal" : "text-ink-600 hover:text-ink-900",
              )}
            >
              全部
            </button>
            {categoriesWithCount?.map((c: CategoryWithCount) => {
              const active = c.name === categoryName;
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCategory(c.name)}
                  className={cn(
                    "shrink-0 cursor-pointer text-sm transition-colors",
                    active ? "font-medium text-seal" : "text-ink-700 hover:text-ink-900",
                  )}
                >
                  {c.name}
                  <span className="ml-1 font-mono text-[10px] text-ink-400">{c.postCount}</span>
                </button>
              );
            })}
            {tagsWithCount && tagsWithCount.length > 0 && (
              <span className="shrink-0 text-ink-300">|</span>
            )}
            {tagsWithCount?.map((t: TagWithCount) => {
              const active = t.name === tagName;
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.name)}
                  className={cn("shrink-0 cursor-pointer text-sm transition-opacity", active ? "font-medium" : "hover:opacity-70")}
                  style={{ color: active ? "var(--seal)" : t.color ?? "var(--ink-600)" }}
                >
                  #{t.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* 文章列表 */}
        <div>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[60px_1fr] gap-x-5 gap-y-3 border-b border-dotted border-ink-300 py-7 sm:grid-cols-[84px_1fr] lg:grid-cols-[84px_1fr_180px] lg:gap-x-8"
              >
                <Skeleton className="size-[84px] rounded-sm" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="hidden space-y-1 lg:block">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}

          {!isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-cormorant text-xl text-ink-600 italic">No entries found.</p>
              <p className="mt-2 text-sm text-ink-500">尝试调整筛选条件或搜索关键词</p>
            </div>
          )}

          {!isLoading &&
            posts.map((post: PostWithFilters, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
        </div>

        <PaginationComponent
          totalItems={totalItems}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
