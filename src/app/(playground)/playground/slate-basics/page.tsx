import { LessonShell, DemoPanel } from "@/components/playground/lesson-shell";
import { SlateBasicsDemo } from "@/components/playground/demos/slate-basics-demo";
import { getAdjacent } from "../lessons";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function SlateBasicsLesson() {
  const { prev, next } = getAdjacent("slate-basics");

  return (
    <div className="space-y-8">
      <LessonShell
        doc={<Doc />}
        demo={
          <div className="space-y-4">
            <DemoPanel
              title="裸 Slate 编辑器(可交互)"
              sourcePath="src/components/playground/demos/slate-basics-demo.tsx"
            >
              <SlateBasicsDemo />
            </DemoPanel>
            <p className="text-sm text-ink-500">
              选中文字点工具栏,或用 <Kbd>Ctrl/⌘ + B</Kbd> / <Kbd>Ctrl/⌘ + I</Kbd>。
              下方 JSON 会实时反映底层结构变化 —— 这是理解 Slate 最重要的窗口。
            </p>
          </div>
        }
      />

      <NavFooter prev={prev} next={next} />
    </div>
  );
}

function Doc() {
  return (
    <>
      <h1>裸 Slate 最小编辑器</h1>
      <p>
        在碰 Plate 之前,必须先看清它的地基 ——{" "}
        <strong>Slate</strong>。这一课右侧的编辑器<strong>完全不含 Plate</strong>,
        只用 <code>slate</code> + <code>slate-react</code> 原生 API,大约 200 行。
        吃透它,后面 Plate 的一切封装都不再是黑盒。
      </p>

      <h2>1. Value 就是一段 JSON</h2>
      <p>
        Slate 的文档不是 HTML,而是一个 <strong>节点数组</strong>。右侧 demo 的初始内容,
        底层就是这样:
      </p>
      <pre>
        <code>{`[
  { type: "heading",   children: [{ text: "..." }] },
  { type: "paragraph", children: [
      { text: "普通" },
      { text: "加粗", bold: true },   // ← mark 是文本上的属性
  ]},
]`}</code>
      </pre>
      <p>节点分三类,这是整个 Slate 的核心:</p>
      <ul>
        <li>
          <strong>Editor</strong> —— 根节点,也是所有操作的入口对象
        </li>
        <li>
          <strong>Element</strong> —— 有 <code>type</code> 的块(如 heading / paragraph),
          可嵌套
        </li>
        <li>
          <strong>Text</strong> —— 最底层的叶子,纯文本 + 上面的 marks(
          <code>bold</code> / <code>italic</code>…)
        </li>
      </ul>

      <h2>2. 定位系统:Path / Point / Range</h2>
      <p>Slate 用下标数组定位任意位置,这是所有编辑操作的坐标:</p>
      <ul>
        <li>
          <strong>Path</strong> = <code>[1, 0]</code> —— 第 2 个块里的第 1 个子节点
        </li>
        <li>
          <strong>Point</strong> = Path + <code>offset</code> —— 精确到某个字符位置
        </li>
        <li>
          <strong>Range</strong> = anchor + focus —— 一段<strong>选区</strong>(你选中的那段)
        </li>
      </ul>

      <h2>3. 铁律:只用 Transforms 改文档</h2>
      <p>
        <strong>永远不要直接修改 Value 对象</strong>。所有变更都走 Editor / Transforms API,
        Slate 才能把它拆成原子 operation —— 这是撤销重做和协同编辑的基础。
        看 demo 里的加粗逻辑:
      </p>
      <pre>
        <code>{`function toggleMark(editor, format) {
  if (isMarkActive(editor, format)) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}`}</code>
      </pre>
      <p>
        块切换同理,用 <code>Transforms.setNodes</code> 改当前块的 <code>type</code>。
        点右侧标题按钮,看 JSON 里 <code>type</code> 在 heading / paragraph 之间变化。
      </p>

      <h2>4. 渲染:renderElement vs renderLeaf</h2>
      <p>JSON 怎么变成可编辑 DOM?靠两个渲染函数:</p>
      <ul>
        <li>
          <strong>renderElement</strong> —— 按 <code>type</code> 决定<strong>块</strong>怎么画
          (heading → <code>&lt;h3&gt;</code>,paragraph → <code>&lt;p&gt;</code>)
        </li>
        <li>
          <strong>renderLeaf</strong> —— 按 marks 决定<strong>文本</strong>怎么画
          (bold → <code>&lt;strong&gt;</code>)
        </li>
      </ul>
      <p>
        记住这一点,下一阶段学 Plate 时你会发现:plugin 里写的{" "}
        <code>node: {"{"} component: XxxLeaf {"}"}</code> 本质就是往 renderLeaf/renderElement
        里注册了一个分支。Plate 只是把这套手动逻辑<strong>插件化</strong>了。
      </p>

      <h2>动手练习</h2>
      <p>打开右侧标注的源码文件,试试:</p>
      <ol>
        <li>
          加一个<strong>下划线 underline</strong> mark(仿照 bold:改类型、加
          renderLeaf 分支、加工具栏按钮)
        </li>
        <li>
          加一个 <strong>blockquote</strong> 块类型
        </li>
        <li>
          把加粗快捷键从 <code>Ctrl+B</code> 改成别的键
        </li>
      </ol>
      <p>每次保存,页面秒级热更新 —— 边改边看 JSON,这就是最快的学习闭环。</p>
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-ink-300 bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-700">
      {children}
    </kbd>
  );
}

function NavFooter({
  prev,
  next,
}: {
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}) {
  return (
    <div className="flex items-center justify-between border-t border-ink-300 pt-4">
      {prev ? (
        <Link
          href={`/playground/${prev.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/playground/${next.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand"
        >
          {next.title}
          <ArrowRight className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
