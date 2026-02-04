"use client";

import { CategoryBadge } from "@/app/[locale]/(blog)/blog/_components/category-badge";
import { BlogCard } from "@/app/[locale]/(blog)/blog/_components/post-card";
import { PaginationComponent } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { TagBadge } from "@/features/tags/tag-badge";
import { api, type RouterOutputs } from "@/trpc/react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BlogSidebar } from "./blog-sidebar";

type Tag = RouterOutputs["tag"]["getAll"][number];
type Category = RouterOutputs["category"]["getAll"][number];
type PostWithFilters = RouterOutputs["post"]["getByPageWithFilters"]["items"][number];

export function BlogListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathname = usePathname();
  const search = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const tagName = searchParams.get("tag") ?? undefined;
  const categoryName = searchParams.get("category") ?? undefined;

  // 获取数据（带分页、搜索和筛选）
  const { data, isLoading } = api.post.getByPageWithFilters.useQuery({
    page,
    limit: 5,
    search,
    tagName,
    categoryName,
  });

  // 获取所有标签和分类信息（用于显示颜色）
  const { data: tags } = api.tag.getAll.useQuery(undefined, {
    enabled: !!tagName,
  });
  const { data: categories } = api.category.getAll.useQuery(undefined, {
    enabled: !!categoryName,
  });

  const posts = data?.items ?? [];
  const totalItems = data?.total ?? 0;

  // 找到当前筛选的标签和分类的完整信息
  const currentTag = tags?.find((tag: Tag) => tag.name === tagName);
  const currentCategory = categories?.find((cat: Category) => cat.name === categoryName);

  // 清除筛选
  const clearFilter = (type: "tag" | "category") => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "tag") {
      params.delete("tag");
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    params.delete("category");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-8 lg:gap-12">
          {/* 主内容区域 */}
          <div className="w-full min-w-0">
            {/* 筛选条件显示 */}
            {(tagName || categoryName) && (
              <div className="flex items-center gap-2 flex-wrap mb-8 p-4 bg-accent/30 rounded-lg border border-border/50">
                <span className="text-sm font-medium text-muted-foreground">当前筛选：</span>
                {tagName && currentTag && (
                  <TagBadge
                    name={currentTag.name}
                    color={currentTag.color}
                    onRemove={() => clearFilter("tag")}
                  />
                )}
                {categoryName && currentCategory && (
                  <CategoryBadge
                    name={currentCategory.name}
                    onRemove={() => clearFilter("category")}
                  />
                )}
                {(tagName || categoryName) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-muted-foreground hover:text-foreground underline cursor-pointer transition-colors"
                    aria-label="清除所有筛选条件"
                  >
                    清除所有筛选
                  </button>
                )}
              </div>
            )}
            {/* 文章列表 */}
            <div className="space-y-0 divide-y-0">
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-4 py-6 sm:flex-row border-b border-border/40 last:border-b-0 px-4 -mx-4"
                  >
                    {/* 图片骨架 */}
                    <div className="flex-none sm:w-1/4">
                      <Skeleton className="aspect-4/3 w-full rounded-lg" />
                    </div>
                    {/* 内容骨架 */}
                    <div className="flex flex-col sm:w-3/4 space-y-3">
                      {/* 标签骨架 */}
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      {/* 标题骨架 */}
                      <Skeleton className="h-6 w-3/4" />
                      {/* 摘要骨架 */}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                      {/* 元数据骨架 */}
                      <div className="flex gap-4 mt-auto">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                ))}

              {!isLoading && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg text-muted-foreground mb-2">没有找到文章</p>
                  <p className="text-sm text-muted-foreground/70">尝试调整筛选条件或搜索关键词</p>
                </div>
              )}

              {!isLoading &&
                posts.map((post: PostWithFilters, index: number) => (
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
            <PaginationComponent
              totalItems={totalItems}
              itemsPerPage={5}
            />
          </div>

          {/* 侧边栏 */}
          <aside className="w-full lg:sticky lg:top-24 lg:h-fit">
            <BlogSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
