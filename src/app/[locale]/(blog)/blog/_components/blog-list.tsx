"use client";

import { BlogCard } from "@/components/cards/post-card";
import { CategoryBadge } from "@/components/category-badge";
import { TagBadge } from "@/components/tag-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationComponent } from "@/components/ui_custom/pagination";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BlogSidebar } from "./blog-sidebar";

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
  const currentTag = tags?.find((tag) => tag.name === tagName);
  const currentCategory = categories?.find((cat) => cat.name === categoryName);

  console.log("posts", posts);

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
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* 主内容区域 */}
          <div className="w-full min-w-0">
            {/* 筛选条件显示 */}
            {(tagName || categoryName) && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className="text-sm text-muted-foreground">当前筛选：</span>
                {tagName && currentTag && (
                  <TagBadge name={currentTag.name} color={currentTag.color} onRemove={() => clearFilter("tag")} />
                )}
                {categoryName && currentCategory && (
                  <CategoryBadge name={currentCategory.name} onRemove={() => clearFilter("category")} />
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
