import { UserTable } from "./_components/user-table";
import { api, HydrateClient } from "@/trpc/server";
import React from "react";

const page = async () => {
  void api.user.getAll.prefetch({
    page: 1,
    pageSize: 10,
  });

  return (
    <HydrateClient>
      <UserTable />
    </HydrateClient>
  );
};

export default page;
