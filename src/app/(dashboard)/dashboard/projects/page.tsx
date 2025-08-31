import { ProjectTable } from "@/components/dashboard/projects/project-table";
import { api, HydrateClient } from "@/trpc/server";
import React from "react";

const page = async () => {
  void api.project.getByPage.prefetch({
    page: 1,
    limit: 10,
  });

  return (
    <HydrateClient>
      <ProjectTable />
    </HydrateClient>
  );
};

export default page;
