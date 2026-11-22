"use client";

import katex from "katex";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export interface MathDraft {
  kind: "inline" | "block";
  latex: string;
  /** 正在编辑的已有公式的位置；新建时为 null */
  pos: number | null;
}

interface MathDialogProps {
  draft: MathDraft | null;
  onSubmit: (draft: MathDraft) => void;
  onDelete: (draft: MathDraft) => void;
  onClose: () => void;
}

export function MathDialog({ draft, onSubmit, onDelete, onClose }: MathDialogProps) {
  return (
    <Dialog open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {/* 每次打开都重新挂载表单，输入框的初始值直接取自 draft */}
        {draft && <MathForm draft={draft} onSubmit={onSubmit} onDelete={onDelete} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function MathForm({ draft, onSubmit, onDelete, onClose }: MathDialogProps & { draft: MathDraft }) {
  const [latex, setLatex] = React.useState(draft.latex);
  const isEditing = draft.pos !== null;

  const preview = React.useMemo(() => {
    if (!latex.trim()) return "";
    return katex.renderToString(latex, { throwOnError: false, displayMode: draft.kind === "block" });
  }, [latex, draft.kind]);

  const submit = () => {
    if (!latex.trim()) return;
    onSubmit({ ...draft, latex: latex.trim() });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{draft.kind === "block" ? "独立公式" : "行内公式"}</DialogTitle>
      </DialogHeader>

      <Textarea
        autoFocus
        value={latex}
        onChange={(event) => setLatex(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder="E = mc^2"
        className="min-h-24 font-mono text-sm"
      />

      <div className="flex min-h-16 items-center justify-center overflow-x-auto rounded-md border border-border bg-muted px-3 py-2">
        {preview ? (
          // KaTeX 输出的是它自己生成的标记，throwOnError 关闭后错误也会被渲染成文本
          <span dangerouslySetInnerHTML={{ __html: preview }} />
        ) : (
          <span className="text-sm text-muted-foreground">输入 LaTeX 后在这里预览</span>
        )}
      </div>

      <DialogFooter className="sm:justify-between">
        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(draft)}
          >
            删除公式
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="button" onClick={submit} disabled={!latex.trim()}>
            {isEditing ? "更新" : "插入"}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
