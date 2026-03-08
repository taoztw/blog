"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImageIcon, X, Github, Link, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { TagsSelect } from "@/features/tags/tags-select";
import type { ProjectWithRelations } from "@/global";
import { ImageService } from "@/lib/image-service";
import { PROJECT_STATUS_ENUM } from "@/server/db/schema";
import { api } from "@/trpc/react";

const projectFormSchema = z.object({
  title: z.string().min(1, "请输入项目名称"),
  description: z.string().min(1, "请输入项目描述"),
  imageUrl: z.string().nullable().optional(),
  categoryId: z.string().min(1, "请选择项目类型"),
  status: z.string(),
  githubUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  blogUrl: z.string().optional(),
  sortOrder: z.number(),
  tagIds: z.array(z.string()),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface CreateOrEditProjectDialogProps {
  trigger?: React.ReactNode;
  project?: ProjectWithRelations | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function CreateOrEditProjectDialog({
  trigger,
  project,
  open: controlledOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateOrEditProjectDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditing = !!project;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const { data: tags = [] } = api.project.getAllTags.useQuery();
  const { data: categories = [] } = api.category.getAll.useQuery();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: null,
      categoryId: "",
      status: PROJECT_STATUS_ENUM.DRAFT,
      githubUrl: "",
      demoUrl: "",
      blogUrl: "",
      sortOrder: 0,
      tagIds: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      if (project) {
        form.reset({
          title: project.title,
          description: project.description,
          imageUrl: project.imageUrl ?? null,
          categoryId: project.categoryId,
          status: project.status ?? PROJECT_STATUS_ENUM.DRAFT,
          githubUrl: project.githubUrl ?? "",
          demoUrl: project.demoUrl ?? "",
          blogUrl: project.blogUrl ?? "",
          sortOrder: project.sortOrder ?? 0,
          tagIds: project.tags ? project.tags.map((pt) => pt.tag.id) : [],
        });
        setImagePreview(project.imageUrl ?? null);
      } else {
        form.reset({
          title: "",
          description: "",
          imageUrl: null,
          categoryId: "",
          status: PROJECT_STATUS_ENUM.DRAFT,
          githubUrl: "",
          demoUrl: "",
          blogUrl: "",
          sortOrder: 0,
          tagIds: [],
        });
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [open, project]);

  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    form.setValue("imageUrl", null);
    const fileInput = document.getElementById("projectImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (status: string) => {
    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();
    setIsSubmitting(true);

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (json.success) {
          values.imageUrl = ImageService.getImageUrl(json.key);
        } else {
          toast.error("图片上传失败: " + json.error);
          return;
        }
      }

      onSubmit({ ...values, status });
      handleOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const descriptionValue = form.watch("description") ?? "";

  return (
    <>
      {trigger && <div onClick={() => handleOpenChange(true)}>{trigger}</div>}

      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenChange(false)}
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="mx-auto flex h-full max-w-[960px] items-center overflow-y-auto">
            <div className="grid w-full grid-cols-1 gap-12 px-6 py-8 md:grid-cols-2">
              {/* Left: Preview */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">{isEditing ? "编辑项目" : "创建项目"}</h2>

                {/* Cover image */}
                <div>
                  <input
                    id="projectImageInput"
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {imagePreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="cover"
                        className="w-full rounded-md object-cover aspect-video"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 size-7 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="projectImageInput"
                      className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-ink-300 bg-ink-100 hover:bg-ink-200 transition-colors"
                    >
                      <ImageIcon className="size-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">添加项目封面图</p>
                    </label>
                  )}
                </div>

                {/* Title & description */}
                <Form {...form}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="输入项目名称..."
                              className="border-0 border-b border-ink-300 rounded-none px-0 text-base font-bold focus-visible:ring-0 focus-visible:border-ink-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="输入项目描述..."
                              className="resize-none border-0 border-b border-ink-300 rounded-none px-0 text-sm focus-visible:ring-0 focus-visible:border-ink-500"
                              {...field}
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">{descriptionValue.length}/500</div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>

                <p className="text-xs text-muted-foreground">注意：以上信息会在项目列表和详情页中展示。</p>
              </div>

              {/* Right: Settings */}
              <div className="space-y-8">
                <Form {...form}>
                  <div className="space-y-6">
                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">项目类型</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择项目类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem
                                  key={cat.id}
                                  value={cat.id}
                                >
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags */}
                    <FormField
                      control={form.control}
                      name="tagIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">标签</FormLabel>
                          <FormControl>
                            <TagsSelect
                              tags={tags}
                              selectedTagIds={field.value ?? []}
                              onSelectedChange={field.onChange}
                              placeholder="添加标签..."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* GitHub URL */}
                    <FormField
                      control={form.control}
                      name="githubUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                            <Github className="size-3.5" />
                            GitHub
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://github.com/..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Demo URL */}
                    <FormField
                      control={form.control}
                      name="demoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                            <Link className="size-3.5" />
                            演示链接
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://demo.example.com"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Blog URL */}
                    <FormField
                      control={form.control}
                      name="blogUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                            <BookOpen className="size-3.5" />
                            博客文章
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://blog.example.com/..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Sort Order */}
                    <FormField
                      control={form.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">排序权重</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => handleSubmit(PROJECT_STATUS_ENUM.PUBLISHED)}
                    disabled={isSubmitting || isLoading}
                    className="bg-seal hover:bg-seal/90 text-white"
                  >
                    {isSubmitting || isLoading ? <Spinner className="size-4 mr-1" /> : null}
                    发布
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => handleSubmit(PROJECT_STATUS_ENUM.DRAFT)}
                    disabled={isSubmitting || isLoading}
                    className="text-muted-foreground"
                  >
                    保存草稿
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
