import React from "react";
import { blogPosts } from "@/lib/fake-data";
import { columns } from "@/components/dashboard/posts/columns";
import { DataTable } from "@/components/dashboard/posts/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const page = () => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">文章列表</h1>
        {/* <CreatePostDialog /> */}
        <Button variant="default" asChild className="bg-primary hover:bg-primary/90">
          <Link href={`/dashboard/posts/new`} className="text-white">
            创建新文章
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={blogPosts} />
    </div>
  );
};

export default page;
