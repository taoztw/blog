"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Calendar, Tag, ExternalLink, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaginationComponent, getCurrentPageData } from "@/components/ui_custom/pagination";

// Mock data for blog posts
const blogPosts = [
  {
    id: 1,
    title: "构建现代化的React应用",
    description: "深入探讨React 18的新特性，包括并发渲染、Suspense和服务端组件的最佳实践。",
    date: "2024-03-15",
    category: "前端开发",
    tags: ["React", "JavaScript", "前端"],
    readTime: "8分钟",
    url: "/blog/modern-react-app",
  },
  {
    id: 2,
    title: "Next.js 14性能优化指南",
    description: "全面介绍Next.js 14的性能优化技巧，从代码分割到图片优化的完整解决方案。",
    date: "2024-03-08",
    category: "全栈开发",
    tags: ["Next.js", "性能优化", "Web开发"],
    readTime: "12分钟",
    url: "/blog/nextjs-performance",
  },
  {
    id: 3,
    title: "TypeScript高级类型系统",
    description: "掌握TypeScript的高级类型特性，提升代码质量和开发效率。",
    date: "2024-02-28",
    category: "编程语言",
    tags: ["TypeScript", "类型系统", "开发工具"],
    readTime: "15分钟",
    url: "/blog/typescript-advanced",
  },
  {
    id: 4,
    title: "微服务架构设计模式",
    description: "探索微服务架构的核心设计模式，包括服务发现、负载均衡和容错机制。",
    date: "2024-02-20",
    category: "系统架构",
    tags: ["微服务", "架构设计", "后端"],
    readTime: "20分钟",
    url: "/blog/microservices-patterns",
  },
  {
    id: 5,
    title: "CSS Grid与Flexbox布局对比",
    description: "详细对比CSS Grid和Flexbox的使用场景，帮助你选择最适合的布局方案。",
    date: "2024-01-25",
    category: "前端开发",
    tags: ["CSS", "布局", "响应式设计"],
    readTime: "10分钟",
    url: "/blog/css-grid-flexbox",
  },
  {
    id: 6,
    title: "Docker容器化最佳实践",
    description: "从基础到进阶的Docker使用指南，包括镜像优化和多阶段构建。",
    date: "2024-01-18",
    category: "DevOps",
    tags: ["Docker", "容器化", "部署"],
    readTime: "18分钟",
    url: "/blog/docker-best-practices",
  },
  {
    id: 7,
    title: "GraphQL API设计指南",
    description: "学习如何设计高效的GraphQL API，包括Schema设计和查询优化。",
    date: "2023-12-15",
    category: "后端开发",
    tags: ["GraphQL", "API设计", "后端"],
    readTime: "14分钟",
    url: "/blog/graphql-api-design",
  },
  {
    id: 8,
    title: "Vue 3组合式API深度解析",
    description: "深入理解Vue 3的组合式API，掌握响应式系统和生命周期的新特性。",
    date: "2023-12-08",
    category: "前端开发",
    tags: ["Vue.js", "组合式API", "前端框架"],
    readTime: "16分钟",
    url: "/blog/vue3-composition-api",
  },
];

const categories = ["全部", "前端开发", "后端开发", "全栈开发", "系统架构", "DevOps", "编程语言"];

const POSTS_PER_PAGE = 5;

export function BlogArchive() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const currentPage = Number.parseInt(searchParams.get("page") || "1", 10);

  const { paginatedPosts, totalPosts, filteredPosts } = useMemo(() => {
    // 先过滤数据
    const filtered = blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "全部" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 按日期排序
    const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const paginatedData = getCurrentPageData(sorted, currentPage, POSTS_PER_PAGE);

    // 按年月分组
    const grouped = paginatedData.reduce(
      (acc, post) => {
        const date = new Date(post.date);
        const year = date.getFullYear();
        const month = date.toLocaleDateString("zh-CN", { month: "long" });

        if (!acc[year]) {
          acc[year] = {};
        }
        if (!acc[year][month]) {
          acc[year][month] = [];
        }
        acc[year][month].push(post);
        return acc;
      },
      {} as Record<number, Record<string, typeof blogPosts>>
    );

    // 排序年份和月份
    const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
    const result = sortedYears.map((year) => ({
      year: Number(year),
      months: Object.keys(grouped[Number(year)]).map((month) => ({
        month,
        posts: grouped[Number(year)][month],
      })),
    }));

    return {
      paginatedPosts: result,
      totalPosts: filtered.length,
      filteredPosts: sorted, // 返回完整的过滤后数据用于分页组件
    };
  }, [searchTerm, selectedCategory, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">博客归档</h1>
              <Badge variant="secondary" className="text-sm">
                {totalPosts} 篇文章
              </Badge>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索文章..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {totalPosts > 0 && (
          <div className="mb-6 text-sm text-muted-foreground">
            显示第 {(currentPage - 1) * POSTS_PER_PAGE + 1} - {Math.min(currentPage * POSTS_PER_PAGE, totalPosts)}{" "}
            篇，共 {totalPosts} 篇文章
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-12">
          {paginatedPosts.map(({ year, months }) => (
            <div key={year} className="relative">
              {/* Year Header */}
              <div className="sticky top-20 z-10 mb-8 bg-background/95 backdrop-blur py-2">
                <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
                  <Calendar className="h-8 w-8" />
                  {year}
                </h2>
              </div>

              {/* Months */}
              <div className="space-y-8 pl-8 border-l-2 border-border">
                {months.map(({ month, posts }) => (
                  <div key={month} className="relative">
                    {/* Month indicator */}
                    <div className="absolute -left-10 top-0 h-4 w-4 rounded-full bg-primary border-4 border-background"></div>

                    {/* Month header */}
                    <h3 className="text-xl font-semibold text-foreground mb-4">{month}</h3>

                    {/* Posts */}
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <Card
                          key={post.id}
                          className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                  {post.title}
                                </CardTitle>
                                <CardDescription className="mt-2 text-sm leading-relaxed">
                                  {post.description}
                                </CardDescription>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(post.date).toLocaleDateString("zh-CN")}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {post.readTime}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {post.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                                <div className="flex gap-1">
                                  {post.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {post.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{post.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <PaginationComponent totalItems={totalPosts} itemsPerPage={POSTS_PER_PAGE} />

        {/* Empty State */}
        {paginatedPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">没有找到匹配的文章</div>
            <div className="text-sm text-muted-foreground">尝试调整搜索关键词或选择不同的分类</div>
          </div>
        )}
      </div>
    </div>
  );
}
