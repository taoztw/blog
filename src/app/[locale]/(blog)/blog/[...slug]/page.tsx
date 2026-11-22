import { notFound } from "next/navigation";
import { collectHeadings, loadDocument, withoutTitle } from "@/components/tiptap/document";
import { TiptapContent } from "@/components/tiptap/tiptap-content";
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

  // 正文在服务端渲染好再交给客户端组件；旧的 Plate 格式由 loadDocument 即时转换
  const loaded = loadDocument(post.content);
  const doc = loaded ? withoutTitle(loaded) : null;

  return (
    <HydrateClient>
      <BlogView
        post={post}
        content={doc ? <TiptapContent doc={doc} /> : undefined}
        headings={doc ? collectHeadings(doc) : []}
      />
    </HydrateClient>
  );
}
