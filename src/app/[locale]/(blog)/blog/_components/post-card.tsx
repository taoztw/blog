"use client";

import { ImageService } from "@/lib/image-service";
import type { PostListItem } from "@/server/api/types";
import type { tags } from "@/server/db/schema";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BlogCardProps {
  post: PostListItem & {
    tags?: (typeof tags.$inferSelect)[];
  };
}

function MiniThumb({ post, href }: { post: PostListItem; href: string }) {
  if (post.imageUrl) {
    return (
      <Link
        href={href}
        className="relative block size-[84px] overflow-hidden rounded-sm"
        aria-label={post.title}
      >
        <Image
          alt={post.title}
          src={ImageService.getImageUrl(post.imageUrl)}
          fill
          sizes="84px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          loading="lazy"
        />
      </Link>
    );
  }

  // 无图: 极简日期戳保持对齐
  const day = format(post.createdAt, "dd");
  const month = format(post.createdAt, "MMM");
  return (
    <Link
      href={href}
      className="flex size-[84px] flex-col items-center justify-center rounded-sm border border-ink-200 bg-ink-100 transition-colors group-hover:border-ink-300"
      aria-label={post.title}
    >
      <span className="font-cormorant text-2xl leading-none font-light text-ink-700">{day}</span>
      <span className="mt-1 text-[9px] tracking-[0.2em] text-ink-500 uppercase">{month}</span>
    </Link>
  );
}

export function BlogCard({ post }: BlogCardProps) {
  const pathname = usePathname();
  const blogUrl = `${pathname}/${post.slug}`;

  return (
    <article
      className="group grid grid-cols-[60px_1fr] gap-x-5 gap-y-3 border-b border-dotted border-ink-300 py-7 last:border-b-0 sm:grid-cols-[84px_1fr] lg:grid-cols-[84px_1fr_180px] lg:gap-x-8"
    >
      <MiniThumb post={post} href={blogUrl} />

      <div className="min-w-0">
        <div className="mb-1 font-cormorant text-xs tracking-[0.05em] text-ink-400 italic">
          — {format(post.createdAt, "yyyy·MM·dd")}
        </div>
        <h3 className="font-cormorant text-xl leading-snug font-normal text-ink-800 transition-colors group-hover:text-seal">
          <Link href={blogUrl}>{post.title}</Link>
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
        )}

        {/* 小屏 inline meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-wide text-ink-500 lg:hidden">
          {post.category && (
            <span>
              <span className="text-ink-400">cat</span> {post.category.name}
            </span>
          )}
          <span>
            <span className="text-ink-400">views</span> {post.viewCount}
          </span>
          <span>
            <span className="text-ink-400">comments</span> {post.commentCount}
          </span>
          {post.tags?.slice(0, 3).map((t) => (
            <span
              key={t.id}
              style={{ color: t.color ?? undefined }}
            >
              #{t.name}
            </span>
          ))}
        </div>
      </div>

      {/* 大屏右栏 marginalia */}
      <aside className="hidden border-l border-ink-200 pl-4 font-mono text-[11px] leading-relaxed text-ink-400 lg:block">
        {post.category && (
          <div className="flex justify-between">
            <span>cat</span>
            <span className="text-ink-600">{post.category.name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>views</span>
          <span className="text-ink-600">{post.viewCount}</span>
        </div>
        <div className="flex justify-between">
          <span>comments</span>
          <span className="text-ink-600">{post.commentCount}</span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
            {post.tags.slice(0, 4).map((t) => (
              <span
                key={t.id}
                style={{ color: t.color ?? undefined }}
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}
      </aside>
    </article>
  );
}
