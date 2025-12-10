"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { uploadFile, buildFileUrl } from "../utils/upload";
import {
  validateFile,
  DOCUMENT_VALIDATION_OPTIONS,
  getFileTypeConfig,
  formatFileSize,
} from "../utils/validators";
import { toast } from "sonner";

interface FileNodeAttrs {
  src: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * 文件节点组件
 */
const FileNodeView = ({ node, updateAttributes, deleteNode }: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const attrs = node.attrs as FileNodeAttrs;
  const fileConfig = getFileTypeConfig(attrs.mimeType);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = attrs.src;
    a.download = attrs.filename;
    a.click();
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, DOCUMENT_VALIDATION_OPTIONS);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file);
      if (result.success && result.key) {
        updateAttributes({
          src: buildFileUrl(result.key),
          filename: result.filename ?? file.name,
          size: result.size ?? file.size,
          mimeType: result.mimeType ?? file.type,
        });
        toast.success("文件已替换");
      } else {
        toast.error(result.error ?? "上传失败");
      }
    } catch (error) {
      toast.error("上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <NodeViewWrapper>
      <div className="my-3 p-4 border rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
        <div className="flex items-center gap-3">
          {/* 文件图标 */}
          <div className="text-3xl flex-shrink-0">{fileConfig.icon}</div>

          {/* 文件信息 */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {attrs.filename}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatFileSize(attrs.size)} · {fileConfig.label}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={isUploading}
            >
              <Download className="h-4 w-4 mr-1" />
              下载
            </Button>

            <label
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:opacity-50"
              title="替换文件"
            >
              <Upload className="h-4 w-4 mr-1" />
              替换
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.zip"
                className="hidden"
                onChange={handleReplace}
                disabled={isUploading}
              />
            </label>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteNode()}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <Spinner className="size-6" />
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

/**
 * 文件块扩展
 */
export const FileNode = Node.create({
  name: "fileBlock",

  group: "block",

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      filename: {
        default: "file",
      },
      size: {
        default: 0,
      },
      mimeType: {
        default: "application/octet-stream",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "file" }),
      [
        "a",
        {
          href: HTMLAttributes.src,
          download: HTMLAttributes.filename,
        },
        HTMLAttributes.filename,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileNodeView);
  },
});
