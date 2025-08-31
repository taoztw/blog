"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export function BlogSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: popularPosts, isLoading: isLoadingPosts } = api.post.getPopular.useQuery({ limit: 5 });
  const { data: tags, isLoading: isLoadingTags } = api.tag.getWithPostCounts.useQuery();
  const { data: categories, isLoading: isLoadingCategories } = api.category.getWithPostCounts.useQuery();

  const handleTagClick = (tagId: string, tagName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tagId", tagId);
    params.set("tag", tagName);
    params.delete("categoryId");
    params.delete("category");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoryId", categoryId);
    params.set("category", categoryName);
    params.delete("tagId");
    params.delete("tag");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return "text-sm";
    if (ratio > 0.6) return "text-xs";
    if (ratio > 0.4) return "text-xs";
    return "text-xs";
  };

  const maxTagCount = Math.max(...(tags?.map((t) => t.postCount) || [1]));

  return (
    <div className="space-y-8 text-sm">
      {/* 热门文章 */}
      <section>
        <h3 className="mb-3 text-base font-medium">🔥 热门文章</h3>
        {isLoadingPosts ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <ol className="space-y-2.5 list-decimal list-inside marker:text-muted-foreground/50">
            {popularPosts?.map((post, index) => (
              <li key={post.id} className="text-muted-foreground">
                <Link href={`/blog/${post.slug}`} className="hover:text-foreground transition-colors text-sm">
                  {post.title}
                </Link>
                <div className="ml-5 mt-0.5 flex gap-3 text-xs text-muted-foreground/60">
                  <time>{format(new Date(post.createdAt), "MM-dd", { locale: zhCN })}</time>
                  <span>{post.viewCount || 0} 浏览</span>
                </div>
              </li>
            )) || <p className="text-muted-foreground">暂无热门文章</p>}
          </ol>
        )}
      </section>

      {/* 分类 */}
      <section>
        <h3 className="mb-3 text-base font-medium">📑 分类</h3>
        {isLoadingCategories ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {categories?.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.id, category.name)}
                  className="flex justify-between w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                >
                  <span>{category.name}</span>
                  <span className="text-muted-foreground/50">({category.postCount})</span>
                </button>
              </li>
            )) || <p className="text-muted-foreground">暂无分类</p>}
          </ul>
        )}
      </section>

      {/* 标签云 */}
      <section>
        <h3 className="mb-3 text-base font-medium"># 标签云</h3>
        {isLoadingTags ? (
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags?.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.id, tag.name)}
                className={`px-2 py-0.5 ${getTagSize(tag.postCount, maxTagCount)} rounded border border-border/40
                  text-muted-foreground hover:border-border hover:text-foreground 
                  transition-colors relative`}
                style={{
                  backgroundColor: tag.color ? `${tag.color}15` : undefined,
                  // borderColor: tag.color ? `${tag.color}40` : undefined,
                }}
              >
                {tag.name}
                <span className="ml-1 text-[10px] opacity-60">({tag.postCount})</span>
              </button>
            )) || <p className="text-muted-foreground">暂无标签</p>}
          </div>
        )}
      </section>
    </div>
  );
}
