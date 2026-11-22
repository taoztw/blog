"use client";

import { type Editor, isTextSelection } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { BoldIcon, CodeIcon, ItalicIcon, LinkIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";
import * as React from "react";

import { LinkForm, ToolbarButton } from "./toolbar";

/** 选中文字时出现的浮动菜单 */
export function BubbleToolbar({ editor }: { editor: Editor }) {
  const [linkMode, setLinkMode] = React.useState(false);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      code: editor.isActive("code"),
      link: editor.isActive("link"),
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8, onHide: () => setLinkMode(false) }}
      shouldShow={({ editor, state, from, to }) => {
        if (!editor.isEditable || state.selection.empty || !isTextSelection(state.selection)) return false;
        if (editor.isActive("codeBlock")) return false;
        // 只选中了空白（例如跨空段落拖选）时不显示
        return state.doc.textBetween(from, to).trim().length > 0;
      }}
      className="z-40 flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md"
    >
      {linkMode ? (
        // 链接输入直接渲染在菜单内部：焦点留在菜单元素里，菜单才不会因编辑器失焦而关闭
        <LinkForm editor={editor} onDone={() => setLinkMode(false)} />
      ) : (
        <>
          <ToolbarButton label="加粗" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton
            label="斜体"
            active={state.italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton
            label="下划线"
            active={state.underline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon />
          </ToolbarButton>
          <ToolbarButton
            label="删除线"
            active={state.strike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughIcon />
          </ToolbarButton>
          <ToolbarButton
            label="行内代码"
            active={state.code}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <CodeIcon />
          </ToolbarButton>
          <ToolbarButton label="链接" active={state.link} onClick={() => setLinkMode(true)}>
            <LinkIcon />
          </ToolbarButton>
        </>
      )}
    </BubbleMenu>
  );
}
