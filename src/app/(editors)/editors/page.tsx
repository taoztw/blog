"use client";

import Tiptap from "@/components/tiptap-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function EditorDemoPage() {
  const [content, setContent] = useState("");

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tiptap 富文本编辑器演示</h1>
        <p className="text-muted-foreground">功能完整的富文本编辑器，支持图片/文件上传、代码高亮、表格、@提及等功能</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* 编辑器 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>编辑器</CardTitle>
              <CardDescription>在 Write 模式下编辑，切换到 Preview 查看渲染效果</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tiptap content={content} onChange={setContent} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
