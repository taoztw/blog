"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  ChevronDownIcon,
  CodeIcon,
  CodeXmlIcon,
  ImageIcon,
  InfoIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  MinusIcon,
  QuoteIcon,
  Redo2Icon,
  SigmaIcon,
  StrikethroughIcon,
  TableIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { CalloutVariant } from "./callout";
import { CODE_LANGUAGES } from "./extensions";
import { pickAndUploadImages } from "./upload";

export function ToolbarButton({
  active,
  className,
  label,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & { active?: boolean; label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      aria-pressed={active}
      // 阻止默认行为，点击按钮时不让编辑器失焦、选区不丢
      onMouseDown={(event) => event.preventDefault()}
      className={cn("size-8 shrink-0 text-ink-600", active && "bg-seal/10 text-seal hover:bg-seal/15 hover:text-seal", className)}
      {...props}
    />
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

/** 链接输入表单：固定工具栏的弹层和浮动菜单共用 */
export function LinkForm({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const [href, setHref] = React.useState(() => (editor.getAttributes("link").href as string | undefined) ?? "");
  const hadLink = editor.isActive("link");

  const apply = () => {
    const value = href.trim();
    if (!value) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
    }
    onDone();
  };

  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      <Input
        autoFocus
        value={href}
        onChange={(event) => setHref(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            editor.commands.focus();
            onDone();
          }
        }}
        placeholder="https://"
        className="h-8 w-56 text-sm"
      />
      <Button type="submit" size="sm" className="h-8">
        确定
      </Button>
      {hadLink && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 text-destructive hover:text-destructive"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            onDone();
          }}
        >
          移除
        </Button>
      )}
    </form>
  );
}

const BLOCK_LABELS: Record<string, string> = {
  paragraph: "正文",
  h1: "标题 1",
  h2: "标题 2",
  h3: "标题 3",
  h4: "标题 4",
};

const CALLOUT_LABELS: Record<CalloutVariant, string> = {
  info: "信息",
  success: "成功",
  warning: "注意",
  danger: "警告",
};

interface EditorToolbarProps {
  editor: Editor;
  onMath: (kind: "inline" | "block") => void;
}

export function EditorToolbar({ editor, onMath }: EditorToolbarProps) {
  const [linkOpen, setLinkOpen] = React.useState(false);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      const level = [1, 2, 3, 4].find((l) => editor.isActive("heading", { level: l }));
      return {
        block: level ? `h${level}` : "paragraph",
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        code: editor.isActive("code"),
        link: editor.isActive("link"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        taskList: editor.isActive("taskList"),
        blockquote: editor.isActive("blockquote"),
        codeBlock: editor.isActive("codeBlock"),
        codeLanguage: (editor.getAttributes("codeBlock").language as string | null | undefined) ?? null,
        callout: editor.isActive("callout"),
        table: editor.isActive("table"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });

  return (
    <div className="flex h-11 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border bg-background px-3 scrollbar-hide">
      <ToolbarButton label="撤销" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2Icon />
      </ToolbarButton>
      <ToolbarButton label="重做" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2Icon />
      </ToolbarButton>

      <Divider />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-[5.5rem] shrink-0 justify-between px-2 font-normal text-ink-700"
          >
            {BLOCK_LABELS[state.block]}
            <ChevronDownIcon className="size-3.5 text-ink-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()}>正文</DropdownMenuItem>
          {([1, 2, 3, 4] as const).map((level) => (
            <DropdownMenuItem key={level} onSelect={() => editor.chain().focus().setHeading({ level }).run()}>
              标题 {level}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />

      <ToolbarButton label="加粗" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton label="斜体" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        label="下划线"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton label="删除线" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughIcon />
      </ToolbarButton>
      <ToolbarButton label="行内代码" active={state.code} onClick={() => editor.chain().focus().toggleCode().run()}>
        <CodeIcon />
      </ToolbarButton>

      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <ToolbarButton label="链接" active={state.link}>
            <LinkIcon />
          </ToolbarButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2" onCloseAutoFocus={(event) => event.preventDefault()}>
          <LinkForm editor={editor} onDone={() => setLinkOpen(false)} />
        </PopoverContent>
      </Popover>

      <Divider />

      <ToolbarButton
        label="无序列表"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon />
      </ToolbarButton>
      <ToolbarButton
        label="有序列表"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon />
      </ToolbarButton>
      <ToolbarButton
        label="任务列表"
        active={state.taskList}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListTodoIcon />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="引用"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <QuoteIcon />
      </ToolbarButton>
      <ToolbarButton
        label="代码块"
        active={state.codeBlock}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <CodeXmlIcon />
      </ToolbarButton>

      {state.codeBlock && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="代码语言"
              className="h-8 shrink-0 gap-1 px-2 font-normal text-ink-700"
            >
              {CODE_LANGUAGES.find((language) => language.value === state.codeLanguage)?.label ??
                state.codeLanguage ??
                "自动识别"}
              <ChevronDownIcon className="size-3.5 text-ink-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-h-72 overflow-y-auto"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().updateAttributes("codeBlock", { language: null }).run()}
            >
              自动识别
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {CODE_LANGUAGES.map((language) => (
              <DropdownMenuItem
                key={language.value}
                onSelect={() =>
                  editor.chain().focus().updateAttributes("codeBlock", { language: language.value }).run()
                }
              >
                {language.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton label="提示块" active={state.callout}>
            <InfoIcon />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
          {(Object.keys(CALLOUT_LABELS) as CalloutVariant[]).map((variant) => (
            <DropdownMenuItem key={variant} onSelect={() => editor.chain().focus().setCallout(variant).run()}>
              {CALLOUT_LABELS[variant]}
            </DropdownMenuItem>
          ))}
          {state.callout && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => editor.chain().focus().unsetCallout().run()}>
                取消提示块
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton label="表格" active={state.table}>
            <TableIcon />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
          <DropdownMenuItem
            onSelect={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            插入 3 × 3 表格
          </DropdownMenuItem>
          {state.table && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()}>
                在上方插入行
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>
                在下方插入行
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()}>
                在左侧插入列
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>
                在右侧插入列
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderRow().run()}>
                切换表头行
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => editor.chain().focus().mergeOrSplit().run()}>
                合并 / 拆分单元格
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()}>删除行</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()}>删除列</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => editor.chain().focus().deleteTable().run()}
              >
                删除表格
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarButton label="图片" onClick={() => pickAndUploadImages(editor)}>
        <ImageIcon />
      </ToolbarButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton label="公式">
            <SigmaIcon />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
          <DropdownMenuItem onSelect={() => onMath("inline")}>行内公式</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onMath("block")}>独立公式</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarButton label="分割线" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <MinusIcon />
      </ToolbarButton>
    </div>
  );
}
