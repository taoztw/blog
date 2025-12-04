// src/components/Editor/index.tsx
"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback } from "react";
import { FileNode } from "./extensions/FileNode";
import { VariableNode } from "./extensions/VariableNode";
import "./styles.css";

interface EditorProps {
  initialContent?: any;
  onChange?: (content: any) => void;
}

export default function Editor({ initialContent, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type something...",
      }),
      FileNode,
      VariableNode,
    ],
    content: initialContent || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    immediatelyRender: false,
  });

  // 插入文件节点
  const insertFile = useCallback(
    (file: File) => {
      if (!editor) return;

      // 创建临时 URL（实际项目中应该上传到服务器）
      const src = URL.createObjectURL(file);

      editor
        .chain()
        .focus()
        .insertContent({
          type: "fileNode",
          attrs: {
            src,
            fileName: file.name,
            fileId: crypto.randomUUID(),
          },
        })
        .run();
    },
    [editor]
  );

  // 插入变量节点
  const insertVariable = useCallback(
    (variableName: string) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .insertContent({
          type: "variable",
          attrs: {
            variableName,
            value: "",
          },
        })
        .run();
    },
    [editor]
  );

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      insertFile(file);
    }
    e.target.value = ""; // 重置 input
  };

  return (
    <div className="editor-wrapper border rounded-lg p-4 bg-white">
      {/* 工具栏 */}
      <div className="toolbar flex gap-2 mb-4 pb-4 border-b">
        <label className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm transition">
          📎 Upload File
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
            onChange={handleFileUpload}
          />
        </label>

        <button
          type="button"
          onClick={() => {
            const name = prompt("Enter variable name:");
            if (name) insertVariable(name);
          }}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
        >
          {"{{x}}"} Insert Variable
        </button>
      </div>

      {/* 编辑区域 */}
      <EditorContent editor={editor} className="prose max-w-none min-h-[200px] focus:outline-none" />
    </div>
  );
}
