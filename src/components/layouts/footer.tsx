"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Rss,
  Heart,
  Code,
  Coffee,
  MapPin,
  Calendar,
  ExternalLink,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ColaIcon } from "../icons/Cola";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/taoztw",
      color: "hover:text-gray-900 dark:hover:text-gray-100",
    },
    {
      name: "Email",
      icon: Mail,
      href: "mailto:tztw4723@gmail.com",
      color: "hover:text-red-500",
    },
    {
      name: "RSS",
      icon: Rss,
      href: "/rss.xml",
      color: "hover:text-orange-500",
    },
  ];

  const quickLinks = [
    { name: "首页", href: "/" },
    { name: "博客", href: "/blog" },
    { name: "分类", href: "/categories" },
    { name: "标签", href: "/tags" },
    { name: "归档", href: "/archive" },
    { name: "关于", href: "/about" },
  ];

  const categories = [
    { name: "Next.js", href: "/categories/nextjs", count: 24 },
    { name: "React", href: "/categories/react", count: 32 },
    { name: "AI & ML", href: "/categories/ai", count: 18 },
    { name: "TypeScript", href: "/categories/typescript", count: 15 },
    { name: "Node.js", href: "/categories/nodejs", count: 12 },
  ];

  const friendLinks = [
    { name: "Clouflare", href: "https://www.cloudflare.com/", description: "部署平台" },
    { name: "Next.js", href: "https://nextjs.org", description: "React 框架" },
    { name: "Tailwind CSS", href: "https://tailwindcss.com", description: "CSS 框架" },
    { name: "shadcn/ui", href: "https://ui.shadcn.com", description: "UI 组件库" },
  ];

  return (
    <footer className="border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* 主要内容区域 */}

        <Separator className="my-8" />

        {/* 友情链接 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">友情链接</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {friendLinks.map((link) => (
              <Link key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="group">
                <Card className="p-3 hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-gray-900/80 dark:group-hover:text-gray-100/80">
                        {link.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{link.description}</div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400 " />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* 底部信息 */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span>© 2025 Tz Blog</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center space-x-1">
              <span>Made with Next.js & Cloudflare</span>
              {/* <Heart className="w-4 h-4 text-red-500" />
              <span>and</span>
              <ColaIcon size={18} /> */}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              隐私政策
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              使用条款
            </Link> */}
            <Separator orientation="vertical" className="h-4" />
            <Link href="/rss.xml" className="hover:text-orange-500 transition-colors flex items-center space-x-1">
              <Rss className="w-4 h-4" />
              <span>RSS</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
