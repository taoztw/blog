"use client";

import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadCloud, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 模拟的分类数据，实际应用中应从数据库获取
const mockCategories = [
  { id: "clgq5b1z00000u2p4h3g8a2b1", name: "技术分享" },
  { id: "clgq5b1z10001u2p4h3g8a2b2", name: "生活随笔" },
  { id: "clgq5b1z20002u2p4h3g8a2b3", name: "学习笔记" },
];

// 文章状态常量，与您的 schema 对应
const POST_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
};

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(POST_STATUS.DRAFT);
  const [categoryId, setCategoryId] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 自动根据标题生成 slug
  const generateSlug = useCallback((str: string) => {
    return str
      .toLowerCase()
      .replace(/\s+/g, "-") // 用 - 替换空格
      .replace(/[^\w-]+/g, ""); // 移除所有非单词字符
  }, []);

  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title, generateSlug]);

  // 处理图片上传和预览
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 移除已选图片
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    // 重置 file input 的值
    const fileInput = document.getElementById("imageUrl") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // 表单提交处理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 在实际应用中，您会在这里创建一个 FormData 对象来处理文件上传
    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append("status", status);
    formData.append("categoryId", categoryId);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    console.log("Form Data to be submitted:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // 此处应调用您的后端 API 或 Server Action 来创建文章
    // alert('请在浏览器控制台查看提交的数据');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">创建新文章</h1>
          <div className="flex items-center gap-4">
            <Button type="submit" variant="outline">
              保存草稿
            </Button>
            <Button type="submit" onClick={() => setStatus(POST_STATUS.PUBLISHED)}>
              发布文章
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-lg font-semibold">
                      标题
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="请输入文章标题"
                      className="mt-2 text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug" className="font-semibold">
                      Slug (链接路径)
                    </Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="会自动生成，也可手动修改"
                      className="mt-2 bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt" className="font-semibold">
                      摘要
                    </Label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="输入文章摘要，用于在列表页展示"
                      className="mt-2"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>内容</CardTitle>
                <CardDescription>使用 Markdown 格式编写您的文章内容。</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="write" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write">编辑</TabsTrigger>
                    <TabsTrigger value="preview">预览</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write">
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="在这里开始写作..."
                      className="mt-2 min-h-[400px] font-mono"
                      required
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="prose prose-stone dark:prose-invert mt-2 min-h-[400px] rounded-md border p-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "还没有内容可供预览"}</ReactMarkdown>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">状态</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="w-full mt-2">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={POST_STATUS.DRAFT}>草稿</SelectItem>
                      <SelectItem value={POST_STATUS.PUBLISHED}>发布</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">分类</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category" className="w-full mt-2">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>头图</CardTitle>
              </CardHeader>
              <CardContent>
                <Input id="imageUrl" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
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
                    htmlFor="imageUrl"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                  >
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">点击或拖拽上传图片</p>
                  </label>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
