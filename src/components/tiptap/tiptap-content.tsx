import "katex/dist/katex.min.css";
import "./tiptap.css";

import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import katex from "katex";
import * as React from "react";

import { cn } from "@/lib/utils";

import { collectHeadings } from "./document";
import { createContentExtensions, lowlight } from "./extensions";

// 静态渲染不需要任何编辑回调，扩展列表可以全局只建一次
const extensions = createContentExtensions();

/** lowlight 输出的语法树里我们用得到的那部分结构 */
interface HighlightNode {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: HighlightNode[];
}

function renderHighlight(nodes: HighlightNode[]): React.ReactNode {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.value;
    return (
      <span key={index} className={node.properties?.className?.join(" ")}>
        {renderHighlight(node.children ?? [])}
      </span>
    );
  });
}

function highlightCode(code: string, language: string | null): HighlightNode[] {
  const tree =
    language && lowlight.registered(language) ? lowlight.highlight(language, code) : lowlight.highlightAuto(code);
  return tree.children as HighlightNode[];
}

function renderMath(latex: string, displayMode: boolean) {
  // KaTeX 输出的是它自己生成的标记；throwOnError 关闭后，写错的公式会被渲染成红色文本而不是抛错
  return { __html: katex.renderToString(latex, { throwOnError: false, displayMode }) };
}

interface TiptapContentProps {
  doc: JSONContent;
  className?: string;
}

/**
 * 把 Tiptap 文档渲染成只读内容，不创建编辑器实例。
 * 没有 "use client"：在服务端组件里使用时，高亮和公式都在服务端完成，浏览器不下载这些库。
 */
export function TiptapContent({ doc, className }: TiptapContentProps) {
  // 渲染顺序与 collectHeadings 的遍历顺序一致（都是文档顺序），依次取用即可
  const headingIds = collectHeadings(doc).map((heading) => heading.id);
  let headingIndex = 0;

  const content = renderToReactElement({
    extensions,
    content: doc,
    options: {
      nodeMapping: {
        heading: ({ node, children }) => {
          const Tag = `h${node.attrs.level as number}` as "h1" | "h2" | "h3" | "h4";
          const id = node.textContent.trim() ? headingIds[headingIndex++] : undefined;
          return (
            <Tag id={id} className="scroll-mt-24">
              {children}
            </Tag>
          );
        },
        codeBlock: ({ node }) => {
          const language = (node.attrs.language as string | null) ?? null;
          return (
            <pre>
              <code className={language ? `language-${language}` : undefined}>
                {renderHighlight(highlightCode(node.textContent, language))}
              </code>
            </pre>
          );
        },
        image: ({ node }) => (
          // eslint-disable-next-line @next/next/no-img-element -- 图片来自 R2，尺寸未知，不走 next/image
          <img
            src={node.attrs.src as string}
            alt={(node.attrs.alt as string | null) ?? ""}
            title={(node.attrs.title as string | null) ?? undefined}
            loading="lazy"
            decoding="async"
          />
        ),
        table: ({ children }) => (
          <div className="tableWrapper">
            <table>
              <tbody>{children}</tbody>
            </table>
          </div>
        ),
        taskItem: ({ node, children }) => (
          <li data-checked={node.attrs.checked ? "true" : "false"}>
            <label>
              <input type="checkbox" checked={Boolean(node.attrs.checked)} readOnly disabled />
            </label>
            <div>{children}</div>
          </li>
        ),
        inlineMath: ({ node }) => (
          <span data-type="inline-math" dangerouslySetInnerHTML={renderMath(node.attrs.latex as string, false)} />
        ),
        blockMath: ({ node }) => (
          <div data-type="block-math" dangerouslySetInnerHTML={renderMath(node.attrs.latex as string, true)} />
        ),
      },
    },
  });

  return <div className={cn("tiptap-content", className)}>{content}</div>;
}
