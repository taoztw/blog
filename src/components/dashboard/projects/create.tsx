"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { ProjectWithRelations } from "@/global";
import { PROJECT_TYPE_ENUM, PROJECT_STATUS_ENUM } from "@/server/db/schema";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ImageService } from "@/components/dashboard/upload/image-service";
import { Upload, ImageIcon, Plus } from "lucide-react";
import { api } from "@/trpc/react";

interface CreateOrEditProjectSheetProps {
  trigger: React.ReactNode;
  project?: ProjectWithRelations | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const projectTypes = [
  { value: PROJECT_TYPE_ENUM.FRONTEND, label: "前端" },
  { value: PROJECT_TYPE_ENUM.BACKEND, label: "后端" },
  { value: PROJECT_TYPE_ENUM.MOBILE, label: "移动端" },
  { value: PROJECT_TYPE_ENUM.TOOL, label: "工具" },
  { value: PROJECT_TYPE_ENUM.AI, label: "AI" },
  { value: PROJECT_TYPE_ENUM.OTHER, label: "其他" },
];

const projectStatuses = [
  { value: PROJECT_STATUS_ENUM.DRAFT, label: "草稿" },
  { value: PROJECT_STATUS_ENUM.PUBLISHED, label: "已发布" },
];

export function CreateOrEditProjectSheet({
  trigger,
  project,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateOrEditProjectSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    type: PROJECT_TYPE_ENUM.FRONTEND,
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

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl || "",
        type: project.type,
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
        type: PROJECT_TYPE_ENUM.FRONTEND,
        status: PROJECT_STATUS_ENUM.DRAFT,
        githubUrl: "",
        demoUrl: "",
        blogUrl: "",
        tagIds: [],
        sortOrder: 0,
      });
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
    }));
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

  const sheetContent = (
    <SheetContent className="w-[600px] sm:w-[540px] flex flex-col h-full">
      <SheetHeader className="flex-shrink-0">
        <SheetTitle>{isEditing ? "编辑项目" : "创建项目"}</SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="grid auto-rows-min gap-6">
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
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {tags.map((tag) => {
                  const isSelected = formData.tagIds.includes(tag.id);
                  return (
                    <div
                      key={tag.id}
                      className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-muted"
                      }`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      <div
                        className={`w-3 h-3 rounded-full border-2 transition-colors ${
                          isSelected ? "bg-primary-foreground border-primary-foreground" : "border-muted-foreground"
                        }`}
                      />
                      <span className="text-sm font-medium">{tag.name}</span>
                    </div>
                  );
                })}
              </div>
              {formData.tagIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tagIds.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    return tag ? (
                      <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => toggleTag(tagId)}
                          className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 flex justify-end mb-6 border-t">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "保存中..." : isEditing ? "更新" : "创建"}
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );

  if (trigger) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        {sheetContent}
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {sheetContent}
    </Sheet>
  );
}
