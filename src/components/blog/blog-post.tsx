"use client";

import { useState, useEffect, useRef } from "react";
import { MarkdownPreview } from "./post-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Calendar, User, MessageCircle, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [toc, setToc] = useState<TableOfContentsItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [comments] = useState<Comment[]>([
    {
      id: "1",
      author: "张三",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "这篇文章写得很好，学到了很多东西！",
      timestamp: "2小时前",
      likes: 12,
    },
    {
      id: "2",
      author: "李四",
      content: "感谢分享，对我的项目很有帮助。",
      timestamp: "5小时前",
      likes: 8,
    },
    {
      id: "3",
      author: "王五",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "期待更多这样的技术文章！",
      timestamp: "1天前",
      likes: 15,
    },
  ]);

  const contentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  // Extract table of contents from markdown content
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: TableOfContentsItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1]!.length;
      const text = match[2]!.trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-");

      headings.push({ id, text, level });
    }

    setToc(headings);
  }, [content]);

  // Handle scroll events for reading progress and active TOC item
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      // Find active heading
      const headings = contentRef.current.querySelectorAll("h1, h2, h3, h4, h5, h6");
      let activeHeading = "";

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          activeHeading = heading.id;
        }
      });

      setActiveId(activeHeading);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Modify content to add IDs to headings
  const contentWithIds = content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-");
    return `${hashes} ${text} {#${id}}`;
  });

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Here you would typically submit to your backend
      console.log("New comment:", newComment);
      setNewComment("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-1 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                收藏
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                分享
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{publishDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readTime}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Article Content */}
            <div ref={contentRef} className="prose prose-slate dark:prose-invert max-w-none">
              <MarkdownPreview content={contentWithIds} />
            </div>

            {/* Comments Section */}
            <div className="mt-16 pt-8 border-t">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                评论 ({comments.length})
              </h3>

              {/* Comment Form */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <Textarea
                    placeholder="写下你的想法..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-4"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                      发表评论
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{comment.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-muted-foreground text-sm">{comment.timestamp}</span>
                          </div>
                          <p className="text-foreground mb-3">{comment.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                              <Heart className="h-4 w-4" />
                              {comment.likes}
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
          </div>

          {/* Table of Contents Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">目录</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav ref={tocRef} className="space-y-2">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={cn(
                          "block w-full text-left text-sm py-2 px-3 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                          activeId === item.id && "bg-accent text-accent-foreground font-medium",
                          item.level === 1 && "font-medium",
                          item.level === 2 && "pl-4",
                          item.level === 3 && "pl-6",
                          item.level === 4 && "pl-8",
                          item.level === 5 && "pl-10",
                          item.level === 6 && "pl-12"
                        )}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
