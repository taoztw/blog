import { TagTable } from "./_components/tag-table";
import { api, HydrateClient } from "@/trpc/server";
import React from "react";

const page = async () => {
  void api.tag.getMany.prefetch({
    page: 1,
    limit: 10,
  });

  return (
    <HydrateClient>
      <TagTable />
    </HydrateClient>
  );
};

export default page;
