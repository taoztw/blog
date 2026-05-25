"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { normalizeNodeId, type TElement, type Value } from "platejs";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth/authClient";

const EMPTY_VALUE: Value = normalizeNodeId([
  { type: "h1", children: [{ text: "" }] },
  { type: "p", children: [{ text: "" }] },
]);

function extractTitle(value: Value): string {
  const first = value[0] as TElement | undefined;
  if (!first || first.type !== "h1") return "";
  return (first.children as Array<{ text?: string }>).map((c) => c.text ?? "").join("");
}

export default function NewPostPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const utils = api.useUtils();

  const createDraft = api.post.createDraft.useMutation();
  const update = api.post.update.useMutation();

  const editorValueRef = React.useRef<Value | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleChange = (value: Value) => {
    editorValueRef.current = value;
  };

  const handleSave = React.useCallback(async () => {
    const value = editorValueRef.current ?? EMPTY_VALUE;
    const title = extractTitle(value);
    setIsSaving(true);
    try {
      const created = await createDraft.mutateAsync();
      await update.mutateAsync({
        id: created.post.id,
        data: {
          title: title || undefined,
          content: JSON.stringify(value),
        },
      });
      void utils.post.getMany.invalidate();
      router.replace(`/dashboard/posts/${created.post.id}`);
    } catch (e: any) {
      toast.error("保存失败: " + e.message);
      setIsSaving(false);
    }
  }, [createDraft, update, router, utils]);

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
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-200 px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard/posts")}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <span className="font-semibold text-foreground tracking-tight hidden sm:block">新建文章</span>
          <span className="text-xs text-muted-foreground hidden md:block">未保存</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isSaving ? (
            <>
              <Spinner className="size-3" />
              <span>保存中...</span>
            </>
          ) : (
            <span>草稿</span>
          )}
        </div>

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
          <Avatar className="size-8 cursor-pointer">
            <AvatarImage
              src={user?.image ?? undefined}
              alt={user?.name ?? "user"}
            />
            <AvatarFallback className="text-xs bg-ink-300">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <PlateEditor initialValue={EMPTY_VALUE} onChange={handleChange} />
      </div>
    </div>
  );
}
