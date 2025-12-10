# Tiptap 富文本编辑器

一个功能完整的富文本编辑器组件，基于 Tiptap 构建，专为评论系统和博客文章编辑设计。

## 功能特性

### 📝 基础格式
- H1-H6 标题（字号经过优化，适合评论框）
- 粗体、斜体、删除线
- 无序/有序/任务列表
- 引用块、水平分割线
- 链接插入

### 💻 代码支持
- 行内代码
- 代码块（带语法高亮）
- 支持 28+ 编程语言
- 语言选择器
- 一键复制代码

### 📊 表格
- 插入表格
- 可调整大小
- 添加/删除行列
- 表头支持

### 🖼️ 图片
- 拖拽/粘贴上传
- 点击放大预览
- 替换和删除
- 自动尺寸检测
- 支持 JPG、PNG、GIF、WebP、SVG

### 📎 文件上传
- PDF、Word、Excel
- TXT、Markdown
- 最大 20MB
- 下载和替换功能
- 文件类型图标和大小显示

### 👥 @提及用户
- 输入 @ 触发提及
- 模糊搜索用户
- 键盘导航（↑↓ 选择，Enter 确认）
- 高亮显示提及用户

### ✨ 其他特性
- Write/Preview 双模式切换
- 响应式设计
- 深色模式支持
- 键盘快捷键
- 撤销/重做
- 清除格式

## 使用方法

### 基础用法

```tsx
import { TiptapEditor } from "@/components/tiptap-editor";
import { useState } from "react";

function MyComponent() {
  const [content, setContent] = useState(null);

  return (
    <TiptapEditor
      content={content}
      onChange={setContent}
      placeholder="开始输入..."
    />
  );
}
```

### 完整配置

```tsx
<TiptapEditor
  content={content}                    // 初始内容（JSON 或 HTML）
  onChange={setContent}                // 内容变化回调
  placeholder="开始输入..."            // 占位符文本
  editable={true}                      // 是否可编辑
  autofocus={false}                    // 是否自动聚焦
  showToolbar={true}                   // 是否显示工具栏
  className="my-custom-class"          // 自定义类名
  minHeight="200px"                    // 最小高度
  maxHeight="600px"                    // 最大高度
  enableFileUpload={true}              // 启用文件上传
  enableMentions={true}                // 启用 @提及
  onSearchUsers={searchUsers}          // 用户搜索函数
/>
```

### 只读渲染

如果只需要渲染内容而不需要编辑功能：

```tsx
import { TiptapRenderer } from "@/components/tiptap-editor";

function CommentDisplay({ commentContent }) {
  return (
    <TiptapRenderer content={commentContent} />
  );
}
```

### @提及用户集成

```tsx
import { TiptapEditor } from "@/components/tiptap-editor";
import type { MentionUser } from "@/components/tiptap-editor/types";

// 定义用户搜索函数
async function searchUsers(query: string): Promise<MentionUser[]> {
  // 从 API 获取用户列表
  const response = await fetch(`/api/users/search?q=${query}`);
  const users = await response.json();

  return users.map(user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
  }));
}

function MyEditor() {
  return (
    <TiptapEditor
      enableMentions={true}
      onSearchUsers={searchUsers}
      {...otherProps}
    />
  );
}
```

## 数据格式

