"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { createJournalColumns } from "./columns";
import type { RouterOutputs } from "@/trpc/react";

type Journal = RouterOutputs["journal"]["getByPage"]["items"][number];

export function JournalTable() {
  const [deleteJournal, setDeleteJournal] = React.useState<Journal | null>(null);
  const router = useRouter();
  const utils = api.useUtils();
  const { data, isFetching } = api.journal.getByPage.useQuery({
    page: 1,
    limit: 100
  });

  const deleteMutation = api.journal.delete.useMutation({
    onSuccess: () => {
      void utils.journal.getByPage.invalidate();
      toast.success("日志已删除");
      setDeleteJournal(null);
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  const columns = React.useMemo(
    () =>
      createJournalColumns({
        onEdit: (journal) => router.push(`/dashboard/journals/${journal.id}`),
        onDelete: (journal) => setDeleteJournal(journal),
      }),
    [router],
  );

  const { table } = useDataTable({
    data: data?.items ?? [],
    columns,
  });

  if (isFetching && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">日志列表</h1>
        </div>
        <DataTableSkeleton columnCount={6} rowCount={10} filterCount={1} />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">日志列表</h1>
          <Button onClick={() => router.push("/dashboard/journals/new")}>
            <PlusCircle className="size-4 mr-2" />
            新建日志
          </Button>
        </div>

        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJournal} onOpenChange={(open) => !open && setDeleteJournal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要删除这条日志吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJournal && deleteMutation.mutate({ id: deleteJournal.id })}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  删除中...
                </>
              ) : (
                "删除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
