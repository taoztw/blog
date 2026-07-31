"use client";

/**
 * 第一课 demo —— 裸 Slate 最小编辑器(不含任何 Plate)。
 *
 * 这里刻意只用 slate / slate-react 原生 API,让你看清最底层:
 *   - Value 就是一段 JSON 数组(Element / Text 节点)
 *   - 所有修改都走 Editor / Transforms,绝不直接改对象
 *   - renderElement 渲染块,renderLeaf 渲染文本 marks
 *
 * 想练手?直接改这个文件,保存即热更新:
 *   - 加一个新 mark(比如下划线 underline)
 *   - 加一个新块类型(比如 blockquote)
 *   - 改快捷键
 */

import { useCallback, useMemo, useState } from "react";
import {
  createEditor,
  Editor,
  Element as SlateElement,
  Transforms,
  type Descendant,
  type BaseEditor,
} from "slate";
import {
  Editable,
  Slate,
  withReact,
  useSlate,
  type RenderElementProps,
  type RenderLeafProps,
  type ReactEditor,
} from "slate-react";
import { JsonViewer } from "@/components/playground/json-viewer";
import { cn } from "@/lib/utils";
import { Bold, Italic, Heading1 } from "lucide-react";

// ── 类型:告诉 TS 我们的自定义节点长什么样 ──────────────
type CustomText = { text: string; bold?: boolean; italic?: boolean };
type ParagraphElement = { type: "paragraph"; children: CustomText[] };
type HeadingElement = { type: "heading"; children: CustomText[] };
type CustomElement = ParagraphElement | HeadingElement;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// ── 初始 Value:一段纯粹的 Slate JSON ──────────────────
const initialValue: Descendant[] = [
  {
    type: "heading",
    children: [{ text: "这是一个 heading 块" }],
  },
  {
    type: "paragraph",
    children: [
      { text: "这是普通段落,试着选中我然后 " },
      { text: "加粗", bold: true },
      { text: " 或 " },
      { text: "斜体", italic: true },
      { text: "。" },
    ],
  },
];

// ── mark 的读写:全部通过 Editor API,不直接改对象 ──────
function isMarkActive(editor: Editor, format: "bold" | "italic") {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}

function toggleMark(editor: Editor, format: "bold" | "italic") {
  if (isMarkActive(editor, format)) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

// ── 块类型切换:heading <-> paragraph ─────────────────
function isBlockActive(editor: Editor, type: "heading") {
  const [match] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && n.type === type,
  });
  return !!match;
}

function toggleBlock(editor: Editor, type: "heading") {
  const active = isBlockActive(editor, type);
  Transforms.setNodes(editor, { type: active ? "paragraph" : "heading" });
}

export function SlateBasicsDemo() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Descendant[]>(initialValue);

  // renderElement:根据 type 决定这个"块"怎么渲染
  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case "heading":
        return (
          <h3 className="mb-2 text-xl font-bold text-ink-900" {...props.attributes}>
            {props.children}
          </h3>
        );
      default:
        return (
          <p className="mb-2 text-ink-700" {...props.attributes}>
            {props.children}
          </p>
        );
    }
  }, []);

  // renderLeaf:根据 marks 决定这段"文本"怎么渲染
  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let children = props.children;
    if (props.leaf.bold) children = <strong>{children}</strong>;
    if (props.leaf.italic) children = <em>{children}</em>;
    return <span {...props.attributes}>{children}</span>;
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ink-300 bg-ink-50">
        <Slate
          editor={editor}
          initialValue={initialValue}
          onChange={(v) => setValue(v)}
        >
          <Toolbar />
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(e) => {
              if (!e.ctrlKey && !e.metaKey) return;
              if (e.key === "b") {
                e.preventDefault();
                toggleMark(editor, "bold");
              }
              if (e.key === "i") {
                e.preventDefault();
                toggleMark(editor, "italic");
              }
            }}
            className="min-h-40 px-4 py-3 focus:outline-none"
            placeholder="在这里输入…"
          />
        </Slate>
      </div>

      <JsonViewer value={value} />
    </div>
  );
}

// ── 工具栏:按钮点击调 toggleMark / toggleBlock ─────────
function Toolbar() {
  const editor = useSlate();
  return (
    <div className="flex items-center gap-1 border-b border-ink-300 px-2 py-1.5">
      <MarkButton format="bold" icon={<Bold className="size-4" />} />
      <MarkButton format="italic" icon={<Italic className="size-4" />} />
      <span className="mx-1 h-5 w-px bg-ink-300" />
      <BlockButton type="heading" icon={<Heading1 className="size-4" />} />
    </div>
  );
}

function MarkButton({
  format,
  icon,
}: {
  format: "bold" | "italic";
  icon: React.ReactNode;
}) {
  const editor = useSlate();
  const active = isMarkActive(editor, format);
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // 防止编辑器失焦
        toggleMark(editor, format);
      }}
      className={cn(
        "rounded p-1.5 transition-colors",
        active ? "bg-brand/15 text-brand" : "text-ink-600 hover:bg-ink-100",
      )}
    >
      {icon}
    </button>
  );
}

function BlockButton({
  type,
  icon,
}: {
  type: "heading";
  icon: React.ReactNode;
}) {
  const editor = useSlate();
  const active = isBlockActive(editor, type);
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        toggleBlock(editor, type);
      }}
      className={cn(
        "rounded p-1.5 transition-colors",
        active ? "bg-brand/15 text-brand" : "text-ink-600 hover:bg-ink-100",
      )}
    >
      {icon}
    </button>
  );
}
