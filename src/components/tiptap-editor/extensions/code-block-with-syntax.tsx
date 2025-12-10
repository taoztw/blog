"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CODE_BLOCK_LANGUAGES } from "../utils/constants";

// 创建 lowlight 实例
const lowlight = createLowlight(common);

/**
 * 代码块节点组件
 */
const CodeBlockComponent = ({ node, updateAttributes, extension }: any) => {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language ?? "javascript";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent);
      setCopied(true);
      toast.success("代码已复制");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("复制失败");
    }
  };

  const handleLanguageChange = (value: string) => {
    updateAttributes({ language: value });
  };

  return (
    <NodeViewWrapper className="code-block-wrapper my-4">
      <div className="relative group rounded-lg border bg-muted/50">
        {/* 工具栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
              {CODE_BLOCK_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" variant="ghost" onClick={handleCopy} className="h-8">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                复制
              </>
            )}
          </Button>
        </div>

        {/* 代码内容 */}
        <pre className="p-4 overflow-x-auto">
          <NodeViewContent as="code" className="language-{language}" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
};

/**
 * 代码块扩展（带语法高亮）
 */
export const CodeBlockWithSyntax = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
}).configure({
  lowlight,
  defaultLanguage: "javascript",
});
