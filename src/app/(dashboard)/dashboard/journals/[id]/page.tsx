"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { normalizeNodeId, type Value } from "platejs";
import { ArrowLeftIcon, CheckIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth/authClient";

/** Build the initial editor value from persisted content */
function buildInitialValue(content: string): Value {
  if (content) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeNodeId(parsed as Value);
      }
    } catch {
      // fall through to default
    }
  }

  // No content yet — seed with empty paragraph
  return normalizeNodeId([{ type: "p", children: [{ text: "" }] }]);
}

export default function JournalEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const journalId = params.id;

  const { data: session } = authClient.useSession();
  const { data: journalData, isLoading } = api.journal.getOne.useQuery({ id: journalId });

  const update = api.journal.update.useMutation();
  const deleteJournal = api.journal.delete.useMutation({
    onSuccess: () => {
      toast.success("日志已删除");
      router.push("/dashboard/journals");
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  const editorValueRef = React.useRef<Value | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const initialValue = React.useMemo<Value | undefined>(() => {
    if (!journalData) return undefined;
    return buildInitialValue(journalData.content);
  }, [journalData?.id]);

  const handleChange = (value: Value) => {
    editorValueRef.current = value;
  };

  const handleSave = React.useCallback(async () => {
    const value = editorValueRef.current;
    if (!value) return;
    setIsSaving(true);
    try {
      await update.mutateAsync({
        id: journalId,
        data: {
          content: JSON.stringify(value),
        },
      });
      setLastSaved(new Date());
    } catch (e: any) {
      toast.error("保存失败: " + e.message);
    } finally {
      setIsSaving(false);
    }
  }, [journalId, update]);

  // Cmd/Ctrl + S
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!journalData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">日志未找到</p>
      </div>
    );
  }

  const user = session?.user;
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";
  const createdDate = new Date(journalData.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-200 px-6">
          {/* Left: back */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/dashboard/journals")}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <span className="font-semibold text-foreground tracking-tight hidden sm:block">日志编辑</span>
            <span className="text-xs text-muted-foreground hidden md:block">{createdDate}</span>
          </div>

          {/* Center: save status */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <Spinner className="size-3" />
                <span>保存中...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckIcon className="size-3 text-success" />
                <span>
                  已保存{" "}
                  {lastSaved.toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </>
            ) : (
              <span>日志</span>
            )}
          </div>

          {/* Right: save, delete, avatar */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={handleSave}
              disabled={isSaving}
            >
              保存
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2Icon className="size-4" />
            </Button>
            <Avatar className="size-8 cursor-pointer">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ?? "user"}
              />
              <AvatarFallback className="text-xs bg-ink-300">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <PlateEditor
            initialValue={initialValue}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>你确定要删除这条日志吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJournal.mutate({ id: journalId })}
              disabled={deleteJournal.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteJournal.isPending ? (
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
