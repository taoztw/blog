import { Heading } from "@tiptap/extension-heading";

/**
 * 自定义标题扩展
 * 缩小标题字号，使其适合评论框和编辑器场景
 * 修改回车行为：在空标题按回车会转为段落
 */
export const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;

        // 检查当前是否在标题节点中
        if ($from.parent.type.name === "heading") {
          // 检查标题是否为空
          if ($from.parent.textContent.length === 0) {
            // 空标题，按回车转为段落
            return editor.commands.setNode("paragraph");
          }
        }

        // 非空标题或不在标题中，使用默认行为（创建新段落）
        return false;
      },
    };
  },
}).configure({
  levels: [1, 2, 3, 4, 5, 6],
});

/**
 * 标题样式类名（使用 Tailwind CSS）
 * 相比默认的 prose 样式，字号更小、更适合评论框
 */
export const HEADING_CLASSES = {
  1: "text-xl font-bold mt-4 mb-2",
  2: "text-lg font-semibold mt-3 mb-2",
  3: "text-base font-semibold mt-2 mb-1",
  4: "text-sm font-medium mt-2 mb-1",
  5: "text-sm font-medium mt-1 mb-1",
  6: "text-sm font-medium mt-1 mb-1",
} as const;
