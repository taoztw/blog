import { BlogPostPage } from "@/components/blog/blog-post";

// Mock article data - in a real app, you'd fetch this based on the slug
const mockArticle = {
  title: "深入理解 React Server Components",
  author: "技术博主",
  publishDate: "2024年1月15日",
  readTime: "8分钟阅读",
  tags: ["React", "Next.js", "前端开发", "服务端渲染"],
  content: `# 深入理解 React Server Components

React Server Components (RSC) 是 React 18 引入的一个革命性特性，它改变了我们构建 React 应用的方式。

## 什么是 Server Components？

Server Components 是在服务器上运行的 React 组件，它们在构建时或请求时在服务器上渲染，而不是在客户端的浏览器中渲染。

### 主要特点

1. **零客户端 JavaScript**：Server Components 不会向客户端发送任何 JavaScript 代码
2. **直接访问后端资源**：可以直接访问数据库、文件系统等服务器资源
3. **更好的性能**：减少了客户端的 JavaScript 包大小

## 工作原理

Server Components 的工作流程如下：

\`\`\`javascript
// 这是一个 Server Component
async function BlogPost({ id }) {
  // 直接在服务器上获取数据
  const post = await db.posts.findById(id);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
\`\`\`

### 与传统组件的区别

传统的 React 组件在客户端运行，需要通过 API 调用获取数据：

\`\`\`javascript
// 传统的客户端组件
function BlogPost({ id }) {
  const [post, setPost] = useState(null);
  
  useEffect(() => {
    fetch(\`/api/posts/\${id}\`)
      .then(res => res.json())
      .then(setPost);
  }, [id]);
  
  if (!post) return <div>Loading...</div>;
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
\`\`\`

## 使用场景

Server Components 特别适合以下场景：

- **数据获取密集的组件**
- **静态内容展示**
- **SEO 要求高的页面**
- **需要访问服务器资源的组件**

## 最佳实践

### 1. 合理划分组件边界

不是所有组件都需要是 Server Components。交互性强的组件仍然应该是客户端组件。

### 2. 数据获取优化

利用 Server Components 的优势，在服务器端进行数据预处理：

\`\`\`javascript
async function UserDashboard({ userId }) {
  // 并行获取多个数据源
  const [user, posts, analytics] = await Promise.all([
    getUser(userId),
    getUserPosts(userId),
    getUserAnalytics(userId)
  ]);
  
  return (
    <div>
      <UserProfile user={user} />
      <PostsList posts={posts} />
      <AnalyticsChart data={analytics} />
    </div>
  );
}
\`\`\`

### 3. 错误处理

在 Server Components 中实现适当的错误处理：

\`\`\`javascript
async function DataComponent() {
  try {
    const data = await fetchData();
    return <DataDisplay data={data} />;
  } catch (error) {
    return <ErrorBoundary error={error} />;
  }
}
\`\`\`

## 总结

React Server Components 为我们提供了一种新的思考 React 应用架构的方式。通过在服务器端渲染组件，我们可以获得更好的性能、更小的客户端包大小，以及更直接的数据访问能力。

随着 Next.js 13+ 的 App Router 对 Server Components 的全面支持，这项技术正在成为现代 React 开发的标准实践。`,
};

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function page({ params }: PageProps) {
  const { slug } = await params;
  const id = slug[0]; // 假设第一个部分是文章 ID
  console.log("Post ID:", id);
  return <BlogPostPage {...mockArticle} />;
}
