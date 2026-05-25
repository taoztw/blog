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
        className="relative block size-[92px] shrink-0 self-start overflow-hidden rounded sm:size-[120px] lg:size-[140px]"
        aria-label={post.title}
      >
        <Image
          alt={post.title}
          src={ImageService.getImageUrl(post.imageUrl)}
          fill
          sizes="(min-width: 1024px) 140px, (min-width: 640px) 120px, 92px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          loading="lazy"
        />
      </Link>
    );
  }

  const day = format(post.createdAt, "dd");
  const month = format(post.createdAt, "MMM");
  return (
    <Link
      href={href}
      className="flex size-[92px] shrink-0 flex-col items-center justify-center self-start rounded border border-ink-200 bg-ink-100 transition-colors group-hover:border-ink-300 sm:size-[120px] lg:size-[140px]"
      aria-label={post.title}
    >
      <span className="text-3xl font-light leading-none text-ink-700 tabular-nums sm:text-4xl">{day}</span>
      <span className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-500">{month}</span>
    </Link>
  );
}

export function BlogCard({ post }: BlogCardProps) {
  const pathname = usePathname();
  const blogUrl = `${pathname}/${post.slug}`;

  return (
    <article className="group flex items-start gap-6 border-b border-dotted border-ink-300 py-8 last:border-b-0 sm:gap-8 sm:py-10">
      <MiniThumb post={post} href={blogUrl} />

      <div className="min-w-0 flex-1">
        <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 tabular-nums">
          {format(post.createdAt, "yyyy · MM · dd")}
        </div>
        <h3 className="text-xl font-light leading-snug tracking-tight text-ink-800 transition-colors group-hover:text-seal sm:text-2xl">
          <Link href={blogUrl}>{post.title}</Link>
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-2 max-w-2xl text-[15px] leading-relaxed text-ink-600">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] tracking-wide text-ink-500">
          {post.category && (
            <span>
              <span className="text-ink-400">cat</span>{" "}
              <span className="text-ink-700">{post.category.name}</span>
            </span>
          )}
          <span>
            <span className="text-ink-400">views</span>{" "}
            <span className="tabular-nums text-ink-700">{post.viewCount}</span>
          </span>
          <span>
            <span className="text-ink-400">comments</span>{" "}
            <span className="tabular-nums text-ink-700">{post.commentCount}</span>
          </span>
          {post.tags?.slice(0, 3).map((t) => (
            <span key={t.id} className="text-seal">
              #{t.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
