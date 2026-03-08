"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImageIcon, LinkIcon, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagMultiSelect } from "@/components/tag-select";
import { api } from "@/trpc/react";
import { ImageService } from "@/lib/image-service";
import { Spinner } from "@/components/ui/spinner";

const publishFormSchema = z.object({
  slug: z.string().min(1, "请输入 Slug"),
  excerpt: z.string().max(300, "摘要不超过 300 字"),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()),
  imageUrl: z.string().nullable().optional(),
});

type PublishFormData = z.infer<typeof publishFormSchema>;

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  title: string;
  currentData: {
    slug: string;
    excerpt: string;
    categoryId: string | null;
    imageUrl: string | null;
    tagIds: string[];
  };
  onPublish: (data: PublishFormData & { status: string }) => Promise<void>;
}

export function PublishDialog({ open, onOpenChange, postId, title, currentData, onPublish }: PublishDialogProps) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    currentData.imageUrl ? ImageService.getImageUrl(currentData.imageUrl) : null
  );
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: categories } = api.category.getAll.useQuery();
  const { data: tags } = api.tag.getAll.useQuery();

  const form = useForm<PublishFormData>({
    resolver: zodResolver(publishFormSchema),
    defaultValues: {
      slug: currentData.slug,
      excerpt: currentData.excerpt,
      categoryId: currentData.categoryId ?? undefined,
      tagIds: currentData.tagIds,
      imageUrl: currentData.imageUrl,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        slug: currentData.slug,
        excerpt: currentData.excerpt,
        categoryId: currentData.categoryId ?? undefined,
        tagIds: currentData.tagIds,
        imageUrl: currentData.imageUrl,
      });
      setImagePreview(currentData.imageUrl ? ImageService.getImageUrl(currentData.imageUrl) : null);
      setImageFile(null);
    }
  }, [open, currentData]);

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
    const fileInput = document.getElementById("publishImageInput") as HTMLInputElement;
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
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (json.success) {
          values.imageUrl = json.key;
        } else {
          toast.error("图片上传失败: " + json.error);
          return;
        }
      }

      await onPublish({ ...values, status });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const excerptValue = form.watch("excerpt") ?? "";

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="absolute right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-5" />
        </Button>
      </div>

      <div className="mx-auto flex h-full max-w-[960px] items-center">
        <div className="grid w-full grid-cols-1 gap-12 px-6 md:grid-cols-2">
          {/* Left: Preview */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Story preview</h2>

            {/* Cover image */}
            <div>
              <input
                id="publishImageInput"
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
                    className="w-full rounded-md object-cover aspect-[16/9]"
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
                  htmlFor="publishImageInput"
                  className="flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-ink-300 bg-ink-100 hover:bg-ink-200 transition-colors"
                >
                  <ImageIcon className="size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">添加头图，让文章更有吸引力</p>
                </label>
              )}
            </div>

            {/* Title preview */}
            <div>
              <p className="text-base font-bold text-foreground line-clamp-2">{title || "无标题"}</p>
              <div className="mt-1 text-xs text-muted-foreground">{title.length}/100</div>
            </div>

            {/* Excerpt */}
            <Form {...form}>
              <div>
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="输入摘要..."
                          className="resize-none border-0 border-b border-ink-300 rounded-none px-0 text-sm focus-visible:ring-0 focus-visible:border-ink-500"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">{excerptValue.length}/300</div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>

            <p className="text-xs text-muted-foreground">
              注意：以上设置会影响文章在首页和搜索中的展示效果，不影响正文内容。
            </p>
          </div>

          {/* Right: Settings */}
          <div className="space-y-8">
            <Form {...form}>
              <div className="space-y-6">
                {/* Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                        <LinkIcon className="size-3.5" />
                        Slug
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="article-slug"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">分类</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem
                              key={cat.id}
                              value={cat.id}
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <TagMultiSelect
                          tags={tags ?? []}
                          value={field.value ?? []}
                          onChange={field.onChange}
                          placeholder="添加标签..."
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">最多添加 5 个标签</p>
                    </FormItem>
                  )}
                />
              </div>
            </Form>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => handleSubmit("published")}
                disabled={isSubmitting}
                className="bg-seal hover:bg-seal/90 text-white"
              >
                {isSubmitting ? <Spinner className="size-4 mr-1" /> : null}
                发布
              </Button>
              <Button
                variant="link"
                onClick={() => handleSubmit("draft")}
                disabled={isSubmitting}
                className="text-muted-foreground"
              >
                保存草稿
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
