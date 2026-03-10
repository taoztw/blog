"use client";

import { LikeButton } from "@/components/like-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorStatic } from "@/components/ui/editor-static";
import { Separator } from "@/components/ui/separator";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import type { Post } from "@/global";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import GithubSlugger from "github-slugger";
import { Calendar, Eye, MessageCircle, Share2 } from "lucide-react";
import { createSlateEditor } from "platejs";
import type { Value } from "platejs";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface PostSectionProps {
  post: Post;
}

const HEADING_TYPES: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

function extractText(node: any): string {
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join("");
  }
  return "";
}

export const PostSection = ({ post }: PostSectionProps) => {
  const createPostView = api.post.createView.useMutation();

  useEffect(() => {
    createPostView.mutate(
      { postId: post.id },
      {
        onSuccess: () => {
          console.log("Post view created successfully");
        },
        onError: (error) => {
          console.error("Failed to create post view:", error);
        },
      }
    );
  }, []);

  const share = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success("链接已复制到剪贴板");
      })
      .catch(() => {
        toast.error("复制链接失败，请手动复制");
      });
  };

  const parsedContent = useMemo<Value | null>(() => {
    try {
      const parsed = JSON.parse(post.content);
      if (Array.isArray(parsed)) return parsed as Value;
    } catch {
      // Not JSON
    }
    return null;
  }, [post.content]);

  const contentWithoutFirstH1 = useMemo<Value | null>(() => {
    if (!parsedContent) return null;
    let removed = false;
    return parsedContent.filter((node) => {
      if (!removed && (node as any).type === "h1") {
        removed = true;
        return false;
      }
      return true;
    }) as Value;
  }, [parsedContent]);

  const editor = useMemo(() => {
    if (!contentWithoutFirstH1) return null;
    return createSlateEditor({
      plugins: BaseEditorKit,
      value: contentWithoutFirstH1,
    });
  }, [contentWithoutFirstH1]);

  return (
    <>
      {/* 文章头部 */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-xl lg:text-3xl font-bold">{post.title}</h1>
          <Badge variant="secondary">{post.category?.name}</Badge>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-muted-foreground mb-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.updatedAt).toISOString().slice(0, 10)}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {post.viewCount}
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {post.commentCount}
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <LikeButton
              initialCount={post.likeCount}
              postId={post.id}
            />
            <Button
              variant="ghost"
              onClick={() => share()}
            >
              <Share2 className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </Button>
          </div>
        </div>
      </div>

      {/* 文章内容 */}
      {editor ? (
        <EditorStatic
          editor={editor}
          variant="none"
          className="w-full text-base"
        />
      ) : (
        <p className="text-muted-foreground">暂无内容</p>
      )}

      <div className="flex flex-col space-y-2 mt-8">
        <Separator />
        <div className="flex gap-3 items-center justify-end">
          <LikeButton
            initialCount={post.likeCount}
            postId={post.id}
          />
          <Button
            variant="ghost"
            onClick={() => share()}
          >
            <Share2 className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </Button>
        </div>
        <Separator />
      </div>
    </>
  );
};

export const PostTableOfContents = ({ post }: PostSectionProps) => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const parsedContent = useMemo<Value | null>(() => {
    try {
      const parsed = JSON.parse(post.content);
      if (Array.isArray(parsed)) return parsed as Value;
    } catch {
      // Not JSON
    }
    return null;
  }, [post.content]);

  const toc: TableOfContentsItem[] = useMemo(() => {
    if (!parsedContent) return [];

    const slugger = new GithubSlugger();
    const items: TableOfContentsItem[] = [];

    for (const node of parsedContent) {
      const level = HEADING_TYPES[(node as any).type];
      if (level && level >= 2) {
        const text = extractText(node);
        if (text) {
          const id = slugger.slug(text);
          items.push({ id, text, level });
        }
      }
    }

    return items;
  }, [parsedContent]);

  if (toc.length === 0) return null;

  return (
    <div className="sticky top-24 space-y-4">
      <div className="border-l-1 border-ink-300 pl-4">
        <h3 className="text-base text-ink-600 mb-3 flex items-center gap-2">目录</h3>
        <nav className="space-y-0.5">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "group relative block text-sm rounded-md px-3 py-2 transition-all duration-200",
                "hover:bg-seal/5 hover:text-seal",
                activeId === item.id ? "bg-seal/10 text-seal font-medium" : "text-ink-700",
                item.level === 3 && "pl-6",
                item.level === 4 && "pl-9",
                item.level > 4 && "pl-12"
              )}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};
