import type { JSONContent } from "@tiptap/core";
import GithubSlugger from "github-slugger";

import { plateToTiptap } from "./plate-convert";

/*
 * 只操作文档 JSON 的纯函数，不引入任何编辑器扩展，
 * 服务端和客户端都可以放心导入。
 */

/** 新文档的初始内容：一个标题加一个空段落（沿用“首个一级标题即文章标题”的约定） */
export const EMPTY_DOCUMENT: JSONContent = {
  type: "doc",
  content: [{ type: "heading", attrs: { level: 1 } }, { type: "paragraph" }],
};

/** 没有标题的空文档（日志用） */
export const EMPTY_NOTE: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

/** 判断一个值是不是 Tiptap 文档（Plate 的旧内容是数组） */
export function isTiptapDocument(value: unknown): value is JSONContent {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value) && (value as JSONContent).type === "doc"
  );
}

/**
 * 读取数据库里的 content 字段，统一得到 Tiptap 文档。
 * 新格式原样返回；旧的 Plate 格式（数组）即时转换；空串或坏数据返回 null。
 */
export function loadDocument(raw: string | null | undefined): JSONContent | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isTiptapDocument(parsed)) return parsed;
    if (Array.isArray(parsed) && parsed.length > 0) return plateToTiptap(parsed);
  } catch {
    // 不是 JSON
  }
  return null;
}

/** 文章编辑器的初始文档：有已保存内容就用它，否则用标题生成一个只有一级标题的新文档 */
export function buildPostDocument(title: string | null | undefined, content: string | null | undefined): JSONContent {
  const doc = loadDocument(content);
  if (doc) return doc;

  const heading: JSONContent = { type: "heading", attrs: { level: 1 } };
  if (title) heading.content = [{ type: "text", text: title }];
  return { type: "doc", content: [heading, { type: "paragraph" }] };
}

/** 节点及其后代的纯文本 */
export function getNodeText(node: JSONContent): string {
  if (typeof node.text === "string") return node.text;
  return (node.content ?? []).map(getNodeText).join("");
}

function isTitleHeading(node: JSONContent | undefined): boolean {
  return node?.type === "heading" && node.attrs?.level === 1;
}

/** 取文档第一个节点（须为一级标题）的纯文本，作为文章标题 */
export function extractTitle(doc: JSONContent | null | undefined): string {
  const first = doc?.content?.[0];
  return first && isTitleHeading(first) ? getNodeText(first) : "";
}

/** 去掉文档里第一个顶层一级标题：阅读页的标题由页面头部单独展示 */
export function withoutTitle(doc: JSONContent): JSONContent {
  const content = doc.content ?? [];
  const index = content.findIndex(isTitleHeading);
  if (index === -1) return doc;
  return { ...doc, content: content.filter((_, i) => i !== index) };
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * 按文档顺序收集所有标题并生成锚点 id。
 * 渲染器给标题加 id 时走的也是这个函数，目录链接和正文锚点因此必然一致。
 * 空标题没有 id，也不进入结果。
 */
export function collectHeadings(doc: JSONContent): HeadingItem[] {
  const slugger = new GithubSlugger();
  const items: HeadingItem[] = [];

  const visit = (node: JSONContent) => {
    if (node.type === "heading") {
      const text = getNodeText(node).trim();
      if (text) items.push({ id: slugger.slug(text), text, level: (node.attrs?.level as number) ?? 1 });
      return;
    }
    node.content?.forEach(visit);
  };
  visit(doc);

  return items;
}
