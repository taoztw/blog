import { PostTable } from "./_components/post-table";
import { api, HydrateClient } from "@/trpc/server";
import React from "react";

const page = async () => {
  void api.post.getMany.prefetch({
    limit: 100,
  });

  return (
    <HydrateClient>
      <PostTable />
    </HydrateClient>
  );
};

export default page;
