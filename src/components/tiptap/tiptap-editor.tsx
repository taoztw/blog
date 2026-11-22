"use client";

import "katex/dist/katex.min.css";
import "./tiptap.css";

import type { JSONContent } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { BubbleToolbar } from "./bubble-toolbar";
import { EMPTY_DOCUMENT } from "./document";
import { createContentExtensions } from "./extensions";
import { type MathDraft, MathDialog } from "./math-dialog";
import { SlashCommand } from "./slash-command";
import { EditorToolbar } from "./toolbar";
import { ImagePasteDrop } from "./upload";

export interface TiptapEditorProps {
  /** 初始文档，只在挂载时读取一次 */
  initialValue?: JSONContent;
  onChange?: (value: JSONContent) => void;
  /** 是否显示顶部固定工具栏，默认显示 */
  toolbar?: boolean;
  className?: string;
}

export function TiptapEditor({ initialValue, onChange, toolbar = true, className }: TiptapEditorProps) {
  const [mathDraft, setMathDraft] = React.useState<MathDraft | null>(null);

  // 扩展只创建一次，回调经 ref 取最新值，避免因 props 变化重建编辑器
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const openMath = React.useCallback(
    (kind: "inline" | "block") => setMathDraft({ kind, latex: "", pos: null }),
    []
  );

  const [extensions] = React.useState(() => [
    ...createContentExtensions({
      onMathClick: (kind, node, pos) => setMathDraft({ kind, latex: (node.attrs.latex as string) ?? "", pos }),
    }),
    Placeholder.configure({
      showOnlyCurrent: false,
      placeholder: ({ node, pos, hasAnchor }) => {
        if (node.type.name === "heading" && node.attrs.level === 1 && pos === 0) return "标题";
        return hasAnchor ? "输入 / 唤起命令…" : "";
      },
    }),
    SlashCommand.configure({ onMath: openMath }),
    ImagePasteDrop,
  ]);

  const editor = useEditor({
    extensions,
    content: initialValue ?? EMPTY_DOCUMENT,
    // Next.js 会在服务端渲染客户端组件，编辑器必须等到浏览器端再创建
    immediatelyRender: false,
    // 工具栏用 useEditorState 订阅自己关心的状态，不需要每次事务都重渲染整棵树
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: { class: "tiptap-content" },
    },
    onUpdate: ({ editor }) => onChangeRef.current?.(editor.getJSON()),
  });

  const submitMath = (draft: MathDraft) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (draft.pos === null) {
      if (draft.kind === "inline") chain.insertInlineMath({ latex: draft.latex }).run();
      else chain.insertBlockMath({ latex: draft.latex }).run();
    } else if (draft.kind === "inline") {
      chain.updateInlineMath({ latex: draft.latex, pos: draft.pos }).run();
    } else {
      chain.updateBlockMath({ latex: draft.latex, pos: draft.pos }).run();
    }
    setMathDraft(null);
  };

  const deleteMath = (draft: MathDraft) => {
    if (!editor || draft.pos === null) return;
    const chain = editor.chain().focus();
    if (draft.kind === "inline") chain.deleteInlineMath({ pos: draft.pos }).run();
    else chain.deleteBlockMath({ pos: draft.pos }).run();
    setMathDraft(null);
  };

  return (
    <div className={cn("flex h-full w-full flex-col bg-background", className)}>
      {toolbar &&
        (editor ? (
          <EditorToolbar editor={editor} onMath={openMath} />
        ) : (
          <div className="h-11 shrink-0 border-b border-border" />
        ))}

      <div
        className="relative flex-1 cursor-text overflow-y-auto"
        // 点击正文下方的留白时，把光标放到文档末尾
        onClick={(event) => {
          if (event.target === event.currentTarget) editor?.chain().focus("end").run();
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {editor && <BubbleToolbar editor={editor} />}

      <MathDialog
        draft={mathDraft}
        onSubmit={submitMath}
        onDelete={deleteMath}
        onClose={() => setMathDraft(null)}
      />

    </div>
  );
}
