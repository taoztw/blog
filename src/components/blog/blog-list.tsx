"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SearchInput from "../ui/search-input";
import { BlogCard } from "./blog-card";

// 示例博客文章数据
const blogPosts = [
  {
    id: "email-marketing-automation",
    title: "10 Email Marketing Automation Workflows Every Business Needs",
    excerpt:
      "Implement these essential automation workflows to save time and boost your email marketing effectiveness.",
    image: "/placeholder.svg?height=200&width=300&text=Email+Marketing",
    category: "Email",
    categoryColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    date: "April 22, 2023",
    readTime: "7 min read",
    trending: true,
    slug: "email-marketing-automation",
  },
  {
    id: "content-distribution-guide",
    title: "The Complete Guide to Content Distribution Strategies",
    excerpt:
      "Creating great content is only half the battle. Learn how to effectively distribute your content for maximum impact.",
    image: "/placeholder.svg?height=200&width=300&text=Content+Strategy",
    category: "Content",
    categoryColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    date: "April 20, 2023",
    readTime: "9 min read",
    trending: false,
    slug: "content-distribution-guide",
  },
  {
    id: "data-driven-conversion-methods",
    title: "5 Data-Driven Methods to Improve Your Conversion Rates",
    excerpt:
      "Use these proven analytical approaches to identify and fix conversion bottlenecks in your marketing funnel.",
    image: "/placeholder.svg?height=200&width=300&text=Analytics+Dashboard",
    category: "Analytics",
    categoryColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    date: "April 18, 2023",
    readTime: "8 min read",
    trending: false,
    slug: "data-driven-conversion-methods",
  },
  {
    id: "customer-journey-mapping",
    title: "Building a Customer Journey Map That Actually Drives Results",
    excerpt: "Learn how to create actionable customer journey maps that improve user experience and boost conversions.",
    image: "/placeholder.svg?height=200&width=300&text=Customer+Journey",
    category: "Strategy",
    categoryColor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    date: "April 15, 2023",
    readTime: "11 min read",
    trending: true,
    slug: "customer-journey-mapping",
  },
  {
    id: "mobile-first-marketing",
    title: "Mobile-First Marketing: Strategies for a Mobile-Dominated World",
    excerpt:
      "Discover how to optimize your marketing strategies for mobile users and capitalize on the mobile-first trend.",
    image: "/placeholder.svg?height=200&width=300&text=Mobile+Marketing",
    category: "Mobile",
    categoryColor: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    date: "April 5, 2023",
    readTime: "6 min read",
    trending: true,
    slug: "mobile-first-marketing",
  },
  {
    id: "psychology-of-pricing",
    title: "The Psychology of Pricing: Strategies for Marketers",
    excerpt: "Understand the psychological principles behind pricing and how to use them to increase your revenue.",
    image: "/placeholder.svg?height=200&width=300&text=Pricing+Psychology",
    category: "Psychology",
    categoryColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    date: "March 28, 2023",
    readTime: "10 min read",
    trending: false,
    slug: "psychology-of-pricing",
  },
];

export function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);

  // 搜索功能
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredPosts(blogPosts);
    } else {
      const filtered = blogPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          post.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  };

  // 获取热门文章
  const trendingPosts = blogPosts.filter((post) => post.trending).slice(0, 3);

  // 获取最受欢迎的文章（按阅读时间排序）
  const popularPosts = [...blogPosts]
    .sort((a, b) => Number.parseInt(b.readTime) - Number.parseInt(a.readTime))
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* 主内容区域 */}
          <div className="lg:col-span-2">
            {/* 页面标题 */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Latest Posts</h2>
              <SearchInput />
            </div>

            {/* 文章列表 */}
            <div className="space-y-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </div>

            {/* 加载更多按钮 */}
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" className="bg-transparent">
                Load More Articles
              </Button>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="pl-4 lg:pl-8">
            <div className="sticky top-8 space-y-8 bg-amber-100 w-full h-[100px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
