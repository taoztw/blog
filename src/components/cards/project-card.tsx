import type { ProjectWithRelations } from "@/global";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

interface ProjectCardProps {
  project: ProjectWithRelations;
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    frontend: "前端",
    backend: "后端",
    mobile: "移动端",
    tool: "工具",
    ai: "AI",
    other: "其他",
  };
  return typeMap[type] || type;
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  // 获取标签列表
  const tagNames = project.tags?.map((pt) => pt.tag.name) || [];

  // 准备链接按钮
  const links = [
    project.githubUrl && {
      href: project.githubUrl,
      label: "GitHub",
      icon: Github,
    },
    project.demoUrl && {
      href: project.demoUrl,
      label: "Live Demo",
      icon: ExternalLink,
    },
    project.blogUrl && {
      href: project.blogUrl,
      label: "Blog Post",
      icon: ExternalLink,
    },
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;

  return (
    <Card className="group/card flex h-full flex-col overflow-hidden p-0 shadow-sm transition-shadow group-hover/card:shadow-md">
      <div className="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge>{getTypeLabel(project.category?.name || "other")}</Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-base font-bold text-card-foreground group-hover/card:text-primary transition-colors">
          {project.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground line-clamp-3">{project.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* 标签 */}
        {tagNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tagNames.slice(0, 4).map((tagName, index) => (
              <Badge key={index} variant="outline">
                {tagName}
              </Badge>
            ))}
            {tagNames.length > 4 && <Badge variant="outline">+{tagNames.length - 4}</Badge>}
          </div>
        )}
      </CardContent>
      <CardFooter className="pb-4">
        {/* 链接按钮 */}
        {links.length > 0 && (
          <div className="flex gap-2">
            {links.slice(0, 2).map((link, index) => {
              const Icon = link.icon;
              return (
                <Button key={index} asChild size="sm" variant={index === 0 ? "default" : "outline"} className="flex-1">
                  <Link href={link.href} target="_blank" rel="noopener noreferrer">
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
            {links.length > 2 && (
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={links[2]!.href} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  More
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
