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

  const hasActiveFilter = !!categoryName || !!tagName;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-6 py-10 sm:py-14">
        {/* ── Filter ── */}
        <section className="mb-12">
          <div className="-mx-6 px-6">
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
              <button
                onClick={clearAll}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                  !hasActiveFilter
                    ? "border-ink-800 bg-ink-800 text-ink-100"
                    : "border-ink-300 text-ink-700 hover:border-ink-500 hover:text-ink-900"
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
                      "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                      active
                        ? "border-ink-800 bg-ink-800 text-ink-100"
                        : "border-ink-300 text-ink-700 hover:border-ink-500 hover:text-ink-900"
                    )}
                  >
                    {c.name}
                    <span
                      className={cn(
                        "text-[11px] tabular-nums",
                        active ? "text-ink-100/70" : "text-ink-400"
                      )}
                    >
                      {c.postCount}
                    </span>
                  </button>
                );
              })}

              {tagsWithCount && tagsWithCount.length > 0 && (
                <span className="mx-1 shrink-0 text-ink-300">·</span>
              )}

              {tagsWithCount?.map((t: TagWithCount) => {
                const active = t.name === tagName;
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTag(t.name)}
                    className={cn(
                      "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                      active
                        ? "border-seal bg-seal text-white"
                        : "border-ink-300 text-ink-700 hover:border-seal hover:text-seal"
                    )}
                  >
                    <span>#{t.name}</span>
                    <span
                      className={cn(
                        "text-[11px] tabular-nums",
                        active ? "text-white/75" : "text-ink-400"
                      )}
                    >
                      {t.postCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Dispatches ── */}
        <section>
          <div className="mb-2 flex items-baseline gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-ink-400">Dispatches</span>
            {!isLoading && <span className="font-mono text-[10px] text-ink-400">{totalItems} 篇</span>}
            <span className="h-px flex-1 bg-ink-200" />
          </div>

          <div className="grid gap-x-10 md:grid-cols-2">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 border-b border-dotted border-ink-300 py-7 sm:gap-6"
                >
                  <Skeleton className="size-[60px] rounded-sm sm:size-[84px]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}

            {!isLoading && posts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
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
        </section>
      </div>
    </div>
  );
}
