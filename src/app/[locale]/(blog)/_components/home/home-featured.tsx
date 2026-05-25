"use client";

import { ImageService } from "@/lib/image-service";
import { api, type RouterOutputs } from "@/trpc/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

type RecentPost = RouterOutputs["post"]["getRecent"][number];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

function FeaturedSkeleton() {
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="aspect-[4/5] animate-pulse rounded-lg bg-ink-200" />
        <div className="mt-6 space-y-3">
          <div className="h-3 w-20 animate-pulse rounded bg-ink-200" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-ink-200" />
          <div className="h-4 w-full animate-pulse rounded bg-ink-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-ink-200" />
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="h-3 w-24 animate-pulse rounded bg-ink-200" />
        <div className="mt-6 space-y-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-ink-200" />
              <div className="h-5 w-full animate-pulse rounded bg-ink-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedCover({ post }: { post: RecentPost }) {
  if (post.imageUrl) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-ink-200">
        <Image
          src={ImageService.getImageUrl(post.imageUrl)}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          priority
        />
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg bg-ink-100">
      <span className="font-cormorant text-[14rem] leading-none text-ink-300 transition-colors duration-700 group-hover:text-ink-400">
        墨
      </span>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-ink-200/30" />
    </div>
  );
}

export function HomeFeatured() {
  const t = useTranslations("Home");
  const { data: recentPosts, isLoading } = api.post.getRecent.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="mx-auto mt-20 max-w-6xl lg:mt-24">
        <FeaturedSkeleton />
      </div>
    );
  }

  if (!recentPosts || recentPosts.length === 0) {
    return null;
  }

  const [featured, ...rest] = recentPosts;
  if (!featured) return null;
  const hasRest = rest.length > 0;

  return (
    <div className="mx-auto mt-20 max-w-6xl lg:mt-24">
      {/* Section label */}
      <motion.div
        custom={0}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mb-8 flex items-baseline justify-between"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t("featuredLabel")}
        </span>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-ink-800"
        >
          {t("viewAll")}
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>

      {hasRest ? (
        /* ── Multi-post layout: 7/5 asymmetric ── */
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Featured (Left, large stacked) */}
          <motion.article
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="lg:col-span-7"
          >
            <Link href={`/blog/${featured.slug}`} className="group block">
              <FeaturedCover post={featured} />

              <div className="mt-6 space-y-4">
                <div className="text-xs uppercase tracking-[0.18em] text-seal">
                  {featured.category?.name ?? t("essayCategory")}
                </div>

                <h3 className="font-cormorant text-3xl font-normal leading-tight text-ink-800 transition-colors group-hover:text-ink-900 lg:text-4xl">
                  <span className="line-clamp-2">{featured.title}</span>
                </h3>

                {featured.excerpt ? (
                  <p className="line-clamp-3 text-base leading-relaxed text-ink-600">
                    {featured.excerpt}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="tabular-nums">{formatDate(featured.createdAt)}</span>
                  <span className="size-0.5 rounded-full bg-ink-300" />
                  <span className="tabular-nums">
                    {featured.viewCount ?? 0} {t("views")}
                  </span>
                  <span className="size-0.5 rounded-full bg-ink-300" />
                  <span className="inline-flex items-center gap-1 text-ink-700 transition-colors group-hover:text-seal">
                    {t("readFullArticle")}
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.article>

          {/* Continue Reading (Right) */}
          <div className="lg:col-span-5">
            <motion.div
              custom={2}
              variants={fade}
              initial="hidden"
              animate="show"
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              {t("continueReading")}
            </motion.div>

            <ul className="mt-6 divide-y divide-border">
              {rest.map((post, i) => (
                <motion.li
                  key={post.id}
                  custom={3 + i}
                  variants={fade}
                  initial="hidden"
                  animate="show"
                >
                  <Link href={`/blog/${post.slug}`} className="group block py-5">
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span className="tabular-nums">{formatDate(post.createdAt)}</span>
                      {post.category?.name ? (
                        <>
                          <span className="size-0.5 rounded-full bg-ink-300" />
                          <span>{post.category.name}</span>
                        </>
                      ) : null}
                    </div>
                    <h4 className="mt-2 line-clamp-2 text-[15px] leading-snug text-ink-700 transition-colors group-hover:text-ink-900">
                      {post.title}
                    </h4>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        /* ── Single-post layout: side-by-side ── */
        <motion.article
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid gap-10 md:grid-cols-2 md:gap-14 md:items-center"
          >
            <FeaturedCover post={featured} />

            <div className="space-y-5">
              <div className="text-xs uppercase tracking-[0.18em] text-seal">
                {featured.category?.name ?? t("essayCategory")}
              </div>

              <h3 className="font-cormorant text-3xl font-normal leading-tight text-ink-800 transition-colors group-hover:text-ink-900 lg:text-5xl">
                <span className="line-clamp-3">{featured.title}</span>
              </h3>

              {featured.excerpt ? (
                <p className="line-clamp-4 text-base leading-relaxed text-ink-600">
                  {featured.excerpt}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">{formatDate(featured.createdAt)}</span>
                <span className="size-0.5 rounded-full bg-ink-300" />
                <span className="tabular-nums">
                  {featured.viewCount ?? 0} {t("views")}
                </span>
                <span className="size-0.5 rounded-full bg-ink-300" />
                <span className="inline-flex items-center gap-1 text-ink-700 transition-colors group-hover:text-seal">
                  {t("readFullArticle")}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </motion.article>
      )}
    </div>
  );
}
