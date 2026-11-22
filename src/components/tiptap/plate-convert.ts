import type { JSONContent } from "@tiptap/core";

/*
 * Plate（Slate）文档 → Tiptap 文档的转换。
 *
 * 旧文章在数据库里存的是 Plate 的 JSON 数组。读取时用这里的函数即时转换，
 * 所以不需要先批量迁移数据：阅读页直接渲染转换结果，编辑器打开旧文章后保存即变成新格式。
 *
 * 原则：宁可丢样式，不丢文字。不认识的节点会退化成段落或被展开，其中的文本始终保留。
 */

interface PlateText {
  text: string;
  [mark: string]: unknown;
}

interface PlateElement {
  type?: string;
  children?: PlateNode[];
  [key: string]: unknown;
}

type PlateNode = PlateText | PlateElement;

type Mark = NonNullable<JSONContent["marks"]>[number];

function isText(node: PlateNode): node is PlateText {
  return typeof (node as PlateText).text === "string";
}

const HEADING_LEVELS: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 4, h6: 4 };

/** 只能出现在行内的 Plate 元素 */
const INLINE_TYPES = new Set(["a", "inline_equation", "mention", "date"]);

function plainText(node: PlateNode): string {
  if (isText(node)) return node.text;
  return (node.children ?? []).map(plainText).join("");
}

// ── 行内 ────────────────────────────────────────────────

function textMarks(leaf: PlateText, inherited: Mark[]): Mark[] {
  // Tiptap 的行内代码与其他样式互斥，只保留 code
  if (leaf.code) return [{ type: "code" }];

  const marks: Mark[] = [...inherited];
  if (leaf.bold) marks.push({ type: "bold" });
  if (leaf.italic) marks.push({ type: "italic" });
  if (leaf.underline) marks.push({ type: "underline" });
  if (leaf.strikethrough) marks.push({ type: "strike" });
  return marks;
}

function convertText(leaf: PlateText, inherited: Mark[]): JSONContent[] {
  const marks = textMarks(leaf, inherited);
  const result: JSONContent[] = [];

  // Tiptap 不允许空文本节点；段内换行用 hardBreak 表示
  leaf.text.split("\n").forEach((segment, index) => {
    if (index > 0) result.push({ type: "hardBreak" });
    if (segment) result.push(marks.length > 0 ? { type: "text", text: segment, marks } : { type: "text", text: segment });
  });
  return result;
}

function convertInline(nodes: PlateNode[], inherited: Mark[] = []): JSONContent[] {
  return nodes.flatMap((node): JSONContent[] => {
    if (isText(node)) return convertText(node, inherited);

    switch (node.type) {
      case "a": {
        const href = typeof node.url === "string" ? node.url : "";
        const marks = href ? [...inherited, { type: "link", attrs: { href } }] : inherited;
        return convertInline(node.children ?? [], marks);
      }
      case "inline_equation": {
        const latex = typeof node.texExpression === "string" ? node.texExpression : "";
        return latex ? [{ type: "inlineMath", attrs: { latex } }] : [];
      }
      case "mention":
        return convertText({ text: `@${String(node.value ?? plainText(node))}` }, inherited);
      case "date":
        return convertText({ text: String(node.date ?? plainText(node)) }, inherited);
      default:
        // 不认识的行内元素：保留其中的文字
        return convertInline(node.children ?? [], inherited);
    }
  });
}

function paragraph(children: PlateNode[]): JSONContent {
  const content = convertInline(children);
  return content.length > 0 ? { type: "paragraph", content } : { type: "paragraph" };
}

// ── 列表 ────────────────────────────────────────────────

type ListKind = "bulletList" | "orderedList" | "taskList";

/** Plate 的列表是“带缩进和列表样式的段落”，这里是其中一行 */
interface ListLine {
  kind: ListKind;
  indent: number;
  node: PlateElement;
}

