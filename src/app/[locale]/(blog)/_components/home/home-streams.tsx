"use client";

import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

function extractTextFromNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { text?: unknown; children?: unknown };
  if (typeof n.text === "string") return n.text;
  if (Array.isArray(n.children)) {
    return n.children.map(extractTextFromNode).join("");
  }
  return "";
}

function previewJournal(content: string): string {
  if (!content) return "";
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      const text = parsed.map(extractTextFromNode).join(" ").replace(/\s+/g, " ").trim();
      return text || "";
    }
  } catch {
    // Not JSON, treat as plain text
  }
  return content.replace(/\s+/g, " ").trim();
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </div>
  );
}

function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group mt-6 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-ink-800"
    >
      {label}
      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function JournalStream() {
  const t = useTranslations("Home");
  const { data } = api.journal.getByPage.useQuery({ page: 1, limit: 4 });
  const items = data?.items ?? [];

  return (
    <motion.div custom={0} variants={fade} initial="hidden" animate="show">
      <SectionLabel>{t("journalStreamLabel")}</SectionLabel>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noContent")}</p>
      ) : (
        <ul>
          {items.map((journal) => {
            const preview = previewJournal(journal.content);
            return (
              <li
                key={journal.id}
                className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0"
              >
                <span className="line-clamp-1 flex-1 text-[14px] text-ink-700">
                  {preview || t("noContent")}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatDate(journal.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <ViewAllLink href="/journals" label={t("viewAll")} />
    </motion.div>
  );
}

function ProjectsList() {
  const t = useTranslations("Home");
  const { data } = api.project.getAll.useQuery({});
  const items = (data ?? []).slice(0, 4);

  return (
    <motion.div custom={1} variants={fade} initial="hidden" animate="show">
      <SectionLabel>{t("projectsLabel")}</SectionLabel>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noContent")}</p>
      ) : (
        <ul>
          {items.map((project) => {
            const href = project.blogUrl ?? project.demoUrl ?? project.githubUrl ?? "/projects";
            const isExternal = href.startsWith("http");
            const Item = (
              <>
                <div className="text-[14px] text-ink-700 transition-colors group-hover:text-ink-900">
                  {project.title}
                </div>
                {project.description ? (
                  <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {project.description}
                  </div>
                ) : null}
              </>
            );
            return (
              <li
                key={project.id}
                className="border-b border-border py-3 last:border-0"
              >
                {isExternal ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    {Item}
                  </a>
                ) : (
                  <Link href={href} className="group block">
                    {Item}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ViewAllLink href="/projects" label={t("viewAll")} />
    </motion.div>
  );
}

export function HomeStreams() {
  return (
    <div className="mx-auto mt-20 max-w-6xl lg:mt-24">
      <Separator className="mb-16" />
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <JournalStream />
        <ProjectsList />
      </div>
    </div>
  );
}
