import { api, HydrateClient } from "@/trpc/server";
import { ProjectTable } from "./_components/project-table";

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
