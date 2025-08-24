"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, TrendingUp, ChevronRightIcon, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import type { PostWithRelations } from "@/global";
import { getTimeStamp } from "@/lib/utils";
import { ImageService } from "../dashboard/upload/image-service";
import { usePathname } from "next/navigation";

interface BlogCardProps {
  post: PostWithRelations;
}

export function BlogCard({ post }: BlogCardProps) {
  const pathname = usePathname();
  const blogUrl = `${pathname}/${post.id}/${post.slug}`;
  return (
    // <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
    <article key={post.id} className="group flex flex-col gap-4 py-5 sm:flex-row">
      {/* 图片区域 */}
      <div className="flex-none sm:w-1/4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md">
          <Image
            alt={post.title}
            loading="lazy"
            decoding="async"
            data-nimg="fill"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              inset: "0px",
              color: "transparent",
            }}
            sizes="100vw"
            src={post.imageUrl ? ImageService.getImageUrl(post.imageUrl) : "/placeholder.svg"}
            fill
          />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex flex-col sm:w-3/4">
        {/* 分类和元数据 */}
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
            {post.category!.name}
          </Badge>
          {/* {post.trending && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )} */}
        </div>

        {/* 标题 */}
        <h3 className="group-hover:text-primary/80 mb-1 text-base font-semibold transition-colors">
          <Link href={blogUrl} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>

        {/* 摘要 */}
        <p className="text-muted-foreground mb-2 line-clamp-2 text-sm leading-relaxed dark:text-gray-400">
          {post.excerpt}
        </p>

        {/* 底部元数据 */}
        <div className="text-muted-foreground mt-auto flex items-center text-xs ">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{getTimeStamp(post.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>2分钟</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{post.viewCount}</span>
            </div>
          </div>
          <div className="ml-auto">
            <Link href={blogUrl}>
              <Button
                variant="ghost"
                className="text-muted-foreground/80 h-auto text-xs group/btn font-normal hover:text-muted-foreground"
              >
                Read
                <ChevronRightIcon className="opacity-60 w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
    // </motion.div>
  );
}
