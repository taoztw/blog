"use client";

import * as React from "react";
import { authClient } from "@/lib/auth/authClient";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PaginationComponent } from "@/components/pagination";
import { api } from "@/trpc/react";
import { BookOpen, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { JournalCard } from "./_components/journal-card";
import { JournalCommentPanel } from "./_components/journal-comment-panel";

const ITEMS_PER_PAGE = 50;

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAY_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function formatDateKey(date: Date) {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
  });
}

function formatDateLabel(date: Date) {
  return {
    en: `${MONTH_ABBR[date.getMonth()]} ${date.getDate()}`,
    cn: WEEKDAY_CN[date.getDay()] ?? "",
  };
}

export default function JournalsPage() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [commentPanelOpen, setCommentPanelOpen] = React.useState(false);
  const [activeCommentJournal, setActiveCommentJournal] = React.useState<{
    id: string;
    createdAt: Date;
  } | null>(null);

  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const { data, isLoading } = api.journal.getByPage.useQuery({
    page,
    limit: ITEMS_PER_PAGE,
  });

  const isAdmin = session?.user?.role === "admin";

  const handleEdit = (journal: { id: string; content: string }) => {
    router.push(`/dashboard/journals/${journal.id}`);
  };

  const handleOpenComments = (journal: { id: string; createdAt: Date }) => {
    setActiveCommentJournal(journal);
    setCommentPanelOpen(true);
  };

  const handleCreate = () => {
    router.push("/dashboard/journals/new");
  };

  // Group journals by date
  const groupedJournals = React.useMemo(() => {
    if (!data?.items) return [];

    const groups = data.items.reduce(
      (acc, journal) => {
        const date = new Date(journal.createdAt);
        const dateKey = formatDateKey(date);

        if (!acc[dateKey]) {
          acc[dateKey] = { date, items: [] };
        }
        acc[dateKey].items.push(journal);
        return acc;
      },
      {} as Record<string, { date: Date; items: typeof data.items }>
    );

    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data?.items]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8" />
            </div>
          ) : !data?.items || data.items.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="size-12 text-ink-400 mx-auto mb-4" />
              <p className="text-lg text-ink-600 mb-2">还没有任何日志</p>
              <p className="text-sm text-ink-500">
                {isAdmin ? "点击右下角按钮开始记录你的想法" : "管理员还未发布任何日志"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-14">
                {groupedJournals.map((group, groupIdx) => {
                  const { en, cn: weekday } = formatDateLabel(group.date);
                  const isLastGroup = groupIdx === groupedJournals.length - 1;
                  return (
                    <div key={group.date.toISOString()}>
                      {/* Day header with timeline dot */}
                      <div className="relative mb-7 flex items-baseline gap-3.5">
                        <span className="mt-1 size-[15px] shrink-0 rounded-full border-2 border-seal bg-background" />
                        <div>
                          <span className="font-cormorant text-[22px] font-medium tracking-wide text-ink-800">
                            {en}
                          </span>
                          <span className="ml-1.5 text-[13px] text-ink-500">· {weekday}</span>
                        </div>
                      </div>

                      {/* Timeline entries */}
                      <div>
                        {group.items.map((journal, idx) => (
                          <JournalCard
                            key={journal.id}
                            journal={journal}
                            onEdit={handleEdit}
                            onOpenComments={handleOpenComments}
                            isCommentsActive={
                              activeCommentJournal?.id === journal.id && commentPanelOpen
                            }
                            isLast={isLastGroup && idx === group.items.length - 1}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <PaginationComponent
                totalItems={data?.total ?? 0}
                itemsPerPage={ITEMS_PER_PAGE}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </div>

      {/* FAB - 新建日志 (admin only) */}
      {isAdmin && (
        <button
          onClick={handleCreate}
          aria-label="新建日志"
          className={cn(
            "group/fab fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full",
            "bg-ink-800 text-ink-50 shadow-lg shadow-ink-900/20",
            "transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-900 hover:shadow-xl hover:shadow-ink-900/25",
            "sm:bottom-8 sm:right-8"
          )}
        >
          <Plus className="size-6 stroke-[2.5]" />
          <span
            className={cn(
              "pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md px-3 py-1.5 text-sm",
              "bg-ink-800 text-ink-50 shadow-md",
              "opacity-0 translate-x-2 transition-all duration-200",
              "group-hover/fab:opacity-100 group-hover/fab:translate-x-0",
              "after:absolute after:left-full after:top-1/2 after:-translate-y-1/2",
              "after:border-[5px] after:border-transparent after:border-l-ink-800"
            )}
          >
            新建日志
          </span>
        </button>
      )}

      {/* Comment Panel */}
      <JournalCommentPanel
        open={commentPanelOpen}
        onOpenChange={(open) => {
          setCommentPanelOpen(open);
          if (!open) setActiveCommentJournal(null);
        }}
        journal={activeCommentJournal}
      />
    </>
  );
}
