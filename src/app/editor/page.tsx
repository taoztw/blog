"use client";

import type { JSONContent } from "@tiptap/core";
import * as React from "react";

import { EMPTY_DOCUMENT, extractTitle } from "@/components/tiptap/document";
import { TiptapEditor } from "@/components/tiptap/tiptap-editor";

/** 新编辑器的试验页：不落库，右下角可以查看当前文档的 JSON */
export default function TiptapPlaygroundPage() {
  const [value, setValue] = React.useState<JSONContent>(EMPTY_DOCUMENT);
  const [showJson, setShowJson] = React.useState(false);

  return (
    <div className="relative h-screen w-full">
      <React.Suspense>
        <TiptapEditor onChange={setValue} />
      </React.Suspense>

      <div className="fixed right-4 bottom-4 z-30 flex max-h-[60vh] w-96 max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
        {showJson && (
          <pre
            data-testid="tiptap-json"
            className="w-full overflow-auto rounded-lg border border-border bg-popover p-3 text-xs text-ink-700 shadow-md"
          >
            {JSON.stringify(value, null, 2)}
          </pre>
        )}
        <button
          type="button"
          onClick={() => setShowJson((open) => !open)}
          className="rounded-md border border-border bg-popover px-2.5 py-1 text-xs text-muted-foreground shadow-sm hover:text-foreground"
        >
          {showJson ? "隐藏 JSON" : `查看 JSON · 标题：${extractTitle(value) || "（空）"}`}
        </button>
      </div>
    </div>
  );
}
