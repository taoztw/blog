"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Editor as TiptapEditorInstance } from "@tiptap/core";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { Callout } from "./extensions/callout";
import { CodeBlockWithSyntax } from "./extensions/code-block-with-syntax";
import { CustomHeading } from "./extensions/custom-heading";
import { CustomImage } from "./extensions/custom-image";
import { FileNode } from "./extensions/file-node";
import { createMentionExtension } from "./extensions/mention";
import "./styles.css";
import { EditorToolbar } from "./toolbar";
import type { EditorMode, TiptapEditorProps } from "./types";

const getMarkdownFromEditor = (editor?: TiptapEditorInstance | null): string => {
  if (!editor) {
    return "";
  }
  try {
    // 使用 Markdown extension 提供的 getMarkdown() 方法
    // 这个方法由 @tiptap/markdown 扩展自动添加到 editor 实例上
    const editorWithMarkdown = editor as TiptapEditorInstance & { getMarkdown?: () => string };
    if (typeof editorWithMarkdown.getMarkdown === "function") {
      return editorWithMarkdown.getMarkdown();
    }
  } catch (error) {
    console.error("Failed to get markdown:", error);
  }
  return "";
};

export function TiptapEditor({
  content,
  onChange,
  placeholder = "开始输入...",
  editable = true,
  autofocus = false,
  showToolbar = true,
  className = "",
  minHeight = "200px",
  maxHeight = "600px",
  enableFileUpload = true,
  enableMentions = false,
  onSearchUsers,
}: TiptapEditorProps) {
  const [mode, setMode] = useState<EditorMode>("write");
  const [markdown, setMarkdown] = useState("");
  const lastSyncedContent = useRef<string | null>(null);
  const isUpdatingFromMarkdown = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Markdown,
      StarterKit.configure({
        // 禁用默认的 heading 和 codeBlock，使用自定义的
        heading: false,
        codeBlock: false,
      }),
      CustomHeading,
      Placeholder.configure({
        placeholder,
      }),
      Gapcursor,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
        },
      }),
      TableKit.configure({
        table: {
          resizable: true,
          allowTableNodeSelection: true,
          HTMLAttributes: {
            class: "border-collapse table-auto w-full my-4",
          },
        },
        tableRow: {
          HTMLAttributes: {
            class: "border",
          },
        },
        tableCell: {
          HTMLAttributes: {
            class: "border px-3 py-2",
          },
        },
        tableHeader: {
          HTMLAttributes: {
            class: "border px-3 py-2 bg-muted font-semibold",
          },
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "list-none pl-2",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      CustomImage,
      FileNode,
      CodeBlockWithSyntax,
      Callout,
      ...(enableMentions ? [createMentionExtension(onSearchUsers)] : []),
    ],
    content,
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      // 如果是从 Markdown 编辑器更新的，跳过这次同步
      if (isUpdatingFromMarkdown.current) {
        isUpdatingFromMarkdown.current = false;
        return;
      }
      const json = editor.getJSON();
      lastSyncedContent.current = JSON.stringify(json);
      onChange?.(json);
      setMarkdown(getMarkdownFromEditor(editor));
    },
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4",
      },
    },
  });

  // 当外部 content 变化时更新编辑器
  useEffect(() => {
    if (!editor) {
      return;
    }

    if (content == null) {
      setMarkdown(getMarkdownFromEditor(editor));
      return;
    }

    const serialized = typeof content === "string" ? content : JSON.stringify(content);
    if (serialized === lastSyncedContent.current) {
      setMarkdown(getMarkdownFromEditor(editor));
      return;
    }

    lastSyncedContent.current = serialized;
    editor.commands.setContent(content, { contentType: "markdown" });
    setMarkdown(getMarkdownFromEditor(editor));
  }, [content, editor]);

  // 当 editable 变化时更新编辑器
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // 当从 Markdown 模式切换到 Write 模式时，同步 Markdown 到编辑器
  useEffect(() => {
    if (mode === "write" && markdown) {
      syncMarkdownToEditor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // 处理 Markdown 文本编辑
  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
  };

  // 将 Markdown 同步到编辑器（在失去焦点或切换标签时调用）
  const syncMarkdownToEditor = () => {
    if (!editor) return;

    try {
      isUpdatingFromMarkdown.current = true;
      // 将 Markdown 文本解析为编辑器内容
      editor.commands.setContent(markdown, { contentType: "markdown" });
      // 触发 onChange 回调
      const json = editor.getJSON();
      onChange?.(json);
    } catch (error) {
      console.error("Failed to parse markdown:", error);
      isUpdatingFromMarkdown.current = false;
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={`tiptap-editor-wrapper border rounded-lg overflow-hidden ${className}`}>
      <Tabs value={mode} onValueChange={(value) => setMode(value as EditorMode)}>
        <div className="border-b bg-muted/20 flex items-center justify-between px-4">
          <TabsList className="h-12">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="m-0">
          {showToolbar && <EditorToolbar editor={editor} enableFileUpload={enableFileUpload} />}
          <div className="editor-content-wrapper overflow-y-auto" style={{ minHeight, maxHeight }}>
            <EditorContent editor={editor} />
          </div>
        </TabsContent>

        <TabsContent value="markdown" className="m-0">
          <div className="markdown-editor-wrapper" style={{ minHeight, maxHeight }}>
            <textarea
              value={markdown}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              onBlur={syncMarkdownToEditor}
              placeholder="输入 Markdown 内容..."
              disabled={!editable}
              className="w-full h-full p-4 text-sm font-mono resize-none border-0 focus:outline-none focus:ring-0 bg-background"
              style={{ minHeight, maxHeight }}
              spellCheck={false}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 导出子组件
export { TiptapRenderer } from "./renderer";
export type { TiptapEditorProps } from "./types";
