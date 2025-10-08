import { CategoryTable } from "./_components/category-table";
import { api, HydrateClient } from "@/trpc/server";
import React from "react";

const page = async () => {
  void api.category.getMany.prefetch({
    limit: 10,
  });

  return (
    <HydrateClient>
      <CategoryTable />
    </HydrateClient>
  );
};

export default page;
