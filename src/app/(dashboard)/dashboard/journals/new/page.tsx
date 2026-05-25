"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { normalizeNodeId, type Value } from "platejs";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth/authClient";

const EMPTY_VALUE: Value = normalizeNodeId([{ type: "p", children: [{ text: "" }] }]);

export default function NewJournalPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const utils = api.useUtils();

  const create = api.journal.create.useMutation({
    onSuccess: (result) => {
      void utils.journal.getByPage.invalidate();
      router.replace(`/dashboard/journals/${result.journal.id}`);
    },
    onError: (error) => {
      toast.error("保存失败: " + error.message);
    },
  });

  const editorValueRef = React.useRef<Value | null>(null);

  const handleChange = (value: Value) => {
    editorValueRef.current = value;
  };

  const handleSave = React.useCallback(() => {
    const value = editorValueRef.current ?? EMPTY_VALUE;
    create.mutate({ content: JSON.stringify(value) });
  }, [create]);

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

  const user = session?.user;
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

  return (
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
          <span className="font-semibold text-foreground tracking-tight hidden sm:block">新建日志</span>
          <span className="text-xs text-muted-foreground hidden md:block">未保存</span>
        </div>

        {/* Center: status */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {create.isPending ? (
            <>
              <Spinner className="size-3" />
              <span>保存中...</span>
            </>
          ) : (
            <span>草稿</span>
          )}
        </div>

        {/* Right: save, avatar */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={handleSave}
            disabled={create.isPending}
          >
            保存
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
        <PlateEditor initialValue={EMPTY_VALUE} onChange={handleChange} />
      </div>
    </div>
  );
}
