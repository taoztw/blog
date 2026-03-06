"use client";

import { ImageService } from "@/lib/image-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PostWithRelations } from "@/global";
import { authClient } from "@/lib/auth/authClient";
import { categorySelectSchema, POST_STATUS_ENUM, postInsertWithTagsSchema, tagSelectSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PenLineIcon, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type CreatePostData = z.infer<typeof postInsertWithTagsSchema>;

interface Props {
  post?: PostWithRelations | null;
  onCreatePost?: (data: CreatePostData) => Promise<{ postId: string } | void>;
  onEditPost?: (id: string, data: CreatePostData) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateOrEditPostDialog({
  post,
  onCreatePost,
  onEditPost,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditMode = !!post;

  const { data: categories } = api.category.getAll.useQuery();
  const { data: tags } = api.tag.getAll.useQuery();

  const form = useForm<CreatePostData>({
    resolver: zodResolver(postInsertWithTagsSchema),
    defaultValues: isEditMode
      ? {
          ...post!,
          categoryId: post?.category?.id ?? undefined,
          imageUrl: post?.imageUrl ? ImageService.getImageUrl(post.imageUrl) : null,
          tagIds: [],
        }
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          status: POST_STATUS_ENUM.DRAFT,
          tagIds: [],
        },
  });

  useEffect(() => {
    if (isEditMode && post) {
      form.reset({
        ...post,
        categoryId: post.category?.id ?? undefined,
        tagIds: [],
      });
      setImagePreview(post.imageUrl ? ImageService.getImageUrl(post.imageUrl) : null);
    } else {
      form.reset({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        status: POST_STATUS_ENUM.DRAFT,
        tagIds: [],
      });
      setImagePreview(null);
    }
  }, [post, isEditMode, open]);

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
    const fileInput = document.getElementById("postImageUrlInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (values: CreatePostData) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        const uploadKey = json.key;
        values.imageUrl = uploadKey;
      } else {
        toast.error("图片上传失败: " + json.error);
        return;
      }
    }
    try {
      if (isEditMode && post && onEditPost) {
        await onEditPost(post.id, values);
        toast.success("文章更新成功");
      } else if (onCreatePost) {
        await onCreatePost(values);
        toast.success("文章创建成功");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    }
  };

  const onSubmitAndEdit = async (values: CreatePostData) => {
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
    try {
      if (isEditMode && post) {
        if (onEditPost) await onEditPost(post.id, values);
        setOpen(false);
        router.push(`/dashboard/posts/${post.id}/edit`);
      } else if (onCreatePost) {
        const result = await onCreatePost(values);
        setOpen(false);
        if (result?.postId) {
          router.push(`/dashboard/posts/${result.postId}/edit`);
        }
      }
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    }
  };

  const triggerSubmit = (status: string) => {
    form.setValue("status", status);
    form.handleSubmit(onSubmit)();
  };

  const triggerSubmitAndEdit = () => {
    form.setValue("status", POST_STATUS_ENUM.DRAFT);
    form.handleSubmit(onSubmitAndEdit)();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && <DialogTrigger asChild>{trigger ?? <Button>新建文章</Button>}</DialogTrigger>}
      <DialogContent className="!max-w-[95vw] lg:!max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "编辑文章" : "新建文章"}</DialogTitle>
          <DialogDescription>{isEditMode ? "修改并保存文章" : "填写信息创建新文章"}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左两列：标题摘要 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">标题</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入文章标题" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入文章路径" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>摘要</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="文章摘要" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 编辑内容按钮 */}
              {isEditMode && post && (
                <Card>
                  <CardHeader>
                    <CardTitle>文章内容</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-20"
                      onClick={() => {
                        setOpen(false);
                        router.push(`/dashboard/posts/${post.id}/edit`);
                      }}
                    >
                      <PenLineIcon className="size-5 mr-2" />
                      打开编辑器编辑内容
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 右边一列：分类、状态、封面 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>发布设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>状态</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value! ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择状态" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={POST_STATUS_ENUM.DRAFT}>草稿</SelectItem>
                            <SelectItem value={POST_STATUS_ENUM.PUBLISHED}>发布</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>分类</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择分类" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat: z.infer<typeof categorySelectSchema>) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tagIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标签</FormLabel>
                        <FormControl>
                          <MultiSelect values={field.value ?? []} onValuesChange={field.onChange}>
                            {tags?.map((tag: z.infer<typeof tagSelectSchema>) => (
                              <div key={tag.id} data-value={tag.id}>
                                {tag.name}
                              </div>
                            )) ?? []}
                          </MultiSelect>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>封面图</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormControl>
                    <div>
                      <input
                        id="postImageUrlInput"
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      {imagePreview ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="cover" className="rounded-md w-full" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 rounded-full"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label
                          htmlFor="postImageUrlInput"
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                        >
                          <UploadCloud className="h-10 w-10 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">点击上传</p>
                        </label>
                      )}
                    </div>
                  </FormControl>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                {!isEditMode && (
                  <Button type="button" onClick={triggerSubmitAndEdit}>
                    <PenLineIcon className="size-4 mr-1" />
                    保存并编辑内容
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => triggerSubmit(POST_STATUS_ENUM.DRAFT)}>
                    保存草稿
                  </Button>
                  <Button type="button" onClick={() => triggerSubmit(POST_STATUS_ENUM.PUBLISHED)}>
                    发布文章
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