function listKind(listStyleType: unknown): ListKind {
  if (listStyleType === "todo") return "taskList";
  if (listStyleType === "disc" || listStyleType === "circle" || listStyleType === "square") return "bulletList";
  return "orderedList";
}

function asListLine(node: PlateNode): ListLine | null {
  if (isText(node) || !node.listStyleType) return null;
  return {
    kind: listKind(node.listStyleType),
    indent: typeof node.indent === "number" ? node.indent : 1,
    node,
  };
}

/** 从 lines[start] 开始，按缩进层级把连续的行组装成一棵嵌套列表，返回列表节点和下一个未处理的位置 */
function buildList(lines: ListLine[], start: number): [JSONContent, number] {
  const first = lines[start]!;
  const { kind, indent } = first;
  const itemType = kind === "taskList" ? "taskItem" : "listItem";
  const items: JSONContent[] = [];
  let i = start;

  while (i < lines.length) {
    const line = lines[i]!;
    if (line.indent < indent) break;

    if (line.indent > indent) {
      // 更深一层：挂到上一个列表项下面
      const [nested, next] = buildList(lines, i);
      const parent = items[items.length - 1];
      parent!.content!.push(nested);
      i = next;
      continue;
    }

    // 同层但换了列表类型：结束当前列表，由调用方另起一个
    if (line.kind !== kind) break;

    const item: JSONContent = { type: itemType, content: [paragraph(line.node.children ?? [])] };
    if (kind === "taskList") item.attrs = { checked: Boolean(line.node.checked) };
    items.push(item);
    i++;
  }

  const list: JSONContent = { type: kind, content: items };
  const listStart = first.node.listStart;
  if (kind === "orderedList" && typeof listStart === "number" && listStart > 1) list.attrs = { start: listStart };
  return [list, i];
}

/** 旧版 Plate 的嵌套式列表（ul / ol / li / lic） */
function convertClassicList(node: PlateElement): JSONContent {
  const items = (node.children ?? []).filter((child): child is PlateElement => !isText(child));
  return {
    type: node.type === "ol" ? "orderedList" : "bulletList",
    content: items.map((item) => {
      const content = convertBlocks(item.children ?? []);
      // 列表项必须以段落开头
      if (content[0]?.type !== "paragraph") content.unshift({ type: "paragraph" });
      return { type: "listItem", content };
    }),
  };
}

// ── 块 ──────────────────────────────────────────────────

function hasBlockChildren(node: PlateElement): boolean {
  return (node.children ?? []).some((child) => !isText(child) && !INLINE_TYPES.has(child.type ?? ""));
}

/** 子节点可能是行内内容，也可能已经是块；统一转成至少含一个块的数组 */
function blockContent(node: PlateElement): JSONContent[] {
  if (!hasBlockChildren(node)) return [paragraph(node.children ?? [])];
  const blocks = convertBlocks(node.children ?? []);
  return blocks.length > 0 ? blocks : [{ type: "paragraph" }];
}

function calloutVariant(variant: unknown): string {
  if (variant === "warning" || variant === "success") return variant;
  if (variant === "error" || variant === "danger" || variant === "destructive") return "danger";
  return "info";
}

function convertTable(node: PlateElement): JSONContent {
  const rows = (node.children ?? []).filter((child): child is PlateElement => !isText(child));
  return {
    type: "table",
    content: rows.map((row) => ({
      type: "tableRow",
      content: (row.children ?? [])
        .filter((child): child is PlateElement => !isText(child))
        .map((cell) => {
          const attrs: Record<string, number> = {};
          if (typeof cell.colSpan === "number" && cell.colSpan > 1) attrs.colspan = cell.colSpan;
          if (typeof cell.rowSpan === "number" && cell.rowSpan > 1) attrs.rowspan = cell.rowSpan;
          const converted: JSONContent = {
            type: cell.type === "th" ? "tableHeader" : "tableCell",
            content: blockContent(cell),
          };
          if (Object.keys(attrs).length > 0) converted.attrs = attrs;
          return converted;
        }),
    })),
  };
}

