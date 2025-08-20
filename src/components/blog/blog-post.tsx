"use client";

import { useState, useMemo, useEffect } from "react";
import { MarkdownPreview } from "./post-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, User, MessageCircle, Heart, Share2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { LikeButton } from "../ui_custom/like-button";
import { toast } from "sonner";
import { Separator } from "../ui/separator";

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface ArticlePageProps {
  title: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  tags: string[];
  onBack?: () => void;
}

export function BlogPostPage({ title, content, author, publishDate, readTime, tags, onBack }: ArticlePageProps) {
  const [activeId, setActiveId] = useState("");
  const [newComment, setNewComment] = useState("");

  const [comments] = useState<Comment[]>([
    { id: "1", author: "张三", avatar: "", content: "这篇文章写得很好", timestamp: "2小时前", likes: 12 },
    { id: "2", author: "李四", avatar: "", content: "感谢分享", timestamp: "5小时前", likes: 8 },
  ]);

  // 生成 TOC（和 rehype-slug 一致）
  const toc: TableOfContentsItem[] = useMemo(() => {
    const regex = /^(#{1,6})\s+(.+)$/gm;
    const items: TableOfContentsItem[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const level = match[1]!.length;
      const text = match[2]!.trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-");
      items.push({ id, text, level });
    }
    return items;
  }, [content]);

  // IntersectionObserver 监听高亮
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

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      console.log("新评论:", newComment);
      setNewComment("");
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 主内容 */}
        <div className="lg:col-span-3">
          {/* 文章头部 */}
          <div className="mb-8">
            <h1 className="text-xl lg:text-2xl font-bold mb-4">{title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-4 text-muted-foreground mb-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {publishDate}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {123}
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {123}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <LikeButton />
                <Button variant="ghost" onClick={() => share()}>
                  <Share2 className="h-4 w-4 text-gray-900/80 cursor-pointer" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Markdown 内容 */}
          <MarkdownPreview content={content} className="max-w-none" />

          <div className="flex flex-col space-y-2 mt-8">
            <Separator />
            <div className="flex gap-3 items-center justify-end">
              <LikeButton />
              <Button variant="ghost" onClick={() => share()}>
                <Share2 className="h-4 w-4 text-gray-900/80 cursor-pointer" />
              </Button>
            </div>
            <Separator />
          </div>

          {/* 评论区 */}
          <div className="mt-16 pt-8 border-t">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="h-6 w-6" /> 评论 ({comments.length})
            </h3>
            <Card className="mb-8">
              <CardContent className="pt-6">
                <Textarea
                  placeholder="写下你的想法..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                    发表评论
                  </Button>
                </div>
              </CardContent>
            </Card>

            {comments.map((c) => (
              <Card key={c.id} className="mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={c.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{c.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex gap-2">
                        <span className="font-medium">{c.author}</span>
                        <span className="text-sm text-muted-foreground">{c.timestamp}</span>
                      </div>
                      <p className="mt-2">{c.content}</p>
                      <div className="flex gap-4 mt-3">
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                          <Heart className="w-4 h-4" /> {c.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          回复
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
      </div>
    </div>
  );
}
