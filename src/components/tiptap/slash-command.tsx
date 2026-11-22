"use client";

import { Extension, type Editor, type Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import { Suggestion } from "@tiptap/suggestion";
import {
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  InfoIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  type LucideIcon,
  MinusIcon,
  PilcrowIcon,
  QuoteIcon,
  SigmaIcon,
  TableIcon,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { pickAndUploadImages } from "./upload";

export interface SlashCommandOptions {
  /** 选择“公式”时触发，由编辑器打开公式输入框 */
  onMath: (kind: "inline" | "block") => void;
}

interface SlashItem {
  title: string;
  description: string;
  /** 额外的检索词（拼音首字母或英文），标题本身始终参与匹配 */
  keywords: string[];
  icon: LucideIcon;
  run: (ctx: { editor: Editor; range: Range }) => void;
}

function buildItems(options: SlashCommandOptions): SlashItem[] {
  return [
    {
      title: "正文",
      description: "普通段落",
      keywords: ["text", "paragraph", "zw", "p"],
      icon: PilcrowIcon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      title: "标题 1",
      description: "大标题",
      keywords: ["h1", "heading", "bt"],
      icon: Heading1Icon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
    },
    {
      title: "标题 2",
      description: "章节标题",
      keywords: ["h2", "heading", "bt"],
      icon: Heading2Icon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
    },
    {
      title: "标题 3",
      description: "小节标题",
      keywords: ["h3", "heading", "bt"],
      icon: Heading3Icon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
    },
    {
      title: "无序列表",
      description: "圆点列表",
      keywords: ["ul", "bullet", "list", "lb"],
      icon: ListIcon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "有序列表",
      description: "带编号的列表",
      keywords: ["ol", "ordered", "list", "lb"],
      icon: ListOrderedIcon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "任务列表",
      description: "可勾选的待办",
      keywords: ["todo", "task", "check", "rw"],
      icon: ListTodoIcon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      title: "引用",
      description: "引用一段话",
      keywords: ["quote", "blockquote", "yy"],
      icon: QuoteIcon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setBlockquote().run(),
    },
    {
      title: "代码块",
      description: "带语法高亮",
      keywords: ["code", "pre", "dm"],
      icon: CodeIcon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setCodeBlock().run(),
    },
    {
      title: "提示块",
      description: "突出显示一段说明",
      keywords: ["callout", "note", "tip", "ts"],
      icon: InfoIcon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setCallout("info").run(),
    },
    {
      title: "表格",
      description: "3 × 3 表格",
      keywords: ["table", "bg"],
      icon: TableIcon,
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: "图片",
      description: "上传一张图片",
      keywords: ["image", "img", "picture", "tp"],
      icon: ImageIcon,
      run: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        pickAndUploadImages(editor);
      },
    },
    {
      title: "公式",
      description: "独立成行的 LaTeX 公式",
      keywords: ["math", "latex", "katex", "gs"],
      icon: SigmaIcon,
      run: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        options.onMath("block");
      },
    },
    {
      title: "分割线",
      description: "水平分隔",
      keywords: ["hr", "divider", "line", "fgx"],
      icon: MinusIcon,
      run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
  ];
}

function filterItems(items: SlashItem[], query: string): SlashItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) => item.title.toLowerCase().includes(q) || item.keywords.some((keyword) => keyword.startsWith(q))
  );
}

interface SlashMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

interface SlashMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

const SlashMenu = React.forwardRef<SlashMenuHandle, SlashMenuProps>(function SlashMenu({ items, command }, ref) {
  const [selected, setSelected] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setSelected(0), [items]);

  // 只有键盘导航才把选中项滚进可视区。鼠标悬停也会改变选中项，
  // 那时再滚动会让列表在指针下面跳动，导致点击落空。
  const fromKeyboard = React.useRef(false);
  React.useEffect(() => {
    if (!fromKeyboard.current) return;
    fromKeyboard.current = false;
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  React.useImperativeHandle(
    ref,
    () => ({
      onKeyDown: (event) => {
        if (items.length === 0) return false;
        if (event.key === "ArrowDown") {
          fromKeyboard.current = true;
          setSelected((index) => (index + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          fromKeyboard.current = true;
          setSelected((index) => (index - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          const item = items[selected];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }),
    [items, selected, command]
  );

  return (
    <div
      ref={listRef}
      className="max-h-80 w-64 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      {items.length === 0 ? (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">没有匹配的命令</div>
      ) : (
        items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            data-selected={index === selected}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left",
              index === selected && "bg-accent text-accent-foreground"
            )}
            onMouseEnter={() => setSelected(index)}
            // 用 mousedown 并阻止默认行为，避免编辑器先失焦导致菜单提前关闭
            onMouseDown={(event) => {
              event.preventDefault();
              command(item);
            }}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <item.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm">{item.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
            </span>
          </button>
        ))
      )}
    </div>
  );
});

/** 输入 `/` 唤起的块级命令菜单 */
export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      onMath: () => undefined,
    };
  },

  addProseMirrorPlugins() {
    const allItems = buildItems(this.options);

    return [
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        pluginKey: new PluginKey("slashCommand"),
        char: "/",
        allow: ({ editor }) => !editor.isActive("codeBlock"),
        items: ({ query }) => filterItems(allItems, query),
        command: ({ editor, range, props }) => props.run({ editor, range }),
        render: () => {
          let component: ReactRenderer<SlashMenuHandle, SlashMenuProps> | null = null;
          let unmount: (() => void) | null = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenu, {
                editor: props.editor,
                props: { items: props.items, command: props.command },
                className: "z-50",
              });
              const element = component.element as HTMLElement;
              // 编辑器在对话框里时，菜单也要挂在对话框内部：
              // 否则点击菜单会被对话框当成“点击外部”而关闭，且 body 上的 pointer-events: none 会让菜单点不动
              const host = props.editor.view.dom.closest<HTMLElement>('[role="dialog"]') ?? document.body;
              host.appendChild(element);
              unmount = props.mount(element);
            },
            onUpdate: (props) => {
              component?.updateProps({ items: props.items, command: props.command });
            },
            onKeyDown: (props) => component?.ref?.onKeyDown(props.event) ?? false,
            onExit: () => {
              unmount?.();
              component?.element.remove();
              component?.destroy();
              unmount = null;
              component = null;
            },
          };
        },
      }),
    ];
  },
});
