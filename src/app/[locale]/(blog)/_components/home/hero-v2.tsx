"use client";

import { AnimatedNumber, AnimatedNumberK } from "@/components/animated-number";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HomeFeatured } from "./home-featured";
import { HomeStreams } from "./home-streams";

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

export function HeroV2() {
  const t = useTranslations("Home");
  const { greeting, time } = useGreeting();
  const { data: stats, isLoading: statsLoading } = api.post.getStatistics.useQuery();

  return (
    <section className="relative pb-24 pt-12 lg:pt-20">
      {/* ── Identity Hero ── */}
      <div className="mx-auto max-w-3xl">
        <motion.p
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mb-4 text-sm tracking-wide text-muted-foreground"
        >
          {greeting}，{time}
        </motion.p>

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

        <motion.p
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-wrap items-center gap-6"
        >
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("viewBlog")}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-ink-200"
          >
            {t("viewProjects")}
          </Link>

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

      {/* ── Featured + Continue Reading ── */}
      <HomeFeatured />

      {/* ── Journal Stream + Projects ── */}
      <HomeStreams />
    </section>
  );
}
