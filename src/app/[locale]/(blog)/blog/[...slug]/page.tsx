import { api, HydrateClient } from "@/trpc/server";
import BlogView from "../_components/blog-view";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function page({ params }: PageProps) {
  const { slug } = await params;
  const postSlug = slug[0]; // 使用 slug 而不是 id

  if (!postSlug) {
    return <div>文章未找到</div>;
  }

  const post = await api.post.getBySlug({ slug: postSlug });
  return (
    <HydrateClient>
      <BlogView post={post} />
    </HydrateClient>
  );
}
