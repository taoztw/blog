# UI 设计系统指南 — 墨色 (Ink) Design System

> 基于本项目实际代码的设计系统使用手册。所有示例均来自仓库,可直接对照阅读。
>
> **可视参考**: 启动 `pnpm dev` 后访问 [/design-system](http://localhost:3000/design-system),源码 [src/app/[locale]/(blog)/design-system/page.tsx](../src/app/[locale]/(blog)/design-system/page.tsx)。

---

## 目录

1. [设计哲学](#一设计哲学)
2. [颜色系统](#二颜色系统)
3. [字体系统](#三字体系统)
4. [组件用法](#四组件用法)
5. [布局与间距](#五布局与间距)
6. [Loading 与异步状态](#六loading-与异步状态)
7. [数据表(Dashboard)](#七数据表dashboard)
8. [反模式速查 — 真实违规案例](#八反模式速查--真实违规案例)
9. [PR 自查清单](#九pr-自查清单)

---

## 一、设计哲学

本博客的视觉系统命名为「**墨色 Ink**」,灵感取自宣纸 + 松烟墨 + 印章朱红:

- **暖褐基调**: 所有中性色色相锁定在 `H≈55-80°`,饱和度 `C≈0.004-0.030`。避免 `oklch(x 0 0)` 纯灰带来的"塑料感"。
- **印章朱红 (`#C23B22`)**: 唯一品牌色,用于强调、链接 hover、加载条等关键视觉。
- **暗色不用纯黑**: 暗色模式背景 `#1D1C19`(浓墨),前景 `#E2DDD4`(米白),保留温度。
- **极致克制的纹理**: 全屏宣纸噪点 overlay,opacity ≈ 1.5%,基本只有靠近屏幕才看得见,但去掉就会觉得"白"。见 [globals.css:232](../src/styles/globals.css#L232)。

→ 一句话:**任何新组件,只要写了 `text-gray-*` / `bg-white` / `bg-black`,就已经违背了这个系统**。

---

## 二、颜色系统

### 2.1 三层结构

颜色按抽象程度分三层,**优先级从高到低**:

| 层级 | 示例 | 何时使用 |
|------|------|---------|
| **语义 token**(首选) | `bg-background`、`text-foreground`、`text-muted-foreground`、`border-border` | 99% 的情况 — 自动适配亮暗模式 |
| **品牌/状态色** | `bg-seal`、`text-success`、`bg-warning` | 强调、状态提示、品牌点缀 |
| **Ink 色阶**(原始素材) | `text-ink-700`、`bg-ink-100` | 需要语义 token 提供不了的精细控制时 |

**Ink 色阶是 mode-aware 的** — `ink-50` 在亮色下是最浅、暗色下是最深(自动反转)。所以 `text-ink-700` 在两种模式下都自动渲染为"正文颜色",**不要手动写 `dark:text-ink-300` 之类的翻转**。规则详见 [CLAUDE.md](../CLAUDE.md) "Anti-pattern" 一节。

### 2.2 语义 token 速查

| Token | 用途 | 真实例子 |
|-------|------|---------|
| `background` | 页面底色 | 全局 body |
| `foreground` | 主要文字、标题 | [footer.tsx:46](../src/components/layouts/footer.tsx#L46) `text-foreground` |
| `card` / `popover` | 卡片、浮层底色 | [project-card.tsx](../src/app/[locale]/(blog)/projects/_components/project-card.tsx) 整个 Card |
| `muted` / `muted-foreground` | 次要背景 / 次要文字 | [footer.tsx:49](../src/components/layouts/footer.tsx#L49) `text-muted-foreground` |
| `border` | 所有边框、分割线 | [footer.tsx:37](../src/components/layouts/footer.tsx#L37) `border-t border-border` |
| `primary` / `primary-foreground` | 主按钮(Button default) | [Button cva](../src/components/ui/button.tsx#L12) |
| `secondary` / `secondary-foreground` | 次按钮 | [Button cva](../src/components/ui/button.tsx#L17) |
| `destructive` | 危险操作、错误 | `<Button variant="destructive">` |
| `accent` / `accent-foreground` | hover / active 高亮 | Ghost button hover |
| `ring` | focus-visible 环 | 所有可聚焦组件 |

### 2.3 状态色(传统中国色)

| Token | Hex | 何时用 |
|-------|-----|--------|
| `seal` | `#C23B22` | 品牌强调、印章、Logo 点缀 |
| `success` | `#5B7A5E` | 成功 toast、绿色标签 |
| `warning` | `#B8863E` | 警告、待审核状态 |
| `info` | `#5C7A8A` | 信息提示、教程链接 |

用法示例(透明背景版):

```tsx
// ✅ 成功提示
<div className="bg-success/10 text-success border border-success/20 rounded-md px-3 py-2">
  发布成功
</div>

// ✅ 品牌点缀(印章红圆点,典型用法)
<span className="w-1 h-1 rounded-full bg-seal" />
```

参考: TOC 当前项的圆点指示器 [design-system/page.tsx:183](../src/app/[locale]/(blog)/design-system/page.tsx#L183) 用 `bg-seal`。

### 2.4 Ink 色阶 — 完整对照

| Token | 亮色 hex | 暗色 hex | 角色(两种模式一致) |
|-------|---------|---------|---------------------|
| `ink-50` | `#FEFDFB` | `#1D1C19` | 页面 / 卡片背景 |
| `ink-100` | `#FAF9F6` | `#2C2520` | 次级背景 |
| `ink-200` | `#F4F2ED` | `#453B32` | muted 背景 / hover |
| `ink-300` | `#E2DDD4` | `#6B5F52` | 边框 / 分割线 |
| `ink-400` | `#C4BDB0` | `#887B6C` | 禁用 / placeholder |
| `ink-500` | `#887B6C` | `#C4BDB0` | 辅助文字 ≥14px |
| `ink-600` | `#6B5F52` | `#E2DDD4` | muted-foreground |
| `ink-700` | `#453B32` | `#F4F2ED` | 正文 |
| `ink-800` | `#2C2520` | `#FAF9F6` | 标题 / foreground |
| `ink-900` | `#1D1C19` | `#FEFDFB` | 高对比强调 |

→ 按**角色**选 token,不要按"亮色 hex 长得像谁"选。

### 2.5 何时用字面 hex(theme-invariant)

少数装饰元素需要**始终深色**或**始终浅色**,不应跟随主题。此时用字面 hex,**不要用 ink 色阶**(否则会被自动翻转)。

真实例子: 登录页左侧装饰面板,无论主题都是黑底白文。

```tsx
// ✅ 始终深色装饰面板 — auth/layout.tsx
<div className="absolute inset-0 bg-[#1d1c19]">
  <div className="absolute inset-0 bg-black/40" />  {/* 永远是暗 overlay */}
  <p className="text-white/40">© 2026</p>           {/* 永远是浅文字 */}
</div>
```

源码: [src/app/[locale]/(auth)/layout.tsx](../src/app/[locale]/(auth)/layout.tsx)

---

## 三、字体系统

### 3.1 字体家族

| 字体 | 变量 | 何时用 |
|------|------|--------|
| **Geist Sans** | `--font-geist-sans` (默认) | 全部 UI、正文、按钮、表单 |
| **Cormorant Garamond** | `font-cormorant` / `font-serif` | 装饰性大标题(诗句、品牌口号、设计稿封面)。**不要**用于按钮、卡片标题等功能性文字 |

真实例子(装饰标题):

```tsx
// about/page.tsx — 陶渊明诗句
<p className="font-cormorant text-3xl font-light tracking-widest text-ink-800">
  此中有真意,欲辨已忘言
</p>
```

源码: [about/page.tsx:8](../src/app/[locale]/(blog)/about/page.tsx#L8)

### 3.2 文字层级(基于 `/design-system` 实际定义)

| 用途 | 类名 |
|------|------|
| Hero 标题(装饰) | `text-4xl font-light tracking-wide font-serif` |
| 页面 H1 | `text-2xl font-semibold tracking-tight` |
| Section H2 | `text-lg font-medium` |
| 正文 | `text-base` (默认 `text-foreground`) |
| 辅助说明 | `text-sm text-muted-foreground` |
| 标注/时间戳 | `text-xs text-muted-foreground` |
| Eyebrow 标签 | `text-xs uppercase tracking-wider text-muted-foreground font-medium` |

### 3.3 色彩层级(配套)

```
text-foreground          标题、强调
text-secondary-foreground 正文
text-muted-foreground    辅助说明 ←最常用
text-ink-400             禁用 / placeholder
text-destructive         错误 / 警示
```

---

## 四、组件用法

> 所有组件源码在 [src/components/ui/](../src/components/ui/),基于 shadcn/ui (style: `new-york`)。**不要直接修改 ui/ 下的文件**(它们是注册表克隆),需要扩展时,在外层包一层封装组件。

### 4.1 Button — 7 变体 × 4 尺寸

源码: [src/components/ui/button.tsx](../src/components/ui/button.tsx)

| Variant | 用途 |
|---------|------|
| `default` | 主操作(发布、保存、提交) |
| `secondary` | 次操作(取消、返回) |
| `outline` | 次操作 + 边框视觉(适合工具栏) |
| `ghost` | 图标按钮、菜单项、低噪声操作 |
| `destructive` | 删除、销毁 |
| `link` | 文字链接形态 |
| `tertiary` | 蓝色调强调(目前用得少,代码里仍在) |

| Size | 高度 |
|------|------|
| `default` | h-9 |
| `sm` | h-8 |
| `lg` | h-10 |
| `icon` | size-9 (正方形) |

```tsx
// ✅ 主操作 + 图标
<Button>
  <Send className="size-4" />
  发布
</Button>

// ✅ 危险操作
<Button variant="destructive" size="sm">
  <Trash2 className="size-4" />
  删除
</Button>

// ✅ 图标按钮
<Button variant="ghost" size="icon" aria-label="设置">
  <Settings className="size-4" />
</Button>
```

**约定**:
- 图标用 `lucide-react`,**固定 `size-4`**(图标 18px 也写 `size-4`,SVG 是矢量缩不影响)。Button 的 CVA 里有 `[&_svg:not([class*='size-'])]:size-4` 兜底。
- icon-only button 必须加 `aria-label`。
- 异步按钮在 loading 时禁用并替换图标为 [Spinner](#六loading-与异步状态)。

### 4.2 Card — 卡片组合

源码: [src/components/ui/card.tsx](../src/components/ui/card.tsx)

骨架:

```tsx
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>副标题或描述</CardDescription>
  </CardHeader>
  <CardContent>主体内容</CardContent>
  <CardFooter>操作按钮区</CardFooter>
</Card>
```

真实案例(项目卡片): [project-card.tsx](../src/app/[locale]/(blog)/projects/_components/project-card.tsx)

```tsx
// 关键样式约定
<Card className="group/card flex h-full flex-col overflow-hidden p-0 shadow-sm transition-shadow group-hover/card:shadow-md">
  {/* 顶部图片区(p-0 让图片贴边) */}
  <div className="relative h-40 w-full overflow-hidden">
    <Image ... className="object-cover transition-transform duration-300 group-hover/card:scale-105" />
    <Badge className="absolute top-3 left-3">{type}</Badge>
  </div>

  <CardHeader>
    <CardTitle className="text-base font-bold group-hover/card:text-primary transition-colors">
      {title}
    </CardTitle>
    <CardDescription className="line-clamp-3">{description}</CardDescription>
  </CardHeader>
  ...
</Card>
```

**约定**:
- 卡片之间的间距由父容器的 `gap-*` 控制,不要在 Card 里加 `mb-*`。
- 卡片用 `bg-card`(语义 token),**不要**写 `bg-white`。
- 全图卡片用 `p-0` 移除 Card 默认 padding,让图片贴边。
- 卡片 hover 抬升用 `shadow-sm → shadow-md` 而非位移,符合"宣纸克制"调性。

### 4.3 Badge — 标签

源码: [src/components/ui/badge.tsx](../src/components/ui/badge.tsx)

```tsx
<Badge>已发布</Badge>                     // 默认 = primary
<Badge variant="secondary">草稿</Badge>
<Badge variant="outline">分类</Badge>
<Badge variant="destructive">删除</Badge>
```

自定义颜色组合(状态色 + 透明背景):

```tsx
// ✅ 成功状态 — 项目封装
<Badge className="bg-success/10 text-success border border-success/20">
  已上线
</Badge>
```

### 4.4 Form 控件

shadcn 表单原语全部在 [src/components/ui/](../src/components/ui/) 下:`input.tsx`、`textarea.tsx`、`select.tsx`、`checkbox.tsx`、`label.tsx`、`form.tsx`(react-hook-form 集成)。

**约定**:
- Label 永远配合 Input 使用,且 `htmlFor` 必填(可访问性)。
- 错误状态由 `aria-invalid` 触发,**不要**手动加 `border-red-500`。Button/Input 的 CVA 都已经写了 `aria-invalid:border-destructive aria-invalid:ring-destructive/20`。
- 表单校验用 react-hook-form + Zod(项目已集成 `@hookform/resolvers`)。

```tsx
// 典型表单字段
<div className="grid gap-2">
  <Label htmlFor="email">邮箱</Label>
  <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
  {errors.email && (
    <p className="text-xs text-destructive">{errors.email.message}</p>
  )}
</div>
```

---

## 五、布局与间距

### 5.1 容器

```tsx
// 博客内容区(footer/blog 通用宽度)
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">...</div>

// 文章正文(更窄,提升可读性)
<div className="mx-auto max-w-2xl">...</div>
```

### 5.2 垂直节奏

- Section 之间: `mb-20`(80px,大幅留白,宣纸感)
- 卡片 grid: `gap-6` 或 `gap-10`(grid)
- 列表项: `space-y-2.5`(小)/ `space-y-4`(中)
- 表单 fields: `grid gap-2` 单字段 / `grid gap-4` 多字段

### 5.3 圆角

| 类名 | 何时用 |
|------|--------|
| `rounded-md` (默认 `0.625rem - 2px`) | Button、Input、Badge |
| `rounded-lg` (默认 `0.625rem`) | Card、Dialog、Popover |
| `rounded-xl` (默认 `0.625rem + 4px`) | 大装饰区(hero 面板、设计系统展示块) |
| `rounded-full` | 头像、圆点、徽章数字 |

CSS 变量 `--radius` 定义在 [globals.css:98](../src/styles/globals.css#L98),改这一个值就能整站调整圆角。

### 5.4 阴影

- 默认: `shadow-xs`(Button、Input 等聚焦元素)
- 卡片浮起: `shadow-sm` → hover `shadow-md`
- Popover/Dropdown: 用 shadcn 内置阴影,不要自己加

---

## 六、Loading 与异步状态

源码: [src/components/ui/spinner.tsx](../src/components/ui/spinner.tsx)

```tsx
import { Spinner } from "@/components/ui/spinner";

// 标准用法 — 行内
{isLoading ? <Spinner className="size-5 mx-auto" /> : <div>{data}</div>}

// 按钮内 loading
<Button disabled={isPending}>
  {isPending ? <Spinner className="size-4" /> : <Send className="size-4" />}
  发布
</Button>
```

**约定**:
- 永远用 `Spinner`,**不要**写自定义 `animate-spin` 的 div。
- 列表/表格初始加载用 `Skeleton`(shadcn `<Skeleton>` 或 `DataTableSkeleton`),不用 spinner。
- 顶部页面跳转进度条已由 [layout.tsx](../src/app/layout.tsx) 的 `NextTopLoader` 处理(色值 `#C23B22`,即 seal),不要再加。

---

## 七、数据表(Dashboard)

Dashboard 所有表格都用 [src/components/data-table/](../src/components/data-table/) 系统,基于 TanStack Table v8 + nuqs 同步 URL 状态。

最小骨架(详见 [CLAUDE.md](../CLAUDE.md) Data Table 章节):

```tsx
"use client";

export function XxxTable() {
  const { data, isFetching } = api.xxx.getMany.useQuery({ limit: 100 });
  const columns = useMemo(() => createXxxColumns({ onEdit, onDelete }), [...]);
  const { table } = useDataTable({ data: data?.items ?? [], columns });

  if (isFetching && !data) {
    return <DataTableSkeleton columnCount={N} rowCount={10} filterCount={2} />;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
```

真实案例:
- [dashboard/posts/_components/posts-table.tsx](../src/app/(dashboard)/dashboard/posts/) — 文章表
- [dashboard/users/_components/user-table.tsx](../src/app/(dashboard)/dashboard/users/) — 用户表
- [dashboard/journals/_components/journal-table.tsx](../src/app/(dashboard)/dashboard/journals/) — 日志表

新建 Dashboard 列表页 = **复制一个已有的、改 router 名 + 列定义就行**,不要自己造表格。

---

## 八、反模式速查 — 真实违规案例

下面列出仓库**当前还存在的违规写法**,新代码不要再复制,顺手看到可以一并清理。

### 8.1 ❌ 冷色纯灰

```tsx
// project-card.tsx:71  — 占位图渐变用了冷灰
<div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
<span className="text-gray-400 text-sm">No Image</span>
```

→ **应改为**: `from-ink-200 to-ink-300` + `text-ink-400`。或更简单地用 `bg-muted text-muted-foreground`。

涉及文件: [project-card.tsx:71-72](../src/app/[locale]/(blog)/projects/_components/project-card.tsx#L71)、[projects/page.tsx:94](../src/app/[locale]/(blog)/projects/page.tsx#L94)、[hero-personal-colorful.tsx](../src/app/[locale]/(blog)/_components/home/hero-personal-colorful.tsx)(多处)、[music-player.tsx:294](../src/app/[locale]/(blog)/_components/home/music-player.tsx#L294)。

### 8.2 ❌ 自己写 skeleton 的灰色矩形

```tsx
// projects/page.tsx — 自己拼骨架屏
<div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
<div className="bg-gray-200 rounded h-4 mb-2"></div>
```

→ **应改为**: 用 shadcn 的 `<Skeleton>` 组件(`src/components/ui/skeleton.tsx`),它已经用了语义色 `bg-accent` 并带 `animate-pulse`。

### 8.3 ❌ 手动翻转 ink 色阶

```tsx
// 错误 — 双重翻转
<p className="text-ink-700 dark:text-ink-300">...</p>
```

→ **应改为**: 直接 `text-ink-700`,色阶本身已 mode-aware。

> 这个反模式之前在仓库里有 21 处,已经清理完(commit 历史可查)。新代码如果再写,等于把刚埋的坑挖出来。

### 8.4 ❌ 装饰组件用 `bg-white` / `bg-black`

```tsx
<section className="bg-white dark:bg-gray-950">...</section>
```

→ **应改为**: `bg-background` 自动适配主题。若是"始终深色"装饰面板,见 [§2.5](#25-何时用字面-hextheme-invariant)。

涉及文件: [hero-personal-colorful.tsx:77,92](../src/app/[locale]/(blog)/_components/home/hero-personal-colorful.tsx#L77)。

### 8.5 ❌ 自定义错误色

```tsx
<p className="text-red-500">出错了</p>
<input className="border-red-500" />
```

→ **应改为**: `text-destructive` / `aria-invalid:true`。

---

## 九、PR 自查清单

提交带 UI 改动的 PR 前,过一遍:

- [ ] 没有出现 `text-gray-*` / `bg-gray-*` / `bg-white` / `bg-black`(theme-invariant 装饰除外)
- [ ] 没有出现 `dark:text-ink-*` / `dark:bg-ink-*` 这种手动翻转
- [ ] 没有出现 `text-red-*` / `border-red-*`(用 `destructive`)
- [ ] 所有按钮用 `<Button>` 组件,没有 `<button className="...">` 裸写
- [ ] 所有加载状态用 `<Spinner>` 或 `<Skeleton>`,没有自定义 `animate-spin`
- [ ] icon-only 元素带 `aria-label`
- [ ] 表单字段:Label + Input 配对,`htmlFor` 与 `id` 对应
- [ ] 卡片浮起用阴影渐变(`shadow-sm` → `shadow-md`),不用 `translate-y`
- [ ] Dashboard 新列表页用了 `DataTable` 系统,没有自己拼表格

---

## 附:文件索引

| 主题 | 文件 |
|------|------|
| 色彩与 token 定义 | [src/styles/globals.css](../src/styles/globals.css) |
| 设计系统展示页 | [src/app/[locale]/(blog)/design-system/page.tsx](../src/app/[locale]/(blog)/design-system/page.tsx) |
| shadcn 配置 | [components.json](../components.json) |
| UI 原语 | [src/components/ui/](../src/components/ui/) |
| 共享组件 | [src/components/](../src/components/) |
| 数据表系统 | [src/components/data-table/](../src/components/data-table/) |
| Tailwind 配置入口 | [src/styles/globals.css](../src/styles/globals.css)(v4 `@theme` 块) |

如有规则歧义,以 [CLAUDE.md](../CLAUDE.md) 为准 — 那里写的是给 AI 看的硬约束,与本文档同步维护。
