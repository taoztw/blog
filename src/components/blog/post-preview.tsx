"use client";
import Markdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

const components: Partial<Components> = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");

    if (inline) {
      return (
        <code className="rounded-sm bg-muted px-1.5 py-1 font-mono text-sm" {...props}>
          {children}
        </code>
      );
    }

    return match ? (
      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
        {codeString}
      </SyntaxHighlighter>
    ) : (
      <pre className="block overflow-x-auto rounded-md bg-zinc-900 p-4 font-mono text-sm text-white" {...props}>
        <code>{children}</code>
      </pre>
    );
  },
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto">
      <table className="my-4 w-full" {...props} />
    </div>
  ),
};

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div className={cn("prose prose-zinc dark:prose-invert max-w-none", className)}>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSlug]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}
