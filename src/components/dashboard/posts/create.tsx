"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { POST_STATUS_ENUM, postInsertSchema } from "@/server/db/schema";
import type { PostWithRelations } from "@/global";
import { api } from "@/trpc/react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadCloud, X, Loader2Icon, SparklesIcon } from "lucide-react";
import { MarkdownPreview } from "@/components/blog/post-preview";
import { markdownString } from "@/lib/fake-data";
import { ImageService } from "../upload/image-service";
import { useSession } from "next-auth/react";

type CreatePostData = z.infer<typeof postInsertSchema>;

interface Props {
  post?: PostWithRelations | null;
  onCreatePost?: (data: CreatePostData) => Promise<void>;
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
  const { data: session } = useSession();
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditMode = !!post;

  const { data: categories } = api.category.getAll.useQuery();

  const form = useForm<CreatePostData>({
    resolver: zodResolver(postInsertSchema),
    defaultValues: isEditMode
      ? {
          ...post!,
          categoryId: post?.category?.id ?? undefined,
          imageUrl: post?.imageUrl ? ImageService.getImageUrl(post.imageUrl) : null,
        }
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: markdownString,
          status: POST_STATUS_ENUM.DRAFT,
        },
  });

  useEffect(() => {
    if (isEditMode && post) {
      form.reset({
        ...post,
        categoryId: post.category?.id ?? undefined,
      });
      setImagePreview(post.imageUrl ? ImageService.getImageUrl(post.imageUrl) : null);
    } else {
      form.reset({
        title: "",
        slug: "",
        excerpt: "",
        content: markdownString,
        status: POST_STATUS_ENUM.DRAFT,
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
    console.log("Submitting post:", values);
    console.log("Image file:", imageFile);
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

  const triggerSubmit = (status: string) => {
    form.setValue("status", status);
    console.log("Form errors:", form.formState.errors);

    form.handleSubmit(onSubmit)();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && <DialogTrigger asChild>{trigger ?? <Button>新建文章</Button>}</DialogTrigger>}
      <DialogContent className="!max-w-[95vw] lg:!max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "编辑文章" : "新建文章"}</DialogTitle>
          <DialogDescription>{isEditMode ? "修改并保存文章" : "填写信息创建新文章"}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左两列：标题摘要内容 */}
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

              <Card>
                <CardHeader>
                  <CardTitle>内容</CardTitle>
                  <CardDescription>Markdown 格式</CardDescription>
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
                              <Textarea className="mt-2 min-h-[300px] font-mono" {...field} />
                            </FormControl>
                          </TabsContent>
                          <TabsContent value="preview">
                            <div className="max-w-full overflow-x-auto prose prose-stone dark:prose-invert mt-2 min-h-[300px] rounded-md border p-4">
                              <MarkdownPreview content={field.value} />
                            </div>
                          </TabsContent>
                        </Tabs>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
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
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => triggerSubmit(POST_STATUS_ENUM.DRAFT)}>
                  保存草稿
                </Button>
                <Button type="button" onClick={() => triggerSubmit(POST_STATUS_ENUM.PUBLISHED)}>
                  发布文章
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
