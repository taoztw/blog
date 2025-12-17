"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Lightbulb, XCircle } from "lucide-react";

// Callout 类型定义
export type CalloutType = "note" | "info" | "warning" | "tip" | "important" | "caution";

// Callout 配置
const CALLOUT_CONFIG: Record<
  CalloutType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    textColor: string;
  }
> = {
  note: {
    label: "Note",
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-500",
    iconColor: "text-blue-500",
    textColor: "text-blue-900 dark:text-blue-100",
  },
  info: {
    label: "Info",
    icon: Info,
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-500",
    iconColor: "text-cyan-500",
    textColor: "text-cyan-900 dark:text-cyan-100",
  },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-500",
    iconColor: "text-green-500",
    textColor: "text-green-900 dark:text-green-100",
  },
  important: {
    label: "Important",
    icon: CheckCircle,
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-500",
    iconColor: "text-purple-500",
    textColor: "text-purple-900 dark:text-purple-100",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-500",
    iconColor: "text-yellow-600",
    textColor: "text-yellow-900 dark:text-yellow-100",
  },
  caution: {
    label: "Caution",
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-500",
    iconColor: "text-red-500",
    textColor: "text-red-900 dark:text-red-100",
  },
};

/**
 * Callout 节点组件
 */
const CalloutComponent = ({ node }: any) => {
  const type = (node.attrs.type as CalloutType) ?? "note";
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;

  return (
    <NodeViewWrapper className="callout-wrapper my-4">
      <div
        className={`flex gap-3 p-4 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor} ${config.textColor}`}
      >
        <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold mb-1">{config.label}</div>
          <NodeViewContent className="callout-content prose prose-sm max-w-none" />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

/**
 * Callout 扩展
 */
export const Callout = Node.create({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  addAttributes() {
    return {
      type: {
        default: "note",
        parseHTML: (element) => element.getAttribute("data-type") ?? "note",
        renderHTML: (attributes) => {
          return {
            "data-type": attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "callout" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes);
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
    };
  },
});
