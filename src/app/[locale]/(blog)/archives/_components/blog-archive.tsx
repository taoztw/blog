"use client";

import LocalSearch from "@/components/LocalSearch";
import { PaginationComponent, getCurrentPageData } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type RouterOutputs } from "@/trpc/react";
import { Calendar, ExternalLink, FileText, Folder, FolderOpen, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Post = RouterOutputs["post"]["getByPage"]["items"][number];
type Project = RouterOutputs["project"]["getAll"][number];
type ProjectTag = Project["tags"][number];

// Content type definitions
type ContentType = "post" | "project";

interface ArchiveItem {
  id: string;
  title: string;
  description?: string | null;
  date: Date;
  type: ContentType;
  category?: {
    id: string;
    name: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    color?: string | null;
  }>;
  url: string;
}

const ITEMS_PER_PAGE = 8;
const contentTypes = ["全部", "文章", "项目"] as const;

export function BlogArchive() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize states from URL parameters
  const [selectedContentType, setSelectedContentType] = useState(() => {
    const typeParam = searchParams.get("type");
    return typeParam === "post" ? "文章" : typeParam === "project" ? "项目" : "全部";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") || "全部");
  const [selectedTag, setSelectedTag] = useState(() => searchParams.get("tag") || "全部");

  const currentPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("query") || "";

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Content type
    if (selectedContentType === "文章") {
      params.set("type", "post");
    } else if (selectedContentType === "项目") {
      params.set("type", "project");
    } else {
      params.delete("type");
    }

    // Category
    if (selectedCategory !== "全部") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    // Tag
    if (selectedTag !== "全部") {
      params.set("tag", selectedTag);
    } else {
      params.delete("tag");
    }

    // Reset page when filters change
    params.delete("page");

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [selectedContentType, selectedCategory, selectedTag, router]);

  // Fetch data
  const { data: postsData, isLoading: isLoadingPosts } = api.post.getByPage.useQuery({
    page: 1,
    limit: 100, // Get all published posts
  });

  const { data: projects, isLoading: isLoadingProjects } = api.project.getAll.useQuery({
    search: searchQuery || undefined,
  });

  const posts = postsData?.items || [];

  const isLoading = isLoadingPosts || isLoadingProjects;

  // Transform data into unified format
  const allItems: ArchiveItem[] = useMemo(() => {
    const postItems: ArchiveItem[] = (posts || []).map((post: Post) => ({
      id: post.id,
      title: post.title,
      description: post.excerpt,
      date: post.createdAt,
      type: "post" as const,
      category: post.category,
      tags: post.tags || [],
      url: `/blog/${post.slug}`,
    }));

    const projectItems: ArchiveItem[] = (projects || []).map((project: Project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      date: project.createdAt,
      type: "project" as const,
      category: null, // Projects don't have categories in the current schema
      tags: project.tags?.map((pt: ProjectTag) => pt.tag) || [],
      url: `${project.blogUrl}`,
    }));

    return [...postItems, ...projectItems];
  }, [posts, projects]);

  const { paginatedItems, totalItems, availableCategories, availableTags } = useMemo(() => {
    // Filter data
    const filtered = allItems.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesContentType =
        selectedContentType === "全部" ||
        (selectedContentType === "文章" && item.type === "post") ||
        (selectedContentType === "项目" && item.type === "project");

      const matchesCategory = selectedCategory === "全部" || (item.category && item.category.name === selectedCategory);

      const matchesTag = selectedTag === "全部" || item.tags.some((tag) => tag.name === selectedTag);

      return matchesSearch && matchesContentType && matchesCategory && matchesTag;
    });

    // Sort by date (newest first)
    const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get paginated data
    const paginatedData = getCurrentPageData(sorted, currentPage, ITEMS_PER_PAGE);

    // Group by year and month
    const grouped = paginatedData.reduce(
      (acc, item) => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const month = date.toLocaleDateString("zh-CN", { month: "long" });

        if (!acc[year]) {
          acc[year] = {};
        }
        if (!acc[year][month]) {
          acc[year][month] = [];
        }
        acc[year][month].push(item);
        return acc;
      },
      {} as Record<number, Record<string, ArchiveItem[]>>
    );

    // Sort years and months
    const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
    const result = sortedYears.map((year) => {
      const yearData = grouped[Number(year)];
      if (!yearData) return { year: Number(year), months: [] };

      return {
        year: Number(year),
        months: Object.keys(yearData).map((month) => ({
          month,
          items: yearData[month] || [],
        })),
      };
    });

    // Get available categories and tags from filtered data
    const uniqueCategories = Array.from(
      new Set(filtered.filter((item) => item.category).map((item) => item.category!.name))
    );
    const uniqueTags = Array.from(new Set(filtered.flatMap((item) => item.tags.map((tag) => tag.name))));

    return {
      paginatedItems: result,
      totalItems: filtered.length,
      availableCategories: ["全部", ...uniqueCategories],
      availableTags: ["全部", ...uniqueTags],
    };
  }, [allItems, searchQuery, selectedContentType, selectedCategory, selectedTag, currentPage]);

  const handleContentTypeChange = (type: string) => {
    setSelectedContentType(type);
    setSelectedCategory("全部"); // Reset category when changing content type
    setSelectedTag("全部"); // Reset tag when changing content type
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
  };

  const getItemIcon = (item: ArchiveItem) => {
    if (item.type === "post") {
      return FileText;
    }
    if (item.type === "project") {
      return FolderOpen;
    }
    return Folder;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Title Row */}
          <div className="flex items-center gap-4">
            <h1 className="font-cormorant text-3xl font-medium text-ink-800 dark:text-ink-200 tracking-wide">
              内容归档
            </h1>
            {!isLoading && (
              <Badge
                variant="outline"
                className="text-sm border-border text-muted-foreground bg-transparent"
              >
                {totalItems} 项内容
              </Badge>
            )}
          </div>

          {/* Search and Filters Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <LocalSearch
                route="/archive"
                placeholder="搜索内容..."
                otherClasses="bg-muted border-border"
              />
            </div>

            {/* Content Type Filter */}
            <Select
              value={selectedContentType}
              onValueChange={handleContentTypeChange}
            >
              <SelectTrigger
                size="sm"
                className="w-[120px] bg-muted border-border text-xs"
              >
                <SelectValue placeholder="内容类型" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-xs"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            {availableCategories.length > 1 && (
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger
                  size="sm"
                  className="w-[140px] bg-muted border-border text-xs"
                >
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-xs"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Tag Filter */}
            {availableTags.length > 1 && (
              <Select
                value={selectedTag}
                onValueChange={handleTagChange}
              >
                <SelectTrigger
                  size="sm"
                  className="w-[140px] bg-muted border-border text-xs"
                >
                  <SelectValue placeholder="选择标签" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableTags.map((tag) => (
                    <SelectItem
                      key={tag}
                      value={tag}
                      className="text-xs"
                    >
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Spinner className="size-8" />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {totalItems > 0 && (
            <div className="mb-8 text-sm text-muted-foreground font-light">
              显示第 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}{" "}
              项，共 {totalItems} 项内容
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-12">
            {paginatedItems.map(({ year, months }) => (
              <div
                key={year}
                className="relative"
              >
                {/* Year Header */}
                <div className="sticky top-32 z-10 mb-10 bg-background/95 backdrop-blur py-3">
                  <h2 className="font-cormorant text-5xl font-light text-foreground flex items-center gap-3">
                    <Calendar className="h-7 w-7 text-seal/60" />
                    <span className="tracking-wider">{year}</span>
                  </h2>
                </div>

                {/* Months */}
                <div className="space-y-10 pl-10 relative">
                  {/* Timeline gradient line */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-seal/30 via-border to-transparent"></div>
                  {months.map(({ month, items }) => (
                    <div
                      key={month}
                      className="relative"
                    >
                      {/* Month indicator */}
                      <div className="absolute -left-[1.6rem] top-1 flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full bg-seal/20 border-2 border-seal shadow-sm"></div>
                        <div className="absolute h-2 w-2 rounded-full bg-seal animate-pulse"></div>
                      </div>

                      {/* Month header */}
                      <h3 className="text-lg font-medium text-foreground mb-6 tracking-wide">{month}</h3>

                      {/* Items */}
                      <div className="space-y-4">
                        {(items || []).map((item) => {
                          const IconComponent = getItemIcon(item);
                          return (
                            <Link
                              key={item.id}
                              href={item.url}
                              className="block group"
                            >
                              <article className="relative pb-5 border-b border-border hover:border-seal/30 transition-all duration-300 cursor-pointer">
                                {/* Decorative corner accent */}
                                <div className="absolute -left-10 top-0 w-8 h-[2px] bg-gradient-to-r from-seal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="flex items-start gap-4 mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="mt-1 p-2 rounded-lg bg-muted group-hover:bg-seal/10 transition-colors duration-300">
                                      <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-seal transition-colors duration-300" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <h4 className="text-lg font-medium text-foreground group-hover:text-seal transition-colors duration-300 line-clamp-2 flex-1 leading-relaxed">
                                        {item.title}
                                      </h4>
                                      <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                                        <time className="flex items-center gap-1.5 text-xs text-muted-foreground font-light">
                                          <Calendar className="h-3.5 w-3.5" />
                                          {new Date(item.date).toLocaleDateString("zh-CN")}
                                        </time>
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-seal transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                      </div>
                                    </div>

                                    {item.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed font-light">
                                        {item.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2.5 py-0.5 border-border text-muted-foreground bg-transparent font-light"
                                      >
                                        {item.type === "post" ? "文章" : "项目"}
                                      </Badge>

                                      {item.category && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-2.5 py-0.5 border-seal/30 text-seal bg-seal/5 font-light"
                                        >
                                          {item.category.name}
                                        </Badge>
                                      )}

                                      {item.tags.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Tag className="h-3 w-3 text-muted-foreground" />
                                          <div className="flex gap-1.5 flex-wrap">
                                            {item.tags.slice(0, 2).map((tag) => (
                                              <Badge
                                                key={tag.id}
                                                variant="outline"
                                                className="text-xs px-2 py-0.5 border-border text-muted-foreground bg-muted/50 font-light"
                                              >
                                                {tag.name}
                                              </Badge>
                                            ))}
                                            {item.tags.length > 2 && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs px-2 py-0.5 border-border text-muted-foreground bg-muted/50 font-light"
                                              >
                                                +{item.tags.length - 2}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </article>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <PaginationComponent
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />

          {/* Empty State */}
          {paginatedItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-2 font-light">没有找到匹配的内容</div>
              <div className="text-sm text-muted-foreground font-light">尝试调整搜索关键词或选择不同的筛选条件</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
