// src/app/page.tsx
"use client";

import Editor from "@/components/editor";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState<any>(null);

  // 示例初始内容
  const initialContent = {
    type: "doc",
    content: [
      {
        type: "fileNode",
        attrs: {
          src: "/placeholder-image.jpg",
          fileName: "P00329-214409.jpg",
          fileId: "123",
        },
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "这是一个测试文件" },
          {
            type: "variable",
            attrs: {
              variableName: "asdad",
              value: "",
            },
          },
          { type: "text", text: "asdlajsdkakjsdk" },
        ],
      },
    ],
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Rich Text Editor</h1>

      <Editor
        initialContent={initialContent}
        onChange={(newContent) => {
          setContent(newContent);
          console.log("Content updated:", newContent);
        }}
      />

      {/* 预览 JSON */}
      <details className="mt-8">
        <summary className="cursor-pointer text-gray-600">View JSON</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">{JSON.stringify(content, null, 2)}</pre>
      </details>
    </main>
  );
}
