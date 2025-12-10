"use client";

import { TiptapEditor } from "@/components/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { JSONContent } from "@tiptap/core";
import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EditorDemoPage() {
  const [content, setContent] = useState<JSONContent | null>(null);

  // 示例初始内容
  const initialContent: JSONContent = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "欢迎使用 Tiptap 富文本编辑器" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "这是一个功能完整的富文本编辑器，支持：" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "图片上传和预览（点击可放大）" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "文件上传（PDF、Word、Excel、TXT、Markdown）" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "代码块（带语法高亮）" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "表格" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "@提及用户" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "任务列表" }],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "试试代码块" }],
      },
      {
        type: "codeBlock",
        attrs: { language: "javascript" },
        content: [
          {
            type: "text",
            text: 'function hello() {\n  console.log("Hello, World!");\n  return true;\n}',
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "引用示例" }],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "这是一个引用块的示例。可以用来引用他人的话语或重要信息。" }],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "你可以使用工具栏中的按钮来格式化文本，例如",
          },
          { type: "text", marks: [{ type: "bold" }], text: "粗体" },
          { type: "text", text: "、" },
          { type: "text", marks: [{ type: "italic" }], text: "斜体" },
          { type: "text", text: "、" },
          { type: "text", marks: [{ type: "strike" }], text: "删除线" },
          { type: "text", text: "和" },
          { type: "text", marks: [{ type: "code" }], text: "行内代码" },
          { type: "text", text: "。" },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "任务列表示例" }],
      },
      {
        type: "taskList",
        content: [
          {
            type: "taskItem",
            attrs: { checked: true },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "完成编辑器基础功能" }],
              },
            ],
          },
          {
            type: "taskItem",
            attrs: { checked: true },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "添加图片和文件上传" }],
              },
            ],
          },
          {
            type: "taskItem",
            attrs: { checked: false },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "集成到生产环境" }],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "切换到 " },
          { type: "text", marks: [{ type: "bold" }], text: "Preview" },
          { type: "text", text: " 标签页查看渲染效果！" },
        ],
      },
    ],
  };

  // 导出 JSON
  const handleExport = () => {
    if (!content) {
      toast.error("没有内容可导出");
      return;
    }

    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `editor-content-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已导出内容");
  };

  // 导入 JSON
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text) as JSONContent;
        setContent(json);
        toast.success("已导入内容");
      } catch (error) {
        toast.error("导入失败：文件格式不正确");
      }
    };
    input.click();
  };

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
              <TiptapEditor
                content={content ?? initialContent}
                onChange={setContent}
                placeholder="开始输入你的内容..."
                enableFileUpload={true}
                enableMentions={true}
                minHeight="400px"
                maxHeight="600px"
              />
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="mt-4 flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出 JSON
            </Button>
            <Button onClick={handleImport} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              导入 JSON
            </Button>
          </div>
        </div>

        {/* JSON 预览 */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>JSON 输出</CardTitle>
              <CardDescription>编辑器内容的 JSON 格式</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-[600px]">
                {JSON.stringify(content ?? initialContent, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 功能说明 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>功能特性</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-2">📝 基础格式</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• H1-H6 标题（字号适中）</li>
                <li>• 粗体、斜体、删除线</li>
                <li>• 无序/有序/任务列表</li>
                <li>• 引用块、分割线</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">💻 代码支持</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 行内代码</li>
                <li>• 代码块（语法高亮）</li>
                <li>• 支持 28+ 编程语言</li>
                <li>• 一键复制代码</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📊 表格</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 可调整大小</li>
                <li>• 添加/删除行列</li>
                <li>• 表头支持</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🖼️ 图片</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 拖拽/粘贴上传</li>
                <li>• 点击放大预览</li>
                <li>• 替换和删除</li>
                <li>• 自动尺寸检测</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📎 文件</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PDF、Word、Excel</li>
                <li>• TXT、Markdown</li>
                <li>• 最大 20MB</li>
                <li>• 下载和替换</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">👥 @提及</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 输入 @ 触发</li>
                <li>• 模糊搜索用户</li>
                <li>• 键盘导航</li>
                <li>• 高亮显示</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快捷键说明 */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>键盘快捷键</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">粗体</span>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl+B</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">斜体</span>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl+I</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">撤销</span>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">重做</span>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl+Shift+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">代码块</span>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl+Alt+C</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">引用</span>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl+Shift+B</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
