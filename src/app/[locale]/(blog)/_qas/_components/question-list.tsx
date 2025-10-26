"use client";

import { motion } from "framer-motion";
import SearchInput from "@/components/ui/search-input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { PaginationComponent } from "@/components/ui_custom/pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, ThumbsUp } from "lucide-react";

export function QuestionListPage() {
  const t = useTranslations("QAPage");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const sortBy = (searchParams.get("sortBy") as "newest" | "popular" | "unanswered" | "frequent") ?? "newest";
  const tagId = searchParams.get("tagId") ?? undefined;

  const [searchValue, setSearchValue] = useState(search);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== search) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", searchValue);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Get questions data
  const { data, isLoading } = api.question.getByPage.useQuery({
    page,
    limit: 10,
    search,
    sortBy,
    tagId,
  });

  const questions = data?.items ?? [];
  const totalItems = data?.total ?? 0;

  // Handle sort change
  const handleSortChange = (newSort: typeof sortBy) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSort);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div className="w-full min-w-0">
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <Button asChild>
                  <Link href={`${pathname}/ask`}>{t("askQuestion")}</Link>
                </Button>
              </div>

              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <SearchInput
                  value={searchValue}
                  onChange={(v) => setSearchValue(v)}
                  placeholder={t("search")}
                />
              )}
            </div>

            {/* Filter tabs */}
            <div className="mb-6 flex gap-2 border-b overflow-x-auto">
              <Button
                variant={sortBy === "newest" ? "default" : "ghost"}
                className="rounded-b-none"
                onClick={() => handleSortChange("newest")}
              >
                {t("filters.newest")}
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "ghost"}
                className="rounded-b-none"
                onClick={() => handleSortChange("popular")}
              >
                {t("filters.recommended")}
              </Button>
              <Button
                variant={sortBy === "frequent" ? "default" : "ghost"}
                className="rounded-b-none"
                onClick={() => handleSortChange("frequent")}
              >
                {t("filters.frequent")}
              </Button>
              <Button
                variant={sortBy === "unanswered" ? "default" : "ghost"}
                className="rounded-b-none"
                onClick={() => handleSortChange("unanswered")}
              >
                {t("filters.unanswered")}
              </Button>
            </div>

            {/* Questions list */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No questions found
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalItems > 10 && (
              <div className="mt-8">
                <PaginationComponent currentPage={page} totalItems={totalItems} pageSize={10} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">{t("hotNetwork")}</h2>
              <div className="space-y-3">
                {/* Placeholder for hot questions */}
                <p className="text-sm text-muted-foreground">Coming soon...</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">{t("popularTags")}</h2>
              <div className="space-y-3">
                {/* Placeholder for popular tags */}
                <p className="text-sm text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: any }) {
  const t = useTranslations("QAPage.stats");
  const locale = usePathname().split("/")[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
    >
      <Link href={`/${locale}/qas/${question.id}`} className="block">
        <h3 className="text-xl font-semibold mb-3 hover:text-primary transition-colors">
          {question.title}
        </h3>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag: any) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats and Author */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{question.upvotes - question.downvotes} {t("votes")}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.answers} {t("answers")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{question.viewCount} {t("views")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {question.author?.image && (
              <img
                src={question.author.image}
                alt={question.author.name || "User"}
                className="h-6 w-6 rounded-full"
              />
            )}
            <span>{question.author?.name}</span>
            <span>•</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
