"use client";

/**
 * 实时 JSON 查看器 —— 学 Slate 的核心工具。
 * 把编辑器当前的 Value 结构原样打印出来,让你直观看到:
 * 每次输入/加粗/换行,底层 JSON 到底发生了什么变化。
 */
export function JsonViewer({
  value,
  label = "当前 Value (Slate JSON)",
}: {
  value: unknown;
  label?: string;
}) {
  return (
    <div className="rounded-lg border border-ink-300 bg-ink-100">
      <div className="border-b border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-600">
        {label}
      </div>
      <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed text-ink-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
