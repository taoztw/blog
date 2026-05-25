"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api, type RouterOutputs } from "@/trpc/react";
import { format } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TagWithCount = RouterOutputs["tag"]["getWithPostCounts"][number];
type CategoryWithCount = RouterOutputs["category"]["getWithPostCounts"][number];
type PopularPost = RouterOutputs["post"]["getPopular"][number];

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="font-cormorant text-[11px] tracking-[0.4em] text-ink-500 uppercase">{label}</div>
      <h3 className="mt-1 font-cormorant text-2xl font-medium text-ink-800">{title}</h3>
    </div>
  );
}

function tagSizeClass(ratio: number) {
  if (ratio > 0.8) return "text-[22px] font-semibold text-ink-800";
  if (ratio > 0.6) return "text-[18px] font-medium text-ink-700";
  if (ratio > 0.4) return "text-[15px] font-medium text-ink-600";
  if (ratio > 0.2) return "text-[13px] text-ink-500";
  return "text-[11px] text-ink-400";
}

export function BlogSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: popularPosts, isLoading: isLoadingPosts } = api.post.getPopular.useQuery({ limit: 5 });
  const { data: tags, isLoading: isLoadingTags } = api.tag.getWithPostCounts.useQuery();
  const { data: categories, isLoading: isLoadingCategories } = api.category.getWithPostCounts.useQuery();

  const handleTagClick = (tagName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tag", tagName);
    params.delete("category");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", categoryName);
    params.delete("tag");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const maxTagCount = Math.max(...(tags?.map((t: TagWithCount) => t.postCount) || [1]));
  const maxCategoryCount = Math.max(...(categories?.map((c: CategoryWithCount) => c.postCount) || [1]));

  return (
    <div className="space-y-12">
      <section>
        <SectionHeader label="Popular" title="热门文章" />
        {isLoadingPosts ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : popularPosts && popularPosts.length > 0 ? (
          <ol className="border-t border-ink-200">
            {popularPosts.map((post: PopularPost, idx: number) => (
              <li
                key={post.id}
                className="group grid grid-cols-[40px_1fr] gap-4 border-b border-ink-200 py-3"
              >
                <span className="font-cormorant text-3xl leading-none font-light text-ink-300 transition-colors group-hover:text-seal">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-ink-700 transition-colors group-hover:text-ink-900"
                  >
                    {post.title}
                  </Link>
                  <div className="mt-1 flex gap-3 text-[10px] tracking-wide text-ink-400">
                    <time>{format(new Date(post.createdAt), "MM·dd")}</time>
                    <span>{post.viewCount || 0} 阅</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-ink-500">暂无热门文章</p>
        )}
      </section>

      <section>
        <SectionHeader label="Categories" title="分类" />
        {isLoadingCategories ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <ul>
            {categories.map((category: CategoryWithCount) => {
              const percent = (category.postCount / maxCategoryCount) * 100;
              return (
                <li key={category.id} className="border-b border-ink-200 py-2.5">
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="group w-full text-left"
                    aria-label={`筛选 ${category.name} 分类`}
                  >
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-sm text-ink-700 transition-colors group-hover:text-ink-900">{category.name}</span>
                      <span className="font-cormorant text-sm text-ink-500">
                        {String(category.postCount).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="relative h-px bg-ink-200">
                      <span
                        className="absolute top-0 left-0 h-px bg-ink-600 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">暂无分类</p>
        )}
      </section>

      <section>
        <SectionHeader label="Tag Cloud" title="标签云" />
        {isLoadingTags ? (
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
        ) : tags && tags.length > 0 ? (
          <div className="leading-[2.1]">
            {tags.map((tag: TagWithCount) => {
              const ratio = tag.postCount / maxTagCount;
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.name)}
                  className={cn(
                    "mr-3 inline-block cursor-pointer transition-colors hover:text-seal",
                    tagSizeClass(ratio),
                  )}
                  aria-label={`筛选标签 ${tag.name}`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ink-500">暂无标签</p>
        )}
      </section>
    </div>
  );
}
