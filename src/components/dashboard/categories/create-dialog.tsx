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
import { Plus, Edit } from "lucide-react";
import type { CreateCategoryData, Category } from "@/global";

interface CreateOrEditCategoryDialogProps {
  category?: Category | null;
  onCreateCategory?: (data: CreateCategoryData) => Promise<void>;
  onEditCategory?: (id: string, data: CreateCategoryData) => Promise<void>;
  trigger?: React.ReactNode;
  /** 用于外部控制编辑弹窗是否显示 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateOrEditCategoryDialog({
  category,
  onCreateCategory,
  onEditCategory,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateOrEditCategoryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
  });

  const isEditMode = !!category;

  useEffect(() => {
    if (isEditMode && category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [category, isEditMode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      if (isEditMode && category && onEditCategory) {
        await onEditCategory(category.id, {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
        });
      } else if (onCreateCategory) {
        await onCreateCategory({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
        });
      }
      setFormData({ name: "", description: "" });
      setOpen(false);
    } catch (error) {
      console.error(`${isEditMode ? "编辑" : "创建"}类别失败:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          {/* 新建的时候才显示触发按钮 */}
          {trigger ?? (
            <Button>
              <Plus className="h-4 w-4" />
              新建类别
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "编辑类别" : "创建新类别"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "修改类别信息，点击保存后生效。" : "填写类别信息，创建一个新的内容分类。"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="请输入类别名称"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                描述
              </Label>
              <Textarea
                id="description"
                value={formData.description!}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="请输入类别描述（可选）"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? (isEditMode ? "保存中..." : "创建中...") : isEditMode ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
