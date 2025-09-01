"use client";

import { api } from "@/trpc/react";
import ProjectCard from "@/components/cards/project-card";
import { type } from "os";

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
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {search || type !== "all" ? "Try adjusting your search or filters" : "No projects have been published yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
