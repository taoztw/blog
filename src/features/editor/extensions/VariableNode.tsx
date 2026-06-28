// src/components/Editor/extensions/VariableNode.tsx
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Pencil } from "lucide-react";
import { useState } from "react";

// 变量节点的 React 组件
const VariableNodeView = ({ node, updateAttributes }: any) => {
  const { variableName, value } = node.attrs;
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  const handleSave = () => {
    updateAttributes({ value: inputValue });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      {/* 左侧变量标记 */}
      <span className="text-red-500">{`{{${variableName}`}</span>

      {/* 编辑按钮 */}
      <button
        type="button"
        className="group/variable translate-y-[4px] ml-1 -mt-1.5 rounded transition border border-border text-sm text-muted-foreground overflow-hidden whitespace-nowrap max-w-[200px] min-w-[24px] inline-flex items-center"
        onClick={() => setIsEditing(true)}
        title="Add value"
        contentEditable={false}
      >
        <div className="transition relative overflow-hidden whitespace-nowrap group-hover/variable:bg-accent">
          <span className="px-1">{value || ""}</span>
          <div className="opacity-90 group-hover/variable:bg-accent flex items-center m-0.5 rounded-sm px-0.5 pointer-events-none absolute inset-y-0 right-0">
            <Pencil size={14} />
          </div>
        </div>
      </button>

      {/* 右侧变量标记 */}
      <span className="text-red-500">{`}}`}</span>

      {/* 编辑弹窗 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg shadow-lg">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border rounded px-2 py-1 mr-2"
              placeholder={`Enter value for ${variableName}`}
              autoFocus
            />
            <button onClick={handleSave} className="bg-blue-500 text-white px-3 py-1 rounded">
              Save
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

// Tiptap 扩展定义
export const VariableNode = Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      variableName: { default: "" },
      value: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-variable-name]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-type": "variable" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableNodeView);
  },
});
