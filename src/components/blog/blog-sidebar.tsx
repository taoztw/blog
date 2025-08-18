"use client";

import Link from "next/link";

export function BlogSidebar() {
  const popularPosts = [
    { id: 1, title: "React 18 新特性深度解析", date: "2024-01-15", readTime: "5分钟" },
    { id: 2, title: "TypeScript 最佳实践指南", date: "2024-01-10", readTime: "8分钟" },
    { id: 3, title: "Next.js 性能优化技巧", date: "2024-01-05", readTime: "6分钟" },
  ];

  const categories = [
    { name: "技术", count: 12 },
    { name: "学习", count: 8 },
    { name: "生活", count: 5 },
    { name: "思考", count: 3 },
  ];

  const tags = ["React", "TypeScript", "Next.js", "JavaScript", "CSS", "Node.js"];

  return (
    <div className="space-y-8 text-sm">
      {" "}
      {/* 减小间距从 12 到 8 */}
      {/* 热门文章 */}
      <section>
        <h3 className="mb-3 text-base font-medium">🔥 热门文章</h3>
        <ol className="space-y-2.5 list-decimal list-inside marker:text-muted-foreground/50">
          {popularPosts.map((post) => (
            <li key={post.id} className="text-muted-foreground">
              <Link
                href={`/blog/${post.id}`}
                className="hover:text-foreground transition-colors text-sm" // 确保文字大小合适
              >
                {post.title}
              </Link>
              <div className="ml-5 mt-0.5 flex gap-3 text-xs text-muted-foreground/60">
                <time>{post.date}</time>
                <span>{post.readTime}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
      {/* 分类 */}
      {/* <section>
        <h3 className="mb-3 text-base font-medium">📑 分类</h3>
        <ul className="space-y-1.5">
          {categories.map((category) => (
            <li key={category.name}>
              <Link
                href={`/blog?category=${category.name}`}
                className="flex justify-between text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
              >
                <span>{category.name}</span>
                <span className="text-muted-foreground/50">({category.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section> */}
      {/* 标签云 */}
      <section>
        <h3 className="mb-3 text-base font-medium"># 标签云</h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag}`}
              className="px-2 py-0.5 text-xs rounded border border-border/40
                text-muted-foreground hover:border-border hover:text-foreground 
                transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
