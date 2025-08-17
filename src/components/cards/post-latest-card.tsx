import { CalendarIcon, ArrowRightIcon, Calendar, ClockPlus, Eye, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import type { PostWithRelations } from "@/global";
import { getTimeStamp } from "@/lib/utils";

interface PostLatestCardProps {
  post: PostWithRelations;
}

const PostLatestCard = ({ post }: PostLatestCardProps) => {
  return (
    <div key={post.id} className="carousel-item w-full flex-none snap-start px-2 sm:w-1/2 sm:px-4 lg:w-1/3">
      <Card className="flex h-full flex-col overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-40 overflow-hidden sm:h-48 md:h-52">
          <Image
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
            loading="lazy"
            decoding="async"
            data-nimg="fill"
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary hover:bg-primary/90 text-white">{post.category!.name}</Badge>
          </div>
        </div>
        <CardContent className="flex-grow">
          <div className="flex items-center space-x-4 text-xs sm:mb-3 text-muted-foreground">
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
          <h3 className="mb-2 line-clamp-2 text-base font-semibold sm:text-base text-primary/90 hover:text-primary">
            {post.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-xs sm:line-clamp-3 sm:text-sm">{post.excerpt}</p>
        </CardContent>
        <CardFooter className="pb-6">
          <Button variant="ghost" size="sm" className="w-full text-sm" asChild>
            <Link href="#" className="flex items-center justify-center text-muted-foreground hover:text-primary/90">
              Read Article
              {/* <ArrowRightIcon className="ml-1 h-4 w-4" /> */}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PostLatestCard;
