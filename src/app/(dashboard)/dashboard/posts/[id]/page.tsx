"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { normalizeNodeId, type TElement, type Value } from "platejs";
import { ArrowLeftIcon, CheckIcon, MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth/authClient";
import { PublishDialog } from "./publish-dialog";

/** Extract plain text from the first h1 node in the editor value */
function extractTitle(value: Value): string {
  const first = value[0] as TElement | undefined;
  if (!first || first.type !== "h1") return "";
  return (first.children as Array<{ text?: string }>)
    .map((c) => c.text ?? "")
    .join("");
}

/** Build the initial editor value from persisted title + content */
function buildInitialValue(title: string, content: string): Value {
  // If we have persisted JSON content, use it as-is (title is embedded as h1)
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

  // No content yet — seed the editor with the title (or empty h1) + empty paragraph
  return normalizeNodeId([
    { type: "h1", children: [{ text: title ?? "" }] },
    { type: "p", children: [{ text: "" }] },
  ]);
}

export default function PostEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params.id;

  const locale = useLocale();
  const { data: session } = authClient.useSession();
  const { data: postData, isLoading, refetch } = api.post.getOneForEdit.useQuery({ id: postId });

  const update = api.post.update.useMutation();
  const updateWithTags = api.post.updateWithTags.useMutation();

  const editorValueRef = React.useRef<Value | null>(null);
  const [showPublish, setShowPublish] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  // Derived title — read from editor value for PublishDialog preview
  const [previewTitle, setPreviewTitle] = React.useState("");

  const initialValue = React.useMemo<Value | undefined>(() => {
    if (!postData) return undefined;
    return buildInitialValue(postData.title, postData.content);
  }, [postData?.id]); // only re-compute when post ID changes, not on every save

  const handleChange = (value: Value) => {
    editorValueRef.current = value;
    // Keep preview title in sync for PublishDialog
    setPreviewTitle(extractTitle(value));
  };

  const handleSave = React.useCallback(async () => {
    const value = editorValueRef.current;
    if (!value) return;
    const title = extractTitle(value);
    setIsSaving(true);
    try {
      await update.mutateAsync({
        id: postId,
        data: {
          title: title || undefined,
          content: JSON.stringify(value),
        },
      });
      setLastSaved(new Date());
    } catch (e: any) {
      toast.error("保存失败: " + e.message);
    } finally {
      setIsSaving(false);
    }
  }, [postId, update]);

  const handlePublish = async (data: {
    slug: string;
    excerpt: string;
    categoryId?: string;
    tagIds: string[];
    imageUrl?: string | null;
    status: string;
  }) => {
    const value = editorValueRef.current;
    const title = value ? extractTitle(value) : postData?.title ?? "";
    await updateWithTags.mutateAsync({
      id: postId,
      data: {
        title: title || undefined,
        content: value ? JSON.stringify(value) : undefined,
        slug: data.slug,
        excerpt: data.excerpt,
        categoryId: data.categoryId,
        tagIds: data.tagIds,
        imageUrl: data.imageUrl ?? undefined,
        status: data.status,
      },
    });
    toast.success(data.status === "published" ? "文章已发布" : "草稿已保存");
    if (data.status === "published") {
      router.push(`/${locale}/blog/${data.slug}`);
    } else {
      await refetch();
    }
  };

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

  if (!postData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">文章未找到</p>
      </div>
    );
  }

  const user = session?.user;
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";
  const isPublished = postData.status === "published";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Medium-style header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-200 px-6">
        {/* Left: back */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard/posts")}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <span className="font-semibold text-foreground tracking-tight hidden sm:block">
            文章编辑
          </span>
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
            <span>{isPublished ? "已发布" : "草稿"}</span>
          )}
        </div>

        {/* Right: save, publish, avatar */}
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
            size="sm"
            className="rounded-full bg-[#1a8917] hover:bg-[#0f730c] text-white text-sm px-4"
            onClick={() => setShowPublish(true)}
          >
            发布
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
          <Avatar className="size-8 cursor-pointer">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "user"} />
            <AvatarFallback className="text-xs bg-ink-300">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Editor — title is the first h1 block, no separate input */}
      <div className="flex-1 overflow-hidden">
        <PlateEditor minimal initialValue={initialValue} onChange={handleChange} />
      </div>

      {/* Publish dialog */}
      <PublishDialog
        open={showPublish}
        onOpenChange={setShowPublish}
        postId={postId}
        title={previewTitle || postData.title}
        currentData={{
          slug: postData.slug,
          excerpt: postData.excerpt,
          categoryId: postData.categoryId,
          imageUrl: postData.imageUrl,
          tagIds: postData.tags.map((t) => t.id),
        }}
        onPublish={handlePublish}
      />
    </div>
  );
}
