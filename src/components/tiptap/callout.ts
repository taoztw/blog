import { Node, mergeAttributes } from "@tiptap/core";

export const CALLOUT_VARIANTS = ["info", "success", "warning", "danger"] as const;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /** 把当前块包进提示块；已在提示块内时只切换样式 */
      setCallout: (variant?: CalloutVariant) => ReturnType;
      /** 取消提示块，保留其中内容 */
      unsetCallout: () => ReturnType;
    };
  }
}

/**
 * 提示块。只用 renderHTML 输出，不依赖 React 节点视图，
 * 因此编辑器与服务端静态渲染可以共用同一份定义。
 */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info" satisfies CalloutVariant,
        parseHTML: (element) => element.getAttribute("data-variant") ?? "info",
        renderHTML: (attributes) => ({ "data-variant": attributes.variant as string }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0];
  },

  addCommands() {
    return {
      setCallout:
        (variant = "info") =>
        ({ commands, editor }) => {
          if (editor.isActive(this.name)) {
            return commands.updateAttributes(this.name, { variant });
          }
          return commands.wrapIn(this.name, { variant });
        },
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});
