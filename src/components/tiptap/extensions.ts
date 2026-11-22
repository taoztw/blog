import type { Extensions } from "@tiptap/core";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Mathematics } from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

import { Callout } from "./callout";

/** 代码高亮实例，编辑器和静态渲染共用 */
export const lowlight = createLowlight(common);

export interface ContentExtensionOptions {
  /** 点击公式时触发（仅编辑器需要，用来打开编辑框） */
  onMathClick?: (kind: "inline" | "block", node: ProseMirrorNode, pos: number) => void;
}

/**
 * 决定文档结构（schema）的扩展。
 * 编辑器和阅读页的静态渲染必须使用同一份，才能保证写的和看到的一致。
 * 只影响编辑交互的扩展（占位符、斜杠菜单等）放在编辑器组件里，不要加到这里。
 */
export function createContentExtensions({ onMathClick }: ContentExtensionOptions = {}): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      // 用带语法高亮的代码块替换默认实现
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      },
    }),
    // 未指定语言时由 lowlight 自动识别
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: null }),
    Image.configure({ allowBase64: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit.configure({ table: { resizable: true } }),
    Mathematics.configure({
      katexOptions: { throwOnError: false },
      inlineOptions: { onClick: (node, pos) => onMathClick?.("inline", node, pos) },
      blockOptions: { onClick: (node, pos) => onMathClick?.("block", node, pos) },
    }),
    Callout,
  ];
}

/** 代码块可选的语言（lowlight common 集合里博客常用的那些） */
export const CODE_LANGUAGES: Array<{ value: string; label: string }> = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "xml", label: "HTML / XML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "diff", label: "Diff" },
  { value: "plaintext", label: "纯文本" },
];
