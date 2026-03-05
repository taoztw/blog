# Plate.js 学习指南

> 基于本项目实际代码的 Plate.js 核心原理教程。

---

## 目录

1. [底层基础：Slate.js](#一底层基础slatejs)
2. [Plate.js 在 Slate 之上做了什么](#二platejs-在-slate-之上做了什么)
3. [以 H1 标题为例理解插件原理](#三以-h1-标题为例完整理解插件原理)
4. [Plugin 系统的分层架构](#四plugin-系统的分层架构)
5. [项目中与 Plate.js 相关的 API 路由](#五项目中与-platejs-相关的-api-路由)
6. [学习路径建议](#六学习路径建议)

---

## 一、底层基础：Slate.js

Plate.js 是基于 **Slate.js** 构建的上层框架。要理解 Plate，必须先理解 Slate。

### 核心思想：编辑器 = 一棵 JSON 树

编辑器的内容不是 HTML，而是一棵**结构化的 JSON 树**。看项目中 `src/components/editor/plate-editor.tsx` 的初始值：

```json
{
  "type": "h1",
  "children": [{ "text": "Welcome to the Plate Playground!" }]
}
```

这就是 Slate 数据模型的核心：

```
Document (Value)
  ├── Element { type: "h1" }        ← 块级节点 (Block Element)
  │     └── Text { text: "Hello" }  ← 叶子节点 (Leaf / Text Node)
  ├── Element { type: "p" }
  │     ├── Text { text: "normal " }
  │     ├── Text { text: "bold", bold: true }   ← Mark (文本标记)
  │     └── Element { type: "a", url: "..." }   ← 行内节点 (Inline Element)
  │           └── Text { text: "link" }
  └── Element { type: "blockquote" }
        └── Element { type: "p" }               ← 嵌套！
              └── Text { text: "quoted text" }
```

### 三种节点类型

| 类型               | 说明                           | 项目中的例子                                   |
| ------------------ | ------------------------------ | ---------------------------------------------- |
| **Element (块级)** | 独占一行的容器                 | `h1`, `p`, `blockquote`, `code_block`, `table` |
| **Element (行内)** | 嵌在文本行中                   | `a` (链接), `mention`                          |
| **Text (叶子)**    | 最终的文本内容，可以携带 marks | `{ text: "bold", bold: true }`                 |

### 关键概念：Operation → Transform → Normalize

```
用户操作 (键盘/鼠标)
    ↓
Transform (变换函数)  ← 如：Transforms.setNodes(editor, { type: 'h1' })
    ↓
Operation (原子操作)  ← 如：set_node, insert_text, split_node, merge_node
    ↓
Normalize (规范化)    ← 自动修复不合法的文档结构
    ↓
Render (渲染)         ← React 重新渲染变化的节点
```

每次编辑都经过这个流程。Slate 只有大约 **9 种原子操作**（insert_text, remove_text, set_node, insert_node, remove_node, merge_node, split_node, move_node, set_selection），所有复杂编辑都是这些操作的组合。

---

## 二、Plate.js 在 Slate 之上做了什么

Slate 是"无头"的 (headless)——它只管数据和变换，不管 UI。Plate 加上了：

```
┌─────────────────────────────────────────┐
│              Plate.js 层                 │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  │
│  │ Plugin   │  │ Component│  │ Kit   │  │
│  │ System   │  │ Registry │  │ 系统  │  │
│  └──────────┘  └──────────┘  └───────┘  │
├─────────────────────────────────────────┤
│              Slate.js 层                 │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  │
│  │ Editor   │  │ Transform│  │ Norm- │  │
│  │ (JSON树) │  │ (变换)   │  │ alize │  │
│  └──────────┘  └──────────┘  └───────┘  │
├─────────────────────────────────────────┤
│              React 层                    │
│  contentEditable + 虚拟渲染              │
└─────────────────────────────────────────┘
```

**Plate 的核心贡献是 Plugin System（插件系统）。**

---

## 三、以 H1 标题为例，完整理解插件原理

### 第 1 层：插件定义（声明"H1 是什么"）

`H1Plugin` 来自 `@platejs/basic-nodes`，本质上它告诉编辑器：

```typescript
// 伪代码 - H1Plugin 内部大致做的事
const H1Plugin = createPlatePlugin({
  key: "h1", // 插件唯一标识，也是 JSON 中的 type 值
  node: {
    isElement: true, // 这是一个 Element（不是 Text）
    isBlock: true, // 这是块级的（独占一行）
  },
});
```

这一步只是**注册**——告诉 Slate："在文档中遇到 `type: 'h1'` 的节点，它是一个块级元素。"

### 第 2 层：配置插件（定义行为 + 绑定组件）

在 `src/components/editor/plugins/basic-blocks-kit.tsx` 中：

```typescript
H1Plugin.configure({
  node: {
    component: H1Element, // 告诉 Plate 用哪个 React 组件渲染
  },
  rules: {
    break: { empty: "reset" }, // 行为规则：空的 H1 里按回车 → 变回段落
  },
  shortcuts: {
    toggle: { keys: "mod+alt+1" }, // 快捷键：Cmd+Alt+1 切换 H1
  },
});
```

`.configure()` 做了三件事：

| 配置项                       | 作用                        | 对应的 Slate 层          |
| ---------------------------- | --------------------------- | ------------------------ |
| `component: H1Element`       | 渲染时用 `<h1>` 标签 + 样式 | React 渲染层             |
| `rules.break.empty: "reset"` | 空 H1 按回车变回 `<p>`      | Normalize / Transform 层 |
| `shortcuts.toggle`           | 快捷键绑定                  | 事件处理层               |

### 第 3 层：React 组件（定义"H1 长什么样"）

在 `src/components/ui/heading-node.tsx` 中：

```typescript
export function H1Element(props: PlateElementProps) {
  return <HeadingElement variant="h1" {...props} />;
}

function HeadingElement({ variant, ...props }) {
  return (
    <PlateElement
      as={variant}                               // 渲染为 <h1> HTML 标签
      className={headingVariants({ variant })}   // Tailwind 样式
    >
      {props.children}                           // 渲染子节点（文本内容）
    </PlateElement>
  );
}
```

**`PlateElement`** 是 Plate 提供的基础组件，它：

1. 接收 Slate 传来的 `element` 数据（如 `{ type: 'h1', children: [...] }`）
2. 渲染为对应的 HTML 标签
3. 附加 Slate 需要的 `data-*` 属性（用于选区定位）
4. 传递 `children`（Slate 会递归渲染子节点）

### 第 4 层：自动格式化（如何触发"创建 H1"）

用户可以通过多种方式创建 H1：

**方式 1：Markdown 语法 —— 输入 `# ` 自动转换**

在 `src/components/editor/plugins/autoformat-kit.tsx` 中配置：

```typescript
{ match: '# ', mode: 'block', type: 'h1' }
```

当用户在段落开头输入 `# `（井号+空格）时，autoformat 插件会：

```
1. 监听 onInput 事件
2. 检测到输入匹配 '# ' 模式
3. 调用 Slate Transform：setNodes(editor, { type: 'h1' })
4. 删除 '# ' 文字本身
5. Slate 触发 re-render → React 用 H1Element 组件重新渲染该节点
```

**方式 2：快捷键 —— `Cmd+Alt+1`**

Plugin 的 `shortcuts.toggle` 配置会注册一个键盘事件处理器：

```
1. 监听 onKeyDown
2. 匹配到 Cmd+Alt+1
3. toggle 逻辑：如果当前节点是 h1 → 变回 p，否则变为 h1
4. 调用 setNodes(editor, { type: 'h1' })  或  { type: 'p' }
```

**方式 3：工具栏/斜杠命令 —— 点击按钮**

调用 `src/components/editor/transforms.ts` 中的：

```typescript
setBlockType(editor, "h1"); // 内部调用 Slate 的 setNodes
```

### 完整的数据流

用户输入 `# Hello World`，发生了什么：

```
1. 用户输入 "# "
     ↓
2. AutoformatPlugin 的 onInput handler 检测到匹配
     ↓
3. 调用 editor.tf.setNodes({ type: 'h1' })
   + 删除 "# " 文本
     ↓
4. Slate 生成 Operation: set_node({ type: 'h1' })
     ↓
5. Slate 运行 Normalize（检查文档合法性）
     ↓
6. React 收到变更通知，重新渲染
     ↓
7. Plate 查找 type='h1' 对应的组件 → H1Element
     ↓
8. H1Element 渲染: <h1 class="mt-[1.6em] pb-1 font-bold text-4xl">Hello World</h1>
```

用户接着输入 "Hello World"，按回车两次：

```
第一次回车:
  → split_node 操作 → 创建一个新的 h1 节点（空的）

第二次回车（在空 H1 中）:
  → rules.break.empty: "reset" 生效
  → 把空 h1 变成 p（段落）
  → 用户可以继续写正文
```

---

## 四、Plugin 系统的分层架构

项目用了 **Kit 模式**——把相关插件打包在一起：

```
EditorKit (editor-kit.tsx)
  ├── BasicBlocksKit      → [ParagraphPlugin, H1Plugin, H2Plugin, ..., BlockquotePlugin, HrPlugin]
  ├── BasicMarksKit       → [BoldPlugin, ItalicPlugin, UnderlinePlugin, ...]
  ├── CodeBlockKit        → [CodeBlockPlugin]
  ├── TableKit            → [TablePlugin]
  ├── LinkKit             → [LinkPlugin]
  ├── ListKit             → [ListPlugin]
  ├── AutoformatKit       → [AutoformatPlugin + rules]
  ├── AIKit               → [AIPlugin, CopilotPlugin]
  ├── CommentKit          → [CommentPlugin]
  ├── DndKit              → [DndPlugin]
  └── ... (60+ 个插件)
```

每个 Plugin 都可以配置：

| 能力                                           | 说明                   |
| ---------------------------------------------- | ---------------------- |
| `node.component`                               | 注册渲染组件           |
| `node.isElement / isBlock / isInline / isVoid` | 声明节点类型特性       |
| `rules.break`                                  | 控制回车行为           |
| `shortcuts`                                    | 注册快捷键             |
| `handlers.onKeyDown`                           | 自定义键盘处理         |
| `normalizeNode`                                | 自定义规范化逻辑       |
| `decorate`                                     | 装饰渲染（如语法高亮） |
| `inject`                                       | 向其他插件注入行为     |

### 自动格式化规则一览

**文本 Marks 自动格式化：**

| 输入         | 效果          |
| ------------ | ------------- |
| `**text**`   | **粗体**      |
| `__text__`   | <u>下划线</u> |
| `*text*`     | _斜体_        |
| `~~text~~`   | ~~删除线~~    |
| `` `text` `` | `代码`        |
| `^text^`     | 上标          |
| `~text~`     | 下标          |
| `==text==`   | 高亮          |

**块级自动格式化：**

| 输入               | 效果               |
| ------------------ | ------------------ |
| `# `               | 标题 1             |
| `## `              | 标题 2             |
| `### ` ~ `###### ` | 标题 3-6           |
| `> `               | 引用块             |
| ` ``` `            | 代码块             |
| `---` / `___`      | 分割线             |
| `* ` 或 `- `       | 无序列表           |
| `1. `              | 有序列表           |
| `[] `              | 待办事项（未勾选） |
| `[x] `             | 待办事项（已勾选） |

### 快捷键一览

| 快捷键                    | 功能           |
| ------------------------- | -------------- |
| `Cmd+Alt+1` ~ `Cmd+Alt+6` | 切换标题 H1-H6 |
| `Cmd+Shift+>`             | 切换引用块     |
| `Cmd+B`                   | 粗体           |
| `Cmd+I`                   | 斜体           |
| `Cmd+U`                   | 下划线         |
| `Cmd+J`                   | AI 对话        |
| `Cmd+Shift+M`             | 添加评论       |
| `Space` (空行中)          | AI 菜单        |
| `/`                       | 斜杠命令菜单   |

---

## 五、项目中与 Plate.js 相关的 API 路由

### 1. `/api/ai/command` — AI 编辑主接口

**文件**：`src/app/api/ai/command/route.ts`

当在编辑器里按 `Cmd+J` 使用 AI 功能时调用。它做了几件事：

- 用 `createSlateEditor` + `BaseEditorKit` 在服务端创建一个只读编辑器实例来分析文档内容
- 通过 Azure OpenAI 提供三种 AI 工具：
  - **generate** — 生成新内容（续写、总结）
  - **edit** — 编辑选中文本（改语法、改语气）
  - **comment** — 对内容添加评论
  - **table** — 编辑表格单元格
- 使用 AI SDK 的 `streamText` 流式返回结果

附带的 prompt 文件在 `src/app/api/ai/command/prompt/`：

| 文件                     | 用途                     |
| ------------------------ | ------------------------ |
| `getChooseToolPrompt.ts` | 让 AI 自动选择用哪个工具 |
| `getGeneratePrompt.ts`   | 生成内容的 prompt        |
| `getEditPrompt.ts`       | 编辑内容的 prompt        |
| `getCommentPrompt.ts`    | 添加评论的 prompt        |
| `getEditTablePrompt.ts`  | 编辑表格的 prompt        |

### 2. `/api/ai/copilot` — AI 自动补全

**文件**：`src/app/api/ai/copilot/route.ts`

Copilot 功能（类似 GitHub Copilot 的灰色补全文字）。用 `generateText` 生成短文本补全，最多 50 tokens。编辑器中光标停留时自动触发。

### 3. `/api/upload` — 文件上传

**文件**：`src/app/api/upload/route.ts`

编辑器中拖拽/粘贴图片、文件时调用。上传到 Cloudflare R2 存储。支持图片、PDF、Word、Excel 等格式，限制 20MB。

### 4. `/api/uploadthing` — UploadThing 上传

**文件**：`src/app/api/uploadthing/route.ts`

另一个上传通道，使用 UploadThing 服务。

### 数据流总结

```
编辑器 (Plate.js)
  ├── Cmd+J / Space → POST /api/ai/command    → AI 生成/编辑/评论
  ├── 光标停留       → POST /api/ai/copilot    → AI 自动补全
  ├── 拖拽/粘贴图片  → POST /api/upload         → 上传到 R2
  ├── UploadThing    → POST /api/uploadthing    → 上传到 UploadThing
  └── 显示图片/文件  → GET  /api/file?key=...   → 从 R2 读取
```

---

## 六、学习路径建议

```
阶段 1: 理解数据模型
  ├── 读 Slate.js 文档的 "Concepts" 部分 (https://docs.slatejs.org)
  ├── 理解 Element vs Text vs Mark
  └── 在浏览器控制台打印 editor.children 看数据结构

阶段 2: 理解 Transform
  ├── 学习 Transforms.setNodes / insertNodes / removeNodes
  ├── 理解 Operation 的类型（9 种原子操作）
  └── 理解 Selection (Path + Point + Range)

阶段 3: 理解 Plugin
  ├── 看项目中的 basic-blocks-kit.tsx — 最简单的插件配置
  ├── 看 heading-node.tsx — 最简单的组件渲染
  └── 尝试自己写一个最小插件（比如自定义 callout）

阶段 4: 理解高级机制
  ├── Normalize（文档修复）
  ├── Decorate（装饰渲染，如代码高亮）
  ├── Serialize / Deserialize（HTML/Markdown 转换）
  └── 协作编辑（OT / CRDT）
```

### 推荐阅读

- **Slate.js 官方文档**：https://docs.slatejs.org — 先读 Walkthroughs 的前 3 篇
- **Plate.js 官方文档**：https://platejs.org/docs — 尤其是 Plugin 和 Editor 部分
- **项目代码**——就是最好的学习材料，因为它已经配置了 60+ 个插件

### 动手实验

在浏览器的编辑器页面打开 DevTools Console，输入一些内容后执行：

```javascript
document.querySelector("[data-slate-editor]").__slate_editor.children;
```

你会看到整个文档的 JSON 树——这就是 Slate 的数据模型。

---

## 项目文件结构参考

```
src/components/editor/
├── plate-editor.tsx           # 主编辑器组件
├── editor-kit.tsx             # 插件聚合（完整编辑模式）
├── editor-base-kit.tsx        # 只读插件聚合（静态渲染）
├── plate-types.ts             # 类型定义
├── transforms.ts              # 内容操作工具函数
├── settings-dialog.tsx        # AI 设置 UI
├── use-chat.ts                # AI 聊天 hook
├── plugins/
│   ├── basic-blocks-kit.tsx   # H1-H6、段落、引用、分割线
│   ├── autoformat-kit.tsx     # Markdown 自动格式化规则
│   ├── ai-kit.tsx             # AI 功能
│   ├── comment-kit.tsx        # 评论功能
│   ├── suggestion-kit.tsx     # 修改建议
│   └── ... (46+ 插件配置文件)

src/components/ui/
├── editor.tsx                 # 编辑器容器组件
├── heading-node.tsx           # H1-H6 渲染组件
├── paragraph-node.tsx         # 段落渲染组件
├── block-discussion.tsx       # 评论/建议 UI
└── ... (40+ 节点渲染组件)

src/app/api/
├── ai/command/route.ts        # AI 编辑主接口
├── ai/copilot/route.ts        # AI 自动补全
├── upload/route.ts            # 文件上传
└── uploadthing/route.ts       # UploadThing 上传
```

---

> **总结**：Plate.js 编辑器的本质是「JSON 树 + 变换函数 + React 渲染」，Plugin 系统把这三者打包成可插拔的模块。理解了这个核心模型，所有功能都是在这个框架上的扩展。
