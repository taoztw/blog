"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import type { CreateTagData, Tag } from "@/global";

interface CreateOrEditTagDialogProps {
  tag?: Tag | null;
  onCreateTag?: (data: CreateTagData) => Promise<void>;
  onEditTag?: (id: string, data: CreateTagData) => Promise<void>;
  trigger?: React.ReactNode;
  /** 用于外部控制编辑弹窗是否显示 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateOrEditTagDialog({
  tag,
  onCreateTag,
  onEditTag,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateOrEditTagDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTagData>({
    name: "",
    description: "",
    color: "",
    icon: "",
  });

  const isEditMode = !!tag;

  useEffect(() => {
    if (isEditMode && tag) {
      setFormData({
        name: tag.name || "",
        description: tag.description || "",
        color: tag.color || "",
        icon: tag.icon || "",
      });
    } else {
      setFormData({ name: "", description: "", color: "", icon: "" });
    }
  }, [tag, isEditMode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      if (isEditMode && tag && onEditTag) {
        await onEditTag(tag.id, {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          color: formData.color?.trim() || undefined,
          icon: formData.icon?.trim() || undefined,
        });
      } else if (onCreateTag) {
        await onCreateTag({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          color: formData.color?.trim() || undefined,
          icon: formData.icon?.trim() || undefined,
        });
      }
      setFormData({ name: "", description: "", color: "", icon: "" });
      setOpen(false);
    } catch (error) {
      console.error(`${isEditMode ? "编辑" : "创建"}标签失败:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {!isEditMode && (
        <DialogTrigger asChild>
          {/* 新建的时候才显示触发按钮 */}
          {trigger ?? (
            <Button>
              <Plus className="h-4 w-4" />
              新建标签
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "编辑标签" : "创建新标签"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "修改标签信息，点击保存后生效。" : "填写标签信息，创建一个新的内容标签。"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="name"
                className="text-right"
              >
                名称 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="请输入标签名称"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label
                htmlFor="description"
                className="text-right pt-2"
              >
                描述
              </Label>
              <Textarea
                id="description"
                value={formData.description!}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="请输入标签描述（可选）"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="color"
                className="text-right"
              >
                颜色
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || "#3b82f6"}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  value={formData.color || ""}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label
                htmlFor="icon"
                className="text-right pt-2"
              >
                图标
              </Label>
              <div className="col-span-3 space-y-2">
                <Textarea
                  id="icon"
                  value={formData.icon || ""}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="col-span-3 max-h-32 overflow-y-auto font-mono text-xs"
                  placeholder="粘贴 SVG 代码（可选）"
                  rows={3}
                />
                {formData.icon && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {formData.icon.trimStart().startsWith("<svg") ? (
                      <>
                        <span>预览:</span>
                        <span
                          className="size-6 [&>svg]:size-full"
                          dangerouslySetInnerHTML={{ __html: formData.icon }}
                        />
                      </>
                    ) : (
                      <span className="text-destructive">请输入有效的 SVG 代码</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (isEditMode ? "保存中..." : "创建中...") : isEditMode ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
