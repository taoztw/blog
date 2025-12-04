"use client";

import ProjectCard from "@/app/[locale]/(blog)/projects/_components/project-card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { api, type RouterOutputs } from "@/trpc/react";
import { IconFolderCode } from "@tabler/icons-react";

type Project = RouterOutputs["project"]["getAll"][number];

interface ProjectsGridProps {
  search?: string;
  categoryId?: string;
}

export function ProjectsGrid({ search, categoryId }: ProjectsGridProps) {
  const { data: projects, isLoading } = api.project.getAll.useQuery({
    search,
    categoryId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
            <div className="bg-gray-200 rounded h-4 mb-2"></div>
            <div className="bg-gray-200 rounded h-3 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFolderCode />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>还没有创建项目</EmptyDescription>
        </EmptyHeader>
        <EmptyContent></EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {projects.map((project: Project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
