"use client";

import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Maximize2, Upload, X } from "lucide-react";
import { uploadFile, buildFileUrl } from "../utils/upload";
import { validateFile, IMAGE_VALIDATION_OPTIONS } from "../utils/validators";
import { toast } from "sonner";
import Image from "next/image";

interface ImageNodeAttrs {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

/**
 * 图片节点组件
 */
const ImageNodeView = ({ node, updateAttributes, deleteNode }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const attrs = node.attrs as ImageNodeAttrs;

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, IMAGE_VALIDATION_OPTIONS);
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
          alt: result.filename,
        });
        toast.success("图片已替换");
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
    <NodeViewWrapper className="my-4">
      <div className="group relative inline-block max-w-full">
        <img
          src={attrs.src}
          alt={attrs.alt ?? ""}
          title={attrs.title ?? ""}
          className="max-w-full h-auto rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsOpen(true)}
          style={{
            width: attrs.width ? `${attrs.width}px` : undefined,
            height: attrs.height ? `${attrs.height}px` : undefined,
          }}
        />

        {/* 悬停工具栏 */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={() => setIsOpen(true)}
            title="查看大图"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <label
            className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 cursor-pointer"
            title="替换图片"
          >
            <Upload className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReplace}
              disabled={isUploading}
            />
          </label>

          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8"
            onClick={() => deleteNode()}
            title="删除图片"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <Spinner className="size-8 text-white" />
          </div>
        )}
      </div>

      {/* 大图预览对话框 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={attrs.src}
              alt={attrs.alt ?? ""}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  );
};

/**
 * 自定义图片扩展
 */
export const CustomImage = Node.create({
  name: "customImage",

  group: "block",

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  // 支持粘贴图片 URL
  addInputRules() {
    return [
      nodeInputRule({
        find: /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src, title] = match;
          return { src, alt, title };
        },
      }),
    ];
  },

  // 支持拖拽图片文件
  addProseMirrorPlugins() {
    const uploadImage = async (file: File, view: any, pos: number) => {
      const validation = validateFile(file, IMAGE_VALIDATION_OPTIONS);
      if (!validation.valid) {
        toast.error(validation.error);
        return false;
      }

      // 插入占位符
      const { schema } = view.state;
      const node = schema.nodes.customImage.create({
        src: "",
        alt: "Uploading...",
      });

      const transaction = view.state.tr.insert(pos, node);
      view.dispatch(transaction);

      // 上传图片
      try {
        const result = await uploadFile(file);
        if (result.success && result.key) {
          const { tr } = view.state;
          const newNode = schema.nodes.customImage.create({
            src: buildFileUrl(result.key),
            alt: result.filename,
          });
          tr.replaceRangeWith(pos, pos + 1, newNode);
          view.dispatch(tr);
          toast.success("图片已上传");
          return true;
        } else {
          toast.error(result.error ?? "上传失败");
          // 删除占位符
          const { tr } = view.state;
          tr.delete(pos, pos + 1);
          view.dispatch(tr);
          return false;
        }
      } catch (error) {
        toast.error("上传失败");
        // 删除占位符
        const { tr } = view.state;
        tr.delete(pos, pos + 1);
        view.dispatch(tr);
        return false;
      }
    };

    return [
      // 拖拽上传插件将在后续实现
    ];
  },
});
