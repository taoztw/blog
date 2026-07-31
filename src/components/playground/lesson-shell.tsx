"use client";

import { cn } from "@/lib/utils";
import { FileCode2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * 每课统一外壳:左文档、右 demo 的分栏布局。
 * 大屏左右并排、小屏上下堆叠。
 */
export function LessonShell({
  doc,
  demo,
}: {
  doc: ReactNode;
  demo: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">{doc}</div>
      <div className="lg:sticky lg:top-6 lg:self-start">{demo}</div>
    </div>
  );
}

/** demo 面板容器,带标题与"源码路径"徽章 */
export function DemoPanel({
  title,
  sourcePath,
  children,
  className,
}: {
  title?: string;
  sourcePath?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-ink-300 bg-ink-50", className)}>
      {(title || sourcePath) && (
        <div className="flex items-center justify-between gap-2 border-b border-ink-300 px-4 py-2.5">
          {title && <span className="text-sm font-medium text-ink-800">{title}</span>}
          {sourcePath && <SourceBadge path={sourcePath} />}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

/** 标注该 demo 对应的源码文件,提示学习者去哪改代码 */
export function SourceBadge({ path }: { path: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2 py-1 font-mono text-xs text-ink-600">
      <FileCode2 className="size-3.5" />
      {path}
    </span>
  );
}
