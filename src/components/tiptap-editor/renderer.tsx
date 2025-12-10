"use client";

import type { JSONContent } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CodeBlockWithSyntax } from "./extensions/code-block-with-syntax";
import { CustomImage } from "./extensions/custom-image";
import { FileNode } from "./extensions/file-node";
import { createMentionExtension } from "./extensions/mention";
import "./styles.css";

interface TiptapRendererProps {
  content: JSONContent | string;
  className?: string;
}

/**
 * Tiptap 内容渲染器（只读模式）
 * 用于显示编辑器内容，不可编辑
 */
export function TiptapRenderer({ content, className = "" }: TiptapRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      // CustomHeading,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Table.configure({
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border px-3 py-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border px-3 py-2 bg-muted font-semibold",
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
      createMentionExtension(),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm dark:prose-invert max-w-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={`tiptap-renderer ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
