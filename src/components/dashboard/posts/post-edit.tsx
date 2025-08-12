"use client";

import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2Icon, SparklesIcon, UploadCloud, X } from "lucide-react";
import { MarkdownPreview } from "@/components/blog/post-preview";
import { markdownString } from "@/lib/fake-data";

// 1. 定义 Zod Schema 用于表单验证，与您的数据库 schema 对应
const postCreateSchema = z.object({
  title: z.string().min(3, { message: "标题至少需要3个字符。" }),
  slug: z.string().min(3, { message: "Slug 至少需要3个字符。" }),
  excerpt: z.string().min(10, { message: "摘要至少需要10个字符。" }).max(300, { message: "摘要不能超过300个字符。" }),
  content: z.string().min(1, { message: "内容不能为空。" }),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryId: z.string({ message: "请选择一个分类。" }),
  imageUrl: z.string().url({ message: "无效的图片链接。" }).optional(),
});

type PostCreateValues = z.infer<typeof postCreateSchema>;

// 模拟的 tRPC hooks，您可以替换成真实的 tRPC 调用
const useMockTrpc = () => {
  const router = useRouter();
  const createPost = {
    mutate: (data: PostCreateValues) => {
      console.log("Submitting data:", data);
      toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
        loading: "正在保存文章...",
        success: () => {
          router.push("/admin/posts");
          return "文章已成功创建！";
        },
        error: "创建失败，请重试。",
      });
    },
    isPending: false, // 模拟加载状态
  };

  const generateSlug = {
    mutate: (data: { title: string }, { onSuccess }: { onSuccess: (data: { slug: string }) => void }) => {
      toast.info("正在生成 Slug...");
      setTimeout(() => {
        const slug = data.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");
        onSuccess({ slug });
        toast.success("Slug 已生成！");
      }, 800);
    },
    isPending: false,
  };

  const generateExcerpt = {
    mutate: (data: { content: string }, { onSuccess }: { onSuccess: (data: { excerpt: string }) => void }) => {
      toast.info("正在使用 AI 生成摘要...");
      setTimeout(() => {
        const excerpt = data.content.slice(0, 150).split(" ").slice(0, -1).join(" ") + "...";
        onSuccess({ excerpt });
        toast.success("摘要已生成！");
      }, 1200);
    },
    isPending: false,
  };

  const getCategories = {
    data: [
      { id: "clgq5b1z00000u2p4h3g8a2b1", name: "技术分享" },
      { id: "clgq5b1z10001u2p4h3g8a2b2", name: "生活随笔" },
      { id: "clgq5b1z20002u2p4h3g8a2b3", name: "学习笔记" },
    ],
  };

  return { createPost, generateSlug, generateExcerpt, getCategories };
};

// 主页面组件，处理 Suspense 和 ErrorBoundary
const CreatePostPage = () => {
  return (
    <Suspense fallback={<CreatePostPageSkeleton />}>
      <ErrorBoundary fallback={<div>加载出错了，请刷新页面。</div>}>
        <CreatePostForm />
      </ErrorBoundary>
    </Suspense>
  );
};

// 加载状态的骨架屏组件
const CreatePostPageSkeleton = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-9 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 核心表单逻辑组件
const CreatePostForm = () => {
  const { createPost, generateSlug, generateExcerpt, getCategories } = useMockTrpc();
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const form = useForm<PostCreateValues>({
    resolver: zodResolver(postCreateSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "DRAFT",
    },
    mode: "onChange",
  });

  const onSubmit = (data: PostCreateValues) => {
    // 在真实场景中，您会先上传图片（如果存在），获取 URL，然后将其设置到 data.imageUrl
    if (imageFile) {
      console.log("Uploading image:", imageFile.name);
      // 假设上传后得到 URL
      data.imageUrl = "https://example.com/path/to/image.jpg";
    }
    createPost.mutate(data);
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
    const fileInput = document.getElementById("imageUrlInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleGenerateSlug = () => {
    const title = form.getValues("title");
    if (!title) {
      toast.error("请先���入标题以生成 Slug。");
      return;
    }
    generateSlug.mutate(
      { title },
      {
        onSuccess: (data) => form.setValue("slug", data.slug, { shouldValidate: true }),
      }
    );
  };

  const handleGenerateExcerpt = () => {
    const content = form.getValues("content");
    if (!content || content.length < 50) {
      toast.error("请先输入足够的内容（至少50个字符）以生成摘要。");
      return;
    }
    generateExcerpt.mutate(
      { content },
      {
        onSuccess: (data) => form.setValue("excerpt", data.excerpt, { shouldValidate: true }),
      }
    );
  };

  const triggerSubmit = (status: "DRAFT" | "PUBLISHED") => {
    form.setValue("status", status);
    form.handleSubmit(onSubmit)();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">创建新文章</h1>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => triggerSubmit("DRAFT")}
              disabled={createPost.isPending}
            >
              {createPost.isPending && form.getValues("status") === "DRAFT" ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              保存草稿
            </Button>
            <Button type="button" onClick={() => triggerSubmit("PUBLISHED")} disabled={createPost.isPending}>
              {createPost.isPending && form.getValues("status") === "PUBLISHED" ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              发布文章
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      <FormLabel className="flex items-center gap-x-2 font-semibold">
                        Slug (链接路径)
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={handleGenerateSlug}
                          disabled={generateSlug.isPending}
                        >
                          {generateSlug.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="点击右侧按钮生成或手动输入" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-x-2 font-semibold">
                        摘要
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={handleGenerateExcerpt}
                          disabled={generateExcerpt.isPending}
                        >
                          {generateExcerpt.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="输入文章摘要，用于在列表页展示" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>内容</CardTitle>
                <CardDescription>使用 Markdown 格式编写您的文章内容。</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <Tabs defaultValue="write" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="write">编辑</TabsTrigger>
                          <TabsTrigger value="preview">预览</TabsTrigger>
                        </TabsList>
                        <TabsContent value="write">
                          <FormControl>
                            <Textarea
                              placeholder="在这里开始写作..."
                              className="mt-2 min-h-[400px] font-mono"
                              {...field}
                            />
                          </FormControl>
                        </TabsContent>
                        <TabsContent value="preview">
                          <div className="prose prose-stone dark:prose-invert mt-2 min-h-[400px] rounded-md border p-4">
                            <MarkdownPreview content={markdownString} />
                          </div>
                        </TabsContent>
                      </Tabs>
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">草稿</SelectItem>
                          <SelectItem value="PUBLISHED">发布</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>分类</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCategories.data?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>头图</CardTitle>
              </CardHeader>
              <CardContent>
                <FormControl>
                  <div>
                    <input
                      id="imageUrlInput"
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Image Preview"
                          className="w-full h-auto rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 rounded-full"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">移除图片</span>
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="imageUrlInput"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                      >
                        <UploadCloud className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">点击或拖拽上传图片</p>
                      </label>
                    )}
                  </div>
                </FormControl>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CreatePostPage;