function convertBlock(node: PlateElement): JSONContent[] {
  const type = node.type ?? "p";
  const children = node.children ?? [];

  const headingLevel = HEADING_LEVELS[type];
  if (headingLevel) {
    const content = convertInline(children);
    const heading: JSONContent = { type: "heading", attrs: { level: headingLevel } };
    if (content.length > 0) heading.content = content;
    return [heading];
  }

  switch (type) {
    case "p":
    case "lic":
    case "toggle":
      return [paragraph(children)];

    case "blockquote":
      return [{ type: "blockquote", content: blockContent(node) }];

    case "hr":
      return [{ type: "horizontalRule" }];

    case "code_block": {
      const code = children.map(plainText).join("\n");
      const block: JSONContent = {
        type: "codeBlock",
        attrs: { language: typeof node.lang === "string" && node.lang ? node.lang : null },
      };
      if (code) block.content = [{ type: "text", text: code }];
      return [block];
    }

    case "img": {
      const src = typeof node.url === "string" ? node.url : "";
      if (!src) return [];
      const caption = Array.isArray(node.caption) ? (node.caption as PlateNode[]).map(plainText).join("") : "";
      return [{ type: "image", attrs: { src, alt: caption || null } }];
    }

    case "video":
    case "audio":
    case "file":
    case "media_embed": {
      // 新编辑器没有这些媒体节点，退化成一个指向原地址的链接
      const url = typeof node.url === "string" ? node.url : "";
      if (!url) return [];
      const label = typeof node.name === "string" && node.name ? node.name : url;
      return [
        {
          type: "paragraph",
          content: [{ type: "text", text: label, marks: [{ type: "link", attrs: { href: url } }] }],
        },
      ];
    }

    case "table":
      return [convertTable(node)];

    case "callout": {
      const content = blockContent(node);
      // 原提示块的图标是一个表情，放到正文开头保留下来
      const first = content[0];
      if (typeof node.icon === "string" && node.icon && first?.type === "paragraph") {
        first.content = [{ type: "text", text: `${node.icon} ` }, ...(first.content ?? [])];
      }
      return [{ type: "callout", attrs: { variant: calloutVariant(node.variant) }, content }];
    }

    case "equation": {
      const latex = typeof node.texExpression === "string" ? node.texExpression : "";
      return latex ? [{ type: "blockMath", attrs: { latex } }] : [];
    }

    case "ul":
    case "ol":
      return [convertClassicList(node)];

    case "toc":
      // 目录由阅读页自己生成，文档里的目录块不需要保留
      return [];

    default:
      // 多栏布局等容器、以及任何不认识的块：有块级子节点就展开，否则当作段落
      return hasBlockChildren(node) ? convertBlocks(children) : [paragraph(children)];
  }
}

function convertBlocks(nodes: PlateNode[]): JSONContent[] {
  const result: JSONContent[] = [];
  let i = 0;

  while (i < nodes.length) {
    const node = nodes[i]!;

    if (asListLine(node)) {
      // 收集连续的列表行，一次性组装成嵌套列表
      const lines: ListLine[] = [];
      while (i < nodes.length) {
        const line = asListLine(nodes[i]!);
        if (!line) break;
        lines.push(line);
        i++;
      }
      let cursor = 0;
      while (cursor < lines.length) {
        const [list, next] = buildList(lines, cursor);
        result.push(list);
        cursor = next;
      }
      continue;
    }

    if (isText(node)) {
      // 顶层出现裸文本属于坏数据，包成段落保住文字
      if (node.text) result.push(paragraph([node]));
    } else {
      result.push(...convertBlock(node));
    }
    i++;
  }

  return result;
}

/** 把 Plate 的文档值（顶层节点数组）转换成 Tiptap 文档 */
export function plateToTiptap(value: unknown[]): JSONContent {
  const content = convertBlocks(value as PlateNode[]);
  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}
