"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

interface FilterCarouselProps {
  value?: string | null;
  isLoading?: boolean;
  data: {
    value: string;
    label: string;
  }[];
}

/**
 * 分类筛选条 —— 与博客列表筛选样式一致（圆角描边胶囊，选中实底）。
 * 横向可滚动，超出隐藏滚动条。
 */
export const FilterCarousel = ({ value, data, isLoading }: FilterCarouselProps) => {
  const router = useRouter();

  const onSelect = (next: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("categoryId", next);
    router.push(url.toString());
  };

  return (
    <div className="-mx-2 px-2">
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 w-16 shrink-0 rounded-full"
              />
            ))
          : data.map((item) => {
              const active = value === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onSelect(item.value)}
                  className={cn(
                    "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                    active
                      ? "border-ink-800 bg-ink-800 text-ink-100"
                      : "border-ink-300 text-ink-700 hover:border-ink-500 hover:text-ink-900",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
      </div>
    </div>
  );
};
