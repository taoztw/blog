"use client";

import { type Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Table,
  Image,
  FileUp,
  Minus,
  Undo,
  Redo,
  RemoveFormatting,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { uploadFile, buildFileUrl, getImageDimensions } from "./utils/upload";
import { validateFile, IMAGE_VALIDATION_OPTIONS, DOCUMENT_VALIDATION_OPTIONS, isImageFile } from "./utils/validators";
import { toast } from "sonner";
import { useCallback, useRef } from "react";

interface EditorToolbarProps {
  editor: Editor | null;
  enableFileUpload?: boolean;
}

export function EditorToolbar({ editor, enableFileUpload = true }: EditorToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  // 处理标题
  const setHeading = (level: number) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  };

  // 获取当前标题级别
  const getCurrentHeadingLevel = () => {
    for (let level = 1; level <= 6; level++) {
      if (editor.isActive("heading", { level })) {
        return level;
      }
    }
    return 0;
  };

  // 插入链接
  const insertLink = () => {
    const url = window.prompt("请输入链接地址:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // 处理图片上传
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateFile(file, IMAGE_VALIDATION_OPTIONS);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      try {
        toast.loading("上传中...", { id: "upload" });
        const result = await uploadFile(file);

        if (result.success && result.key) {
          const src = buildFileUrl(result.key);

          // 获取图片尺寸
          try {
            const dimensions = await getImageDimensions(file);
            editor
              ?.chain()
              .focus()
              .setNode("customImage", {
                src,
                alt: result.filename,
                width: dimensions.width,
                height: dimensions.height,
              })
              .run();
          } catch {
            // 如果获取尺寸失败，就不设置尺寸
            editor?.chain().focus().setNode("customImage", { src, alt: result.filename }).run();
          }

          toast.success("图片已上传", { id: "upload" });
        } else {
          toast.error(result.error ?? "上传失败", { id: "upload" });
        }
      } catch (error) {
        toast.error("上传失败", { id: "upload" });
      }

      // 重置 input
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
    [editor],
  );

  // 处理文件上传
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateFile(file, DOCUMENT_VALIDATION_OPTIONS);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      try {
        toast.loading("上传中...", { id: "upload" });
        const result = await uploadFile(file);

        if (result.success && result.key) {
          editor
            ?.chain()
            .focus()
            .setNode("fileBlock", {
              src: buildFileUrl(result.key),
              filename: result.filename ?? file.name,
              size: result.size ?? file.size,
              mimeType: result.mimeType ?? file.type,
            })
            .run();

          toast.success("文件已上传", { id: "upload" });
        } else {
          toast.error(result.error ?? "上传失败", { id: "upload" });
        }
      } catch (error) {
        toast.error("上传失败", { id: "upload" });
      }

      // 重置 input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [editor],
  );

  // 插入表格
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border-b bg-muted/30 p-2 flex flex-wrap items-center gap-1">
      {/* 标题选择 */}
      <Select value={getCurrentHeadingLevel().toString()} onValueChange={(value) => setHeading(parseInt(value))}>
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">正文</SelectItem>
          <SelectItem value="1">标题 1</SelectItem>
          <SelectItem value="2">标题 2</SelectItem>
          <SelectItem value="3">标题 3</SelectItem>
          <SelectItem value="4">标题 4</SelectItem>
          <SelectItem value="5">标题 5</SelectItem>
          <SelectItem value="6">标题 6</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* 文本格式 */}
      <Button
        size="sm"
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="粗体 (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="斜体 (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("strike") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="删除线"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("code") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="行内代码"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("link") ? "secondary" : "ghost"}
        onClick={insertLink}
        title="插入链接"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* 列表 */}
      <Button
        size="sm"
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="无序列表"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="有序列表"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("taskList") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="任务列表"
      >
        <ListTodo className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* 引用和代码块 */}
      <Button
        size="sm"
        variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="引用"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="代码块"
      >
        <Code2 className="h-4 w-4" />
      </Button>

      {/* Callout 下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant={editor.isActive("callout") ? "secondary" : "ghost"}
            title="提示框"
          >
            <AlertCircle className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setCallout({ type: "note" }).run()}
          >
            📘 Note
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setCallout({ type: "info" }).run()}
          >
            ℹ️ Info
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setCallout({ type: "tip" }).run()}
          >
            💡 Tip
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setCallout({ type: "important" }).run()}
          >
            ✅ Important
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setCallout({ type: "warning" }).run()}
          >
            ⚠️ Warning
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setCallout({ type: "caution" }).run()}
          >
            🚫 Caution
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      {/* 表格和媒体 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" title="表格操作">
            <Table className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={insertTable}>
            插入表格
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
          >
            在前面添加列
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
          >
            在后面添加列
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
          >
            删除列
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
          >
            在上方添加行
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
          >
            在下方添加行
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
          >
            删除行
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const canMerge = editor.can().mergeCells();
              const canSplit = editor.can().splitCell();
              console.log("Can merge:", canMerge, "Can split:", canSplit);
              if (canMerge) {
                editor.chain().focus().mergeCells().run();
              }
            }}
            disabled={!editor.can().mergeCells()}
          >
            合并单元格
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().splitCell().run()}
            disabled={!editor.can().splitCell()}
          >
            拆分单元格
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().mergeOrSplit().run()}
            disabled={!editor.can().mergeOrSplit()}
          >
            合并或拆分
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            disabled={!editor.can().toggleHeaderRow()}
          >
            切换表头行
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
            disabled={!editor.can().toggleHeaderColumn()}
          >
            切换表头列
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeaderCell().run()}
            disabled={!editor.can().toggleHeaderCell()}
          >
            切换表头单元格
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className="text-destructive focus:text-destructive"
          >
            删除表格
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {enableFileUpload && (
        <>
          <label title="上传图片">
            <Button size="sm" variant="ghost" asChild>
              <span>
                <Image className="h-4 w-4" />
              </span>
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          <label title="上传文件">
            <Button size="sm" variant="ghost" asChild>
              <span>
                <FileUp className="h-4 w-4" />
              </span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.zip"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="分割线"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* 撤销/重做 */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="撤销 (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="重做 (Ctrl+Shift+Z)"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="清除格式"
      >
        <RemoveFormatting className="h-4 w-4" />
      </Button>
    </div>
  );
}