编辑器使用 Tiptap 的 JSON 格式存储内容：

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "标题" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "普通文本 " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "粗体文本" }
      ]
    },
    {
      "type": "customImage",
      "attrs": {
        "src": "/api/file?key=uploads/2025/12/06/abc123.jpg",
        "alt": "图片描述"
      }
    }
  ]
}
```

## 键盘快捷键

| 功能 | 快捷键 |
|------|--------|
| 粗体 | `Ctrl+B` |
| 斜体 | `Ctrl+I` |
| 删除线 | `Ctrl+Shift+S` |
| 行内代码 | `Ctrl+E` |
| 撤销 | `Ctrl+Z` |
| 重做 | `Ctrl+Shift+Z` |
| 无序列表 | `Ctrl+Shift+8` |
| 有序列表 | `Ctrl+Shift+7` |
| 引用 | `Ctrl+Shift+B` |
| 代码块 | `Ctrl+Alt+C` |
| 分割线 | `Ctrl+Shift+-` |

## 文件上传配置

### 支持的文件类型

**图片：**
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG
- 最大 10MB

**文档：**
- PDF
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- TXT
- Markdown (.md)
- ZIP
- 最大 20MB

### 上传 API

编辑器使用 `/api/upload` 端点上传文件。确保：
1. API 支持 FormData
2. 返回格式：`{ success: boolean, key: string, filename: string, size: number, mimeType: string }`
3. 仅 admin 用户有上传权限

## 样式定制

编辑器使用 Tailwind CSS 类名，你可以通过修改 `styles.css` 来定制样式：

```css
/* 修改标题大小 */
.tiptap h1 {
  @apply text-2xl font-bold;
}

/* 修改代码块背景 */
.tiptap pre code.hljs {
  @apply bg-gray-900;
}
```

## 集成到评论系统

### 1. 修改数据库 Schema

```typescript
// schema.ts
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: text("post_id").notNull(),
  content: text("content", { mode: "json" }).$type<JSONContent>().notNull(),
  // ... 其他字段
});
```

### 2. 更新评论表单

```tsx
// components/comments/comments-form.tsx
import { TiptapEditor } from "@/components/tiptap-editor";

function CommentsForm() {
  const [content, setContent] = useState<JSONContent | null>(null);

  const handleSubmit = async () => {
    await api.comments.create.mutate({
      content,
      // ... 其他数据
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TiptapEditor
        content={content}
        onChange={setContent}
        placeholder="写下你的评论..."
        enableMentions={true}
        minHeight="150px"
      />
      <button type="submit">发布评论</button>
    </form>
  );
}
```

### 3. 渲染评论内容

```tsx
// components/comments/comment-item.tsx
import { TiptapRenderer } from "@/components/tiptap-editor";

function CommentItem({ comment }) {
  return (
    <div>
      <TiptapRenderer content={comment.content} />
    </div>
  );
}
```

## 注意事项

1. **字号优化**：标题字号已经过优化，适合评论框等小型输入场景
2. **文件大小**：图片限制 10MB，文档限制 20MB
3. **权限控制**：文件上传仅限 admin 用户
4. **深色模式**：代码高亮会自动适配深色/浅色主题
5. **XSS 防护**：Tiptap 内置 XSS 过滤，但仍建议在后端进行二次验证

## 演示页面

访问 `/editors` 查看完整的演示和功能说明。

## 依赖项

```json
{
  "@tiptap/core": "^3.13.0",
  "@tiptap/react": "^3.13.0",
  "@tiptap/starter-kit": "^3.13.0",
  "@tiptap/extension-code-block-lowlight": "^3.13.0",
  "@tiptap/extension-table": "^3.13.0",
  "@tiptap/extension-mention": "^3.13.0",
  "lowlight": "^3.1.0",
  "tippy.js": "^6.3.7"
}
```

## 类型定义

```typescript
import type { JSONContent } from "@tiptap/core";
import type { MentionUser, TiptapEditorProps } from "@/components/tiptap-editor/types";
```

## 故障排除

### 编辑器不显示
检查是否正确导入了 CSS 文件和所有必需的扩展。

### 文件上传失败
1. 检查 `/api/upload` 端点是否正常
2. 确认用户有 admin 权限
3. 检查文件大小和类型是否符合限制

### 代码高亮不工作
确保已安装 `lowlight` 和 `highlight.js` 依赖。

### @提及不工作
检查是否提供了 `onSearchUsers` 函数，并确保返回正确的用户数据格式。

## License

MIT
