// src/components/Editor/extensions/FileNode.tsx
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { RefreshCw, Search, Trash2 } from "lucide-react";

// 文件节点的 React 组件
const FileNodeView = ({ node, deleteNode }: any) => {
  const { src, fileName } = node.attrs;

  return (
    <NodeViewWrapper className="react-renderer node-file" contentEditable={false}>
      <div className="relative my-3 pl-2 py-1 pr-1 w-full flex min-w-0 gap-2 items-center justify-start rounded-md border overflow-hidden border-gray-300 bg-white hover:bg-gray-50 ring-1 ring-offset-2 ring-blue-100">
        {/* 缩略图 */}
        <img className="size-7 rounded-sm object-cover object-top" src={src} alt={fileName} />

        {/* 文件名 */}
        <span className="truncate text-sm">{fileName}</span>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-1 ml-auto">
          {/* 查看大图 */}
          <button
            type="button"
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition active:scale-95"
            onClick={() => window.open(src, "_blank")}
          >
            <Search size={16} />
          </button>

          {/* 替换文件 */}
          <label className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition active:scale-95 cursor-pointer">
            <RefreshCw size={16} />
            <input
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
              onChange={(e) => {
                // 处理文件替换逻辑
                console.log("Replace file:", e.target.files?.[0]);
              }}
            />
          </label>

          {/* 删除 */}
          <button
            type="button"
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition active:scale-95"
            onClick={deleteNode}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

// Tiptap 扩展定义
export const FileNode = Node.create({
  name: "fileNode",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      fileName: { default: "" },
      fileId: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="file-node"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "file-node" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileNodeView);
  },
});
