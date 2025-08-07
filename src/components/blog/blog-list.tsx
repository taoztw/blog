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
import { BlogCard } from "../cards/post-card";
import type { PostWithRelations } from "@/global";
import image from "next/image";
import { title } from "process";
import { email } from "zod";

// 示例博客文章数据
export const blogPosts: PostWithRelations[] = [
  {
    id: "clx1a2b3c4d5e6f7g8h9i0j1",
    title: "AI-Powered Marketing: The Future of Customer Engagement",
    slug: "ai-powered-marketing-future",
    excerpt:
      "Explore how artificial intelligence is revolutionizing marketing strategies and creating personalized customer experiences at scale.",
    content: "Full content about AI-powered marketing...",
    imageUrl: "/placeholder.svg?height=200&width=300&text=AI+Marketing",
    status: "PUBLISHED",
    viewCount: 1247,
    likeCount: 89,
    createdById: "usr_123456789",
    categoryId: "1",
    author: {
      id: "usr_123456789",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      image: "/avatars/sarah-chen.jpg",
    },
    category: {
      id: 1,
      name: "Artificial Intelligence",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx2b3c4d5e6f7g8h9i0j1k2",
    title: "Building Brand Loyalty Through Social Media Storytelling",
    slug: "brand-loyalty-social-media",
    excerpt:
      "Discover the art of crafting compelling brand narratives that resonate with your audience and drive long-term loyalty.",
    content: "Full content about social media storytelling...",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Brand+Storytelling",
    status: "PUBLISHED",
    viewCount: 892,
    likeCount: 156,
    createdById: "usr_987654321",
    categoryId: "2",
    author: {
      id: "usr_987654321",
      name: "Marcus Rodriguez",
      email: "marcus.r@example.com",
      image: "/avatars/marcus-rodriguez.jpg",
    },
    category: {
      id: 2,
      name: "Social Media",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx3c4d5e6f7g8h9i0j1k2l3",
    title: "The Rise of Voice Commerce: Optimizing for Audio Shopping",
    slug: "voice-commerce-optimization",
    excerpt:
      "Learn how voice assistants are changing the e-commerce landscape and how to optimize your business for voice commerce.",
    content: "Full content about voice commerce...",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Voice+Commerce",
    status: "PUBLISHED",
    viewCount: 634,
    likeCount: 78,
    createdById: "usr_456789123",
    categoryId: "3",
    author: {
      id: "usr_456789123",
      name: "Emily Watson",
      email: "emily.watson@example.com",
      image: "/avatars/emily-watson.jpg",
    },
    category: {
      id: 3,
      name: "E-commerce",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx4d5e6f7g8h9i0j1k2l3m4",
    title: "Sustainable Marketing: Connecting with Eco-Conscious Consumers",
    slug: "sustainable-marketing-eco-conscious",
    excerpt:
      "Understand how sustainability messaging can differentiate your brand and attract environmentally conscious customers.",
    content: "Full content about sustainable marketing...",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Sustainable+Marketing",
    status: "PUBLISHED",
    viewCount: 1089,
    likeCount: 203,
    createdById: "usr_789123456",
    categoryId: "4",
    author: {
      id: "usr_789123456",
      name: "David Kim",
      email: "david.kim@example.com",
      image: "/avatars/david-kim.jpg",
    },
    category: {
      id: 4,
      name: "Sustainability",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx5e6f7g8h9i0j1k2l3m4n5",
    title: "Micro-Influencer Marketing: Quality Over Quantity",
    slug: "micro-influencer-marketing",
    excerpt:
      "Why partnering with micro-influencers often delivers better ROI than celebrity endorsements and how to find the right partners.",
    content: "Full content about micro-influencer marketing...",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Micro+Influencers",
    status: "PUBLISHED",
    viewCount: 756,
    likeCount: 124,
    createdById: "usr_321654987",
    categoryId: "2",
    author: {
      id: "usr_321654987",
      name: "Jessica Liu",
      email: "jessica.liu@example.com",
      image: "/avatars/jessica-liu.jpg",
    },
    category: {
      id: 2,
      name: "Social Media",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx6f7g8h9i0j1k2l3m4n5o6",
    title: "The Psychology of Color in Digital Marketing",
    slug: "color-psychology-digital-marketing",
    excerpt:
      "Explore how color choices impact consumer behavior and learn to use color psychology to improve your marketing effectiveness.",
    content: "Full content about color psychology...",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Color+Psychology",
    status: "DRAFT",
    viewCount: 0,
    likeCount: 0,
    createdById: "usr_654987321",
    categoryId: "5",
    author: {
      id: "usr_654987321",
      name: "Alex Thompson",
      email: "alex.thompson@example.com",
      image: "/avatars/alex-thompson.jpg",
    },
    category: {
      id: 5,
      name: "Design",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx7g8h9i0j1k2l3m4n5o6p7",
    title: "Cross-Platform Attribution: Measuring Modern Customer Journeys",
    slug: "cross-platform-attribution",
    excerpt:
      "Navigate the complexity of multi-touchpoint customer journeys and implement effective attribution models for better insights.",
    content: "Full content about cross-platform attribution...",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Attribution+Modeling",
    status: "PUBLISHED",
    viewCount: 1432,
    likeCount: 267,
    createdById: "usr_147258369",
    categoryId: null,
    author: {
      id: "usr_147258369",
      name: "Rachel Green",
      email: "rachel.green@example.com",
      image: "/avatars/rachel-green.jpg",
    },
    category: {
      id: 6,
      name: "Analytics",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx8h9i0j1k2l3m4n5o6p7q8",
    title: "Personalization at Scale: Dynamic Content Strategies",
    slug: "personalization-dynamic-content",
    excerpt: "Learn how to deliver personalized experiences to thousands of customers without losing the human touch.",
    content: "Full content about personalization strategies...",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Personalization",
    status: "PUBLISHED",
    viewCount: 923,
    likeCount: 178,
    createdById: "usr_963852741",
    categoryId: "1",
    author: {
      id: "usr_963852741",
      name: "Michael Chang",
      email: "michael.chang@example.com",
      image: null,
    },
    category: {
      id: 1,
      name: "Artificial Intelligence",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
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
          post.category.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  };

  // 获取热门文章
  // const trendingPosts = blogPosts.filter((post) => post.trending).slice(0, 3);

  // 获取最受欢迎的文章（按阅读时间排序）
  // const popularPosts = [...blogPosts]
  //   .sort((a, b) => Number.parseInt(b.readTime) - Number.parseInt(a.readTime))
  //   .slice(0, 2);

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
