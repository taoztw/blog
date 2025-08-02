import { env } from "@/env";

export const SITE_NAME = "Tz blog";
export const SITE_DESCRIPTION =
	"Tz的技术博客，分享前端开发、后端开发、AI与大语言模型实践。分享Next.js、React、AI开发等技术经验。Tz's Tech Blog - Focused on frontend development, backend architecture, AI and Large Language Models practice. Sharing experiences and insights on Next.js, React, Node.js, Machine Learning, LLM Agents and more. Built with T3 Stack, covering full-stack development to artificial intelligence.";

export const GITHUB_REPO_URL = "https://github.com/taoztw/blog";

export const SITE_URL = env.NODE_ENV === "development" ? "http://localhost:3000" : "https://tz1.me";
