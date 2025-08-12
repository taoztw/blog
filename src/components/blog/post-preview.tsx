"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const { theme } = useTheme();
  console.log("Current theme:", theme);
  return (
    <div
      className={cn("markdown-body", className)}
      data-theme={theme}
      style={{
        boxSizing: "border-box",
        minWidth: "200px",
        maxWidth: "980px",
        margin: "0 auto",
        padding: "45px",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            if (!inline && language) {
              return (
                <div className="relative">
                  <SyntaxHighlighter
                    style={theme === "dark" ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    className="rounded-md !bg-transparent !m-0"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx>{`
        @media (max-width: 767px) {
          .markdown-body {
            padding: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}
