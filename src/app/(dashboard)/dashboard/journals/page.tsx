import { JournalTable } from "./_components/journal-table";
import { api, HydrateClient } from "@/trpc/server";

const page = async () => {
  void api.journal.getByPage.prefetch({
    page: 1,
    limit: 100,
  });

  return (
    <HydrateClient>
      <JournalTable />
    </HydrateClient>
  );
};

export default page;
