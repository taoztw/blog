import { notFound } from "next/navigation";
import { api, HydrateClient } from "@/trpc/server";
import BlogView from "../_components/blog-view";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function page({ params }: PageProps) {
  const { slug } = await params;
  const postSlug = slug[0];

  if (!postSlug) {
    notFound();
  }

  let post: Awaited<ReturnType<typeof api.post.getBySlug>>;
  try {
    post = await api.post.getBySlug({ slug: postSlug });
  } catch {
    notFound();
  }

  return (
    <HydrateClient>
      <BlogView post={post} />
    </HydrateClient>
  );
}
