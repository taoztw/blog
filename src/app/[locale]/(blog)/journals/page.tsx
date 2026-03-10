"use client";

import * as React from "react";
import { authClient } from "@/lib/auth/authClient";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PaginationComponent } from "@/components/pagination";
import { api } from "@/trpc/react";
import { BookOpen, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { JournalCard } from "./_components/journal-card";
import { JournalCommentPanel } from "./_components/journal-comment-panel";
import { JournalEditorDialog } from "./_components/journal-editor-dialog";

const ITEMS_PER_PAGE = 50;

export default function JournalsPage() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingJournal, setEditingJournal] = React.useState<{
    id: string;
    content: string;
  } | null>(null);
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
  const utils = api.useUtils();

  const isAdmin = session?.user?.role === "admin";

  const createJournal = api.journal.create.useMutation({
    onSuccess: (result) => {
      void utils.journal.getByPage.invalidate();
      setEditingJournal({
        id: result.journal.id,
        content: result.journal.content,
      });
      setEditorOpen(true);
    },
    onError: (error) => {
      toast.error("创建失败: " + error.message);
    },
  });

  const handleEdit = (journal: { id: string; content: string }) => {
    setEditingJournal(journal);
    setEditorOpen(true);
  };

  const handleCloseDialog = () => {
    setEditorOpen(false);
    setEditingJournal(null);
  };

  const handleOpenComments = (journal: { id: string; createdAt: Date }) => {
    setActiveCommentJournal(journal);
    setCommentPanelOpen(true);
  };

  // Group journals by date
  const groupedJournals = React.useMemo(() => {
    if (!data?.items) return [];

    const groups = data.items.reduce(
      (acc, journal) => {
        const date = new Date(journal.createdAt);
        const dateKey = date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(journal);
        return acc;
      },
      {} as Record<string, typeof data.items>
    );

    return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [data?.items]);

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Admin action bar */}
        {isAdmin && (
          <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
            <div className="container mx-auto px-4 py-3 flex justify-end">
              <Button
                onClick={() =>
                  createJournal.mutate({
                    content: JSON.stringify([{ type: "p", children: [{ text: "" }] }]),
                  })
                }
                disabled={createJournal.isPending}
                size="sm"
              >
                {createJournal.isPending ? <Spinner className="size-4 mr-2" /> : <PlusCircle className="size-4 mr-2" />}
                新建日志
              </Button>
            </div>
          </header>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8" />
            </div>
          ) : !data?.items || data.items.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">还没有任何日志</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? '点击上方"新建日志"按钮开始记录你的想法' : "管理员还未发布任何日志"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-12">
                {groupedJournals.map(([date, journals]) => (
                  <div
                    key={date}
                    className="space-y-6"
                  >
                    {/* Date Header */}
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-medium text-foreground">{date}</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                    </div>

                    {/* Journal Cards */}
                    <div className="space-y-6">
                      {journals.map((journal) => (
                        <JournalCard
                          key={journal.id}
                          journal={journal}
                          onEdit={handleEdit}
                          onOpenComments={handleOpenComments}
                          isCommentsActive={activeCommentJournal?.id === journal.id && commentPanelOpen}
                        />
                      ))}
                    </div>
                  </div>
                ))}
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

      {/* Comment Panel */}
      <JournalCommentPanel
        open={commentPanelOpen}
        onOpenChange={(open) => {
          setCommentPanelOpen(open);
          if (!open) setActiveCommentJournal(null);
        }}
        journal={activeCommentJournal}
      />

      {/* Editor Dialog */}
      <JournalEditorDialog
        open={editorOpen}
        onOpenChange={handleCloseDialog}
        journal={editingJournal}
        onSuccess={handleCloseDialog}
      />
    </>
  );
}
