"use client";

import { ImageService } from "@/components/dashboard/image-service";
import { TagsSelect } from "@/components/tags-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectWithRelations } from "@/global";
import { PROJECT_STATUS_ENUM } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { ImageIcon, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface CreateOrEditProjectDialogProps {
  trigger: React.ReactNode;
  project?: ProjectWithRelations | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const projectStatuses = [
  { value: PROJECT_STATUS_ENUM.DRAFT, label: "草稿" },
  { value: PROJECT_STATUS_ENUM.PUBLISHED, label: "已发布" },
];

export function CreateOrEditProjectDialog({
  trigger,
  project,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateOrEditProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    categoryId: "",
    status: PROJECT_STATUS_ENUM.DRAFT,
    githubUrl: "",
    demoUrl: "",
    blogUrl: "",
    tagIds: [] as string[],
    sortOrder: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // 获取所有标签
  const { data: tags = [] } = api.project.getAllTags.useQuery();

  // 获取所有分类作为项目类型
  const { data: categories = [] } = api.category.getAll.useQuery();

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl || "",
        categoryId: project.categoryId,
        status: project.status || PROJECT_STATUS_ENUM.DRAFT,
        githubUrl: project.githubUrl || "",
        demoUrl: project.demoUrl || "",
        blogUrl: project.blogUrl || "",
        tagIds: project.tags ? project.tags.map((pt) => pt.tag.id) : [],
        sortOrder: project.sortOrder || 0,
      });
    }
  }, [project]);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        categoryId: "",
        status: PROJECT_STATUS_ENUM.DRAFT,
        githubUrl: "",
        demoUrl: "",
        blogUrl: "",
        tagIds: [],
        sortOrder: 0,
      });
    }
  };


  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();
      const imageUrl = ImageService.getImageUrl(result.key);

      setFormData((prev) => ({
        ...prev,
        imageUrl: imageUrl,
      }));

      toast.success("图片上传成功");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("图片上传失败");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageUpload(e.dataTransfer.files[0]);
      }
    },
    [handleImageUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleImageUpload(e.target.files[0]);
      }
    },
    [handleImageUpload]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("请输入项目名称");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("请输入项目描述");
      return;
    }

    onSubmit(formData);
    handleOpenChange(false);
  };

  const dialogContent = (
    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle>{isEditing ? "编辑项目" : "创建项目"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <div className="grid auto-rows-min gap-6 pr-2">
            <div className="grid gap-3">
              <Label htmlFor="title">项目名称 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="输入项目名称"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">项目描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="输入项目描述"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="type">项目类型</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              <Label>项目图片</Label>
              {formData.imageUrl ? (
                <div className="relative">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={formData.imageUrl} alt="项目图片" className="w-full h-full object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground animate-spin" />
                      <p className="text-sm text-muted-foreground">上传中...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">点击或拖拽上传图片</p>
                      <p className="text-xs text-muted-foreground">支持 JPG, PNG, GIF, WebP 格式，最大 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="githubUrl">GitHub 链接</Label>
              <Input
                id="githubUrl"
                value={formData.githubUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="demoUrl">演示链接</Label>
              <Input
                id="demoUrl"
                value={formData.demoUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))}
                placeholder="https://demo.example.com"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="blogUrl">博客文章链接</Label>
              <Input
                id="blogUrl"
                value={formData.blogUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, blogUrl: e.target.value }))}
                placeholder="https://blog.example.com/..."
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="sortOrder">排序权重</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="grid gap-3">
              <Label>标签</Label>
              <TagsSelect
                tags={tags}
                selectedTagIds={formData.tagIds}
                onSelectedChange={(tagIds) => setFormData((prev) => ({ ...prev, tagIds }))}
                placeholder="选择标签..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "保存中..." : isEditing ? "更新" : "创建"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
