"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { MarkdownPreview } from "./post-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle, Share2, Eye, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { LikeButton } from "../ui_custom/like-button";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { api } from "@/trpc/react";
import GithubSlugger from "github-slugger";
import type { Post } from "@/global";

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface PostSectionProps {
  post: Post;
}

export const PostSection = ({ post }: PostSectionProps) => {
  const [activeId, setActiveId] = useState("");
  // console.log(post);
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
  const slugger = new GithubSlugger();
  const share = () => {
    // 分享 复制当前链接
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success("链接已复制到剪贴板");
      })
      .catch((err) => {
        toast.error("复制链接失败，请手动复制");
      });
  };
  const toc: TableOfContentsItem[] = useMemo(() => {
    const lines = post.content.split("\n");
    const items: TableOfContentsItem[] = [];
    const idCountMap: Record<string, number> = {};
    let inCodeBlock = false;

    for (const line of lines) {
      // 检查代码块开始/结束
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) continue; // 代码块中跳过

      const match = /^(#{1,6})\s+(.+)$/.exec(line);
      if (match) {
        const level = match[1]!.length;
        const text = match[2]!.trim();
        // let id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-");
        let id = slugger.slug(text);
        // 确保 ID 唯一
        if (idCountMap[id]) {
          idCountMap[id] = (idCountMap[id] ?? 0) + 1;
          id = `${id}-${idCountMap[id]}`;
        } else {
          idCountMap[id] = 1;
        }

        items.push({ id, text, level });
      }
    }

    return items;
  }, [post.content]);
  return (
    <>
      <div className="lg:col-span-3">
        {/* 文章头部 */}
        <div className="mb-8">
          <h1 className="text-xl lg:text-2xl font-bold mb-4">{post.title}</h1>
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
                {123}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <LikeButton initialCount={post.likeCount} />
              <Button variant="ghost" onClick={() => share()}>
                <Share2 className="h-4 w-4 text-gray-900/80 cursor-pointer" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{post.category?.name}</Badge>
          </div>
        </div>

        {/* Markdown 内容 */}
        <MarkdownPreview content={post.content} className="max-w-none" />

        <div className="flex flex-col space-y-2 mt-8">
          <Separator />
          <div className="flex gap-3 items-center justify-end">
            <LikeButton initialCount={post.likeCount} />
            <Button variant="ghost" onClick={() => share()}>
              <Share2 className="h-4 w-4 text-gray-900/80 cursor-pointer" />
            </Button>
          </div>
          <Separator />
        </div>
      </div>

      {/* 右侧目录 */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">目录</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={cn(
                      "block text-sm rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground",
                      activeId === item.id && "bg-accent text-accent-foreground font-medium",
                      item.level === 2 && "pl-4",
                      item.level === 3 && "pl-6"
                    )}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
