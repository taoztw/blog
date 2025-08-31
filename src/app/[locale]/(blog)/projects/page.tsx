import ProjectCard from "@/components/cards/project-card";
import CommonFilter from "@/components/filter/commonFilter";
import { FilterCarousel } from "@/components/filter/filter-carousel";
import LocalSearch from "@/components/search/LocalSearch";
import { Badge } from "@/components/ui/badge";
import { ProjectFilters } from "@/constants/filters";
import ROUTES from "@/constants/routes";
import React from "react";

const page = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 dark:text-gray-50">Projects</h1>
        <p className="text-lg text-muted-foreground">A showcase of my work and collaborations.</p>
      </div>

      {/* Search section */}
      <div className="flex flex-col lg:flex-row justify-between items-center mt-5">
        <section className="">
          <LocalSearch route={ROUTES.PROJECTS} placeholder="Search projects..." otherClasses="" />
        </section>

        <div className="flex">
          <FilterCarousel data={ProjectFilters} value="all" />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
      </div>
    </div>
  );
};

export default page;
