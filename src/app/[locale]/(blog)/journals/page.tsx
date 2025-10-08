"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { MarkdownPreview } from "@/components/mardown-preview";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

export default function JournalsPage() {
  const t = useTranslations("JournalPage");
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const [page, setPage] = useState(1);

  const { data, isLoading, fetchNextPage, hasNextPage } = api.journal.getByPage.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
    }
  );

  const journals = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href={`/${locale}/journals/create`}>{t("createJournal")}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t("noJournals")}</p>
            <Button asChild>
              <Link href={`/${locale}/journals/create`}>{t("createJournal")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {journals.map((journal) => (
                <JournalCard key={journal.id} journal={journal} />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-8 text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  variant="outline"
                >
                  {t("loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function JournalCard({ journal }: { journal: any }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card p-6 space-y-4"
    >
      {/* Image */}
      {journal.imageUrl && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={journal.imageUrl}
            alt="Journal image"
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose max-w-none dark:prose-invert">
        <MarkdownPreview content={journal.content} />
      </div>

      {/* Author and Date */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-3">
          {journal.author?.image && (
            <img
              src={journal.author.image}
              alt={journal.author.name || "User"}
              className="h-8 w-8 rounded-full"
            />
          )}
          <div>
            <div className="font-semibold text-sm">{journal.author?.name}</div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(journal.createdAt).toLocaleDateString()}
        </div>
      </div>
    </motion.article>
  );
}
