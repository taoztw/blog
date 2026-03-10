"use client";

import * as React from "react";
import type { Value } from "platejs";
import { toast } from "sonner";

import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";

interface JournalEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journal?: {
    id: string;
    content: string;
  } | null;
  onSuccess?: () => void;
}

export function JournalEditorDialog({
  open,
  onOpenChange,
  journal,
  onSuccess,
}: JournalEditorDialogProps) {
  const editorValueRef = React.useRef<Value | null>(null);
  const utils = api.useUtils();

  const createMutation = api.journal.create.useMutation({
    onSuccess: () => {
      toast.success("日志创建成功");
      void utils.journal.getByPage.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("创建失败: " + error.message);
    },
  });

  const updateMutation = api.journal.update.useMutation({
    onSuccess: () => {
      toast.success("日志更新成功");
      void utils.journal.getByPage.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("更新失败: " + error.message);
    },
  });

  const initialValue = React.useMemo<Value | undefined>(() => {
    if (!journal?.content) return undefined;

    try {
      const parsed = JSON.parse(journal.content);
      if (Array.isArray(parsed)) return parsed as Value;
    } catch {
      // Content is not JSON, start with empty
    }

    return undefined;
  }, [journal?.content]);

  const handleSave = () => {
    const value = editorValueRef.current;
    if (!value) {
      toast.error("请输入内容");
      return;
    }

    const content = JSON.stringify(value);

    if (journal?.id) {
      // Update existing journal
      updateMutation.mutate({
        id: journal.id,
        data: { content },
      });
    } else {
      // Create new journal
      createMutation.mutate({ content });
    }
  };

  const handleChange = (value: Value) => {
    editorValueRef.current = value;
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-ink-300">
          <DialogTitle className="text-xl font-semibold">
            {journal ? "编辑日志" : "新建日志"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            记录你的想法、灵感和日常思考
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6">
          <PlateEditor
            key={journal?.id ?? "new"}
            initialValue={initialValue}
            onChange={handleChange}
          />
        </div>

        <div className="px-6 py-4 border-t border-ink-300 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" />
                {journal ? "保存中..." : "创建中..."}
              </>
            ) : (
              <>{journal ? "保存" : "创建"}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
