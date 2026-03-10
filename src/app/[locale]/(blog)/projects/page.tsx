import { ProjectsGrid } from "@/app/[locale]/(blog)/projects/_components/projects-grid";
import { FilterCarousel } from "@/components/filter/filter-carousel";
import LocalSearch from "@/components/LocalSearch";
import ROUTES from "@/constants/routes";
import { api, HydrateClient, type RouterOutputs } from "@/trpc/server";
import type { Metadata } from "next";
import { Suspense } from "react";

type Category = RouterOutputs["category"]["getAll"][number];

export const metadata: Metadata = {
  title: "Projects | My Portfolio",
  description: "A showcase of my work and collaborations. Explore my frontend, backend, mobile, and AI projects.",
  keywords: ["projects", "portfolio", "web development", "frontend", "backend", "mobile app", "AI"],
  openGraph: {
    title: "Projects | My Portfolio",
    description: "A showcase of my work and collaborations. Explore my frontend, backend, mobile, and AI projects.",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
  }>;
}

const page = async ({ searchParams }: PageProps) => {
  const { search, categoryId } = await searchParams;

  // Prefetch data for SSR
  void api.project.getAll.prefetch({
    search,
    categoryId: categoryId || "all",
  });

  // 获取categories作为筛选器数据
  const categories = await api.category.getAll();

  // 构建项目筛选器数据
  const projectFilters = [
    { label: "全部", value: "all" },
    ...categories.map((category: Category) => ({
      label: category.name,
      value: category.id,
    })),
  ];

  return (
    <HydrateClient>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Search section */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <section>
              <LocalSearch
                route={ROUTES.PROJECTS}
                placeholder="Search projects..."
                otherClasses=""
              />
            </section>
            <div className="flex">
              <FilterCarousel
                data={projectFilters}
                value={categoryId || "all"}
              />
            </div>
          </div>

          <div className="border-b border-border mt-4" />

          {/* Projects Grid */}
          <Suspense fallback={<ProjectsGridSkeleton />}>
            <ProjectsGrid
              search={search}
              categoryId={categoryId}
            />
          </Suspense>
        </div>
      </div>
    </HydrateClient>
  );
};

function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
        >
          <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
          <div className="bg-gray-200 rounded h-4 mb-2"></div>
          <div className="bg-gray-200 rounded h-3 w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export default page;
