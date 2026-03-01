"use client";

import { AnimatedNumber, AnimatedNumberK } from "@/components/animated-number";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { api, type RouterOutputs } from "@/trpc/react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type RecentPost = RouterOutputs["post"]["getRecent"][number];

/* ── animation helpers ── */
const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

function useGreeting() {
  const t = useTranslations("Home");
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 6) greeting = t("lateNight");
  else if (hour < 12) greeting = t("morning");
  else if (hour < 18) greeting = t("afternoon");
  else greeting = t("evening");

  return { greeting, time };
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

export function HeroV2() {
  const t = useTranslations("Home");
  const { greeting, time } = useGreeting();
  const { data: stats, isLoading: statsLoading } = api.post.getStatistics.useQuery();
  const { data: recentPosts } = api.post.getRecent.useQuery({ limit: 5 });

  return (
    <section className="relative pb-20 pt-12 lg:pt-20">
      {/* ── Hero ── */}
      <div className="mx-auto max-w-3xl">
        {/* Greeting line */}
        <motion.p
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mb-4 text-sm tracking-wide text-muted-foreground"
        >
          {greeting}，{time}
        </motion.p>

        {/* Name — display font */}
        <motion.h1
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
          className="text-5xl font-extralight tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        >
          Tz
          <span className="text-seal">.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground"
        >
          {t("subtitle")}
        </motion.p>

        {/* Stats + CTA row */}
        <motion.div
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-wrap items-center gap-6"
        >
          {/* CTAs */}
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("viewBlog")}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-ink-200 dark:hover:bg-ink-700"
          >
            {t("viewProjects")}
          </Link>

          {/* Inline stats */}
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              {statsLoading ? (
                <Spinner className="size-3.5" />
              ) : (
                <span className="font-medium text-foreground">
                  <AnimatedNumber value={stats?.totalPosts ?? 0} />
                </span>
              )}
              {t("posts")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {statsLoading ? (
                <Spinner className="size-3.5" />
              ) : (
                <span className="font-medium text-foreground">
                  <AnimatedNumberK value={stats?.totalViews ?? 0} />
                </span>
              )}
              {t("views")}
            </span>
          </div>
        </motion.div>
      </div>

      <Separator className="mx-auto mt-16 max-w-3xl" />

      {/* ── Recent Posts ── */}
      <motion.div
        custom={4}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mx-auto mt-12 max-w-3xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">{t("recentPosts")}</h2>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("viewAll")}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="divide-y divide-border">
          {recentPosts?.map((post: RecentPost, i: number) => (
            <motion.li
              key={post.id}
              custom={5 + i}
              variants={fade}
              initial="hidden"
              animate="show"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-center justify-between gap-4 py-4 transition-colors"
              >
                <span className="line-clamp-1 text-[15px] text-ink-700 transition-colors group-hover:text-foreground dark:text-ink-400 dark:group-hover:text-ink-200">
                  {post.title}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatDate(post.createdAt)}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.div>

    </section>
  );
}
