import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { ExternalLink, GithubIcon } from "lucide-react";

const ProjectCard = () => {
  return (
    <Card className="group/card flex h-full flex-col overflow-hidden p-0 shadow-sm transition-shadow group-hover/card:shadow-md">
      <div className="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
        <Image
          src="/tmp/p1.jpg"
          alt="项目名称"
          fill
          className="object-cover transition-transform duration-300 group-hover/card:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge>前端</Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-base font-bold text-card-foreground group-hover/card:text-primary transition-colors">
          项目名称
        </CardTitle>
        <CardDescription className="text-muted-foreground line-clamp-4">
          项目信息的描述项目信息的描述项目信息的描述项目信息的描述
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">React</Badge>
          <Badge variant="outline">Next.js</Badge>
          <Badge variant="outline">TypeScript</Badge>
          <Badge variant="outline">Tailwind CSS</Badge>
          <Badge variant="outline">Tailwind CSS</Badge>
        </div>

        <div className="flex gap-2 pb-6">
          <Button asChild size="sm" className="flex-1">
            <Link href="_black">
              <GithubIcon className="mr-2 h-4 w-4" />
              Github
            </Link>
          </Button>

          <Button variant="outline" className="flex-1" asChild size="sm">
            <Link href="_black">
              <ExternalLink className="size-4 mr-2" />
              Blog Post
            </Link>
          </Button>

          <Button variant="outline" className="flex-1" asChild size="sm">
            <Link href="_black">
              <ExternalLink className="size-4 mr-2" />
              Blog Post
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
