"use client";

import { ImageService } from "@/lib/image-service";
import { api, type RouterOutputs } from "@/trpc/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

type PopularPost = RouterOutputs["post"]["getPopular"][number];

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
    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div className="aspect-[4/3] animate-pulse rounded-lg bg-ink-200" />
      </div>
      <div className="space-y-4 lg:col-span-7">
        <div className="h-3 w-20 animate-pulse rounded bg-ink-200" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-ink-200" />
        <div className="h-4 w-full animate-pulse rounded bg-ink-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-ink-200" />
      </div>
    </div>
  );
}

function FeaturedCover({ post, rankBadge }: { post: PopularPost; rankBadge: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink-100">
      <span className="absolute left-3 top-3 z-10 rounded bg-seal px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white">
        {rankBadge}
      </span>
      {post.imageUrl ? (
        <Image
          src={ImageService.getImageUrl(post.imageUrl)}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          priority
        />
      ) : (
        <>
          <div className="flex h-full items-center justify-center">
            <span className="font-cormorant text-[10rem] leading-none text-ink-300 transition-colors duration-700 group-hover:text-ink-400">
              墨
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-ink-200/30" />
        </>
      )}
    </div>
  );
}

export function HomeFeatured() {
  const t = useTranslations("Home");
  const { data: popularPosts, isLoading } = api.post.getPopular.useQuery({ limit: 4 });

  if (isLoading) {
    return (
      <div className="mx-auto mt-20 max-w-6xl lg:mt-24">
        <FeaturedSkeleton />
      </div>
    );
  }

  if (!popularPosts || popularPosts.length === 0) {
    return null;
  }

  const [featured, ...rest] = popularPosts;
  if (!featured) return null;

  return (
    <div className="mx-auto mt-20 max-w-6xl lg:mt-24">
      <motion.div
        custom={0}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mb-7 flex items-baseline justify-between"
      >
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-500">
          {t("featuredLabel")}
        </span>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-500 transition-colors hover:text-ink-800"
        >
          {t("viewAll")}
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>

      {/* ── Horizontal magazine card ── */}
      <motion.article custom={1} variants={fade} initial="hidden" animate="show">
        <Link href={`/blog/${featured.slug}`} className="group grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <FeaturedCover post={featured} rankBadge={t("mostReadRank")} />
          </div>

          <div className="flex flex-col gap-5 lg:col-span-7">
            <div className="text-[11px] uppercase tracking-[0.18em] text-seal">
              {featured.category?.name ?? t("essayCategory")}
            </div>

            <h3 className="text-2xl font-light leading-snug tracking-tight text-ink-800 transition-colors group-hover:text-ink-900 lg:text-[1.9rem]">
              <span className="line-clamp-2">{featured.title}</span>
            </h3>

            {featured.excerpt ? (
              <p className="line-clamp-3 max-w-[36rem] text-base leading-relaxed text-ink-600">
                {featured.excerpt}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
              <span className="tabular-nums">{formatDate(featured.createdAt)}</span>
              <span className="size-0.5 rounded-full bg-ink-300" />
              <span className="font-medium text-seal tabular-nums">
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

      {/* ── Continue Reading: 4-column row, view count as anchor ── */}
      {rest.length > 0 ? (
        <div className="mt-12 border-t border-ink-300 pt-10">
          <motion.div
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mb-7 text-[11px] uppercase tracking-[0.2em] text-ink-500"
          >
            {t("continueReading")} · {t("byHeat")}
          </motion.div>

          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <motion.li
                key={post.id}
                custom={3 + i}
                variants={fade}
                initial="hidden"
                animate="show"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block border-l border-ink-300 pl-5 pr-4 transition-colors hover:border-seal"
                >
                  <div className="font-cormorant text-[1.6rem] leading-none text-ink-800 tabular-nums">
                    {post.viewCount ?? 0}
                  </div>
                  <div className="mb-3 mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-500">
                    {t("views")}
                  </div>
                  <div className="line-clamp-3 text-sm leading-relaxed text-ink-700 transition-colors group-hover:text-ink-900">
                    {post.title}
                  </div>
                  <div className="mt-2 text-[11px] tracking-wide text-ink-500">
                    {post.category?.name ? (
                      <span className="uppercase">{post.category.name}</span>
                    ) : null}
                    {post.category?.name ? " · " : ""}
                    <span className="tabular-nums">{formatDate(post.createdAt)}</span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
