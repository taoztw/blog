import BlogView from "@/components/blog/blog-view";
import { api, HydrateClient } from "@/trpc/server";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function page({ params }: PageProps) {
  const { slug } = await params;
  const id = slug[0]; // 假设第一个部分是文章 ID

  if (!id) {
    return <div>文章未找到</div>;
  }

  const post = await api.post.getOne({ id });
  return (
    <HydrateClient>
      <BlogView post={post} />
    </HydrateClient>
  );
}
