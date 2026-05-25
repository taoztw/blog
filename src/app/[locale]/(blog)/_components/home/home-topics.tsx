"use client";

import { api } from "@/trpc/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export function HomeTopics() {
  const t = useTranslations("Home");
  const { data } = api.tag.getWithPostCounts.useQuery();

  const topics = useMemo(() => {
    const list = (data ?? []).filter((tag) => Number(tag.postCount) > 0);
    return list.slice(0, 14).map((tag) => ({
      id: tag.id,
      name: tag.name,
      count: Number(tag.postCount),
    }));
  }, [data]);

  if (topics.length === 0) return null;

  return (
    <section className="mx-auto mt-20 max-w-6xl lg:mt-24">
      <header className="mb-7 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-500">
          {t("topicsLabel")}
        </span>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-500 transition-colors hover:text-ink-800"
        >
          {t("allTags")}
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/blog?tag=${encodeURIComponent(topic.name)}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-ink-300 px-3.5 py-1.5 text-[13px] text-ink-700 transition-colors hover:border-seal hover:text-seal"
          >
            <span>{topic.name}</span>
            <span className="text-[11px] text-ink-400 tabular-nums group-hover:text-seal/70">
              {topic.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
