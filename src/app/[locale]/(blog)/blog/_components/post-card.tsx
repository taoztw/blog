"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageService } from "@/lib/image-service";
import { getTimeStamp } from "@/lib/utils";
import type { PostListItem } from "@/server/api/types";
import type { tags } from "@/server/db/schema";
import { Calendar, ChevronRightIcon, Eye, MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BlogCardProps {
  post: PostListItem & {
    tags?: (typeof tags.$inferSelect)[];
  };
}

export function BlogCard({ post }: BlogCardProps) {
  const pathname = usePathname();
  const blogUrl = `${pathname}/${post.slug}`;
  return (
    <article
      key={post.id}
      className="group flex flex-col gap-4 py-6 sm:flex-row border-b border-border/40 last:border-b-0 transition-all duration-200 hover:bg-accent/5 px-4 -mx-4 rounded-lg cursor-pointer"
      onClick={() => window.location.href = blogUrl}
    >
      {/* 图片区域 */}
      <div className="flex-none sm:w-1/4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
          <Image
            alt={post.title}
            loading="lazy"
            decoding="async"
            data-nimg="fill"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              inset: "0px",
              color: "transparent",
            }}
            sizes="(max-width: 640px) 100vw, 25vw"
            src={post.imageUrl ? ImageService.getImageUrl(post.imageUrl) : "/placeholder.svg"}
            fill
          />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex flex-col sm:w-3/4">
        {/* 分类和标签 */}
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs text-muted-foreground font-medium border-muted-foreground/20"
          >
            {post.category!.name}
          </Badge>
          {post.tags && post.tags.length > 0 && (
            <>
              {post.tags.slice(0, 3).map((tag: typeof tags.$inferSelect) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs font-normal transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : undefined,
                    borderColor: tag.color ? `${tag.color}40` : undefined
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground font-normal border-muted-foreground/20"
                >
                  +{post.tags.length - 3}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* 标题 */}
        <h3 className="mb-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
          <Link
            href={blogUrl}
            className="hover:underline decoration-primary/30 underline-offset-2"
            onClick={(e) => e.stopPropagation()}
          >
            {post.title}
          </Link>
        </h3>

        {/* 摘要 */}
        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm leading-relaxed">
          {post.excerpt}
        </p>

        {/* 底部元数据 */}
        <div className="text-muted-foreground mt-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" title="发布时间">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <time dateTime={post.createdAt.toISOString()}>{getTimeStamp(post.createdAt)}</time>
            </div>
            <div className="flex items-center gap-1.5" title="浏览次数">
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1.5" title="评论数量">
              <MessageCircleIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{post.commentCount}</span>
            </div>
          </div>
          <Link
            href={blogUrl}
            onClick={(e) => e.stopPropagation()}
            aria-label={`阅读文章: ${post.title}`}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-auto text-xs group/btn font-normal -mr-2 hover:text-foreground transition-colors"
            >
              阅读
              <ChevronRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
